import { auth } from "@/auth";
import { errorResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  countReceiptFiles,
  findReceiptExpenses,
  MAX_RECEIPT_FILES,
  parseReceiptExportFilters,
  planReceiptFiles,
  ReceiptExportFilters,
  sanitizeFileSegment,
} from "@/lib/receipt-export";
import { writeReceiptArchive } from "@/lib/receipt-zip";
import { getS3ObjectStream } from "@/lib/s3-utils";
import archiver from "archiver";
import { NextRequest } from "next/server";
import { Readable } from "stream";

// Large downloads stream for a while; give them the full Vercel budget.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function archiveName(filters: ReceiptExportFilters): Promise<string | null> {
  const range = `${filters.from ?? "start"}_to_${filters.to ?? "today"}`;

  if (filters.userId) {
    const user = await db.user.findUnique({
      where: { id: filters.userId },
      select: { firstName: true, lastName: true, name: true, email: true },
    });
    if (!user) return null;
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.name ||
      user.email ||
      "user";
    const prefix = filters.reportId !== undefined ? `report-${filters.reportId}_` : "";
    return `${prefix}${sanitizeFileSegment(name)}_bills_${range}.zip`;
  }

  const report = await db.report.findUnique({
    where: { id: filters.reportId },
    select: { id: true },
  });
  return report ? `report-${report.id}_bills.zip` : null;
}

/**
 * GET /api/admin/receipts/download?userId=&reportId=&from=&to=&status=
 *
 * Stream a zip of every receipt matching the filters, plus a manifest.csv
 * describing each file. Receipts missing from S3 are listed in the manifest
 * rather than failing the whole download.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const parsed = parseReceiptExportFilters(new URL(req.url));
    if ("error" in parsed) return errorResponse(parsed.error, 400);
    const { filters } = parsed;

    const filename = await archiveName(filters);
    if (!filename) {
      return errorResponse(filters.userId ? "User not found" : "Report not found", 404);
    }

    const expenses = await findReceiptExpenses(filters);
    const fileCount = countReceiptFiles(expenses);

    if (fileCount === 0) {
      return errorResponse("No bills match these filters", 404);
    }
    if (fileCount > MAX_RECEIPT_FILES) {
      return errorResponse(
        `${fileCount} bills match these filters; the limit is ${MAX_RECEIPT_FILES} per download. Narrow the date range and try again.`,
        413
      );
    }

    // Receipts are already compressed (JPEG/PNG/PDF), so don't spend CPU on it.
    const archive = archiver("zip", { store: true });
    archive.on("warning", (warning) => console.warn("Receipt zip warning:", warning));
    archive.on("error", (error) => console.error("Receipt zip error:", error));

    writeReceiptArchive(
      archive,
      planReceiptFiles(expenses),
      getS3ObjectStream,
      req.signal
    ).catch((error) => {
      console.error("Error writing receipt zip:", error);
      archive.destroy(error);
    });

    return new Response(Readable.toWeb(archive) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename.replace(
          /[^\x20-\x7e]/g,
          "_"
        )}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error downloading receipts:", error);
    return errorResponse("Failed to download bills", 500);
  }
}

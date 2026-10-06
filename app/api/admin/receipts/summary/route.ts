import { auth } from "@/auth";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  buildReceiptExpenseWhere,
  MAX_RECEIPT_FILES,
  parseReceiptExportFilters,
} from "@/lib/receipt-export";
import { NextRequest } from "next/server";

/**
 * GET /api/admin/receipts/summary?userId=&reportId=&from=&to=&status=
 *
 * How many receipts a download with these filters would contain, so the UI
 * can show the count and warn before hitting the limit.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const parsed = parseReceiptExportFilters(new URL(req.url));
    if ("error" in parsed) return errorResponse(parsed.error, 400);

    const expenses = await db.expense.findMany({
      where: buildReceiptExpenseWhere(parsed.filters),
      select: { receiptUrls: true },
    });

    const fileCount = expenses.reduce((sum, e) => sum + e.receiptUrls.length, 0);

    return jsonResponse({
      expenseCount: expenses.length,
      fileCount,
      maxFiles: MAX_RECEIPT_FILES,
    });
  } catch (error) {
    console.error("Error summarising receipts:", error);
    return errorResponse("Failed to count receipts", 500);
  }
}

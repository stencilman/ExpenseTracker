import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
import { auth } from "@/auth";
import { parsePaginationParams } from "@/lib/api-utils";
import { formatReportForUI } from "@/lib/format-utils";
import { buildReportWhere, parseReportFilters } from "@/lib/report-filters";

/**
 * GET /api/admin/reports/awaiting-approval
 * 
 * Get all reports awaiting approval for admin
 */
export async function GET(req: NextRequest) {
  try {
    // Get the session to verify admin access
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const { page, pageSize } = parsePaginationParams(url);

    // Build where clause: SUBMITTED reports only, narrowed by the admin's filters
    const where = buildReportWhere(
      { ...parseReportFilters(url), status: undefined, dateField: "submittedAt" },
      { status: ReportStatus.SUBMITTED }
    );

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get total count
    const totalCount = await db.report.count({ where });

    // Get paginated reports
    const reports = await db.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenses: {
          select: {
            id: true,
            amount: true,
            merchant: true,
            category: true,
            claimReimbursement: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc", // Order by submission date
      },
      skip,
      take: pageSize,
    });

    // Format reports for UI
    const formattedReports = reports.map((report) => formatReportForUI(report as any));

    return NextResponse.json({
      data: formattedReports,
      meta: {
        totalCount,
        page,
        pageSize,
        pageCount: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching reports awaiting approval:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

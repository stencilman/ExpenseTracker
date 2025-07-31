import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
import { auth } from "@/auth";
import { formatReportForUI } from "@/lib/format-utils";

/**
 * GET /api/admin/reports/awaiting-reimbursement
 * 
 * Get all reports awaiting reimbursement for admin
 */
export async function GET(req: NextRequest) {
  try {
    // Get the session to verify admin access
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search");

    // Build where clause for filtering
    const where: any = {
      status: ReportStatus.APPROVED // Only get APPROVED reports
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

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
        approvedAt: "desc", // Order by approval date
      },
      skip,
      take: pageSize,
    });

    // Format reports for UI
    const formattedReports = reports.map(report => formatReportForUI(report));

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
    console.error("Error fetching reports awaiting reimbursement:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

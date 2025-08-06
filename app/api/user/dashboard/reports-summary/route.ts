import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ReportStatus } from "@prisma/client";
import { formatReportForUI } from "@/lib/format-utils";

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    // Get user ID from email
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Get most recent reports (limit to 5)
    const recentReports = await db.report.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenses: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get unsubmitted reports (status PENDING)
    const unsubmittedReports = await db.report.findMany({
      where: {
        userId: user.id,
        status: ReportStatus.PENDING,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenses: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get reports awaiting approval (status SUBMITTED)
    const awaitingApprovalReports = await db.report.findMany({
      where: {
        userId: user.id,
        status: ReportStatus.SUBMITTED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenses: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get reports awaiting reimbursement (status APPROVED)
    const awaitingReimbursementReports = await db.report.findMany({
      where: {
        userId: user.id,
        status: ReportStatus.APPROVED,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        expenses: true,
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Format reports for UI
    const formattedRecentReports = recentReports.map((report) => formatReportForUI(report as any));
    const formattedUnsubmittedReports = unsubmittedReports.map((report) => formatReportForUI(report as any));
    const formattedAwaitingApprovalReports = awaitingApprovalReports.map((report) => formatReportForUI(report as any));
    const formattedAwaitingReimbursementReports = awaitingReimbursementReports.map((report) => formatReportForUI(report as any));

    // Format the response
    const reportsSummary = {
      recentReports: formattedRecentReports,
      unsubmittedReports: formattedUnsubmittedReports,
      awaitingApprovalReports: formattedAwaitingApprovalReports,
      awaitingReimbursementReports: formattedAwaitingReimbursementReports,
    };

    return jsonResponse({ data: reportsSummary });
  } catch (error) {
    console.error("Error fetching reports summary:", error);
    return errorResponse("Failed to fetch reports summary", 500);
  }
}

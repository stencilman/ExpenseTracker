import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ReportEventType, ReportStatus, UserRole } from "@prisma/client";
import { createReportHistoryEntry } from "@/data/report-history";

/**
 * POST /api/admin/reports/bulk-approve
 * Bulk approve multiple reports
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    // Parse request body
    const body = await req.json();
    const { reportIds } = body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return errorResponse("Invalid request: reportIds array is required", 400);
    }

    // Convert string IDs to integers
    const reportIdsInt = reportIds.map(id => parseInt(id));
    
    // Log for debugging
    console.log("Processing report IDs:", reportIdsInt);
    
    // First, get all the reports that need to be updated
    const reportsToUpdate = await db.report.findMany({
      where: {
        id: {
          in: reportIdsInt,
        },
        status: ReportStatus.SUBMITTED, // Only approve reports that are in SUBMITTED status
      },
    });
    
    // Get the IDs of reports that are eligible for approval
    const eligibleReportIds = reportsToUpdate.map(report => report.id);
    
    // Update all eligible reports to APPROVED status
    const updatedReports = await db.report.updateMany({
      where: {
        id: {
          in: eligibleReportIds,
        },
      },
      data: {
        status: ReportStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
    
    // For each report, update the approver relationship individually
    // This is needed because updateMany doesn't support relations
    await Promise.all(
      eligibleReportIds.map(reportId =>
        db.report.update({
          where: { id: reportId },
          data: {
            approver: { connect: { id: session.user.id } },
          },
        })
      )
    );

    // Create history entries for each report
    await Promise.all(
      reportIdsInt.map((reportId) =>
        createReportHistoryEntry({
          reportId,
          eventType: ReportEventType.APPROVED,
          details: "Report approved in bulk action",
          performedById: session.user.id,
        })
      )
    );

    return jsonResponse({
      success: true,
      count: updatedReports.count,
      message: `${updatedReports.count} reports approved successfully`,
    });
  } catch (error) {
    console.error("Error bulk approving reports:", error);
    return errorResponse("Failed to bulk approve reports", 500);
  }
}

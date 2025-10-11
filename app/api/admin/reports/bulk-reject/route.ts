import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ReportEventType, ReportStatus, UserRole } from "@prisma/client";
import { createReportHistoryEntry } from "@/data/report-history";
import { sendReportRejectedEmail, formatDateForEmail } from "@/lib/email-service";
import { sendReportStatusNotification } from "@/lib/services/notification-service";

/**
 * POST /api/admin/reports/bulk-reject
 * Bulk reject multiple reports
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
    console.log("Processing report IDs for rejection:", reportIdsInt);
    
    // First, get all the reports that need to be updated with user data for notifications
    const reportsToUpdate = await db.report.findMany({
      where: {
        id: {
          in: reportIdsInt,
        },
        status: ReportStatus.SUBMITTED, // Only reject reports that are in SUBMITTED status
      },
      include: {
        user: true // Include user data for email notifications
      }
    });
    
    // Get the IDs of reports that are eligible for rejection
    const eligibleReportIds = reportsToUpdate.map(report => report.id);
    
    // Update all reports to REJECTED status
    const updatedReports = await db.report.updateMany({
      where: {
        id: {
          in: reportIdsInt,
        },
        status: ReportStatus.SUBMITTED, // Only reject reports that are in SUBMITTED status
      },
      data: {
        status: ReportStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });

    // Create history entries for each report
    await Promise.all(
      reportIdsInt.map((reportId) =>
        createReportHistoryEntry({
          reportId,
          eventType: ReportEventType.REJECTED,
          details: "Report rejected in bulk action",
          performedById: session.user.id,
        })
      )
    );

    // Send notifications for each rejected report
    await Promise.all(
      reportsToUpdate.map(async (report) => {
        // Send in-app notification
        await sendReportStatusNotification(
          report.id,
          ReportStatus.REJECTED,
          session.user.id
        );

        // Send email notification if user has an email
        if (report.user && report.user.email) {
          const userName = `${report.user.firstName || ''} ${report.user.lastName || ''}`.trim() || 'User';
          
          await sendReportRejectedEmail(
            report.user.email,
            {
              report_id: report.id,
              report_title: report.title,
              report_amount: report.totalAmount || 0,
              user_name: userName,
              submission_date: formatDateForEmail(report.submittedAt),
              rejection_reason: "Rejected in bulk action" // Generic reason for bulk rejection
            }
          ).catch(error => {
            console.error(`Failed to send rejection email for report ${report.id}:`, error);
          });
        }
      })
    );

    return jsonResponse({
      success: true,
      count: updatedReports.count,
      message: `${updatedReports.count} reports rejected successfully`,
    });
  } catch (error) {
    console.error("Error bulk rejecting reports:", error);
    return errorResponse("Failed to bulk reject reports", 500);
  }
}

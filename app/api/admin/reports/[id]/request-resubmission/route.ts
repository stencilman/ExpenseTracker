import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  EntityType,
  NotificationType,
  ReportEventType,
  ReportStatus,
} from "@prisma/client";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { formatReportForUI } from "@/lib/format-utils";
import { createReportHistoryEntry } from "@/data/report-history";
import { createNotification } from "@/data/notifications";
import { sendReportResubmissionEmail } from "@/lib/email-service";

// Statuses an admin can send back to the submitter. Reimbursed reports are
// final since money has already been paid out.
const RESUBMITTABLE_STATUSES: ReportStatus[] = [
  ReportStatus.SUBMITTED,
  ReportStatus.APPROVED,
  ReportStatus.REJECTED,
];

/**
 * POST /api/admin/reports/[id]/request-resubmission
 *
 * Send a report back to the submitter with a note (admin only). The report
 * returns to PENDING so the submitter can edit it and submit it again.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }
    if (session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    const body = await req.json().catch(() => ({}));
    const note = typeof body?.note === "string" ? body.note.trim() : "";
    if (!note) {
      return errorResponse("A note for the submitter is required", 400);
    }

    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { id: true, status: true, title: true, userId: true },
    });
    if (!report) {
      return errorResponse("Report not found", 404);
    }
    if (!RESUBMITTABLE_STATUSES.includes(report.status)) {
      return errorResponse(
        `A ${report.status.toLowerCase()} report cannot be sent back for resubmission`,
        400
      );
    }

    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.PENDING,
        resubmissionNote: note,
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        // Keep approvedById so the reviewing admin is notified on resubmission
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        expenses: true,
        approver: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await createReportHistoryEntry({
      reportId,
      eventType: ReportEventType.RESUBMISSION_REQUESTED,
      details: `Sent back for resubmission: ${note}`,
      performedById: session.user.id,
    });

    await createNotification({
      userId: report.userId,
      title: "Report Needs Resubmission",
      message: `Your expense report "${report.title}" was sent back for changes: ${note}`,
      type: NotificationType.REPORT_RESUBMISSION_REQUESTED,
      relatedEntityId: reportId.toString(),
      relatedEntityType: EntityType.REPORT,
    }).catch((err) =>
      console.error("Error sending resubmission notification:", err)
    );

    if (updatedReport.user.email) {
      const userName =
        `${updatedReport.user.firstName || ""} ${updatedReport.user.lastName || ""}`.trim() ||
        "User";
      // totalAmount can be stale on legacy reports, so sum the expenses instead
      const amount = updatedReport.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      await sendReportResubmissionEmail(updatedReport.user.email, {
        report_id: reportId,
        report_title: updatedReport.title,
        report_amount: amount.toFixed(2),
        user_name: userName,
        resubmission_note: note,
      });
    }

    const formattedReport = formatReportForUI(updatedReport as any);
    return jsonResponse({
      data: {
        ...formattedReport,
        expenses: updatedReport.expenses,
        startDate: updatedReport.startDate,
        endDate: updatedReport.endDate,
        submittedAt: updatedReport.submittedAt,
        approvedAt: updatedReport.approvedAt,
        rejectedAt: updatedReport.rejectedAt,
        reimbursedAt: updatedReport.reimbursedAt,
        resubmissionNote: updatedReport.resubmissionNote,
        user: { email: updatedReport.user.email },
        approver: updatedReport.approver
          ? { email: updatedReport.approver.email }
          : null,
      },
    });
  } catch (error) {
    console.error("Error requesting report resubmission:", error);
    return errorResponse("Failed to send report back for resubmission", 500);
  }
}

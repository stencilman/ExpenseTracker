import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportStatus, ReportEventType } from "@prisma/client";
import { auth } from "@/auth";
import { formatReportForUI } from "@/lib/format-utils";
import { createReportHistoryEntry } from "@/data/report-history";
import { sendReportStatusNotification } from "@/lib/services/notification-service";
import { sendReportReimbursedEmail, formatDateForEmail } from "@/lib/email-service";

/**
 * POST /api/admin/reports/[id]/reimburse
 * 
 * Mark a report as reimbursed by ID (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session to verify admin access
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    // Await the params promise
    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return new NextResponse("Invalid report ID", { status: 400 });
    }

    // Check if report exists and is in APPROVED status
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return new NextResponse("Report not found", { status: 404 });
    }

    if (report.status !== ReportStatus.APPROVED) {
      return new NextResponse("Report is not in APPROVED status", { status: 400 });
    }

    // Get optional payment reference from request body
    const body = await req.json().catch(() => ({}));
    const { paymentReference } = body || {};

    // Update the report status to REIMBURSED
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.REIMBURSED,
        reimbursedAt: new Date(),
        // Use reimbursementNotes instead of paymentReference
        reimbursementNotes: paymentReference || null,
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
    });

    // Create report history entry
    await createReportHistoryEntry({
      reportId,
      performedById: session.user.id,
      eventType: ReportEventType.REIMBURSED,
      details: paymentReference
        ? `Report reimbursed with payment reference: ${paymentReference}`
        : "Report marked as reimbursed",
    });

    // Send in-app notification to the report submitter
    await sendReportStatusNotification(
      reportId,
      ReportStatus.REIMBURSED,
      session.user.id
    );
    
    // Send email notification
    if (updatedReport.user && updatedReport.user.email) {
      const userName = `${updatedReport.user.firstName || ''} ${updatedReport.user.lastName || ''}`.trim() || 'User';
      
      await sendReportReimbursedEmail(
        updatedReport.user.email,
        {
          report_id: reportId,
          report_title: updatedReport.title,
          report_amount: updatedReport.totalAmount || 0,
          user_name: userName,
          reimbursement_date: formatDateForEmail(updatedReport.reimbursedAt),
          payment_reference: paymentReference || undefined
        }
      );
    }

    // Format the report for UI
    const formattedReport = formatReportForUI(updatedReport as any);

    return NextResponse.json({ data: formattedReport });
  } catch (error) {
    console.error("Error reimbursing report:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportStatus, ReportEventType } from "@prisma/client";
import { auth } from "@/auth";
import { formatReportForUI } from "@/lib/format-utils";
import { createReportHistoryEntry } from "@/data/report-history";
import { sendReportStatusNotification } from "@/lib/services/notification-service";
import { sendReportApprovedEmail, formatDateForEmail } from "@/lib/email-service";

/**
 * POST /api/admin/reports/[id]/approve
 *
 * Approve a report by ID (admin only)
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

    // Check if report exists and is in SUBMITTED status
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

    if (report.status !== ReportStatus.SUBMITTED) {
      return new NextResponse("Report is not in SUBMITTED status", {
        status: 400,
      });
    }

    // Update the report status to APPROVED
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.APPROVED,
        approvedAt: new Date(),
        approver: { connect: { id: session.user.id } },
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
      eventType: ReportEventType.APPROVED,
      details: "Report approved by admin",
      performedById: session.user.id,
    });

    // Send in-app notification to the report submitter
    await sendReportStatusNotification(
      reportId,
      ReportStatus.APPROVED,
      session.user.id
    );
    
    // Send email notification
    if (updatedReport.user && updatedReport.user.email) {
      const userName = `${updatedReport.user.firstName || ''} ${updatedReport.user.lastName || ''}`.trim() || 'User';
      
      await sendReportApprovedEmail(
        updatedReport.user.email,
        {
          report_id: reportId,
          report_title: updatedReport.title,
          report_amount: updatedReport.totalAmount || 0,
          user_name: userName,
          submission_date: formatDateForEmail(updatedReport.submittedAt)
        }
      );
    }

    // Format the report for UI
    const formattedReport = formatReportForUI(updatedReport as any);

    return NextResponse.json({ data: formattedReport });
  } catch (error) {
    console.error("Error approving report:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportStatus, ReportEventType } from "@prisma/client";
import { auth } from "@/auth";
import { formatReportForUI } from "@/lib/format-utils";
import { createReportHistoryEntry } from "@/data/report-history";
import { sendReportStatusNotification } from "@/lib/services/notification-service";

/**
 * POST /api/admin/reports/[id]/reject
 * 
 * Reject a report by ID (admin only)
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

    // Get the rejection reason from the request body
    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      return new NextResponse("Rejection reason is required", { status: 400 });
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
      return new NextResponse("Report is not in SUBMITTED status", { status: 400 });
    }

    // Update the report status to REJECTED
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.REJECTED,
        rejectedAt: new Date(),
        approver: { connect: { id: session.user.id } },
        reimbursementNotes: reason, // Store rejection reason in reimbursementNotes field
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
      eventType: ReportEventType.REJECTED,
      details: `Report rejected: ${reason}`,
      performedById: session.user.id,
    });

    // Send notification to the report submitter
    await sendReportStatusNotification(
      reportId,
      ReportStatus.REJECTED,
      session.user.id
    );

    // Format the report for UI
    const formattedReport = formatReportForUI(updatedReport as any);

    return NextResponse.json({ data: formattedReport });
  } catch (error) {
    console.error("Error rejecting report:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

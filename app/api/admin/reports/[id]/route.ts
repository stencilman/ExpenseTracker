import { auth } from "@/auth";
import { getReportById } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { formatReportForUI } from "@/lib/format-utils";

/**
 * GET /api/admin/reports/[id]
 *
 * Get a specific report by ID for admin
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin role
    if (session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    // Ensure params is properly awaited
    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    // Get report (admin can view any report)
    const report = await getReportById(reportId);

    if (!report) {
      return errorResponse("Report not found", 404);
    }

    // Format the report for UI consumption with proper status object
    const formattedReport = formatReportForUI(report as any);
    // Include raw expenses and date fields so the admin detail page can compute totals
    const enrichedReport = {
      ...formattedReport,
      expenses: report.expenses,
      startDate: report.startDate,
      endDate: report.endDate,
      submittedAt: report.submittedAt,
      approvedAt: report.approvedAt,
      rejectedAt: report.rejectedAt,
      reimbursedAt: report.reimbursedAt,
      // Include user and approver information for email display
      user: {
        email: report.user.email,
      },
      approver: report.approver
        ? {
            email: report.approver.email,
          }
        : null,
    };
    return jsonResponse({ data: enrichedReport });
  } catch (error) {
    console.error("Error fetching report:", error);
    return errorResponse("Failed to fetch report", 500);
  }
}

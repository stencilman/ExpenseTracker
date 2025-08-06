import { auth } from "@/auth";
import { approveReport, getReportById } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * POST /api/reports/[id]/approve
 * Approve a report (admin only)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return errorResponse("Only admins can approve reports", 403);
    }

    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    // Verify the report exists
    const report = await getReportById(reportId);
    if (!report) {
      return errorResponse("Report not found", 404);
    }

    // Check if report is in pending status
    if (report.status !== "PENDING") {
      return errorResponse("Only pending reports can be approved", 400);
    }

    // Approve report
    const updatedReport = await approveReport(reportId, session.user.id);
    
    return jsonResponse(updatedReport);
  } catch (error) {
    console.error("Error approving report:", error);
    return errorResponse("Failed to approve report", 500);
  }
}

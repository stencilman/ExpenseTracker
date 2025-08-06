import { auth } from "@/auth";
import { getReportById, rejectReport } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * POST /api/reports/[id]/reject
 * Reject a report (admin only)
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
      return errorResponse("Only admins can reject reports", 403);
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
      return errorResponse("Only pending reports can be rejected", 400);
    }

    // Reject report
    const updatedReport = await rejectReport(reportId, session.user.id);
    
    return jsonResponse(updatedReport);
  } catch (error) {
    console.error("Error rejecting report:", error);
    return errorResponse("Failed to reject report", 500);
  }
}

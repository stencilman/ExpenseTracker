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
  { params }: { params: { id: string } }
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
    const { id } = params;
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
    const formattedReport = formatReportForUI(report);
    return jsonResponse({ data: formattedReport });
  } catch (error) {
    console.error("Error fetching report:", error);
    return errorResponse("Failed to fetch report", 500);
  }
}

import { auth } from "@/auth";
import { getReportById, submitReport } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { db } from "@/lib/db";

/**
 * POST /api/reports/[id]/submit
 * Submit a report for approval
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Ensure params is properly awaited
    const { id } = params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    // Verify the report exists and belongs to the user
    const report = await getReportById(reportId, session.user.id);
    if (!report) {
      return errorResponse("Report not found or you don't have permission to access it", 404);
    }
    
    // Get expenses for this report
    const expenses = await db.expense.findMany({
      where: { reportId }
    });

    // Check if report has expenses
    if (expenses.length === 0) {
      return errorResponse("Cannot submit a report with no expenses", 400);
    }

    // Submit report
    const updatedReport = await submitReport(reportId, session.user.id);
    
    // Get the full report with expenses to return
    const fullReport = await getReportById(reportId, session.user.id);
    
    return jsonResponse(fullReport);
  } catch (error) {
    console.error("Error submitting report:", error);
    return errorResponse("Failed to submit report", 500);
  }
}

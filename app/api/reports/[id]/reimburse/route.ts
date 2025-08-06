import { auth } from "@/auth";
import { getReportById, recordReimbursement } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { RecordReimbursementSchema } from "@/schemas/report";

/**
 * POST /api/reports/[id]/reimburse
 * Record reimbursement for a report (admin only)
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
      return errorResponse("Only admins can record reimbursements", 403);
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

    // Check if report is in approved status
    if (report.status !== "APPROVED") {
      return errorResponse("Only approved reports can be reimbursed", 400);
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = RecordReimbursementSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(`Invalid data: ${validationResult.error.message}`, 400);
    }

    // Record reimbursement
    const updatedReport = await recordReimbursement(reportId, validationResult.data);
    
    return jsonResponse(updatedReport);
  } catch (error) {
    console.error("Error recording reimbursement:", error);
    return errorResponse("Failed to record reimbursement", 500);
  }
}

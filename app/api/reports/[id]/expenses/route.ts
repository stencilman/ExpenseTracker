import { auth } from "@/auth";
import { addExpensesToReport, getReportById, removeExpensesFromReport } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { AddExpensesToReportSchema } from "@/schemas/report";

/**
 * POST /api/reports/[id]/expenses
 * Add expenses to a report
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

    // Ensure params is properly awaited
    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    // Verify the report exists and belongs to the user
    const report = await getReportById(reportId, session.user.id);
    if (!report) {
      return errorResponse("Report not found or you don't have permission to access it", 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = AddExpensesToReportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(`Invalid data: ${validationResult.error.message}`, 400);
    }
    
    // Add expenses to report
    const updatedReport = await addExpensesToReport(
      reportId,
      validationResult.data.expenseIds,
      session.user.id
    );
    
    return jsonResponse(updatedReport);
  } catch (error) {
    console.error("Error adding expenses to report:", error);
    return errorResponse("Failed to add expenses to report", 500);
  }
}

/**
 * DELETE /api/reports/[id]/expenses
 * Remove expenses from a report
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Ensure params is properly awaited
    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return errorResponse("Invalid report ID", 400);
    }

    // Verify the report exists and belongs to the user
    const report = await getReportById(reportId, session.user.id);
    if (!report) {
      return errorResponse("Report not found or you don't have permission to access it", 404);
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = AddExpensesToReportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(`Invalid data: ${validationResult.error.message}`, 400);
    }
    
    // Remove expenses from report
    const updatedReport = await removeExpensesFromReport(
      reportId,
      validationResult.data.expenseIds
    );
    
    return jsonResponse(updatedReport);
  } catch (error) {
    console.error("Error removing expenses from report:", error);
    return errorResponse("Failed to remove expenses from report", 500);
  }
}

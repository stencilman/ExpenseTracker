import { auth } from "@/auth";
import { deleteReport, getReportById, updateReport } from "@/data/report";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ReportUpdateSchema } from "@/schemas/report";

/**
 * GET /api/reports/[id]
 * Get a specific report by ID
 */
export async function GET(
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

    // Check if user is admin (can view any report)
    const isAdmin = session.user.role === "ADMIN";
    
    // Get report (if admin, don't filter by userId)
    const report = await getReportById(
      reportId, 
      isAdmin ? undefined : session.user.id
    );

    if (!report) {
      return errorResponse("Report not found", 404);
    }

    return jsonResponse(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return errorResponse("Failed to fetch report", 500);
  }
}

/**
 * PATCH /api/reports/[id]
 * Update a specific report
 */
export async function PATCH(
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = ReportUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(`Invalid report data: ${validationResult.error.message}`, 400);
    }

    // Check if user is admin (can update any report)
    const isAdmin = session.user.role === "ADMIN";
    
    // Update report (if admin, don't filter by userId)
    const report = await updateReport(
      reportId, 
      validationResult.data as any, // Cast to any to resolve TypeScript error with status field
      isAdmin ? undefined : session.user.id
    );

    if (!report) {
      return errorResponse("Report not found or you don't have permission to update it", 404);
    }

    return jsonResponse(report);
  } catch (error) {
    console.error("Error updating report:", error);
    return errorResponse("Failed to update report", 500);
  }
}

/**
 * DELETE /api/reports/[id]
 * Delete a specific report
 */
export async function DELETE(
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

    // Check if user is admin (can delete any report)
    const isAdmin = session.user.role === "ADMIN";
    
    // Delete report (if admin, don't filter by userId)
    await deleteReport(
      reportId, 
      isAdmin ? undefined : session.user.id
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting report:", error);
    return errorResponse("Failed to delete report", 500);
  }
}

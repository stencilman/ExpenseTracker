import { auth } from "@/auth";
import { getReports } from "@/data/report";
import { errorResponse, jsonResponse, parsePaginationParams } from "@/lib/api-utils";
import { formatReportForUI } from "@/lib/format-utils";
import { parseReportFilters, REPORT_LIST_SCOPES } from "@/lib/report-filters";
import { ReportFilterSchema } from "@/schemas/report";
import { ReportStatus } from "@prisma/client";

/**
 * GET /api/admin/reports
 * 
 * Get all reports for admin with optional filtering
 */
export async function GET(req: Request) {
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

    // Parse query parameters
    const url = new URL(req.url);
    const { page, pageSize } = parsePaginationParams(url);

    // Validate filters
    const filterResult = ReportFilterSchema.safeParse({
      ...parseReportFilters(url),
      page,
      pageSize,
    });
    if (!filterResult.success) {
      return errorResponse(`Invalid filter parameters: ${filterResult.error.message}`, 400);
    }

    // Get reports with filters - pass undefined for userId to get all reports (admin access).
    // Drafts belong to their owner only, so they never show up in the admin list.
    const scope = REPORT_LIST_SCOPES["all"];
    const reports = await getReports(undefined as any, {
      ...(filterResult.data as any),
      // Admins think of these reports by when they were submitted, not created
      dateField: filterResult.data.dateField ?? scope.dateField,
      baseWhere: scope.baseWhere,
    });

    // Format each report for UI consumption with proper status objects
    const formattedReports = {
      data: reports.data.map((report) => formatReportForUI(report as any)),
      meta: reports.meta
    };
    
    // Return the formatted reports with proper structure
    return jsonResponse(formattedReports);
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    return errorResponse("Failed to fetch reports", 500);
  }
}

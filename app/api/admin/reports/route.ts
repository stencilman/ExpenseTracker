import { auth } from "@/auth";
import { getReports } from "@/data/report";
import { errorResponse, jsonResponse, parsePaginationParams, parseQueryParams } from "@/lib/api-utils";
import { formatReportForUI } from "@/lib/format-utils";
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
    const queryParams = parseQueryParams(url);

    // Parse and validate filters
    const filterParams: any = {
      page,
      pageSize,
    };

    if (queryParams.startDate) filterParams.startDate = new Date(queryParams.startDate);
    if (queryParams.endDate) filterParams.endDate = new Date(queryParams.endDate);
    if (queryParams.search) filterParams.search = queryParams.search;

    if (queryParams.status && Object.values(ReportStatus).includes(queryParams.status as ReportStatus)) {
      filterParams.status = queryParams.status as ReportStatus;
    }

    // Validate filters
    const filterResult = ReportFilterSchema.safeParse(filterParams);
    if (!filterResult.success) {
      return errorResponse(`Invalid filter parameters: ${filterResult.error.message}`, 400);
    }

    // Get reports with filters - pass undefined for userId to get all reports (admin access)
    // We need to modify the where clause in the data layer to handle this case
    const reports = await getReports(undefined as any, filterResult.data as any);
    
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

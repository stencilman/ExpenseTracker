import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createReport, getReports } from "@/data/report";
import { errorResponse, jsonResponse, parsePaginationParams, parseQueryParams } from "@/lib/api-utils";
import { ReportCreateSchema, ReportFilterSchema } from "@/schemas/report";
import { ReportStatus } from "@prisma/client";

/**
 * GET /api/reports
 * Get all reports for the authenticated user with optional filtering
 */
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
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

    // Ensure we have the correct user ID (some auth providers may not include id)
    let userId: string | undefined = session.user.id ?? undefined;
    if (!userId) {
      // Fallback: look up user by email
      const userRecord = await db.user.findUnique({
        where: { email: session.user.email ?? "" },
        select: { id: true },
      });
      userId = userRecord?.id;
    }

    // Get reports with filters
    if (!userId) {
      return errorResponse("User not found", 404);
    }

    const reports = await getReports(userId, filterResult.data as any);

    return jsonResponse(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return errorResponse("Failed to fetch reports", 500);
  }
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = ReportCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(`Invalid report data: ${validationResult.error.message}`, 400);
    }

    // Create report
    const report = await createReport(validationResult.data, session.user.id);

    return jsonResponse(report, 201);
  } catch (error) {
    console.error("Error creating report:", error);
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return errorResponse(`Failed to create report: ${error.message}`, 500);
    }
    return errorResponse("Failed to create report", 500);
  }
}

import { auth } from "@/auth";
import { createExpense, getExpenses } from "@/data/expense";
import { errorResponse, jsonResponse, parsePaginationParams, parseQueryParams } from "@/lib/api-utils";
import { ExpenseCreateSchema, ExpenseFilterSchema } from "@/schemas/expense";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

/**
 * GET /api/expenses
 * Get all expenses for the authenticated user with optional filtering
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
    const filterParams: any = {};
    
    if (queryParams.startDate) filterParams.startDate = queryParams.startDate;
    if (queryParams.endDate) filterParams.endDate = queryParams.endDate;
    if (queryParams.search) filterParams.search = queryParams.search;
    
    if (queryParams.minAmount) {
      const minAmount = parseFloat(queryParams.minAmount);
      if (!isNaN(minAmount)) filterParams.minAmount = minAmount;
    }
    
    if (queryParams.maxAmount) {
      const maxAmount = parseFloat(queryParams.maxAmount);
      if (!isNaN(maxAmount)) filterParams.maxAmount = maxAmount;
    }
    
    if (queryParams.category && Object.values(ExpenseCategory).includes(queryParams.category as ExpenseCategory)) {
      filterParams.category = queryParams.category as ExpenseCategory;
    }
    
    if (queryParams.status && Object.values(ExpenseStatus).includes(queryParams.status as ExpenseStatus)) {
      filterParams.status = queryParams.status as ExpenseStatus;
    }
    
    // Validate filters
    const filterResult = ExpenseFilterSchema.safeParse(filterParams);
    if (!filterResult.success) {
      console.error("Filter validation error:", filterResult.error);
      // Extract error messages in a non-deprecated way
      const errorMessages = filterResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return errorResponse(`Invalid filter parameters: ${errorMessages}`, 400);
    }
    
    // Get expenses with pagination
    const result = await getExpenses(
      session.user.id,
      filterResult.data,
      page,
      pageSize
    );
    
    return jsonResponse(result);
  } catch (error: any) {
    console.error("Error in GET /api/expenses:", error);
    return errorResponse(error.message || "Failed to get expenses", 500);
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized: No valid user session found", 401);
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Received expense data:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return errorResponse("Invalid JSON in request body", 400);
    }
    
    // Validate request body against schema
    const validation = ExpenseCreateSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Error validating expense creation:", validation.error);
      // Extract error messages in a non-deprecated way
      const errorMessages = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return errorResponse(
        `Invalid expense data: ${errorMessages}`,
        400
      );
    }
    
    // Log validated data
    console.log("Validated expense data:", JSON.stringify(validation.data));
    
    // Check required fields based on Prisma schema
    const requiredFields = ['amount', 'merchant', 'date', 'category'];
    const missingFields = requiredFields.filter(field => !validation.data[field as keyof typeof validation.data]);
    
    if (missingFields.length > 0) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }
    
    // Create expense
    try {
      const expense = await createExpense(validation.data, session.user.id);
      return jsonResponse(expense, 201);
    } catch (dbError: any) {
      console.error("Database error creating expense:", dbError);
      return errorResponse(
        `Database error: ${dbError.message || 'Unknown database error'}`,
        500
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/expenses:", error);
    return errorResponse(
      `Server error: ${error.message || "Unknown error"} (Check server logs for details)`,
      500
    );
  }
}

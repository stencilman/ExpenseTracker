import { auth } from "@/auth";
import { deleteExpense, getExpenseById, updateExpense } from "@/data/expense";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ExpenseUpdateSchema } from "@/schemas/expense";

/**
 * GET /api/expenses/[id]
 * Get a single expense by ID
 */
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse expense ID
    const expenseId = parseInt(context.params.id);
    if (isNaN(expenseId)) {
      return errorResponse("Invalid expense ID", 400);
    }

    // Get expense
    const expense = await getExpenseById(expenseId, session.user.id);
    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    return jsonResponse(expense);
  } catch (error: any) {
    console.error(`Error in GET /api/expenses/${context.params.id}:`, error);
    return errorResponse(error.message || "Failed to get expense", 500);
  }
}

/**
 * PUT /api/expenses/[id]
 * Update an existing expense
 */
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse expense ID
    const expenseId = parseInt(context.params.id);
    if (isNaN(expenseId)) {
      return errorResponse("Invalid expense ID", 400);
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = ExpenseUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.error(`Error validating expense update for ID ${context.params.id}:`, validation.error);
      // Extract error messages in a non-deprecated way
      const errorMessages = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return errorResponse(
        `Invalid expense data: ${errorMessages}`,
        400
      );
    }

    // Update expense
    const expense = await updateExpense(
      expenseId,
      validation.data,
      session.user.id
    );

    return jsonResponse(expense);
  } catch (error: any) {
    console.error(`Error in PUT /api/expenses/${context.params.id}:`, error);
    return errorResponse(error.message || "Failed to update expense", 500);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse expense ID
    const expenseId = parseInt(context.params.id);
    if (isNaN(expenseId)) {
      return errorResponse("Invalid expense ID", 400);
    }

    // Delete expense
    await deleteExpense(expenseId, session.user.id);

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/expenses/${context.params.id}:`, error);
    return errorResponse(error.message || "Failed to delete expense", 500);
  }
}

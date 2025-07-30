import { auth } from "@/auth";
import { deleteExpense } from "@/data/expense";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { z } from "zod";

// Schema for bulk delete request
const BulkDeleteSchema = z.object({
  expenseIds: z.array(z.union([z.string(), z.number()])),
});

/**
 * POST /api/expenses/bulk-delete
 * Delete multiple expenses at once
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const userId = session.user.id;

    // Parse request body
    const body = await req.json();
    const validationResult = BulkDeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        `Invalid request: ${validationResult.error.message}`,
        400
      );
    }

    const { expenseIds } = validationResult.data;

    // Process each expense deletion
    const results = await Promise.allSettled(
      expenseIds.map(async (expenseId) => {
        try {
          // Delete the expense
          await deleteExpense(Number(expenseId), userId);
          return { id: expenseId, success: true };
        } catch (error) {
          console.error(`Failed to delete expense ${expenseId}:`, error);
          return { id: expenseId, success: false, error: String(error) };
        }
      })
    );

    // Count successes and failures
    const successResults = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    );
    const failureResults = results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
    );

    return jsonResponse({
      message: "Bulk delete operation completed",
      successCount: successResults.length,
      failureCount: failureResults.length,
      results: results.map((result) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return { success: false, error: String(result.reason) };
        }
      }),
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return errorResponse("Server error", 500);
  }
}

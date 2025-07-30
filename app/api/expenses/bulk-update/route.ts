import { auth } from "@/auth";
import { updateExpense } from "@/data/expense";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { z } from "zod";

// Schema for bulk update request
const BulkUpdateSchema = z.object({
  expenseIds: z.array(z.union([z.string(), z.number()])),
  reportId: z.number().int().positive(),
});

/**
 * POST /api/expenses/bulk-update
 * Update multiple expenses at once (currently only supports adding to report)
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }
    
    // Store user ID for later use
    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const validation = BulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.error("Error validating bulk update request:", validation.error);
      const errorMessages = validation.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return errorResponse(`Invalid data: ${errorMessages}`, 400);
    }

    const { expenseIds, reportId } = validation.data;

    // Process each expense
    const results = await Promise.all(
      expenseIds.map(async (id) => {
        try {
          // Convert string IDs to numbers if needed
          const expenseId = typeof id === "string" ? parseInt(id, 10) : id;
          
          if (isNaN(expenseId)) {
            return { id, success: false, error: "Invalid expense ID" };
          }

          // Update the expense with the new report ID
          const updatedExpense = await updateExpense(
            expenseId,
            { reportId },
            userId
          );

          return { id: expenseId, success: true, expense: updatedExpense };
        } catch (error: any) {
          console.error(`Error updating expense ${id}:`, error);
          return { 
            id, 
            success: false, 
            error: error.message ? String(error.message) : "Failed to update expense" 
          };
        }
      })
    );

    // Check if any updates failed
    const failures = results.filter((result) => !result.success);
    if (failures.length > 0) {
      console.warn(`${failures.length} out of ${expenseIds.length} expense updates failed`);
    }

    return jsonResponse({
      totalCount: expenseIds.length,
      successCount: expenseIds.length - failures.length,
      failureCount: failures.length,
      results,
    });
  } catch (error: any) {
    console.error("Error in POST /api/expenses/bulk-update:", error);
    return errorResponse(error.message || "Failed to process bulk update", 500);
  }
}

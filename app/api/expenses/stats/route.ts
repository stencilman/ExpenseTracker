import { auth } from "@/auth";
import { getExpenseStats } from "@/data/expense";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * GET /api/expenses/stats
 * Get expense statistics for the authenticated user
 */
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get expense statistics
    const stats = await getExpenseStats(session.user.id);
    
    return jsonResponse(stats);
  } catch (error: any) {
    console.error("Error in GET /api/expenses/stats:", error);
    return errorResponse(error.message || "Failed to get expense statistics", 500);
  }
}

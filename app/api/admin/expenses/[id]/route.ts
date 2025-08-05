import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * GET /api/admin/expenses/[id]
 *
 * Allows an admin to fetch any expense by ID (no user ownership restriction)
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate requester
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Authorise – admin only
    if (session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    // Validate ID
    const expenseId = parseInt(params.id);
    if (isNaN(expenseId)) {
      return errorResponse("Invalid expense ID", 400);
    }

    // Fetch expense (include report title so UI can show report name if needed)
    const expense = await db.expense.findUnique({
      where: { id: expenseId },
      include: {
        report: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    // Append reportName for UI parity with user API
    const expenseWithReportName: any = {
      ...expense,
      reportName: expense.report?.title || null,
    };
    delete expenseWithReportName.report;

    return jsonResponse({ data: expenseWithReportName });
  } catch (error: any) {
    console.error(`Error fetching admin expense ${params.id}:`, error);
    return errorResponse(error.message || "Failed to fetch expense", 500);
  }
}

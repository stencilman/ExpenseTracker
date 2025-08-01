import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * GET /api/admin/expenses/[id]/history
 * Returns full history for any expense. Admin-only.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Access dynamic route params BEFORE any awaits (Next.js requirement)
  const expenseId = Number(params.id);
  if (Number.isNaN(expenseId)) {
    return errorResponse("Invalid expense ID", 400);
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    if (session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    

    // Fetch expense w/out ownership restriction
    const expense = await db.expense.findUnique({ where: { id: expenseId } });
    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    const history = await db.expenseHistory.findMany({
      where: { expenseId },
      include: {
        performedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        report: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    const formattedHistory = history.map((evt) => ({
      id: evt.id,
      eventType: evt.eventType,
      eventDate: evt.eventDate,
      details: evt.details,
      performedBy: evt.performedBy
        ? {
            id: evt.performedBy.id,
            name: `${evt.performedBy.firstName} ${evt.performedBy.lastName}`,
            email: evt.performedBy.email,
            role: evt.performedBy.role,
          }
        : null,
      report: evt.report
        ? { id: evt.report.id, title: evt.report.title, status: evt.report.status }
        : null,
    }));

    return jsonResponse({
      expense: {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        status: expense.status,
      },
      history: formattedHistory,
    });
  } catch (err: any) {
    console.error(`Error fetching admin expense history ${expenseId}:`, err);
    return errorResponse(err.message || "Failed to fetch expense history", 500);
  }
}

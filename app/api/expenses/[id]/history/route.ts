import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";

/**
 * GET /api/expenses/[id]/history
 * Get the history of events for a specific expense
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Access dynamic route params BEFORE any awaits (Next.js requirement)
  const expenseId = Number(params.id);
  if (Number.isNaN(expenseId)) {
    return errorResponse("Invalid expense ID", 400);
  }

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    

    // Verify the expense exists and belongs to the user
    const expense = await db.expense.findUnique({
      where: {
        id: expenseId,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    // Get the expense history with related data
    const history = await db.expenseHistory.findMany({
      where: {
        expenseId: expenseId,
      },
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
      orderBy: {
        eventDate: "desc",
      }
    });

    // Format the response
    const formattedHistory = history.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate,
      details: event.details,
      performedBy: event.performedBy
        ? {
            id: event.performedBy.id,
            name: `${event.performedBy.firstName} ${event.performedBy.lastName}`,
            email: event.performedBy.email,
            role: event.performedBy.role,
          }
        : null,
      report: event.report
        ? {
            id: event.report.id,
            title: event.report.title,
            status: event.report.status,
          }
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
  } catch (error) {
    console.error("Error fetching expense history:", error);
    return errorResponse("Failed to fetch expense history", 500);
  }
}

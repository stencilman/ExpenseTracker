import { auth } from "@/auth";
import { db } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ExpenseStatus, ExpenseCategory, ReportStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return errorResponse("Unauthorized", 401);
    }

    // Get user ID from email
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Count unreported expenses (expenses with status UNREPORTED that are not in a report)
    const unreportedExpensesCount = await db.expense.count({
      where: {
        userId: user.id,
        status: ExpenseStatus.UNREPORTED,
        reportId: null,
      },
    });

    // Calculate total amount of unreported expenses
    const unreportedExpensesAmount = await db.expense.aggregate({
      where: {
        userId: user.id,
        status: ExpenseStatus.UNREPORTED,
        reportId: null,
      },
      _sum: {
        amount: true,
      },
    });

    // Count unsubmitted reports (reports with status PENDING)
    const unsubmittedReportsCount = await db.report.count({
      where: {
        userId: user.id,
        status: ReportStatus.PENDING,
      },
    });

    // Format the response
    const pendingTasks = {
      unreportedExpensesCount,
      unreportedExpensesAmount: unreportedExpensesAmount._sum.amount ?? 0,
      unsubmittedReportsCount,
    };

    return jsonResponse({ data: pendingTasks });
  } catch (error) {
    console.error("Error fetching pending tasks:", error);
    return errorResponse("Failed to fetch pending tasks", 500);
  }
}

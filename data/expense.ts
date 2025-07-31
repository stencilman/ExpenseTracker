import { db } from "@/lib/db";
import { ExpenseCreate, ExpenseFilter, ExpenseUpdate } from "@/schemas/expense";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

/**
 * Get all expenses for a user with optional filtering
 */
export async function getExpenses(
  userId: string,
  filter?: ExpenseFilter,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    // Build filter conditions
    const where: Prisma.ExpenseWhereInput = { userId };

    if (filter) {
      // Date range filter
      if (filter.startDate || filter.endDate) {
        where.date = {};
        if (filter.startDate) {
          where.date.gte = new Date(filter.startDate);
        }
        if (filter.endDate) {
          where.date.lte = new Date(filter.endDate);
        }
      }

      // Category filter
      if (filter.category) {
        where.category = filter.category;
      }

      // Status filter
      if (filter.status) {
        where.status = filter.status;
      }

      // Amount range filter
      if (filter.minAmount || filter.maxAmount) {
        where.amount = {};
        if (filter.minAmount) {
          where.amount.gte = filter.minAmount;
        }
        if (filter.maxAmount) {
          where.amount.lte = filter.maxAmount;
        }
      }

      // Search in description
      if (filter.search) {
        where.description = {
          contains: filter.search,
          mode: "insensitive",
        };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get expenses with pagination
    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
      include: {
        report: {
          select: {
            title: true
          }
        }
      }
    });

    // Add reportName to each expense
    const expensesWithReportName = expenses.map(expense => ({
      ...expense,
      reportName: expense.report?.title || null
    }));

    // Get total count for pagination
    const total = await db.expense.count({ where });

    return {
      expenses: expensesWithReportName,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to get expenses:", error);
    throw new Error("Failed to get expenses");
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: number, userId: string) {
  try {
    const expense = await db.expense.findUnique({
      where: { id, userId },
    });
    return expense;
  } catch (error) {
    console.error(`Failed to get expense with ID ${id}:`, error);
    throw new Error(`Failed to get expense with ID ${id}`);
  }
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseCreate, userId: string) {
  try {
    console.log("Creating expense with data:", JSON.stringify({
      ...data,
      date: new Date(data.date),
      userId,
    }));

    // Create expense with transaction to ensure both expense and history are created atomically
    const expense = await db.$transaction(async (tx) => {
      // Prepare expense data
      const expenseData: any = {
        ...data,
        date: new Date(data.date),
        userId,
      };
      
      // If reportId is provided, set status to REPORTED
      if (data.reportId) {
        console.log(`Setting new expense status to REPORTED as it's being created with report ${data.reportId}`);
        expenseData.status = "REPORTED";
      }

      // Create the expense
      const newExpense = await tx.expense.create({
        data: expenseData,
      });

      // Add CREATED event to expense history
      await tx.expenseHistory.create({
        data: {
          eventType: 'CREATED',
          expenseId: newExpense.id,
          details: 'Expense created',
          performedById: userId,
        },
      });
      
      // If reportId is provided, add ADDED_TO_REPORT event to expense history
      if (data.reportId) {
        await tx.expenseHistory.create({
          data: {
            eventType: 'ADDED_TO_REPORT',
            expenseId: newExpense.id,
            details: `Added to report #${data.reportId}`,
            reportId: data.reportId,
            performedById: userId,
          },
        });
      }

      return newExpense;
    });
    return expense;
  } catch (error: any) {
    // Log detailed error information
    console.error("Failed to create expense:", error);

    // Check for specific Prisma errors
    if (error.code) {
      console.error(`Prisma error code: ${error.code}`);

      // Handle common Prisma error codes
      if (error.code === 'P2002') {
        throw new Error(`Unique constraint violation on field(s): ${error.meta?.target}`);
      } else if (error.code === 'P2003') {
        throw new Error(`Foreign key constraint violation on field: ${error.meta?.field_name}`);
      } else if (error.code === 'P2025') {
        throw new Error(`Record not found: ${error.meta?.cause}`);
      } else {
        throw new Error(`Database error (${error.code}): ${error.message}`);
      }
    }

    // If it's not a recognized Prisma error, throw a generic error with the message
    throw new Error(`Failed to create expense: ${error.message || 'Unknown database error'}`);
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: number, data: ExpenseUpdate, userId: string) {
  try {
    // Check if expense exists and belongs to user
    const existingExpense = await db.expense.findUnique({
      where: { id, userId },
    });

    if (!existingExpense) {
      throw new Error("Expense not found");
    }

    // Process date if provided
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // If reportId is provided, update status to REPORTED
    if (updateData.reportId !== undefined) {
      // If associating with a report, set status to REPORTED
      if (updateData.reportId) {
        console.log(`Setting expense ${id} status to REPORTED as it's being associated with report ${updateData.reportId}`);
        updateData.status = "REPORTED";
      }
      // If removing from a report (reportId is null), set status back to UNREPORTED
      else if (existingExpense.reportId) {
        console.log(`Setting expense ${id} status to UNREPORTED as it's being removed from a report`);
        updateData.status = "UNREPORTED";
      }
    }

      // Use a transaction to update the expense and create history events
    return await db.$transaction(async (tx) => {
      // Update the expense
      const expense = await tx.expense.update({
        where: { id },
        data: updateData,
      });
      
      // Create history event for adding to report
      if (updateData.reportId && (!existingExpense.reportId || existingExpense.reportId !== updateData.reportId)) {
        await tx.expenseHistory.create({
          data: {
            eventType: 'ADDED_TO_REPORT',
            expenseId: expense.id,
            details: `Added to report #${updateData.reportId}`,
            reportId: updateData.reportId,
            performedById: userId,
          },
        });
      }
      
      // Create history event for removing from report
      if (existingExpense.reportId && updateData.reportId === null) {
        await tx.expenseHistory.create({
          data: {
            eventType: 'ADDED_TO_REPORT', // Using existing event type
            expenseId: expense.id,
            details: `Removed from report #${existingExpense.reportId}`,
            reportId: existingExpense.reportId,
            performedById: userId,
          },
        });
      }
      
      return expense;
    });
  } catch (error) {
    console.error(`Failed to update expense with ID ${id}:`, error);
    throw new Error(`Failed to update expense with ID ${id}`);
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number, userId: string) {
  try {
    // Check if expense exists and belongs to user
    const existingExpense = await db.expense.findUnique({
      where: { id, userId },
    });

    if (!existingExpense) {
      throw new Error("Expense not found");
    }

    await db.expense.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete expense with ID ${id}:`, error);
    throw new Error(`Failed to delete expense with ID ${id}`);
  }
}

/**
 * Get expense statistics
 */
export async function getExpenseStats(userId: string) {
  try {
    // Get total expenses
    const totalCount = await db.expense.count({
      where: { userId },
    });

    // Get sum of all expenses
    const totalAmountResult = await db.expense.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });
    const totalAmount = totalAmountResult._sum.amount || 0;

    // Get expenses by category
    const expensesByCategory = await db.expense.groupBy({
      by: ["category"],
      where: { userId },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get expenses by status
    const expensesByStatus = await db.expense.groupBy({
      by: ["status"],
      where: { userId },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalCount,
      totalAmount,
      expensesByCategory,
      expensesByStatus,
    };
  } catch (error) {
    console.error("Failed to get expense statistics:", error);
    throw new Error("Failed to get expense statistics");
  }
}

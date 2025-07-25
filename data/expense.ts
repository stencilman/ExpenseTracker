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
    });

    // Get total count for pagination
    const total = await db.expense.count({ where });

    return {
      expenses,
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
    
    const expense = await db.expense.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId,
      },
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

    const expense = await db.expense.update({
      where: { id },
      data: updateData,
    });
    return expense;
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

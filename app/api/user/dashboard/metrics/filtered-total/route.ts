import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExpenseCategory, ReportStatus } from "@prisma/client";
import { auth } from "@/auth";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

// Helper functions to calculate date ranges
function getDateRangeForToday(): DateRange {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    startDate: startOfDay,
    endDate: now
  };
}

function getDateRangeForThisWeek(): DateRange {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as first day of week
  startOfWeek.setHours(0, 0, 0, 0);
  return {
    startDate: startOfWeek,
    endDate: now
  };
}

function getDateRangeForThisMonth(): DateRange {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: startOfMonth,
    endDate: now
  };
}

function getDateRangeForThisQuarter(): DateRange {
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
  return {
    startDate: startOfQuarter,
    endDate: now
  };
}

function getDateRangeForThisYear(): DateRange {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: startOfYear,
    endDate: now
  };
}

function getDateRangeForAllTime(): DateRange {
  const now = new Date();
  const startOfTime = new Date(2000, 0, 1); // Arbitrary past date
  return {
    startDate: startOfTime,
    endDate: now
  };
}

// Function to get date range based on timeframe
function getDateRangeForTimeframe(timeframe: string): DateRange {
  switch (timeframe) {
    case "today":
      return getDateRangeForToday();
    case "thisWeek":
      return getDateRangeForThisWeek();
    case "thisMonth":
      return getDateRangeForThisMonth();
    case "thisQuarter":
      return getDateRangeForThisQuarter();
    case "thisYear":
      return getDateRangeForThisYear();
    case "allTime":
      return getDateRangeForAllTime();
    default:
      return getDateRangeForThisMonth(); // Default to this month
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get parameters from query
    const url = new URL(request.url);
    const timeframe = url.searchParams.get("timeframe") || "thisMonth";
    const category = url.searchParams.get("category");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    
    let dateRange: DateRange;
    
    // If custom date range is provided, use it
    if (timeframe === "custom" && startDateParam && endDateParam) {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam)
      };
    } else {
      // Otherwise use the timeframe
      dateRange = getDateRangeForTimeframe(timeframe);
    }
    
    // Get total reimbursed amount for the user
    const reimbursedReports = await prisma.report.findMany({
      where: {
        userId: userId,
        status: ReportStatus.REIMBURSED,
        reimbursedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        expenses: true
      }
    });
    
    // Get total pending amount for the user (approved but not reimbursed)
    const pendingReports = await prisma.report.findMany({
      where: {
        userId: userId,
        status: ReportStatus.APPROVED,
        approvedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        expenses: true
      }
    });
    
    // Define expense type to fix TypeScript error
    interface ExpenseType {
      id: number;
      amount: number;
      category: string;
      [key: string]: any; // For other properties we might need
    }
    
    // Filter expenses by category if needed
    const filterExpensesByCategory = (reports: any[]) => {
      if (!category) return reports;
      
      return reports.map(report => ({
        ...report,
        expenses: report.expenses.filter((expense: ExpenseType) => {
          const expenseCat = expense.category as string;
          return expenseCat === category;
        })
      }));
    };
    
    const filteredReimbursedReports = filterExpensesByCategory(reimbursedReports);
    const filteredPendingReports = filterExpensesByCategory(pendingReports);
    
    // Calculate totals
    const calculateTotal = (reports: any[]) => {
      return reports.reduce(
        (total: number, report: any) => {
          const reportTotal = report.expenses.reduce(
            (sum: number, expense: any) => sum + expense.amount,
            0
          );
          return total + reportTotal;
        },
        0
      );
    };
    
    const totalReimbursed = calculateTotal(filteredReimbursedReports);
    const totalPending = calculateTotal(filteredPendingReports);
    
    return NextResponse.json({
      totalReimbursed,
      totalPending,
      timeframe,
      category: category || null,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  } catch (error) {
    console.error("Error fetching user filtered metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user filtered metrics" },
      { status: 500 }
    );
  }
}

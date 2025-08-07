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

// Function to get total reimbursed amount within a date range and optional category
async function getTotalReimbursedAmount(dateRange: DateRange, category?: string): Promise<number> {
  // Get reimbursed reports within the date range
  const reimbursedReports = await prisma.report.findMany({
    where: {
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
  
  // Filter expenses by category if needed
  const filteredReports = reimbursedReports.map(report => {
    // If no category is specified, include all expenses
    if (!category) {
      return {
        ...report,
        expenses: report.expenses
      };
    }
    
    // Filter expenses by category - ensure exact match with enum values
    const filteredExpenses = report.expenses.filter(expense => {
      // Ensure we're comparing with the exact enum value
      const expenseCat = expense.category as string;
      return expenseCat === category;
    });
    
    return {
      ...report,
      expenses: filteredExpenses
    };
  });

  // Calculate total from filtered reports
  return filteredReports.reduce(
    (total: number, report: any) => {
      const reportTotal = report.expenses.reduce(
        (sum: number, expense: any) => sum + expense.amount,
        0
      );
      return total + reportTotal;
    },
    0
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
    
    // Get total reimbursed amount for the date range and category
    const totalReimbursed = await getTotalReimbursedAmount(dateRange, category || undefined);
    
    return NextResponse.json({
      totalReimbursed,
      timeframe,
      category: category || null,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  } catch (error) {
    console.error("Error fetching filtered metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch filtered metrics" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get("timeframe") || "thisMonth";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let dateRange: DateRange;

    // Determine date range based on timeframe
    if (timeframe === "custom" && startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      switch (timeframe) {
        case "today":
          dateRange = getDateRangeForToday();
          break;
        case "thisWeek":
          dateRange = getDateRangeForThisWeek();
          break;
        case "thisMonth":
          dateRange = getDateRangeForThisMonth();
          break;
        case "thisQuarter":
          dateRange = getDateRangeForThisQuarter();
          break;
        case "thisYear":
          dateRange = getDateRangeForThisYear();
          break;
        case "allTime":
          dateRange = getDateRangeForAllTime();
          break;
        default:
          dateRange = getDateRangeForThisMonth();
      }
    }

    // Get all reimbursed reports within the date range
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

    // Initialize category totals
    const categoryTotals: Record<string, number> = {};
    
    // Calculate totals by category
    for (const report of reimbursedReports) {
      for (const expense of report.expenses) {
        const category = expense.category as string;
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += expense.amount;
      }
    }

    // Convert to array format for easier consumption by frontend
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));

    // Sort by amount (highest first)
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      categoryBreakdown,
      timeframe,
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch category breakdown" },
      { status: 500 }
    );
  }
}

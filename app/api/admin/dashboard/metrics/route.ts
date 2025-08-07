import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
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

// Function to get total reimbursed amount within a date range
async function getTotalReimbursedAmount(dateRange: DateRange): Promise<number> {
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

  return reimbursedReports.reduce(
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

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current date and calculate dates for filtering
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Get total pending reimbursement amount
    const pendingReimbursementReports = await prisma.report.findMany({
      where: {
        status: ReportStatus.APPROVED,
      },
      include: {
        expenses: true,
      },
    });

    const pendingReimbursementAmount = pendingReimbursementReports.reduce(
      (total: number, report: any) => {
        const reportTotal = report.expenses.reduce(
          (sum: number, expense: any) => sum + expense.amount,
          0
        );
        return total + reportTotal;
      },
      0
    );

    // Get YTD approved vs rejected counts
    const ytdApprovedCount = await prisma.report.count({
      where: {
        status: ReportStatus.APPROVED,
        approvedAt: {
          gte: startOfYear,
        },
      },
    });

    const ytdRejectedCount = await prisma.report.count({
      where: {
        status: ReportStatus.REJECTED,
        rejectedAt: {
          gte: startOfYear,
        },
      },
    });

    // Calculate average processing time (in days)
    const processedReports = await prisma.report.findMany({
      where: {
        status: {
          in: [ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.REIMBURSED],
        },
        submittedAt: { not: null },
        OR: [
          { approvedAt: { not: null } },
          { rejectedAt: { not: null } },
        ],
      },
      select: {
        submittedAt: true,
        approvedAt: true,
        rejectedAt: true,
      },
    });

    let totalProcessingDays = 0;
    processedReports.forEach((report: any) => {
      const submittedAt = report.submittedAt;
      const processedAt = report.approvedAt || report.rejectedAt;
      
      if (submittedAt && processedAt) {
        const diffTime = Math.abs(processedAt.getTime() - submittedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalProcessingDays += diffDays;
      }
    });

    const avgProcessingDays = processedReports.length > 0 
      ? (totalProcessingDays / processedReports.length).toFixed(1)
      : "0";

    // Get approval queue metrics
    const awaitingApprovalCount = await prisma.report.count({
      where: {
        status: ReportStatus.SUBMITTED,
      },
    });

    const awaitingReimbursementCount = await prisma.report.count({
      where: {
        status: ReportStatus.APPROVED,
      },
    });

    const pendingOverSevenDaysCount = await prisma.report.count({
      where: {
        status: ReportStatus.SUBMITTED,
        submittedAt: {
          lte: sevenDaysAgo,
        },
      },
    });

    // Get recent activity
    const recentActivity = await prisma.report.findMany({
      where: {
        OR: [
          { status: ReportStatus.APPROVED, approvedAt: { not: null } },
          { status: ReportStatus.REJECTED, rejectedAt: { not: null } },
          { status: ReportStatus.REIMBURSED, reimbursedAt: { not: null } },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Calculate total reimbursed amounts for different time periods
    const todayReimbursed = await getTotalReimbursedAmount(getDateRangeForToday());
    const thisWeekReimbursed = await getTotalReimbursedAmount(getDateRangeForThisWeek());
    const thisMonthReimbursed = await getTotalReimbursedAmount(getDateRangeForThisMonth());
    const thisQuarterReimbursed = await getTotalReimbursedAmount(getDateRangeForThisQuarter());
    const thisYearReimbursed = await getTotalReimbursedAmount(getDateRangeForThisYear());
    const allTimeReimbursed = await getTotalReimbursedAmount(getDateRangeForAllTime());

    return NextResponse.json({
      financialOverview: {
        pendingReimbursementAmount,
        ytdApprovedCount,
        ytdRejectedCount,
        avgProcessingDays,
      },
      approvalQueueMetrics: {
        awaitingApprovalCount,
        awaitingReimbursementCount,
        pendingOverSevenDaysCount,
      },
      reimbursedAmounts: {
        today: todayReimbursed,
        thisWeek: thisWeekReimbursed,
        thisMonth: thisMonthReimbursed,
        thisQuarter: thisQuarterReimbursed,
        thisYear: thisYearReimbursed,
        allTime: allTimeReimbursed,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}

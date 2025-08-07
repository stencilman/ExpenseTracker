import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get reimbursed reports within the date range
    const reimbursedReports = await prisma.report.findMany({
      where: {
        status: ReportStatus.REIMBURSED,
        reimbursedAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        expenses: true
      }
    });

    // Calculate total reimbursed amount
    const totalReimbursed = reimbursedReports.reduce(
      (total: number, report: any) => {
        const reportTotal = report.expenses.reduce(
          (sum: number, expense: any) => sum + expense.amount,
          0
        );
        return total + reportTotal;
      },
      0
    );

    return NextResponse.json({
      totalReimbursed,
      startDate: start,
      endDate: end,
      count: reimbursedReports.length
    });
  } catch (error) {
    console.error("Error fetching custom range metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom range metrics" },
      { status: 500 }
    );
  }
}

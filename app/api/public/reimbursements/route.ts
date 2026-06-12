import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function isValidApiKey(req: NextRequest) {
  const configuredApiKey = process.env.EXTERNAL_REIMBURSEMENTS_API_KEY;
  const providedApiKey = req.headers.get("x-api-key");

  if (!configuredApiKey || !providedApiKey) {
    return false;
  }

  const configuredKeyBuffer = Buffer.from(configuredApiKey);
  const providedKeyBuffer = Buffer.from(providedApiKey);

  if (configuredKeyBuffer.length !== providedKeyBuffer.length) {
    return false;
  }

  return timingSafeEqual(configuredKeyBuffer, providedKeyBuffer);
}

function getReimbursableAmount(
  expenses: { amount: number; claimReimbursement: boolean }[]
) {
  return expenses
    .filter((expense) => expense.claimReimbursement !== false)
    .reduce((total, expense) => total + expense.amount, 0);
}

function formatReport(report: Awaited<ReturnType<typeof getReports>>[number]) {
  const reimbursableAmount = getReimbursableAmount(report.expenses);

  return {
    id: report.id,
    title: report.title,
    description: report.description,
    status: report.status,
    totalAmount: report.totalAmount,
    reimbursableAmount,
    startDate: report.startDate,
    endDate: report.endDate,
    submittedAt: report.submittedAt,
    approvedAt: report.approvedAt,
    rejectedAt: report.rejectedAt,
    reimbursedAt: report.reimbursedAt,
    reimbursement: {
      method: report.reimbursementMethod,
      reference: report.reimbursementRef,
      notes: report.reimbursementNotes,
    },
    submitter: report.user,
    approver: report.approver,
    expenses: report.expenses,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function getReports() {
  return db.report.findMany({
    where: {
      status: ReportStatus.REIMBURSED,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
          designation: true,
        },
      },
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
          designation: true,
        },
      },
      expenses: {
        select: {
          id: true,
          amount: true,
          merchant: true,
          date: true,
          description: true,
          category: true,
          status: true,
          receiptUrls: true,
          notes: true,
          claimReimbursement: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
    orderBy: [
      { reimbursedAt: "desc" },
      { createdAt: "desc" },
    ],
  });
}

function groupReportsByUser(reports: ReturnType<typeof formatReport>[]) {
  const users = new Map<
    string,
    {
      user: ReturnType<typeof formatReport>["submitter"];
      totalReimbursedAmount: number;
      reportCount: number;
      reports: ReturnType<typeof formatReport>[];
    }
  >();

  for (const report of reports) {
    const userId = report.submitter.id;
    const existingUser = users.get(userId);

    if (existingUser) {
      existingUser.totalReimbursedAmount += report.reimbursableAmount;
      existingUser.reportCount += 1;
      existingUser.reports.push(report);
      continue;
    }

    users.set(userId, {
      user: report.submitter,
      totalReimbursedAmount: report.reimbursableAmount,
      reportCount: 1,
      reports: [report],
    });
  }

  return Array.from(users.values()).sort(
    (a, b) => b.totalReimbursedAmount - a.totalReimbursedAmount
  );
}

/**
 * GET /api/public/reimbursements
 *
 * Public integration endpoint protected by the x-api-key header.
 * Returns total reimbursed amounts and per-user reimbursed report details.
 */
export async function GET(req: NextRequest) {
  if (!isValidApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = (await getReports()).map(formatReport);
    const totalReimbursedAmount = reports.reduce(
      (total, report) => total + report.reimbursableAmount,
      0
    );
    const users = groupReportsByUser(reports);

    return NextResponse.json({
      data: {
        totalReimbursedAmount,
        userCount: users.length,
        reportCount: reports.length,
        users,
      },
      meta: {
        status: ReportStatus.REIMBURSED,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching public reimbursements:", error);
    return NextResponse.json(
      { error: "Failed to fetch reimbursements" },
      { status: 500 }
    );
  }
}

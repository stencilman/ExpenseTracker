import { auth } from "@/auth";
import { errorResponse } from "@/lib/api-utils";
import { csvResponse, CsvValue, toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import {
  buildReportWhere,
  isReportListScope,
  parseReportFilters,
  REPORT_LIST_SCOPES,
} from "@/lib/report-filters";
import { NextRequest } from "next/server";

/** Guard against an unfiltered export trying to stream the whole table. */
const MAX_EXPORT_ROWS = 5000;

const COLUMNS = [
  "Report #",
  "Title",
  "Description",
  "Status",
  "Submitter",
  "Submitter Email",
  "Approver",
  "Approver Email",
  "Expense Count",
  "Total Amount",
  "Reimbursable Amount",
  "Non-Reimbursable Amount",
  "Expense Start Date",
  "Expense End Date",
  "Submitted On",
  "Approved On",
  "Rejected On",
  "Reimbursed On",
  "Reimbursement Method",
  "Reimbursement Reference",
  "Reimbursement Notes",
];

const isoDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

const fullName = (
  person: { firstName: string | null; lastName: string | null } | null
) => (person ? [person.firstName, person.lastName].filter(Boolean).join(" ") : "");

/**
 * GET /api/admin/reports/export
 *
 * Download the reports matching the current tab and filters as CSV.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return errorResponse("Forbidden: Admin access required", 403);
    }

    const url = new URL(req.url);
    const scopeParam = url.searchParams.get("scope") ?? "all";
    if (!isReportListScope(scopeParam)) {
      return errorResponse(`Unknown report scope: ${scopeParam}`, 400);
    }
    const scope = REPORT_LIST_SCOPES[scopeParam];

    const filters = parseReportFilters(url);
    const where = buildReportWhere(
      {
        ...filters,
        // Only the "all" tab spans statuses; elsewhere the scope wins.
        status: scopeParam === "all" ? filters.status : undefined,
        dateField: scope.dateField,
      },
      scope.baseWhere
    );

    const reports = await db.report.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        approver: { select: { firstName: true, lastName: true, email: true } },
        expenses: { select: { amount: true, claimReimbursement: true } },
      },
      orderBy: scope.orderBy,
      take: MAX_EXPORT_ROWS,
    });

    const rows: CsvValue[][] = [COLUMNS];

    for (const report of reports) {
      // Sum the expenses rather than trusting report.totalAmount, which is
      // stale (0) on some older rows.
      const total = report.expenses.reduce((sum, e) => sum + e.amount, 0);
      const nonReimbursable = report.expenses
        .filter((e) => e.claimReimbursement === false)
        .reduce((sum, e) => sum + e.amount, 0);

      rows.push([
        report.id,
        report.title,
        report.description ?? "",
        report.status,
        fullName(report.user),
        report.user.email ?? "",
        fullName(report.approver),
        report.approver?.email ?? "",
        report.expenses.length,
        total.toFixed(2),
        (total - nonReimbursable).toFixed(2),
        nonReimbursable.toFixed(2),
        isoDate(report.startDate),
        isoDate(report.endDate),
        isoDate(report.submittedAt),
        isoDate(report.approvedAt),
        isoDate(report.rejectedAt),
        isoDate(report.reimbursedAt),
        report.reimbursementMethod ?? "",
        report.reimbursementRef ?? "",
        report.reimbursementNotes ?? "",
      ]);
    }

    const filename = `reports-${scopeParam}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return csvResponse(toCsv(rows), filename);
  } catch (error) {
    console.error("Error exporting reports:", error);
    return errorResponse("Failed to export reports", 500);
  }
}

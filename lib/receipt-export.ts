import { db } from "@/lib/db";
import { toS3Key } from "@/lib/receipt-keys";
import { ExpenseStatus, Prisma } from "@prisma/client";

/** Most receipts a single download may contain. */
export const MAX_RECEIPT_FILES = 500;

export interface ReceiptExportFilters {
  userId?: string;
  reportId?: number;
  /** Inclusive expense-date bounds, as yyyy-MM-dd. */
  from?: string;
  to?: string;
  status?: ExpenseStatus;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Read the filters from a request URL. Returns an error message instead when
 * a parameter is malformed or neither a user nor a report is given.
 */
export function parseReceiptExportFilters(
  url: URL
): { filters: ReceiptExportFilters } | { error: string } {
  const params = url.searchParams;
  const filters: ReceiptExportFilters = {};

  const userId = params.get("userId");
  if (userId) filters.userId = userId;

  const reportId = params.get("reportId");
  if (reportId) {
    const parsed = Number(reportId);
    if (!Number.isInteger(parsed)) return { error: "Invalid reportId" };
    filters.reportId = parsed;
  }

  if (!filters.userId && filters.reportId === undefined) {
    return { error: "userId or reportId is required" };
  }

  for (const key of ["from", "to"] as const) {
    const value = params.get(key);
    if (!value) continue;
    if (!DATE_PATTERN.test(value) || isNaN(Date.parse(value))) {
      return { error: `Invalid ${key} date, expected yyyy-MM-dd` };
    }
    filters[key] = value;
  }

  const status = params.get("status");
  if (status && status !== "ALL") {
    if (!(status in ExpenseStatus)) return { error: `Unknown status: ${status}` };
    filters.status = status as ExpenseStatus;
  }

  return { filters };
}

export function buildReceiptExpenseWhere(
  filters: ReceiptExportFilters
): Prisma.ExpenseWhereInput {
  const where: Prisma.ExpenseWhereInput = {
    receiptUrls: { isEmpty: false },
  };

  if (filters.userId) where.userId = filters.userId;
  if (filters.reportId !== undefined) where.reportId = filters.reportId;
  if (filters.status) where.status = filters.status;

  if (filters.from || filters.to) {
    const date: Prisma.DateTimeFilter = {};
    if (filters.from) date.gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to) {
      // Inclusive: everything before the start of the following day.
      const end = new Date(`${filters.to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      date.lt = end;
    }
    where.date = date;
  }

  return where;
}

export async function findReceiptExpenses(filters: ReceiptExportFilters) {
  return db.expense.findMany({
    where: buildReceiptExpenseWhere(filters),
    select: {
      id: true,
      date: true,
      merchant: true,
      amount: true,
      category: true,
      status: true,
      claimReimbursement: true,
      receiptUrls: true,
      report: { select: { id: true, title: true } },
    },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
}

export type ReceiptExpense = Awaited<
  ReturnType<typeof findReceiptExpenses>
>[number];

export interface ReceiptFileEntry {
  expense: ReceiptExpense;
  /** 1-based position within the expense's receipts. */
  index: number;
  /** S3 key, or null when the stored value could not be parsed. */
  key: string | null;
  /** Path inside the zip, without extension. */
  basePath: string;
  /** Extension from the original file name, if it had one. */
  extension: string | null;
}

/** Make a string safe to use as a single zip path segment. */
export function sanitizeFileSegment(value: string, maxLength = 60): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, maxLength)
    .trim();
  return cleaned || "untitled";
}

function extensionOf(key: string | null): string | null {
  const match = key?.match(/\.([A-Za-z0-9]{1,5})$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Lay out every receipt as a zip entry, grouped into a folder per report:
 *   Report 12 - Client visit/2026-09-14_Uber_450.00_exp1832_1.jpg
 *   Unreported/2026-10-01_Amazon_1299.00_exp1901_1.pdf
 * The expense id keeps names unique even when everything else matches.
 */
export function planReceiptFiles(expenses: ReceiptExpense[]): ReceiptFileEntry[] {
  return expenses.flatMap((expense) => {
    const folder = expense.report
      ? sanitizeFileSegment(`Report ${expense.report.id} - ${expense.report.title}`)
      : "Unreported";
    const stem = [
      expense.date.toISOString().slice(0, 10),
      sanitizeFileSegment(expense.merchant, 40),
      expense.amount.toFixed(2),
      `exp${expense.id}`,
    ].join("_");

    return expense.receiptUrls.map((receiptUrl, i) => {
      const key = toS3Key(receiptUrl);
      return {
        expense,
        index: i + 1,
        key,
        basePath: `${folder}/${stem}_${i + 1}`,
        extension: extensionOf(key),
      };
    });
  });
}

export function countReceiptFiles(expenses: ReceiptExpense[]): number {
  return expenses.reduce((sum, e) => sum + e.receiptUrls.length, 0);
}

import { Prisma, ReportStatus } from "@prisma/client";

/**
 * Date column a date-range filter should be applied to. Each report list is
 * scoped to a status, so the meaningful date differs per list.
 */
export type ReportDateField =
  | "createdAt"
  | "submittedAt"
  | "approvedAt"
  | "reimbursedAt";

export interface ReportFilters {
  search?: string;
  status?: ReportStatus;
  submitterId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  dateField?: ReportDateField;
}

const DATE_FIELDS: ReportDateField[] = [
  "createdAt",
  "submittedAt",
  "approvedAt",
  "reimbursedAt",
];

/** The admin report tabs, each scoped to a status. */
export type ReportListScope =
  | "all"
  | "awaiting-approval"
  | "awaiting-reimbursement"
  | "reimbursed";

interface ReportListScopeConfig {
  label: string;
  /** Status scope the tab is locked to; user filters are ANDed on top. */
  baseWhere: Prisma.ReportWhereInput;
  /** Date column a date-range filter means on this tab. */
  dateField: ReportDateField;
  orderBy: Prisma.ReportOrderByWithRelationInput;
}

/**
 * Single source of truth for how each admin report tab is scoped, shared by the
 * list routes and the CSV export so the two can't drift apart.
 */
export const REPORT_LIST_SCOPES: Record<
  ReportListScope,
  ReportListScopeConfig
> = {
  all: {
    label: "All Reports",
    // Drafts belong to their owner only and never surface to admins.
    baseWhere: { status: { not: ReportStatus.PENDING } },
    dateField: "submittedAt",
    orderBy: { createdAt: "desc" },
  },
  "awaiting-approval": {
    label: "Awaiting Approval",
    baseWhere: { status: ReportStatus.SUBMITTED },
    dateField: "submittedAt",
    orderBy: { submittedAt: "desc" },
  },
  "awaiting-reimbursement": {
    label: "Awaiting Reimbursement",
    baseWhere: { status: ReportStatus.APPROVED },
    dateField: "approvedAt",
    orderBy: { approvedAt: "desc" },
  },
  reimbursed: {
    label: "Reimbursed",
    baseWhere: { status: ReportStatus.REIMBURSED },
    dateField: "reimbursedAt",
    orderBy: { reimbursedAt: "desc" },
  },
};

export function isReportListScope(value: unknown): value is ReportListScope {
  return typeof value === "string" && value in REPORT_LIST_SCOPES;
}

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  // A date-range picker means "the whole of that day", so stretch the upper
  // bound to the last millisecond of it.
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Read report filters off a request URL. Unknown/malformed values are dropped
 * rather than rejected so a stale bookmarked URL still returns results.
 */
export function parseReportFilters(url: URL): ReportFilters {
  const params = url.searchParams;

  const status = params.get("status");
  const dateField = params.get("dateField");

  return {
    search: params.get("search")?.trim() || undefined,
    status:
      status && Object.values(ReportStatus).includes(status as ReportStatus)
        ? (status as ReportStatus)
        : undefined,
    submitterId: params.get("submitterId") || undefined,
    minAmount: parseNumber(params.get("minAmount")),
    maxAmount: parseNumber(params.get("maxAmount")),
    startDate: parseDate(params.get("startDate")),
    endDate: parseDate(params.get("endDate"), true),
    dateField: DATE_FIELDS.includes(dateField as ReportDateField)
      ? (dateField as ReportDateField)
      : undefined,
  };
}

/**
 * Build the OR clause for a free-text search across a report and its submitter.
 */
function buildSearchClause(search: string): Prisma.ReportWhereInput[] {
  const clauses: Prisma.ReportWhereInput[] = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
    { user: { firstName: { contains: search, mode: "insensitive" } } },
    { user: { lastName: { contains: search, mode: "insensitive" } } },
    { user: { email: { contains: search, mode: "insensitive" } } },
  ];

  // Report IDs are shown to admins as "#123", so allow searching by number.
  const numeric = parseInt(search.replace(/^#/, ""), 10);
  if (!isNaN(numeric)) {
    clauses.push({ id: numeric });
  }

  // "John Doe" should match firstName + lastName, which no single-field
  // contains can do.
  const tokens = search.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const [first, ...rest] = tokens;
    clauses.push({
      user: {
        firstName: { contains: first, mode: "insensitive" },
        lastName: { contains: rest.join(" "), mode: "insensitive" },
      },
    });
  }

  return clauses;
}

/**
 * Combine a base where clause (typically the list's status scope) with the
 * user-supplied filters. Conditions are ANDed so a base OR is never clobbered.
 */
export function buildReportWhere(
  filters: ReportFilters,
  base: Prisma.ReportWhereInput = {}
): Prisma.ReportWhereInput {
  const conditions: Prisma.ReportWhereInput[] = [];

  if (filters.search) {
    conditions.push({ OR: buildSearchClause(filters.search) });
  }

  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (filters.submitterId) {
    conditions.push({ userId: filters.submitterId });
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    conditions.push({
      totalAmount: {
        ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
        ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
      },
    });
  }

  if (filters.startDate || filters.endDate) {
    const field = filters.dateField ?? "createdAt";
    conditions.push({
      [field]: {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      },
    } as Prisma.ReportWhereInput);
  }

  if (conditions.length === 0) {
    return base;
  }

  return { ...base, AND: [...(base.AND ? [base.AND].flat() : []), ...conditions] };
}

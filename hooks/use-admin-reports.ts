"use client";

import { Report } from "@/components/table/ReportsTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "./use-debounce";

export interface ReportFilterValues {
  search: string;
  submitterId?: string;
  status?: string;
  minAmount?: string;
  maxAmount?: string;
  startDate?: Date;
  endDate?: Date;
}

export const EMPTY_REPORT_FILTERS: ReportFilterValues = { search: "" };

/**
 * Number of filters (search aside) the user has applied, for the badge on the
 * Filters button.
 */
export function countActiveFilters(filters: ReportFilterValues) {
  let count = 0;
  if (filters.submitterId) count++;
  if (filters.status) count++;
  if (filters.minAmount || filters.maxAmount) count++;
  if (filters.startDate || filters.endDate) count++;
  return count;
}

/** Rows per page. 100 is the ceiling `parsePaginationParams` allows. */
export const REPORTS_PAGE_SIZE = 100;

interface UseAdminReportsOptions {
  /** API route backing the list, e.g. "/api/admin/reports/awaiting-approval" */
  endpoint: string;
  pageSize?: number;
}

/**
 * Fetches a paginated, searchable and filterable list of reports for the admin
 * report tabs. Search is debounced and any filter change resets to page 1.
 */
export function useAdminReports({
  endpoint,
  pageSize = REPORTS_PAGE_SIZE,
}: UseAdminReportsOptions) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilterValues>(
    EMPTY_REPORT_FILTERS
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (filters.submitterId) params.set("submitterId", filters.submitterId);
    if (filters.status) params.set("status", filters.status);
    if (filters.minAmount) params.set("minAmount", filters.minAmount);
    if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
    if (filters.startDate)
      params.set("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
    return params.toString();
  }, [
    pageSize,
    debouncedSearch,
    filters.submitterId,
    filters.status,
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate,
  ]);

  // Snapping back to page 1 whenever the result set changes shape keeps the
  // user from landing on a page that no longer exists. Adjusting during render
  // (rather than in an effect) means the fetch below never fires for the stale
  // page first.
  const [previousQuery, setPreviousQuery] = useState(queryString);
  if (previousQuery !== queryString) {
    setPreviousQuery(queryString);
    setCurrentPage(1);
  }

  const fetchReports = useCallback(
    async (page: number, query: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams(query);
        params.set("page", String(page));

        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const responseData = await response.json();
        // Routes return { data: [...], meta }; tolerate a nested { data: { data, meta } }
        const payload = responseData.data;
        const data = Array.isArray(payload) ? payload : payload?.data ?? [];
        const meta = responseData.meta ?? payload?.meta;

        if (meta) {
          setTotalPages(meta.pageCount || 1);
          setTotalCount(meta.totalCount || 0);
        }
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    fetchReports(currentPage, queryString);
  }, [fetchReports, currentPage, queryString]);

  const refresh = useCallback(
    () => fetchReports(currentPage, queryString),
    [fetchReports, currentPage, queryString]
  );

  const resetFilters = useCallback(
    () => setFilters(EMPTY_REPORT_FILTERS),
    []
  );

  return {
    reports,
    isLoading,
    error,
    /** Active filters as a query string, for callers that need the same scope (e.g. export). */
    queryString,
    filters,
    setFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    refresh,
  };
}

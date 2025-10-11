"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ReportStatus } from "@prisma/client";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the API report type
interface ApiReport {
  id: number;
  title: string;
  description?: string;
  status: ReportStatus;
  totalAmount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reimbursedAt?: Date;
  expenses: {
    id: number;
    amount: number;
    merchant: string;
    category: string;
  }[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  submitter?: { name: string };
  approver?: { name: string };
}

export default function AdminAllReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Function to format date range
  const formatDateRange = (startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return "No date range";
    if (startDate && !endDate)
      return `From ${format(new Date(startDate), "dd/MM/yyyy")}`;
    if (!startDate && endDate)
      return `Until ${format(new Date(endDate), "dd/MM/yyyy")}`;
    return `${format(new Date(startDate!), "dd/MM/yyyy")} - ${format(
      new Date(endDate!),
      "dd/MM/yyyy"
    )}`;
  };

  // Function to convert API report to UI report
  const convertApiReportToUiReport = (apiReport: ApiReport): Report => {
    const dateRange = formatDateRange(apiReport.startDate, apiReport.endDate);
    const totalAmount = apiReport.totalAmount;
    const statusDisplay = mapReportStatusToDisplay(
      apiReport.status,
      apiReport.submittedAt,
      apiReport.approvedAt,
      apiReport.rejectedAt,
      apiReport.reimbursedAt
    );
    const approverName = apiReport.approver
      ? apiReport.approver.name
      : undefined;

    return {
      id: apiReport.id.toString(),
      iconType: "file-text",
      title: apiReport.title,
      dateRange,
      total: `Rs.${totalAmount.toLocaleString()}.00`,
      expenseCount: apiReport.expenses?.length ?? 0,
      toBeReimbursed: `Rs.${totalAmount.toLocaleString()}.00`,
      status: statusDisplay,
      submitter:
        apiReport.submitter?.name ??
        `${apiReport.user.firstName} ${apiReport.user.lastName}`,
      approver: approverName,
    };
  };

  // Fetch reports from API with pagination
  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Fetch all reports with pagination
      const response = await fetch(`/api/reports?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const responseData = await response.json();

      // Extract pagination metadata
      const data = responseData.data || [];
      const meta = responseData.meta;
      if (meta) {
        setCurrentPage(meta.page);
        setTotalPages(meta.pageCount);
      }

      const uiReports = data.map(convertApiReportToUiReport);
      setReports(uiReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [fetchReports, currentPage]);

  // No selection handlers needed for all reports view

  // Handle row click to navigate to report detail
  const handleRowClick = (reportId: string) => {
    router.push(`/admin/my-reports/${reportId}`);
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        {/* No selection controls needed for all reports view */}

        {loading ? (
          <div className="text-center py-8">
            <Loader size="md" text="Loading reports..." />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <ReportsTable
              data={reports}
              enableRowSelection={false}
              variant="page"
              showPagination={false} /* Disable built-in pagination */
              onRowClick={handleRowClick}
            />

            {/* Custom server-side pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

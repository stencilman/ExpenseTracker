"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { ReportStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminReportsAllPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reports?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const responseData = await response.json();
      // Handle both possible API response shapes:
      // 1) { data: [ ... ], meta: { ... } }
      // 2) { data: { data: [ ... ], meta: { ... } } }
      const apiData = responseData.data;
      
      // Extract pagination metadata
      const meta = responseData.meta || apiData?.meta;
      if (meta) {
        setCurrentPage(meta.page);
        setTotalPages(meta.pageCount);
      }
      
      // Exclude reports that are still in PENDING (draft) state – admin only needs submitted ones
      const reportsDataRaw = Array.isArray(apiData)
        ? apiData
        : apiData?.data ?? [];
      const reportsData = reportsDataRaw.filter((r: any) => {
        const label = typeof r.status === "string" ? r.status : r.status?.label;
        return label !== "PENDING"; // keep everything except drafts
      });

      // Map API reports to UI format with proper status object
      const formattedReports = reportsData.map((report: any) => {
        // Ensure status object
        if (typeof report.status === "string") {
          report.status = mapReportStatusToDisplay(
            report.status as ReportStatus,
            report.submittedAt,
            report.approvedAt,
            report.rejectedAt,
            report.reimbursedAt
          );
        }

        // Ensure correct reimbursable amount for list views
        if (Array.isArray(report.expenses)) {
          const reimbursableAmount = report.expenses.reduce(
            (sum: number, exp: any) =>
              sum + (exp.claimReimbursement !== false ? exp.amount : 0),
            0
          );
          report.toBeReimbursed = `Rs.${reimbursableAmount.toLocaleString()}.00`;
        }
        return report;
      });

      setReports(formattedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [fetchReports, currentPage]);

  // Handle report action completion (approve, reject, reimburse)
  const handleReportActionComplete = useCallback(
    (updatedReport: Report) => {
      // Refresh the reports list
      fetchReports();
      toast.success(`Report ${updatedReport.id} status updated successfully`);
    },
    [fetchReports]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      <ReportsTable
        data={reports}
        enableRowSelection={false}
        showPagination={false} /* Disable built-in pagination */
        variant="page"
        onReportActionComplete={handleReportActionComplete}
      />
      
      {/* Custom server-side pagination controls */}
      <div className="flex items-center justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

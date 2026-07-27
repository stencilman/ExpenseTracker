"use client";

import { ReportsFilterBar } from "@/components/admin/reports/ReportsFilterBar";
import { Report, ReportsTable } from "@/components/table/ReportsTable";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { REPORTS_PAGE_SIZE, useAdminReports } from "@/hooks/use-admin-reports";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

export default function AdminReportsAwaitingApprovalPage() {
  const {
    reports,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    refresh,
  } = useAdminReports({ endpoint: "/api/admin/reports/awaiting-approval" });

  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectedRowsChange = (selectedRows: Report[]) => {
    setSelectedReports(selectedRows);
    // Check if all reports are selected
    setSelectAll(
      selectedRows.length > 0 && selectedRows.length === reports.length
    );
  };

  // Selection is handled by the table's checkbox header

  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsApproving(true);
      const response = await fetch("/api/admin/reports/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportIds: selectedReports.map((report) => report.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve reports");
      }

      const result = await response.json();
      toast.success(
        result.message || `${result.count} reports approved successfully`
      );
      refresh();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error approving reports:", err);
      toast.error("Failed to approve reports. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsRejecting(true);
      const response = await fetch("/api/admin/reports/bulk-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportIds: selectedReports.map((report) => report.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject reports");
      }

      const result = await response.json();
      toast.success(
        result.message || `${result.count} reports rejected successfully`
      );
      refresh();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error rejecting reports:", err);
      toast.error("Failed to reject reports. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle report action completion (approve, reject, reimburse)
  const handleReportActionComplete = useCallback(
    (updatedReport: Report) => {
      // Refresh the reports list
      refresh();
      toast.success(`Report ${updatedReport.id} status updated successfully`);
    },
    [refresh]
  );

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <ReportsFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          dateLabel="Submitted"
          totalCount={totalCount}
          isLoading={isLoading}
        />

        {selectedReports.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {selectedReports.length} report
              {selectedReports.length !== 1 ? "s" : ""} selected
            </span>

            {/* Action buttons in the same row */}
            <div className="flex gap-2 ml-4">
              <Button
                variant="blue-outline"
                onClick={handleBulkApprove}
                disabled={isApproving || isRejecting}
                size="sm"
              >
                {isApproving ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" />
                    <span>Approving...</span>
                  </div>
                ) : (
                  "Approve"
                )}
              </Button>
              <Button
                variant="red-outline"
                onClick={handleBulkReject}
                disabled={isApproving || isRejecting}
                size="sm"
              >
                {isRejecting ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" className="text-red-500" />
                    <span>Rejecting...</span>
                  </div>
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <ReportsTable
            data={reports}
            enableRowSelection={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            variant="page"
            showPagination={false} /* Disable built-in pagination */
            pageSize={REPORTS_PAGE_SIZE}
            onReportActionComplete={handleReportActionComplete}
            isAllRowsSelected={selectAll}
          />
        )}

        {/* Custom server-side pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminReportsAwaitingApprovalPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  // Removed rejection dialog and reason state

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/reports/awaiting-approval");

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSelectedRowsChange = (selectedRows: Report[]) => {
    setSelectedReports(selectedRows);
    // Check if all reports are selected
    setSelectAll(
      selectedRows.length > 0 && selectedRows.length === reports.length
    );
  };

  const handleSelectAll = () => {
    // Force re-render by creating a new array
    const allReports = [...reports];
    setSelectedReports(allReports);
    setSelectAll(true);

    // Force a re-render after a short delay to ensure UI updates
    setTimeout(() => {
      setSelectAll((state) => state);
    }, 50);
  };

  const handleClearSelection = () => {
    setSelectedReports([]);
    setSelectAll(false);

    // Force a re-render after a short delay to ensure UI updates
    setTimeout(() => {
      setSelectAll((state) => state);
    }, 50);
  };

  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsProcessing(true);
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
      fetchReports();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error approving reports:", err);
      toast.error("Failed to approve reports. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsProcessing(true);
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
      fetchReports();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error rejecting reports:", err);
      toast.error("Failed to reject reports. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedReports.length > 0 ? (
              <>
                <span className="text-sm font-medium">
                  {selectedReports.length} report
                  {selectedReports.length !== 1 ? "s" : ""} selected
                </span>
                <Button
                  onClick={handleClearSelection}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                  onClick={handleBulkApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" />
                      <span>Approving...</span>
                    </div>
                  ) : (
                    "Approve All"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  onClick={handleBulkReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" />
                      <span>Rejecting...</span>
                    </div>
                  ) : (
                    "Reject All"
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSelectAll}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                Select All
              </Button>
            )}
          </div>
        </div>

        <ReportsTable
          data={reports}
          enableRowSelection={true}
          onSelectedRowsChange={handleSelectedRowsChange}
          variant="page"
          showPagination={true}
          onReportActionComplete={handleReportActionComplete}
          isAllRowsSelected={selectAll}
        />
      </div>

      {/* Rejection dialog removed */}
    </div>
  );
}

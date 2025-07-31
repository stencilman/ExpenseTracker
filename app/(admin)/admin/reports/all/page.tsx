"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { ReportStatus } from "@prisma/client";

export default function AdminReportsAllPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/reports");

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const responseData = await response.json();
      // The API returns { data: { data: [...reports], meta: {...} } }
      // Make sure we're accessing the correct property structure
      const reportsData = responseData.data?.data || [];
      
      // Map API reports to UI format with proper status object
      const formattedReports = reportsData.map((report: any) => {
        // Ensure report has the correct status format expected by the UI
        if (report.status && typeof report.status === 'string') {
          // Map the status string to a status object
          report.status = mapReportStatusToDisplay(
            report.status as ReportStatus,
            report.submittedAt,
            report.approvedAt,
            report.rejectedAt,
            report.reimbursedAt
          );
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
    fetchReports();
  }, [fetchReports]);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
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
    <ReportsTable
      data={reports}
      enableRowSelection={true}
      onSelectedRowsChange={handleSelectedRowsChange}
      showPagination={true}
      variant="page"
      onReportActionComplete={handleReportActionComplete}
    />
  );
}

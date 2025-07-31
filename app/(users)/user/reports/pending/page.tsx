"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddReportDialog from "@/components/reports/AddReportDialog";
import { format } from "date-fns";
import { ReportStatus } from "@prisma/client";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { Loader } from "@/components/ui/loader";
import { DeleteReportsDialog } from "@/components/reports/DeleteReportsDialog";
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
}

export default function PendingReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
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
    return {
      id: apiReport.id.toString(),
      iconType: "file-text",
      title: apiReport.title,
      dateRange: formatDateRange(apiReport.startDate, apiReport.endDate),
      total: `Rs.${apiReport.totalAmount.toLocaleString()}.00`,
      expenseCount: apiReport.expenses.length,
      toBeReimbursed: `Rs.${apiReport.totalAmount.toLocaleString()}.00`,
      status: mapReportStatusToDisplay(
        apiReport.status,
        apiReport.submittedAt,
        apiReport.approvedAt,
        apiReport.rejectedAt,
        apiReport.reimbursedAt
      ),
    };
  };

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Filter by PENDING status
        const response = await fetch("/api/reports?status=PENDING");

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await response.json();
        const uiReports = data.data.map(convertApiReportToUiReport);
        setReports(uiReports);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
    if (reports.length < reports.length) {
      setIsAllSelected(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedReports(reports);
    setIsAllSelected(true);
  };

  const handleDeselectAll = () => {
    setSelectedReports([]);
    setIsAllSelected(false);
  };

  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    try {
      const reportIds = selectedReports.map((r) => parseInt(r.id, 10));
      const response = await fetch("/api/reports/bulk-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reports");
      }

      toast.success(
        `${selectedReports.length} report(s) submitted successfully.`
      );
      setSelectedReports([]);
      // Refresh the list of reports
      const fetchResponse = await fetch("/api/reports?status=PENDING");
      const data = await fetchResponse.json();
      setReports(data.data.map(convertApiReportToUiReport));
    } catch (error) {
      console.error("Error submitting reports:", error);
      toast.error("Failed to submit reports. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsSubmitting(true); // Use the same loading state
    try {
      const reportIds = selectedReports.map((r) => parseInt(r.id, 10));
      const response = await fetch("/api/reports/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete reports");
      }

      toast.success(
        `${selectedReports.length} report(s) deleted successfully.`
      );
      setSelectedReports([]);
      // Refresh the list of reports
      const fetchResponse = await fetch("/api/reports?status=PENDING");
      const data = await fetchResponse.json();
      setReports(data.data.map(convertApiReportToUiReport));
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast.error("Failed to delete reports. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
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
                  onClick={() => setSelectedReports([])}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size="sm" text="Submitting..." />
                  ) : (
                    "Submit"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Reports
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

          {/* Right Side: New Report Button */}
          <div>
            <Button variant="outline" onClick={() => setIsAddReportOpen(true)}>
              New Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader size="md" text="Loading reports..." />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : reports.length > 0 ? (
          <ReportsTable
            data={reports}
            enableRowSelection={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            variant="page"
            showPagination={true}
            isAllRowsSelected={isAllSelected}
          />
        ) : (
          <div className="text-center py-8">No reports found.</div>
        )}

        <AddReportDialog
          open={isAddReportOpen}
          onOpenChange={setIsAddReportOpen}
        />
        <DeleteReportsDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleBulkDelete}
          reportsCount={selectedReports.length}
        />
      </div>
    </div>
  );
}

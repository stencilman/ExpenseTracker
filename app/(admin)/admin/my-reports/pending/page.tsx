"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  submitter?: { name: string };
  approver?: { name: string };
}

export default function AdminPendingReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
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
    const approverName = apiReport.approver ? apiReport.approver.name : undefined;

    return {
      id: apiReport.id.toString(),
      iconType: "file-text",
      title: apiReport.title,
      dateRange,
      total: `Rs.${totalAmount.toLocaleString()}.00`,
      expenseCount: apiReport.expenses?.length ?? 0,
      toBeReimbursed: `Rs.${totalAmount.toLocaleString()}.00`,
      status: statusDisplay,
      submitter: apiReport.submitter?.name ?? `${apiReport.user.firstName} ${apiReport.user.lastName}`,
      approver: approverName,
    };
  };

  // Fetch reports from API with pagination
  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Filter by PENDING status and add pagination
      const response = await fetch(`/api/reports?status=PENDING&page=${page}`);

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

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
    if (reports.length < reports.length) {
      setIsAllSelected(false);
    }
  };

  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    setIsDeleting(false); // Reset other loading state
    try {
      // Filter out reports with no expenses
      const reportsWithExpenses = selectedReports.filter(report => report.expenseCount > 0);
      const reportsWithoutExpenses = selectedReports.filter(report => report.expenseCount === 0);
      
      if (reportsWithExpenses.length === 0) {
        toast.error("None of the selected reports have expenses. Please add expenses before submitting.");
        setIsSubmitting(false);
        return;
      }
      
      // Only submit reports that have expenses
      const reportIds = reportsWithExpenses.map((r) => parseInt(r.id, 10));
      const response = await fetch("/api/reports/bulk-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit reports");
      }

      // Show appropriate success message
      if (reportsWithoutExpenses.length > 0) {
        toast.success(
          `${reportsWithExpenses.length} report(s) submitted successfully. ${reportsWithoutExpenses.length} report(s) were skipped because they have no expenses.`
        );
      } else {
        toast.success(
          `${reportsWithExpenses.length} report(s) submitted successfully.`
        );
      }
      
      setSelectedReports([]);
      // Refresh the list of reports
      fetchReports(1); // Reset to first page after submission
    } catch (error) {
      console.error("Error submitting reports:", error);
      toast.error("Failed to submit reports. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    setIsSubmitting(false); // Reset other loading state
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
      fetchReports(1); // Reset to first page after deletion
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast.error("Failed to delete reports. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle row click to navigate to report detail
  const handleRowClick = (reportId: string) => {
    router.push(`/admin/my-reports/${reportId}`);
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedReports.length > 0 && (
              <span className="text-sm font-medium">
                {selectedReports.length} report
                {selectedReports.length !== 1 ? "s" : ""} selected
              </span>
            )}
            
            {/* Action buttons for selected reports - now in the same row */}
            {selectedReports.length > 0 && (
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting || isDeleting || !selectedReports.some(report => report.expenseCount > 0)}
                  size="sm"
                  title={!selectedReports.some(report => report.expenseCount > 0) ? "Selected reports have no expenses" : ""}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSubmitting || isDeleting}
                  size="sm"
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <Loader size="sm" className="text-red-500" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
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
        ) : (
          <>
            <ReportsTable
              data={reports}
              enableRowSelection={true}
              onSelectedRowsChange={handleSelectedRowsChange}
              variant="page"
              showPagination={false} /* Disable built-in pagination */
              isAllRowsSelected={isAllSelected}
              onRowClick={handleRowClick}
            />
            
            {/* Custom server-side pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <AddReportDialog
          open={isAddReportOpen}
          onOpenChange={setIsAddReportOpen}
          onReportAdded={() => {
            // Reset to first page and refresh reports
            setCurrentPage(1);
            fetchReports(1);
          }}
        />
        <DeleteReportsDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleBulkDelete}
          reportsCount={selectedReports.length}
          isPending={isDeleting}
        />
      </div>
    </div>
  );
}

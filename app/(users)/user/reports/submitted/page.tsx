"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ReportStatus } from "@prisma/client";
import { format } from "date-fns";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { Loader } from "@/components/ui/loader";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    claimReimbursement?: boolean;
  }[];
  user: {
    firstName: string;
    lastName: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
  };
}

export default function SubmittedReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch submitted reports from API with pagination
  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // We need to fetch reports that have been submitted (submittedAt is not null)
      // Since the API doesn't directly support this filter, we'll fetch all reports
      // and filter them on the client side
      const response = await fetch(`/api/reports?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch submitted reports");
      }

      const responseData = await response.json();

      // Extract pagination metadata
      let reportsArray: ApiReport[] = responseData.data || responseData;
      const meta = responseData.meta;
      
      // Filter for reports that have been submitted (submittedAt is not null)
      reportsArray = reportsArray.filter(report => report.submittedAt !== null);
      
      // Update pagination based on filtered results
      if (meta) {
        setCurrentPage(meta.page);
        // Adjust total pages based on filtered count
        const filteredTotalItems = reportsArray.length;
        const pageSize = meta.pageSize || 10;
        const adjustedPageCount = Math.max(1, Math.ceil(filteredTotalItems / pageSize));
        setTotalPages(adjustedPageCount);
      }

      // Convert API reports to UI reports format
      const uiReports: Report[] = reportsArray.map((report) => {
        const approverName = report.approver
          ? `${report.approver.firstName} ${report.approver.lastName}`
          : undefined;
        // Get status display from utility function
        const statusDisplay = mapReportStatusToDisplay(
          report.status,
          report.submittedAt,
          report.approvedAt,
          report.rejectedAt,
          report.reimbursedAt
        );

        // Format date range
        let dateRange = "No date range";
        if (report.startDate && report.endDate) {
          dateRange = `${format(
            new Date(report.startDate),
            "dd/MM/yyyy"
          )} - ${format(new Date(report.endDate), "dd/MM/yyyy")}`;
        } else if (report.startDate) {
          dateRange = `From ${format(
            new Date(report.startDate),
            "dd/MM/yyyy"
          )}`;
        } else if (report.endDate) {
          dateRange = `Until ${format(new Date(report.endDate), "dd/MM/yyyy")}`;
        }

        // Calculate the correct total amount based on expenses
        const totalAmount = report.totalAmount || 0;

        // Calculate reimbursable amount based on claimReimbursement flag
        const reimbursableAmount = report.expenses.reduce(
          (sum, exp) =>
            sum + (exp.claimReimbursement !== false ? exp.amount : 0),
          0
        );

        return {
          id: report.id.toString(),
          iconType: "file-text",
          title: report.title,
          dateRange,
          total: `Rs.${totalAmount.toLocaleString()}.00`,
          expenseCount: report.expenses.length,
          toBeReimbursed: `Rs.${reimbursableAmount.toLocaleString()}.00`,
          status: statusDisplay,
          submitter: `${report.user.firstName} ${report.user.lastName}`,
          approver: approverName,
        };
      });

      setReports(uiReports);
    } catch (err) {
      console.error("Error fetching submitted reports:", err);
      setError("Failed to load submitted reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [fetchReports, currentPage]);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      {loading ? (
        <div className="text-center py-8">
          <Loader size="md" text="Loading submitted reports..." />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <div className="text-lg font-medium mb-2">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <ReportsTable data={reports} variant="page" showPagination={false} />

          {/* Server-side pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

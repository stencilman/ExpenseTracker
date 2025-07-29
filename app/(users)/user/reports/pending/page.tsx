"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddReportDialog from "@/components/reports/AddReportDialog";
import { format } from "date-fns";
import { ReportStatus } from "@prisma/client";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { Loader } from "@/components/ui/loader";

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
        const response = await fetch("/api/reports");

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
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Pending Reports</h1>
          <Button variant="outline" onClick={() => setIsAddReportOpen(true)}>
            New Report
          </Button>
        </div>

        <AddReportDialog
          open={isAddReportOpen}
          onOpenChange={setIsAddReportOpen}
        />

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
          />
        ) : (
          <div className="text-center py-8">No reports found.</div>
        )}

        {selectedReports.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" className="mr-2">
              Export {selectedReports.length} selected
            </Button>
            <Button size="sm">Process {selectedReports.length} selected</Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddReportDialog from "@/components/reports/AddReportDialog";
import { ReportStatus } from "@prisma/client";
import { format } from "date-fns";
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
  }[];
}

export default function AllReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/reports");
        
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        
        const responseData = await response.json();
        
        // Check if the response has a data property (paginated response)
        const reportsArray: ApiReport[] = responseData.data || responseData;
        
        // Convert API reports to UI reports format
        const uiReports: Report[] = reportsArray.map((report) => {
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
            dateRange = `${format(new Date(report.startDate), "dd/MM/yyyy")} - ${format(new Date(report.endDate), "dd/MM/yyyy")}`;
          } else if (report.startDate) {
            dateRange = `From ${format(new Date(report.startDate), "dd/MM/yyyy")}`;
          } else if (report.endDate) {
            dateRange = `Until ${format(new Date(report.endDate), "dd/MM/yyyy")}`;
          }
          
          return {
            id: report.id.toString(),
            iconType: "file-text",
            title: report.title,
            dateRange,
            total: `Rs.${report.totalAmount.toLocaleString()}.00`,
            expenseCount: report.expenses.length,
            toBeReimbursed: `Rs.${report.totalAmount.toLocaleString()}.00`,
            status: statusDisplay,
          };
        });
        
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
  
  // Refresh reports after adding a new one
  const handleReportAdded = () => {
    setLoading(true);
    fetch("/api/reports")
      .then(response => response.json())
      .then(responseData => {
        // Check if the response has a data property (paginated response)
        const reportsArray: ApiReport[] = responseData.data || responseData;
        
        // Same conversion logic as above (simplified for brevity)
        const uiReports: Report[] = reportsArray.map((report: ApiReport) => ({
          id: report.id.toString(),
          iconType: "file-text" as const,
          title: report.title,
          dateRange: report.startDate && report.endDate 
            ? `${format(new Date(report.startDate), "dd/MM/yyyy")} - ${format(new Date(report.endDate), "dd/MM/yyyy")}` 
            : "No date range",
          total: `Rs.${report.totalAmount.toLocaleString()}.00`,
          expenseCount: report.expenses.length,
          toBeReimbursed: `Rs.${report.totalAmount.toLocaleString()}.00`,
          status: mapReportStatusToDisplay(
            report.status,
            report.submittedAt,
            report.approvedAt,
            report.rejectedAt,
            report.reimbursedAt
          ),
        }));
        setReports(uiReports);
      })
      .catch(err => {
        console.error("Error refreshing reports:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end items-center">
        <Button variant="outline" onClick={() => setIsAddReportOpen(true)}>
          New Report
        </Button>
        <AddReportDialog
          open={isAddReportOpen}
          onOpenChange={setIsAddReportOpen}
          onReportAdded={handleReportAdded}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader size="md" text="Loading reports..." />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <div className="text-lg font-medium mb-2">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : (
        <ReportsTable
          data={reports}
          enableRowSelection={true}
          onSelectedRowsChange={handleSelectedRowsChange}
          variant="page"
          showPagination={true}
        />
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
  );
}

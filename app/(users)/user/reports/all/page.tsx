"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AddReportDialog from "@/components/reports/AddReportDialog";

export default function AllReportsPage() {
  const allReports: Report[] = [
    {
      id: "1",
      submitter: "John Doe",
      approver: "Jane Doe",
      iconType: "calendar",
      title: "May-June",
      dateRange: "30/05/2025 - 30/05/2025",
      total: "Rs.1,995.00",
      expenseCount: 2,
      toBeReimbursed: "Rs.1,995.00",
      status: {
        label: "AWAITING APPROVAL",
        color: "orange",
        additionalInfo: "From 27/06/2025",
      },
    },
    {
      id: "2",
      submitter: "John Doe",
      approver: "Jane Doe",
      iconType: "calendar",
      title: "Bhive Passes and Trial Interview expense",
      dateRange: "16/05/2025 - 16/05/2025",
      total: "Rs.3,486.00",
      expenseCount: 2,
      toBeReimbursed: "Rs.1,995.00",
      status: {
        label: "AWAITING APPROVAL",
        color: "orange",
        additionalInfo: "From 27/06/2025",
      },
    },
    {
      id: "3",
      submitter: "John Doe",
      approver: undefined,
      iconType: "file-text",
      title: "Client Meeting Expenses",
      dateRange: "10/07/2025 - 15/07/2025",
      total: "Rs.2,750.00",
      expenseCount: 3,
      toBeReimbursed: "Rs.2,750.00",
      status: {
        label: "PENDING SUBMISSION",
        color: "blue",
      },
    },
  ];

  const [selectedReports, setSelectedReports] = React.useState<Report[]>([]);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

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
        />
      </div>

      <ReportsTable
        data={allReports}
        enableRowSelection={true}
        onSelectedRowsChange={handleSelectedRowsChange}
        variant="page"
        showPagination={true}
      />

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

"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React from "react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const recentReports: Report[] = [
    {
      id: "1",
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
      iconType: "file-text",
      title: "Bhive Passes and Trial Interview expense",
      dateRange: "16/05/2025 - 16/05/2025",
      total: "Rs.3,486.00",
      expenseCount: 5,
      toBeReimbursed: "Rs.0.00",
      status: {
        label: "REIMBURSED",
        color: "green",
      },
    },
  ];

  const [selectedReports, setSelectedReports] = React.useState<Report[]>([]);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button variant="outline">New Report</Button>
      </div>
      
      <ReportsTable
        data={recentReports}
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
          <Button size="sm">
            Process {selectedReports.length} selected
          </Button>
        </div>
      )}
    </div>
  );
}

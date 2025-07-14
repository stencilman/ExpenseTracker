"use client";

import { Report } from "@/components/table/ReportsTable";
import { ReportsTable } from "@/components/table/ReportsTable";
import React from "react";

export default function AdminReportsAwaitingApprovalPage() {
  const AllReports: Report[] = [
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
      approver: undefined,
      iconType: "calendar",
      title: "Bhive Passes and Trial Interview expense",
      dateRange: "16/05/2025 - 16/05/2025",
      total: "Rs.3,486.00",
      expenseCount: 5,
      toBeReimbursed: "Rs.0.00",
      status: {
        label: "AWAITING APPROVAL",
        color: "orange",
        additionalInfo: "From 27/06/2025",
      },
    },
  ];

  const [selectedReports, setSelectedReports] = React.useState<Report[]>([]);

  const handleSelectedRowsChange = (reports: Report[]) => {
    setSelectedReports(reports);
  };
  return (
    <ReportsTable
      data={AllReports}
      onSelectedRowsChange={handleSelectedRowsChange}
    />
  );
}

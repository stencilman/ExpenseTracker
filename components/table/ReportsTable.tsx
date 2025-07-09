"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Calendar, FileText, Receipt, CreditCard } from "lucide-react";

// Define the Report type
export interface Report {
  id: string;
  iconType: "calendar" | "file-text" | "receipt" | "credit-card";
  title: string;
  dateRange: string;
  total: string;
  expenseCount: number;
  toBeReimbursed: string;
  status?: {
    label: string;
    color: "green" | "orange" | "blue" | "red";
    additionalInfo?: string;
  };
}

// Helper function to get the icon component based on the icon type
const getIconComponent = (iconType: Report["iconType"]) => {
  switch (iconType) {
    case "calendar":
      return Calendar;
    case "file-text":
      return FileText;
    case "receipt":
      return Receipt;
    case "credit-card":
      return CreditCard;
    default:
      return FileText;
  }
};

// Custom cell renderer for the status column
const StatusCell = ({ status }: { status?: Report["status"] }) => {
  if (!status) return null;

  const getStatusClasses = (color: string): { bg: string; text: string } => {
    switch (color) {
      case "green":
        return { bg: "bg-green-100", text: "text-green-500" };
      case "orange":
        return { bg: "bg-orange-100", text: "text-orange-500" };
      case "blue":
        return { bg: "bg-blue-100", text: "text-blue-500" };
      case "red":
        return { bg: "bg-red-100", text: "text-red-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-500" };
    }
  };

  return (
    <div className="flex flex-col items-end">
      <div
        className={`${getStatusClasses(status.color).bg} ${
          getStatusClasses(status.color).text
        } text-xs px-2 py-1 rounded-md whitespace-nowrap`}
      >
        {status.label}
      </div>
      {status.additionalInfo && (
        <div className="text-xs text-muted-foreground mt-1">
          {status.additionalInfo}
        </div>
      )}
    </div>
  );
};

// Custom cell renderer for the report details column
const ReportDetailsCell = ({
  iconType,
  title,
  dateRange,
}: {
  iconType: Report["iconType"];
  title: string;
  dateRange: string;
}) => {
  const Icon = getIconComponent(iconType);
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-blue-500 font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{dateRange}</div>
      </div>
    </div>
  );
};

// Custom cell renderer for the total column
const TotalCell = ({
  total,
  expenseCount,
}: {
  total: string;
  expenseCount: number;
}) => {
  return (
    <div className="text-right">
      <div>{total}</div>
      <div className="text-xs text-muted-foreground">
        ({expenseCount} expense{expenseCount !== 1 ? "s" : ""})
      </div>
    </div>
  );
};

// Define the columns for the reports table
export const reportsColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "details",
    header: "REPORT DETAILS",
    cell: ({ row }) => (
      <ReportDetailsCell
        iconType={row.original.iconType}
        title={row.original.title}
        dateRange={row.original.dateRange}
      />
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">TOTAL</div>,
    cell: ({ row }) => (
      <TotalCell
        total={row.original.total}
        expenseCount={row.original.expenseCount}
      />
    ),
  },
  {
    accessorKey: "toBeReimbursed",
    header: () => <div className="text-right">TO BE REIMBURSED</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.toBeReimbursed}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">STATUS</div>,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
];

interface ReportsTableProps {
  data: Report[];
  showPagination?: boolean;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: Report[]) => void;
}

export function ReportsTable({
  data,
  showPagination = false,
  enableRowSelection = false,
  onSelectedRowsChange,
}: ReportsTableProps) {
  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: Report[]) => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange(selectedRows);
      }
    },
    [onSelectedRowsChange]
  );

  return (
    <DataTable
      columns={reportsColumns}
      data={data}
      showPagination={showPagination}
      enableRowSelection={enableRowSelection}
      onSelectedRowsChange={handleSelectedRowsChange}
    />
  );
}

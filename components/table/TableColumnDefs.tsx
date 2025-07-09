"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
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
export const getIconComponent = (iconType: Report["iconType"]) => {
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
export const StatusCell = ({ status }: { status?: Report["status"] }) => {
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
export const ReportDetailsCell = ({
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
export const TotalCell = ({
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

// Define the columns for the reports table with full details
export const getReportsColumns = (): ColumnDef<Report>[] => [
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

// Define the columns for the reports page with additional columns
export const getReportsPageColumns = (): ColumnDef<Report>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.original.id}</div>,
  },
  {
    accessorKey: "details",
    header: "NAME",
    cell: ({ row }) => (
      <ReportDetailsCell
        iconType={row.original.iconType}
        title={row.original.title}
        dateRange={row.original.dateRange}
      />
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">STATUS</div>,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
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
];

// Example of how to create columns for an expenses table
export interface Expense {
  id: string;
  expenseDetails: string;
  merchant: string;
  amount: string;
  reportName: string;
  date: string;
  category: string;
  status?: {
    label: string;
    color: "green" | "orange" | "blue" | "red";
  };
}

export const getExpensesPageColumns = (): ColumnDef<Expense>[] => [
  {
    accessorKey: "expenseDetails",
    header: "EXPENSE DETAILS",
    cell: ({ row }) => <div>{row.original.expenseDetails}</div>,
  },
  {
    accessorKey: "merchant",
    header: "MERCHANT",
    cell: ({ row }) => <div>{row.original.merchant}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">AMOUNT</div>,
    cell: ({ row }) => <div className="text-right">{row.original.amount}</div>,
  },
  {
    accessorKey: "reportName",
    header: "REPORT NAME",
    cell: ({ row }) => <div>{row.original.reportName}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">STATUS</div>,
    cell: ({ row }) => (
      <StatusCell
        status={
          row.original.status
            ? {
                label: row.original.status.label,
                color: row.original.status.color,
              }
            : undefined
        }
      />
    ),
  },
];

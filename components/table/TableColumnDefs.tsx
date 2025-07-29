"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, FileText, Receipt, CreditCard } from "lucide-react";
import { ExpenseWithUI } from "@/types/expense";

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
        return { bg: "bg-green-100", text: "text-green-800" };
      case "orange":
        return { bg: "bg-orange-100", text: "text-orange-800" };
      case "blue":
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case "red":
        return { bg: "bg-red-100", text: "text-red-800" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800" };
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

// Using the shared Expense type from types/expense.ts

export interface ExpenseColumnOptions {
  includeReportName?: boolean;
}

// Define the columns for the expenses table
export function getExpensesPageColumns(
  options: ExpenseColumnOptions = {}
): ColumnDef<ExpenseWithUI>[] {
  const { includeReportName = false } = options;
  return [
    {
      accessorKey: "description",
      header: "EXPENSE DETAILS",
      size: 180, // Adjusted width for compact view
      cell: ({ row }) => {
        const expense = row.original;
        const dateStr =
          expense.date instanceof Date
            ? expense.date.toISOString().split("T")[0]
            : typeof expense.date === "string"
            ? expense.date.split("T")[0]
            : "Unknown date";

        return (
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-1 text-sm ">
              <span>{dateStr}</span>
              <span>-</span>
              <span>{expense.category}</span>
            </div>
            <div className="text-sm font-medium truncate">
              {expense.description}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "merchant",
      header: "MERCHANT",
      size: 100, // Adjusted width for compact view
      cell: ({ row }) => (
        <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {row.original.merchant}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right w-full">AMOUNT</div>,
      size: 80, // Adjusted width for compact view
      cell: ({ row }) => (
        <div className="text-right w-full">
          {typeof row.original.amount === "number"
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
              }).format(row.original.amount)
            : row.original.amount}
        </div>
      ),
    },
    {
      accessorKey: "reportName",
      header: "REPORT NAME",
      size: 120, // Adjusted width for compact view
      cell: ({ row }) => (
        <div className="w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {row.original.reportName || "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-right w-full">STATUS</div>,
      size: 100, // Adjusted width for compact view
      cell: ({ row }) => (
        <div className="flex justify-end w-full">
          <StatusCell
            status={
              row.original.statusDisplay
                ? {
                    label: row.original.statusDisplay.label,
                    color: row.original.statusDisplay.color,
                  }
                : undefined
            }
          />
        </div>
      ),
    },
  ];
}

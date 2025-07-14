"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Report, getReportsColumns, getReportsPageColumns } from "./TableColumnDefs";
import { useRouter } from "next/navigation";

export type { Report } from "./TableColumnDefs";

interface ReportsTableProps {
  data: Report[];
  showPagination?: boolean;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: Report[]) => void;
  variant?: "dashboard" | "page";
  className?: string;
}

export function ReportsTable({
  data,
  showPagination = false,
  enableRowSelection = false,
  onSelectedRowsChange,
  variant = "dashboard",
  className = "",
}: ReportsTableProps) {
  const router = useRouter();

  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: Report[]) => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange(selectedRows);
      }
    },
    [onSelectedRowsChange]
  );

  const handleRowClick = React.useCallback(
    (row: Report) => {
      // Navigate to the report detail page
      router.push(`/user/reports/${row.id}`);
    },
    [router]
  );

  // Get the appropriate columns based on the variant
  const columns = React.useMemo(() => {
    return variant === "dashboard" ? getReportsColumns() : getReportsPageColumns();
  }, [variant]);

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={showPagination}
      enableRowSelection={enableRowSelection}
      onSelectedRowsChange={handleSelectedRowsChange}
      onRowClick={handleRowClick}
      className={className}
    />
  );
}

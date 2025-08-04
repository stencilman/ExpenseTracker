"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import {
  Report,
  getReportsColumns,
  getAdminReportTableColumns,
} from "./TableColumnDefs";
import { usePathname, useRouter } from "next/navigation";

export type { Report } from "./TableColumnDefs";

interface ReportsTableProps {
  data: Report[];
  showPagination?: boolean;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: Report[]) => void;
  variant?: "dashboard" | "page";
  className?: string;
  isAllRowsSelected?: boolean;
  onReportActionComplete?: (updatedReport: Report) => void;
}

export function ReportsTable({
  data,
  showPagination = false,
  enableRowSelection = false,
  onSelectedRowsChange,
  variant = "dashboard",
  className = "",
  isAllRowsSelected = false,
  onReportActionComplete,
}: ReportsTableProps) {
  // Track selected rows internally to sync with parent component
  const [selectedRows, setSelectedRows] = React.useState<Report[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: Report[]) => {
      setSelectedRows(selectedRows);
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
      if (pathname.includes("admin")) {
        router.push(`/admin/reports/${row.id}`);
      } else {
        router.push(`/user/reports/${row.id}`);
      }
    },
    [router]
  );

  // Get the appropriate columns based on the variant
  const columns = React.useMemo(() => {
    if (pathname.includes("admin")) {
      return getAdminReportTableColumns(onReportActionComplete);
    }
    return getReportsColumns();
  }, [variant, pathname, onReportActionComplete]);

  // Effect to update internal state when external selection changes
  React.useEffect(() => {
    if (isAllRowsSelected) {
      setSelectedRows([...data]);
    } else if (isAllRowsSelected === false) { // Explicitly check for false
      setSelectedRows([]);
    }
  }, [isAllRowsSelected, data]);

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={showPagination}
      enableRowSelection={enableRowSelection}
      onSelectedRowsChange={handleSelectedRowsChange}
      onRowClick={handleRowClick}
      className={className}
      isAllRowsSelected={isAllRowsSelected}
      selectedRows={selectedRows}
    />
  );
}

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
  onRowClick?: (reportId: string) => void;
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
  onRowClick,
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
      // If custom onRowClick is provided, use that
      if (onRowClick) {
        onRowClick(row.id);
        return;
      }

      // Otherwise use default navigation
      if (pathname.includes("/admin/my-reports")) {
        router.push(`/admin/my-reports/${row.id}`);
      } else if (pathname.includes("/admin/reports")) {
        router.push(`/admin/reports/${row.id}`);
      } else {
        router.push(`/user/reports/${row.id}`);
      }
    },
    [router, pathname, onRowClick]
  );

  // Use the same columns for both admin and user reports
  const columns = React.useMemo(() => {
    const includeSubmitter =
      pathname.includes("/admin/reports") &&
      !pathname.includes("/admin/my-reports");

    return getReportsColumns({
      includeSubmitter,
      onRowClick: handleRowClick, // Pass the row click handler to the columns
    });
  }, [pathname, handleRowClick]);

  // Effect to update internal state when external selection changes
  React.useEffect(() => {
    if (isAllRowsSelected) {
      setSelectedRows([...data]);
    } else if (isAllRowsSelected === false) {
      // Explicitly check for false
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
      onRowClick={undefined}
      className={className}
      isAllRowsSelected={isAllRowsSelected}
      selectedRows={selectedRows}
    />
  );
}

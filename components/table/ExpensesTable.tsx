"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Expense, getExpensesPageColumns } from "./TableColumnDefs";

export type { Expense } from "./TableColumnDefs";

interface ExpensesTableProps {
  data: Expense[];
  showPagination?: boolean;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: Expense[]) => void;
  className?: string;
}

export function ExpensesTable({
  data,
  showPagination = false,
  enableRowSelection = false,
  onSelectedRowsChange,
  className = "",
}: ExpensesTableProps) {
  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: Expense[]) => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange(selectedRows);
      }
    },
    [onSelectedRowsChange]
  );

  const columns = React.useMemo(() => {
    return getExpensesPageColumns();
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
      showPagination={showPagination}
      enableRowSelection={enableRowSelection}
      onSelectedRowsChange={handleSelectedRowsChange}
      className={className}
    />
  );
}

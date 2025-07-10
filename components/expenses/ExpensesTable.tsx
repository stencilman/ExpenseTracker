"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../table/DataTable";
import { Expense, getExpensesPageColumns } from "../table/TableColumnDefs";
import ExpenseDetail from "./ExpenseDetail";

export type { Expense } from "../table/TableColumnDefs";

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
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(
    null
  );
  const [detailOpen, setDetailOpen] = React.useState(false);

  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: Expense[]) => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange(selectedRows);
      }
    },
    [onSelectedRowsChange]
  );

  // Custom column definition with click handler for expense details
  const columns = React.useMemo(() => {
    const baseColumns = getExpensesPageColumns();

    // Modify the expense details column to make it clickable
    const enhancedColumns = baseColumns.map((column) => {
      if ("accessorKey" in column && column.accessorKey === "expenseDetails") {
        return {
          ...column,
          cell: ({ row }: { row: any }) => (
            <div
              className="w-full cursor-pointer hover:text-primary hover:underline"
              onClick={() => {
                setSelectedExpense(row.original);
                setDetailOpen(true);
              }}
            >
              {row.original.expenseDetails}
            </div>
          ),
        };
      }
      return column;
    });

    return enhancedColumns;
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        showPagination={showPagination}
        enableRowSelection={enableRowSelection}
        onSelectedRowsChange={handleSelectedRowsChange}
        className={className}
      />

      {selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}

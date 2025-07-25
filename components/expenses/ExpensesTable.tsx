"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../table/DataTable";
import { getExpensesPageColumns } from "../table/TableColumnDefs";
import { ExpenseWithUI } from "@/types/expense";
import ExpenseDetail from "./ExpenseDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ExpensesTableProps {
  data: ExpenseWithUI[];
  showPagination?: boolean;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (selectedRows: string[]) => void;
  onRowClick?: (expenseId: string) => void;
  className?: string;
}

export function ExpensesTable({
  data,
  showPagination = false,
  enableRowSelection = false,
  onSelectedRowsChange,
  onRowClick,
  className = "",
}: ExpensesTableProps) {
  const [selectedExpense, setSelectedExpense] = React.useState<ExpenseWithUI | null>(
    null
  );
  const [detailOpen, setDetailOpen] = React.useState(false);

  const handleSelectedRowsChange = React.useCallback(
    (selectedRows: ExpenseWithUI[]) => {
      if (onSelectedRowsChange) {
        onSelectedRowsChange(selectedRows.map((row) => row.id.toString()));
      }
    },
    [onSelectedRowsChange]
  );

  // Custom column definition with click handler for expense details
  const columns = React.useMemo(() => {
    const baseColumns = getExpensesPageColumns();

    // Modify the description column to make it clickable
    const enhancedColumns = baseColumns.map((column) => {
      if ("accessorKey" in column && column.accessorKey === "description") {
        return {
          ...column,
          cell: ({ row }: { row: any }) => (
            <div
              className="w-full cursor-pointer hover:text-primary hover:underline"
              onClick={() => {
                if (onRowClick) {
                  onRowClick(row.original.id);
                } else {
                  setSelectedExpense(row.original);
                  setDetailOpen(true);
                }
              }}
            >
              {row.original.description}
            </div>
          ),
        };
      }
      return column;
    });

    return enhancedColumns;
  }, [onRowClick]);

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

      {selectedExpense && detailOpen && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent>
            <ExpenseDetail
              expense={selectedExpense}
              onClose={() => setDetailOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

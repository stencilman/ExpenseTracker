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

  // Use the base columns directly since row click is now handled at the table level
  const columns = React.useMemo(() => {
    return getExpensesPageColumns();
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        showPagination={showPagination}
        enableRowSelection={enableRowSelection}
        onSelectedRowsChange={handleSelectedRowsChange}
        onRowClick={(row) => {
          if (onRowClick) {
            onRowClick(row.id.toString());
          } else {
            setSelectedExpense(row);
            setDetailOpen(true);
          }
        }}
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

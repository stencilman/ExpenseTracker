"use client";
import { useLoading } from "@/components/providers/loading-provider";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useExpenses } from "@/components/expenses/ExpensesContext";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Button } from "@/components/ui/button";
import { ExpensesFilter } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort } from "@/components/expenses/ExpensesSort";
import AddNewExpense from "@/components/expenses/AddNewExpense";

interface AllExpensesTableViewProps {
  compact?: boolean;
}

export default function AllExpensesTableView({
  compact = false,
}: AllExpensesTableViewProps) {
  const router = useRouter();
  const { stopLoading } = useLoading();
  const {
    processedAllExpenses,
    setFilters,
    setSort,
    categories,
    merchants,
    statuses,
    isAddExpenseOpen,
    setIsAddExpenseOpen,
  } = useExpenses();

  // Use a local state for selected expenses IDs
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Handle row click to navigate to expense detail
  const handleRowClick = (expenseId: string) => {
    router.push(`/user/expenses/all/${expenseId}`);
  };

  useEffect(() => {
    if (!compact) {
      stopLoading();
    }
  }, [stopLoading, compact]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <div className="flex space-x-2">
          <ExpensesFilter
            onFilterChange={setFilters}
            categories={categories}
            merchants={merchants}
            statuses={statuses}
          />
          <ExpensesSort onSortChange={setSort} />
          {!compact && (
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              Add Expense
            </Button>
          )}
        </div>
      </div>
      <ExpensesTable
        data={processedAllExpenses}
        onSelectedRowsChange={setSelectedExpenseIds}
        onRowClick={handleRowClick}
        enableRowSelection={true}
        showPagination={true}
      />
      {isAddExpenseOpen && (
        <AddNewExpense
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}
    </div>
  );
}

"use client";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenseRoutes } from "@/components/expenses/ExpenseRouteHelper";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Button } from "@/components/ui/button";
import { ExpensesFilter } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort } from "@/components/expenses/ExpensesSort";
import AddOrEditExpense from "@/components/expenses/AddOrEditExpense";
import { Loader } from "@/components/ui/loader";

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
    isLoading,
  } = useExpenses();

  // Use a local state for selected expenses IDs
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Use the expense route helper to get the correct route
  const { getExpenseDetailRoute } = useExpenseRoutes();

  // Handle row click to navigate to expense detail
  const handleRowClick = (expenseId: string) => {
    router.push(getExpenseDetailRoute(expenseId));
  };

  // Only stop loading from the LoadingProvider when we're done with our data loading
  // The isLoading state from useExpenses will handle the component-level loading state
  useEffect(() => {
    if (!compact && !isLoading) {
      stopLoading();
    }
  }, [stopLoading, compact, isLoading]);

  return (
    <div className="space-y-4 ">
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
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="lg" text="Loading expenses..." />
        </div>
      ) : (
        <ExpensesTable
          data={processedAllExpenses}
          onSelectedRowsChange={setSelectedExpenseIds}
          onRowClick={handleRowClick}
          enableRowSelection={true}
          showPagination={true}
        />
      )}
      {isAddExpenseOpen && (
        <AddOrEditExpense
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            // Refresh the expenses list after closing the dialog
            // This will ensure newly created expenses are displayed
            router.refresh();
          }}
          mode="add"
        />
      )}
    </div>
  );
}

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
import { Loader } from "@/components/ui/loader";
import { ExpenseWithUI } from "@/types/expense";
import AddOrEditExpense from "@/components/expenses/AddOrEditExpense";

interface ReportedExpensesTableProps {
  compact?: boolean;
}

export default function ReportedExpensesTable({
  compact = false,
}: ReportedExpensesTableProps) {
  const router = useRouter();
  const { stopLoading } = useLoading();
  const {
    allExpenses,
    setFilters,
    setSort,
    categories,
    merchants,
    statuses,
    isLoading,
  } = useExpenses();

  // Filter for reported expenses (those with a reportId/reportName)
  const reportedExpenses = allExpenses.filter(
    (expense: ExpenseWithUI) => expense.reportId && expense.reportName
  );

  // Row selection is disabled for admin
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-end items-center">
          <div className="flex space-x-2">
            <ExpensesFilter
              categories={categories}
              merchants={merchants}
              statuses={statuses}
              onFilterChange={setFilters}
            />
            <ExpensesSort onSortChange={setSort} />
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              Add Expense
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" text="Loading expenses..." />
        </div>
      ) : (
        <ExpensesTable
          data={reportedExpenses}
          onRowClick={handleRowClick}
          enableRowSelection={false}
          showPagination={true}
        />
      )}
      
      {isAddExpenseOpen && (
        <AddOrEditExpense
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            // Refresh the expenses list after closing the dialog
            router.refresh();
          }}
          mode="add"
        />
      )}
    </div>
  );
}

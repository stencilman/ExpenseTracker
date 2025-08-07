"use client";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Button } from "@/components/ui/button";
import { ExpensesFilter } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort } from "@/components/expenses/ExpensesSort";
import { Loader } from "@/components/ui/loader";
import { ExpenseWithUI } from "@/types/expense";

interface ReportedExpensesViewProps {
  compact?: boolean;
}

export default function ReportedExpensesView({
  compact = false,
}: ReportedExpensesViewProps) {
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

  // Use a local state for selected expenses IDs
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Handle row click to navigate to expense detail
  const handleRowClick = (expenseId: string) => {
    router.push(`/user/expenses/reported/${expenseId}`);
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
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <ExpensesFilter
              categories={categories}
              merchants={merchants}
              statuses={statuses}
              onFilterChange={setFilters}
            />
            <ExpensesSort onSortChange={setSort} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : reportedExpenses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No reported expenses found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Expenses that have been added to reports will appear here
          </p>
        </div>
      ) : (
        <ExpensesTable
          data={reportedExpenses}
          onSelectedRowsChange={setSelectedExpenseIds}
          onRowClick={handleRowClick}
          enableRowSelection={true}
          showPagination={true}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Button } from "@/components/ui/button";
import { ExpensesFilter } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort } from "@/components/expenses/ExpensesSort";
import UnreportedExpenseCard from "@/components/expenses/UnreportedExpenseCard";
import AddOrEditExpense from "@/components/expenses/AddOrEditExpense";
import { DropZone } from "@/components/ui/drop-zone";
import { cn } from "@/lib/utils";

interface UnreportedExpensesViewProps {
  compact?: boolean;
}

export default function UnreportedExpensesView({
  compact = false,
}: UnreportedExpensesViewProps) {
  const router = useRouter();
  const { stopLoading } = useLoading();
  const {
    processedUnreportedExpenses,
    setFilters,
    setSort,
    categories,
    merchants,
    statuses,
    isAddExpenseOpen,
    setIsAddExpenseOpen,
  } = useExpenses();

  // Handle card click to navigate to expense detail
  const handleCardClick = (id: string | number) => {
    router.push(`/user/expenses/unreported/${id}`);
  };

  useEffect(() => {
    if (!compact) {
      stopLoading();
    }
  }, [stopLoading, compact]);

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-end items-center">
          <div className="flex space-x-2">
            <ExpensesFilter
              onFilterChange={setFilters}
              categories={categories}
              merchants={merchants}
              statuses={statuses}
            />
            <ExpensesSort onSortChange={setSort} />
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              Add Expense
            </Button>
          </div>
        </div>
      )}

      {!compact && (
        <DropZone
          size="sm"
          title="Drag and drop receipts here to get started"
          onFilesDrop={(files) => {
            console.log(files);
          }}
        />
      )}

      <div
        className={cn(
          "flex flex-col overflow-y-auto ",
          compact && "h-[calc(100vh-10rem)]"
        )}
      >
        {processedUnreportedExpenses.map((expense) => (
          <UnreportedExpenseCard
            key={expense.id}
            expense={expense}
            onClick={() => handleCardClick(expense.id)}
            compact={compact}
          />
        ))}

        {processedUnreportedExpenses.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-gray-500">No unreported expenses found</p>
          </div>
        )}
      </div>

      {isAddExpenseOpen && (
        <AddOrEditExpense
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          mode="add"
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Button } from "@/components/ui/button";
import { ExpensesFilter } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort } from "@/components/expenses/ExpensesSort";
import UnreportedExpenseCard from "@/components/expenses/UnreportedExpenseCard";
import AddOrEditExpense from "@/components/expenses/AddOrEditExpense";
import { AddToReportDialog } from "@/components/expenses/AddToReportDialog";
import { DeleteExpenseDialog } from "@/components/expenses/DeleteExpenseDialog";
import { DropZone } from "@/components/ui/drop-zone";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { ExpenseWithUI } from "@/types/expense";
import { toast } from "sonner";

interface UnreportedExpensesViewProps {
  compact?: boolean;
}

export default function UnreportedExpensesView({
  compact = false,
}: UnreportedExpensesViewProps) {
  const router = useRouter();
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<
    Set<number | string>
  >(new Set());
  const [isBulkAddToReportOpen, setIsBulkAddToReportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    isLoading,
  } = useExpenses();

  // Handle card click to navigate to expense detail
  const handleCardClick = (id: string | number) => {
    router.push(`/user/expenses/unreported/${id}`);
  };

  // Handle checkbox selection
  const handleExpenseSelect = (id: string | number, isSelected: boolean) => {
    setSelectedExpenses((prev) => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  };

  // Check if an expense is selected
  const isExpenseSelected = (id: string | number) => {
    return selectedExpenses.has(id);
  };

  // Handle bulk add to report
  const handleBulkAddToReport = () => {
    if (selectedExpenses.size > 0) {
      setIsBulkAddToReportOpen(true);
    }
  };

  // Handle bulk delete expenses
  const handleBulkDelete = () => {
    if (selectedExpenses.size === 0) return;
    setIsDeleteDialogOpen(true);
  };

  // Handle successful bulk deletion
  const handleDeleteSuccess = () => {
    // Clear selected expenses
    setSelectedExpenses(new Set());

    // Refresh the page to update the list
    router.refresh();
  };

  // Handle select all expenses
  const handleSelectAll = () => {
    const allIds = new Set<string | number>();
    processedUnreportedExpenses.forEach((expense) => {
      allIds.add(expense.id);
    });
    setSelectedExpenses(allIds);
  };

  // Only stop loading from the LoadingProvider when we're done with our data loading
  // The isLoading state from useExpenses will handle the component-level loading state
  useEffect(() => {
    if (!compact && !isLoading) {
      stopLoading();
    }
  }, [stopLoading, compact, isLoading]);

  // Reset selected expenses when bulk add dialog closes
  useEffect(() => {
    if (!isBulkAddToReportOpen) {
      // Only reset if the dialog was previously open and is now closed
      setSelectedExpenses(new Set());
    }
  }, [isBulkAddToReportOpen]);

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
            // Save the dropped files and open the Add Expense drawer
            setDroppedFiles(files);
            setIsAddExpenseOpen(true);
          }}
          dragActive={false}
          // Custom drag handler to open drawer on hover
          {...{
            onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              // Open the Add Expense drawer when files are hovered
              setIsAddExpenseOpen(true);
            },
          }}
        />
      )}

      {selectedExpenses.size > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {selectedExpenses.size} expense
            {selectedExpenses.size !== 1 ? "s" : ""} selected
          </span>
          <Button
            onClick={() => setSelectedExpenses(new Set())}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
          <Button
            onClick={handleBulkAddToReport}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            Add To Report
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Delete Expenses
          </Button>
        </div>
      )}
      {selectedExpenses.size === 0 &&
        processedUnreportedExpenses.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSelectAll}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              Select All
            </Button>
          </div>
        )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size="lg" text="Loading expenses..." />
        </div>
      ) : (
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
              isSelected={isExpenseSelected(expense.id)}
              onSelectChange={handleExpenseSelect}
            />
          ))}

          {processedUnreportedExpenses.length === 0 && (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-gray-500">No unreported expenses found</p>
            </div>
          )}
        </div>
      )}

      {isAddExpenseOpen && (
        <AddOrEditExpense
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setDroppedFiles([]); // Clear dropped files when closing
            // Refresh the expenses list after closing the dialog
            // This will ensure newly created expenses are displayed
            router.refresh();
          }}
          mode="add"
          initialFiles={droppedFiles}
        />
      )}

      {/* Bulk Add to Report Dialog */}
      <AddToReportDialog
        expenseIds={Array.from(selectedExpenses)}
        isOpen={isBulkAddToReportOpen}
        onClose={() => setIsBulkAddToReportOpen(false)}
      />

      {/* Bulk Delete Dialog */}
      <DeleteExpenseDialog
        expenseIds={Array.from(selectedExpenses)}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText } from "lucide-react";
import { AddToReportDialog } from "./AddToReportDialog";

// Mock Expense type for demonstration
import { ExpenseWithUI, formatExpenseForDisplay } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";

interface UnreportedExpenseCardProps {
  expense: ExpenseWithUI;
  onClick?: () => void;
  compact?: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string | number, isSelected: boolean) => void;
}

export default function UnreportedExpenseCard({
  expense,
  onClick,
  compact = false,
  isSelected = false,
  onSelectChange,
}: UnreportedExpenseCardProps) {
  // State for Add To Report dialog
  const [isAddToReportOpen, setIsAddToReportOpen] = useState(false);

  // Format date helper function
  const formatDate = (dateValue: string | Date) => {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle checkbox click without triggering card navigation
  const handleCheckboxClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent the card onClick from firing
    e.stopPropagation();

    // Call the onSelectChange handler if provided
    if (onSelectChange) {
      onSelectChange(expense.id, !isSelected);
    }
  };

  // Handle card click - always navigate to expense detail
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Handle Add To Report button click
  const handleAddToReportClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsAddToReportOpen(true);
  };

  return (
    <>
      <Card
        className="mb-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className={`${compact ? "p-2" : "p-4"} flex items-center`}>
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            {/* Checkbox */}
            <div className="flex-shrink-0" onClick={handleCheckboxClick}>
              <Checkbox
                id={`expense-${expense.id}`}
                checked={isSelected}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div
                className={`${
                  compact ? "w-8 h-8" : "w-10 h-10"
                } bg-red-500 rounded flex items-center justify-center`}
              >
                <FileText
                  className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-white`}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {compact ? (
                // --- COMPACT VIEW ---
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-4 gap-y-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {expense.merchant || "Unknown Merchant"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(expense.date)}
                      {expense.description ? ` • ${expense.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 h-7 ml-4 sm:hidden" // Only show on mobile for compact view
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToReportClick(e);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                // --- FULL (NON-COMPACT) VIEW ---
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {/* Left Side: Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {expense.merchant || "Unknown Merchant"}
                    </p>
                    <p className="text-sm text-blue-600 truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 sm:hidden">
                      {formatDate(expense.date)}
                    </p>
                  </div>

                  {/* Right Side: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        variant="blue-outline"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToReportClick(e);
                        }}
                      >
                        Add To Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddToReportDialog
        isOpen={isAddToReportOpen}
        onClose={() => setIsAddToReportOpen(false)}
        expenseId={expense.id}
      />
    </>
  );
}

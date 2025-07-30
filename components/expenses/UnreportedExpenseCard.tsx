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
        className={`mb-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-24`}
        onClick={handleCardClick}
      >
        <CardContent
          className={`${compact ? "p-2" : "p-4"} flex items-center h-full`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            <div className="flex-shrink-0" onClick={handleCheckboxClick}>
              <Checkbox
                id={`expense-${expense.id}`}
                checked={isSelected}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>

            <div className="flex-shrink-0">
              <div
                className={`${
                  compact ? "w-6 h-6" : "w-8 h-8 sm:w-10 sm:h-10"
                } bg-red-500 rounded flex items-center justify-center`}
              >
                <FileText
                  className={`${
                    compact ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5"
                  } text-white`}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className={`block ${!compact ? "sm:hidden" : ""}`}>
                {!compact ? (
                  <>
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="text-xs text-gray-500">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {expense.merchant || "Unknown Merchant"}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-blue-600 font-medium">
                        {expense.description}
                      </span>
                      <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">?</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50"
                        >
                          Add To Report
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="text-xs text-gray-500">
                            {formatDate(expense.date)}
                          </div>
                          <div className="text-xs text-blue-600 font-medium truncate max-w-[120px]">
                            {expense.merchant || "Unknown Merchant"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="font-bold text-sm text-gray-900 mr-2">
                        {formatCurrency(expense.amount)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-1.5 py-0 h-6 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        onClick={handleAddToReportClick}
                      >
                        Add To Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`hidden ${!compact ? "sm:block" : ""}`}>
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(expense.date)}
                      </span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-xs text-gray-500 truncate">
                        {expense.merchant || "Unknown Merchant"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 font-medium">
                        {expense.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm px-3 py-1 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        onClick={handleAddToReportClick}
                      >
                        Add To Report
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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

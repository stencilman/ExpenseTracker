import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText } from "lucide-react";

// Mock Expense type for demonstration
interface Expense {
  id: string;
  date: string;
  merchant: string;
  expenseDetails: string;
  category: string;
  amount: string;
  status?: {
    label: string;
    color: string;
  };
  reportName?: string;
}

interface UnreportedExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
  compact?: boolean;
}

export default function UnreportedExpenseCard({
  expense,
  onClick,
  compact = false,
}: UnreportedExpenseCardProps) {
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Mock expense data for demonstration
  const mockExpense: Expense = {
    id: "1",
    date: "2025-07-01",
    merchant: "TUSKER WORKSPACE PRIVATE LIMITED",
    expenseDetails: "IT and Internet Expenses",
    category: "IT and Internet Expenses",
    amount: "944.00",
    status: {
      label: "Verified",
      color: "green",
    },
  };

  const displayExpense = expense || mockExpense;

  return (
    <Card 
      className={`mb-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${compact ? 'compact-card' : ''}`}
      onClick={onClick}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <Checkbox
              id={`expense-${displayExpense.id}`}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>

          {/* PDF Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded flex items-center justify-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Layout - Stacked */}
            <div className={`block ${!compact ? 'sm:hidden' : ''}`}>
              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs text-gray-500">
                    {formatDate(displayExpense.date)}
                  </span>
                </div>
                <div className="font-medium text-gray-900 text-sm truncate">
                  {displayExpense.merchant}
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-blue-600 font-medium">
                  {displayExpense.expenseDetails}
                </span>
                {!compact && (
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-bold">?</span>
                  </div>
                )}
              </div>

              {/* Amount and Actions - Mobile */}
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg text-gray-900">
                  {displayExpense.amount}
                </div>
                {!compact && (
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
                )}
                {compact && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                  >
                    Add To Report
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop/Tablet Layout - Side by Side */}
            <div className={`hidden ${!compact ? 'sm:block' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-500">
                      {formatDate(displayExpense.date)}
                    </span>
                    <span className="font-medium text-gray-900 truncate">
                      {displayExpense.merchant}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {displayExpense.expenseDetails}
                    </span>
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">?</span>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions - Desktop */}
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {displayExpense.amount}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm px-3 py-1 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
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
  );
}

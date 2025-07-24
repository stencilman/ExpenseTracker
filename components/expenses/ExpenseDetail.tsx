"use client";

import * as React from "react";
import { Expense } from "@/components/table/TableColumnDefs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileIcon, ChevronRight, Download, Trash2, X } from "lucide-react";

interface ExpenseDetailProps {
  expense: Expense;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export default function ExpenseDetail({
  expense,
  trigger,
  open,
  onOpenChange,
  onClose,
}: ExpenseDetailProps) {
  // Content to be rendered in both dialog and page modes
  const expenseDetailContent = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* What's next section for unreported expenses */}
      {!expense.reportName && (
        <div className="bg-white border rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-full flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">What's next</h3>
              <p className="text-sm text-gray-600">
                Add this expense to a report and submit it to claim
                reimbursement.
              </p>
            </div>
          </div>
          <Button className="flex-shrink-0">Add To Report</Button>
        </div>
      )}

      {/* Main content */}

      <div className="flex flex-col md:flex-row h-full max-w-full">
        {/* Left side - PDF preview */}
        <div className="w-full md:w-1/3 bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r min-w-0">
          <div className="bg-red-500 text-white p-3 md:p-4 rounded-lg mb-3 md:mb-4">
            <FileIcon size={36} className="md:h-12 md:w-12" />
          </div>
          <div className="flex space-x-2 mt-2 md:mt-4">
            <Button variant="ghost" size="icon">
              <Download size={16} className="md:h-[18px] md:w-[18px]" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 size={16} className="md:h-[18px] md:w-[18px]" />
            </Button>
          </div>
        </div>

        {/* Right side - Expense details */}
        <div className="w-full md:w-2/3 p-4 md:p-6 min-w-0 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>
                  {new Date(expense.date).toISOString().split("T")[0]}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-semibold mt-1 md:mt-2">
                {expense.expenseDetails}
              </h2>
              <div className="text-sm text-muted-foreground mt-1">
                Merchant: {expense.merchant}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                {expense.reportName ? "REPORTED" : "UNREPORTED"}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground mr-1">
                  REIMBURSABLE
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold">
                {expense.amount}
              </div>
            </div>
          </div>

          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="mt-1">{expense.expenseDetails || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Policy
                </h3>
                <p className="mt-1">{expense.category} Policy</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Category
                </h3>
                <p className="mt-1">{expense.category}</p>
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <div className="text-center py-8 text-muted-foreground">
                No comments yet
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-center py-8 text-muted-foreground">
                No history available
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );

  // Render in page mode
  return (
    <div className="p-4 h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden w-full">
      {expenseDetailContent}
    </div>
  );
}

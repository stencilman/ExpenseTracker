"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Expense, ExpenseWithUI } from "@/types/expense";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";
import { useExpenses } from "../providers/ExpenseProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  ChevronRight,
  Download,
  Trash2,
  X,
  Edit,
  AlertCircle,
} from "lucide-react";
import AddOrEditExpense from "./AddOrEditExpense";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Extended expense interface to handle API data
interface ExtendedExpense extends ExpenseWithUI {
  apiData?: Expense;
}

interface ExpenseDetailProps {
  expense: ExtendedExpense;
  onClose: () => void;
}

// Helper function to get status classes based on expense status
const getStatusClasses = (expense: ExtendedExpense): string => {
  // If we have statusDisplay with color
  if (expense.statusDisplay?.color) {
    switch (expense.statusDisplay.color) {
      case "green":
        return "bg-green-100 text-green-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  }

  // If we have apiData with status
  if (expense.apiData?.status) {
    switch (expense.apiData.status) {
      case ExpenseStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case ExpenseStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case ExpenseStatus.REPORTED:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  }

  // Default based on reportName
  return expense.reportName
    ? "bg-orange-100 text-orange-800"
    : "bg-blue-100 text-blue-800";
};

// Helper function to get status label based on expense status
const getStatusLabel = (expense: ExtendedExpense): string => {
  // If we have statusDisplay with label
  if (expense.statusDisplay?.label) {
    return expense.statusDisplay.label;
  }

  // If we have apiData with status
  if (expense.apiData?.status) {
    return expense.apiData.status;
  }

  // Default based on reportName
  return expense.reportName ? "REPORTED" : "UNREPORTED";
};

export default function ExpenseDetail({
  expense,
  onClose,
}: ExpenseDetailProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteExpense } = useExpenses();

  // Handle delete expense
  const handleDelete = async () => {
    try {
      // Extract the ID from the expense
      const expenseId = expense.apiData?.id || expense.id;
      // Convert to string if needed by the deleteExpense function
      const expenseIdString = String(expenseId);
      await deleteExpense(expenseIdString);
      toast.success("Expense deleted successfully");
      router.push("/user/expenses/all");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Content to be rendered
  return (
    <>
      {/* Edit Expense Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Edit Expense</DialogTitle>
          {isEditOpen && (
            <AddOrEditExpense
              expense={expense}
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4 h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
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
            </div>
          </div>

          {/* Right side - Expense details */}
          <div className="w-full md:w-2/3 p-4 md:p-6 min-w-0 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>
                    {expense.apiData
                      ? new Date(expense.apiData.date)
                          .toISOString()
                          .split("T")[0]
                      : new Date(expense.date).toISOString().split("T")[0]}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-semibold mt-1 md:mt-2">
                  {expense.apiData?.description ||
                    expense.description ||
                    expense.category ||
                    "Expense Details"}
                </h2>
                <div className="text-sm text-muted-foreground mt-1">
                  Merchant:{" "}
                  {expense.apiData?.notes || expense.merchant || "Unknown"}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div
                  className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusClasses(
                    expense
                  )}`}
                >
                  {getStatusLabel(expense)}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground mr-1">
                    REIMBURSABLE
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-bold">
                  ₹{" "}
                  {expense.amount ||
                    (expense.apiData
                      ? `Rs.${expense.apiData.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "0.00")}
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
                  <p className="mt-1">
                    {expense.apiData?.description || expense.description || "-"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h3>
                  <p className="mt-1">
                    {expense.apiData
                      ? expense.apiData.category
                      : expense.category}
                  </p>
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
      </div>
    </>
  );
}

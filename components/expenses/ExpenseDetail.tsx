"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Expense, ExpenseWithUI } from "@/types/expense";
import {
  ExpenseCategory,
  ExpenseStatus,
  ExpenseEventType,
} from "@prisma/client";
import { useExpenses } from "../providers/ExpenseProvider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddToReportDialog } from "./AddToReportDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Loader } from "@/components/ui/loader";
import {
  FileIcon,
  ChevronRight,
  Download,
  Trash2,
  X,
  Edit,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  Loader2,
  ChevronsUpDown,
} from "lucide-react";
import { format } from "date-fns";
import AddOrEditExpense from "./AddOrEditExpense";
import HistoryItemCard from "./HistoryItemCard";
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

interface ExpenseDetailProps {
  expense: ExpenseWithUI;
  onClose: () => void;
}

// History event interface
interface ExpenseHistoryEvent {
  id: number;
  eventType: ExpenseEventType;
  eventDate: string;
  details?: string;
  performedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  report?: {
    id: number;
    title: string;
    status: string;
  } | null;
}

interface ExpenseHistoryResponse {
  expense: {
    id: number;
    description?: string;
    amount: number;
    date: string;
    status: ExpenseStatus;
  };
  history: ExpenseHistoryEvent[];
}

// Helper function to get status classes based on expense status
const getStatusClasses = (expense: ExpenseWithUI): string => {
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
  if (expense.status) {
    switch (expense.status) {
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
const getStatusLabel = (expense: ExpenseWithUI): string => {
  // If we have statusDisplay with label
  if (expense.statusDisplay?.label) {
    return expense.statusDisplay.label;
  }

  // If we have apiData with status
  if (expense.status) {
    return expense.status;
  }

  // Default based on reportName
  return expense.reportName ? "REPORTED" : "UNREPORTED";
};

export default function ExpenseDetail({
  expense,
  onClose,
}: ExpenseDetailProps) {
  // States for component
  const router = useRouter();
  const { deleteExpense, updateExpense } = useExpenses();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [historyData, setHistoryData] = useState<ExpenseHistoryEvent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(
    expense.receiptUrls && expense.receiptUrls.length > 0
      ? expense.receiptUrls[0]
      : null
  );
  const [isAddToReportOpen, setIsAddToReportOpen] = useState(false);

  // Helper function to check if a URL is a PDF
  const isPdfUrl = (url: string): boolean => {
    if (!url) return false;

    // Check if the URL path ends with .pdf (case insensitive)
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const filename = pathParts[pathParts.length - 1];
      return filename.toLowerCase().endsWith(".pdf");
    } catch (error) {
      // If URL parsing fails, check the raw string
      return url.toLowerCase().includes(".pdf");
    }
  };

  // Helper function to ensure we're using the proxy URL format
  const getProperReceiptUrl = (url: string | null | undefined): string => {
    // If URL is null or undefined, return empty string
    if (!url) {
      return "";
    }

    // If it's already a proxy URL, return it as is
    if (url.startsWith("/api/files/")) {
      return url;
    }

    // If it's an S3 URL, extract the key and convert to proxy URL
    if (url.includes("amazonaws.com")) {
      try {
        // Extract the key from the S3 URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        const key = pathParts[pathParts.length - 1]; // Get the filename

        // Return the proxy URL
        return `/api/files/${encodeURIComponent(key)}`;
      } catch (error) {
        console.error("Error parsing S3 URL:", error);
        return url; // Return original URL if parsing fails
      }
    }

    // For any other URL format, return as is
    return url;
  };

  // Fetch expense history when the history tab is selected
  const fetchExpenseHistory = async (expenseId: number) => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/history`);

      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.statusText}`);
      }

      const data: ExpenseHistoryResponse = await response.json();
      setHistoryData(data.history);
    } catch (error) {
      console.error("Failed to fetch expense history:", error);
      setHistoryError("Failed to load expense history. Please try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle tab change to fetch history data when needed
  const handleTabChange = (value: string) => {
    if (value === "history" && historyData.length === 0 && !isLoadingHistory) {
      const expenseId = expense.id;
      fetchExpenseHistory(expenseId);
    }
  };

  // Handle delete expense
  const handleDelete = async () => {
    try {
      // Extract the ID from the expense
      const expenseId = expense.id;
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

      {/* Add to Report Dialog */}
      <AddToReportDialog
        expenseId={expense.id}
        isOpen={isAddToReportOpen}
        onClose={() => {
          setIsAddToReportOpen(false);
          onClose(); // Also close the main detail panel on success
        }}
      />

      {/* File Preview Dialog */}
      <Dialog open={isFilePreviewOpen} onOpenChange={setIsFilePreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
            {selectedReceiptUrl && isPdfUrl(selectedReceiptUrl) ? (
              <iframe
                src={`${getProperReceiptUrl(selectedReceiptUrl)}#toolbar=0`}
                className="w-full h-[70vh]"
                title="PDF Receipt"
              />
            ) : selectedReceiptUrl ? (
              <img
                src={getProperReceiptUrl(selectedReceiptUrl)}
                alt="Receipt"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center text-gray-500">
                <FileIcon size={64} className="mx-auto mb-4" />
                <p>No receipt available</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {selectedReceiptUrl && (
              <Button asChild>
                <a
                  href={getProperReceiptUrl(selectedReceiptUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in New Tab
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsFilePreviewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>



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
        {expense.status === ExpenseStatus.UNREPORTED && (
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
            <Button
              className="flex-shrink-0"
              onClick={() => setIsAddToReportOpen(true)}
            >
              Add To Report
            </Button>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col md:flex-row h-full max-w-full">
          {/* Left side - Receipt preview */}
          <div className="w-full md:w-1/3 bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r min-w-0">
            {expense.receiptUrls && expense.receiptUrls.length > 0 ? (
              <>
                <h3 className="text-sm font-medium mb-3">
                  Receipts ({expense.receiptUrls.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {expense.receiptUrls.map((url, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:opacity-90 transition-opacity border rounded-lg p-2 flex flex-col items-center"
                      onClick={() => {
                        setSelectedReceiptUrl(url);
                        setIsFilePreviewOpen(true);
                      }}
                    >
                      <>
                        {/* Top half: Preview (image or PDF icon) */}
                        <div className="h-20 w-full rounded-lg overflow-hidden flex items-center justify-center mb-1">
                          {isPdfUrl(url) ? (
                            <div className="bg-red-500 text-white h-full w-full flex items-center justify-center">
                              <FileText size={32} />
                            </div>
                          ) : (
                            <img
                              src={getProperReceiptUrl(url)}
                              alt={`Receipt ${index + 1}`}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                console.error("Image failed to load:", e);
                                e.currentTarget.onerror = null; // Prevent infinite loop
                                e.currentTarget.style.display = "none";
                                // Show error message
                                const errorDiv = document.createElement("div");
                                errorDiv.className =
                                  "text-red-500 text-xs mt-1";
                                errorDiv.textContent = "Failed to load image";
                                e.currentTarget.parentNode?.appendChild(
                                  errorDiv
                                );
                              }}
                            />
                          )}
                        </div>
                        {/* Bottom half: Caption */}
                        <span className="text-xs mt-1 text-center w-full">
                          Receipt #{index + 1}
                        </span>
                      </>
                      <div className="flex space-x-1 mt-1 w-full justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          asChild
                        >
                          <a
                            href={getProperReceiptUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={12} />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceiptUrl(url);
                            setIsFilePreviewOpen(true);
                          }}
                        >
                          <FileText size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-gray-200 text-gray-500 p-3 md:p-4 rounded-lg mb-3 md:mb-4">
                <FileIcon size={36} className="md:h-12 md:w-12" />
                <p className="text-xs mt-1 text-center">No receipt</p>
              </div>
            )}
          </div>

          {/* Right side - Expense details */}
          <div className="w-full md:w-2/3 p-4 md:p-6 min-w-0 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 sm:gap-0">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>
                    {typeof expense.date === "string"
                      ? expense.date
                      : format(new Date(expense.date), "PPP")}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-semibold mt-1 md:mt-2">
                  {expense.description || expense.category || "Expense Details"}
                </h2>
                <div className="text-sm text-muted-foreground mt-1">
                  Merchant: {expense.merchant || "Unknown"}
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
                <div className="flex items-center justify-end mt-2">
                  <span className="text-sm text-muted-foreground mr-1">
                    REIMBURSABLE
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-bold">
                  ₹{" "}
                  {typeof expense.amount === "number"
                    ? expense.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : expense.amount || "0.00"}
                </div>
              </div>
            </div>

            <Tabs defaultValue="details" onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1">{expense.description || "-"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h3>
                  <p className="mt-1">{expense.category || "-"}</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader size="md" text="Loading history..." />
                  </div>
                ) : historyError ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p>{historyError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => fetchExpenseHistory(expense.id)}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No history available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Expense Timeline
                    </div>
                    <div className="space-y-4">
                      {historyData.map((event) => (
                        <HistoryItemCard
                          key={event.id}
                          id={event.id}
                          eventType={event.eventType}
                          eventDate={event.eventDate}
                          details={event.details}
                          performedBy={event.performedBy}
                          report={event.report}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

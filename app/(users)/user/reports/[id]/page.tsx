"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  FileText,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import ReportExpenseCard from "@/components/reports/ReportExpenseCard";
import AddReportDialog from "@/components/reports/AddReportDialog";
import HistoryItemCard from "@/components/expenses/HistoryItemCard";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExpenseCategory, ReportStatus } from "@prisma/client";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteReportsDialog } from "@/components/reports/DeleteReportsDialog";

// Define the history item type
interface ReportHistoryItem {
  id: number;
  eventType: string;
  eventDate: Date | string;
  details?: string | null;
  performedBy?: {
    name: string;
  } | null;
  report?: {
    id: number;
    title: string;
  } | null;
}

// Define the history response type
interface ReportHistoryResponse {
  history: ReportHistoryItem[];
}

// Define the API report type
interface ApiReport {
  id: number;
  title: string;
  description?: string;
  status: ReportStatus;
  totalAmount: number;
  nonReimbursableAmount: number;
  amountToBeReimbursed: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reimbursedAt?: Date;
  expenses: {
    id: number;
    amount: number;
    merchant: string;
    category: ExpenseCategory;
    date: Date;
    description?: string;
    claimReimbursement: boolean;
  }[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    approver?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
}

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // A report is locked once approved or reimbursed
  const isLocked = report
    ? report.status === ReportStatus.APPROVED ||
      report.status === ReportStatus.REIMBURSED
    : false;

  // History state
  const [historyData, setHistoryData] = useState<ReportHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleClose = () => {
    router.back();
  };

  // Fetch report history
  const fetchReportHistory = async (reportId: number) => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/history`);

      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.statusText}`);
      }

      const data: ReportHistoryResponse = await response.json();
      setHistoryData(data.history);
    } catch (error) {
      console.error("Failed to fetch report history:", error);
      setHistoryError("Failed to load report history. Please try again.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle tab change to fetch history data when needed
  const handleTabChange = (value: string) => {
    if (
      value === "history" &&
      historyData.length === 0 &&
      !isLoadingHistory &&
      report
    ) {
      fetchReportHistory(report.id);
    }
  };

  // Handle report deletion
  const handleDeleteReport = async () => {
    if (!report) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete report");
      }

      toast.success("Report deleted successfully");
      router.push("/user/reports");
    } catch (err: any) {
      console.error("Error deleting report:", err);
      toast.error(err.message || "Failed to delete report");
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Handle report submission
  const handleSubmitReport = async () => {
    if (!report) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit report");
      }

      const updatedReport = await response.json();
      setReport(updatedReport);
      toast.success("Report submitted successfully");
    } catch (err: any) {
      console.error("Error submitting report:", err);
      toast.error(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date range for display
  const formatDateRange = (startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return "No date range";
    if (startDate && !endDate)
      return `From ${format(new Date(startDate), "dd/MM/yyyy")}`;
    if (!startDate && endDate)
      return `Until ${format(new Date(endDate), "dd/MM/yyyy")}`;
    return `${format(new Date(startDate!), "dd/MM/yyyy")} - ${format(
      new Date(endDate!),
      "dd/MM/yyyy"
    )}`;
  };

  // Helper function to convert status color to Tailwind classes
  const getStatusClasses = (color: string) => {
    switch (color) {
      case "orange":
        return { bgColor: "bg-orange-100", textColor: "text-orange-800" };
      case "blue":
        return { bgColor: "bg-blue-100", textColor: "text-blue-800" };
      case "green":
        return { bgColor: "bg-green-100", textColor: "text-green-800" };
      case "red":
        return { bgColor: "bg-red-100", textColor: "text-red-800" };
      default:
        return { bgColor: "bg-gray-100", textColor: "text-gray-800" };
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <Loader size="lg" text="Loading report..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium mb-2 text-red-500">
            {error || "Report not found"}
          </div>
          <Button
            onClick={() => router.push("/user/reports/pending")}
            variant="outline"
          >
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  // Get status display for the report using the shared utility
  const statusInfo = mapReportStatusToDisplay(
    report.status,
    report.submittedAt,
    report.approvedAt,
    report.rejectedAt,
    report.reimbursedAt
  );

  // Convert the status color to Tailwind classes
  const statusClasses = getStatusClasses(statusInfo.color);

  // Create the final status display object
  const statusDisplay = {
    text: statusInfo.label,
    bgColor: statusClasses.bgColor,
    textColor: statusClasses.textColor,
    additionalInfo: statusInfo.additionalInfo,
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-500">
              ER-{report.id}
            </span>
          </div>
          <div
            className={`${statusDisplay.bgColor} ${statusDisplay.textColor} text-xs font-medium px-2 py-1 rounded`}
          >
            {statusDisplay.text}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {report.status === ReportStatus.PENDING && (
            <Button
              onClick={handleSubmitReport}
              disabled={submitting || report.expenses.length === 0}
              className="flex items-center gap-1"
            >
              {submitting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Submit Report
                </>
              )}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isLocked ? (
                <>
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Report
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>Report locked</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-xl font-bold mb-1">{report.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
              Duration: {formatDateRange(report.startDate, report.endDate)}
            </p>

            <Tabs defaultValue="expenses" onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="expenses" className="relative w-64">
                  EXPENSES
                  {report.expenses.length > 0 && (
                    <span className="absolute -top-1 -right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {report.expenses.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">HISTORY</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-4">
                {report.expenses.length > 0 ? (
                  report.expenses.map((expense) => (
                    <ReportExpenseCard
                      key={expense.id}
                      id={expense.id}
                      date={format(new Date(expense.date), "dd/MM/yyyy")}
                      merchant={expense.merchant}
                      category={expense.category.toString().replace("_", " ")}
                      amount={`Rs.${expense.amount.toLocaleString()}.00`}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No expenses in this report
                  </div>
                )}

                {report.expenses.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Expense Amount</span>
                      <span className="font-medium">
                        {report.totalAmount.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Non-reimbursable Amount</span>
                      <span className="font-medium">
                        (-) Rs.{report.nonReimbursableAmount.toLocaleString()}
                        .00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t">
                      <span>Amount to be Reimbursed</span>
                      <span>
                        Rs.{report.amountToBeReimbursed.toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                )}
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
                      onClick={() => report && fetchReportHistory(report.id)}
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
                      Report Timeline
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

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold">
                Rs.{report.totalAmount.toLocaleString()}.00
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Amount to be Reimbursed
              </div>
              <div className="font-bold">
                Rs.{report.amountToBeReimbursed.toLocaleString()}.00
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-yellow-800">
                  {report.user.approver
                    ? `${report.user.approver.firstName
                        .charAt(0)
                        .toUpperCase()}${report.user.approver.lastName
                        .charAt(0)
                        .toUpperCase()}`
                    : report.user.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-medium">
                  {report.user.approver
                    ? `${report.user.approver.firstName} ${report.user.approver.lastName}`
                    : `${report.user.firstName} ${report.user.lastName}`}
                </div>
                <div className="text-xs text-gray-500">
                  {report.user.approver
                    ? report.user.approver.email
                    : report.user.email}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Business Purpose</div>
              <div
                className={report.description ? "font-medium" : "text-gray-400"}
              >
                {report.description || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteReportsDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteReport}
        isPending={deleting}
      />

      {/* Edit Report Dialog */}
      <AddReportDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        reportId={Number(id)}
        onReportUpdated={() => {
          // Refresh report data after update
          const fetchReport = async () => {
            try {
              const response = await fetch(`/api/reports/${id}`);
              if (!response.ok) throw new Error("Failed to fetch report");
              const data = await response.json();
              setReport(data);
              toast.success("Report updated successfully");
            } catch (err) {
              console.error("Error refreshing report:", err);
            }
          };
          fetchReport();
        }}
      />
    </div>
  );
}

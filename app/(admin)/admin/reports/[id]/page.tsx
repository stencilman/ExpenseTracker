"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, FileText, MoreHorizontal, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";
import { ExpensesProvider } from "@/components/providers/ExpenseProvider";
import RecordReimbursement from "@/components/admin/RecordReimbursement";
import ReportExpenseCard from "@/components/reports/ReportExpenseCard";

import { useEffect, useState } from "react";
import ApproveReportDialog from "@/components/admin/ApproveReportDialog";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/format-utils";
import HistoryItemCard from "@/components/expenses/HistoryItemCard";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { ReportStatus } from "@prisma/client";
import { ExpenseWithUI } from "@/types/expense";

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const reportId = Array.isArray(id) ? id[0] : id;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const [isActionLoading, setIsActionLoading] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [reimbursementDialogOpen, setReimbursementDialogOpen] = useState(false);

  // Expense dialog state
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isExpenseLoading, setIsExpenseLoading] = useState(false);

  // Utility to normalize status field coming from API
  const normalizeReportStatus = (reportData: any) => {
    if (!reportData) return reportData;
    if (reportData.status && typeof reportData.status === "object") {
      reportData.statusDisplay = reportData.status;
      reportData.status = reportData.status.label;
    } else if (typeof reportData.status === "string") {
      reportData.statusDisplay = mapReportStatusToDisplay(
        reportData.status as ReportStatus,
        reportData.submittedAt,
        reportData.approvedAt,
        reportData.rejectedAt,
        reportData.reimbursedAt
      );
    }
    return reportData;
  };

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/reports/${reportId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }

        const data = await response.json();
        const reportData = data.data;

        // Debug report data structure
        console.log("Report data:", reportData);

        // If API already returns a formatted status object
        if (
          reportData &&
          typeof reportData.status === "object" &&
          reportData.status !== null
        ) {
          reportData.statusDisplay = reportData.status;
          reportData.status = reportData.status.label;
        } else if (reportData && typeof reportData.status === "string") {
          reportData.statusDisplay = mapReportStatusToDisplay(
            reportData.status as ReportStatus,
            reportData.submittedAt,
            reportData.approvedAt,
            reportData.rejectedAt,
            reportData.reimbursedAt
          );
        }

        const mergedReport =
          !report?.expenses || reportData.expenses
            ? reportData
            : { ...reportData, expenses: report.expenses };
        setReport(mergedReport);

        // Fetch report history
        const historyResponse = await fetch(
          `/api/admin/reports/${reportId}/history`
        );
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryItems(historyData.data);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const handleClose = () => {
    router.back();
  };

  const handlePrimaryActionClick = () => {
    if (statusLabel === "SUBMITTED") {
      setDialogAction("approve");
      setConfirmDialogOpen(true);
    } else if (
      statusLabel === "AWAITING REIMBURSEMENT" ||
      statusLabel === "APPROVED"
    ) {
      setReimbursementDialogOpen(true);
    }
  };

  const handleRejectClick = () => {
    setDialogAction("reject");
    setConfirmDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to approve report");
      }

      const data = await response.json();
      const reportData = data.data;

      // Ensure report status is properly formatted as an object for UI
      if (
        reportData &&
        reportData.status &&
        typeof reportData.status === "string"
      ) {
        reportData.statusDisplay = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }

      const mergedReport =
        !report?.expenses || reportData.expenses
          ? reportData
          : { ...reportData, expenses: report.expenses };
      setReport(mergedReport);
      toast.success("Report approved successfully");
      setConfirmDialogOpen(false);

      // Refresh history
      const historyResponse = await fetch(
        `/api/admin/reports/${reportId}/history`
      );
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to approve report"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReimbursement = async (paymentReference: string) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/reimburse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentReference }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to reimburse report");
      }

      const data = await response.json();
      const reportData = data.data;

      // Ensure report status is properly formatted as an object for UI
      if (
        reportData &&
        reportData.status &&
        typeof reportData.status === "string"
      ) {
        reportData.statusDisplay = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }

      const mergedReport =
        !report?.expenses || reportData.expenses
          ? reportData
          : { ...reportData, expenses: report.expenses };
      setReport(mergedReport);
      toast.success("Report marked as reimbursed successfully");
      setReimbursementDialogOpen(false);

      // Refresh history
      const historyResponse = await fetch(
        `/api/admin/reports/${reportId}/history`
      );
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error("Error reimbursing report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reimburse report"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to reject report");
      }

      const data = await response.json();
      const reportData = data.data;

      // Ensure report status is properly formatted as an object for UI
      if (
        reportData &&
        reportData.status &&
        typeof reportData.status === "string"
      ) {
        reportData.statusDisplay = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }

      const mergedReport =
        !report?.expenses || reportData.expenses
          ? reportData
          : { ...reportData, expenses: report.expenses };
      setReport(mergedReport);
      toast.success("Report rejected successfully");
      setConfirmDialogOpen(false);

      // Refresh history
      const historyResponse = await fetch(
        `/api/admin/reports/${reportId}/history`
      );
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject report"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // Common helper to get label (works whether we have raw status string or statusDisplay)
  const statusLabel = report?.statusDisplay?.label ?? report?.status;

  // Determine main action button text based on status
  const getPrimaryButtonText = () => {
    if (statusLabel === "SUBMITTED") return "Approve";
    if (statusLabel === "AWAITING REIMBURSEMENT" || statusLabel === "APPROVED")
      return "Record Reimbursement";
    if (statusLabel === "REJECTED") return "Rejected";
    if (statusLabel === "REIMBURSED") return "Reimbursed";
    return "Approve";
  };

  // Handler to open expense dialog
  const handleExpenseClick = async (expenseId: number) => {
    try {
      setIsExpenseLoading(true);
      setExpenseDialogOpen(true);
      const res = await fetch(`/api/admin/expenses/${expenseId}`);
      if (!res.ok) throw new Error("Failed to fetch expense");
      const { data } = await res.json();
      setSelectedExpense(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load expense");
      setExpenseDialogOpen(false);
    } finally {
      setIsExpenseLoading(false);
    }
  };

  // Determine primary button variant based on status
  const getPrimaryButtonVariant = () => {
    if (statusLabel === "REIMBURSED" || statusLabel === "REJECTED")
      return "outline";
    return "default";
  };

  // Calculate total amounts
  const getTotalAmount = () => {
    if (!report || !report.expenses || !Array.isArray(report.expenses))
      return 0;
    return report.expenses.reduce(
      (sum: number, expense: any) => sum + expense.amount,
      0
    );
  };

  const getNonReimbursableAmount = () => {
    if (!report || !report.expenses || !Array.isArray(report.expenses))
      return 0;
    return report.expenses
      .filter((expense: any) => !expense.claimReimbursement)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };

  const getAmountToBeReimbursed = () => {
    return getTotalAmount() - getNonReimbursableAmount();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!report) {
    return <div className="text-center p-4">Report not found</div>;
  }

  return (
    // This is the single root element for the component.
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-500">
              ER-{reportId}
            </span>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded ${
              statusLabel === "SUBMITTED"
                ? "bg-blue-100 text-blue-800"
                : statusLabel === "AWAITING REIMBURSEMENT"
                ? "bg-orange-100 text-orange-800"
                : statusLabel === "REJECTED"
                ? "bg-red-100 text-red-800"
                : statusLabel === "REIMBURSED"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {statusLabel}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {statusLabel !== "REIMBURSED" && statusLabel !== "REJECTED" && (
            <Button
              variant={getPrimaryButtonVariant()}
              onClick={handlePrimaryActionClick}
              className="flex items-center gap-1"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {getPrimaryButtonText()}
            </Button>
          )}

          {report.status === "REJECTED" && (
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-1 text-red-500"
            >
              <X className="h-4 w-4" />
              Rejected
            </Button>
          )}

          {statusLabel === "SUBMITTED" && (
            <Button
              variant="outline"
              onClick={handleRejectClick}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              disabled={isActionLoading}
            >
              Reject
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-xl font-bold mb-1">{report.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
              Duration:{" "}
              {report.startDate
                ? new Date(report.startDate).toLocaleDateString()
                : "N/A"}{" "}
              -{" "}
              {report.endDate
                ? new Date(report.endDate).toLocaleDateString()
                : "N/A"}
            </p>

            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses" className="relative w-60">
                  EXPENSES
                  <span className="absolute -top-1 right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {report.expenses?.length || 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="history">HISTORY</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-4">
                {report.expenses && report.expenses.length > 0 ? (
                  <>
                    {report.expenses.map((expense: ExpenseWithUI) => (
                      <ReportExpenseCard
                        key={expense.id}
                        id={expense.id}
                        date={new Date(expense.date).toLocaleDateString()}
                        merchant={expense.merchant}
                        category={expense.category}
                        amount={expense.amount}
                        onClick={() => handleExpenseClick(expense.id)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No expenses available
                  </div>
                )}

                {/* --- FIX: Cleaned up the totals section --- */}
                <div className="pt-4 mt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount</span>
                    <span className="font-medium">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Non-reimbursable Amount</span>
                    <span className="font-medium">
                      (-) {formatCurrency(getNonReimbursableAmount())}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Amount to be Reimbursed</span>
                    <span>{formatCurrency(getAmountToBeReimbursed())}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                {historyItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No history available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Report Timeline
                    </div>
                    <div className="space-y-4">
                      {historyItems.map((event: any) => (
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

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold">
                {formatCurrency(getTotalAmount())}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Amount to be Reimbursed
              </div>
              <div className="font-bold">
                {formatCurrency(getAmountToBeReimbursed())}
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-yellow-800">
                  {report.submitter ? report.submitter[0].toUpperCase() : ""}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-medium">
                  {report.submitter || "Unknown User"}
                </div>
                <div className="text-xs text-gray-500">
                  {report.user?.email || report.submitterEmail || ""}
                </div>
              </div>
            </div>

            {report.approver && (
              <div className="flex items-center mt-2">
                <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                  <span className="text-xs font-bold text-blue-800">
                    {report.approver ? report.approver[0].toUpperCase() : ""}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium">
                    {report.approver || "No Approver"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {report.approverEmail || ""}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Business Purpose</div>
              <div className="text-gray-400">-</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Modals */}
      <ApproveReportDialog
        open={confirmDialogOpen && dialogAction === "approve"}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={() => handleApprove()}
        reportId={reportId}
        action="approve"
      />

      <ApproveReportDialog
        open={confirmDialogOpen && dialogAction === "reject"}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={() => handleReject("Rejected by admin")}
        reportId={reportId}
        action="reject"
      />

      <Dialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setExpenseDialogOpen(false);
            setSelectedExpense(null);
          }
        }}
      >
        <DialogContent className="w-full max-h-[95vh] overflow-y-auto p-0 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Expense Details</DialogTitle>
          </DialogHeader>
          {isExpenseLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="animate-spin" />
            </div>
          ) : selectedExpense ? (
            <ExpensesProvider>
              <ExpenseDetail
                expense={selectedExpense}
                onClose={() => setExpenseDialogOpen(false)}
                hideClose
                readOnly
              />
            </ExpensesProvider>
          ) : null}
        </DialogContent>
      </Dialog>

      <RecordReimbursement
        open={reimbursementDialogOpen}
        onOpenChange={setReimbursementDialogOpen}
        onConfirm={(data) => {
          handleReimbursement(data.reference || "No reference provided");
        }}
        reportId={reportId}
        totalAmount={getAmountToBeReimbursed()}
        totalAdvance={0}
      />
    </div>
  );
}

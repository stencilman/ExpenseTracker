"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExpenseCategory, ReportStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Get status display
  const getStatusDisplay = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return {
          text: "DRAFT",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
      case ReportStatus.SUBMITTED:
        return {
          text: "SUBMITTED",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      case ReportStatus.APPROVED:
        return {
          text: "APPROVED",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case ReportStatus.REJECTED:
        return {
          text: "REJECTED",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      case ReportStatus.REIMBURSED:
        return {
          text: "REIMBURSED",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      default:
        return {
          text: "PENDING",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
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

  // Get status display for the report
  const statusDisplay = getStatusDisplay(report.status);

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
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Report
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Report
              </DropdownMenuItem>
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

            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses" className="relative w-64">
                  EXPENSES
                  <span className="absolute -top-1 -right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {report.expenses.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="advances">ADVANCES & REFUNDS</TabsTrigger>
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
                    <div className="flex justify-between text-sm">
                      <span>Applied Advance Amount</span>
                      <span className="font-medium">(-) 0.00</span>
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

              <TabsContent value="advances">
                <div className="text-center py-8 text-gray-500">
                  No advances or refunds for this report
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8 text-gray-500">
                  {report.submittedAt ? (
                    <div className="flex flex-col items-center">
                      <div className="mb-2">
                        Submitted on{" "}
                        {format(new Date(report.submittedAt), "dd/MM/yyyy")}
                      </div>
                      {report.approvedAt && (
                        <div className="mb-2">
                          Approved on{" "}
                          {format(new Date(report.approvedAt), "dd/MM/yyyy")}
                        </div>
                      )}
                      {report.rejectedAt && (
                        <div className="mb-2">
                          Rejected on{" "}
                          {format(new Date(report.rejectedAt), "dd/MM/yyyy")}
                        </div>
                      )}
                      {report.reimbursedAt && (
                        <div className="mb-2">
                          Reimbursed on{" "}
                          {format(new Date(report.reimbursedAt), "dd/MM/yyyy")}
                        </div>
                      )}
                    </div>
                  ) : (
                    "No history available"
                  )}
                </div>
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
                  {/* TODO: Change it to the name of the approver */}
                  {report.user.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                {report.user.firstName} {report.user.lastName}
              </div>
            </div>
            <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
              View approval flow
            </Button>

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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              report and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

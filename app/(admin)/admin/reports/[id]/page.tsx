"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, FileText, MoreHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import ApproveReportDialog from "@/components/admin/ApproveReportDialog";
import RecordReimbursement from "@/components/admin/RecordReimbursement";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/format-utils";
import HistoryItemCard from "@/components/expenses/HistoryItemCard";
import { mapReportStatusToDisplay } from "@/lib/report-status-utils";
import { ReportStatus } from "@prisma/client";

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
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [reimbursementDialogOpen, setReimbursementDialogOpen] = useState(false);
  
  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/reports/${reportId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }
        
        const data = await response.json();
        const reportData = data.data;
        
        // Ensure report status is properly formatted as an object for UI
        if (reportData && reportData.status && typeof reportData.status === 'string') {
          reportData.status = mapReportStatusToDisplay(
            reportData.status as ReportStatus,
            reportData.submittedAt,
            reportData.approvedAt,
            reportData.rejectedAt,
            reportData.reimbursedAt
          );
        }
        
        setReport(reportData);
        
        // Fetch report history
        const historyResponse = await fetch(`/api/admin/reports/${reportId}/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryItems(historyData.data);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report. Please try again.');
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

  const handleApproveClick = () => {
    if (report?.status === "SUBMITTED") {
      setDialogAction('approve');
      setConfirmDialogOpen(true);
    } else if (report?.status === "APPROVED") {
      setReimbursementDialogOpen(true);
    }
  };

  const handleRejectClick = () => {
    setDialogAction('reject');
    setConfirmDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve report');
      }
      
      const data = await response.json();
      const reportData = data.data;
      
      // Ensure report status is properly formatted as an object for UI
      if (reportData && reportData.status && typeof reportData.status === 'string') {
        reportData.status = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }
      
      setReport(reportData);
      toast.success('Report approved successfully');
      setConfirmDialogOpen(false);
      
      // Refresh history
      const historyResponse = await fetch(`/api/admin/reports/${reportId}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve report');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReimbursement = async (paymentReference: string) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/reimburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentReference })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reimburse report');
      }
      
      const data = await response.json();
      const reportData = data.data;
      
      // Ensure report status is properly formatted as an object for UI
      if (reportData && reportData.status && typeof reportData.status === 'string') {
        reportData.status = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }
      
      setReport(reportData);
      toast.success('Report marked as reimbursed successfully');
      setReimbursementDialogOpen(false);
      
      // Refresh history
      const historyResponse = await fetch(`/api/admin/reports/${reportId}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error('Error reimbursing report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reimburse report');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reject report');
      }
      
      const data = await response.json();
      const reportData = data.data;
      
      // Ensure report status is properly formatted as an object for UI
      if (reportData && reportData.status && typeof reportData.status === 'string') {
        reportData.status = mapReportStatusToDisplay(
          reportData.status as ReportStatus,
          reportData.submittedAt,
          reportData.approvedAt,
          reportData.rejectedAt,
          reportData.reimbursedAt
        );
      }
      
      setReport(reportData);
      toast.success('Report rejected successfully');
      setConfirmDialogOpen(false);
      
      // Refresh history
      const historyResponse = await fetch(`/api/admin/reports/${reportId}/history`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistoryItems(historyData.data);
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject report');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Determine button text based on status
  const getApproveButtonText = () => {
    if (report?.status === "SUBMITTED") return "Approve";
    if (report?.status === "APPROVED") return "Record Reimbursement";
    if (report?.status === "REJECTED") return "Rejected";
    return "Approved";
  };

  // Determine button variant based on status
  const getApproveButtonVariant = () => {
    if (report?.status === "REIMBURSED" || report?.status === "REJECTED") return "outline";
    return "default";
  };
  
  // Calculate total amounts
  const getTotalAmount = () => {
    if (!report || !report.expenses || !Array.isArray(report.expenses)) return 0;
    return report.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };
  
  const getNonReimbursableAmount = () => {
    if (!report || !report.expenses || !Array.isArray(report.expenses)) return 0;
    return report.expenses
      .filter((expense: any) => !expense.claimReimbursement)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };
  
  const getAmountToBeReimbursed = () => {
    return getTotalAmount() - getNonReimbursableAmount();
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader /></div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  
  if (!report) {
    return <div className="text-center p-4">Report not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-500">ER-{reportId}</span>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded ${
              report.status === "SUBMITTED"
                ? "bg-blue-100 text-blue-800"
                : report.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : report.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : report.status === "REIMBURSED"
                ? "bg-blue-100 text-blue-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {report.status}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {report.status !== "REIMBURSED" && report.status !== "REJECTED" && (
            <Button
              variant={getApproveButtonVariant()}
              onClick={handleApproveClick}
              className="flex items-center gap-1"
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader className="h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-1" />}
              {getApproveButtonText()}
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

          {report.status !== "REJECTED" && report.status !== "REIMBURSED" && (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-xl font-bold mb-1">{report.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
              Duration: {report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'} - {report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}
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
                  report.expenses.map((expense: any) => (
                    <div key={expense.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center p-4 border-b">
                        <div className="w-12">
                          <div className="bg-red-500 h-10 w-10 rounded flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                                <span className="font-medium">
                                  {expense.merchant}
                                </span>
                              </div>
                              <div className="text-sm text-blue-600">
                                {expense.category}
                              </div>
                            </div>
                            <div className="font-bold">{formatCurrency(expense.amount)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">No expenses found</div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Expense Amount</span>
                    <span className="font-medium">{formatCurrency(getTotalAmount())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Non-reimbursable Amount</span>
                    <span className="font-medium">(-) {formatCurrency(getNonReimbursableAmount())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Applied Advance Amount</span>
                    <span className="font-medium">(-) 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Amount to be Reimbursed</span>
                    <span>{formatCurrency(getAmountToBeReimbursed())}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8 text-gray-500">
                  No history available
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-bold">Rs.944.00</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-500">
                Amount to be Reimbursed
              </div>
              <div className="font-bold">Rs.944.00</div>
            </div>
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-yellow-800">P</span>
              </div>
              <div className="text-sm">prabal</div>
            </div>
            <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
              View approval flow
            </Button>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Policy</div>
              <div className="font-medium">Fast Code AI</div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Business Purpose</div>
              <div className="text-gray-400">-</div>
            </div>
          </div>
        </div>
      </div>

      <ApproveReportDialog
        open={confirmDialogOpen && dialogAction === 'approve'}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={() => handleApprove()}
        reportId={reportId}
        action="approve"
      />

      <ApproveReportDialog
        open={confirmDialogOpen && dialogAction === 'reject'}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={() => handleReject('Rejected by admin')}
        reportId={reportId}
        action="reject"
      />

      <RecordReimbursement
        open={reimbursementDialogOpen}
        onOpenChange={setReimbursementDialogOpen}
        onConfirm={(data) => {
          handleReimbursement(data.reference || 'No reference provided');
        }}
        reportId={reportId}
        totalAmount={getTotalAmount()}
        totalAdvance={0}
      />
    </div>
  );
}

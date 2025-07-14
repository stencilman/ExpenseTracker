"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, FileText, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import ApproveReportDialog from "@/components/admin/ApproveReportDialog";
import RecordReimbursement from "@/components/admin/RecordReimbursement";

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  // Status can be "PENDING", "APPROVED", or "REIMBURSED"
  const [reportStatus, setReportStatus] = useState("PENDING");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [reimbursementDialogOpen, setReimbursementDialogOpen] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleApproveClick = () => {
    if (reportStatus === "PENDING") {
      setDialogAction('approve');
      setConfirmDialogOpen(true);
    } else if (reportStatus === "APPROVED") {
      setReimbursementDialogOpen(true);
    }
  };

  const handleRejectClick = () => {
    setDialogAction('reject');
    setConfirmDialogOpen(true);
  };

  const handleApprove = () => {
    setReportStatus("APPROVED");
    // Add API call to approve report
    console.log(`Report ${id} approved`);
  };

  const handleReimbursement = () => {
    setReportStatus("REIMBURSED");
    // Add API call to record reimbursement
    console.log(`Reimbursement recorded for report ${id}`);
  };

  const handleReject = () => {
    setReportStatus("REJECTED");
    // Add API call to reject report
    console.log(`Report ${id} rejected`);
  };

  // Determine button text based on status
  const getApproveButtonText = () => {
    if (reportStatus === "PENDING") return "Approve";
    if (reportStatus === "APPROVED") return "Record Reimbursement";
    if (reportStatus === "REJECTED") return "Rejected";
    return "Approved";
  };

  // Determine button variant based on status
  const getApproveButtonVariant = () => {
    if (reportStatus === "REIMBURSED" || reportStatus === "REJECTED") return "outline";
    return "default";
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <span className="text-sm font-medium text-gray-500">ER-{id}</span>
          </div>
          <div
            className={`text-xs font-medium px-2 py-1 rounded ${
              reportStatus === "PENDING"
                ? "bg-orange-100 text-orange-800"
                : reportStatus === "APPROVED"
                ? "bg-green-100 text-green-800"
                : reportStatus === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {reportStatus}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {reportStatus !== "REIMBURSED" && reportStatus !== "REJECTED" && (
            <Button
              variant={getApproveButtonVariant()}
              onClick={handleApproveClick}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              {getApproveButtonText()}
            </Button>
          )}
          
          {reportStatus === "REJECTED" && (
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-1 text-red-500"
            >
              <X className="h-4 w-4" />
              Rejected
            </Button>
          )}

          {reportStatus !== "REJECTED" && reportStatus !== "REIMBURSED" && (
            <Button
              variant="outline"
              onClick={handleRejectClick}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Reject
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-xl font-bold mb-1">Bhive Passes</h1>
            <p className="text-sm text-gray-500 mb-6">
              Duration: 10/07/2025 - 10/07/2025
            </p>

            <Tabs defaultValue="expenses">
              <TabsList className="mb-4">
                <TabsTrigger value="expenses" className="relative w-60">
                  EXPENSES
                  <span className="absolute -top-1 right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                </TabsTrigger>
                <TabsTrigger value="history">HISTORY</TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
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
                              01/07/2025
                            </span>
                            <span className="font-medium">
                              TUSKER WORKSPACE PRIVATE LIMITED
                            </span>
                          </div>
                          <div className="text-sm text-blue-600">
                            IT and Internet Expenses
                          </div>
                        </div>
                        <div className="font-bold">Rs.944.00</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Expense Amount</span>
                    <span className="font-medium">944.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Non-reimbursable Amount</span>
                    <span className="font-medium">(-) 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Applied Advance Amount</span>
                    <span className="font-medium">(-) 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Amount to be Reimbursed</span>
                    <span>Rs.944.00</span>
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
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={dialogAction === 'approve' ? handleApprove : handleReject}
        reportId={id as string}
        action={dialogAction}
      />
      
      <RecordReimbursement
        open={reimbursementDialogOpen}
        onOpenChange={setReimbursementDialogOpen}
        onConfirm={handleReimbursement}
        reportId={id as string}
        totalAmount={944.00}
        totalAdvance={0.00}
      />
    </div>
  );
}

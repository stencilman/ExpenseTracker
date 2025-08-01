"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Report } from "@/components/table/TableColumnDefs";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ReportStatus } from "@prisma/client";
import { Loader } from "@/components/ui/loader";

interface ReportActionsProps {
  report: Report;
  onActionComplete?: (updatedReport: Report) => void;
}

export function ReportActions({ report, onActionComplete }: ReportActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReimburseDialog, setShowReimburseDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

    // Determine status label regardless of shape (enum or object)
  const statusLabel: string | undefined =
    typeof report.status === "string"
      ? report.status
      : report.status?.label;

  // Determine which actions are available based on report status
  const canApprove = statusLabel === "SUBMITTED";
  const canReject = statusLabel === "SUBMITTED";
  const canReimburse = statusLabel === "APPROVED";

  const handleApprove = async () => {
    if (!canApprove) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reports/${report.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to approve report");
      }

      const result = await response.json();
      toast.success("Report approved successfully");
      
      if (onActionComplete) {
        onActionComplete(result.data);
      }
    } catch (error) {
      console.error("Error approving report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to approve report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!canReject || !rejectionReason.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reports/${report.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to reject report");
      }

      const result = await response.json();
      toast.success("Report rejected successfully");
      setShowRejectDialog(false);
      setRejectionReason("");
      
      if (onActionComplete) {
        onActionComplete(result.data);
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reject report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReimburse = async () => {
    if (!canReimburse) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reports/${report.id}/reimburse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentReference }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to reimburse report");
      }

      const result = await response.json();
      toast.success("Report marked as reimbursed successfully");
      setShowReimburseDialog(false);
      setPaymentReference("");
      
      if (onActionComplete) {
        onActionComplete(result.data);
      }
    } catch (error) {
      console.error("Error reimbursing report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reimburse report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canApprove && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleApprove}
          disabled={isLoading}
        >
          {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
          Approve
        </Button>
      )}
      
      {canReject && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading}
        >
          Reject
        </Button>
      )}
      
      {canReimburse && (
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setShowReimburseDialog(true)}
          disabled={isLoading}
        >
          Mark Reimbursed
        </Button>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejection-reason" className="col-span-4">
                Rejection Reason
              </Label>
              <Textarea
                id="rejection-reason"
                className="col-span-4"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
              Reject Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reimburse Dialog */}
      <Dialog open={showReimburseDialog} onOpenChange={setShowReimburseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Report as Reimbursed</DialogTitle>
            <DialogDescription>
              Enter an optional payment reference for this reimbursement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-reference" className="col-span-4">
                Payment Reference (Optional)
              </Label>
              <Input
                id="payment-reference"
                className="col-span-4"
                placeholder="Enter payment reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReimburseDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleReimburse}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
              Mark as Reimbursed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

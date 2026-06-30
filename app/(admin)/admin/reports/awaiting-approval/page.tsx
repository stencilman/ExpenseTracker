"use client";

import { Report, ReportsTable } from "@/components/table/ReportsTable";
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Mail, FlaskConical } from "lucide-react";

export default function AdminReportsAwaitingApprovalPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Removed rejection dialog and reason state

  const fetchReports = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/reports/awaiting-approval?page=${page}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const responseData = await response.json();
      
      // Extract pagination metadata
      const data = responseData.data || [];
      const meta = responseData.meta;
      if (meta) {
        setCurrentPage(meta.page);
        setTotalPages(meta.pageCount);
      }
      
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [fetchReports, currentPage]);

  const handleSelectedRowsChange = (selectedRows: Report[]) => {
    setSelectedReports(selectedRows);
    // Check if all reports are selected
    setSelectAll(
      selectedRows.length > 0 && selectedRows.length === reports.length
    );
  };

  // Selection is handled by the table's checkbox header

  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsApproving(true);
      const response = await fetch("/api/admin/reports/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportIds: selectedReports.map((report) => report.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve reports");
      }

      const result = await response.json();
      toast.success(
        result.message || `${result.count} reports approved successfully`
      );
      fetchReports();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error approving reports:", err);
      toast.error("Failed to approve reports. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReports.length === 0) return;

    try {
      setIsRejecting(true);
      const response = await fetch("/api/admin/reports/bulk-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportIds: selectedReports.map((report) => report.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject reports");
      }

      const result = await response.json();
      toast.success(
        result.message || `${result.count} reports rejected successfully`
      );
      fetchReports();
      setSelectedReports([]);
    } catch (err) {
      console.error("Error rejecting reports:", err);
      toast.error("Failed to reject reports. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSendDigest = async (overrideEmail?: string) => {
    try {
      setIsSendingDigest(true);
      const response = await fetch("/api/cron/pending-reimbursements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideEmail ? { email: overrideEmail } : {}),
      });
      if (!response.ok) throw new Error("Failed to send digest");
      const result = await response.json();
      toast.success(`Digest sent to ${result.sentTo} (${result.count} report${result.count !== 1 ? "s" : ""})`);
    } catch {
      toast.error("Failed to send digest email. Please try again.");
    } finally {
      setIsSendingDigest(false);
    }
  };

  const handleSendTestDigest = async () => {
    if (!testEmail) return;
    await handleSendDigest(testEmail);
    setTestDialogOpen(false);
    setTestEmail("");
  };

  // Handle report action completion (approve, reject, reimburse)
  const handleReportActionComplete = useCallback(
    (updatedReport: Report) => {
      // Refresh the reports list
      fetchReports();
      toast.success(`Report ${updatedReport.id} status updated successfully`);
    },
    [fetchReports]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedReports.length > 0 && (
              <>
                <span className="text-sm font-medium">
                  {selectedReports.length} report
                  {selectedReports.length !== 1 ? "s" : ""} selected
                </span>

                {/* Action buttons in the same row */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="blue-outline"
                    onClick={handleBulkApprove}
                    disabled={isApproving || isRejecting}
                    size="sm"
                  >
                    {isApproving ? (
                      <div className="flex items-center gap-2">
                        <Loader size="sm" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                  <Button
                    variant="red-outline"
                    onClick={handleBulkReject}
                    disabled={isApproving || isRejecting}
                    size="sm"
                  >
                    {isRejecting ? (
                      <div className="flex items-center gap-2">
                        <Loader size="sm" className="text-red-500" />
                        <span>Rejecting...</span>
                      </div>
                    ) : (
                      "Reject"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() => handleSendDigest()}
              disabled={isSendingDigest}
            >
              {isSendingDigest ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Send Digest Email</span>
                </div>
              )}
            </Button>
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() => setTestDialogOpen(true)}
              disabled={isSendingDigest}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                <span>Test</span>
              </div>
            </Button>
          </div>
        </div>

        <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Digest</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Send a test copy of the pending-approval digest to a specific email address.
            </p>
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendTestDigest()}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendTestDigest} disabled={!testEmail || isSendingDigest}>
                {isSendingDigest ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ReportsTable
          data={reports}
          enableRowSelection={true}
          onSelectedRowsChange={handleSelectedRowsChange}
          variant="page"
          showPagination={false} /* Disable built-in pagination */
          onReportActionComplete={handleReportActionComplete}
          isAllRowsSelected={selectAll}
        />
        
        {/* Custom server-side pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="blue-outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Rejection dialog removed */}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Download, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "UNREPORTED", label: "Unreported" },
  { value: "REPORTED", label: "Reported" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REIMBURSED", label: "Reimbursed" },
];

interface Summary {
  expenseCount: number;
  fileCount: number;
  maxFiles: number;
}

interface DownloadBillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Download this user's bills. */
  userId?: string;
  /** Limit to a single report (on its own, or together with userId). */
  reportId?: number | string;
  /** Who or what the bills belong to, e.g. "Jane Doe" or "report ER-12". */
  subjectName: string;
}

export default function DownloadBillsDialog({
  open,
  onOpenChange,
  userId,
  reportId,
  subjectName,
}: DownloadBillsDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState("ALL");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);

  // Start fresh each time the dialog opens for a (possibly different) user.
  useEffect(() => {
    if (open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus("ALL");
    }
  }, [open, userId, reportId]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (reportId !== undefined) params.set("reportId", String(reportId));
    if (startDate) params.set("from", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("to", format(endDate, "yyyy-MM-dd"));
    if (status !== "ALL") params.set("status", status);
    return params.toString();
  }, [userId, reportId, startDate, endDate, status]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setIsCounting(true);
    setCountError(null);

    fetch(`/api/admin/receipts/summary?${query}`, { signal: controller.signal })
      .then(async (response) => {
        // Errors outside the route's handler come back as plain text, not JSON.
        const body = await response.json().catch(() => null);
        if (!response.ok || !body) {
          throw new Error(body?.error || `Failed to count bills (${response.status})`);
        }
        setSummary(body);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setSummary(null);
        setCountError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCounting(false);
      });

    return () => controller.abort();
  }, [open, query]);

  const overLimit = !!summary && summary.fileCount > summary.maxFiles;
  const canDownload =
    !isCounting && !!summary && summary.fileCount > 0 && !overLimit;

  const handleDownload = () => {
    // A plain link lets the browser stream the zip to disk with its own
    // progress UI, instead of buffering the whole file in memory.
    const link = document.createElement("a");
    link.href = `/api/admin/receipts/download?${query}`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Download started", {
      description: `${summary?.fileCount} bills are being zipped. Large downloads can take a minute to begin.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download bills</DialogTitle>
          <DialogDescription>
            Bills for {subjectName}, as a zip file with a manifest.csv listing
            each expense.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Expense date</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate
                      ? endDate
                        ? `${format(startDate, "d MMM yyyy")} – ${format(
                            endDate,
                            "d MMM yyyy"
                          )}`
                        : format(startDate, "d MMM yyyy")
                      : "All dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: startDate, to: endDate }}
                    onSelect={(range) => {
                      setStartDate(range?.from);
                      setEndDate(range?.to ?? range?.from);
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {startDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear dates"
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Expense status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-h-10 rounded-md bg-muted px-3 py-2 text-sm">
            {isCounting ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Counting bills…
              </span>
            ) : countError ? (
              <span className="text-red-600">{countError}</span>
            ) : summary && summary.fileCount === 0 ? (
              <span className="text-muted-foreground">
                No bills match these filters.
              </span>
            ) : summary && overLimit ? (
              <span className="text-red-600">
                {summary.fileCount} bills match, but a download is limited to{" "}
                {summary.maxFiles}. Narrow the date range.
              </span>
            ) : summary ? (
              <span>
                {summary.fileCount} {summary.fileCount === 1 ? "bill" : "bills"}{" "}
                from {summary.expenseCount}{" "}
                {summary.expenseCount === 1 ? "expense" : "expenses"}
              </span>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={!canDownload}>
            <Download className="h-4 w-4" />
            Download zip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

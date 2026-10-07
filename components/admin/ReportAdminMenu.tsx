"use client";

import { useState } from "react";
import { MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loader";
import { DeleteReportsDialog } from "@/components/reports/DeleteReportsDialog";

interface ReportAdminMenuProps {
  reportId: string | number;
  canRequestResubmission: boolean;
  onResubmissionRequested: (reportData: any) => void;
  onDeleted: () => void;
  // Render as a full-width button instead of an icon (mobile layout)
  fullWidth?: boolean;
}

export default function ReportAdminMenu({
  reportId,
  canRequestResubmission,
  onResubmissionRequested,
  onDeleted,
  fullWidth = false,
}: ReportAdminMenuProps) {
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const readError = async (response: Response, fallback: string) => {
    try {
      const body = await response.json();
      return body?.error || fallback;
    } catch {
      return fallback;
    }
  };

  const handleRequestResubmission = async () => {
    if (!note.trim()) return;
    try {
      setIsResubmitting(true);
      const response = await fetch(
        `/api/admin/reports/${reportId}/request-resubmission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note.trim() }),
        }
      );
      if (!response.ok) {
        throw new Error(
          await readError(response, "Failed to send report back for resubmission")
        );
      }
      const { data } = await response.json();
      toast.success("Report sent back to the submitter");
      setResubmitOpen(false);
      setNote("");
      onResubmissionRequested(data);
    } catch (error) {
      console.error("Error requesting resubmission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send report back for resubmission"
      );
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await readError(response, "Failed to delete report"));
      }
      toast.success("Report deleted");
      setDeleteOpen(false);
      onDeleted();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete report"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {fullWidth ? (
            <Button variant="outline" className="flex items-center gap-1">
              <MoreHorizontal className="h-4 w-4" />
              More actions
            </Button>
          ) : (
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canRequestResubmission && (
            <DropdownMenuItem onClick={() => setResubmitOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resubmit Report
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Delete Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={resubmitOpen}
        onOpenChange={(open) => {
          if (!isResubmitting) setResubmitOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send back for resubmission</DialogTitle>
            <DialogDescription>
              The report goes back to the submitter as pending so they can make
              changes and submit it again. They will see your note on the
              report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="resubmission-note">Note to submitter</Label>
            <Textarea
              id="resubmission-note"
              placeholder="e.g. Please attach the hotel invoice for 12 Sep"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResubmitOpen(false)}
              disabled={isResubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestResubmission}
              disabled={isResubmitting || !note.trim()}
            >
              {isResubmitting ? <Loader size="sm" className="mr-2" /> : null}
              Send back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteReportsDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </>
  );
}

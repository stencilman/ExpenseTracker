"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ApproveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reportId?: string;
  action: 'approve' | 'reject';
}

export default function ApproveReportDialog({
  open,
  onOpenChange,
  onConfirm,
  reportId,
  action = 'approve',
}: ApproveReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <DialogTitle className="text-left">
              {action === 'approve' ? 'Approve Report' : 'Reject Report'}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <DialogDescription className="text-left">
            Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} this report?
          </DialogDescription>
          {action === 'reject' && (
            <p className="mt-2 text-red-500 text-sm">
              This action cannot be undone.
            </p>
          )}
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

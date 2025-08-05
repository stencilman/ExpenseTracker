"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface DeleteExpenseDialogProps {
  // Can be a single expense ID or an array of expense IDs
  expenseIds: number | string | (number | string)[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional callback after successful deletion
  onSuccess?: () => void;
}

export function DeleteExpenseDialog({
  expenseIds,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteExpenseDialogProps) {
  const router = useRouter();
  const { deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if multiple expenses are being deleted
  const isMultiple = Array.isArray(expenseIds) && expenseIds.length > 1;
  const count = isMultiple ? (expenseIds as (number | string)[]).length : 1;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete the expense(s)
      if (isMultiple) {
        await Promise.all(
          (expenseIds as (number | string)[]).map((id) =>
            deleteExpense(String(id))
          )
        );
        toast.success(
          `Successfully deleted ${count} expense${count !== 1 ? "s" : ""}`
        );
      } else {
        const id = Array.isArray(expenseIds) ? expenseIds[0] : expenseIds;
        await deleteExpense(String(id));
        toast.success("Expense deleted successfully");
      }

      // 2. Close the dialog after deletion succeeds
      onOpenChange(false);

      // 3. After the dialog close animation, fire the success callback or fallback refresh
      const DIALOG_CLOSE_DELAY = 300;
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback: ensure any stale data is cleared (when dialog used from list view)
          router.refresh();
        }
      }, DIALOG_CLOSE_DELAY);
    } catch (error) {
      console.error("Error deleting expense(s):", error);
      toast.error(`Failed to delete expense${isMultiple ? "s" : ""}`);
      // Reset loader state on error so user can try again or cancel
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isMultiple ? `${count} Expenses` : "Expense"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {isMultiple ? `these ${count} expenses` : "this expense"}? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* Use a regular button instead of AlertDialogAction to keep the dialog open until deletion completes */}
          <Button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader className="mr-2 h-4 w-4" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

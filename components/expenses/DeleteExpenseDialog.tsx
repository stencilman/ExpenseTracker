"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if we're dealing with multiple expenses
  const isMultiple = Array.isArray(expenseIds) && expenseIds.length > 1;
  const count = isMultiple ? expenseIds.length : 1;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      let response;

      if (isMultiple) {
        // Bulk delete
        response = await fetch(`/api/expenses/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expenseIds: expenseIds,
          }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const result = await response.json();
        toast.success(`Successfully deleted ${result.successCount} expense${result.successCount !== 1 ? 's' : ''}`);
      } else {
        // Single delete
        const id = Array.isArray(expenseIds) ? expenseIds[0] : expenseIds;
        response = await fetch(`/api/expenses/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        toast.success("Expense deleted successfully");
      }

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: refresh the page
        router.refresh();
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting expense(s):", error);
      toast.error(`Failed to delete expense${isMultiple ? 's' : ''}`);
    } finally {
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
          <AlertDialogAction
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

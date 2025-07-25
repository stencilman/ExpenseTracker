"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExpenses } from "@/components/expenses/ExpensesContext";
import { useLoading } from "@/components/providers/loading-provider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";

export default function ExpenseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { allExpenses, stopLoading } = useExpenses();
  const { stopLoading: stopPageLoading } = useLoading();

  // Find the expense with the matching ID
  // The ID in the URL can be numeric or string, and our UI expenses may have string IDs prefixed with "EXP-"
  const idString = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const numericId = parseInt(idString, 10);
  
  const expense = allExpenses.find((exp) => {
    // Convert both IDs to strings for comparison
    const expIdStr = String(exp.id);
    
    // Check if the ID matches directly (for string IDs)
    if (expIdStr === idString) return true;
    
    // Check if the ID matches after removing the "EXP-" prefix for string IDs
    if (expIdStr.startsWith('EXP-')) {
      const expNumericId = parseInt(expIdStr.replace('EXP-', ''), 10);
      return !isNaN(numericId) && expNumericId === numericId;
    }
    
    // For expenses with apiData, check the numeric ID
    if ('apiData' in exp && exp.apiData?.id === numericId) return true;
    
    return false;
  });

  useEffect(() => {
    stopLoading();
    stopPageLoading();
  }, [stopLoading, stopPageLoading]);

  const handleBack = () => {
    router.push("/user/expenses/all");
  };

  if (!expense) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Expense not found</h2>
        <p className="text-muted-foreground mb-4">
          The expense you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBack}>Back to All Expenses</Button>
      </div>
    );
  }

  return <ExpenseDetail expense={expense} onClose={handleBack} />;
}

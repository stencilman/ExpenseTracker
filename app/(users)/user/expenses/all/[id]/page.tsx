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
  // The ID in the URL is numeric, but our UI expenses have string IDs prefixed with "EXP-"
  const numericId = typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : 0;
  const expense = allExpenses.find((exp) => {
    // Check if the ID matches directly (for string IDs)
    if (exp.id === id) return true;
    
    // Check if the ID matches after removing the "EXP-" prefix
    if (exp.id.startsWith('EXP-')) {
      const expNumericId = parseInt(exp.id.replace('EXP-', ''), 10);
      return expNumericId === numericId;
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

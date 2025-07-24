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
  const expense = allExpenses.find((exp) => exp.id === id);

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

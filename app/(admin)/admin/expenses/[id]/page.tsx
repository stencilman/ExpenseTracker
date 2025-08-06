"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExpensesProvider } from "@/components/providers/ExpenseProvider";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";

export default function AdminExpenseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle the id parameter - it can be a string or array of strings
  const expenseId =
    typeof id === "string"
      ? parseInt(id)
      : Array.isArray(id)
      ? parseInt(id[0])
      : NaN;

  useEffect(() => {
    if (isNaN(expenseId)) {
      toast.error("Invalid expense id");
      router.push("/admin/expenses");
      return;
    }

    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/admin/expenses/${expenseId}`);
        if (!res.ok) throw new Error("Failed to fetch expense");
        const { data } = await res.json();
        setExpense(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to fetch expense");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [expenseId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-500">
        Expense not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <ExpensesProvider>
        <ExpenseDetail expense={expense} onClose={() => router.back()} />
      </ExpensesProvider>
    </div>
  );
}

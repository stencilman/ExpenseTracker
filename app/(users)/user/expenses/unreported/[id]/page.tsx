"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExpenses } from "@/components/expenses/ExpensesContext";
import { useLoading } from "@/components/providers/loading-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Link from "next/link";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const { stopLoading } = useLoading();
  const { unreportedExpenses } = useExpenses();

  // Find the expense by ID
  const expense = unreportedExpenses.find((exp) => exp.id === id);

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  if (!expense) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Expense Not Found</h2>
        <p className="mb-4">The expense you are looking for does not exist.</p>
        <Link href="/user/expenses/unreported">
          <Button>
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </Link>
      </div>
    );
  }

  const router = useRouter();

  const handleClose = () => {
    router.push("/user/expenses/unreported");
  };

  return <ExpenseDetail expense={expense} onClose={handleClose} />;
}

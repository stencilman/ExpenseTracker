"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { X } from "lucide-react";
import Link from "next/link";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const { stopLoading } = useLoading();
  const { unreportedExpenses, isLoading } = useExpenses();
  const router = useRouter(); // Move useRouter to the top level

  // Find the expense by ID - handle both string and number IDs
  const expense = unreportedExpenses.find((exp) => {
    // Convert both to string for comparison to handle both number and string IDs
    return String(exp.id) === String(id);
  });

  console.log("Looking for expense with ID:", id);
  console.log(
    "Available expense IDs:",
    unreportedExpenses.map((exp) => exp.id)
  );
  console.log("Found expense:", expense);

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  // Define handleClose at the top level, not conditionally
  const handleClose = () => {
    router.push("/user/expenses/unreported");
  };

  // Show loading indicator while expenses are being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" text="Loading expense..." />
      </div>
    );
  }

  // Only show not found message after loading is complete
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

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] overflow-y-auto">
      <ExpenseDetail expense={expense} onClose={handleClose} />
    </div>
  );
}

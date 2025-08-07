"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useExpenses } from "@/components/providers/ExpenseProvider";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import ExpenseDetail from "@/components/expenses/ExpenseDetail";

export default function ReportedExpenseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const needsRefresh = searchParams.get('refresh') === 'true';
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const { allExpenses, stopLoading, isLoading, fetchExpenses } = useExpenses();
  const { stopLoading: stopPageLoading } = useLoading();

  // Find the expense with the matching ID
  // The ID in the URL can be numeric or string, and our UI expenses may have string IDs prefixed with "EXP-"
  const idString = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  const numericId = parseInt(idString, 10);

  // Filter for reported expenses (those with a reportId/reportName)
  const reportedExpenses = allExpenses.filter(
    (expense) => expense.reportId && expense.reportName
  );

  const expense = reportedExpenses.find((exp) => {
    // Convert both IDs to strings for comparison
    const expIdStr = String(exp.id);

    // Check if the ID matches directly (for string IDs)
    if (expIdStr === idString) return true;

    // Check if the ID matches after removing the "EXP-" prefix for string IDs
    if (expIdStr.startsWith("EXP-")) {
      const expNumericId = parseInt(expIdStr.replace("EXP-", ""), 10);
      return !isNaN(numericId) && expNumericId === numericId;
    }

    // For expenses with apiData, check the numeric ID
    if ("apiData" in exp && exp.id === numericId) return true;

    return false;
  });

  // Handle refetching when needed and stop loading indicators
  useEffect(() => {
    const handleRefreshIfNeeded = async () => {
      // If we need to refresh and haven't already done so
      if (needsRefresh && !hasRefreshed) {
        try {
          // Set flag to prevent multiple refreshes
          setHasRefreshed(true);
          // Refetch expenses
          await fetchExpenses();
          // Remove the refresh param from the URL without triggering a navigation
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } catch (error) {
          console.error("Error refetching expenses:", error);
        }
      }
      
      // Always stop loading indicators
      stopLoading();
      stopPageLoading();
    };
    
    handleRefreshIfNeeded();
  }, [needsRefresh, hasRefreshed, fetchExpenses, stopLoading, stopPageLoading]);

  const handleBack = () => {
    router.push("/user/expenses/reported");
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
        <h2 className="text-xl font-semibold mb-2">Expense not found</h2>
        <p className="text-muted-foreground mb-4">
          The expense you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={handleBack}>Back to Reported Expenses</Button>
      </div>
    );
  }

  return <ExpenseDetail expense={expense} onClose={handleBack} />;
}

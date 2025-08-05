"use client";

import UnreportedExpensesView from "@/components/expenses/UnreportedExpensesView";

export default function UnreportedExpensesPage() {
  // We'll rely on the ExpenseProvider's loading state instead of managing it here
  return <UnreportedExpensesView />;
}

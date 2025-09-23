"use client";

import UnreportedExpensesView from "@/components/expenses/UnreportedExpensesView";

export default function AdminUnreportedExpensesPage() {
  // We'll rely on the ExpenseProvider's loading state instead of managing it here
  return <UnreportedExpensesView />;
}

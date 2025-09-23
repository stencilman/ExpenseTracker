"use client";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ReportedExpensesTable from "@/components/expenses/ReportedExpensesTable";

export default function AdminReportedExpensesPage() {
  const pathname = usePathname();
  const { stopLoading } = useLoading();

  // Check if we're on a specific expense detail page
  const isDetailView = pathname.split("/").length > 5;

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  // If we're in detail view, don't render anything as the layout handles it
  if (isDetailView) {
    return null;
  }

  return <ReportedExpensesTable />;
}

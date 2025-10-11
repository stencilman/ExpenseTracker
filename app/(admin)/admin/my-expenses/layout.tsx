"use client";

import { TabNavigation } from "@/components/navigation/TabNavigation";
import { ExpensesProvider } from "@/components/providers/ExpenseProvider";
import React from "react";

export default function AdminExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ExpensesProvider>
      <div className="w-screen sm:w-auto">
        <TabNavigation
          tabs={[
            {
              label: "Unreported Expenses",
              href: "/admin/my-expenses/unreported",
            },
            {
              label: "Reported Expenses",
              href: "/admin/my-expenses/reported",
            },
            {
              label: "All Expenses",
              href: "/admin/my-expenses/all",
            },
          ]}
          variant="underline"
          size="lg"
          activeColor="blue-600"
          exactMatch={false}
        />

        <div className="mt-6 overflow-y-auto">{children}</div>
      </div>
    </ExpensesProvider>
  );
}

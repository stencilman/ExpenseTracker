"use client";

import { TabNavigation } from "@/components/navigation/TabNavigation";
import { ExpensesProvider } from "@/components/providers/ExpenseProvider";
import React from "react";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ExpensesProvider>
      <div className="">
        <TabNavigation
          tabs={[
            {
              label: "Unreported Expenses",
              href: "/user/expenses/unreported",
            },
            {
              label: "Reported Expenses",
              href: "/user/expenses/reported",
            },
            {
              label: "All Expenses",
              href: "/user/expenses/all",
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

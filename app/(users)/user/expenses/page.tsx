"use client";

import * as React from "react";
import { ExpensesTable } from "@/components/table/ExpensesTable";
import { Expense } from "@/components/table/TableColumnDefs";
import { Button } from "@/components/ui/button";

export default function ExpensesPage() {
  const expenses: Expense[] = [
    {
      id: "EXP-001",
      expenseDetails: "Bhive Passes and Trial Interview expense",
      merchant: "Bhive Workspace",
      amount: "Rs.3,486.00",
      reportName: "May-June Travel",
      date: "2025-05-16",
      category: "Travel",
      status: {
        label: "AWAITING APPROVAL",
        color: "orange",
      },
    },
    {
      id: "EXP-002",
      expenseDetails: "Client Meeting Lunch",
      merchant: "The Oberoi Restaurant",
      amount: "Rs.2,150.00",
      reportName: "May-June Business",
      date: "2025-05-18",
      category: "Meals",
      status: {
        label: "APPROVED",
        color: "green",
      },
    },
  ];

  const [selectedExpenses, setSelectedExpenses] = React.useState<Expense[]>([]);

  const handleSelectedRowsChange = (expenses: Expense[]) => {
    setSelectedExpenses(expenses);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button variant="outline">New Expense</Button>
      </div>

      <ExpensesTable
        data={expenses}
        enableRowSelection={true}
        onSelectedRowsChange={handleSelectedRowsChange}
        showPagination={true}
      />

      {selectedExpenses.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" className="mr-2">
            Export {selectedExpenses.length} selected
          </Button>
          <Button size="sm">Process {selectedExpenses.length} selected</Button>
        </div>
      )}
    </div>
  );
}

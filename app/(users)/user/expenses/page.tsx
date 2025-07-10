"use client";

import * as React from "react";
import { useState } from "react";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Expense } from "@/components/table/TableColumnDefs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AddNewExpense from "@/components/expenses/AddNewExpense";

export default function ExpensesPage() {
  const allExpenses: Expense[] = [
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

  const unreportedExpenses: Expense[] = [
    {
      id: "EXP-001",
      expenseDetails: "Bhive Passes and Trial Interview expense",
      merchant: "Bhive Workspace",
      amount: "Rs.3,486.00",
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
      date: "2025-05-18",
      category: "Meals",
      status: {
        label: "APPROVED",
        color: "green",
      },
    },
  ];

  const [selectedExpenses, setSelectedExpenses] = React.useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const handleSelectedRowsChange = (expenses: Expense[]) => {
    setSelectedExpenses(expenses);
  };
  
  const handleOpenAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button variant="outline" onClick={handleOpenAddExpense}>New Expense</Button>
      </div>
      
      <AddNewExpense isOpen={isAddExpenseOpen} onClose={handleCloseAddExpense} />

      <Tabs defaultValue="unreported-expenses" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="min-w-full">
            <TabsTrigger value="unreported-expenses" className="min-w-[150px]">
              Unreported Expenses
            </TabsTrigger>
            <TabsTrigger value="all-expenses" className="min-w-[150px]">
              All Expenses
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="unreported-expenses">
          <ExpensesTable
            data={unreportedExpenses}
            enableRowSelection={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            showPagination={true}
          />
        </TabsContent>
        <TabsContent value="all-expenses">
          <ExpensesTable
            data={allExpenses}
            enableRowSelection={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            showPagination={true}
          />
        </TabsContent>
      </Tabs>

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

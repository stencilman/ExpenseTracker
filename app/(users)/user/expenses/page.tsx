"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Expense } from "@/components/table/TableColumnDefs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AddNewExpense from "@/components/expenses/AddNewExpense";
import { ExpensesFilter, FilterOptions } from "@/components/expenses/ExpensesFilter";
import { ExpensesSort, SortOption } from "@/components/expenses/ExpensesSort";

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
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption | null>(null);
  
  // Extract unique values for filter options
  const categories = useMemo(
    () => [
      ...new Set([...allExpenses, ...unreportedExpenses].map((expense) => expense.category)),
    ],
    [allExpenses, unreportedExpenses]
  );
  
  const merchants = useMemo(
    () => [
      ...new Set([...allExpenses, ...unreportedExpenses].map((expense) => expense.merchant)),
    ],
    [allExpenses, unreportedExpenses]
  );
  
  const statuses = useMemo(
    () => [
      ...new Set(
        [...allExpenses, ...unreportedExpenses]
          .filter((expense) => expense.status)
          .map((expense) => expense.status?.label || "")
          .filter(Boolean)
      ),
    ],
    [allExpenses, unreportedExpenses]
  );

  const handleSelectedRowsChange = (expenses: Expense[]) => {
    setSelectedExpenses(expenses);
  };
  
  const handleOpenAddExpense = () => {
    setIsAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setIsAddExpenseOpen(false);
  };
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
  };
  
  // Apply filters and sorting to the expense data
  const filterExpenses = (expenses: Expense[]) => {
    let filteredData = [...expenses];
    
    // Apply date range filter
    if (filters.dateRange?.from) {
      filteredData = filteredData.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to || new Date();
        
        return fromDate ? expenseDate >= fromDate && expenseDate <= toDate : true;
      });
    }
    
    // Apply amount range filter
    if (filters.amountRange?.min !== undefined || filters.amountRange?.max !== undefined) {
      filteredData = filteredData.filter((expense) => {
        // Convert amount string (e.g., "Rs.3,486.00") to number
        const amountStr = expense.amount.replace(/[^\d.]/g, '');
        const amount = parseFloat(amountStr);
        
        const min = filters.amountRange?.min;
        const max = filters.amountRange?.max;
        
        if (min !== undefined && max !== undefined) {
          return amount >= min && amount <= max;
        } else if (min !== undefined) {
          return amount >= min;
        } else if (max !== undefined) {
          return amount <= max;
        }
        
        return true;
      });
    }
    
    // Apply category filter
    if (filters.categories?.length) {
      filteredData = filteredData.filter((expense) => 
        filters.categories?.includes(expense.category)
      );
    }
    
    // Apply merchant filter
    if (filters.merchants?.length) {
      filteredData = filteredData.filter((expense) => 
        filters.merchants?.includes(expense.merchant)
      );
    }
    
    // Apply status filter
    if (filters.status?.length) {
      filteredData = filteredData.filter((expense) => 
        expense.status && filters.status?.includes(expense.status.label)
      );
    }
    
    return filteredData;
  };
  
  // Apply sorting to the expense data
  const sortExpenses = (expenses: Expense[]) => {
    if (!sort) return expenses;
    
    return [...expenses].sort((a, b) => {
      let valueA, valueB;
      
      switch (sort.field) {
        case 'date':
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case 'amount':
          valueA = parseFloat(a.amount.replace(/[^\d.]/g, ''));
          valueB = parseFloat(b.amount.replace(/[^\d.]/g, ''));
          break;
        default:
          valueA = a[sort.field as keyof Expense] as string;
          valueB = b[sort.field as keyof Expense] as string;
      }
      
      if (sort.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };
  
  // Process the data with filters and sorting
  const processedUnreportedExpenses = useMemo(() => {
    const filtered = filterExpenses(unreportedExpenses);
    return sortExpenses(filtered);
  }, [unreportedExpenses, filters, sort]);
  
  const processedAllExpenses = useMemo(() => {
    const filtered = filterExpenses(allExpenses);
    return sortExpenses(filtered);
  }, [allExpenses, filters, sort]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex items-center space-x-2">
          <ExpensesSort onSortChange={handleSortChange} />
          <ExpensesFilter 
            onFilterChange={handleFilterChange}
            categories={categories}
            merchants={merchants}
            statuses={statuses}
          />
          <Button variant="outline" onClick={handleOpenAddExpense}>New Expense</Button>
        </div>
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
            data={processedUnreportedExpenses}
            enableRowSelection={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            showPagination={true}
          />
        </TabsContent>
        <TabsContent value="all-expenses">
          <ExpensesTable
            data={processedAllExpenses}
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

/**
 * ExpensesContext.tsx
 *
 * This file implements a shared context for expense data management across the application.
 * It provides a centralized way to manage expense data, filters, sorting, and selection state
 * for both the All Expenses and Unreported Expenses pages.
 *
 * The context follows the router-based navigation approach where:
 * - Each expense page (all, unreported) is a separate route
 * - The context provides shared state and functionality across these routes
 * - Filter/sort operations are applied consistently across all expense views
 * - The TabNavigation component handles the navigation between expense pages
 * - All expenses are stored in a central array
 * - Unreported expenses are filtered from the central array where reportName is null/undefined
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Expense } from "@/components/table/TableColumnDefs";
import { FilterOptions } from "./ExpensesFilter";
import { SortOption } from "./ExpensesSort";
import { toast } from "sonner";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

// API expense type from backend
interface ApiExpense {
  id: number;
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  notes?: string;
  receiptUrl?: string;
  userId: string;
  reportId?: number | null;
  createdAt: string;
  updatedAt: string;
}

// Extend the Expense type to include apiData for internal use
interface ExtendedExpense extends Expense {
  apiData?: ApiExpense;
}

// Function to convert API expense to UI expense format
function convertApiExpenseToUiExpense(apiExpense: ApiExpense): ExtendedExpense {
  // Format amount as currency string
  const formattedAmount = `Rs.${apiExpense.amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;  

  // Map status to UI status format with color
  let statusColor: "blue" | "green" | "red" | "orange" = "blue";
  switch (apiExpense.status) {
    case ExpenseStatus.APPROVED:
      statusColor = "green";
      break;
    case ExpenseStatus.REJECTED:
      statusColor = "red";
      break;
    case ExpenseStatus.REPORTED:
      statusColor = "orange";
      break;
    default:
      statusColor = "blue";
  }

  return {
    id: `EXP-${apiExpense.id}`,
    expenseDetails: apiExpense.description,
    merchant: apiExpense.notes || "Unknown", // Using notes as merchant for now
    amount: formattedAmount,
    reportName: apiExpense.reportId ? `Report-${apiExpense.reportId}` : undefined,
    date: apiExpense.date,
    category: apiExpense.category,
    status: {
      label: apiExpense.status,
      color: statusColor,
    },
    // Store original API expense data for reference
    apiData: apiExpense,
  };
}

// Fallback data in case API fails
const fallbackExpensesData: Expense[] = [
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

export interface ExpensesContextType {
  allExpenses: ExtendedExpense[];
  unreportedExpenses: ExtendedExpense[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  sort: SortOption | null;
  setSort: (sort: SortOption | null) => void;
  sortConfig: SortOption | null;
  setSortConfig: (sort: SortOption | null) => void;
  selectedExpenses: ExtendedExpense[];
  setSelectedExpenses: (expenses: ExtendedExpense[]) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  categories: string[];
  merchants: string[];
  statuses: string[];
  filterExpenses: (expenses: ExtendedExpense[]) => ExtendedExpense[];
  sortExpenses: (expenses: ExtendedExpense[]) => ExtendedExpense[];
  processedAllExpenses: ExtendedExpense[];
  processedUnreportedExpenses: ExtendedExpense[];
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  error: string | null;
  fetchExpenses: (filters?: Record<string, any>) => Promise<ExtendedExpense[]>;
  createExpense: (expenseData: Record<string, any>) => Promise<ExtendedExpense>;
  updateExpense: (id: string, expenseData: Record<string, any>) => Promise<ExtendedExpense>;
  deleteExpense: (id: string) => Promise<boolean>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined
);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  // Internal loading state management
  const [isLoading, setIsLoading] = useState(false);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // State for expense data
  const [allExpenses, setAllExpenses] = useState<ExtendedExpense[]>([]);
  const [unreportedExpenses, setUnreportedExpenses] = useState<ExtendedExpense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch expenses from API
  const fetchExpenses = useCallback(async (filters?: Record<string, any>) => {
    try {
      startLoading();
      setError(null);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.dateRange?.from) {
          queryParams.append('startDate', filters.dateRange.from.toISOString().split('T')[0]);
        }
        if (filters.dateRange?.to) {
          queryParams.append('endDate', filters.dateRange.to.toISOString().split('T')[0]);
        }
        if (filters.amountRange?.min !== undefined) {
          queryParams.append('minAmount', filters.amountRange.min.toString());
        }
        if (filters.amountRange?.max !== undefined) {
          queryParams.append('maxAmount', filters.amountRange.max.toString());
        }
        if (filters.categories?.length === 1) {
          queryParams.append('category', filters.categories[0]);
        }
        if (filters.status?.length === 1) {
          queryParams.append('status', filters.status[0]);
        }
      }
      
      // Add pagination (we'll fetch all for now and handle client-side pagination)
      queryParams.append('pageSize', '100'); // Fetch a large number to get all expenses
      
      // Make API request
      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert API expenses to UI format
      const uiExpenses = data.expenses.map(convertApiExpenseToUiExpense);
      
      // Update state
      setAllExpenses(uiExpenses);
      setUnreportedExpenses(uiExpenses.filter((expense: ExtendedExpense) => !expense.reportName));
      
      return uiExpenses;
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setError(error.message || 'Failed to fetch expenses');
      toast.error('Failed to fetch expenses');
      
      // Use fallback data if API fails
      if (!isInitialized) {
        setAllExpenses(fallbackExpensesData);
        setUnreportedExpenses(fallbackExpensesData.filter(expense => !expense.reportName));
        setIsInitialized(true);
      }
      
      throw error;
    } finally {
      stopLoading();
    }
  }, [isInitialized]);
  
  // Create a new expense
  const createExpense = useCallback(async (expenseData: Record<string, any>) => {
    try {
      startLoading();
      setError(null);
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create expense');
      }
      
      const data = await response.json();
      
      // Convert API expense to UI format
      const newExpense = convertApiExpenseToUiExpense(data);
      
      // Update state
      setAllExpenses(prev => [...prev, newExpense]);
      if (!newExpense.reportName) {
        setUnreportedExpenses(prev => [...prev, newExpense]);
      }
      
      toast.success('Expense created successfully');
      return newExpense;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError(error.message || 'Failed to create expense');
      toast.error('Failed to create expense');
      throw error;
    } finally {
      stopLoading();
    }
  }, []);
  
  // Update an existing expense
  const updateExpense = useCallback(async (id: string, expenseData: Record<string, any>) => {
    try {
      startLoading();
      setError(null);
      
      // Extract numeric ID from string (e.g., "EXP-123" -> 123)
      const numericId = parseInt(id.replace('EXP-', ''));
      
      const response = await fetch(`/api/expenses/${numericId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update expense ${id}`);
      }
      
      const data = await response.json();
      
      // Convert API expense to UI format
      const updatedExpense = convertApiExpenseToUiExpense(data);
      
      // Update state
      setAllExpenses(prev => prev.map((expense: ExtendedExpense) => 
        expense.id === id ? updatedExpense : expense
      ));
      
      setUnreportedExpenses(prev => {
        // If expense was unreported and is now reported, remove it
        if (updatedExpense.reportName) {
          return prev.filter((expense: ExtendedExpense) => expense.id !== id);
        }
        // If expense was unreported and is still unreported, update it
        else if (prev.some((expense: ExtendedExpense) => expense.id === id)) {
          return prev.map((expense: ExtendedExpense) => expense.id === id ? updatedExpense : expense);
        }
        // If expense was reported and is now unreported, add it
        else if (!updatedExpense.reportName) {
          return [...prev, updatedExpense];
        }
        return prev;
      });
      
      toast.success('Expense updated successfully');
      return updatedExpense;
    } catch (error: any) {
      console.error(`Error updating expense ${id}:`, error);
      setError(error.message || `Failed to update expense ${id}`);
      toast.error('Failed to update expense');
      throw error;
    } finally {
      stopLoading();
    }
  }, []);
  
  // Delete an expense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      startLoading();
      setError(null);
      
      // Extract numeric ID from string (e.g., "EXP-123" -> 123)
      const numericId = parseInt(id.replace('EXP-', ''));
      
      const response = await fetch(`/api/expenses/${numericId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete expense ${id}`);
      }
      
      // Update state
      setAllExpenses(prev => prev.filter((expense: ExtendedExpense) => expense.id !== id));
      setUnreportedExpenses(prev => prev.filter((expense: ExtendedExpense) => expense.id !== id));
      
      toast.success('Expense deleted successfully');
      return true;
    } catch (error: any) {
      console.error(`Error deleting expense ${id}:`, error);
      setError(error.message || `Failed to delete expense ${id}`);
      toast.error('Failed to delete expense');
      throw error;
    } finally {
      stopLoading();
    }
  }, []);
  
  // Initialize expenses on component mount
  useEffect(() => {
    if (!isInitialized) {
      fetchExpenses().then(() => {
        setIsInitialized(true);
      }).catch(() => {
        // Error handling is done in fetchExpenses
      });
    }
  }, [fetchExpenses, isInitialized]);

  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption | null>(null);
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<ExtendedExpense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Get unique categories from expenses
  const categories = useMemo(() => {
    return [...new Set(allExpenses.map((expense: ExtendedExpense) => expense.category))];
  }, [allExpenses]);

  // Get unique merchants from expenses
  const merchants = useMemo(() => {
    return [...new Set(allExpenses.map((expense: ExtendedExpense) => expense.merchant))];
  }, [allExpenses]);

  // Get unique statuses from expenses
  const statuses = useMemo(() => {
    return [
      ...new Set(
        allExpenses
          .filter((expense: ExtendedExpense) => expense.status)
          .map((expense: ExtendedExpense) => expense.status?.label || "")
          .filter(Boolean)
      ),
    ] as string[];
  }, [allExpenses]);

  // Apply filters to the expense data
  const filterExpenses = useCallback(
    (expenses: ExtendedExpense[]) => {
    let filteredData = [...expenses];

    // Apply date range filter
    if (filters.dateRange?.from) {
      filteredData = filteredData.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to || new Date();

        return fromDate
          ? expenseDate >= fromDate && expenseDate <= toDate
          : true;
      });
    }

    // Apply amount range filter
    if (
      filters.amountRange?.min !== undefined ||
      filters.amountRange?.max !== undefined
    ) {
      filteredData = filteredData.filter((expense) => {
        // Convert amount string (e.g., "Rs.3,486.00") to number
        const amountStr = expense.amount.replace(/[^\d.]/g, "");
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
      filteredData = filteredData.filter(
        (expense) =>
          expense.status && filters.status?.includes(expense.status.label)
      );
    }
    return filteredData;
  }, [filters]);

  // Apply sorting to the expense data
  const sortExpenses = useCallback(
    (expenses: ExtendedExpense[]) => {
    if (!sort) return expenses;

    return [...expenses].sort((a, b) => {
      let valueA, valueB;

      switch (sort.field) {
        case "date":
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
        case "amount":
          valueA = parseFloat(a.amount.replace(/[^\d.]/g, ""));
          valueB = parseFloat(b.amount.replace(/[^\d.]/g, ""));
          break;
        default:
          valueA = a[sort.field as keyof ExtendedExpense] as string;
          valueB = b[sort.field as keyof ExtendedExpense] as string;
      }

      if (sort.direction === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [sort]);

  // Process the data with filters and sorting
  const processedAllExpenses = useMemo(() => {
    return sortExpenses(filterExpenses(allExpenses));
  }, [allExpenses, filterExpenses, sortExpenses]);

  const processedUnreportedExpenses = useMemo(() => {
    return sortExpenses(filterExpenses(unreportedExpenses));
  }, [unreportedExpenses, filterExpenses, sortExpenses]);

  const value = useMemo(
    () => ({
      allExpenses,
      unreportedExpenses,
      filters,
      setFilters,
      sort,
      setSort,
      isLoading,
      startLoading,
      error,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
      sortConfig,
      setSortConfig,
      selectedExpenses,
      setSelectedExpenses,
      isAddExpenseOpen,
      setIsAddExpenseOpen,
      categories,
      merchants,
      statuses,
      filterExpenses,
      sortExpenses,
      processedAllExpenses,
      processedUnreportedExpenses,
      stopLoading,
    }),
    [
      allExpenses,
      unreportedExpenses,
      filters,
      sort,
      sortConfig,
      selectedExpenses,
      isAddExpenseOpen,
      processedAllExpenses,
      processedUnreportedExpenses,
      isLoading,
    ]
  );

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpensesProvider");
  }
  return context;
}

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
import { Expense, ExpenseWithUI, getStatusDisplay } from "@/types/expense";
import { FilterOptions } from "../expenses/ExpensesFilter";
import { SortOption } from "../expenses/ExpensesSort";
import { toast } from "sonner";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

// Function to convert API expense to UI expense format
function convertApiExpenseToUiExpense(apiExpense: Expense): ExpenseWithUI {
  // Determine status display properties
  const statusDisplay = getStatusDisplay(apiExpense.status);

  // Return the UI-formatted expense with all required fields
  return {
    ...apiExpense,
    statusDisplay,
    reportName: apiExpense.reportName,
  };
}

export interface ExpensesContextType {
  allExpenses: ExpenseWithUI[];
  unreportedExpenses: ExpenseWithUI[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  sort: SortOption | null;
  setSort: (sort: SortOption | null) => void;
  sortConfig: SortOption | null;
  setSortConfig: (sort: SortOption | null) => void;
  selectedExpenses: ExpenseWithUI[];
  setSelectedExpenses: (expenses: ExpenseWithUI[]) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  categories: string[];
  merchants: string[];
  statuses: string[];
  filterExpenses: (expenses: ExpenseWithUI[]) => ExpenseWithUI[];
  sortExpenses: (expenses: ExpenseWithUI[]) => ExpenseWithUI[];
  processedAllExpenses: ExpenseWithUI[];
  processedUnreportedExpenses: ExpenseWithUI[];
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  error: string | null;
  fetchExpenses: (filters?: Record<string, any>) => Promise<ExpenseWithUI[]>;
  createExpense: (expenseData: Record<string, any>) => Promise<ExpenseWithUI>;
  updateExpense: (
    id: string,
    expenseData: Record<string, any>
  ) => Promise<ExpenseWithUI>;
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
  const [allExpenses, setAllExpenses] = useState<ExpenseWithUI[]>([]);
  const [unreportedExpenses, setUnreportedExpenses] = useState<ExpenseWithUI[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch expenses from API
  const fetchExpenses = useCallback(
    async (filters?: Record<string, any>) => {
      try {
        startLoading();
        setError(null);

        // Build query string from filters
        const queryParams = new URLSearchParams();

        if (filters) {
          if (filters.dateRange?.from) {
            queryParams.append(
              "startDate",
              filters.dateRange.from.toISOString().split("T")[0]
            );
          }
          if (filters.dateRange?.to) {
            queryParams.append(
              "endDate",
              filters.dateRange.to.toISOString().split("T")[0]
            );
          }
          if (filters.amountRange?.min !== undefined) {
            queryParams.append("minAmount", filters.amountRange.min.toString());
          }
          if (filters.amountRange?.max !== undefined) {
            queryParams.append("maxAmount", filters.amountRange.max.toString());
          }
          if (filters.categories?.length === 1) {
            queryParams.append("category", filters.categories[0]);
          }
          if (filters.status?.length === 1) {
            queryParams.append("status", filters.status[0]);
          }
        }

        // Add pagination (we'll fetch all for now and handle client-side pagination)
        queryParams.append("pageSize", "100"); // Fetch a large number to get all expenses

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
        setUnreportedExpenses(
          uiExpenses.filter((expense: ExpenseWithUI) => !expense.reportName)
        );

        return uiExpenses;
      } catch (error: any) {
        console.error("Error fetching expenses:", error);
        setError(error.message || "Failed to fetch expenses");
        toast.error("Failed to fetch expenses");

        throw error;
      } finally {
        stopLoading();
      }
    },
    [isInitialized]
  );

  // Create a new expense
  const createExpense = useCallback(
    async (expenseData: Record<string, any>) => {
      try {
        startLoading();
        setError(null);

        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create expense");
        }

        const data = await response.json();

        // Convert API expense to UI format
        const newExpense = convertApiExpenseToUiExpense(data);

        // Update state
        setAllExpenses((prev) => [...prev, newExpense]);
        if (!newExpense.reportName) {
          setUnreportedExpenses((prev) => [...prev, newExpense]);
        }

        toast.success("Expense created successfully");
        return newExpense;
      } catch (error: any) {
        console.error("Error creating expense:", error);
        setError(error.message || "Failed to create expense");
        toast.error("Failed to create expense");
        throw error;
      } finally {
        stopLoading();
      }
    },
    []
  );

  // Update an existing expense
  const updateExpense = useCallback(
    async (id: string, expenseData: Record<string, any>) => {
      try {
        startLoading();
        setError(null);

        // Extract numeric ID from string (e.g., "EXP-123" -> 123)
        const numericId = parseInt(id.replace("EXP-", ""));

        const response = await fetch(`/api/expenses/${numericId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
        // Convert IDs to strings for comparison to avoid type mismatch errors
        const idStr = String(id);
        setAllExpenses((prev) =>
          prev.map((expense: ExpenseWithUI) =>
            String(expense.id) === idStr ? updatedExpense : expense
          )
        );

        setUnreportedExpenses((prev) => {
          // If expense was unreported and is now reported (has a report ID), remove it
          if (updatedExpense.status !== "UNREPORTED") {
            return prev.filter(
              (expense: ExpenseWithUI) => String(expense.id) !== String(id)
            );
          }
          // If expense was unreported and is still unreported, update it
          else if (
            prev.some(
              (expense: ExpenseWithUI) => String(expense.id) === String(id)
            )
          ) {
            return prev.map((expense: ExpenseWithUI) =>
              String(expense.id) === String(id) ? updatedExpense : expense
            );
          }
          // If expense was reported and is now unreported, add it
          else if (!updatedExpense.reportName) {
            return [...prev, updatedExpense];
          }
          return prev;
        });

        toast.success("Expense updated successfully");
        return updatedExpense;
      } catch (error: any) {
        console.error(`Error updating expense ${id}:`, error);
        setError(error.message || `Failed to update expense ${id}`);
        toast.error("Failed to update expense");
        throw error;
      } finally {
        stopLoading();
      }
    },
    []
  );

  // Delete an expense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      startLoading();
      setError(null);

      // Extract numeric ID from string (e.g., "EXP-123" -> 123)
      const numericId = parseInt(id.replace("EXP-", ""));

      const response = await fetch(`/api/expenses/${numericId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete expense ${id}`);
      }

      // Update state
      // Convert IDs to strings for comparison to avoid type mismatch errors
      const idStr = String(id);
      setAllExpenses((prev) =>
        prev.filter((expense: ExpenseWithUI) => String(expense.id) !== idStr)
      );
      setUnreportedExpenses((prev) =>
        prev.filter((expense: ExpenseWithUI) => String(expense.id) !== idStr)
      );

      toast.success("Expense deleted successfully");
      return true;
    } catch (error: any) {
      console.error(`Error deleting expense ${id}:`, error);
      setError(error.message || `Failed to delete expense ${id}`);
      toast.error("Failed to delete expense");
      throw error;
    } finally {
      stopLoading();
    }
  }, []);

  // Initialize expenses on component mount
  useEffect(() => {
    if (!isInitialized) {
      fetchExpenses()
        .then(() => {
          setIsInitialized(true);
        })
        .catch(() => {
          // Error handling is done in fetchExpenses
        });
    }
  }, [fetchExpenses, isInitialized]);

  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption | null>(null);
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<ExpenseWithUI[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Get unique categories from expenses
  const categories = useMemo(() => {
    return [
      ...new Set(allExpenses.map((expense: ExpenseWithUI) => expense.category)),
    ];
  }, [allExpenses]);

  // Get unique merchants from expenses
  const merchants = useMemo(() => {
    return [
      ...new Set(allExpenses.map((expense: ExpenseWithUI) => expense.merchant)),
    ];
  }, [allExpenses]);

  // Get unique statuses from expenses
  const statuses = useMemo(() => {
    return [
      ...new Set(
        allExpenses
          .filter((expense: ExpenseWithUI) => expense.status)
          .map((expense: ExpenseWithUI) => {
            // Use statusDisplay if available, otherwise use the getStatusDisplay helper
            return (
              expense.statusDisplay?.label ||
              (expense.status ? getStatusDisplay(expense.status).label : "")
            );
          })
          .filter(Boolean)
      ),
    ] as string[];
  }, [allExpenses]);

  // Apply filters to the expense data
  const filterExpenses = useCallback(
    (expenses: ExpenseWithUI[]) => {
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
          // Get amount as number (it's already a number in the updated Expense type)
          const amount =
            typeof expense.amount === "number"
              ? expense.amount
              : parseFloat(String(expense.amount).replace(/[^\d.]/g, ""));

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
        filteredData = filteredData.filter((expense) => {
          if (!expense.status) return false;

          // Get the status display label
          const statusLabel =
            expense.statusDisplay?.label ||
            (expense.status ? getStatusDisplay(expense.status).label : "");

          return filters.status?.includes(statusLabel);
        });
      }
      return filteredData;
    },
    [filters]
  );

  // Apply sorting to the expense data
  const sortExpenses = useCallback(
    (expenses: ExpenseWithUI[]) => {
      if (!sort) return expenses;

      return [...expenses].sort((a, b) => {
        let valueA, valueB;

        switch (sort.field) {
          case "date":
            valueA = new Date(a.date).getTime();
            valueB = new Date(b.date).getTime();
            break;
          case "amount":
            valueA =
              typeof a.amount === "number"
                ? a.amount
                : parseFloat(String(a.amount).replace(/[^\d.]/g, ""));
            valueB =
              typeof b.amount === "number"
                ? b.amount
                : parseFloat(String(b.amount).replace(/[^\d.]/g, ""));
            break;
          default:
            valueA = a[sort.field as keyof ExpenseWithUI] as string;
            valueB = b[sort.field as keyof ExpenseWithUI] as string;
        }

        if (sort.direction === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    },
    [sort]
  );

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

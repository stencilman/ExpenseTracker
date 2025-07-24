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
} from "react";
import { Expense } from "@/components/table/TableColumnDefs";
import { FilterOptions } from "./ExpensesFilter";
import { SortOption } from "./ExpensesSort";
import { useLoading } from "@/components/providers/loading-provider";

const centralExpensesData: Expense[] = [
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
  {
    id: "EXP-003",
    expenseDetails: "Taxi to airport",
    merchant: "Uber",
    amount: "Rs.850.00",
    reportName: undefined,
    date: "2025-05-20",
    category: "Travel",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-004",
    expenseDetails: "Office supplies purchase",
    merchant: "Amazon Business",
    amount: "Rs.1,250.00",
    reportName: "Office Expenses Q2",
    date: "2025-05-22",
    category: "Office Supplies",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-005",
    expenseDetails: "Team dinner",
    merchant: "Barbecue Nation",
    amount: "Rs.4,200.00",
    reportName: undefined,
    date: "2025-05-25",
    category: "Meals",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-006",
    expenseDetails: "Software subscription",
    merchant: "Microsoft",
    amount: "Rs.12,500.00",
    reportName: "IT Expenses May",
    date: "2025-05-01",
    category: "Software",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-007",
    expenseDetails: "Parking fees",
    merchant: "Central Mall",
    amount: "Rs.200.00",
    reportName: undefined,
    date: "2025-05-28",
    category: "Travel",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-008",
    expenseDetails: "Conference registration",
    merchant: "TechConf India",
    amount: "Rs.8,500.00",
    reportName: "Training & Development",
    date: "2025-05-30",
    category: "Training",
    status: {
      label: "AWAITING APPROVAL",
      color: "orange",
    },
  },
  {
    id: "EXP-009",
    expenseDetails: "Hotel accommodation",
    merchant: "Taj Hotels",
    amount: "Rs.15,000.00",
    reportName: "Business Travel June",
    date: "2025-06-02",
    category: "Accommodation",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-010",
    expenseDetails: "Coffee with client",
    merchant: "Starbucks",
    amount: "Rs.450.00",
    reportName: undefined,
    date: "2025-06-05",
    category: "Meals",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-011",
    expenseDetails: "Flight tickets",
    merchant: "IndiGo Airlines",
    amount: "Rs.18,500.00",
    reportName: "Business Travel June",
    date: "2025-06-08",
    category: "Travel",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-012",
    expenseDetails: "Mobile recharge",
    merchant: "Airtel",
    amount: "Rs.399.00",
    reportName: undefined,
    date: "2025-06-10",
    category: "Communications",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-013",
    expenseDetails: "Laptop repair",
    merchant: "HP Service Center",
    amount: "Rs.3,200.00",
    reportName: "IT Maintenance",
    date: "2025-06-12",
    category: "Equipment",
    status: {
      label: "AWAITING APPROVAL",
      color: "orange",
    },
  },
  {
    id: "EXP-014",
    expenseDetails: "Gym membership",
    merchant: "Cult Fitness",
    amount: "Rs.2,500.00",
    reportName: undefined,
    date: "2025-06-15",
    category: "Wellness",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-015",
    expenseDetails: "Book purchase",
    merchant: "Amazon",
    amount: "Rs.1,800.00",
    reportName: "Learning & Development",
    date: "2025-06-18",
    category: "Education",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-016",
    expenseDetails: "Fuel expenses",
    merchant: "Indian Oil",
    amount: "Rs.2,000.00",
    reportName: undefined,
    date: "2025-06-20",
    category: "Travel",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-017",
    expenseDetails: "Office rent",
    merchant: "Co-working Space",
    amount: "Rs.25,000.00",
    reportName: "Office Expenses Q2",
    date: "2025-06-01",
    category: "Office Rent",
    status: {
      label: "APPROVED",
      color: "green",
    },
  },
  {
    id: "EXP-018",
    expenseDetails: "Internet bill",
    merchant: "Jio Fiber",
    amount: "Rs.999.00",
    reportName: undefined,
    date: "2025-06-22",
    category: "Communications",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
  {
    id: "EXP-019",
    expenseDetails: "Marketing materials",
    merchant: "Print Shop",
    amount: "Rs.3,500.00",
    reportName: "Marketing Q2",
    date: "2025-06-25",
    category: "Marketing",
    status: {
      label: "AWAITING APPROVAL",
      color: "orange",
    },
  },
  {
    id: "EXP-020",
    expenseDetails: "Lunch during travel",
    merchant: "Local Restaurant",
    amount: "Rs.650.00",
    reportName: undefined,
    date: "2025-06-28",
    category: "Meals",
    status: {
      label: "PENDING",
      color: "blue",
    },
  },
];

export interface ExpensesContextType {
  allExpenses: Expense[];
  unreportedExpenses: Expense[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  sort: SortOption | null;
  setSort: (sort: SortOption | null) => void;
  sortConfig: SortOption | null;
  setSortConfig: (sort: SortOption | null) => void;
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (isOpen: boolean) => void;
  categories: string[];
  merchants: string[];
  statuses: string[];
  filterExpenses: (expenses: Expense[]) => Expense[];
  sortExpenses: (expenses: Expense[]) => Expense[];
  processedAllExpenses: Expense[];
  processedUnreportedExpenses: Expense[];
  stopLoading: () => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined
);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  // Get loading state from provider
  const { stopLoading: stopPageLoading } = useLoading();

  // State for expense data - using central array
  const [allExpenses] = useState<Expense[]>(centralExpensesData);

  // Filter unreported expenses from central array (where reportName is null or undefined)
  const [unreportedExpenses] = useState<Expense[]>(
    centralExpensesData.filter((expense) => !expense.reportName)
  );

  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption | null>(null);
  const [sortConfig, setSortConfig] = useState<SortOption | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Extract unique values for filter options from central array
  const categories = useMemo(
    () => [...new Set(centralExpensesData.map((expense) => expense.category))],
    []
  );

  const merchants = useMemo(
    () => [...new Set(centralExpensesData.map((expense) => expense.merchant))],
    []
  );

  const statuses = useMemo(
    () => [
      ...new Set(
        centralExpensesData
          .filter((expense) => expense.status)
          .map((expense) => expense.status?.label || "")
          .filter(Boolean)
      ),
    ],
    []
  );

  // Apply filters to the expense data
  const filterExpenses = (expenses: Expense[]) => {
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
  };

  // Apply sorting to the expense data
  const sortExpenses = (expenses: Expense[]) => {
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
          valueA = a[sort.field as keyof Expense] as string;
          valueB = b[sort.field as keyof Expense] as string;
      }

      if (sort.direction === "asc") {
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
  }, [filters, sort, unreportedExpenses]);

  const processedAllExpenses = useMemo(() => {
    const filtered = filterExpenses(allExpenses);
    return sortExpenses(filtered);
  }, [filters, sort, allExpenses]);

  const value = useMemo(
    () => ({
      allExpenses,
      unreportedExpenses,
      filters,
      setFilters,
      sort,
      setSort,
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
      stopLoading: stopPageLoading,
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
      stopPageLoading,
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

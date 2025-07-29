import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

/**
 * Base Expense type that matches the Prisma schema
 * This should be the single source of truth for Expense data structure
 */
export interface Expense {
  id: number;
  amount: number;
  merchant: string;
  date: Date | string; // Date for client-side, string for API responses
  description: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receiptUrls?: string[];
  notes?: string | null;
  claimReimbursement: boolean; // Whether the user wants to claim reimbursement for this expense
  userId: string;
  reportId?: number | null; // Optional report association
  reportName?: string;
  createdAt: Date | string; // Date for client-side, string for API responses
  updatedAt: Date | string; // Date for client-side, string for API responses
}

/**
 * UI-specific extension of the Expense type
 * Includes additional UI-specific properties
 */
export interface ExpenseWithUI extends Expense {
  // UI-specific properties
  reportName?: string;
  statusDisplay?: {
    label: string;
    color: "green" | "orange" | "blue" | "red";
  };
}

/**
 * Form values for expense creation/editing
 */
export interface ExpenseFormValues {
  amount: number;
  merchant: string;
  date: Date | string;
  description: string;
  category: ExpenseCategory;
  notes?: string;
  receiptUrls?: string[];
  status?: ExpenseStatus;
  reportId?: number | null;
  report?: string; // For the report dropdown UI value
}

/**
 * Helper function to format an expense for display
 */
export function formatExpenseForDisplay(expense: Expense): ExpenseWithUI {
  // Create a UI-friendly version of the expense
  const statusDisplay = getStatusDisplay(expense.status);

  return {
    ...expense,
    statusDisplay
  };
}

/**
 * Helper function to get status display properties
 */
export function getStatusDisplay(status: ExpenseStatus) {
  switch (status) {
    case 'APPROVED':
      return { label: 'Approved', color: 'green' as const };
    case 'REJECTED':
      return { label: 'Rejected', color: 'red' as const };
    case 'REPORTED':
      return { label: 'Reported', color: 'orange' as const };
    case 'REIMBURSED':
      return { label: 'Reimbursed', color: 'green' as const };
    case 'UNREPORTED':
    default:
      return { label: 'Unreported', color: 'blue' as const };
  }
}

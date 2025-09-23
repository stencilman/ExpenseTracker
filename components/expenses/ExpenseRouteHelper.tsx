"use client";

import { usePathname } from "next/navigation";

/**
 * Helper hook to determine the correct expense route based on the current path
 * This ensures that admins are directed to admin routes and users to user routes
 */
export function useExpenseRoutes() {
  const pathname = usePathname();
  
  // Determine if we're in the admin section
  const isAdmin = pathname?.includes('/admin/');
  
  // Get the expense type (all, reported, unreported)
  let expenseType = 'all';
  if (pathname?.includes('/reported')) {
    expenseType = 'reported';
  } else if (pathname?.includes('/unreported')) {
    expenseType = 'unreported';
  }
  
  /**
   * Get the correct route for an expense detail page
   * @param expenseId - The ID of the expense
   * @returns The correct route for the expense detail page
   */
  const getExpenseDetailRoute = (expenseId: string | number) => {
    if (isAdmin) {
      return `/admin/my-expenses/${expenseType}/${expenseId}`;
    } else {
      return `/user/expenses/${expenseType}/${expenseId}`;
    }
  };
  
  /**
   * Get the base route for the current expense type
   * @returns The base route for the current expense type
   */
  const getBaseRoute = () => {
    if (isAdmin) {
      return `/admin/my-expenses/${expenseType}`;
    } else {
      return `/user/expenses/${expenseType}`;
    }
  };
  
  return {
    isAdmin,
    expenseType,
    getExpenseDetailRoute,
    getBaseRoute
  };
}

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/utils/format-utils";

interface CategoryBreakdown {
  category: string;
  amount: number;
}

interface CategoryBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeframe: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  isAdmin?: boolean;
}

export default function CategoryBreakdownDialog({
  open,
  onOpenChange,
  timeframe,
  startDate,
  endDate,
  category,
  isAdmin = false,
}: CategoryBreakdownDialogProps) {
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCategoryBreakdown();
    }
  }, [open, timeframe, startDate, endDate, category]);

  const fetchCategoryBreakdown = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the URL with query parameters
      const baseUrl = isAdmin 
        ? "/api/admin/dashboard/metrics/category-breakdown"
        : "/api/user/dashboard/metrics/category-breakdown";
      
      let url = `${baseUrl}?timeframe=${timeframe}`;
      
      if (timeframe === "custom" && startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      if (category && category !== "all") {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch category breakdown");
      }
      
      const data = await response.json();
      setBreakdown(data.categoryBreakdown);
    } catch (err) {
      console.error("Error fetching category breakdown:", err);
      setError("Failed to load category breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Category-wise Reimbursement Breakdown</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading breakdown...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : breakdown.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No reimbursed expenses found for this period.</div>
        ) : (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">{formatCategoryName(item.category)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right">
                      {totalAmount > 0 ? `${((item.amount / totalAmount) * 100).toFixed(1)}%` : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

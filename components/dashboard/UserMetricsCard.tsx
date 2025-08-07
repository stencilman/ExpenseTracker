"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format-utils";
import { ExpenseCategory } from "@prisma/client";
import { DateRange } from "react-day-picker";
import CategoryBreakdownDialog from "@/components/dashboard/CategoryBreakdownDialog";

export default function UserMetricsCard() {
  const [timeframe, setTimeframe] = useState("thisMonth");
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isLoadingReimbursed, setIsLoadingReimbursed] = useState(false);
  const [reimbursedAmount, setReimbursedAmount] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/expenses/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch metrics with filtered-total endpoint that handles all filter combinations
  const fetchMetrics = async (
    timeframe: string,
    category?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      setIsLoadingReimbursed(true);

      // Build URL with all applicable filters
      let url = `/api/user/dashboard/metrics/filtered-total?timeframe=${timeframe}`;

      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      if (timeframe === "custom" && startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      const data = await response.json();
      setReimbursedAmount(data.totalReimbursed);
      setPendingAmount(data.totalPending);
      return data.totalReimbursed;
    } catch (err) {
      console.error("Error fetching metrics:", err);
      return 0;
    } finally {
      setIsLoadingReimbursed(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMetrics("thisMonth");
  }, []);

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    if (value !== "custom") {
      fetchMetrics(value, category || undefined);
    } else if (dateRange.from && dateRange.to) {
      fetchMetrics("custom", category || undefined, dateRange.from, dateRange.to);
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const newCategory = value === "all" ? null : value;
    setCategory(newCategory);
    
    if (timeframe === "custom" && dateRange.from && dateRange.to) {
      fetchMetrics("custom", newCategory || undefined, dateRange.from, dateRange.to);
    } else {
      fetchMetrics(timeframe, newCategory || undefined);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      if (range.from && range.to) {
        fetchMetrics("custom", category || undefined, range.from, range.to);
      }
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium mb-1">Timeframe</div>
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisQuarter">This Quarter</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Category</div>
            <Select value={category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {timeframe === "custom" && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-1">Date Range</div>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Reimbursed</div>
            <div className="text-2xl font-bold">
              {isLoadingReimbursed ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(reimbursedAmount)
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCategoryBreakdown(true)}
                className="text-xs"
              >
                See category-wise detail
              </Button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Pending Payment</div>
            <div className="text-2xl font-bold">
              {isLoadingReimbursed ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(pendingAmount)
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Category Breakdown Dialog */}
      <CategoryBreakdownDialog
        open={showCategoryBreakdown}
        onOpenChange={setShowCategoryBreakdown}
        timeframe={timeframe}
        startDate={dateRange.from || undefined}
        endDate={dateRange.to || undefined}
        category={category || undefined}
        isAdmin={false}
      />
    </Card>
  );
}

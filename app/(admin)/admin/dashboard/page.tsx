"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/utils/format-utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ReportStatus } from "@prisma/client";

type DashboardMetrics = {
  financialOverview: {
    pendingReimbursementAmount: number;
    ytdApprovedCount: number;
    ytdRejectedCount: number;
    avgProcessingDays: string;
  };
  approvalQueueMetrics: {
    awaitingApprovalCount: number;
    awaitingReimbursementCount: number;
    pendingOverSevenDaysCount: number;
  };
  reimbursedAmounts: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
    allTime: number;
  };
  recentActivity: {
    id: number;
    title: string;
    status: ReportStatus;
    updatedAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("thisMonth");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [customDateRange, setCustomDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [isLoadingCustomAmount, setIsLoadingCustomAmount] = useState(false);

  // Handle timeframe selection
  useEffect(() => {
    // Only open the dialog when the user selects 'custom' from the dropdown
    // and not when we're just setting state after applying custom dates
    if (selectedTimeframe === "custom" && !isDatePickerOpen && 
        (!customDateRange.start || !customDateRange.end)) {
      setIsDatePickerOpen(true);
    }
  }, [selectedTimeframe, isDatePickerOpen, !!customDateRange.start, !!customDateRange.end]);

  // Fetch custom date range data
  const fetchCustomRangeData = async () => {
    if (!customDateRange.start || !customDateRange.end) return;
    
    setIsLoadingCustomAmount(true);
    try {
      const response = await fetch(`/api/admin/dashboard/metrics/custom-range`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: customDateRange.start.toISOString(),
          endDate: customDateRange.end.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch custom range data");
      }

      const data = await response.json();
      setCustomAmount(data.totalReimbursed);
    } catch (err) {
      console.error("Error fetching custom range data:", err);
    } finally {
      setIsLoadingCustomAmount(false);
    }
  };

  // Fetch custom range data when date range changes
  useEffect(() => {
    if (selectedTimeframe === "custom" && customDateRange.start && customDateRange.end) {
      fetchCustomRangeData();
    }
  }, [customDateRange]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/metrics");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard metrics");
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        setError("Failed to load dashboard metrics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!metrics) {
    return (
      <div className="text-gray-500 text-center p-4">
        No dashboard data available
      </div>
    );
  }

  const getStatusBadgeColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-300";
      case ReportStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-300";
      case ReportStatus.REIMBURSED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-6rem)] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Financial Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Amount Reimbursed Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Reimbursed
                </CardTitle>
                <Select
                  value={selectedTimeframe}
                  onValueChange={setSelectedTimeframe}
                >
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Select period" />
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
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {selectedTimeframe === "custom" ? (
                    isLoadingCustomAmount ? (
                      <span className="flex items-center">
                        <span className="inline-block h-4 w-4 mr-2">
                          <Loader className="h-4 w-4 animate-spin" />
                        </span>
                        Loading...
                      </span>
                    ) : (
                      formatCurrency(customAmount)
                    )
                  ) : (
                    metrics?.reimbursedAmounts ? 
                      formatCurrency(metrics.reimbursedAmounts[selectedTimeframe as keyof typeof metrics.reimbursedAmounts]) : 
                      formatCurrency(0)
                  )}
                </div>
                {selectedTimeframe === "custom" && customDateRange.start && customDateRange.end && (
                  <p className="text-xs text-gray-500 font-normal">
                    {format(customDateRange.start, "MMM d, yyyy")} - {format(customDateRange.end, "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Reimbursement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  metrics.financialOverview.pendingReimbursementAmount
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                YTD Approved Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.financialOverview.ytdApprovedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                YTD Rejected Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.financialOverview.ytdRejectedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Avg. Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.financialOverview.avgProcessingDays} days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Queue Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Approval Queue Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Awaiting Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.approvalQueueMetrics.awaitingApprovalCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Awaiting Reimbursement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.approvalQueueMetrics.awaitingReimbursementCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {metrics.approvalQueueMetrics.pendingOverSevenDaysCount}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      {/* Custom Date Range Dialog */}
      <Dialog open={isDatePickerOpen} onOpenChange={(open) => {
        if (!open && selectedTimeframe === "custom" && (!customDateRange.start || !customDateRange.end)) {
          // If dialog is closed without selecting dates, reset to previous selection
          setSelectedTimeframe("thisMonth");
        }
        setIsDatePickerOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">Start Date</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      fromYear={2000}
                      toYear={2030}
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">End Date</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!startDate}
                    >
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      fromYear={2000}
                      toYear={2030}
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : true}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDatePickerOpen(false);
              setSelectedTimeframe("thisMonth");
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (startDate && endDate) {
                setCustomDateRange({start: startDate, end: endDate});
                setIsDatePickerOpen(false);
              }
            }} disabled={!startDate || !endDate}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="px-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{`${activity.user.firstName} ${activity.user.lastName}`}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadgeColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2 px-4 text-center text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

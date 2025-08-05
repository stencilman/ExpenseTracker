"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { formatCurrency } from "@/lib/utils/format-utils";
import { Badge } from "@/components/ui/badge";
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
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 flex items-center justify-between"
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
                <div className="p-4 text-center text-gray-500">
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

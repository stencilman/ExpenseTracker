"use client";

import Header from "@/components/dashboard/Header";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import QuickAddTasks from "@/components/dashboard/QuickAddTasks";
import ReportsSummaryCard from "@/components/dashboard/ReportsSummaryCard";
import UserMetricsCard from "@/components/dashboard/UserMetricsCard";
import { useLoading } from "@/components/providers/LoadingProvider";
import { useEffect } from "react";

export default function Dashboard() {
  const { stopLoading } = useLoading();

  // Stop loading when dashboard is mounted.
  // Will be modified once data fetching is implemented.
  useEffect(() => {
    stopLoading();
  }, []);

  return (
    <div className="flex flex-col p-4 sm:p-6 w-screen max-w-7xl mx-auto h-[calc(100vh-5rem)] overflow-y-auto">
      <Header />

      <div className="mt-4 flex flex-col xl:flex-row gap-4 sm:gap-6">
        <div className="w-full xl:w-1/3">
          <PendingTasksCard />
        </div>
        <div className="w-full xl:w-2/3 mt-4 lg:mt-0">
          <QuickAddTasks />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <UserMetricsCard />
      </div>

      <div className="mt-4 sm:mt-6">
        <ReportsSummaryCard />
      </div>
    </div>
  );
}

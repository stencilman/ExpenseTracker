"use client";

import Header from "@/components/dashboard/Header";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import QuickAddTasks from "@/components/dashboard/QuickAddTasks";
import ReportsSummaryCard from "@/components/dashboard/ReportsSummaryCard";
import { useLoading } from "@/components/providers/loading-provider";
import { useEffect } from "react";

export default function Dashboard() {
  const { stopLoading } = useLoading();

  // Stop loading when dashboard is mounted.
  // Will be modified once data fetching is implemented.
  useEffect(() => {
    stopLoading();
  }, []);

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-7xl mx-auto">
      <Header />

      <div className="mt-4 flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="w-full md:w-1/3">
          <PendingTasksCard />
        </div>
        <div className="w-full md:w-2/3 mt-4 md:mt-0">
          <QuickAddTasks />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <ReportsSummaryCard />
      </div>
    </div>
  );
}

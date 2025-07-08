import Header from "@/components/dashboard/Header";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import QuickAddTasks from "@/components/dashboard/QuickAddTasks";
import RecentTripCard from "@/components/dashboard/RecentTripCard";
import ReportsSummaryCard from "@/components/dashboard/ReportsSummaryCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto">
      <Header />

      <div className="mt-4 flex gap-6">
        <div className="w-1/3">
          <PendingTasksCard />
        </div>
        <div className="w-2/3">
          <QuickAddTasks />
        </div>
      </div>

      <div className="mt-6">
        <ReportsSummaryCard />
      </div>
    </div>
  );
}

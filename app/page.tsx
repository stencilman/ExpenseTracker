import Header from "@/components/dashboard/Header";
import PendingTasksCard from "@/components/dashboard/PendingTasksCard";
import QuickAddTasks from "@/components/dashboard/QuickAddTasks";
import ReportsSummaryCard from "@/components/dashboard/ReportsSummaryCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <Header />

      <div className="mt-4 h-56 flex gap-4">
        <PendingTasksCard />
        <QuickAddTasks />
      </div>

      <div className="mt-8 ">
        <ReportsSummaryCard />
      </div>
    </div>
  );
}

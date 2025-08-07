"use client";

import { Badge } from "@/components/ui/badge";
import { ReportStatus } from "@prisma/client";

interface ActivityUser {
  firstName: string;
  lastName: string;
  email?: string;
}

export interface RecentActivity {
  id: number | string; // Accept both number and string types
  title: string;
  status: string | ReportStatus; // Accept both string and enum types
  updatedAt: string;
  user: ActivityUser;
}

interface DashboardRecentActivityItemProps {
  activity: RecentActivity;
}

export default function DashboardRecentActivityItem({ activity }: DashboardRecentActivityItemProps) {
  // Helper function to determine badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "REIMBURSED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="py-3 px-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex-1 mr-4">
        <p className="font-medium text-gray-900 mb-1">{activity.title}</p>
        <p className="text-sm text-gray-500">{`${activity.user.firstName} ${activity.user.lastName}`}</p>
      </div>
      <div className="flex items-center space-x-3">
        <Badge className={`${getStatusBadgeColor(activity.status)} px-3 py-1 rounded-md font-medium`}>
          {activity.status}
        </Badge>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(activity.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

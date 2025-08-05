"use client";

import { format } from "date-fns";
import {
  FileText,
  FileIcon,
  CheckCircle,
  XCircle,
  CreditCard,
  Send,
} from "lucide-react";
import { ExpenseEventType } from "@prisma/client";

interface HistoryItemCardProps {
  id: string | number;
  eventType: ExpenseEventType | string;
  eventDate: Date | string;
  details?: string | null;
  performedBy?: {
    name: string;
  } | null;
  report?: {
    id: number;
    title: string;
  } | null;
}

export default function HistoryItemCard({
  id,
  eventType,
  eventDate,
  details,
  performedBy,
  report,
}: HistoryItemCardProps) {
  // Helper function to get the appropriate icon based on event type
  const getEventIcon = () => {
    switch (eventType) {
      case "CREATED":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "ADDED_TO_REPORT":
        return <FileIcon className="h-5 w-5 text-orange-500" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "REIMBURSED":
        return <CreditCard className="h-5 w-5 text-green-700" />;
      case "SUBMITTED":
        return <Send className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper function to get the event title based on event type
  const getEventTitle = () => {
    switch (eventType) {
      case "APPROVED":
        return report ? "Report Approved" : "Expense Approved";
      case "REJECTED":
        return report ? "Report Rejected" : "Expense Rejected";
      case "REIMBURSED":
        return report ? "Report Reimbursed" : "Expense Reimbursed";
      case "SUBMITTED":
        return "Report Submitted";
      default:
        // Handle report-specific events
        switch (eventType) {
          case "CREATED":
            return report ? "Report Created" : "Expense Created";
          case "ADDED_TO_REPORT":
            return (
              <>
                Added to Report{" "}
                {report?.title && (
                  <span className="font-normal">({report.title})</span>
                )}
              </>
            );
          default:
            return "Event";
        }
    }
  };

  return (
    <div key={id} className="border-l-2 border-gray-200 pl-4 py-2">
      <div className="flex items-start">
        {/* Event icon based on type */}
        <div className="mr-3 mt-0.5">{getEventIcon()}</div>

        {/* Event content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <h4 className="font-medium text-gray-900">{getEventTitle()}</h4>
            <time className="text-xs text-gray-500 mt-1 sm:mt-0">
              {format(new Date(eventDate), "MMM d, yyyy h:mm a")}
            </time>
          </div>

          {details && <p className="mt-1 text-sm text-gray-600">{details}</p>}

          {performedBy && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <span>By {performedBy.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

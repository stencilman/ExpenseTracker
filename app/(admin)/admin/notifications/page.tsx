"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@prisma/client";

// Map notification types to badge colors
const typeToBadge: Record<NotificationType, { color: string; label: string }> = {
  REPORT_SUBMITTED: {
    color: "bg-blue-100 text-blue-800",
    label: "Report Submitted",
  },
  REPORT_APPROVED: {
    color: "bg-green-100 text-green-800",
    label: "Report Approved",
  },
  REPORT_REJECTED: {
    color: "bg-red-100 text-red-800",
    label: "Report Rejected",
  },
  REPORT_REIMBURSED: {
    color: "bg-purple-100 text-purple-800",
    label: "Reimbursed",
  },
  SYSTEM_ANNOUNCEMENT: {
    color: "bg-yellow-100 text-yellow-800",
    label: "Announcement",
  },
};

export default function AdminNotificationsPage() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div className="container mx-auto py-6 space-y-6 h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading notifications: {error}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">You have no notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {notification.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {notification.type && (
                    <Badge
                      className={
                        typeToBadge[notification.type]?.color || "bg-gray-100"
                      }
                    >
                      {typeToBadge[notification.type]?.label ||
                        notification.type}
                    </Badge>
                  )}
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

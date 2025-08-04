import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserNotifications, getUnreadNotificationsCount, markAllNotificationsAsRead } from "@/data/notifications";

// GET /api/user/notifications - Get all notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    const notifications = await getUserNotifications(userId);
    const unreadCount = await getUnreadNotificationsCount(userId);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/notifications - Mark all notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    await markAllNotificationsAsRead(userId);

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

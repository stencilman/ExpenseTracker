import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationAsRead, deleteNotification } from "@/data/notifications";
import { db } from "@/lib/db";

// PATCH /api/user/notifications/[id] - Mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    // Don't parse as integer since notification IDs are UUIDs

    // Verify the notification belongs to the user
    const notification = await db.notification.findUnique({
      where: {
        id: id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await markNotificationAsRead(id);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/notifications/[id] - Delete a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    // Don't parse as integer since notification IDs are UUIDs

    // Verify the notification belongs to the user
    const notification = await db.notification.findUnique({
      where: {
        id: id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await deleteNotification(id);

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

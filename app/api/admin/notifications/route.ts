import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSystemAnnouncement } from "@/data/notifications";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// POST /api/admin/notifications - Create a system announcement
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, message, targetRole } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Get user IDs based on target role (or all users if no role specified)
    let userIds: string[] = [];

    if (targetRole) {
      const users = await db.user.findMany({
        where: {
          role: targetRole,
        },
        select: {
          id: true,
        },
      });
      userIds = users.map((user: { id: string }) => user.id);
    } else {
      const users = await db.user.findMany({
        select: {
          id: true,
        },
      });
      userIds = users.map((user: { id: string }) => user.id);
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "No users found matching the criteria" },
        { status: 404 }
      );
    }

    await createSystemAnnouncement({
      title,
      message,
      userIds,
    });

    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${userIds.length} users`,
    });
  } catch (error) {
    console.error("Error creating system announcement:", error);
    return NextResponse.json(
      { error: "Failed to create system announcement" },
      { status: 500 }
    );
  }
}

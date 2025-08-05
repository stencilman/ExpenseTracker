import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminUsers } from "@/data/users";

export async function GET(_req: NextRequest) {
  try {
    // Verify admin session (optional – you can relax this if needed)
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUsers = await getAdminUsers();
    return NextResponse.json({ data: adminUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

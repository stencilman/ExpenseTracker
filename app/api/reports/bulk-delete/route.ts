import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ReportStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { reportIds } = await req.json();

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return new NextResponse("Report IDs are required", { status: 400 });
    }

    // Add your logic to delete the reports from the database
    // For example:
    await db.report.deleteMany({
      where: {
        id: {
          in: reportIds,
        },
        userId: user.id, // Ensure users can only delete their own reports
        status: ReportStatus.PENDING,
      },
    });

    return NextResponse.json({ message: "Reports deleted successfully" });
  } catch (error) {
    console.error("[REPORTS_BULK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ReportStatus } from "@prisma/client";
import { submitReport } from "@/data/report";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId: string = user.id;

    const { reportIds } = await req.json();

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return new NextResponse("Report IDs are required", { status: 400 });
    }

    // Fetch reports that belong to the user and are currently PENDING
    const reportsToSubmit = await db.report.findMany({
      where: {
        id: {
          in: reportIds,
        },
        userId: userId,
        status: ReportStatus.PENDING,
      },
      select: { id: true },
    });

    if (reportsToSubmit.length === 0) {
      return new NextResponse("No pending reports found to submit", { status: 400 });
    }

    // Submit each report individually to leverage existing logic
    await Promise.all(
      reportsToSubmit.map(({ id }) => submitReport(id, userId))
    );

    return NextResponse.json({ message: "Reports submitted successfully" });
  } catch (error) {
    console.error("[REPORTS_BULK_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

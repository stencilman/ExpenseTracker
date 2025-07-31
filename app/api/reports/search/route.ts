import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

/**
 * GET /api/reports/search
 * Search for reports by title
 * Query parameters:
 * - query: The search term to look for in report titles
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the search query from URL parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ data: [] });
    }

    // Search for reports matching the query
    // Only return reports that are in DRAFT or SUBMITTED status and belong to the current user
    const reports = await db.report.findMany({
      where: {
        title: {
          contains: query,
          mode: "insensitive", // Case-insensitive search
        },
        userId: session.user.id,
        status: {
          in: [ReportStatus.PENDING], // Only allow adding expenses to pending reports
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to 10 results
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("Error searching reports:", error);
    return NextResponse.json(
      { error: "Failed to search reports" },
      { status: 500 }
    );
  }
}

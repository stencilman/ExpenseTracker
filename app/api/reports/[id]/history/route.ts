import { auth } from "@/auth";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
import { ReportEventType } from "@prisma/client";
import { getReportById } from "@/data/report";
import { db } from "@/lib/db";

/**
 * GET /api/reports/[id]/history
 * Get the history of events for a specific report
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Access params before awaits
  const reportIdNum = Number(params.id);
  if (Number.isNaN(reportIdNum)) {
    return errorResponse("Invalid report ID", 400);
  }
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    

    // Check if the report exists and belongs to the user
    const report = await getReportById(reportIdNum);
    if (!report || report.userId !== session.user.id) {
      return errorResponse("Report not found", 404);
    }

    // Get report history from ReportHistory model

  // Get report history from ReportHistory model
  const history = await db.reportHistory.findMany({
    where: {
      reportId: reportIdNum,
    },
    orderBy: {
      eventDate: "desc",
    },
    include: {
      performedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

    // Map the history items to include the performer's name
    const mappedHistory = history.map((item: any) => ({
      id: item.id,
      eventType: item.eventType as ReportEventType,
      eventDate: item.eventDate,
      details: item.details,
      performedBy: item.performedBy
        ? {
            name: `${item.performedBy.firstName} ${item.performedBy.lastName}`,
          }
        : null,
      report: {
        id: report.id,
        title: report.title,
      }
    }));

    return jsonResponse({ history: mappedHistory });
  } catch (error) {
    console.error("Error fetching report history:", error);
    return errorResponse("Failed to fetch report history", 500);
  }
}

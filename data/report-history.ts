import { db } from "@/lib/db";
import { ReportEventType } from "@prisma/client";

/**
 * Creates a new report history entry
 */
export async function createReportHistoryEntry({
  reportId,
  eventType,
  details,
  performedById,
}: {
  reportId: number;
  eventType: ReportEventType;
  details?: string;
  performedById?: string;
}) {
  return await db.reportHistory.create({
    data: {
      reportId,
      eventType,
      details,
      performedById,
    },
  });
}

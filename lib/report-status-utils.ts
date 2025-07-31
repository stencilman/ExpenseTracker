import { ReportStatus } from "@prisma/client";
import { format } from "date-fns";

export type StatusColor = "green" | "orange" | "blue" | "red";

export interface ReportStatusDisplay {
  label: string;
  color: StatusColor;
  additionalInfo?: string;
}

/**
 * Maps a report status to a standardized UI display format
 * @param status The report status from the API
 * @param submittedAt Optional submitted date for additional info
 * @param approvedAt Optional approved date for additional info
 * @param rejectedAt Optional rejected date for additional info
 * @param reimbursedAt Optional reimbursed date for additional info
 * @returns A standardized status display object for UI
 */
export function mapReportStatusToDisplay(
  status: ReportStatus,
  submittedAt?: Date | null,
  approvedAt?: Date | null,
  rejectedAt?: Date | null,
  reimbursedAt?: Date | null
): ReportStatusDisplay {
  switch (status) {
    case ReportStatus.PENDING:
      return {
        label: "PENDING SUBMISSION",
        color: "orange",
      };
    case ReportStatus.SUBMITTED:
      return {
        label: "SUBMITTED",
        color: "blue",
        additionalInfo: submittedAt ? `On ${format(new Date(submittedAt), "dd/MM/yyyy")}` : undefined,
      };
    case ReportStatus.APPROVED:
      return {
        label: "APPROVED",
        color: "green",
        additionalInfo: approvedAt ? `On ${format(new Date(approvedAt), "dd/MM/yyyy")}` : undefined,
      };
    case ReportStatus.REJECTED:
      return {
        label: "REJECTED",
        color: "red",
        additionalInfo: rejectedAt ? `On ${format(new Date(rejectedAt), "dd/MM/yyyy")}` : undefined,
      };
    case ReportStatus.REIMBURSED:
      return {
        label: "REIMBURSED",
        color: "green",
        additionalInfo: reimbursedAt ? `On ${format(new Date(reimbursedAt), "dd/MM/yyyy")}` : undefined,
      };
    default:
      return {
        label: status,
        color: "blue",
      };
  }
}

/**
 * Determines if a report has been submitted based on the submittedAt date
 * @param submittedAt The date when the report was submitted
 * @returns True if the report has been submitted
 */
export function isReportSubmitted(submittedAt?: Date | null): boolean {
  return !!submittedAt;
}

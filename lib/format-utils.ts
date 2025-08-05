import { Report as ReportUI } from "@/components/table/TableColumnDefs";
import { Report, ReportStatus } from "@prisma/client";

/**
 * Format a number as currency (INR)
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

type ReportWithRelations = Report & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expenses: {
    id: number;
    amount: number;
    merchant: string;
    category: string;
    claimReimbursement?: boolean;
  }[];
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

/**
 * Format a report from the database to the UI format
 */
export function formatReportForUI(report: ReportWithRelations): ReportUI {
  // Calculate the total amount to be reimbursed (only expenses with claimReimbursement=true)
  const reimbursableAmount = report.expenses
    // Treat missing claimReimbursement as true (eligible for reimbursement)
    .filter(expense => expense.claimReimbursement !== false)
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Format the submitter name
  const submitterName = `${report.user.firstName} ${report.user.lastName}`;
  
  // Format the approver name if available
  const approverName = report.approver 
    ? `${report.approver.firstName} ${report.approver.lastName}`
    : undefined;

  // Format date range
  const startDate = report.startDate ? new Date(report.startDate).toLocaleDateString() : "";
  const endDate = report.endDate ? new Date(report.endDate).toLocaleDateString() : "";
  const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : "";

  // Format the total amount
  const totalAmount = report.totalAmount || 
    report.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const formattedTotal = `Rs.${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Format the reimbursable amount
  const formattedReimbursable = `Rs.${reimbursableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Determine status label and color
  let statusLabel = "";
  let statusColor: "green" | "orange" | "blue" | "red" = "blue";
  let additionalInfo = "";

  switch (report.status) {
    case ReportStatus.PENDING:
      statusLabel = "PENDING SUBMISSION";
      statusColor = "blue";
      break;
    case ReportStatus.SUBMITTED:
      statusLabel = "SUBMITTED";
      statusColor = "blue";
      if (report.submittedAt) {
        additionalInfo = `From ${new Date(report.submittedAt).toLocaleDateString()}`;
      }
      break;
    case ReportStatus.APPROVED:
      statusLabel = "AWAITING REIMBURSEMENT";
      statusColor = "orange";
      if (report.approvedAt) {
        additionalInfo = `From ${new Date(report.approvedAt).toLocaleDateString()}`;
      }
      break;
    case ReportStatus.REJECTED:
      statusLabel = "REJECTED";
      statusColor = "red";
      if (report.rejectedAt) {
        additionalInfo = `On ${new Date(report.rejectedAt).toLocaleDateString()}`;
      }
      break;
    case ReportStatus.REIMBURSED:
      statusLabel = "REIMBURSED";
      statusColor = "green";
      if (report.reimbursedAt) {
        additionalInfo = `On ${new Date(report.reimbursedAt).toLocaleDateString()}`;
      }
      break;
  }

  return {
    id: report.id.toString(),
    submitter: submitterName,
    submitterEmail: report.user.email,
    approver: approverName,
    approverEmail: report.approver?.email,
    iconType: "file-text",
    title: report.title,
    dateRange,
    total: formattedTotal,
    expenseCount: report.expenses.length,
    toBeReimbursed: formattedReimbursable,
    status: report.status,
  };
}

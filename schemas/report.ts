import { z } from "zod";
import { ReportStatus } from "@prisma/client";

// Schema for creating a new report
export const ReportCreateSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Schema for updating a report
export const ReportUpdateSchema = z.object({
  title: z.string().min(1, "Report title is required").optional(),
  description: z.string().optional(),
  status: z.enum(Object.values(ReportStatus) as [string, ...string[]]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Schema for filtering reports
export const ReportFilterSchema = z.object({
  status: z.enum(Object.values(ReportStatus) as [string, ...string[]]).optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

// Schema for adding expenses to a report
export const AddExpensesToReportSchema = z.object({
  expenseIds: z.array(z.number().int().positive()),
});

// Schema for recording reimbursement
export const RecordReimbursementSchema = z.object({
  reimbursementMethod: z.string().min(1, "Reimbursement method is required"),
  reimbursementRef: z.string().optional(),
  reimbursementNotes: z.string().optional(),
});

// Export types for use in other files
export type ReportCreateInput = z.infer<typeof ReportCreateSchema>;
export type ReportUpdateInput = z.infer<typeof ReportUpdateSchema>;
export type ReportFilterInput = z.infer<typeof ReportFilterSchema>;
export type AddExpensesToReportInput = z.infer<typeof AddExpensesToReportSchema>;
export type RecordReimbursementInput = z.infer<typeof RecordReimbursementSchema>;

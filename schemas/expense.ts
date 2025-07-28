import { z } from "zod";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

// Schema for creating a new expense
export const ExpenseCreateSchema = z.object({
  amount: z.number().positive({ message: "Amount must be a positive number" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  description: z.string().optional(),
  category: z.enum(Object.values(ExpenseCategory) as [ExpenseCategory, ...ExpenseCategory[]]),
  merchant: z.string().min(1, { message: "Merchant name is required" }),
  notes: z.string().optional(),
  receiptUrls: z.array(z.string()).optional(),
});

// Schema for updating an existing expense
export const ExpenseUpdateSchema = ExpenseCreateSchema.partial().extend({
  status: z.enum(Object.values(ExpenseStatus) as [ExpenseStatus, ...ExpenseStatus[]]).optional(),
});

// Schema for filtering expenses
export const ExpenseFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.enum(Object.values(ExpenseCategory) as [ExpenseCategory, ...ExpenseCategory[]]).optional(),
  status: z.enum(Object.values(ExpenseStatus) as [ExpenseStatus, ...ExpenseStatus[]]).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().optional(),
});

export type ExpenseCreate = z.infer<typeof ExpenseCreateSchema>;
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

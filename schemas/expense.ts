import { z } from "zod";
import { ExpenseCategory, ExpenseStatus } from "@prisma/client";

// Schema for creating a new expense
export const ExpenseCreateSchema = z.object({
  amount: z.number().positive({ message: "Amount must be a positive number" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: "Invalid expense category" }),
  }),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

// Schema for updating an existing expense
export const ExpenseUpdateSchema = ExpenseCreateSchema.partial().extend({
  status: z.nativeEnum(ExpenseStatus, {
    errorMap: () => ({ message: "Invalid expense status" }),
  }).optional(),
});

// Schema for filtering expenses
export const ExpenseFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().optional(),
});

export type ExpenseCreate = z.infer<typeof ExpenseCreateSchema>;
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

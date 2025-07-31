import * as z from "zod";

export const ROLE_NAMES = ['Submitter', 'Approver'] as const;

export const UserSettingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  employeeId: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  dateOfJoining: z.date().optional().nullable(),
  dateOfBirth: z.date().optional().nullable(),
  designation: z.string().optional().nullable(),
  roleName: z.enum(ROLE_NAMES).optional().nullable(),
  approverId: z.string().optional().nullable(),
});

export type UserSettingsFormValues = z.infer<typeof UserSettingsSchema>;

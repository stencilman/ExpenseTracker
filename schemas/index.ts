import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Define the schema for registration validation using Zod
export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(8, {
      message: "Password is required and must be at least 8 characters",
    }),
    reEnterPassword: z.string().min(8, {
      message: "Reenter Password is required, must be same as password",
    }),
    firstName: z.string().min(1, {
      message: "First name is required",
    }),
    lastName: z.string().min(1, {
      message: "Last name is required",
    }),
  })
  .refine((data) => data.password === data.reEnterPassword, {
    message: "Passwords do not match",
    path: ["reEnterPassword"],
  });

"use server";

import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { signIn } from "@/auth";
import { DEFAULT_ADMIN_REDIRECT, DEFAULT_USER_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { UserRole } from "@prisma/client";

export async function login(values: z.infer<typeof LoginSchema>) {
  const validateFields = LoginSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validateFields.data;

  try {
    // Get user to check role before signing in
    const user = await getUserByEmail(email);

    if (!user) {
      return { error: "Invalid credentials!" };
    }

    // Determine redirect based on user role
    const redirectTo =
      user.role === UserRole.ADMIN
        ? DEFAULT_ADMIN_REDIRECT
        : DEFAULT_USER_REDIRECT;

    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });

    // This code will never be executed when successful
    // because NextAuth will redirect before it reaches here
    return { success: "Login successful!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
}

"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import { z } from "zod";
import { getUserByEmail } from "@/data/user";

export async function register(values: z.infer<typeof RegisterSchema>) {
    const validateFields = RegisterSchema.safeParse(values);
    console.log(validateFields);

  if (!validateFields.success) {
    return { error: "Invalid fields" };
  }

  const {email, password, reEnterPassword, firstName, lastName} = values;

  const hashedPassword = await bcrypt.hash(reEnterPassword, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "User already exists" };
  }

   await db.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  });

//   Todo: send verification token email

  return { success: "User created" };
}


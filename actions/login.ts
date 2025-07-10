"use server";

import { LoginSchema } from "@/schemas";
import { z } from "zod";

export async function login(validateFields: Object) {
  console.log(validateFields);

  if (validateFields) {
    return { error: "Invalid fields" };
  }
  return { success: "Login successful" };
}


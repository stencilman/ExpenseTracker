"use server";

import { signOut } from "@/auth";

export const handleSignOut = async () => {
  // some server side logic here
  await signOut({
    redirect: true,
    redirectTo: "/auth/login",
  });
};

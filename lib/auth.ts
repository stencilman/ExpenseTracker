import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();
  return session?.user?.role;
};

export const isAdmin = async () => {
  const role = await currentRole();
  return role === UserRole.ADMIN;
};

export const isUser = async () => {
  const role = await currentRole();
  return role === UserRole.USER;
};

export const hasRequiredRole = async (requiredRole: UserRole) => {
  const role = await currentRole();
  return role === requiredRole;
};

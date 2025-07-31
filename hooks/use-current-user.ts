import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};

export const useCurrentRole = () => {
  const user = useCurrentUser();
  return user?.role;
};

export const useIsAdmin = () => {
  const role = useCurrentRole();
  return role === UserRole.ADMIN;
};

export const useIsUser = () => {
  const role = useCurrentRole();
  return role === UserRole.USER;
};

export const useHasRequiredRole = (requiredRole: UserRole) => {
  const role = useCurrentRole();
  return role === requiredRole;
};

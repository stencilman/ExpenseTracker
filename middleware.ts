import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  adminRoutes,
  userRoutes,
  DEFAULT_ADMIN_REDIRECT,
  DEFAULT_USER_REDIRECT,
} from "./routes";
import { UserRole } from "@prisma/client";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const nextUrl = req.nextUrl;
  const {
    nextUrl: { pathname },
    auth: session,
  } = req;
  const isLoggedIn = !!session;

  console.log("Route: ", pathname);
  console.log("Is logged in: ", isLoggedIn);

  const role = session?.user?.role;
  console.log("User role: ", role);

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/user");

  // Allow API routes for authentication
  if (isApiAuthRoute) {
    return null;
  }

  // Redirect logged-in users from auth routes to the appropriate page
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === UserRole.ADMIN) {
        return Response.redirect(new URL(DEFAULT_ADMIN_REDIRECT, nextUrl));
      }
      return Response.redirect(new URL(DEFAULT_USER_REDIRECT, nextUrl));
    }
    return null;
  }

  // Redirect unauthenticated users to login page
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  // Role-based access control
  if (isLoggedIn) {
    // Admins trying to access user routes
    if (role === UserRole.ADMIN && isUserRoute) {
      return Response.redirect(new URL(DEFAULT_ADMIN_REDIRECT, nextUrl));
    }

    // Users trying to access admin routes
    if (role === UserRole.USER && isAdminRoute) {
      return Response.redirect(new URL(DEFAULT_USER_REDIRECT, nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

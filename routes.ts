/**
 * An array of routes that are accessible to the public
 * These routes does not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/"];

/**
 * An array of routes that are used to authentication
 * These routes will redirect login user to /settings
 * @type {string[]}
 */
export const authRoutes = ["/auth/login", "/auth/register"];

/**
 * The prefix for the api routes that are used to authentication
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Routes that are accessible only to users with the ADMIN role
 * @type {string[]}
 */
export const adminRoutes = ["/admin", "/admin/settings"];

/**
 * Routes that are accessible only to users with the USER role
 * @type {string[]}
 */
export const userRoutes = [
  "/user/dashboard",
  "/user/expenses",
  "/user/reports",
  "/user/settings",
  "/user/testsetting",
];

/**
 * The default redirect url for the login user with USER role
 * @type {string}
 */
export const DEFAULT_USER_REDIRECT = "/user/dashboard";

/**
 * The default redirect url for the login user with ADMIN role
 * @type {string}
 */
export const DEFAULT_ADMIN_REDIRECT = "/admin/settings";

/**
 * The default redirect url for the login user
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/user/settings";

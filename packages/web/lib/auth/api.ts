/** Client-side paths for the auth Route Handlers (contracts/auth-api.md). */
export const AUTH_API_PATHS = {
  requestCode: "/api/auth/request-code",
  verifyCode: "/api/auth/verify-code",
  signOut: "/api/auth/sign-out",
} as const;

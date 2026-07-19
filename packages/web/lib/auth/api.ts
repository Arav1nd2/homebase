/** Client-side paths for the auth Route Handlers (contracts/auth-api.md). */
export const AUTH_API_PATHS = {
  requestCode: "/api/auth/request-code",
  verifyCode: "/api/auth/verify-code",
  signOut: "/api/auth/sign-out",
} as const;

/** `POST /api/auth/request-code` response payload (contracts/auth-api.md). */
export type RequestCodeResponse = {
  /** User-facing confirmation copy, shown as-is on the login screen. */
  message: string;
};

/** `POST /api/auth/verify-code` response payload (contracts/auth-api.md). */
export type VerifyCodeResponse = {
  redirectTo: string;
};

/** `POST /api/auth/sign-out` response payload (contracts/auth-api.md). */
export type SignOutResponse = {
  redirectTo: string;
};

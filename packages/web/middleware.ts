import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Single enforcement point for FR-001 (protect everything by default) and
 * FR-013 (never show /login to an already-signed-in visitor) — for PAGE
 * navigation only. API routes are deliberately left alone here: each
 * Route Handler enforces its own auth via `getSessionOrThrow()`
 * (constitution Principle V), returning a clean JSON 401 rather than an
 * HTML redirect a JSON caller can't use — and this preserves
 * `/api/smoke`'s existing, intentionally-public exemption
 * (001-foundational-infra FR-016) without middleware needing to know
 * about it. `request-code`/`verify-code`/`sign-out` are the auth routes
 * that don't need a session check of their own (see contracts/auth-api.md).
 * `/styleguide` (003-ui-shell-foundation) is also exempt — it's a kernel/
 * dev-facing example screen with no real user data (spec Assumptions).
 * TODO: remove the route (and this exemption) once auth is migrated and
 * real tool screens exist to demonstrate the shell instead — flagged by
 * the maintainer during 003's implementation, not yet scheduled.
 *
 * Uses `getUser()`, not `getSession()` — `getSession()` only reads the JWT
 * out of the cookie without contacting Supabase, so a forged/stale cookie
 * would pass unchecked. See specs/002-email-otp-auth/research.md §2.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname !== "/login" && pathname !== "/styleguide") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets and image
     * optimization files, so the auth check runs on pages and API routes
     * only.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

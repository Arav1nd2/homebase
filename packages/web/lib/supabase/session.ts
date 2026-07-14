import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Thrown by getSessionOrThrow() when there is no valid, current session. */
export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Shared Route Handler auth check (constitution Principle V): every
 * handler that isn't establishing a session itself MUST call this before
 * touching the database. Uses `getUser()` (revalidates against Supabase
 * Auth), not `getSession()` (trusts the cookie's JWT without checking) —
 * see specs/002-email-otp-auth/research.md §2.
 */
export async function getSessionOrThrow(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return user;
}

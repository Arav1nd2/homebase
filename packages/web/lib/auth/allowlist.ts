import { timingSafeEqual } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Household member emails are checked against a small, static allow-list
 * configured directly as a Worker secret (never a plain wrangler.jsonc
 * var, never committed to the repo). An earlier version of this hashed
 * emails with a pepper for defense-in-depth against accidental in-app log
 * exposure; that was judged unnecessary complexity for a two-person
 * project and reversed — see specs/002-email-otp-auth/research.md §6.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function stringsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Throws if the allow-list secret isn't configured — a hard configuration error, not a runtime fallback. */
export function isEmailAllowed(email: string): boolean {
  const { env } = getCloudflareContext();
  const { ALLOWED_EMAILS } = env as { ALLOWED_EMAILS?: string };

  if (!ALLOWED_EMAILS) {
    throw new Error("ALLOWED_EMAILS is not configured. See .dev.vars.example.");
  }

  const candidate = normalizeEmail(email);
  const allowedEmails = ALLOWED_EMAILS.split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);

  return allowedEmails.some((allowed) => stringsMatch(candidate, allowed));
}

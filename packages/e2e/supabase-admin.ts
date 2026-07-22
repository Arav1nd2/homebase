import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

interface LocalSupabaseCredentials {
  url: string;
  secretKey: string;
}

let credentialsPromise: Promise<LocalSupabaseCredentials> | undefined;

// Reads the running local Supabase CLI stack's own API URL and secret key
// via `supabase status`, rather than hardcoding or committing either one.
// Both are ephemeral, per-`supabase start` values scoped to this one
// local/CI stack (never production, which only ever uses the publishable
// key — see lib/supabase/server.ts) and this way there's nothing new to
// keep in sync across .dev.vars/CI secrets. Cached per test-worker process
// since `supabase status` shells out to Docker and the values don't change
// mid-run.
function readLocalSupabaseCredentials(): LocalSupabaseCredentials {
  const output = execFileSync("npx", ["supabase", "status", "-o", "json"], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
  });
  const parsed = JSON.parse(output) as { API_URL: string; SECRET_KEY: string };
  return { url: parsed.API_URL, secretKey: parsed.SECRET_KEY };
}

function getLocalSupabaseCredentials(): Promise<LocalSupabaseCredentials> {
  credentialsPromise ??= Promise.resolve().then(readLocalSupabaseCredentials);
  return credentialsPromise;
}

/**
 * Mints a real, valid 6-digit email OTP code for `email` via Supabase's
 * Admin API (`generateLink`), for e2e specs where signing in is setup, not
 * the thing under test. Unlike Supabase's `auth.sms.test_otp` (SMS-only —
 * there is no email equivalent in GoTrue), this doesn't fix a code in
 * config; it asks the real Auth service for one. Because `generateLink`
 * never invokes the Send Email Hook, it bypasses the send-email-hook
 * Worker and Resend/fake-capture hop entirely — not just the wait for it.
 * The resulting code still goes through the app's real
 * `/api/auth/verify-code` handler (see auth-helper.ts), so only the
 * "deliver it by email" leg is skipped.
 *
 * Deliberately not used by auth-signin.spec.ts's own OTP-delivery test and
 * its disallowed-email test — those two are the ones actually verifying
 * the fake-Resend pipeline, so they keep polling it for real.
 */
export async function mintOtpCodeFor(email: string): Promise<string> {
  const { url, secretKey } = await getLocalSupabaseCredentials();
  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.email_otp) {
    throw new Error(`Failed to mint a test OTP for ${email}: ${error?.message ?? "no email_otp in response"}`);
  }
  return data.properties.email_otp;
}

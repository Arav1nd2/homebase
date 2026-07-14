import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Server-side Supabase client for Route Handlers and Server Components.
 * Session state lives in cookies (via @supabase/ssr), not `localStorage` —
 * cookies survive iOS Safari's aggressive script-writable storage eviction
 * (ITP), which is the specific reason this project needs a long-lived PWA
 * session to actually stay long-lived. See
 * specs/002-email-otp-auth/research.md §2, §5.
 *
 * Reads `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` via the Cloudflare
 * bindings object, mirroring lib/db.ts's binding-access pattern — no
 * `process.env` fallback (constitution Principle VI, Environment Parity).
 *
 * Uses the publishable key (`sb_publishable_...`), not the legacy JWT
 * `anon` key — Supabase's current-generation, database-backed client key
 * that can be rotated instantly without invalidating active sessions. Any
 * client library version accepts it as a drop-in value in the same slot
 * the anon key used to occupy; no code beyond this rename was needed.
 */
export async function createSupabaseServerClient() {
  const { env } = getCloudflareContext();
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = env as {
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
  };

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "No SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY binding found on the Cloudflare context. " +
      "This code must run under the real Workers runtime (`npm run preview:workers`, not " +
      "`next dev`) with these set in .dev.vars (see .dev.vars.example).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Route Handlers can set cookies; Server Components cannot and
        // will throw here — @supabase/ssr expects callers to swallow that,
        // since middleware is what actually persists the refreshed
        // session for Server Component reads.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — no-op, per @supabase/ssr docs.
        }
      },
    },
  });
}

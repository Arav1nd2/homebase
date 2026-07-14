import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Middleware-flavored Supabase client: reads/writes cookies via the
 * NextRequest/NextResponse pair (middleware has no `next/headers` cookies()
 * access). Returns both the client and the response object middleware
 * should return, since a session refresh mid-request needs to attach its
 * updated cookie to that exact response (not a fresh one).
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { env } = getCloudflareContext();
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env as {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "No SUPABASE_URL/SUPABASE_ANON_KEY binding found on the Cloudflare context. This " +
      "code must run under the real Workers runtime (`npm run preview:workers`, not " +
      "`next dev`) with these set in .dev.vars (see .dev.vars.example).",
    );
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, getResponse: () => response };
}

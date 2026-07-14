import { NextRequest, NextResponse } from "next/server";
import { emailInputSchema } from "@/lib/validation/auth";
import { isEmailAllowed } from "@/lib/auth/allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

// No auth check at the top of this handler by design — its entire purpose
// is to establish a session, so there is none yet to verify (see
// contracts/auth-api.md).

function genericSuccessResponse(): NextResponse {
  return NextResponse.json({
    data: { message: "A sign-in code has been sent to that email address." },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = emailInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { email } = parsed.data;

  // The response is identical whether or not the email is allow-listed
  // (FR-003, FR-014) — only the allow-listed branch actually calls
  // Supabase, so a caller can never distinguish "sent" from "not on the
  // list" from timing/shape alone at the response level.
  if (isEmailAllowed(email)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("request-code: signInWithOtp error:", error.message);
    }
  }

  return genericSuccessResponse();
}

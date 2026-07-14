import { NextRequest, NextResponse } from "next/server";
import { verifyCodeInputSchema } from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

// No auth check at the top of this handler by design — its entire purpose
// is to establish a session (see contracts/auth-api.md).

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = verifyCodeInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const { email, code } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });

  if (error) {
    return errorResponse(
      401,
      "OTP_INVALID",
      "That code is incorrect or expired. Request a new one.",
    );
  }

  return NextResponse.json({ data: { redirectTo: "/" } });
}

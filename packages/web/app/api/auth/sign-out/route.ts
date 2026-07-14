import { NextResponse } from "next/server";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api-response";

export async function POST(): Promise<NextResponse> {
  try {
    await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ data: { redirectTo: "/login" } });
}

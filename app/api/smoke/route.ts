import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { withDb } from "@/lib/db";
import { smokeTest } from "@/db/schema";
import { smokeTestInputSchema } from "@/lib/validation/smoke";
import { errorResponse } from "@/lib/api-response";

// No auth check on this route by design — FR-016. See
// specs/001-foundational-infra/contracts/smoke-api.md and plan.md
// Complexity Tracking. Do not copy this pattern for any other route.

export async function GET(): Promise<NextResponse> {
  try {
    const latest = await withDb((db) =>
      db.select().from(smokeTest).orderBy(desc(smokeTest.createdAt)).limit(1),
    );
    return NextResponse.json({ data: latest[0] ?? null });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Could not reach the database.");
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = smokeTestInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const created = await withDb((db) => db.insert(smokeTest).values(parsed.data).returning());
    return NextResponse.json({ data: created[0] }, { status: 201 });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Could not reach the database.");
  }
}

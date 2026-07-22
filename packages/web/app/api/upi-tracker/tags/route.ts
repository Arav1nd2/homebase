import { and, asc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { upiTag } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { tagCreateInputSchema } from "@/lib/validation/upi-tracker";

function toTagDto(row: { id: string; name: string; color: string; createdAt: Date }) {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.createdAt };
}

/** Lists the caller's active (non-soft-deleted) tags — the tag chip
 *  picker and tag management view's data source. */
export async function GET(): Promise<NextResponse> {
  let user;
  try {
    user = await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  try {
    const rows = await withDb((db) =>
      db
        .select()
        .from(upiTag)
        .where(and(eq(upiTag.userId, user.id), isNull(upiTag.deletedAt)))
        .orderBy(asc(upiTag.createdAt)),
    );

    return NextResponse.json({ data: rows.map(toTagDto) });
  } catch (err) {
    console.error("upi-tracker tags GET error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not load tags.");
  }
}

/** Creates a tag inline (FR-006) or from the tag management view.
 *  Name must be unique among the caller's active tags (409). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let user;
  try {
    user = await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = tagCreateInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await withDb(async (db) => {
      const [existing] = await db
        .select({ id: upiTag.id })
        .from(upiTag)
        .where(and(eq(upiTag.userId, user.id), isNull(upiTag.deletedAt), eq(upiTag.name, parsed.data.name)))
        .limit(1);

      if (existing) {
        return { nameTaken: true } as const;
      }

      const [created] = await db
        .insert(upiTag)
        .values({ userId: user.id, name: parsed.data.name, color: parsed.data.color })
        .returning();

      if (!created) {
        throw new Error("Insert returned no row.");
      }

      return { tag: created } as const;
    });

    if ("nameTaken" in result) {
      return errorResponse(409, "TAG_NAME_TAKEN", "A tag with that name already exists.");
    }

    return NextResponse.json({ data: toTagDto(result.tag) }, { status: 201 });
  } catch (err) {
    console.error("upi-tracker tags POST error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not save the tag.");
  }
}

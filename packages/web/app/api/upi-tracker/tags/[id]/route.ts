import { and, eq, isNull, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { upiTag } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { tagUpdateInputSchema } from "@/lib/validation/upi-tracker";

type RouteContext = { params: Promise<{ id: string }> };

function toTagDto(row: { id: string; name: string; color: string; createdAt: Date }) {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.createdAt };
}

type UpdateResult =
  | { notFound: true }
  | { nameTaken: true }
  | { tag: typeof upiTag.$inferSelect };

/** Renames and/or recolors a tag (FR-017, US4 AC1). Propagates
 *  immediately to every transaction referencing it, since transactions
 *  always read the live tag row (data-model.md). */
export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  let user;
  try {
    user = await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = tagUpdateInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await withDb(async (db): Promise<UpdateResult> => {
      const [existing] = await db
        .select()
        .from(upiTag)
        .where(and(eq(upiTag.id, id), eq(upiTag.userId, user.id), isNull(upiTag.deletedAt)))
        .limit(1);

      if (!existing) {
        return { notFound: true };
      }

      if (parsed.data.name !== undefined && parsed.data.name !== existing.name) {
        const [collision] = await db
          .select({ id: upiTag.id })
          .from(upiTag)
          .where(
            and(
              eq(upiTag.userId, user.id),
              isNull(upiTag.deletedAt),
              eq(upiTag.name, parsed.data.name),
              ne(upiTag.id, id),
            ),
          )
          .limit(1);
        if (collision) {
          return { nameTaken: true };
        }
      }

      const [updated] = await db
        .update(upiTag)
        .set({
          name: parsed.data.name ?? existing.name,
          color: parsed.data.color ?? existing.color,
          updatedAt: new Date(),
        })
        .where(eq(upiTag.id, id))
        .returning();

      if (!updated) {
        throw new Error("Update returned no row.");
      }

      return { tag: updated };
    });

    if ("notFound" in result) {
      return errorResponse(404, "NOT_FOUND", "Tag not found.");
    }
    if ("nameTaken" in result) {
      return errorResponse(409, "TAG_NAME_TAKEN", "A tag with that name already exists.");
    }

    return NextResponse.json({ data: toTagDto(result.tag) });
  } catch (err) {
    console.error("upi-tracker tag PATCH error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not update the tag.");
  }
}

/** Soft-deletes a tag (FR-017): sets `deletedAt`, never touches any
 *  existing `upiTransactionTag` row or the transactions that reference
 *  it (research.md §4). */
export async function DELETE(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  let user;
  try {
    user = await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  const { id } = await params;

  try {
    const deleted = await withDb(async (db) => {
      const [updated] = await db
        .update(upiTag)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(upiTag.id, id), eq(upiTag.userId, user.id), isNull(upiTag.deletedAt)))
        .returning({ id: upiTag.id });
      return updated ?? null;
    });

    if (!deleted) {
      return errorResponse(404, "NOT_FOUND", "Tag not found.");
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("upi-tracker tag DELETE error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not delete the tag.");
  }
}

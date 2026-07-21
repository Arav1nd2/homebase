import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { upiTransaction, upiTransactionTag } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { transactionUpdateInputSchema } from "@/lib/validation/upi-tracker";
import { resolveOwnedActiveTags, type OwnedTagRow } from "@/lib/upi-tracker/tags";
import { getTagsForTransaction, toTransactionDto } from "@/lib/upi-tracker/transactions";

type RouteContext = { params: Promise<{ id: string }> };

type UpdateResult =
  | { notFound: true }
  | { invalidTags: true }
  | { transaction: typeof upiTransaction.$inferSelect; tags: OwnedTagRow[] };

/**
 * Edits a transaction's status and/or tag(s) after creation (full FR-015
 * scope, either or both fields) — this is also how the post-redirect
 * confirm prompt (FR-009/FR-010) resolves a `pending` row to
 * `success`/`failed`/`unconfirmed`. Enforces caller ownership with a 404
 * (never 403, FR-018) on a non-owned or missing id.
 */
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

  const parsed = transactionUpdateInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await withDb(async (db): Promise<UpdateResult> => {
      const [existing] = await db
        .select()
        .from(upiTransaction)
        .where(and(eq(upiTransaction.id, id), eq(upiTransaction.userId, user.id)))
        .limit(1);

      if (!existing) {
        return { notFound: true };
      }

      if (parsed.data.tagIds !== undefined) {
        const tags = await resolveOwnedActiveTags(db, user.id, parsed.data.tagIds);
        if (tags === null) {
          return { invalidTags: true };
        }
        await db.delete(upiTransactionTag).where(eq(upiTransactionTag.transactionId, id));
        if (tags.length > 0) {
          await db
            .insert(upiTransactionTag)
            .values(tags.map((tag) => ({ transactionId: id, tagId: tag.id })));
        }
      }

      const [updated] = await db
        .update(upiTransaction)
        .set({
          status: parsed.data.status ?? existing.status,
          updatedAt: new Date(),
        })
        .where(eq(upiTransaction.id, id))
        .returning();

      if (!updated) {
        throw new Error("Update returned no row.");
      }

      const tags = await getTagsForTransaction(db, id);
      return { transaction: updated, tags };
    });

    if ("notFound" in result) {
      return errorResponse(404, "NOT_FOUND", "Transaction not found.");
    }
    if ("invalidTags" in result) {
      return errorResponse(400, "VALIDATION_ERROR", "One or more tags are invalid.");
    }

    return NextResponse.json({ data: toTransactionDto(result.transaction, result.tags) });
  } catch (err) {
    console.error("upi-tracker transaction PATCH error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not update the transaction.");
  }
}

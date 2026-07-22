import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { upiTag, upiTransaction, upiTransactionTag } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { transactionCreateInputSchema, transactionListQuerySchema } from "@/lib/validation/upi-tracker";
import { resolveOwnedActiveTags, type OwnedTagRow } from "@/lib/upi-tracker/tags";
import { toTransactionDto } from "@/lib/upi-tracker/transactions";
import type { TagColor } from "@/lib/validation/upi-tracker";

type CreateResult =
  | { error: string }
  | { transaction: typeof upiTransaction.$inferSelect; tags: OwnedTagRow[] };

/** Lists the caller's transactions (FR-012), with optional tag/status/
 *  date-range filters (FR-013). Each row's tags are joined inline from
 *  the live `upiTag` row, so a deleted tag's frozen name/color still
 *  renders correctly (research.md §4). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  let user;
  try {
    user = await getSessionOrThrow();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required.");
    }
    throw err;
  }

  const url = new URL(request.url);
  const parsed = transactionListQuerySchema.safeParse({
    tagId: url.searchParams.getAll("tagId"),
    status: url.searchParams.get("status") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const dtos = await withDb(async (db) => {
      const conditions = [eq(upiTransaction.userId, user.id)];
      if (parsed.data.status) {
        conditions.push(eq(upiTransaction.status, parsed.data.status));
      }
      if (parsed.data.from) {
        conditions.push(gte(upiTransaction.occurredAt, new Date(parsed.data.from)));
      }
      if (parsed.data.to) {
        conditions.push(lte(upiTransaction.occurredAt, new Date(parsed.data.to)));
      }

      if (parsed.data.tagId.length > 0) {
        const matches = await db
          .selectDistinct({ transactionId: upiTransactionTag.transactionId })
          .from(upiTransactionTag)
          .where(inArray(upiTransactionTag.tagId, parsed.data.tagId));
        const matchingIds = matches.map((row) => row.transactionId);
        if (matchingIds.length === 0) {
          return [];
        }
        conditions.push(inArray(upiTransaction.id, matchingIds));
      }

      const transactions = await db
        .select()
        .from(upiTransaction)
        .where(and(...conditions))
        .orderBy(desc(upiTransaction.occurredAt));

      if (transactions.length === 0) {
        return [];
      }

      const tagRows = await db
        .select({
          transactionId: upiTransactionTag.transactionId,
          id: upiTag.id,
          name: upiTag.name,
          color: upiTag.color,
        })
        .from(upiTransactionTag)
        .innerJoin(upiTag, eq(upiTransactionTag.tagId, upiTag.id))
        .where(
          inArray(
            upiTransactionTag.transactionId,
            transactions.map((tx) => tx.id),
          ),
        );

      const tagsByTransaction = new Map<string, OwnedTagRow[]>();
      for (const row of tagRows) {
        const existing = tagsByTransaction.get(row.transactionId) ?? [];
        existing.push({ id: row.id, name: row.name, color: row.color as TagColor });
        tagsByTransaction.set(row.transactionId, existing);
      }

      return transactions.map((tx) => toTransactionDto(tx, tagsByTransaction.get(tx.id) ?? []));
    });

    return NextResponse.json({ data: dtos });
  } catch (err) {
    console.error("upi-tracker transactions GET error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not load transactions.");
  }
}

/**
 * Covers three moments with one endpoint (contracts/upi-tracker-api.md):
 * a scanned "Pay" tap, the FR-022 camera-denied "Pay" tap, and a US3
 * retrospective backfill. `origin` is purely descriptive; whether
 * `status` is present in the request is what actually determines the
 * lifecycle (research.md §3) — omitted writes `pending` and defaults
 * `occurredAt` to now (the live "tap Pay now" moment, persisted before
 * the redirect fires, SC-004); present uses the given `status` and
 * requires `occurredAt` in the same request (already enforced by the
 * schema's own refine).
 */
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

  const parsed = transactionCreateInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const input = parsed.data;

  try {
    const result = await withDb(async (db): Promise<CreateResult> => {
      const tags = await resolveOwnedActiveTags(db, user.id, input.tagIds);
      if (tags === null) {
        return { error: "One or more tags are invalid." };
      }

      const [created] = await db
        .insert(upiTransaction)
        .values({
          userId: user.id,
          payeeVpa: input.payeeVpa,
          payeeName: input.payeeName ?? null,
          amountPaise: input.amountPaise,
          status: input.status ?? "pending",
          origin: input.origin,
          note: input.note ?? null,
          occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
        })
        .returning();

      if (!created) {
        throw new Error("Insert returned no row.");
      }

      if (tags.length > 0) {
        await db.insert(upiTransactionTag).values(
          tags.map((tag) => ({ transactionId: created.id, tagId: tag.id })),
        );
      }

      return { transaction: created, tags };
    });

    if ("error" in result) {
      return errorResponse(400, "VALIDATION_ERROR", result.error);
    }

    return NextResponse.json({ data: toTransactionDto(result.transaction, result.tags) }, { status: 201 });
  } catch (err) {
    console.error("upi-tracker transactions POST error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not save the transaction.");
  }
}

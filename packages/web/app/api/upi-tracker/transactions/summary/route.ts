import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { upiTag, upiTransaction, upiTransactionTag } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getSessionOrThrow, UnauthorizedError } from "@/lib/supabase/session";
import { summaryQuerySchema } from "@/lib/validation/upi-tracker";
import { computeTagSummary } from "@/lib/upi-tracker/summary";

/**
 * Per-tag, per-period totals (FR-014, SC-002). Fetches one flat row per
 * transaction-tag pairing and aggregates in JS via `computeTagSummary`
 * (a pure, unit-tested function) rather than a SQL `GROUP BY` — at this
 * project's scale (Principle VIII) that's simpler than juggling
 * Postgres's `bigint`-as-string `SUM()` result, and keeps the "no
 * proportional splitting" rule directly testable. All of the caller's
 * own transactions in range are counted regardless of status.
 */
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
  const parsed = summaryQuerySchema.safeParse({
    tagId: url.searchParams.getAll("tagId"),
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  if (!parsed.success) {
    return errorResponse(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const rows = await withDb((db) => {
      const conditions = [eq(upiTransaction.userId, user.id)];
      if (parsed.data.from) {
        conditions.push(gte(upiTransaction.occurredAt, new Date(parsed.data.from)));
      }
      if (parsed.data.to) {
        conditions.push(lte(upiTransaction.occurredAt, new Date(parsed.data.to)));
      }
      if (parsed.data.tagId.length > 0) {
        conditions.push(inArray(upiTag.id, parsed.data.tagId));
      }

      return db
        .select({
          tagId: upiTag.id,
          tagName: upiTag.name,
          amountPaise: upiTransaction.amountPaise,
        })
        .from(upiTransactionTag)
        .innerJoin(upiTransaction, eq(upiTransactionTag.transactionId, upiTransaction.id))
        .innerJoin(upiTag, eq(upiTransactionTag.tagId, upiTag.id))
        .where(and(...conditions));
    });

    return NextResponse.json({ data: computeTagSummary(rows) });
  } catch (err) {
    console.error("upi-tracker transactions summary GET error:", err);
    return errorResponse(500, "INTERNAL_ERROR", "Could not load the summary.");
  }
}

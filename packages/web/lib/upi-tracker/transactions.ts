import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { upiTag, upiTransactionTag } from "@/db/schema";
import type { TransactionOrigin, TransactionStatus } from "@/lib/validation/upi-tracker";
import type { OwnedTagRow } from "@/lib/upi-tracker/tags";

export type TransactionRow = {
  id: string;
  payeeVpa: string;
  payeeName: string | null;
  amountPaise: number;
  status: string;
  origin: string;
  note: string | null;
  occurredAt: Date;
};

/** Shared response shape across create/list/update (contracts/upi-tracker-api.md
 *  — every endpoint returns transactions in this one shape). */
export function toTransactionDto(row: TransactionRow, tags: OwnedTagRow[]) {
  return {
    id: row.id,
    payeeVpa: row.payeeVpa,
    payeeName: row.payeeName,
    amountPaise: row.amountPaise,
    status: row.status as TransactionStatus,
    origin: row.origin as TransactionOrigin,
    note: row.note,
    occurredAt: row.occurredAt,
    tags,
  };
}

/** The tags currently attached to one transaction, joined from the live
 *  `upiTag` row — this is how a deleted tag's frozen name/color still
 *  renders correctly on old transactions (research.md §4). */
export async function getTagsForTransaction(
  db: NodePgDatabase<typeof schema>,
  transactionId: string,
): Promise<OwnedTagRow[]> {
  const rows = await db
    .select({ id: upiTag.id, name: upiTag.name, color: upiTag.color })
    .from(upiTransactionTag)
    .innerJoin(upiTag, eq(upiTransactionTag.tagId, upiTag.id))
    .where(eq(upiTransactionTag.transactionId, transactionId));
  return rows as OwnedTagRow[];
}

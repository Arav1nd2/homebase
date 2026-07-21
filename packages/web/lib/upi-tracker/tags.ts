import { and, eq, inArray, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { upiTag } from "@/db/schema";
import type { TagColor } from "@/lib/validation/upi-tracker";

export type OwnedTagRow = { id: string; name: string; color: TagColor };

/**
 * Resolves a set of tag ids to the caller's own, currently-active tag
 * rows — used by both transaction create and update (FR-007/FR-015) to
 * enforce "every `tagIds` entry belongs to the caller and is not
 * soft-deleted" (contracts/upi-tracker-api.md). Returns `null` if any id
 * doesn't resolve (not owned, doesn't exist, or soft-deleted), so the
 * caller can turn that into a single 400 without a second query.
 */
export async function resolveOwnedActiveTags(
  db: NodePgDatabase<typeof schema>,
  userId: string,
  tagIds: string[],
): Promise<OwnedTagRow[] | null> {
  const uniqueIds = [...new Set(tagIds)];
  if (uniqueIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ id: upiTag.id, name: upiTag.name, color: upiTag.color })
    .from(upiTag)
    .where(and(eq(upiTag.userId, userId), isNull(upiTag.deletedAt), inArray(upiTag.id, uniqueIds)));

  if (rows.length !== uniqueIds.length) {
    return null;
  }

  return rows as OwnedTagRow[];
}

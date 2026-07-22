export type SummaryInputRow = { tagId: string; tagName: string; amountPaise: number };
export type SummaryRow = { tagId: string; tagName: string; totalPaise: number; transactionCount: number };

/**
 * Per-tag totals from a flat list of (tag, transaction-amount) rows — one
 * row per transaction-tag pairing, so a transaction with N tags appears
 * N times here, once per tag (FR-014: its full amount counts toward
 * each). A pure function (no DB/SQL aggregate) so the "no proportional
 * splitting" rule is directly unit-testable (Principle VII).
 */
export function computeTagSummary(rows: SummaryInputRow[]): SummaryRow[] {
  const byTag = new Map<string, { tagName: string; totalPaise: number; transactionCount: number }>();

  for (const row of rows) {
    const existing = byTag.get(row.tagId) ?? { tagName: row.tagName, totalPaise: 0, transactionCount: 0 };
    existing.totalPaise += row.amountPaise;
    existing.transactionCount += 1;
    byTag.set(row.tagId, existing);
  }

  return [...byTag.entries()].map(([tagId, value]) => ({
    tagId,
    tagName: value.tagName,
    totalPaise: value.totalPaise,
    transactionCount: value.transactionCount,
  }));
}

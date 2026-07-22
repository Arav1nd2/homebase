import type { UpiTransactionSummaryRow } from "@/lib/api/upi-tracker";

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toFixed(2)}`;
}

export type SummaryCardProps = {
  rows: UpiTransactionSummaryRow[];
  /**
   * The current filter selection's total across all its (deduplicated)
   * transactions — computed by the caller from the transaction list, not
   * from summing `rows`: a transaction carrying more than one tag is
   * counted once per tag above (FR-014's no-splitting rule) but must
   * only count once here, so this figure will legitimately differ from
   * the sum of the rows whenever any transaction carries multiple tags
   * (DESIGN.md §UPI summary — "that gap is the rule working as
   * specified, not an arithmetic error").
   */
  periodTotalPaise: number;
};

/** Plain numeric rows, not a chart (§Direction: "a kept notebook, not a
 *  productivity dashboard") — per-tag/per-period totals (FR-014, SC-002). */
export function SummaryCard({ rows, periodTotalPaise }: SummaryCardProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-b border-border py-3">
      {rows.map((row) => (
        <div key={row.tagId} className="flex items-baseline justify-between gap-3">
          <span className="text-sm leading-sm text-text">Subtotal — {row.tagName}</span>
          <span className="text-sm leading-sm tabular-nums text-text">{formatAmount(row.totalPaise)}</span>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <span className="text-base leading-base font-semibold text-text">Total</span>
        <span className="text-base leading-base font-semibold tabular-nums text-text">
          {formatAmount(periodTotalPaise)}
        </span>
      </div>
    </div>
  );
}

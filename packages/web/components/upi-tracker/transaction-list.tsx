import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionStatusIndicator } from "@/components/upi-tracker/transaction-status";
import { TAG_SWATCH_CLASSES } from "@/components/upi-tracker/tag-picker";
import type { UpiTransactionDto } from "@/lib/api/upi-tracker";

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toFixed(2)}`;
}

function formatOccurredAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export type TransactionListProps = {
  transactions: UpiTransactionDto[];
  /** Renders the trailing "Edit" affordance (FR-015, US3's T032) — omit
   *  to render a plain read-only list. */
  onEdit?: (transaction: UpiTransactionDto) => void;
  /** Expands the row in place with whatever the caller renders — no
   *  navigation, no modal (this system has no elevation layer). Used for
   *  the inline tag/status edit form (FR-015). */
  renderExpanded?: (transaction: UpiTransactionDto) => ReactNode;
};

/**
 * Extends the Ledger dense-frame row anatomy (description/meta/amount)
 * with a status cue and a tag-chip row added *below*, never inside it
 * (DESIGN.md §Transaction row — UPI history). A transaction with
 * multiple tags still renders exactly one amount, once.
 */
export function TransactionList({ transactions, onEdit, renderExpanded }: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState message="Nothing tracked yet. Every payment you tag builds this record." />;
  }

  return (
    <ul className="flex flex-col border-t border-border">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="flex flex-col gap-2 border-b border-border py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-base leading-base text-text">
              {transaction.payeeName ?? transaction.payeeVpa}
            </span>
            <span className="text-base leading-base tabular-nums text-text">
              {formatAmount(transaction.amountPaise)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs leading-xs text-text-secondary">
              {formatOccurredAt(transaction.occurredAt)}
            </span>
            <TransactionStatusIndicator status={transaction.status} />
          </div>
          {transaction.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {transaction.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2 py-0.5 text-xs leading-xs ${TAG_SWATCH_CLASSES[tag.color]}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="min-h-tap-target self-end text-sm leading-sm text-text-secondary underline decoration-border underline-offset-2"
            >
              Edit
            </button>
          ) : null}
          {renderExpanded ? renderExpanded(transaction) : null}
        </li>
      ))}
    </ul>
  );
}

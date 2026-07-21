import type { TransactionStatus } from "@/lib/validation/upi-tracker";

/**
 * `pending` and `unconfirmed` read as one "not confirmed" bucket
 * everywhere except the raw stored value (research.md §3) — a
 * never-returned `pending` row must never read as lost or stuck. There
 * is no background sweep that rewrites `pending` to `unconfirmed`; every
 * read path (list/filter/summary) just treats the two as equivalent.
 */
export type StatusBucket = "success" | "failed" | "not-confirmed";

export function statusBucket(status: TransactionStatus): StatusBucket {
  if (status === "success" || status === "failed") {
    return status;
  }
  return "not-confirmed";
}

export function isNotConfirmed(status: TransactionStatus): boolean {
  return status === "pending" || status === "unconfirmed";
}

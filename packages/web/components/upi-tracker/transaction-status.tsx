import { CheckCircle2, Clock, HelpCircle, XCircle, type LucideIcon } from "lucide-react";
import type { TransactionStatus } from "@/lib/validation/upi-tracker";

/**
 * 4-state redundant cue (DESIGN.md §Transaction status indicator) — words
 * + a distinct icon glyph, reusing the four already-verified functional
 * inks 1:1 (no new color tokens). Color is never the sole carrier: shape
 * (the icon) plus the word both change per state.
 */
const STATUS_CONFIG: Record<TransactionStatus, { label: string; icon: LucideIcon; className: string }> = {
  success: { label: "Success", icon: CheckCircle2, className: "text-success-11" },
  failed: { label: "Failed", icon: XCircle, className: "text-error-11" },
  pending: { label: "Pending", icon: Clock, className: "text-info-11" },
  unconfirmed: { label: "Unconfirmed", icon: HelpCircle, className: "text-warning-11" },
};

export function TransactionStatusIndicator({ status }: { status: TransactionStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs leading-xs ${config.className}`}>
      <Icon aria-hidden="true" size={14} />
      {config.label}
    </span>
  );
}

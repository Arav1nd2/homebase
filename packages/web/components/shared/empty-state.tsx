import type { ReactNode } from "react";

export type EmptyStateProps = {
  /** Short literary-register copy (2-4 lines), supplied by the caller per-tool — DESIGN.md's "empty states set as short verse," not a generic "no items yet" line. */
  message: ReactNode;
};

// Framed by a 96px bracket ([ / ]) in the display serif, DESIGN.md's
// signature move applied to the empty-state case, rather than an
// illustration or icon. The brackets are decorative (aria-hidden); the
// message itself carries the accessible content.
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="font-display text-5xl leading-none text-[var(--text-secondary)]" aria-hidden="true">
          [
        </span>
        <p className="font-display text-lg leading-lg max-w-[40ch] text-[var(--text)]">{message}</p>
        <span className="font-display text-5xl leading-none text-[var(--text-secondary)]" aria-hidden="true">
          ]
        </span>
      </div>
    </div>
  );
}

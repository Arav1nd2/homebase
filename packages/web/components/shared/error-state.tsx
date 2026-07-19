import type { ReactNode } from "react";

export type ErrorStateProps = {
  /** Plain-register message describing what happened — Yifrah-formula copy is a caller concern; this component only provides the structural pattern. */
  message: ReactNode;
  /** Retries the same action in place — never a separate recovery flow (JOURNEY.md's repeated "retry is the same tap" rule). Omit when there's nothing to retry. */
  onRetry?: () => void;
};

// Failure is a first-class surface here, never a toast (FR-013; DESIGN.md's
// Never section). A single bottom hairline plus a flat error-tinted fill is
// the only structural device — no box border, no radius (DESIGN.md: no
// card, no panel, no rounded rectangle anywhere in this system). The
// leading glyph plus text state the kind redundantly; color is never the
// only cue.
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-b border-[var(--error-9)] bg-[var(--error-3)] px-6 py-4"
    >
      <span className="font-display text-xl leading-none text-[var(--error-11)]" aria-hidden="true">
        !
      </span>
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-sm text-[var(--error-11)]">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[var(--tap-target)] self-start text-sm leading-sm font-medium text-[var(--text)] underline decoration-[var(--border)] underline-offset-2"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";

export type PageHeaderProps = {
  /** Oversize display-serif mark (e.g. "¶", "§") — decorative identity, not information; omit for pages with no assigned mark. */
  mark?: string;
  /** Canonical page title — matches JOURNEY.md's canonical labeling table, used identically everywhere. */
  title: string;
  /**
   * Whether the back-to-hub affordance renders. Defaults to `true` so
   * every existing/future tool-screen call site is unaffected. The auth
   * screens (004-auth-shell-migration) are the first caller to pass
   * `false` — a signed-out visitor has no hub to return to yet.
   */
  showBackToHub?: boolean;
};

// Every tool screen renders inside the shell and gets this header for
// free: the oversize-punctuation signature move (DESIGN.md) plus a
// back-to-hub affordance (JOURNEY.md's IA — no persistent nav bar means
// local, per-page navigation-back is the shell's job, not each screen's).
// This shell still has no nav bar/search escape hatches by design
// (FR-007, FR-008) — only the back-to-hub affordance itself is optional.
export function PageHeader({ mark, title, showBackToHub = true }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 px-[var(--space-page-margin)] pt-[var(--space-6)]">
      {showBackToHub ? (
        <Link
          href="/"
          className="inline-flex min-h-[var(--tap-target)] w-fit items-center text-sm leading-sm text-text-secondary"
        >
          <span aria-hidden="true">‹ </span>
          HomeBase
        </Link>
      ) : null}
      <div className="flex items-baseline gap-3">
        {mark ? (
          <span className="font-display text-5xl leading-none text-text" aria-hidden="true">
            {mark}
          </span>
        ) : null}
        <h1 className="font-display text-3xl leading-3xl font-regular text-text">{title}</h1>
      </div>
    </header>
  );
}

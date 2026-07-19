import Link from "next/link";

export type PageHeaderProps = {
  /** Oversize display-serif mark (e.g. "¶", "§") — decorative identity, not information; omit for pages with no assigned mark. */
  mark?: string;
  /** Canonical page title — matches JOURNEY.md's canonical labeling table, used identically everywhere. */
  title: string;
};

// Every tool screen renders inside the shell and gets this header for
// free: the oversize-punctuation signature move (DESIGN.md) plus a
// back-to-hub affordance (JOURNEY.md's IA — no persistent nav bar means
// local, per-page navigation-back is the shell's job, not each screen's).
// No prop suppresses the back-to-hub link or adds a nav bar/search — this
// shell has no such escape hatches by design (FR-007, FR-008).
export function PageHeader({ mark, title }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 px-[var(--space-page-margin)] pt-[var(--space-6)]">
      <Link
        href="/"
        className="inline-flex min-h-[var(--tap-target)] w-fit items-center text-sm leading-sm text-[var(--text-secondary)]"
      >
        <span aria-hidden="true">‹ </span>
        HomeBase
      </Link>
      <div className="flex items-baseline gap-3">
        {mark ? (
          <span className="font-display text-5xl leading-none text-[var(--text)]" aria-hidden="true">
            {mark}
          </span>
        ) : null}
        <h1 className="font-display text-3xl leading-3xl font-regular text-[var(--text)]">{title}</h1>
      </div>
    </header>
  );
}

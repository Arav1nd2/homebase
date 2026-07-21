"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ChevronLeft, Moon, Sun } from "lucide-react";

/**
 * One `back` contract, three navigational behaviors (DESIGN.md §Shell
 * chrome — PageHeader) plus `false` for "no back control at all." A new
 * navigational context is a new value handled here, never a bespoke
 * header built beside this one.
 */
export type PageHeaderBack =
  | { mode: "hub" }
  | { mode: "step"; onBack: () => void }
  | { mode: "parent"; href: string; label: string }
  | false;

export type PageHeaderProps = {
  /** Oversize display-serif mark (e.g. "¶", "§") — decorative identity, not information; omit for pages with no assigned mark. */
  mark?: string;
  /** Canonical page title — matches JOURNEY.md's canonical labeling table, used identically everywhere. */
  title: string;
  /**
   * Which back control renders. Defaults to `{ mode: "hub" }` so every
   * existing/future tool-screen call site is unaffected by omitting this
   * prop. `false` renders no back control at all — the login page's
   * exception (a signed-out visitor has no hub to return to yet).
   */
  back?: PageHeaderBack;
};

function BackControl({ back }: { back: PageHeaderBack }) {
  if (back === false) {
    return null;
  }

  const className =
    "inline-flex min-h-tap-target w-fit items-center gap-1 text-sm leading-sm text-text-secondary";

  if (back.mode === "step") {
    return (
      <button type="button" onClick={back.onBack} className={className}>
        <ChevronLeft aria-hidden="true" size={20} />
        Back
      </button>
    );
  }

  if (back.mode === "parent") {
    return (
      <Link href={back.href} className={className}>
        <ChevronLeft aria-hidden="true" size={20} />
        {back.label}
      </Link>
    );
  }

  return (
    <Link href="/" className={className}>
      <ChevronLeft aria-hidden="true" size={20} />
      HomeBase
    </Link>
  );
}

// Wired to next-themes' setTheme, flipping the *resolved* theme (light <->
// dark) explicitly — a persistent manual override, not a one-shot nudge
// back to "system" (DESIGN.md §Shell chrome — PageHeader). Rendering is
// deferred until after mount: resolvedTheme is only known client-side, so
// rendering it during SSR would mismatch the client's first paint.
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span aria-hidden="true" className="inline-block min-h-tap-target min-w-tap-target" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex min-h-tap-target min-w-tap-target items-center justify-center text-text-secondary"
    >
      {isDark ? <Moon aria-hidden="true" size={20} /> : <Sun aria-hidden="true" size={20} />}
    </button>
  );
}

// Every tool screen renders inside the shell and gets this header for
// free: the oversize-punctuation signature move (DESIGN.md) plus a
// context-aware back control (JOURNEY.md's IA — no persistent nav bar
// means local, per-page navigation-back is the shell's job, not each
// screen's) and a theme toggle, a two-end row per the Never section's
// standing anti-center-axis rule.
export function PageHeader({ mark, title, back = { mode: "hub" } }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 px-page-margin pt-8">
      <div className="flex items-center justify-between">
        <BackControl back={back} />
        <ThemeToggle />
      </div>
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

import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Styleguide — HomeBase",
  description: "Shell foundation reference: tokens, page shell, and state patterns.",
};

// A kernel/dev-facing example screen (FR-009) proving the shell — tokens,
// page shell, and the three state patterns — compose correctly. No
// tool-specific content: nothing here represents a real domain's data. The
// error example omits onRetry since a Server Component can't pass a
// function across the server/client boundary to ErrorState's client-side
// button — the retry behavior itself is already covered by
// tests/unit/state-patterns.test.tsx, not re-demonstrated here.
export default function StyleguidePage() {
  return (
    <>
      <PageHeader mark="†" title="Styleguide" />
      <main className="flex flex-col gap-[var(--space-between-group)] px-[var(--space-page-margin)] py-[var(--space-6)]">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl leading-xl font-semibold text-[var(--text)]">Loading</h2>
          <LoadingState label="Loading example content" />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl leading-xl font-semibold text-[var(--text)]">Empty</h2>
          <EmptyState message="Nothing here yet. This space is waiting, not broken." />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl leading-xl font-semibold text-[var(--text)]">Error</h2>
          <ErrorState message="That didn't save. Try again." />
        </section>
      </main>
    </>
  );
}

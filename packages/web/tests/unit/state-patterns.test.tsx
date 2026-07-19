import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";

// @ts-expect-error — none of the three state patterns accept a className/
// style override; passing one must fail to compile (contracts/shared-components.md).
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- compile-time-only check, never executed
const _rejectsClassNameOverride = <LoadingState className="not-allowed" />;

// This project's vitest.config.ts doesn't enable `test.globals`, so
// @testing-library/react's automatic afterEach-cleanup registration never
// fires — do it explicitly instead of silently accumulating DOM across tests.
afterEach(() => {
  cleanup();
});

describe("LoadingState", () => {
  it("announces the label to screen readers and renders a static skeleton", () => {
    render(<LoadingState label="Loading habits" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading habits");
  });

  it("never animates (DESIGN.md: no ambient or looping motion)", () => {
    const { container } = render(<LoadingState />);
    const bars = container.querySelectorAll('[data-slot="skeleton"]');
    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect(bar.className).toContain("animate-none");
      expect(bar.className).not.toMatch(/(?<!-)animate-pulse/);
    }
  });
});

describe("EmptyState", () => {
  it("renders the caller-supplied message as accessible content", () => {
    render(<EmptyState message="Nothing logged yet." />);
    expect(screen.getByText("Nothing logged yet.")).toBeInTheDocument();
  });

  it("frames the message with decorative, screen-reader-hidden brackets", () => {
    render(<EmptyState message="Nothing logged yet." />);
    const brackets = screen.getAllByText(/^[[\]]$/);
    expect(brackets).toHaveLength(2);
    for (const bracket of brackets) {
      expect(bracket).toHaveAttribute("aria-hidden", "true");
    }
  });
});

describe("ErrorState", () => {
  it("renders as an alert with the message, never a toast", () => {
    render(<ErrorState message="That didn't save." />);
    expect(screen.getByRole("alert")).toHaveTextContent("That didn't save.");
  });

  it("omits the retry control when onRetry isn't provided", () => {
    render(<ErrorState message="That didn't save." />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("retries the same action in place on click, not a separate flow", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="That didn't save." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("state pattern structural consistency", () => {
  it("gives every state pattern the same horizontal page-margin padding", () => {
    const { container: loading } = render(<LoadingState />);
    const { container: empty } = render(<EmptyState message="x" />);
    const { container: error } = render(<ErrorState message="x" />);

    expect(loading.firstElementChild?.className).toContain("px-6");
    expect(empty.firstElementChild?.className).toContain("px-6");
    expect(error.firstElementChild?.className).toContain("px-6");
  });
});

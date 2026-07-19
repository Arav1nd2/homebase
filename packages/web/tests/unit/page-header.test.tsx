import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PageHeader } from "@/components/shared/page-header";

afterEach(() => {
  cleanup();
});

describe("PageHeader", () => {
  it("renders a back-to-hub affordance by default", () => {
    render(<PageHeader title="Habits" />);
    const back = screen.getByRole("link", { name: /homebase/i });
    expect(back).toHaveAttribute("href", "/");
  });

  it("omits the back-to-hub affordance when showBackToHub is false", () => {
    render(<PageHeader title="Sign in" showBackToHub={false} />);
    expect(screen.queryByRole("link", { name: /homebase/i })).not.toBeInTheDocument();
  });

  it("renders the canonical title as the page's H1", () => {
    render(<PageHeader title="Habits" />);
    expect(screen.getByRole("heading", { level: 1, name: "Habits" })).toBeInTheDocument();
  });

  it("hides the oversize mark from screen readers when present — identity, not information", () => {
    render(<PageHeader mark="§" title="Expenses" />);
    const mark = screen.getByText("§");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the mark entirely rather than rendering an empty placeholder when none is given", () => {
    render(<PageHeader title="Habits" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.parentElement?.querySelector('span[aria-hidden="true"]')).toBeNull();
  });
});

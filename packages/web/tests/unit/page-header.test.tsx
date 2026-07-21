import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "next-themes";

import { PageHeader } from "@/components/shared/page-header";

afterEach(() => {
  cleanup();
  // next-themes persists the last-picked theme to localStorage; clear it
  // so each test's ThemeProvider starts from its own defaultTheme again.
  window.localStorage.clear();
});

// next-themes' useTheme() needs a provider in the tree — enableSystem is
// off so resolvedTheme comes only from defaultTheme/setTheme, never
// window.matchMedia (unimplemented in jsdom).
function renderWithTheme(ui: React.ReactElement, defaultTheme: "light" | "dark" = "light") {
  return render(
    <ThemeProvider attribute="data-theme" enableSystem={false} defaultTheme={defaultTheme}>
      {ui}
    </ThemeProvider>,
  );
}

describe("PageHeader", () => {
  it("renders a back-to-hub affordance by default", () => {
    renderWithTheme(<PageHeader title="Habits" />);
    const back = screen.getByRole("link", { name: /homebase/i });
    expect(back).toHaveAttribute("href", "/");
  });

  it("omits the back control entirely when back is false", () => {
    renderWithTheme(<PageHeader title="Sign in" back={false} />);
    expect(screen.queryByRole("link", { name: /homebase/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
  });

  it("renders a step back button that calls onBack instead of navigating", () => {
    const onBack = vi.fn();
    renderWithTheme(<PageHeader title="Amount" back={{ mode: "step", onBack }} />);
    const back = screen.getByRole("button", { name: /back/i });
    expect(back).not.toHaveAttribute("href");
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders a parent back link with the given label and href", () => {
    renderWithTheme(<PageHeader title="History" back={{ mode: "parent", href: "/upi-tracker", label: "UPI" }} />);
    const back = screen.getByRole("link", { name: /upi/i });
    expect(back).toHaveAttribute("href", "/upi-tracker");
  });

  it("renders the canonical title as the page's H1", () => {
    renderWithTheme(<PageHeader title="Habits" />);
    expect(screen.getByRole("heading", { level: 1, name: "Habits" })).toBeInTheDocument();
  });

  it("hides the oversize mark from screen readers when present — identity, not information", () => {
    renderWithTheme(<PageHeader mark="§" title="Expenses" />);
    const mark = screen.getByText("§");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the mark entirely rather than rendering an empty placeholder when none is given", () => {
    renderWithTheme(<PageHeader title="Habits" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.parentElement?.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  describe("theme toggle", () => {
    it("shows Sun and aria-pressed=false when the resolved theme is light", () => {
      renderWithTheme(<PageHeader title="Habits" />, "light");
      const toggle = screen.getByRole("button", { name: /switch to dark mode/i });
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    it("shows Moon and aria-pressed=true when the resolved theme is dark", () => {
      renderWithTheme(<PageHeader title="Habits" />, "dark");
      const toggle = screen.getByRole("button", { name: /switch to light mode/i });
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    });

    it("flips the resolved theme on tap", () => {
      renderWithTheme(<PageHeader title="Habits" />, "light");
      const toggle = screen.getByRole("button", { name: /switch to dark mode/i });
      fireEvent.click(toggle);
      expect(screen.getByRole("button", { name: /switch to light mode/i })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("renders regardless of the back prop's value", () => {
      renderWithTheme(<PageHeader title="Sign in" back={false} />);
      expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
    });
  });
});

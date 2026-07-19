import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// jsdom's CSSOM doesn't reliably resolve custom-property values through
// getComputedStyle, so "render an element and check computed style" isn't
// actually verifiable in this test environment. Instead this is a
// lightweight regression test over styles/globals.css's own source text —
// it guards against a future edit silently dropping a token or forgetting
// its dark-mode override. This is NOT the DESIGN.md-vs-implementation
// drift check that was considered and declined (research.md §3) — it
// checks this file is internally consistent with itself, nothing else.
const css = readFileSync(join(__dirname, "../../styles/globals.css"), "utf8");

function rootBlock(): string {
  const match = css.match(/(?<!\[data-theme="dark"\]\s*)\{\s*\/\* Tier 1[\s\S]*?\n\}/);
  if (!match) throw new Error("Could not locate :root token block in globals.css");
  return match[0];
}

function darkBlock(): string {
  const match = css.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/);
  if (!match) throw new Error("Could not locate [data-theme=\"dark\"] block in globals.css");
  return match[0];
}

function themeBlock(): string {
  const match = css.match(/@theme\s*\{[\s\S]*?\n\}/);
  if (!match) throw new Error("Could not locate @theme block in globals.css");
  return match[0];
}

describe("design tokens (styles/globals.css)", () => {
  it("defines the neutral and accent color ramps in light mode", () => {
    const root = rootBlock();
    expect(root).toContain("--neutral-1: #fcfdfc;");
    expect(root).toContain("--neutral-12: #2b2f2d;");
    expect(root).toContain("--accent-9: #84caa0;");
  });

  it("overrides the color ramps for dark mode, not just the aliases", () => {
    const dark = darkBlock();
    expect(dark).toContain("--neutral-1: #121312;");
    expect(dark).toContain("--neutral-12: #e5e9e6;");
  });

  it("keeps the brand accent-9 solid identical across modes", () => {
    // The brand fill color is deliberately mode-invariant (DESIGN.md);
    // only its surrounding neutrals shift.
    const dark = darkBlock();
    expect(dark).toContain("--accent-9: #84caa0;");
  });

  it("maps every alias token through Tier 1 only, never a raw hex", () => {
    const root = rootBlock();
    expect(root).toContain("--background: var(--neutral-1);");
    expect(root).toContain("--text: var(--neutral-12);");
    expect(root).toContain("--accent-solid: var(--accent-9);");
  });

  it("exposes the type scale from --text-xs through the signature --text-5xl mark size", () => {
    const theme = themeBlock();
    expect(theme).toContain("--text-xs: 0.75rem;");
    expect(theme).toContain("--text-3xl: 2rem;");
    expect(theme).toContain("--text-5xl: 4.5rem;");
    expect(theme).toContain("--leading-5xl: 1;");
  });

  it("wires the display/body font tokens to next/font's generated variables", () => {
    const theme = themeBlock();
    expect(theme).toContain("--font-display: var(--font-newsreader)");
    expect(theme).toContain("--font-body: var(--font-inter)");
  });

  it("zeroes radius app-wide (DESIGN.md: no rounded rectangle anywhere in this system)", () => {
    const theme = themeBlock();
    expect(theme).toContain("--radius: 0px;");
  });

  it("maps every Tailwind color utility (--color-*) to a token, not a literal value", () => {
    const theme = themeBlock();
    const colorLines = theme
      .split("\n")
      .filter((line) => /^\s*--color-/.test(line));
    expect(colorLines.length).toBeGreaterThan(20);
    for (const line of colorLines) {
      expect(line).toMatch(/--color-[\w-]+:\s*var\(--[\w-]+\);/);
    }
  });
});

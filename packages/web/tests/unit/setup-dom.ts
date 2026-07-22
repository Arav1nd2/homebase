import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia implementation. next-themes' ThemeProvider calls
// it unconditionally on mount (to read/watch the OS color-scheme
// preference), even when enableSystem is off, so any component test that
// renders inside a ThemeProvider (e.g. PageHeader's theme toggle) needs
// this stubbed out.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

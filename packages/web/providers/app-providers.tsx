"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { getQueryClient } from "@/lib/query-client";

/**
 * Reads a `?theme=` query param and forces that mode on mount — a
 * verification-only override (no visible in-app control) so both light
 * and dark mode can be checked without changing OS/devtools settings
 * (research.md §2, FR-015). Deliberately reads `window.location.search`
 * directly rather than `useSearchParams()`, so this doesn't force the
 * whole app into a Suspense boundary for a verification-only side channel.
 */
function ThemeQueryOverride() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("theme");
    if (requested === "light" || requested === "dark" || requested === "system") {
      setTheme(requested);
    }
  }, [setTheme]);

  return null;
}

// Deliberately no toast/notification provider here (FR-013) — DESIGN.md
// rules out visual toast chrome everywhere; a future flow that needs to
// confirm an action does so via an in-place visual change plus a
// screen-reader-only announcement, not this provider tree.
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <ThemeQueryOverride />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}

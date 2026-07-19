import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

// Self-hosted at build time via next/font (research.md §5) — zero runtime
// request to Google's CDN. Newsreader is weight 400 only: DESIGN.md's
// Weights section reserves medium/semibold for Inter exclusively, "never
// the serif." Their generated CSS variables feed globals.css's
// --font-display/--font-body tokens (T016).
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HomeBase",
  description: "Personal life-management app",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes only knows the resolved
    // theme client-side on first paint (research.md §2).
    <html
      lang="en"
      className={cn("font-sans", newsreader.variable, inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

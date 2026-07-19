# Quickstart: Validating the UI Shell Foundation

Run these after implementation to confirm the feature meets spec.md's
Success Criteria. This is a validation guide, not an implementation guide
— see `contracts/shared-components.md` for the component interfaces and
`data-model.md` for the token/entity shapes being validated.

## Prerequisites

- Local Supabase stack running (`npm run db:start`), even though this
  feature touches no data — the app still boots through the real Workers
  preview per Constitution Principle VI (Environment Parity); there is no
  `next dev` shortcut in this repo.
- Dependencies installed (`npm install`) after this feature adds
  `tailwindcss`, `@tailwindcss/postcss`, shadcn/ui's runtime deps,
  `next-themes`, and `@tanstack/react-query` to `packages/web/package.json`.

## 1. Boot the app and reach the example screen

```bash
npm run dev
```

Visit `http://localhost:8787/styleguide` (per this repo's own allow-listed
dev-command precedent for this exact route). Set devtools to a 375×667
viewport (the smallest currently-supported iPhone) first — FR-011 requires
the shell to be designed and verified at phone width before anything
wider. Confirm:

- A serif (Newsreader) oversize mark and page title render at the head of
  the page, sans-serif (Inter) body text below — SC-003.
- No persistent navigation bar and no search control anywhere on the page
  — SC-004.
- One instance each of the Loading, Empty, and Error patterns is visible
  (or reachable via an on-page control that triggers each), and all three
  share the same visual structure (padding, typography, mark treatment)
  — SC-002.

## 2. Verify dark mode

```text
http://localhost:8787/styleguide?theme=dark
```

Confirm the same structure, mark, and typography render correctly with
the dark-mode token values (`[data-theme="dark"]` in `styles/globals.css`)
— no unstyled elements, no broken contrast. Toggle the OS/browser color
scheme (devtools → Rendering → Emulate CSS media feature
`prefers-color-scheme`) and confirm the page follows it when no override
is present — `next-themes`' `defaultTheme="system"` behavior (research.md
§2).

## 3. Confirm no shared toast/notification component exists

```bash
grep -ri "toast\|sonner" packages/web/providers packages/web/components packages/web/package.json
```

Expected: no match in `providers/app-providers.tsx` or
`package.json`'s dependencies — FR-013's clarified scope. (A match inside
an unrelated file, e.g. a comment explaining why one wasn't added, is
fine; a `sonner`/toast *dependency* or a rendered toast component is not.)

## 4. Token consistency check (SC-001)

```bash
grep -rEn "#[0-9a-fA-F]{3,8}|(?<!var\()[0-9]+px" packages/web/components packages/web/app
```

Expected: no matches outside `styles/globals.css` itself — every color and
spacing value in components resolves through a CSS variable / Tailwind
utility, never a hardcoded hex or raw pixel value (FR-001).

## 5. Unit tests for shared code (Constitution Principle VII)

```bash
npm run test:unit
```

Expected: passing coverage for `components/shared/*`,
`lib/query-client.ts`, `lib/api-client.ts`, and `providers/app-providers.tsx`
— these are shared code used by every future module, so Principle VII
requires unit coverage here even though no domain consumes them yet. This
includes the token-resolution test (asserting Tailwind token classes
resolve to the correct CSS custom property in both light and dark mode),
which is the only check protecting FR-001/FR-002's token fidelity —
`DESIGN.md`-vs-implementation drift is caught by code review, not an
automated gate (research.md §3, considered and declined).

## 6. Lint / typecheck

```bash
npm run lint
npm run typecheck
```

Expected: clean. No `any`/non-null assertions without an inline
justifying comment (Constitution Principle I) — new shared components
should need zero.

## Out of scope for this quickstart

- No Playwright/e2e run is required by the spec (no real user flow
  exists yet); a minimal smoke check that `/styleguide` renders is a
  tasks-phase nice-to-have, not a Success Criterion here.
- No manual iOS Safari / Android Chrome PWA verification (Principle IV
  is explicitly deferred by this feature — plan.md Complexity Tracking).

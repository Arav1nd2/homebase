# JOURNEY.md

<!-- The structural and temporal design spec for HomeBase. Pairs with DESIGN.md (visual tokens — locked in a later phase). -->

**Status:** Job + Journey + IA + Flows + Page specs complete (Phase 1-2); Phase 6 (Words, `content-design`) extends every page spec below with actual microcopy — see each entry's **Microcopy** block. Phase 7 (Data surfaces, `data-viz`) extends the Habits and Expenses entries with a **Chart encoding** block each — the habit heatmap's streak ramp + legend and the expense ledger's diverging balance indicator. This closes the last section named in the design plan: all 7 page specs are now complete through Phase 7.
**Doctrine:** `journey` (references/journey/journey.md, journey-stack.md, journey-caveats.md); Phase 6 additions doctrine: `content-design` (references/content-design/content-design.md) — see `design/VOICE.md` for the voice/tone attribute spec and register-split rule the Microcopy blocks below apply; Phase 7 additions doctrine: `data-viz` (skills/data-viz/SKILL.md, references/chart-selection.md, references/viz-principles.md) — see each Chart encoding block and `.design-foundations/build/2026-07-17-homebase-phase-7-discovery.md` for the full citation trail.

---

## Job

**JTBD school used for all 7 stories: Moesta's Switch interview** (four forces — push/pull/anxiety/habit), per the project's design plan and `journey`'s own recommendation as the most immediately actionable school for a product team. No other school's vocabulary (Christensen's progress/circumstance, Ulwick's ODI, Klement's job-story-only format) is mixed in, per the school-mixing warning in `journey-caveats.md`.

**Research basis (stated explicitly, not glossed over):** HomeBase has no external user base — it is built by, and for, its own two users (per the project's CLAUDE.md and design plan). The job stories below are self-authored from firsthand knowledge of those two users' actual life-admin habits, not third-party interview transcripts. That is a legitimate JTBD basis for a "founder is the user" personal app, but it is a hypothesis, not externally validated research — flagged here rather than presented as something it isn't.

### HomeBase (the launcher/hub itself)

> When my life admin is scattered across five single-purpose apps, a notes file, and memory, I want one calm place to open that already knows which tool I need, so I can handle daily life admin without app-switching friction or forgetting where something lives.

- **Functional job:** consolidate scattered personal tracking into one entry point.
- **Emotional job:** feel unhurried and in control, not scattered or anxious about what's been forgotten.
- **Social job:** be (and be seen by others in the household as) someone whose life admin is handled, not chaotic.

| Force | HomeBase |
|---|---|
| Push | Juggling too many single-purpose apps (Splitwise, Letterboxd, Notion, a paper grocery list) — the cognitive overhead is remembering *which app* holds a given piece of life admin, not the admin itself. |
| Pull | One calm hub where quick-starts jump straight to the tool used daily, without a home-screen folder full of icons to hunt through. |
| Anxiety | Consolidating years of scattered habits/data into one new app — will each tool actually hold up against the specialized app it replaces (will the movie tracker feel as good as Letterboxd)? |
| Habit | Muscle memory of already-installed specialized apps — inertia of "it already works, why rebuild it." |

### Habits

> When I want to build a streak habit (exercise, meditation) and lose motivation without visible proof of progress, I want a dead-simple daily log I can hit in two taps, so I can see my streak and stay honest with myself.

- **Functional job:** log a habit completion daily; see streak/history at a glance.
- **Emotional job:** feel quietly accomplished and consistent, not nagged or guilt-tripped.
- **Social job:** n/a — this is a private, individual record.

| Force | Habits |
|---|---|
| Push | Paper streak-tracking or a generic habit app cluttered with gamification, badges, and mascots that feel juvenile against the app's calm intent. |
| Pull | A calm heatmap view (GitHub-contributions-style) that shows progress at a glance without noise or streak-shaming. |
| Anxiety | Whether breaking a streak reads as punishing/demotivating rather than motivating — the design must not make a missed day feel like failure. |
| Habit | Reflexively reopening whatever habit app is already installed, out of muscle memory. |

### Movies & TV

> When my housemate and I are deciding what to watch and can't remember if we've already seen something or what we thought of it, I want a quick, individually-logged watch history with ratings, so I can avoid re-watching by accident and remember what was actually good.

- **Functional job:** log watched movies/shows with a rating and short note.
- **Emotional job:** feel the small nostalgic satisfaction of browsing past watches, not the chore of data entry.
- **Social job:** be the one with the answer when "did we already watch this?" comes up.

| Force | Movies & TV |
|---|---|
| Push | Letterboxd/IMDb are yet another app to open; unaided memory is unreliable for "have we seen this." |
| Pull | Posters kept in full original color inside one calm log that lives next to everything else, not siloed in a single-purpose app. |
| Anxiety | Losing Letterboxd's social/community layer — a rating logged with no audience can feel less "real." |
| Habit | Default reflex to open Letterboxd or IMDb, since that's where the existing history already lives. |

### Expenses

> When a housemate or a friend and I split a bill and don't want to do the mental math or manually itemize a receipt, I want to photograph the bill and have it parsed into a split automatically, so I can settle up without friction or an awkward money conversation.

- **Functional job:** photograph a bill → AI parses it into line-items and a split → confirm or edit → save.
- **Emotional job:** feel confident the math is right, not anxious about a money conversation.
- **Social job:** be seen as fair and transparent about money, not careless or stingy.

| Force | Expenses |
|---|---|
| Push | Manual math in a notes app, or the low-grade awkwardness of tracking informal IOUs by memory. |
| Pull | AI bill-parsing removes the tedious itemization step entirely — photograph, confirm, done. |
| Anxiety | Trusting an AI to parse a real bill correctly when real money is on the line. |
| Habit | Reflex to just use Splitwise, since friends are already on it (this tool is explicitly Splitwise-style/individual-account — see IA notes below). |

### Food Reviews

> When my housemate and I try a new restaurant and want to remember what was good or bad for next time, I want a quick place to jot a rating and note right after eating, so I can decide with confidence whether to go back.

- **Functional job:** log a restaurant visit with a rating, a short note, and optionally a photo.
- **Emotional job:** feel like the keeper of a shared taste record, not the author of a formal public review.
- **Social job:** build "our list" of trusted spots between the two people.

| Force | Food Reviews |
|---|---|
| Push | Forgetting which restaurant/dish was actually good; Google/Yelp reviews are written for strangers, not "us." |
| Pull | A private record in our own voice and our own taste, with no public-review pressure. |
| Anxiety | If logging takes more than a moment, it never happens — the entry has to survive the "we just finished eating and want to leave" window. |
| Habit | Default to no system at all — just remembering, or texting each other, which fades within days. |

### Recipes

> When I find a recipe worth keeping (a card, a website, a memory of a dish) and want to actually cook it again, I want one calm place to store ingredients and steps in my own words, so I can cook from it without hunting across bookmarks and screenshots.

- **Functional job:** save a recipe (ingredients + steps); retrieve it while cooking.
- **Emotional job:** feel the calm of a well-kept personal cookbook, not the clutter of browser tabs.
- **Social job:** build a shared household recipe book between the two people.

| Force | Recipes |
|---|---|
| Push | Scattered screenshots, browser bookmarks, torn-out magazine pages, a recipe half-remembered from a video. |
| Pull | One calm "book" that feels like an actual kept notebook, not a bookmarking tool. |
| Anxiety | Transcribing a whole recipe feels effortful enough to defer forever — the tool must not make saving feel like homework. |
| Habit | Reflex to just re-search for the recipe online every time instead of saving it once. |

### Groceries

> When I'm about to shop and don't want to forget what's needed or double-buy what we already have, I want a simple running checklist I can add to all week and check off in the store, so I can shop efficiently without a mental scramble at the door.

- **Functional job:** maintain a running list; check items off while shopping.
- **Emotional job:** feel prepared and unhurried at the store, not stressed or forgetful.
- **Social job:** not be the one who forgot something the household needed.

| Force | Groceries |
|---|---|
| Push | A paper list left at home; forgetting what's already stocked and double-buying it. |
| Pull | A running list that's always in-pocket and can be added to the moment something runs out. |
| Anxiety | If adding an item mid-week is slow or inconvenient, the list stops getting maintained and reverts to memory. |
| Habit | Reflex to wing it at the store from memory, or dump items into a generic Notes-app checklist. |

---

## Journey

**Scope note:** This is a deliberately **lightweight** journey note — touchpoints only, no NN/g swim lanes, no emotion curve — per the design plan's explicit choice and `journey-caveats.md`'s theater warning: a fabricated emotion curve with no owner, no update cadence, and no qualitative research basis (interviews, diary studies) is decoration, not insight, for a single-maintainer personal app. A full swim-lane map is not produced here; if HomeBase ever grows a team or a support inbox that could actually ground an emotion curve in real signal, that is the trigger to revisit this section.

**Actor:** Either of HomeBase's two users, on their own phone.
**Scenario:** Opening HomeBase to do a specific piece of life admin (log a habit, check a balance, add a grocery item, etc.) — not a first-time discovery/acquisition scenario. Both users already know the app exists; this is post-adoption, recurring use.
**Scope:** Current-state (the app as designed in this pass), single-actor per session (each person uses their own account; see Expenses note below).

**Decision model:** Not applicable in the McKinsey loyalty-loop / Google messy-middle sense — those models describe an *acquisition* decision (should I buy/adopt this over an alternative), and HomeBase has no such decision to design for: both users already use it daily by construction (a personal tool with no external customers to win over). The closer analogy is a **habit loop** (cue → routine → reward), which is `behavioral` doctrine's territory, not `journey`'s — noted here so a later pass knows where that question lives, not answered in this document.

**Touchpoints (per tool):**

| Tool | Entry touchpoint | Typical cadence |
|---|---|---|
| HomeBase (hub) | Home-screen app icon / PWA launch | Every session — the front door to everything below |
| Habits | Launcher quick-start pin, or shelf card | Daily |
| Movies & TV | Launcher shelf card (occasionally quick-start) | A few times a week |
| Expenses | Launcher quick-start pin (right after a shared purchase) | Bursty — clustered around outings, not steady |
| Food Reviews | Launcher shelf card, shortly after a meal out | Occasional, time-sensitive (see Anxiety force above) |
| Recipes | Launcher shelf card, mid-cook or while meal-planning | Weekly-ish |
| Groceries | Launcher quick-start pin, added to continuously through the week, opened fully at the store | Continuous input, weekly "big" use |

**Research basis:** Self-authored from the two users' own habits (see Job section above) — **not** grounded in interviews, analytics, or diary studies, because none exist for a not-yet-built personal app. Stated explicitly per the theater-risk caveat, rather than presented as validated.

---

## IA

**Organization scheme:** Task-based (an *ambiguous* Rosenfeld/Morville scheme — content grouped by what the user is trying to do: track a habit, split a bill, keep a shopping list) at the category level. Within that, individual shelf-card *ordering* uses an *exact* (alphabetical) scheme — chosen specifically because it is the one ordering rule that needs zero redesign as the tool count grows (see Navigation model below).

**Structure type:** **Hub-and-spoke** (Rosenfeld/Morville). The launcher is the hub; each of the six (and future) tools is a spoke. There is no spoke-to-spoke navigation — moving from Habits to Groceries means returning to the hub, matching the research doc's explicit framing: "not a persistent nav bar/drawer switching within one continuous frame — the home screen itself is the hub you browse from."

**The 4 IA systems (Rosenfeld/Morville, *Information Architecture for the World Wide Web*, 4th ed.):**

| System | HomeBase's answer |
|---|---|
| **Organization** | Task-based grouping (ambiguous scheme) for what's on the shelf; alphabetical (exact scheme) for shelf card order — see rationale above and in Navigation model. |
| **Labeling** | One canonical name per tool, identical on every surface — see the Canonical labeling table below. This directly fixes the mock-review finding (Nielsen #4 consistency violation: "Habit tracker" vs. "Habits", etc.). |
| **Navigation** | Global nav *is* the hub itself — no persistent nav bar/drawer. Local nav lives inside each tool (its own header + back-to-hub affordance). No contextual (related-content) nav and no breadcrumbs — the structure is only ever two levels deep (hub → spoke), so a breadcrumb trail would encode nothing a single back-arrow doesn't already. |
| **Search** | Deliberately absent at the top-level IA tier. With 6-7 top-level destinations, browsing costs less than search would — a corollary of Hick's law: search exists to solve a choice-time problem this small, known set doesn't have. Any *in-tool* search/filter (e.g., searching one's own saved recipes) is a page-level content-block concern for Phase 2, not part of the top-level IA. |

### Navigation model

Two-tier, matching the hub-and-spoke structure:

- **Quick-starts (top row, pinned):** A small, user-curated subset of tools for the fast/frequent path. Capped deliberately small (not "all six, just reordered") — **Hick's law (Hick–Hyman 1952)** predicts decision time grows with the number of options, so the whole point of this zone is to keep the *daily* launch decision fast regardless of how large the full tool set eventually gets. This is also why quick-starts are a **separate zone** from the shelf (dashboard-with-favorites pattern) rather than the shelf's order simply being "the important ones first" — a single reordered list forces a user to distinguish "pinned" from "just ranked well" by inference; two zones make the distinction structural instead of implied.
- **Shelf (full list, below):** Every tool, ordered alphabetically by its canonical name. **Hick's law** applies here too, but differently than in the quick-starts row: alphabetical scanning is a low-cost, *familiar* lookup strategy the user already owns (they don't have to re-derive "where does this tool live" as a fresh decision each time), so the shelf stays legible under Hick's law's option-reduction logic even as its option count grows past six or seven. This is also the concrete mechanism for the open-ended shelf requirement — a new tool's shelf position is a deterministic function of its name, never a fresh categorization judgment call.

### Canonical labeling (fixes the mock-review finding)

The mock checkpoint surfaced that the same tool was labeled inconsistently across surfaces ("Habit tracker" on the shelf vs. "Habits" as a quick-start pin; "Groceries" vs. "Grocery tracking"; "Movies & TV" vs. "Movie & TV tracker") — a Nielsen #4 consistency violation and a Jakob's-Law mismatch with the user's own mental model of "this is one destination, not two." This phase sets **one canonical name per tool**, used identically on the shelf card, the quick-start pin (when pinned), and the tool's own page title/H1 — no surface improvises its own phrasing:

| Tool | Canonical name (use everywhere) | Rejected variants seen in the mock |
|---|---|---|
| Habit tracking | **Habits** | "Habit tracker" |
| Movie & TV tracker | **Movies & TV** | "Movie & TV tracker" |
| Expense splitter | **Expenses** | *(not yet inconsistent in the mock, canonicalized proactively)* |
| Restaurant / food reviews | **Food Reviews** | *(not yet inconsistent in the mock, canonicalized proactively)* |
| Recipe book | **Recipes** | *(not yet inconsistent in the mock, canonicalized proactively)* |
| Grocery tracking | **Groceries** | "Grocery tracking" |

All six are short, parallel noun-phrases naming the content domain, not the mechanism (no "tracker"/"splitter"/"book" suffix survives into the canonical form) — this is deliberate: a consistent grammatical shape across all six labels makes any future 7th label immediately recognizable as "one of these" rather than needing its own naming convention invented from scratch.

### Extensibility (edge case — unknown future tool type)

A hypothetical 7th (or Nth) tool type must slot in without restructuring the IA:

- It becomes one new shelf card, positioned alphabetically by its canonical name — no new zone, no new organization scheme, no re-categorization of the existing six.
- It uses the same data-driven card mechanism as every other tool (icon, label, route) — a mechanism-level guarantee that Phase 5 (design system) will formalize as a single reusable organism, not something this phase can fully lock, but the IA-level commitment is made here: adding a tool type is a data entry, not a redesign.
- It starts **unpinned** by default. The user opts it into quick-starts manually if it becomes frequent enough to earn that placement — so the quick-start curation logic (a small, deliberately capped, user-chosen set) never needs to change either, regardless of how many tools eventually exist on the shelf.
- The hub-and-spoke *shape* is unaffected: one hub, one more spoke. Nothing about the navigation model (global nav = the hub; local nav = inside each tool) changes with tool count.

### Zero-data tool (edge case — first-ever launch of a tool)

A tool with no data yet (the very first time either user opens it) keeps its normal shelf position and stays fully navigable — it is never hidden, greyed out, or demoted for lack of content. Disappearing (or looking disabled) on first use would break the mental model the hub-and-spoke structure depends on: that all six (or seven) tools are always present and equally reachable, whether or not they've been used yet. This is stated here as an IA-level rule (presence is not contingent on data); the actual empty-state *visual* treatment inside each tool is Phase 2's page-spec concern, not this phase's.

### Validation note

No card sort or tree test has been run (Rosenfeld/Morville's recommended validation before locking labels/structure) — there is no user pool beyond the two people who already co-designed this brief with full knowledge of what each tool does, so a formal card-sort/tree-test exercise would be testing the researchers on their own taxonomy. Flagged as **NOT VALIDATED** per the JOURNEY.md template's own field, consistent with the Journey section's transparency about research basis above, rather than silently assumed.

---

## Flows

**Notation:** Steps use the universal flow notation from `journey-stack.md` (circle = entry/exit, rectangle = action/screen, diamond = decision, arrow = direction), rendered as ordered steps with explicit "Decision" markers rather than a drawn diagram — matching the JOURNEY.md template's own "Decision → yes: path A / no: path B" convention. Six flows below are **task flows** (linear — one per tool's single named linear job, per the design plan's scope split); one (Expenses) is the plan's one genuinely **branching user flow**; one (Launcher) is the app's one customization interaction, named as its own task flow per the plan's edge cases, with a single bounded decision inside it.

### Log a habit (Habits)
**Type:** Task flow (linear)
**Entry:** Launcher quick-start pin or shelf card → Habits page
**Goal:** Mark today complete for a habit and see the streak update.
**Steps:**
1. Land on Habits page; the most-recently-logged habit (or the sole habit, if only one exists) is selected by default.
2. Tap the "log today" control for the active habit — **primary CTA** (Fitts's law, Fitts 1954: large, full-width control placed in the thumb-reachable lower half of the viewport, since this is the single highest-frequency action in the app, per the Job section's explicit "two taps" requirement).
3. The heatmap's today-cell and the streak counter update in place — no page transition, no confirmation dialog (an intermediate confirm step would violate the Job section's "two taps" constraint).
**Error states:** The log-today action fails to save (network/write error) — inline error at the control itself; today's cell stays in its pre-tap state so no false success is shown; retry is the same tap, not a separate recovery flow.
**Success state:** Today's cell fills in; streak counter increments; no further navigation is required to confirm.

### Add a grocery item (Groceries)
**Type:** Task flow (linear)
**Entry:** Launcher quick-start pin → Groceries page
**Goal:** Add one item to the running list in the fewest possible steps, usable one-handed mid-week.
**Steps:**
1. Land on Groceries page; the quick-add field is reachable without a prior tap (the Job section's anxiety force names "slow to add" as the thing that kills adoption).
2. Type the item name; tap "Add" — **primary CTA** (Fitts's law: the quick-add control is a persistent, large, bottom-fixed input+button pair, always in the same thumb-reachable position regardless of how long the list has grown).
3. The item appears in the unchecked list immediately.
**Error states:** The add action fails to sync — the item stays visible in the local list (optimistic UI) with an inline sync-pending/error marker; it is never silently dropped, and retry is automatic or a single re-tap.
**Success state:** New item visible in the list, unchecked, ready to be checked off later in-store.

### Log a movie or show (Movies & TV)
**Type:** Task flow (linear)
**Entry:** Launcher shelf card → Movies & TV page
**Goal:** Record a watched title with a rating and short note.
**Steps:**
1. Land on Movies & TV page; watch history shown, newest first.
2. Tap "Log a watch" — **primary CTA** (Fitts's law: a persistent, large, bottom-reachable button so logging never requires scrolling back to the top of a growing history).
3. Enter title, rating, short note (poster art auto-attached where available, kept in original color per the plan's imagery constraint).
4. Save.
**Error states:** Save fails — the entry is preserved on-screen for retry, not discarded; a failed poster-art lookup falls back to a plain framed placeholder rather than blocking the log itself.
**Success state:** New entry appears at the top of the watch history with poster, rating, and note visible.

### Add a food review (Food Reviews)
**Type:** Task flow (linear)
**Entry:** Launcher shelf card, shortly after a meal out → Food Reviews page
**Goal:** Capture a rating and note before the moment (and motivation) passes.
**Steps:**
1. Land on Food Reviews page; review list shown, newest first.
2. Tap "Add a review" — **primary CTA** (Fitts's law: large, single-thumb-reachable button; the Job section's anxiety force — "if logging takes more than a moment, it never happens" — makes reach-and-tap speed a hard requirement here, not a nice-to-have).
3. Enter restaurant name, rating, short note, optional photo.
4. Save.
**Error states:** Save fails — the entry is preserved for retry, given the narrow post-meal window this flow realistically happens in; a skipped or failed photo attach never blocks saving the rating+note.
**Success state:** New review appears at the top of the list.

### Add a recipe (Recipes)
**Type:** Task flow (linear)
**Entry:** Launcher shelf card → Recipes page
**Goal:** Save a recipe once, in the user's own words, without it feeling like transcription homework.
**Steps:**
1. Land on Recipes page; recipe library shown.
2. Tap "Add a recipe" — **primary CTA** (Fitts's law: large, bottom-fixed action on the entry form; the Job section's anxiety force — transcription effort deferring the save indefinitely — makes the save action the easiest, most reachable thing on the screen, not a buried final step).
3. Enter title, ingredients, steps (freeform, no forced structured-field minimum, per "in my own words" from the Job section).
4. Save.
**Error states:** Save fails mid-entry — draft content (title/ingredients/steps typed so far) is preserved, never wiped, so a failed save doesn't compound the transcription-effort anxiety into a lost-work anxiety.
**Success state:** Recipe appears in the library, reachable for retrieval while cooking.

### Split an expense (Expenses)
**Type:** User flow (branching — the one genuinely branching flow this phase specifies, per the plan's scope)
**Entry:** Launcher quick-start pin, right after a shared purchase → Expenses page
**Goal:** Turn a photographed bill into a confirmed, saved split without manual math or an awkward money conversation.
**Steps:**
1. Tap "Add expense" — **primary CTA** (Fitts's law: large, bottom-fixed action on the Expenses page, since this flow is triggered in-the-moment right after a purchase and needs to be reachable without hunting).
2. Capture bill photo.
3. AI parses the photo → draft line-items + split (loading/status state shown throughout — see page spec below).
4. **Decision — did the parse succeed?** (Hick's law, Hick–Hyman 1952: this failure branch is scoped to exactly two recovery options, never a longer troubleshooting menu — per the plan's edge case that this is a first-class flow, not an afterthought)
   - **No →** retry-vs-manual-entry sub-decision:
     - **Retry the photo** → back to step 2.
     - **Switch to manual entry** → structured manual line-item form (same ledger shape as the parsed result, so it is a real fallback, not a dead end) → proceed to step 6.
   - **Yes →** continue to step 5.
5. **Decision — confirm or edit?** (Hick's law: exactly two options presented — Confirm or Edit — never a per-line-item micro-decision menu at this stage)
   - **Confirm as-is** → proceed to step 6.
   - **Edit** → line-item edit screen (edits chunked into groups per Miller/Cowan ~4±1, flagged for Phase 5's form spec) → proceed to step 6.
6. Tap "Confirm & save" — **primary CTA** (Fitts's law: large, bottom-fixed action bar, physically separated from the secondary "Edit" affordance so a rushed tap right after a purchase can't misfire the wrong action).
7. Ledger/balance updates.
**Error states:** AI-parse failure (step 4, the first-class failure path above — retry vs. manual entry, never a dead-end toast); a network/save failure after confirm (step 6) — retriable, no data lost, line-items stay on-screen.
**Success state:** Line-items (parsed or manually entered) saved; ledger balance reflects the new split; each user's individual account shows their own side of the split (per the plan's individual-per-user model — no shared-access visual signal).

### Pin or unpin a quick-start (Launcher)
**Type:** Task flow (linear, with one bounded decision — the app's one customization interaction, per the plan's edge case)
**Entry:** Launcher page, from either the quick-starts row's own trailing affordance or a pin-toggle on any shelf card
**Goal:** Curate the small, fast-path quick-starts set without it growing into a second, redundant copy of the full shelf.
**Steps:**
1. Tap the pin toggle on a shelf card, or the quick-starts row's trailing "add" affordance.
2. **Decision — is the quick-starts row already at its capped size?** (Hick's law, Hick–Hyman 1952: the cap itself is the option-reduction mechanism — quick-starts stay fast to scan precisely because they never grow past a small, deliberate set, per Phase 1's IA)
   - **No (room available) →** the tool is pinned; its card appears in the quick-starts row.
   - **Yes (at cap) →** prompted to unpin one existing quick-start first (a single, explicit swap choice — not silently rejected, not an open-ended reshuffle).
3. Unpinning: tap the pin toggle on an already-pinned tool, from either the quick-starts row or the shelf — **primary-CTA-equivalent for this action** (Fitts's law: the toggle is the same size and position whether pinning or unpinning, so the action is equally easy to reverse as to perform, matching the "curation, not commitment" nature of this interaction).
4. The quick-starts row updates immediately; the shelf itself is unaffected — a tool is never removed from the shelf by unpinning it (Phase 1 IA: tools are never hidden for lack of pin status either).
**Error states:** Pin/unpin state fails to persist — the toggle reverts to its prior state with an inline indicator, rather than showing a false pinned/unpinned state that doesn't survive a reload.
**Success state:** Quick-starts row reflects the user's current curated set; the shelf remains the full, unaffected source of truth for every tool.

---

## Page specs

<!-- Format: Purpose / Entry points / Content blocks / States (empty, loading, error, success — all four always named) / Primary CTA / Exit-next, per journey-stack.md's page-spec template. Microcopy (Phase 6) and chart/table encoding (Phase 7) extend these entries further; this phase names where states and data surfaces exist, not their words or visual encoding. -->

### Launcher
**Purpose:** Get either user into the right tool in one tap, from one calm hub, without a nav bar or an icon folder to hunt through.
**Entry points:** Home-screen app icon / PWA launch (every session — the front door to everything below); back-arrow from any tool.
**Content blocks:**
1. Header — app wordmark; no persistent nav bar/drawer (the hub itself is the global nav, per Phase 1's IA).
2. Quick-starts row — user-curated, capped set of pinned tools (horizontally scrollable), with a trailing "add a pin" affordance.
3. Shelf — every tool, alphabetical by canonical name, each card showing icon + canonical label + an optional summary badge (streak count, balance, etc.) + a pin-toggle affordance.
**States:**
- **Empty:** First launch, zero quick-starts pinned — the quick-starts row shows an invitation to pin a tool rather than blank space; the shelf below is unaffected and shows all six tools normally (per Phase 1's zero-data-tool IA rule: presence is never contingent on pin status or data).
- **Loading:** Shelf cards' icon + label render immediately (static); summary badges (streak count, balance, etc.) show a skeleton placeholder while their underlying data resolves.
- **Error:** A card's summary badge fails to load — the card stays fully tappable (icon/label are static and unaffected); only the badge shows a muted inline marker, never blocking entry to the tool.
- **Success:** Quick-starts row (if populated) + full alphabetical shelf, all cards tappable with badges resolved.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (quick-starts invite — deliberately PLAIN register, not literary; design/VOICE.md's register-split note):* "Pin the tools you open daily." Trailing affordance label: "Add a pin."
- *Loading (badge skeleton; screen-reader only — visual stays a skeleton line):* "Loading [tool label]'s badge."
- *Badge error (plain register; Yifrah-lite — no fix is needed since no user action caused it, so reassurance stands in for the "fix" step):* visible glyph is a muted em dash; screen-reader text: "[Tool label]'s count is unavailable right now. The tool still opens."
- *Pin/unpin fails to persist (Yifrah: what happened + fix; no blame):* "That pin didn't save. Try again." Toggle visibly reverts to its prior state, never a false pinned/unpinned display.
- *Success (screen-reader only — no visual toast; DESIGN.md's no-shadow/no-elevation lock rules out toast chrome):* "[Tool label] pinned." / "[Tool label] unpinned."

**Primary CTA:** Tap any quick-start pin or shelf card → open that tool (Fitts's law, Fitts 1954: cards are large, full/near-full-width tap targets; the quick-starts row sits in the thumb-reachable upper-middle zone; shelf cards run full-width so the target stays maximal regardless of scroll position).
**Exit / next:** Opens the tapped tool (a spoke) — hub-and-spoke structure, no persistent nav; back-arrow inside the tool returns here.

### Habits
**Purpose:** Log today's completion for a habit in two taps and see its streak/history at a glance.
**Entry points:** Launcher quick-start pin (daily cadence) or shelf card.
**Content blocks:**
1. Header — "Habits" H1 (canonical name) + back-to-hub affordance.
2. Habit selector — tabs/list of the user's habits (e.g., Exercise, Meditation); selecting one sets the content below.
3. Streak summary — current streak, longest streak, completion-rate stat for the selected habit.
4. Heatmap — calendar-style completion grid for the selected habit (visual encoding specified in Phase 7).
5. Log-today control — the day's complete/not-complete action for the selected habit.
6. Add-a-habit entry (secondary) — create a new habit to track.
**States:**
- **Empty:** First-ever use — no habits created yet; the page invites creating the first habit instead of showing an empty selector/heatmap. (A habit that exists but has zero logged days is a lesser case of the same rule: its selector + a blank-but-present heatmap still show — presence is never hidden for lack of data, per Phase 1's IA.)
- **Loading:** Selected habit's streak/heatmap data fetching — skeleton grid + placeholder stat values.
- **Error:** Log-today action fails to save — inline error at the control itself; today's cell stays in its pre-tap state (no false success shown); retry is the same tap.
- **Success:** Habit(s) exist; selected habit's heatmap and streak reflect the latest logged state.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (literary register — display serif at `--text-lg`, framed by the signature bracket, per DESIGN.md's Expressive moments):* "Nothing kept yet. Name the first thing worth doing daily — the streak begins the moment you do." First-run CTA: "Name a habit."
- *Error — log-today fails to save (Yifrah: what → why → fix; no blame on the tap):* "Today didn't save. The connection may have dropped. Tap Log again; nothing else was lost."
- *Loading (screen-reader only; visual stays a skeleton grid):* "Loading Habits."
- *Success (screen-reader only — the cell fill + streak increment ARE the visible confirmation; no separate toast):* "Today logged. [N]-day streak."
- *Dense-data labels (plain register, Inter — `type.dense`/`type.micro`):* habit-selector tabs use the habit's own user-authored name (e.g. "Exercise," "Meditation"); stat labels are plain concrete nouns: "Current streak," "Longest streak," "Completion rate."

**Chart encoding (Phase 7, `data-viz` — see DESIGN.md §Heatmap streak ramp + legend):**
- *Chart type:* calendar heatmap — the Trend/time-series relationship (chart-selection decision table); position encodes the calendar's own two temporal axes (day-of-week, week), so color is the one remaining channel for a third dimension (Munzner's marks-and-channels framework).
- *Encoding — exactly one preattentive attribute:* color luminance, on a sequential single-hue ramp built from the accent hue already locked in DESIGN.md. It encodes **streak depth** (how many consecutive days precede and include this one), not raw completion — completion itself stays a separate, already-redundant binary signal (fill-family presence + Phase 5's in-cell mark).
- *Levels and cap (the edge case's fix):* 1–2 days, 3–6 days, 7–13 days, and a cap at 14+ days — a disclosed truncation (a legend states the cap plainly), not an unbounded scale. A legend renders once per heatmap: "Less" → four swatches → "More, capped at 14+ days."
- *Redundant non-color cue:* every cell carries a permanent, always-on accessible name (date + complete/not-complete + streak-day count) independent of interaction; on tap/press, the same information surfaces visibly as an inline caption near the module header for sighted users — never color alone.
- *Colorblind-safety:* the ramp's order is verified to survive simulated protanopia and deuteranopia in both light and dark mode (`.design-foundations/build/phase7-dataviz-check.mjs`) — a secondary check on top of the redundant cue above, not a substitute for it.
- *No chart lies:* no axis exists to truncate (calendar position is categorical, not a value axis); no area/icon scaling; the cap is disclosed via the legend rather than hidden.

**Primary CTA:** "Log today" (Yifrah/Nielsen #2 — names the action, not "Submit"/"Done") for the active habit (Fitts's law, Fitts 1954: the single highest-frequency action in the app — per the Job section's explicit "two taps" requirement — gets a large, full-width control in the thumb-reachable lower half of the viewport).
**Exit / next:** Back-arrow to the launcher hub; no cross-tool navigation.

### Movies & TV
**Purpose:** Log a watched movie or show with a rating and short note so past watches are easy to recall.
**Entry points:** Launcher shelf card (occasional quick-start pin).
**Content blocks:**
1. Header — "Movies & TV" H1 + back-to-hub affordance.
2. Add-a-watch entry control.
3. Watch history list — poster (original color, consistent frame), title, rating, short note, date; newest first.
4. In-tool search/filter over one's own history (a page-level content block — Phase 1's IA explicitly places in-tool search here, outside top-level IA).
**States:**
- **Empty:** First-ever use — zero watches logged yet; the page invites the first log rather than showing a blank history list.
- **Loading:** Watch history fetching — skeleton poster-card placeholders.
- **Error:** A save/log action fails — inline error on the add-a-watch form; entry preserved for retry, not discarded.
- **Success:** Watch history populated, newest entries at the top.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (literary register — display serif at `--text-lg`, bracket-framed):* "Not yet remembered. Log the first one — the poster keeps the rest."
- *Error — save/log fails (Yifrah: what → why → fix; entry preserved, no blame):* "That watch didn't save. Check your connection and try again. Your entry is still here."
- *Loading (screen-reader only; visual stays skeleton poster cards):* "Loading watch history."
- *Success (screen-reader only):* "Saved. [Title] added to your history."
- *Dense-data labels (plain register, Inter):* form fields "Title," "Rating," "Note (optional)"; list rows show title + rating (numeric fallback for a11y, e.g. "4 of 5") + date; failed poster lookup falls back to the plain inline label "No poster" — never blocks the log itself.

**Primary CTA:** "Log a watch" (Fitts's law, Fitts 1954: a persistent, large, bottom-reachable button so adding a new watch never requires scrolling to the top of a growing history).
**Exit / next:** Back-arrow to the launcher hub.

### Expenses
**Purpose:** Turn a photographed bill into a confirmed, saved split without manual math or an awkward money conversation.
**Entry points:** Launcher quick-start pin, typically right after a shared purchase.
**Content blocks:**
1. Header — "Expenses" H1 + back-to-hub affordance.
2. Add-expense entry (camera/photo capture control).
3. AI-parse status/progress indicator (shown during parsing).
4. Confirm-or-edit line-item review (ledger-style — one of the four dense-data families named in the plan's Phase 5 scope).
5. Ledger/balance history — settled + outstanding balance indicator (visual/color encoding specified in Phase 7).
**States:**
- **Empty:** First-ever use — zero expenses logged yet; the page invites the first bill photo rather than showing a blank ledger.
- **Loading:** AI-parse in progress after photo capture — an explicit progress/status indicator (Nielsen #1, visibility of system status — flagged for Phase 5's component spec), not a silent wait.
- **Error:** AI parse fails — the first-class failure flow (see "Split an expense" flow above): retry-vs-manual-entry, never a dead-end generic error toast.
- **Success:** Parsed (or manually entered) line-items confirmed and saved; ledger/balance updated.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`; this page carries the plan's single highest-stakes microcopy moment):**
- *Empty (literary register — display serif at `--text-lg`, bracket-framed):* "No bill has passed through here yet. Photograph the next one — the math can be its problem, not yours."
- *Loading — AI-parse stages (plain register, present-progressive, real-world terms per Nielsen #2, not OCR jargon):* "Capture" → "Reading the photo…" → "Itemizing…". Cancel label: "Cancel." Standing secondary path: "Enter items manually" (always present, not a failure-only concession).
- *Error — AI-parse failure, the highest-stakes moment (Yifrah what→why→fix, zero blame toward the user's photo or the AI; corrects the Phase 5 mock's provisional "We couldn't read this photo..." line, which used the named "we"-centers-the-company anti-pattern — see `design/VOICE.md`'s worked example):* "The bill didn't come through clearly enough to read. Low light or a tilted photo can do that. Retry the photo, or enter the items yourself: either way they land in the same ledger." Buttons: **Retry photo** (primary) / **Enter items manually** (secondary) — exactly two options (Hick's law).
- *Error — post-confirm save fails (Yifrah: what happened + what's safe + fix):* "That save didn't go through. Your line items are safe — try Confirm & save again."
- *Warning (non-blocking) — reconciliation mismatch (Exact voice attribute: both real figures stated, never "there's a mismatch"):* "Entered $21.90 · the bill reads $25.90. Tax or tip may explain the gap — you can still save."
- *Success (screen-reader only):* "Split saved. [Name]'s share: $[amount]."
- *Ledger balance wording (Exact attribute; the standing redundant-cue rule — words carry the sign, never color alone):* "You owe [Name] $18.50" / "[Name] owes you $12.00" / "All settled" (the zero-balance case gets its own truthful neutral wording, not a default to either hue — see Chart encoding below for the visual layer).
- *Dense-data labels (plain register, Inter):* ledger row = description + date/payer meta + tabular-numeral amount; form field labels "Item," "Amount," "Tax," "Tip"; split-choice labels "Split evenly, two ways" / "By item."

**Chart encoding (Phase 7, `data-viz` — see DESIGN.md §Ledger balance indicator):**
- *Chart type:* a position-encoded diverging indicator — the Deviation-from-baseline relationship (chart-selection decision table), baseline = a true zero ("nobody owes anybody"). A marker's position along a shared zero-anchored hairline track, not a filled bar — position is the most accurate channel (Cleveland & McGill) and needs less ink than a bar (Tufte).
- *Primary cue (unchanged from the microcopy above):* the explicit "you owe" / "you're owed" / "all settled" text + sign is primary; the marker below is secondary and `aria-hidden` — never the sole carrier of the sign.
- *Color choice (non-blue, non-brown, fading to neutral at zero):* "you're owed" uses the app's own accent ink (the same ink already used for done-stage markers/progress fill elsewhere); "you owe" uses the warning/amber ink, not error/red — reusing red here would reconstruct the exact green/red pairing Phase 4's standing rule flags, and would overstate the tone (owing a normal split is not an error). "All settled" rests exactly on the zero tick in a genuinely neutral ink — its own true state, not a faded version of either extreme.
- *Multiple counterparties:* one marker-row per person when more than one exists, sharing the same zero position and the same data-driven scale (sized to the largest balance shown, per Few's scale-consistency rule) — never an arbitrary fixed maximum. A single counterparty's marker sits at a fixed directional offset (not proportional), since there's nothing to scale against yet.
- *Colorblind-safety:* all three states verified pairwise distinguishable under simulated protanopia and deuteranopia, both modes (`.design-foundations/build/phase7-dataviz-check.mjs`) — a secondary check on top of the words-first primary cue.
- *No chart lies:* the scale starts at a true zero and is never truncated; no dual axis; no area/icon proportional encoding — length/position only.

**Primary CTA:** "Add expense" (entry point) → "Confirm & save" on the parse-review screen (Fitts's law, Fitts 1954: large, bottom-fixed action bar, physically separated from the secondary "Edit" affordance so a rushed tap can't misfire the wrong action).
**Exit / next:** Back-arrow to the launcher hub after save, or continue reviewing the ledger in place.

### Food Reviews
**Purpose:** Capture a rating and short note right after eating, in the household's own private voice, before the moment passes.
**Entry points:** Launcher shelf card, shortly after a meal out.
**Content blocks:**
1. Header — "Food Reviews" H1 + back-to-hub affordance.
2. Add-a-review entry (rating + short note + optional photo capture).
3. Review list — restaurant name, rating, short note, optional photo (original color, consistent frame); newest first.
**States:**
- **Empty:** First-ever use — zero reviews yet; the page invites the first review rather than showing a blank list.
- **Loading:** Review list fetching — skeleton card placeholders.
- **Error:** Save fails — inline error on the add-review form; entry preserved for retry (protects the narrow post-meal window named in the Job section's anxiety force).
- **Success:** New review saved and visible at the top of the list.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (literary register — display serif at `--text-lg`, bracket-framed):* "No table remembered yet. Jot the next one down before the taste fades."
- *Error — save fails (Yifrah: what → why → fix; protects the narrow post-meal window named in the Job section's anxiety force):* "That review didn't save. Check your connection and try again. Nothing you wrote is lost."
- *Loading (screen-reader only; visual stays skeleton cards):* "Loading reviews."
- *Success (screen-reader only):* "Saved. [Restaurant] added to your list."
- *Dense-data labels (plain register, Inter):* form fields "Restaurant name," "Rating," "Note," "Photo (optional)"; list rows show name + rating + note snippet + date.

**Primary CTA:** "Add a review" (Fitts's law, Fitts 1954: large, single-thumb-reachable button; the Job section's anxiety force — "if logging takes more than a moment, it never happens" — makes reach-and-tap speed a hard requirement, not a nice-to-have).
**Exit / next:** Back-arrow to the launcher hub.

### Recipes
**Purpose:** Save a recipe once, in the user's own words, and retrieve it easily while cooking.
**Entry points:** Launcher shelf card, mid-cook or while meal-planning.
**Content blocks:**
1. Header — "Recipes" H1 + back-to-hub affordance.
2. Add-a-recipe entry (title, ingredients, steps).
3. Recipe library — title, optional photo, quick preview; browsable/searchable.
4. Recipe detail view — full ingredients + steps, optimized for reference while actively cooking.
**States:**
- **Empty:** First-ever use — zero recipes saved yet; the page invites the first save rather than showing a blank library.
- **Loading:** Library/detail view fetching — skeleton placeholders.
- **Error:** Save fails mid-entry — draft content (title/ingredients/steps typed so far) is preserved, never wiped (protects against compounding the Job section's transcription-effort anxiety into a lost-work anxiety).
- **Success:** Recipe saved and reachable from the library.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (literary register — display serif at `--text-lg`, bracket-framed):* "The book is still blank. Write in the first one worth keeping."
- *Error — save fails mid-entry (Yifrah: what → why → fix; prevents transcription-effort anxiety compounding into lost-work anxiety, per the Job section):* "This recipe didn't save. Check your connection and try again. Everything you've written is still here."
- *Loading (screen-reader only; visual stays skeleton placeholders):* "Loading your recipes."
- *Success (screen-reader only):* "Saved. [Title] added to your book."
- *Dense-data labels (plain register, Inter):* form fields "Title," "Ingredients," "Steps" — freeform, no imposed structured-field copy, per "in my own words" from the Job section.

**Primary CTA:** "Add a recipe" (library entry point) → "Save recipe" (entry-form primary CTA; Fitts's law, Fitts 1954: large, bottom-fixed action on the entry form — the anxiety force here is effort/abandonment risk, so the save action must be the easiest, most reachable thing on the screen).
**Exit / next:** Back-arrow to the launcher hub, or tap into a saved recipe's detail view mid-cook.

### Groceries
**Purpose:** Maintain a running shared checklist that's fast to add to all week and fast to check off in the store.
**Entry points:** Launcher quick-start pin (continuous, added-to-all-week); opened fully at the store.
**Content blocks:**
1. Header — "Groceries" H1 + back-to-hub affordance.
2. Quick-add control — fast single-field add-to-list entry.
3. Checklist — running list, checked/unchecked rows (one of the four dense-data families named in the plan's Phase 5 scope).
**States:**
- **Empty:** First-ever use — zero items on the list yet; the page invites the first add rather than showing a blank checklist.
- **Loading:** List fetching — skeleton row placeholders.
- **Error:** Add/check action fails to sync — the item stays visible locally (optimistic UI) with an inline sync-pending marker, so a mid-aisle failure never silently loses the item.
- **Success:** List reflects the latest additions/checks in real time.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (literary register — display serif at `--text-lg`, bracket-framed):* "The list is empty, for now. Add what's running low before you forget."
- *Error — add/check fails to sync (Yifrah: what happened + reassurance + fix; no "we," no "Oops," item never appears lost):* "This item didn't sync yet. It's still on your list. Tap to try again."
- *Loading (screen-reader only; visual stays skeleton rows):* "Loading your list."
- *Success (screen-reader only):* "[Item] added." / "[Item] checked off."
- *Dense-data labels (plain register, Inter):* quick-add field carries a persistent visible label "Add an item" (never placeholder-only, WCAG 1.3.5); list rows are the item's own plain user-authored name.

**Primary CTA:** Quick-add control, button labeled "Add" (the one deliberate exception to full verb+object CTA copy, licensed by `microcopy-patterns.md`'s own carve-out — "acceptable only when the next step is already visible in context," true here since the button sits directly beside its own input field) (Fitts's law, Fitts 1954: persistent, large, single-field input + add button, always in the same reachable position — the Job section's anxiety force names "slow to add mid-week" as the adoption killer, so the add action must be the fastest, most reachable thing on the page).
**Exit / next:** Back-arrow to the launcher hub.

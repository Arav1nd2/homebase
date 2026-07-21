# JOURNEY.md

<!-- The structural and temporal design spec for HomeBase. Pairs with DESIGN.md (visual tokens — locked in a later phase). -->

**Status:** Job + Journey + IA + Flows + Page specs complete (Phase 1-2); Phase 6 (Words, `content-design`) extends every page spec below with actual microcopy — see each entry's **Microcopy** block. Phase 7 (Data surfaces, `data-viz`) extends the Habits and Expenses entries with a **Chart encoding** block each — the habit heatmap's streak ramp + legend and the expense ledger's diverging balance indicator. This closes the last section named in the design plan: all 7 page specs are now complete through Phase 7. **UPI addition (2026-07-20):** Phase 1 of a new design plan (`.design-foundations/plans/2026-07-20-upi-shell-nav.md`, doctrine `journey`) adds UPI as this document's 8th Job entry, amends §IA's Navigation model with UPI's 3-level exception — the first tool to exceed the previously-2-level-only hub-and-spoke IA — adds one new branching Flow, and adds 4 Page specs entries (main flow, history, new, tags). UPI's microcopy and chart/redundant-cue encoding are later phases of that same plan, not this one.
**Doctrine:** `journey` (references/journey/journey.md, journey-stack.md, journey-caveats.md); Phase 6 additions doctrine: `content-design` (references/content-design/content-design.md) — see `design/VOICE.md` for the voice/tone attribute spec and register-split rule the Microcopy blocks below apply; Phase 7 additions doctrine: `data-viz` (skills/data-viz/SKILL.md, references/chart-selection.md, references/viz-principles.md) — see each Chart encoding block and `.design-foundations/build/2026-07-17-homebase-phase-7-discovery.md` for the full citation trail.

---

## Job

**JTBD school used for all 8 stories: Moesta's Switch interview** (four forces — push/pull/anxiety/habit), per the project's design plan and `journey`'s own recommendation as the most immediately actionable school for a product team. No other school's vocabulary (Christensen's progress/circumstance, Ulwick's ODI, Klement's job-story-only format) is mixed in, per the school-mixing warning in `journey-caveats.md`. (UPI, added 2026-07-20 per the UPI + Shell Navigation/Chrome design plan, is the 8th — same school, same self-authored research basis, below.)

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

### UPI

> When I pay someone via UPI in Google Pay or PhonePe and the app has no idea what the payment was for, I want that payment tagged the moment I make it, so I can see later where my money actually went without redoing the bookkeeping from memory or a bank statement.

- **Functional job:** scan a UPI QR code, confirm an amount, tag the payment, and complete it through my own UPI app — with the tag attached the instant the payment happens, not reconstructed afterward.
- **Emotional job:** feel in control of where money goes, not anxious about a payment silently vanishing into an untagged transaction history.
- **Social job:** n/a — this is a private, individual record (FR-018), same as Habits.

| Force | UPI |
|---|---|
| Push | Google Pay/PhonePe complete the payment but forget it existed the moment it's done — no native UPI app supports tagging, so "what was that ₹450 for" becomes a memory problem days later. |
| Pull | Tagging happens inside the same motion as paying — scan, confirm, tag, pay — rather than a separate reconciliation chore done later from a bank statement. |
| Anxiety | Trusting a camera-first flow and a redirect to a separate UPI app with a real payment in progress; not knowing for certain whether a payment "landed" once control leaves this tool (the confirm-prompt/unconfirmed-status design exists specifically to answer this). |
| Habit | Reflex to just pay directly in Google Pay/PhonePe — it's already the fastest path to *paying*; tagging is the additional step this tool has to make cheap enough to survive that reflex. |

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

### Navigation model — UPI's 3-level exception (amendment, 2026-07-20)

Every rule above governs the hub's own navigation and describes a strict **2-level IA** that has held for all six original tools: hub → spoke, full stop — "no spoke-to-spoke navigation... moving from Habits to Groceries means returning to the hub" (§IA above). **UPI is the first tool to exceed that depth**, and this amendment records the exception explicitly, alongside the existing rule, rather than silently redefining it.

**The three levels:**

| Level | What lives here | Reached from |
|---|---|---|
| 1 — Hub | The launcher | App entry / back-arrow from any spoke |
| 2 — UPI spoke | `app/(app)/upi-tracker/page.tsx` — the main scan → amount → tag → pay → confirm flow (one route, a client-side step machine — see the Page specs entry below) | The hub, exactly like any other spoke; still hub-and-spoke at this level, no cross-spoke nav to other tools |
| 3 — UPI's sub-pages | `/history`, `/tags`, `/new` | Only from within UPI (Level 2 and its own sub-pages) — never directly from the hub |

**Why UPI needs a 3rd level and no other tool does:** every existing tool's landing page *is* its one screen (Habits' heatmap, Groceries' checklist) — 2 levels fully describes it. UPI's landing state is structurally different: the camera opens immediately (FR-001) and occupies the whole screen, so there is no persistent in-tool surface a nav bar, tab strip, or menu could live on — the same "no persistent nav" constraint that shaped the hub's own IA recurs one level down, but now has to route to three additional destinations (History, Tags, the manual-backfill form) that the camera-first surface has no room to list directly.

**The concrete resolution (confirmed this session, not left implicit — matches the approved mock `design/mocks/upi-landing.html`):** the main flow's idle/landing state — the active-scanning screen shown immediately on entry — carries a direct, standing secondary link straight to History, sitting below the viewfinder (not a menu, not a drawer, not a nav bar). This is the fixed answer to "how do you reach history/tags/new without a persistent nav, given the camera opens immediately": **History is one tap from the landing state; Tags and New are one tap from History.** Hick's law (Hick–Hyman 1952) still governs each individual hop — the landing state surfaces exactly one link (History), not three, keeping the camera-first screen's decision load at the same one-option scale as everywhere else in this IA.

**Back-control implication (flagged for Phase 3, not resolved here):** a Level-3 page's "back" goes up to the UPI spoke (Level 2 — the Scan/landing state), not straight to the hub — a second back-tap from there reaches the hub, exactly as it always has from any spoke. This is a navigation-model fact fixed at this IA level; the shared `PageHeader` component's context-aware back-control mechanics that implement it are the later shell-chrome phase's job.

**Scope of the exception:** this 3-level structure is UPI-specific. The other six tools remain 2-level (hub → spoke) exactly as before — this is a documented exception alongside the existing rule, not a generalization of it. A future tool with no persistent in-tool surface would need to make (and document) its own version of this call; it does not inherit UPI's specific routing automatically.

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

**Notation:** Steps use the universal flow notation from `journey-stack.md` (circle = entry/exit, rectangle = action/screen, diamond = decision, arrow = direction), rendered as ordered steps with explicit "Decision" markers rather than a drawn diagram — matching the JOURNEY.md template's own "Decision → yes: path A / no: path B" convention. Six flows below are **task flows** (linear — one per tool's single named linear job, per the design plan's scope split); one (Expenses) is a genuinely **branching user flow**; one (Launcher) is the app's one customization interaction, named as its own task flow with a single bounded decision inside it. **UPI (added 2026-07-20)** is the second genuinely branching user flow, and the first with multiple first-class error branches named at the flow level (camera-denied, malformed QR, no-UPI-app) rather than one — per that phase's explicit edge-case scope.

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

### Scan, tag, and pay (UPI)
**Type:** User flow (branching — the second genuinely branching flow in this document, alongside Expenses; per the UPI phase's edge-case scope, camera-denied and malformed-QR are each first-class branches, not error afterthoughts)
**Entry:** Launcher quick-start pin or shelf card → UPI's main flow (camera opens immediately, FR-001)
**Goal:** Turn a scanned UPI QR code into a tagged, paid, status-recorded transaction, with no manual math and no separate reconciliation step to remember what a payment was for.
**Steps:**
1. Land on the main flow; camera opens immediately in QR-scan mode (FR-001) — no tap required, every time the tool is opened, not only on first use.
2. **Decision — is camera permission granted?** (FR-022; a first-class branch, not an error afterthought, per the UPI phase's explicit edge case)
   - **Denied →** inline manual payee/amount entry fallback on the same screen (never a dead end) → proceed to step 4 once payee + amount are entered.
   - **Granted →** continue to step 3.
3. **Decision — does the scanned code parse as a valid UPI QR?** (FR-002, FR-021; Hick's law, Hick–Hyman 1952 — exactly two outcomes at this branch)
   - **Malformed / not a UPI code →** inline error, retry scanning without restarting the flow (FR-021) → back to step 3.
   - **Valid →** payee VPA, payee name, and amount (if present) extracted → continue to step 4.
4. Amount step: amount shown pre-filled and editable if the QR carried one, empty and editable if not (FR-003). **Decision — is the amount positive?** (FR-004) — zero/negative/non-numeric blocks proceeding; the field stays editable, no silent failure.
5. Tag step: existing tags shown as tappable chips (FR-005); "add new tag" creates one inline without leaving the flow (FR-006); zero, one, or multiple tags may be selected (FR-007) — a tag is never required to proceed.
6. Tap "Pay" — **primary CTA** (Fitts's law, Fitts 1954: large, bottom-fixed action — this flow's single commit point). The tool constructs a standard UPI deep link (payee VPA, amount, note/reference) and redirects to the device's UPI app (FR-008); the transaction row is persisted at this instant, before the redirect fires (status: pending) — the mechanism that makes step 8 safe even if the user never returns.
   - **Decision — is a UPI app available to handle the redirect?** (FR-020) — **No →** a clear, actionable message replaces a silent/dead redirect; the pending transaction stays available for retry, not lost. **Yes →** redirect proceeds.
7. User completes (or abandons) payment inside their own UPI app, then returns to the tool (app resume / tab-visibility change).
8. **Decision — does the user answer the return-confirmation prompt?** (FR-009, FR-010)
   - **Answers success or failed →** transaction status updated accordingly.
   - **Does not answer, navigates away instead →** status resolves to "unconfirmed" — never a stuck or lost state (SC-004).
**Error states:** camera permission denied (step 2, first-class branch to manual entry, FR-022); malformed/invalid QR (step 3, first-class branch to retry, FR-021); zero/negative amount (step 4, blocks proceeding, FR-004); no UPI app installed (step 6, clear message, transaction preserved for retry, FR-020).
**Success state:** a transaction row exists with payee, amount, tag(s), timestamp, and a definite status (success/failed/unconfirmed) — never silently lost (SC-004); the user lands back at the Scan step, ready for the next transaction, with the standing link to History available (IA §Navigation model — UPI's 3-level exception, above).

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

### UPI (main flow)
<!-- Added 2026-07-20, UPI + Shell Navigation/Chrome design plan, Phase 1. Route: app/(app)/upi-tracker/page.tsx — one route, a client-side step machine with 5 named steps. This is a Level-2 page in the 3-level IA (IA §Navigation model — UPI's 3-level exception, above). -->
**Purpose:** Turn a scanned UPI QR code into a tagged, paid, status-recorded transaction in one continuous flow — camera-first, no persistent nav.
**Entry points:** Launcher quick-start pin or shelf card. Camera opens immediately on arrival (FR-001), every time the tool is opened, not only on first use.
**Content blocks (the 5 named steps of the client-side step machine — one page, not 5 routes):**
1. **Scan** — camera viewfinder in QR-scan mode with a scan reticle overlay (per the approved mock, `design/mocks/upi-landing.html`); a standing secondary link to History (the IA amendment's fixed answer to "how do you reach history without a nav") and a tertiary "Can't scan? Enter manually" fallback.
2. **Amount** — extracted (or empty) amount field, editable, pre-filled from the QR when present (FR-003).
3. **Tag** — existing tags as tappable chips + inline "add new tag" (FR-005, FR-006); zero, one, or multiple tags selectable (FR-007).
4. **Pay** — "Pay" primary CTA; constructs the UPI deep link and redirects to the device's UPI app (FR-008).
5. **Confirm** — shown on return to the tool (app resume / tab-visibility change); prompts success/failed, defaulting to "unconfirmed" if unanswered (FR-009, FR-010).

**States (step-scoped — this page's states track the step machine, not one page-global set; every step still names all four explicitly, per this phase's format constraint):**

| Step | Empty | Loading | Error | Success |
|---|---|---|---|---|
| Scan | n/a — the viewfinder is the step's default content, never blank | Camera permission-pending (before the browser grants/denies) shows a neutral pending state, not a blank screen | **Camera denied** (FR-022): inline manual payee/amount fallback, never a dead end. **Malformed/invalid QR** (FR-021): inline error, retry without restarting the flow | Valid UPI QR decoded → payee VPA, name, amount extracted; advances to Amount |
| Amount | n/a — always pre-filled or empty-but-present, never absent | n/a — local state only, no fetch | Zero/negative/non-numeric amount (FR-004) blocks proceeding; inline validation message; field stays editable | Positive amount confirmed → advances to Tag |
| Tag | Signed-in user has zero existing tags yet → chip row shows only the "add new tag" affordance, still fully usable (no dead end on a first-ever use) | Existing tags fetching → skeleton chip placeholders | Tag creation fails to save → inline error at the "add new tag" control; entry preserved for retry | Zero, one, or more tags selected/created → advances to Pay |
| Pay | n/a | Deep-link construction + redirect handoff — brief, no long-running fetch | No UPI app installed (FR-020) → clear, actionable message; transaction preserved at its pre-redirect (pending) state for retry, never silent | Redirect proceeds; transaction persisted (status: pending) before the redirect fires (SC-004) → advances to Confirm on return |
| Confirm | n/a | n/a — the prompt is instant on return (Page Visibility signal) | Status update fails to save → inline error; retry is the same tap; no data lost | User answers success/failed → status saved. No answer + navigates away → status resolves to "unconfirmed" (FR-010), never a stuck state |

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (first-ever-use, Scan step before any payment scanned — literary register at `--text-lg`, bracket-framed):* "No transaction yet. Scan a UPI code or enter one by hand — it takes just a moment."
- *Error — camera denied (FR-022; Yifrah: what → why → fix; routes to manual entry as the real solution, not an apology):* "Camera access is blocked. Your device requires permission to use the camera. Grant it to scan, or enter the payee and amount below."
- *Error — malformed/invalid QR (FR-021; Yifrah what→why→fix, zero blame toward the code or user's photo quality — matches the Expenses AI-parse precedent, `VOICE.md` §Worked example):* "The code didn't scan as a UPI QR. It might be a different kind of code, or the photo was unclear or tilted. Try scanning again, or enter the payee and amount manually."
- *Error — no UPI app installed (FR-020; Yifrah what→why→fix; plainly names the cause, offers a live path forward):* "No UPI app was found. Your device doesn't have Google Pay, PhonePe, or another UPI app installed. Install one and try again, or enter this transaction manually."
- *Loading — camera permission-pending (screen-reader only; visual stays neutral pending state):* "Requesting camera access."
- *Loading — tags fetching (screen-reader only; visual stays skeleton chips):* "Loading your tags."
- *Success (screen-reader only):* "Scanned. [Payee name] · [amount] detected." / "[Tag] created." / "[Tag] selected." / "Redirecting to your UPI app." / "Payment recorded: [status]."
- *Dense-data labels (plain register, Inter — `type.dense`/`type.body`):* form field "Amount" (pre-filled or empty, as appropriate); tag-chip section is "Tag this payment (optional)"; "Pay" CTA button on step 4; "Confirm payment" on step 5 with radio options "Success" and "Failed"; secondary links "Enter manually" (Scan step) and "History" (standing link from Scan step).

**Primary CTA:** Step-scoped, not one page-level CTA (Fitts's law, Fitts 1954: each step's own dominant action is the largest target for that step) — "Pay" (step 4) is the flow's single commit point and its highest-stakes CTA.
**Exit / next:** After Confirm resolves (any outcome), the user remains at the Scan step, ready for the next transaction (matching FR-001's "every time," not just first use). The standing secondary link to History (from Scan) is the flow's other exit — see the Flows entry "Scan, tag, and pay (UPI)" above for the full branching path.

### UPI — History
<!-- Added 2026-07-20, UPI + Shell Navigation/Chrome design plan, Phase 1. Route: app/(app)/upi-tracker/history/page.tsx. A Level-3 page in the 3-level IA — reached only from within UPI, never directly from the hub. -->
**Purpose:** List, filter/group by tag/status/date, and summarize UPI transactions — the payoff view for having tagged anything (FR-012, FR-013, FR-014).
**Entry points:** The main flow's standing secondary link from the Scan step (IA §Navigation model — UPI's 3-level exception, above); returning from `/tags` or `/new`.
**Content blocks:**
1. Filter/group row — tag / status / date (Hick's law, Hick–Hyman 1952: three bounded facets, not an open filter builder).
2. Summary — per-tag/per-period totals as plain numeric rows, not a chart (§Direction: "a kept notebook, not a productivity dashboard"); a transaction carrying multiple tags counts its full amount toward each tag's total (FR-014, no proportional splitting).
3. Transaction list — the Ledger dense-frame family extended with tag chips + a 4-value status cue (visual/token detail: a later phase of this plan); newest first; inline edit affordance per transaction (FR-015).
4. "+ Add manually" — secondary link to `/new`.
5. "Manage tags" — secondary link to `/tags` (resolved 2026-07-21: a standing secondary link alongside "+ Add manually," not folded into the filter row's Tag control — keeps that row a pure filter, no mixed actions).

**States:**
- **Empty (an IA-level answer, not just a visual one):** First-ever use — zero transactions recorded yet. Because History is reachable only from within UPI (never listed on the hub), an empty History must not read as a dead end: the filter row, the "+ Add manually" link, and the page's own back control all stay present and usable — there is nothing yet to summarize or list, so the summary and transaction-list blocks are replaced by an empty-state message, but the page itself is never orphaned. This extends Phase 1's original zero-data-tool IA rule (presence is never contingent on data) one level deeper than it has applied before.
- **Loading:** Transaction list and summary fetching — skeleton rows inside the real dense-frame chrome (the frame itself stays static, per the shared dense-frame pattern).
- **Error:** A filter/group action or an inline edit fails to save — inline error at the affected row/control; the list keeps its last-known-good state, never blanked.
- **Success:** Filtered/grouped transaction list populated; summary totals reflect the current filter; newest transactions first.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (first-ever-use, History page before any transactions — literary register at `--text-lg`, bracket-framed):* "Nothing tracked yet. Every payment you tag builds this record."
- *Error — filter/edit fails to save (Yifrah: what → why → fix; no data lost, state reverts, reassurance):* "That change didn't save. The list stayed as it was. Try again."
- *Loading (screen-reader only; visual stays skeleton rows inside the dense-frame chrome):* "Loading your transaction history."
- *Success (screen-reader only):* "History updated."
- *Dense-data labels (plain register, Inter):* filter/group row labels "By tag" / "By status" / "By date"; summary-row label "Subtotal" (plain concrete noun, followed by the tag or period name); transaction-row anatomy (inherited from Ledger, extended with tag chips + status cue — see Phase 5 spec for the full row design): payee name + amount + tag chips + status cue + date/time + inline edit affordance; edit row affordance label "Edit" (the control itself, not a separate row, per the Phase 5 structure); "+ Add manually" secondary link label.

**Primary CTA:** None page-dominant — filter/group controls and "+ Add manually" are secondary affordances, matching Expenses' own non-owning history/ledger pattern.
**Exit / next:** Back control to the UPI spoke (the Scan/landing step) — this page's "up" level in the 3-level IA, not straight to the hub (IA §Navigation model — UPI's 3-level exception, above; the shared PageHeader's context-aware back-control mechanics that implement this are a later shell-chrome phase's job).

### UPI — Add manually
<!-- Added 2026-07-20, UPI + Shell Navigation/Chrome design plan, Phase 1. Route: app/(app)/upi-tracker/new/page.tsx. A Level-3 page, reached only from History. -->
**Purpose:** Record a UPI payment made outside the tool — before installing it, or otherwise never scanned — with the same structure as a scanned transaction (FR-016).
**Entry points:** History's "+ Add manually" secondary link.
**Content blocks:**
1. Manual entry form — payee name (VPA optional; a backfilled payment has no live QR to source it from), amount, tag(s) (reuses the flow's Tag-step chip picker), date (any past date, not defaulted to "now" the way a scanned transaction is), status (a direct choice — success/failed/unconfirmed/pending — since there is no redirect here to infer it from).
2. Save action.

**States:**
- **Empty:** n/a as a list-emptiness case — this page is a single blank form on entry, not a list. Its "empty" is the form's own untouched starting state, distinct from an error.
- **Loading:** No data fetch on entry beyond the existing tag list — same treatment as the main flow's Tag step (skeleton chip placeholders while tags fetch).
- **Error:** Save fails — draft content (payee/amount/tag(s)/date/status entered so far) is preserved, never wiped, matching the transcription-effort-to-lost-work protection already established for Recipes' page spec.
- **Success:** Transaction created, identical in structure to a scanned one (FR-016); user returns to History, where it now appears in the list.

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Error — save fails (Yifrah: what → why → fix; protects against lost-work anxiety, matching Recipes' own pattern):* "That transaction didn't save. Check your connection and try again. Everything you've entered is still here."
- *Loading (screen-reader only; visual stays skeleton chip placeholders):* "Loading your tags."
- *Success (screen-reader only):* "Saved. Transaction added to your history."
- *Dense-data labels (plain register, Inter):* form fields "Payee name," "Amount," "Tag(s) (optional)," "Date," "Status"; status radio options "Success" / "Failed" / "Pending" / "Unconfirmed"; "Save" button.

**Primary CTA:** "Save" (Fitts's law, Fitts 1954: large, bottom-fixed action on the entry form).
**Exit / next:** Back to History on save, or via a back control to History if abandoned without saving — this page is a Level-3 sub-page of History, not its peer (IA §Navigation model — UPI's 3-level exception, above).

### UPI — Tags
<!-- Added 2026-07-20, UPI + Shell Navigation/Chrome design plan, Phase 1. Route: app/(app)/upi-tracker/tags/page.tsx. A Level-3 page, reached only from History. -->
**Purpose:** Create, rename, recolor, and delete tags; keep the tag list tidy over time (FR-017).
**Entry points:** History's "Manage tags" secondary link (resolved 2026-07-21 — a standing link alongside "+ Add manually," not folded into the filter row's Tag control), per the IA amendment's fixed chain landing → History → {Tags, New}.
**Content blocks:**
1. Tag list — each row: name, color swatch, rename/recolor/delete affordances.
2. "Add a tag" entry (secondary to the flow's own inline tag creation, FR-006 — this is the full-management surface, not the fast path).

**States:**
- **Empty:** Zero tags created yet — the page invites creating the first tag rather than showing a blank list, matching the same zero-data-tool IA rule as every other tool: the page stays reachable and usable regardless of data.
- **Loading:** Tag list fetching — skeleton row placeholders.
- **Error:** Rename/recolor/delete fails to save — the affected row reverts to its prior state with an inline error, never a false-success display (matching the Launcher pin-toggle's own revert-on-failure pattern).
- **Success:** Tag list reflects the current set. A rename/recolor is immediately visible on every transaction that already carries the tag, since the tag is a reference, not a copy (FR-017). A delete removes the tag from future selection while every historical transaction keeps its label — visibly distinct but never blank (FR-017's other half; the full visual treatment for "visibly distinct" is a later phase's job — this phase fixes only that the label must survive, never blank or error).

**Microcopy (Phase 6, `content-design` — see `design/VOICE.md`):**
- *Empty (first-ever-use, Tags page before any tags created — literary register at `--text-lg`, bracket-framed):* "No tags yet. The first one shapes how you'll track everything."
- *Error — rename/recolor/delete fails (Yifrah: what → why → fix; row reverts to prior state, no false success):* "That change didn't stick. The tag stayed as it was. Try again."
- *Loading (screen-reader only; visual stays skeleton rows):* "Loading your tags."
- *Success (screen-reader only):* "Tag added." / "Tag renamed." / "Tag recolored." / "Tag deleted."
- *Dense-data labels (plain register, Inter):* tag-row anatomy: tag name + color swatch + affordance buttons/icons; affordance labels "Rename," "Change color," "Delete"; delete confirmation dialog prompt "Delete [tag name]?" with "Delete" (primary, destructive intent) and "Cancel" (secondary); "Add a tag" form field and button label.

**Primary CTA:** "Add a tag" (Fitts's law, Fitts 1954: standard-size, single-thumb-reachable — a lower-frequency administrative action per the Job section's forces, so it does not need the flow's bottom-fixed-bar treatment).
**Exit / next:** Back to History — this page is a Level-3 sub-page of History (IA §Navigation model — UPI's 3-level exception, above).

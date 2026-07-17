# JOURNEY.md

<!-- The structural and temporal design spec for HomeBase. Pairs with DESIGN.md (visual tokens — locked in a later phase). -->

**Status:** Phase 1 of 2 complete (Job + Journey + IA). Flows and Page specs are added in Phase 2.
**Doctrine:** `journey` (references/journey/journey.md, journey-stack.md, journey-caveats.md)

---

## Job

**JTBD school used for all 7 stories: Moesta's Switch interview** (four forces — push/pull/anxiety/habit), per the project's design plan and `journey`'s own recommendation as the most immediately actionable school for a product team. No other school's vocabulary (Christensen's progress/circumstance, Ulwick's ODI, Klement's job-story-only format) is mixed in, per the school-mixing warning in `journey-caveats.md`.

**Research basis (stated explicitly, not glossed over):** HomeBase has no external user base — it is built by, and for, its own two users (per the project's CLAUDE.md and design plan). The job stories below are self-authored from firsthand knowledge of those two users' actual life-admin habits, not third-party interview transcripts. That is a legitimate JTBD basis for a "founder is the user" personal app, but it is a hypothesis, not externally validated research — flagged here rather than presented as something it isn't.

### HomeBase (the launcher/hub itself)

> When my life admin is scattered across five single-purpose apps, a notes file, and memory, I want one calm place to open that already knows which tool I need, so I can handle daily life admin without app-switching friction or forgetting where something lives.

- **Functional job:** consolidate scattered personal tracking into one entry point.
- **Emotional job:** feel unhurried and in control, not scattered or anxious about what's been forgotten.
- **Social job:** be (and be seen by a partner as) someone whose life admin is handled, not chaotic.

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

> When my partner and I are deciding what to watch and can't remember if we've already seen something or what we thought of it, I want a quick, individually-logged watch history with ratings, so I can avoid re-watching by accident and remember what was actually good.

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

> When my partner or a friend and I split a bill and don't want to do the mental math or manually itemize a receipt, I want to photograph the bill and have it parsed into a split automatically, so I can settle up without friction or an awkward money conversation.

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

> When my partner and I try a new restaurant and want to remember what was good or bad for next time, I want a quick place to jot a rating and note right after eating, so I can decide with confidence whether to go back.

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

<!-- Flows and Page specs are added in Phase 2, per the design plan (Phase 2: Flows + page specs, depends on this phase). -->

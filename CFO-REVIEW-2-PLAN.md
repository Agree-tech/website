# CFO Review, round 2 — Remediation Plan

Status: **decisions taken 18 Sep; phases 1–3 applied in the working tree, uncommitted; phase 5 (CMS) not started**
Drafted: 2026-09-18
Source: `website language changes.docx` — second CFO review of the `payload` branch site
Companion: [CFO-REVIEW-PLAN.md](CFO-REVIEW-PLAN.md) (round 1). The mechanics in its §2 and the
working rules in its §5 still apply verbatim and are not repeated here; §2 below only records
what is *different* this time.

---

## Status — 18 September 2026

**Decisions (CFO, 18 Sep):** D1 (a) headline and subtext only · D2 navigation only — Solutions → *Core capabilities*, Sales → a new *Business use cases* menu, the Implementation link → *Integrations*; no page content and no categories block (R17 dropped) · D3 yes, *Process Automation* everywhere · D4 (a) after the Cloudfarms quote · D5 cut only, no case-study lines · D6 approved · D7 approved · D8 confirmed · D9 as written · D10 reworded to *Four core capabilities. One platform.*

**Applied, verified in `npm run build:blocks` (en 815/815, da 702/702, pl 702/702, all indexed) and by screenshot:**
R2, R3, R4, R5, R6, R7, R8, R9, R10, R11 (cut only), R12 (shared `.illustrative-tag` + the three missing labels), R14 (given part), R16 (nav + footer regroup, rename), R18 (new `audience-grid` component after the quote), R19 (six-step array), R20, R21 (wording; no link yet), R22 (all Danish and Polish values written), Subscription, CPQ, Billing.
R1 done as option 2: the mark cropped out of the existing PNGs (`assets/logo-mark-{black,white}.png`) with the wordmark set in HTML on two lines; the footer keeps the full lockup.

**R13 done (18 Sep, afternoon)** — four DOM-sanitised captures from the `cloudfarmsqa` tenant, every customer name, person, product name, farm unit, account, offer and invoice number replaced in the page before capture, app rail, QA ribbon, user block and tenant name cropped out, Example Telecom A/B/C convention throughout:

| Capture | File | Placed on | Replaces |
|---|---|---|---|
| Task board — billing / offer / invoice-approval / opportunity queues, owners as team labels, deadlines | `assets/screens/atsuite-tasks.jpg` 1568×539 | Home hero | the CSS quote mock (11 `index.hero` keys removed) |
| Subscriptions tab of one account — status, billing status, quantity, recurring price | `atsuite-subscriptions.jpg` 1485×812 | Subscription hero (block switched to `page-hero-split`, new `visuals/subscription-hero.html`) | nothing — the page had no visual |
| BPMN diagram of the running offer-approval process, current step highlighted | `atsuite-workflow.jpg` 1250×920 | Process hero | the SVG flow mock (8 keys + the label removed) |
| Application-task log — workflows started from subscription events | `atsuite-events.jpg` 1511×540 | Platform → process engine panel | the CSS event/rule/action card (8 keys + the label removed) |

No dashboard or report screen exists in the app (Outlook is a Microsoft sign-in), so the Platform analytics panel keeps its labelled illustration. Each capture carries an `alt-screenshot` and a `div-shot-caption` ending in *illustrative data*, in all three locales. Build: en 794/794, da 681/681, pl 681/681; home and subscription pages byte-identical across both builds.

**Still open:** R21 privacy link (A1, the URL) · R17 dropped by D2 · phase 5 — `cd cms && npm run generate && npm run payload migrate:create`, thumbnail for the new block (`npm run thumbnails`), re-seed, `verify:export`, image, deploy — needs an explicit go.

**Two things found while applying:** the source-vs-blocks build already differed before this round (button formatting, CMS-added buttons, figure indentation — 288 lines); it is unchanged in kind and the homepage is now byte-identical across both builds. And `core.autocrlf=true` rewrites every touched file to CRLF on a stash/checkout; git normalises on commit, so the diff is unaffected, but do not byte-compare working files against `dist/` without stripping CR.

---

## 0. Summary

Round 1 was a truth problem. Round 2 is mostly a **language and positioning** problem plus a
handful of visual ones. Of the 34 discrete instructions in the document:

| Kind | Count | Mechanics |
|------|-------|-----------|
| Replace an existing string, verbatim from the review | 14 | `content/{en,da,pl}` values only. No markup. |
| Replace an existing string, wording **not** supplied | 6 | Same files, but somebody has to write the words — drafts in §3, approval needed. |
| New content that does not exist on the site yet | 4 | New block(s) + new keys + CSS + translations + a CMS migration. |
| Visual / CSS | 4 | `shell/*.head.html` + `src/*.html`, plus `shared.css` for the logo and the labels. |
| Structural (nav, categories, six-step model) | 3 | Markup + content + layout.json + migration. |
| Blocked on an asset or a fact we do not have | 3 | Logo mark, privacy-policy URL, real screenshots. |

Everything that is a pure value change can ship in a day. The rest waits on the answers in §1.

**One live risk carried over from round 1, still open:** the CMS database has *never been
re-seeded* since the round-1 commit (`546ac84`, 14 Sep). It still holds the pre-review strings.
If an editor presses **Publish site** today, the export overwrites `content/` and silently
reverts round 1. Freeze the CMS now; re-seed once at the end of round 2 (§4, phase 5).

---

## 1. Blocked — needs a decision, an answer, or an asset

### 1.1 Decisions for the CFO

| # | Decision | Options | Blocks |
|---|----------|---------|--------|
| D1 | **How far does the Sales rewrite go?** The review supplies a new H1 and subtext. But the rest of the page still *is* a CRM page: the meta title says *"Pipeline & Approvals"*, four of the six capability cards are Pipeline management / Customisable sales process / Sales activity recording / Sales playbook, the hero screenshot is the **pipeline board** captioned *"weighted value per stage"*, the megamenu blurb is *"Pipeline, playbooks, and approvals"*, and the CTA reads *"Close more deals."* Changing the headline alone will not remove the CRM impression. | (a) H1 + subtext only, as written · (b) **recommended:** also rewrite meta, blurb, CTA and the four CRM cards around *opportunity → configuration → approval → agreement → hand-off*, and swap the hero capture from the pipeline board to the quote/agreement screen | R14 |
| D2 | **What is the product-categories table for?** It reads like a navigation model (Platform / Core capabilities / Business use cases / Integrations). Two of the use cases — *finance operations*, *subscription operations* — have no page. | (a) **recommended:** a compact table block on the front page under the four module cards, *and* the Solutions megamenu regrouped into *Core capabilities* (4) and *Use cases* (Sales operations → sales.html for now) · (b) front-page block only, nav untouched except removing Sales from the module list · (c) full IA change with new use-case pages (new scope, not in this round) | R16, R17 |
| D3 | **Rename "Process Optimisation" to "Process Automation"?** The review's table calls the fourth capability *Process Automation*; the site says *Process Optimisation* in the nav, footer, module card, page eyebrow and title (9 strings ×3 locales). | Rename everywhere / keep | R16 |
| D4 | **Where does the customer-profile section go?** | (a) **recommended:** after the Cloudfarms quote, before "One system from agreement to invoice data" — proof, then fit, then how · (b) directly under the hero · (c) after the four modules | R18 |
| D5 | **Cloudfarms quote — may we cut it?** The review asks to shorten a *customer's* quote. Cutting to a sub-sentence keeps their words; the "shorter case study" lines are paraphrase. | Cut only (no paraphrase) / cut + case-study lines, cleared with Cloudfarms / cleared by the CFO alone | R11 |
| D6 | **Approve the replacement mapping for the six "AI marketing" phrases** whose new wording the review did not supply (§3, R7–R10). The review gives five *"use instead"* lines; §3 proposes where each lands. | Approve / edit | R7–R10 |
| D7 | **Approve six implementation-step descriptions.** The review supplies six titles and no bodies; the current four bodies do not map. Drafts in R19 contain delivery-method facts (parallel run, cut-over around a billing cycle) that need Kristian's yes. | Approve / edit | R19 |
| D8 | **"Compound productivity" and "every workflow ships automated"** are fragments of longer strings. Assumption taken: the review's replacement sentence replaces the *whole* heading / the *whole* second sentence, not just the quoted fragment (§3, R5 and R6 show both). | Confirm | R5, R6 |
| D9 | **About Us:** the only difference between *Current* and *Change to* is the removed full stop. Applied literally unless told otherwise. | Confirm | R20 |
| D10 | **"Four modules. One revenue engine."** becomes true once Sales is reclassified. Keep, or use the review's vocabulary: *"Four core capabilities. One platform."* | Keep / reword | R16 |

### 1.2 Questions for product / CTO (Kristian)

| # | Question | Blocks |
|---|----------|--------|
| Q1 | **More real ATSuite pictures.** Today there are three sanitised captures (pipeline, quote, receivables) on the Sales, CPQ and Billing heroes; every other visual is CSS/SVG. Shot list to capture under the approved *Example Telecom A/B/C* convention: subscription list (Subscription hero — has no visual at all today), bill run / invoice list (home hero, replacing the CSS quote mock), workflow definition (Process hero), a report or dashboard (Platform analytics), a product configuration screen (CPQ capabilities). Same DOM-sanitised method as round 1, round-1 plan §7. | R13 |
| Q2 | **Do we have the logo mark on its own** (the circled "A"), ideally SVG, and/or a **horizontal lockup**? The shipped PNG is a stacked mark-over-wordmark at 350×253; at the nav's 38px the wordmark is ~5px tall, which is why it reads as "too small". | R1 |

### 1.3 Assets and facts

| # | What | Blocks |
|---|------|--------|
| A1 | **The Privacy Policy URL.** *"AT's Privacy Policy"* is plain text today — there is **no link** and no privacy page anywhere in the repo. "Make the link more visual" needs a destination first. | R21 |
| A2 | Logo mark / lockup (Q2). Fallback: crop the mark out of the existing PNG and set the wordmark in HTML. | R1 |
| A3 | Screenshots (Q1). Fallback: nothing — the current labelled illustrations stay. | R13 |

---

## 2. What is different from round 1, mechanically

Round-1 plan §2 covers components vs `src/`, content keys vs hardcoded numbers, the CMS
overwriting `content/`, three locales, and line endings. Four things are new or now proven:

**2.1 Adding a key costs no schema change *if* the component's field is generic.**
`546ac84` added `p-finance-boundary` to three pages by touching only `content/`,
`layout.json`, the component and `src/` — nothing under `cms/`. That worked because it
landed in `feature-grid`'s generic `note` slot. `cms/scripts/generate-blocks.mjs` builds one
block type per component with *one field per slot name*: generic components (`feature-grid`,
`split-prose`, `cta-band`, `page-hero-split`) have fields called `eyebrow`, `heading`, `body`,
`note`, `cards[]`; the one-off components (`step-list`, `quote-carousel`, `contact-form`,
`innovate-forecast`) have fields named after their content keys (`h3_proof_of_concept`).
Consequence:

- a new *instance* of a generic component = new rows in `layout.json` + new keys in
  `content/` — **no migration**;
- a new slot on a one-off component, or a new component = **migration**
  (`cd cms && npm run generate && npm run payload migrate:create`, per `cms/DEPLOY.md`).

**2.2 One migration at the end covers everything.** Round 1 never ran one, and the only
migration on disk is `20260909_063858`. Whatever round 1 added that needs a column will be
picked up by the same `generate` + `migrate:create` this round needs. Do it once, in phase 5.

**2.3 `index-print` is a fourth copy of the homepage, English only.** `content/en/index-print.json`
mirrors the index keys for the print version. Every front-page value change here (R3, R4, R16)
has to be applied there too. New sections (R17, R18) are *not* added to print — it is a
leave-behind, and the layout is fixed by `shell/index-print.head.html`.

**2.4 Coverage baseline.** `npm run build:blocks` today: en 786/786, da 673/673, pl 673/673,
all indexed. Every new key must land in all three locales or `da`/`pl` drop below 100% — the
build reports it, and below 90% a locale is silently de-indexed.

---

## 3. The work

Numbered R1–R22 so they do not collide with round 1's W-items. Each names the review
instruction, every file that produces it, and the change. *Files* means the English content
file; assume `content/da` and `content/pl` for every value listed.

### Visual

---

#### R1 — Logo is too small (review: *"can you come with a suggestion"*)

**What it is now.** `src/_nav.html` renders `assets/logo-{white,black}.png` at
`.logo-img { height: 38px }` (`shared.css:2`) in a 72px nav. The PNG is a *stacked* lockup —
circled "A" over the words AGREE TECHNOLOGIES — 350×253. At 38px tall the mark is ~28px and
the wordmark ~5px: invisible. Confirmed in a 1440px screenshot. The footer uses the same file at
56px (`.site-foot .logo-img`), where the wordmark is just legible.

**Suggestion, in order of preference.**

1. **Horizontal lockup** (mark left, wordmark right) as SVG from the designer, rendered at
   44px in the nav and 40px in the footer. Cleanest; needs A2.
2. **Mark + HTML wordmark.** Crop the mark from the existing PNG (or get it as SVG), render at
   40px, and set "Agree Technologies" as text next to it in the display font, 15px, 600,
   `letter-spacing: .12em`, uppercase — matching the PNG's own wordmark style. No designer
   needed, crisp at any size, and the white/black switch (`{{logoFile}}` in `build.js:116`)
   becomes a colour change instead of a second file.
3. **Just enlarge** the stacked file to 56px and the nav to 84px. Wordmark still ~8px. Not
   recommended, listed because it is the one-line change.

**Files.** `src/_nav.html`, `shared.css` (`.logo-img`, `.site-foot .logo-img`, and
`.megamenu { top: 70px }` if the nav height changes), `assets/`. I can render all three as
screenshots for the CFO to pick from before anything is committed.

---

#### R2 — Homepage H1 line breaks (*"B2B appears on a line by itself"*)

**What it is now.** `.hero h1 { font-size: clamp(48px, 6.4vw, 84px); line-height: .98 }` in
`shell/index.head.html:110` (and the identical inline CSS in `src/index.html`), in a
`1.05fr 1fr` grid. At 1440px the headline is **seven lines**, "B2B" alone on line 2, and the
lede plus CTAs sit at the bottom edge of a 900px viewport.

**Change.** CSS only, no content:

```css
.hero-grid { grid-template-columns: 1.15fr 1fr; }
.hero h1   { font-size: clamp(40px, 4.6vw, 64px); line-height: 1.02; text-wrap: balance; }
```

Target: four lines at 1440 (*Turn complex B2B agreements / into accurate billing / and
automated operations*), lede and both CTAs above the fold at 900px, no orphan. Verify at 1440,
1280, 1024 and 390. Apply the same numbers to `shell/index-print.head.html`. The Danish and
Polish H1s are longer — check those too.

**Files.** `shell/index.head.html`, `src/index.html`, `shell/index-print.head.html`,
`src/index-print.html`.

---

#### R11 — Cloudfarms testimonial too long

**What it is now.** `index.quote.blockquote-before-atsuite-we-stru` is 86 words in
`components/quote-carousel.html`, beside two stat tiles (*4 regions*, *1 unified platform*).

**Change** (subject to D5).

- Pull-quote becomes the quote's own middle sentence, unchanged words:
  *"With ATSuite, we now have a fully automated process from lead to quote, from quote to
  contract, and all the way through to subscription and billing."*
- The two stat tiles stay — those are the "one or two key outcomes".
- The rest becomes three short case-study lines under the attribution, derived from the
  quote's own words, in a new `case-study` list on the block:
  *Challenge* — a CRM and an ERP that did not work together, too many manual processes, and
  operations across four regions that were hard to scale. *Solution* — one flow from lead to
  quote, contract, subscription and billing. *Outcome* — less complexity, fewer errors, faster
  growth.

**Mechanics.** `quote-carousel` is a one-off component with key-named fields, so the three new
strings are three new slots → migration (§2.1). Alternative that avoids the migration: put the
case-study lines in a new `feature-grid`-style instance below the quote. Uglier; only worth it
if the migration is refused.

**Files.** `content/en/index.json` (+ `index-print.json`: `print-quote` has the same
blockquote), `components/quote-carousel.html`, `components/print-quote.html`, `src/index.html`,
`src/index-print.html`, `content/layout.json`, CSS in both shells.

---

#### R12 — "Illustrative data" labels must stay clearly visible

**What it is now.** Five different treatments, all faint:

| Where | Key | Style |
|-------|-----|-------|
| Home hero mock | `hero.div-illustrative` | `.mock-note` 10.5px, white at 42% |
| Q2C board, module panels | `q2c.div-illustrative`, `modules.div-illustrative` | `.board-note` 10.5px, muted |
| Innovate panel | `innovate.div-predictive-90d-horizon` = "ILLUSTRATIVE DATA" | `.inn-vis-head .s` 11px, white at 50% — reads as a subtitle, not a disclaimer |
| Platform analytics | `analytics.div-94-predictive-accuracy` | same as above |
| CPQ approval route | `split-section-alt.div-quote-q-2046-206` | inline |
| Sales/CPQ/Billing captures | `*.div-shot-caption` "… · illustrative data" | caption |

**Missing entirely** — panels with invented figures and no label: Platform *data model*
visual ("▲ 2 custom fields — added in 4 min"), Platform *process* visual ("42 active
workflows ▲ 214 runs today"), Process hero flow mock.

**Change.** One shared `.illustrative-tag` in `shared.css` — 12px mono, uppercase, 0.12em, a
1px `currentColor` border at 45%, pill radius, white at 75% on dark / `--slate` on light — and
apply it to every row above. Add the label (existing key text, new slot) to the three
unlabelled visuals. Keep the wording as is; it is already translated.

**Files.** `shared.css`, `shell/{index,index-print,platform,process,cpq}.head.html`, the
matching `src/*.html`, `components/visuals/platform-split-section{,-process}.html`,
`components/visuals/process-hero.html`, `content/*/platform.json`, `content/*/process.json`,
`content/layout.json`. The three new slots are on `split-prose` (generic `note` exists) and
`page-hero-split` — check whether the visual include can read a slot; if not, it is a
`{{i18n:}}` key and a migration item.

---

#### R13 — More pictures from ATSuite

Blocked on Q1. Placements, in the order they earn the most:

| Page / spot | Today | Replace with |
|-------------|-------|--------------|
| Home hero (`components/home-hero.html` mock) | CSS quote mock, "Illustrative workflow" | bill run or quote screen — the site's first image should be the product |
| Subscription hero | no visual at all (`page-hero`, not `-split`) | subscription list; switch the block to `page-hero-split` + a new `visuals/subscription-hero.html` |
| Process hero | SVG flow mock | workflow definition screen |
| Platform → analytics | CSS renewals panel | a real dashboard/report |
| Homepage module panels | four CSS mini-panels | leave — too small for a capture to read |

Each capture is committed under `assets/screens/`, sanitised per round-1 §7, with a
`div-shot-caption` ending in *"· illustrative data"* and an `alt-screenshot` describing what is
on screen (round-1 pattern, `content/en/billing.json:16-17`).

---

### Headlines and copy — values only, wording supplied by the review

---

#### R3 — Front page, Innovate heading

`index.innovate.h2-unlock-your-earnings-p` — *Unlock your earnings potential in the global B2B
market.* → **Launch new commercial models without adding operational complexity.**
Files: `content/en/index.json:150`, `content/en/index-print.json:107`.

#### R4 — Front page, Innovate paragraph

`index.innovate.p-we-continuously-add-ca` — the review quotes only the tail (*"…keeps earning
its place tomorrow"*), but the replacement is a complete sentence, so the whole paragraph goes:
→ **Continuous delivery lets you introduce new pricing, billing and workflow models without
disruptive upgrade projects.** Files: `index.json:151`, `index-print.json:108`.

#### R5 — Process page (listed under "CPQ" in the review, but these strings live on Process)

- `process.split-section.h2-discover-the-process-m` — *Discover the process management
  features.* → **Automate the events and hand-offs between agreement, delivery and billing.**
  (`process.json:27`)
- `process.cta-band-dark.h2-streamline-processes-r` — *Streamline processes. Reduce waste.
  Compound productivity.* → **Reduce delays, manual work and operational exceptions.**
  (`process.json:49`). The review quotes only the last sentence; replacing only that fragment
  yields *"Streamline processes. Reduce waste. Reduce delays…"* — so the whole heading is
  replaced (D8).

#### R6 — Platform page

- `platform.page-hero-dark.h1-configure-launch-go` — *Configure. Launch. Go.* → **Configure
  complex commercial operations without rebuilding your entire stack.** (`platform.json:12`)
- `platform.process.p-atsuite-s-process-engi` (`platform.json:92`) — the review quotes the
  fragment *"every workflow ships automated"*, which ends the second sentence. Assumption (D8):
  sentence 1 stays, sentence 2 becomes the review's: *"ATSuite's process engine is a powerful
  tool for business efficiency — design, execute and optimise workflows through an intuitive
  interface. **Workflows can be configured to automate approvals, tasks, orders and customer
  updates across the revenue lifecycle.**"*

#### Subscription page

- `subscription.page-hero.h1-streamline-every-subsc` — → **Control every subscription from
  activation to renewal and billing.** (`subscription.json:12`)
- `subscription.cta-band-dark.p-an-indispensable-tool-` — → **Give commercial, operational and
  finance teams one reliable view of every subscription, change and renewal.**
  (`subscription.json:44`)

#### CPQ page

- `cpq.page-hero.p-an-automated-cpq-that` — → **Configure complex products, apply
  customer-specific pricing and route exceptions for approval — then carry the approved
  commercial terms directly into subscription and billing.** (`cpq.json:13`)
- **inquiries → enquiries.** Two occurrences, both `cpq.json`: line 13 (disappears with the
  rewrite above) and `split-section.p-speed-up-quote-generat` line 30 (*"responds to customer
  inquiries in minutes"*). No other US spelling survives the round-1 W25 pass — grepped.

#### Billing page

- `billing.split-section.h2-discover-the-billing-c` — → **Designed to handle complex B2B
  billing.** (`billing.json:21`)

---

### "AI marketing phrases" — the six the review names without a replacement (D6)

The review lists seven phrases. Two are already handled above (*Unlock your earnings potential*
→ R3, *An indispensable tool* → Subscription). *Grow your business* is the Sales H1 → R14. The
remaining four, plus the review's five *"use instead"* lines mapped to where they fit:

#### R7 — *"Elevate subscription operations and customer relationships."*

`subscription.cta-band-dark.h2-elevate-operations-fin` (`subscription.json:43`) →
**Turn signed agreements into billable subscriptions automatically.** (use-instead #3; the
paragraph under it is the review's new "ending" line, so the pair reads as one thought.)

#### R8 — *"ATSuite revolutionises the sales process."*

`cpq.split-section-alt.p-atsuite-revolutionises` (`cpq.json:44`). Proposed paragraph:
**"ATSuite automates the parts of quoting and contract generation that consume sales time, so
the team works on customers and revenue rather than paperwork."** Same section's eyebrow
*"THE TRANSFORMATIVE POWER OF CPQ"* is the same register — propose **"CPQ · WHAT CHANGES"**.

#### R9 — *"Cutting-edge cloud-based CPQ and billing solutions…"*

`platform.cta-band-dark.p-cutting-edge-cloud-bas` (`platform.json:127`) →
**Launch new pricing models without rebuilding your finance stack.** (use-instead #2.) The
Platform data-model paragraph (`platform.json`, `data-model.p-a-highly-adaptable-dat`) ends
*"Forward-thinking, future-proof, capable of meeting intricate, evolving B2B demands."* — same
family; propose cutting that sentence.

#### R10 — *"…committed to delivering a future-proven solution to customers."*

`about.split-section-alt.p-20-years-in-software` (`about.json:56`, Kristian's bio) → end the
sentence at **"…leading the ATSuite roadmap and development."**

#### Where the other three "use instead" lines land

| Use instead | Proposed home | Replaces |
|-------------|---------------|----------|
| Identify billing exceptions before the bill run | Billing CTA H2 `billing.cta-band-dark.h2-modernise-your-billing` | *Modernise your billing with ATSuite.* |
| Maintain an audit trail from price approval to invoice data | Sales CTA H2 `sales.cta-band-dark.h2-streamline-workflows-b` (with D1) | *Streamline workflows. Boost efficiency. Close more deals.* |
| Reduce manual billing controls | Home CTA H2 `index.cta-band.h2-get-started-today-and` — *"Get started today and unlock your revenue"* is the same "unlock" the review struck in R3 | *Get started today and unlock your revenue.* |

Same register, not in the review, listed so the CFO can strike them in one pass:
`process.split-section.h3-scale-your-business` *"Scale your business"*;
`sales.cta-band-dark.div-ready-to-ignite-a` *"READY TO IGNITE A TRANSFORMATION?"*;
`cpq.split-section-alt.h2-free-your-sales-team` *"Free your sales team to do what they do best"*.

---

### Sales

---

#### R14 — Sales page: stop reading as a CRM

**Given by the review:**

- `sales.page-hero.h1-grow-your-business-wit` → **Turn complex opportunities into approved,
  billable agreements.** (`sales.json:12`)
- `sales.page-hero.p-atsuite-automates-time` → **ATSuite guides sales teams from opportunity
  and product configuration to an approved agreement that can flow directly into subscription
  management, fulfilment and billing — without re-entering commercial data.** (`sales.json:13`)

**Needed for the instruction to actually work (D1, option b):**

| String | Now | Proposed |
|--------|-----|----------|
| `meta.title` / `og-title` / `twitter-title` | *Sales Automation — Pipeline & Approvals* | *Sales Operations — From Opportunity to Billable Agreement* |
| `meta.description` (+ og, twitter) | *pipeline visibility, deal playbooks…* | *Configure products, apply customer-specific pricing, route approvals and hand the agreement to subscription and billing — without re-keying.* |
| `nav.mm-solutions.div-pipeline-playbooks-and` | *Pipeline, playbooks, and approvals.* | *Opportunity to approved agreement.* |
| Hero capture `visuals/sales-hero.html` | pipeline board | the quote/agreement capture (`atsuite-quote.jpg`, already sanitised) or a new one (Q1) |
| `div-shot-caption`, `alt-screenshot` | pipeline wording | match the new capture |
| Cards 1–4 (Pipeline management, Customisable sales process, Sales activity recording, Sales playbook) | CRM features | *Opportunity and configuration* · *Customer-specific pricing* · *Approval routing* · *Agreement hand-off* — cards 5–6 (Quotes, Internal review & approval) fold into these |
| Card 6 (new) | — | *Works with your CRM* — the opportunity can start in HubSpot, Salesforce or Dynamics and enter ATSuite by API (matches the round-1 three-tier integration answer) |
| CTA `h2-streamline-workflows-b`, `div-ready-to-ignite-a` | *Close more deals* | see R7–R10 table |

The cards are a `feature-grid` array — rewriting them is values only. The capture swap is one
`src=` and two strings.

---

### Product categories, customer profile, implementation, contact

---

#### R16 — "Four modules. One revenue engine." vs a nav that has five

**What it is now.** `index.modules` lists Subscription, CPQ, Billing, Process; the Solutions
megamenu (`src/_nav.html`, `content/*/nav.json`) lists those four **plus Sales**, and the footer
lists the same five. The review: Sales is not a module, it is a use case.

**Change** (D2 option a, D3, D10):

- Megamenu regrouped: **Core capabilities** — CPQ, Subscription Management, Billing Automation,
  Process Automation; **Use cases** — Sales operations → `sales.html`. Two new group-label keys
  in `nav.json` (`nav` is a partial with `{{i18n:}}` keys → migration item). Footer *Solutions*
  column: same split.
- *Process Optimisation* → *Process Automation* in `nav.json`, `foot.json`,
  `index.modules.a-process-optimisation`, `process.json` (`div-solutions-process-opti`,
  `meta.*`), `contact.json` (`option-process-optimisatio`) — values only.
- `index.modules.h2-four-modules-one-reven` — keep, or *"Four core capabilities. One
  platform."* (D10). Also in `index-print.json:54`.

#### R17 — Product-categories table on the front page

The review's table, verbatim:

| | |
|---|---|
| Platform | ATSuite — data model / process engine |
| Core capabilities | CPQ, Subscription, Billing, Process Automation |
| Business use cases | Sales operations, finance operations, subscription operations |
| Integrations | CRM, ERP/accounting, service platforms, BI and product systems |

**Placement:** directly under the four module cards in `modules`, as a compact two-column
definition table — the four cards *are* the "core capabilities" row, the table says how they
sit in the whole. Each row's right cell can carry a link (Platform → `platform.html`,
Integrations → `platform.html#integration`, which exists).

**Mechanics.** New generic component `definition-rows` (eyebrow, heading, `rows[]` with
`term` / `definition`, each row optionally `href`) — reusable for R18's roles table, so one new
block type covers both. New section key `index.categories` with 9 strings ×3 locales.
Migration item.

#### R18 — Customer-profile section ("who this is for")

The review's content, verbatim:

*ATSuite is built for B2B companies where:* — six bullets (individual prices/discounts/terms;
recurring + usage + one-time revenue; data moving between several systems; spreadsheet
controls before every billing run; commercial changes must be traceable and approved; existing
CRM/ERP cannot model the full operational flow).

*Who benefits using ATSuite* — five rows: CFO → more reliable billing data and a stronger
audit trail; COO → fewer manual handoffs and operational exceptions; Commercial Director →
faster, more controlled quoting; Billing Manager → exceptions identified before the billing
run; IT → API-based integration without replacing the entire system landscape.

**Design.** One section, two halves on desktop: left, the six criteria as a check-list under
the "built for B2B companies where" heading; right, the five roles as `definition-rows`
(R17's component). Stacks on mobile. Placement per D4 (recommended: after the Cloudfarms quote).

**Mechanics.** Second new generic component `check-list` (eyebrow, heading, intro, `items[]`).
New section `index.audience`: 1 + 6 + 1 + 10 = 18 strings ×3 locales. CSS in
`shell/index.head.html` + `src/index.html`. `layout.json`: two new block entries. Not added to
`index-print` (§2.3). Migration item (new block type).

#### R19 — Implementation: six stages, one model

**What it is now.** The hero paragraph (`implementation.page-hero.p-implementing-a-new-cpq`)
promises six stages; `components/step-list.html` shows four, hard-coded, with four key-named
slots and four accent colours; `.imp-rail` is `repeat(4, 1fr)`
(`shell/implementation.head.html:25`). H2 says *"Four steps. One outcome."*

**Change.**

- `step-list` becomes array-based: `steps[]` with `heading` / `body`, numbered by position,
  colour from a six-entry cycle. The four old key-named fields stay in the schema unused
  (rule: never rename or delete keys; unused is free).
- `.imp-rail { grid-template-columns: repeat(6, 1fr) }` above 1100px, 3×2 to 700px, single
  column below; the connecting line is per row. `.num-circle` 68px → 56px so six fit.
- H2 → **"Six stages. One outcome."**; hero paragraph's list → *"business discovery, solution
  design, integration and migration, parallel validation, controlled go-live and managed
  operations"*.
- Titles from the review, bodies drafted here (D7):

| # | Title (review) | Draft body |
|---|----------------|------------|
| 1 | Business discovery and success criteria | We map the commercial models, agreements and billing flows you run today, and agree the success criteria the programme is measured against. |
| 2 | Solution design and configuration | Data model, pricing rules, approval routes and workflows are designed with your teams and configured in a tenant you can log in to from the first weeks. |
| 3 | Integration and data migration | Customers, agreements, subscriptions and open balances are migrated; CRM, ERP and other systems are connected through the REST API and supported connectors. |
| 4 | Parallel validation and acceptance | ATSuite runs alongside your existing billing for one or more cycles, and every invoice is reconciled against the old system before sign-off. |
| 5 | Controlled go-live | Cut-over is scheduled around a billing cycle, with agreed exit criteria, a rollback plan and our team on hand. |
| 6 | Managed operations and continuous improvement | We host, monitor and operate the platform, ship updates continuously, and review the configuration with you as your commercial models change. |

**Files.** `components/step-list.html`, `src/implementation.html`,
`shell/implementation.head.html`, `content/*/implementation.json` (12 new strings + 2 changed),
`content/layout.json`. Migration item (new array field on `step-list`).

#### R20 — About Us heading

`about.page-hero.h1-built-from-a-real` — *Built from a real problem. Trusted in production for
years.* → same text without the final full stop (D9). `about.json:16`; `da`/`pl` likewise.

#### R21 — Contact page

- `contact.split-section.div-we-only-reply-to` (`contact.json:23`) — → **To help us prepare a
  relevant response, please use your business email and include your company website.** The
  current value is lowercase, prefixed by a bold `b-please-note` (*"Please note:"*) and suffixed
  *"— Agree Technologies"*. The new sentence is standalone: set `b-please-note` to `""` in all
  three locales (the `<b>` stays in the markup, renders empty) and drop the suffix.
- `contact.split-section.label-i-consent-to-receive` (`contact.json:47`) — *AT's Privacy
  Policy* → *Agree Technologies' Privacy Policy*, **as a link**. There is no link today and no
  privacy page in the repo (A1). Mechanics once we have a URL: split the label into three slots
  so the anchor can sit mid-sentence — `label-i-consent-to-receive` (*"I consent to receive
  marketing material from Agree Technologies. By submitting, you agree to"*),
  `a-privacy-policy` (*"Agree Technologies' Privacy Policy"*, `href` = A1, `target=_blank`),
  `span-we-occasionally` (*"We occasionally send information about news and events. You can
  unsubscribe at any time."*). Style: navy, underlined, small external-link icon — "more visual".
  `contact-form` is a one-off component → the two new slots are a migration item.
  Files: `components/contact-form.html`, `src/contact.html`, `content/*/contact.json`,
  `content/layout.json`.

#### R22 — Translation debt for this round

Changed English values ≈ 22 (R3–R10, R14, R16, R20, R21). New English strings ≈ 45 (R11: 3,
R12: 3, R17: 9, R18: 18, R19: 12, R21: 2, nav groups: 2). **≈ 67 English → ≈ 134 Danish and
Polish values.** Danish first — it is the locale the CFO reads.

---

## 4. Sequencing

| Phase | What | Needs | Effort |
|-------|------|-------|--------|
| 0 | Answers to §1. Announce the CMS freeze. | CFO, Kristian | — |
| 1 | **Values only:** R3–R10 (minus D6 items), Subscription, CPQ, Billing, R14 given part, R20, R21 first bullet, D3 rename. `content/{en,da,pl}` + `index-print`. `npm run build:blocks`, coverage still 100/100/100. One commit. | nothing | ½ day + translation |
| 2 | **CSS and markup, no new keys:** R2 (H1), R12 shared label style on existing labels, R1 if option 2/3, R14 capture swap. `shell/` + `src/` + `components/` together; `npm run blocks` round-trip must pass (round-1 §2.1). | Q2 for R1 | 1 day |
| 3 | **New keys and blocks:** R11, R12's three missing labels, R16 nav regroup, R17, R18, R19, R21 privacy link. `layout.json` + `content/*` + components + CSS. | D1, D2, D4, D5, D7, A1 | 1½ days + translation |
| 4 | **Screenshots** R13 as captures arrive. | Q1 | ½ day per batch |
| 5 | **CMS:** `cd cms && npm run generate && npm run payload migrate:create`, commit `src/migrations`; `npm run payload:seed` (with the CMS still frozen); `npm run verify:export -- --check` clean; rebuild and push the image; deploy per `cms/DEPLOY.md`. Then lift the freeze. | phases 1–3 merged; **explicit go before anything touches the server** | ½ day |

Phase 1 can start the moment this plan is accepted; nothing in it depends on §1.

---

## 5. Working rules

Round-1 plan §5 applies unchanged: freeze the CMS, change values never keys, edit `components/`
*and* `src/`, grep before believing a number is editable, preserve line endings (`content/**` LF,
HTML and `*-PLAN.md` CRLF), three locales per change, `npm run build:blocks` after every commit.

Two additions for this round:

8. **A new section reuses a generic component when one fits**; a new component is justified only
   when it will be instantiated more than once (R17/R18's `definition-rows` qualifies). Every
   new component is one more block type in the migration and one more thumbnail for the picker.
9. **Screenshot before and after** for every visual item (R1, R2, R11, R12, R19) at 1440 and
   390, from `dist/` served on `:8000`, so the CFO signs off on pixels rather than prose.

---

## 6. Assumptions taken where the review was ambiguous

Restated in one place so they can be struck in one pass:

1. "Discover the process management features" and "Compound productivity" are Process-page
   strings although the review lists them under **CPQ** — there is no such text on the CPQ page.
2. Replacement sentences replace the *whole* string they were quoted from (R4, R5, R6), not
   the quoted fragment alone.
3. The product-categories table is both a front-page block and the model for the Solutions
   menu; new use-case pages are out of scope this round.
4. "Turn the remaining content into a shorter case study" means three lines under the quote on
   the same page, not a new case-study page.
5. The About Us change is the removed full stop and nothing else.
6. The consent note keeps its checkbox and legal effect; only the wording and the link change.

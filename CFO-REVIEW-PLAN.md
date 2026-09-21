# CFO Review — Remediation Plan

Status: **plan, nothing changed yet**
Drafted: 2026-09-10
Source: `New website review 08092026 (1).docx` — CFO review of the `payload` branch site
Scope: every comment in that review, mapped to the file that produces it, with the
mechanics of how to change it.

---

## Status — 10 September 2026

Answers received for every Q/D/A item. **Done and verified in the build:**
W1 W2 W3 W5 W6 W7 W8 W9 W10 W13 W14 W15 W16 W17 W18 W19 W20 W21 W22 W23 W24 W25 F1 F2.

**14 Sep:** W7 closed — the "Real-time revenue visibility" board was removed outright rather than rebuilt as an operations view, taking every finance metric and the 8,461-events footer with it. **11 Sep:** W9 and W10 closed with a real, sanitised ATSuite screen on the Billing page, and the
Sales hero replaced the same way. Both are DOM-sanitised captures — every name, account
number, invoice number and money value replaced before capture, app nav and QA ribbon
cropped out, with the caption carrying the value callout the review asked for.

**Still open:**

- **W4, W11, W12** — the remaining product mockups (W7, W9 and W10 are done). Screenshots from the `cloudfarmsqa`
  tenant cannot be published: they carry Cloudfarms' *own end customers* (Nova Sarandi,
  Schweinezucht Wiemerslande GmbH, Ny Kjærgård A/S, SUISAG, DanBred Ltd. and more).
  Every visual now carries the review's "Illustrative workflow — not product UI" label
  as the sanctioned interim. Next step is faithful recreations built to the real UI —
  the real design vocabulary is captured in §7 below.
- **D4 answered (11 Sep):** the "Example Telecom A/B/C" convention is approved. No separate demo tenant is being built; sanitised captures from the QA tenant use this convention throughout.
- **CMS re-seed** has not been run — see §2.3. The database still holds the old strings.

The review's own summary: *"the site looks stronger and more enterprise-ready, but its
current language and product mockups overstate parts of ATSuite, resemble category
competitors, and weaken credibility."* Almost nothing here is a design problem. It is a
**truth problem** — the site claims capabilities, customers and numbers that either do
not exist, are not approved, or cannot be shown in a demo.

That matters for how we sequence: **§1 is a list of answers we do not have.** Roughly
half the review cannot be actioned by editing files, because the correct replacement text
is a fact about the product, the contracts, or the customer list that only Kristian,
Karina or the CFO can supply.

---

## 1. Blocked — needs information, an image, or a decision

Nothing below can be written by guessing. Each row blocks the work items named in the
last column. **Get these answered before the copy pass starts**, or we will write
replacement text twice.

### 1.1 Questions for the product / CTO (Kristian)

| # | Question | Why we cannot proceed without it | Blocks |
|---|----------|----------------------------------|--------|
| Q1 | **Does predictive analytics exist in the sellable product today?** Renewal forecasting, forecast accuracy, 90-day horizon, predictive cash flow. If it exists: what model, on what data, and can it be demonstrated? | The review says remove unless it exists and can be demonstrated. If it exists we rewrite with evidence; if it is roadmap we delete four separate panels. The two answers produce completely different homepages. | W7, W8, W16, W17 |
| Q2 | **What is the actual uptime commitment?** The site says `99.99% uptime` as a product fact. Is there a contractual SLA number, and may we publish it? | Review: *"If any are inaccurate, the visual becomes evidence against the sales team."* | W18 |
| Q3 | **Which integrations are built, shipped and supported today?** We currently list 26 named vendors as "pre-built connectors". Need each sorted into: (a) built and supported, (b) documented integration pattern, (c) possible via REST API only. | A logo list implies production-ready. The review wants three tiers; we cannot invent the split. | W19, W22 |
| Q4 | **Is on-premise deployment actually available and sold today?** Also: is Managed-as-a-Service EU-region-only in fact, or aspiration? | Each is a contractual commitment. Review asks explicitly whether Kristian has approved this section. | W20 |
| Q5 | **What are the real security controls?** The billing page claims *end-to-end encryption*, *CCPA compliance*, *2-factor authentication*, *daily encrypted backups*, and the platform claims *GDPR-native*. Need the implemented list, and whether there is a security page or DPA we can link. | Review: route through security/legal review; prefer specific verifiable statements. Publishing a compliance claim we do not meet is the highest-risk item on this list. | W21, W25 |
| Q6 | **What is the CRM integration reality?** The Sales and CPQ pages describe bi-directional sync, native object mapping, and closed-won triggers for HubSpot, Pipedrive, Salesforce and Dynamics 365, each in specific detail. Which of those four are installed integrations, and what actually synchronises today? | Reads as four native connectors. Same three-tier split as Q3 but with per-object detail. | W22 |
| Q7 | **Is `atsuite.app` a real domain we control?** | It is printed in three mockups. If it is real, this is a live-environment disclosure, not just a design flaw. Affects urgency, not the fix. | W2 |

### 1.2 Decisions for the CFO / CEO (commercial)

| # | Decision | Options | Blocks |
|---|----------|---------|--------|
| D1 | **Is Telavox still an approved reference?** IPVision is confirmed *not* approved. Telavox appears in the logo strip, as a named testimonial with an attributed quote (Colin Russel), and as invoice/subscription line-items in two mockups. Cloudfarms and Dstny are clearly approved. | Approved / not approved / approved for logo but not for mock data | W1, W5 |
| D2 | **Which of the headline metrics can we actually stand behind, with a source?** Candidates: `~100% billing accuracy`, `6+ years in production`, `2019 in production at Dstny`, `112% NRR`, `M+ monthly transactions`. Each needs an owner, a calculation and an approval, or it goes. | Per metric: keep with source / relabel *Illustrative* / delete | W6 |
| D3 | **Does the CFO's proposed positioning line become the hero, verbatim?** *"ATSuite is the configurable operational platform that turns complex B2B agreements into controlled subscriptions, accurate billing data and automated workflows — integrated with the systems customers already use."* The review also gives a shorter hero variant. | Use the review's hero line as given / adapt | W3 |
| D4 | **Do we build the approved demo tenant?** The review asks for one fictional company, users, SKUs, contracts and values, used for every screenshot site-wide. It flags this as *"lets discuss this point with Kristian as well"*. | Build it (correct, slow) / adopt a naming convention only, e.g. *Example Telecom A/B/C* (fast, matches the Billing-page instruction) | W5, W9 |
| D5 | **Do we keep a CFO-addressed section at all?** The review says rename to *"Control for billing and commercial operations"* and refocus on traceability, exceptions, approvals and audit logs — CFO relevance *"expressed through control, accuracy and auditability — not through claims of full financial management."* | Rename and refocus / remove the section | W7 |

### 1.3 Assets and data we need delivered

| # | What | Notes | Blocks |
|---|------|-------|--------|
| A1 | **Cloudfarms logo** — SVG preferred, or PNG with transparency, light-on-dark | The logo strip today is *styled text*, not images (`DSTNY`, `Telavox`, `IPVision` are CSS-styled `<div>`s). Adding a real logo means either supplying all three as images or rendering Cloudfarms as text too. Ask which. | W1 |
| A2 | **Real ATSuite screenshots**, sanitised — at minimum: a quote screen (homepage hero + CPQ hero), a bill-run / invoice list (Billing hero), a subscription list (Subscription hero), and an operations view for the homepage board | This is the single largest dependency in the review. Five hand-drawn HTML mockups have to be replaced by real screens. Until they arrive, the fallback is the review's own escape hatch: label the visual *"Illustrative workflow — not product UI"*. | W4, W9, W10, W11, W12 |
| A3 | **Correct board photographs, with confirmed names** | `assets/board-henrik.jpeg` carries alt text *"Henrik Müller"* but is displayed on the card for **Kenneth Andreasen, Chairman**. One of the two is wrong and we cannot tell which from the repo. If the photo is genuinely of someone else, this is a live misidentification of a named board member. | W13 |
| A4 | **The single approved management and board list** — legal names, titles, and which photo belongs to whom | The CTO is *"Kristian Jacobsen"* on the management card and *"Kristian Hvid Jakobsen"* on the board card, four sections apart on the same page. | W13 |
| A5 | **2–3 real named automation examples from ATSuite**, for the Process page | Review: replace *"Operate at machine speed"* with *"Automate the handoffs your revenue process depends on"* — *"Then give 2–3 real examples from ATSuite."* We do not have those examples. | W24 |
| A6 | **Approved wording for the finance-boundary statement** | Review supplies a draft: *"ATSuite calculates and structures billable charges and invoice data; accounting, general ledger, payments and statutory reporting remain in connected finance systems."* Confirm it is the sanctioned form, since it will be repeated on three pages. | W14 |

### 1.4 Two things we found that the review did not

| # | Finding |
|---|---------|
| F1 | **The footer copyright reads © 2027.** `content/en/foot.json:21` — the key is `div-2026-agree-technologie`, the value says `© 2027 Agree Technologies ApS`. Present in all three locales. Today is 2026. Free fix, ships with the language pass. |
| F2 | **A named employee is used as fake approver data.** `content/en/cpq.json:75` — the CPQ approval flow lists *"Finance · Karina B."*, alongside *"Sales Manager · Anna L."* and *"Deal Desk · Marco R."*. Karina Buch is the actual CEO, named on the About page. The review flags "apparent personal data" on this visual and asks for role labels; this is worse than it flagged. |

---

## 2. How the site is built — the mechanics behind every "how" below

You have to know four things about this repo before any instruction below makes sense.

### 2.1 What actually ships is `components/` + `shell/`, not `src/`

`netlify.toml` runs `npm run build:blocks`, which is `node build.js --from-blocks`.
That path (`build.js:231`) assembles each page as:

```
shell/<page>.head.html
  + components/<name>.html   ×N, in the order content/layout.json gives
  + shell/<page>.tail.html
```

`src/*.html` is the pre-componentisation copy. It still exists, still contains every
offending string, and is still the input to `tools/extract-blocks.js` — but the deployed
HTML does not come from it.

> **Working rule:** make every markup edit in `components/` (and `shell/` for anything in
> `<head>`), then apply the same edit to `src/<page>.html` so the two stay in step.
> `npm run blocks` enforces a byte-for-byte round-trip and will fail if they drift.

### 2.2 Text lives in `content/`, but numbers are hardcoded in the markup

This is the trap, and it is why "just edit the CMS" is not the answer to the review's
metrics comment. Compare, from `components/home-hero.html`:

```html
<div class="mock-line"><span class="l">{{slot:span-subscription-voice-pro}}</span><span class="r">€186,400</span></div>
...
<div class="label">{{slot:div-forecast-accuracy}}</div>
<div class="val">98.7%</div>
```

The *labels* are content keys, editable by anyone in the CMS. The *values* — `€186,400`,
`98.7%`, `~100%`, `112%`, `99.98%`, `€842,206.50`, `8,461`, `68.2%`, `94%` — are literal
text in the HTML. An editor cannot change or remove them. Every invented number the review
objects to is in this second category, spread across:

| File | Hardcoded values |
|------|------------------|
| `components/home-hero.html` | `€186,400` `€24,000` `€12,225` `−€16,030` `€206,595` `98.7%` `~100%` |
| `components/cfo-dashboard.html` | `€2.4M` `68.2%` `€1.64M` `−6.4%` `€186K` `94%` |
| `components/q2c-board.html` | `€206,595` `€2.4M` `8.92M` `€18,470` `€1.86M` |
| `components/module-grid.html` | `142` `23` `87` `112%` `348` `1,284` `€842,206.50` `99.98%` `42` `8,461` `1.4s` |
| `components/innovate-forecast.html` | `18.4%` `€2.4M` `94%` `€312K` `24%` |
| `components/quote-carousel.html` | `~100%` `2019` `112%` |
| `components/visuals/billing-hero.html` | `22,163` `€842,206` `1,284` `€18,470.00` `€42,108.32` `€7,224.10` `€2,860.00` |
| `components/visuals/cpq-hero.html` | `1,200` `€186,400` `€24,000` `€9,840` `€12,225` `€206,595` |
| `components/print-hero.html` | mirrors `home-hero` |

Some numbers *are* in content and therefore CMS-editable — `€2.4M ARR`
(`index.json:27`), `8,461 events / minute` (`index.json:154`), `99.98% MEDIATED`
(`billing.json:18`), `94% PREDICTIVE ACCURACY` (`platform.json:122`), `99.99% uptime`
(`platform.json:53`). The split is arbitrary; it just reflects where the extractor drew
the line. **Assume every metric needs a code change until you have grepped for it.**

### 2.3 The CMS is the source of truth, and it overwrites `content/`

`tools/export-from-payload.js` states it plainly:

> *"Nothing here is clever about merging. The CMS wins outright… a local edit to
> `content/` that has not been seeded back will be overwritten."*

So there are two legitimate ways to change a string, and mixing them loses work:

- **Editor path** — change it in the Payload admin, publish; the admin runs the export,
  which writes `content/` + `layout.json` and commits. Right for copy the marketing owner
  is iterating on.
- **Repo path** — change `content/en/*.json` in git, then re-seed the CMS
  (`npm run payload:seed`, which is one-way disk → database and *"would discard their
  work"* if an editor has been in there). Right for a large mechanical pass — which is
  what this remediation is.

**Recommendation:** do this remediation on the repo path, in one branch, with the CMS
frozen (nobody editing) and a re-seed at the end. Run `npm run verify:export -- --check`
before and after to prove no drift. Announce the freeze.

### 2.4 Every English change is a Danish and Polish change

`da` and `pl` are at **100% coverage** (830/830 keys each) and are indexed on that basis.
`build.js` marks a locale `noindex` and drops it from the sitemap below 90%
(`MIN_INDEXABLE_COVERAGE`). Two consequences:

- **Editing a value does not break coverage** — the key still exists, the translation is
  just now *wrong*. Nothing in the build catches this. Stale Danish copy will ship silently.
- **Renaming a key does break it**, and renaming is expensive besides. Content keys are
  derived from the English text (`h1-the-all-in-one`, `div-ipvision`), and Payload turns
  each into a **Postgres column** — `cms/src/migrations/20260909_063858.json` literally
  contains `div_ipvision`, `div_ipvision_aps`, `content_div_ipvision`. A rename is a
  database migration plus edits in `content/{en,da,pl}/*.json`, `content/layout.json`
  (the slot→key map, lines 835 and 1096 for this one), the component, and `src/`.

> **Working rule:** **change values, never rename keys.** `div-ipvision` holding the text
> "Cloudfarms" is ugly in the admin and free. Renaming it to `div-cloudfarms` costs a
> migration. Accept the ugliness; note it for a future extraction pass.

Scope of the translation debt: the sections this review touches hold roughly **500 of the
897 English keys**. A realistic estimate once we know which text actually changes is
**200–250 English strings → 400–500 translations**. That is a line item, not an afterthought.

### 2.5 Line endings

Mixed on purpose, and the build round-trips bytes. `content/**/*.json` is **LF**.
`components/*.html`, `src/*.html`, `shell/*.html` and the `*-PLAN.md` files are **CRLF**.
Preserve per file; do not let an editor normalise a whole file.

---

## 3. The work

Ordered by the review's own priority. Each item names the review comment, every file that
produces it, and how to change it.

### CRITICAL

---

#### W1 — Remove IPVision everywhere; put Cloudfarms next to Dstny

> *Review: "Remove IPVision as a current customer/reference everywhere." · "Next to DStny use Cloudfarms; add its logo and case CTA near the hero."*

**Blocked on:** A1 (logo), D1 (is Telavox approved?)

IPVision appears in **four** distinct places, in all three locales:

| Where | Content | Markup |
|-------|---------|--------|
| Homepage logo strip | `content/{en,da,pl}/index.json:49` `div-ipvision` | `components/home-hero.html:121`, `src/index.html:992` |
| Print homepage logo strip | `content/en/index-print.json:35` | `components/print-hero.html:71`, `src/index-print.html:648` |
| Billing invoice list | `content/{en,da,pl}/billing.json:31` `div-ipvision-aps` | `components/visuals/billing-hero.html:31`, `src/billing.html:88` |
| Subscription table | `content/{en,da,pl}/subscription.json:35` `div-ipvision-aps` | `components/visuals/subscription-hero.html:29`, `src/subscription.html:85` |

Plus the About origin story — separate item, W15.

**How:**

1. **Logo strip.** Change the *value* of `div-ipvision` to `Cloudfarms` in
   `content/{en,da,pl}/index.json:49` and `content/en/index-print.json:35`. Keep the key
   (§2.4). If A1 delivers a real logo file, replace the styled `<div class="lg">` in
   `components/home-hero.html:119-121` with three `<img>`s — but then all three logos must
   be images or the strip looks broken, so this needs Dstny and Telavox assets too.
2. **Logo strip label.** `div-trusted-by-leading-saa` currently reads *"Trusted by leading
   SaaS & telecom companies across Europe"*. The review prefers a labelled proof line:
   *"Used to automate complex B2B operations across telecom and global SaaS."* Value change,
   `index.json:46`.
3. **Mock data.** Do **not** substitute another real customer. The review is explicit:
   *"Do not mix approved customer brands into UI data."* Replace the whole invoice and
   subscription datasets with one fictional convention (D4) — `Example Telecom A/B/C`. That
   means `billing.json:22-33` and `subscription.json:23-38` lose `Northwind Telecom`,
   `Telavox Nordics`, `Kontur & Co` and `IPVision Aps` together, not just IPVision.
4. **Case CTA near the hero.** New link to the Cloudfarms story. There is no case-study page
   today — see W5 for where the story goes.
5. Mirror every value change into `da` and `pl`.
6. Grep to confirm: `grep -rn "IPVision\|IPvision" content components src shell` returns
   nothing. Ignore `cms/.next/` (build cache) and `cms/src/migrations/` (column names,
   see §2.4).

---

#### W2 — Remove the browser chrome and the `atsuite.app` URL

> *Review: "Remove visible atsuite.app URLs from UI illustrations." · "Looks like a live/customer environment and exposes a URL."*

**Blocked on:** Q7 (only for urgency)

Three mockups draw a fake browser window — traffic-light dots plus a URL bar:

| File | Line | String |
|------|------|--------|
| `components/home-hero.html` | 15 | `atsuite.app/quotes/Q-2046 · Enterprise renewal · FY26` |
| `components/print-hero.html` | 20 | same |
| `components/visuals/cpq-hero.html` | 6 | `atsuite.app/cpq/quotes/Q-2046 · Subscription quote · Northwind` |
| `src/index.html` | 886 | mirror |
| `src/index-print.html` | 597 | mirror |
| `src/cpq.html` | 88 | mirror |

**How:** this is the cheapest critical item in the review — the URL is hardcoded, so it is
a template edit with no content, CMS, or translation consequence at all.

Delete the whole `.mock-tab-row` / `.bar` element (dots included, not just the URL text —
the review says *"crop out browser chrome and domain"*, and dots without a URL still read
as a browser). Then check `styles.css` for now-unused `.mock-tab-row`, `.url`, `.d1/.d2/.d3`
rules and whether removing the row breaks the panel's top border-radius.

Do all six files in one commit; it is a self-contained, shippable fix.

---

#### W3 — Replace the hero headline and the metadata

> *Review: "Generic category language. Zuora leads with 'The Leading Quote-to-Cash Platform for Growth'; Chargebee leads with 'Every Pricing Model, One Billing System'. ATSuite sounds like another version of the same category promise."*

**Blocked on:** D3

| Key | File | Current |
|-----|------|---------|
| `h1-the-all-in-one` | `content/en/index.json:12` | `The all-in-one CPQ & *billing* platform for B2B SaaS` |
| `p-automate-the-entire-qu` | `:13` | `Automate the entire quote-to-revenue process…` |
| `meta.title` | `:3` | `ATSuite — All-in-one CPQ & Billing for B2B SaaS · Agree Technologies` |
| `meta.description`, `og-*`, `twitter-*` | `:4-8` | all repeat "all-in-one CPQ & billing" |

**How:** value changes only. The review supplies the replacement:

- H1: *"Turn complex B2B agreements into accurate billing and automated operations."*
- Lede: *"ATSuite connects quoting, subscriptions, billing logic and workflows in one
  configurable platform — integrated with your CRM and finance systems."*

Two gotchas:

- The `*asterisks*` in the current H1 are the accent-span marker (`@span.accent` in
  `components/home-hero.html:5`). If the new headline has no emphasised phrase, either pick
  one to wrap or the accent colour disappears — a visual change worth deciding deliberately.
- The same category phrasing is repeated in `content/en/index-print.json`,
  `content/en/foot.json:3`, `content/en/jsonld.json`, and `content/en/nav.json:19`. Sweep
  all of them or the new positioning contradicts the footer on every page.

Then `da` and `pl`. The headline is the one string worth a proper translator rather than a
mechanical pass.

---

#### W4 — Replace the hero product illustration

> *Review: "The browser URL must not appear. The design also implies this is the real ATSuite interface, although it is not identical to the application." · "If a faithful screenshot is unavailable, label the visual 'Illustrative workflow — not product UI'."*

**Blocked on:** A2, D4

`components/home-hero.html:12-54` — the quote panel, its five line items with hardcoded
euro amounts, and two floating cards (`€2.4M ARR / ▲18% vs last year`, `Forecast accuracy
98.7% / predictive · 90d`).

**How, in two stages** — this is the pattern for every visual in the review:

- **Now, unblocked:** do W2 (kill the chrome), replace `Northwind Telecom · Renewal FY26`
  (`index.json:17`) with the fictional convention, delete the *Forecast accuracy 98.7%*
  floating card outright (it is the predictive claim, Q1, and the number is invented, D2),
  and add the review's label *"Illustrative workflow — not product UI"* under the panel.
  That is a new content key in a new `<div>` — one of the few places a key must be *added*
  rather than renamed, which is safe.
- **When A2 lands:** replace the whole hand-built panel with `<img>`. That deletes ~40 lines
  of markup and roughly 20 content keys from `index.hero`. Deleting keys *does* hit the
  Payload schema — plan it as one migration alongside W9–W12 rather than five separate ones.

---

#### W5 — Move Cloudfarms directly below the hero

> *Review: "Move Cloudfarms into the first proof section directly below the hero and make its global, end-to-end process story visually prominent." · "Most relevant scale story is buried that is not a Teleco."*

**Blocked on:** D1

The homepage order is in `content/layout.json` (`build.js:231` reads it):

```
0 hero  ·  1 q2c  ·  2 modules  ·  3 cfo  ·  4 quote  ·  5 innovate  ·  6 cta-band
```

The Cloudfarms testimonial is the **second half** of the `quote` block at position 4 —
`components/quote-carousel.html:36-65`, content at `content/en/index.json:166-175`. It is a
strong quote: CRM+ERP that did not work together, four regions, lead-to-quote-to-contract-
to-subscription-to-billing fully automated. Exactly the end-to-end process story the CFO
wants prominent. It sits below three sections of product marketing.

**How — three options, increasing cost:**

1. **Swap the halves.** Cloudfarms becomes the top quote in the carousel, Dstny second.
   ~10 minutes, editing `components/quote-carousel.html` and the slot map in
   `layout.json`. Does not satisfy *"directly below the hero"*.
2. **Move the whole `quote` block to position 1.** A one-line reorder in `layout.json` —
   this is exactly what the blocks system was built for, and an editor can do it in the
   admin by drag. But it moves Dstny up too, and pushes the *"one system for the entire
   quote-to-revenue process"* explainer below two testimonials.
3. **Split `quote-carousel` into two component instances** — `quote-cloudfarms` at
   position 1, `quote-dstny` at position 4 — and give the Cloudfarms one a larger
   treatment. Correct, and matches *"visually prominent"*. Cost: a new component file, a
   new block type in the generated Payload schema, and splitting the `index.quote` section
   (18 keys) into two sections across three locales.

**Recommend option 3**, bundled with the other structural work, with option 1 as a
same-day interim if the site needs to look better before then.

Also needs: a Cloudfarms case CTA (W1 step 4) — and there is nowhere for it to link. Either
the quote block gains a "Read the Cloudfarms story" link to a new page, or the CTA is
dropped. **Open question for the CFO.**

---

#### W6 — Remove or source the unverified metrics

> *Review: "Visitors will read these as real customer or product results. Some also imply predictive functionality." · "Never use realistic-looking invented numbers without an 'Illustrative data' label."*

**Blocked on:** D2, Q1

The full inventory is §2.2. The review names `2.4M ARR`, `98.7% forecast accuracy`,
`112% NRR`, `8,461 events/minute` and *"multiple growth percentages"* — there are around
**forty** such numbers on the site.

**How:** sort every one into three buckets, then apply mechanically.

- **Verified** — keep, and add the source and context inline. Only D2 can populate this
  bucket. Likely: `~100% billing accuracy` and `2019 / 6+ years in production` (both are
  attributable to the Dstny relationship and appear in Carsten Thomsen's approved quote).
- **Illustrative** — keep the number because the UI needs one, and label the *container*
  once with *"Illustrative data"*. Right for the mock quote line items (`€186,400` etc.),
  where a blank panel would look broken.
- **Delete** — anything implying a product capability we do not sell. `98.7% forecast
  accuracy`, `predictive · 90d`, `94% renewals`, `94% predictive accuracy`, `Predictive
  cash flow`. These go with W8 and W16, not as a number edit.

Practical note: because most values are hardcoded (§2.2), this is a code pass, not a CMS
pass, and the *"Illustrative data"* labels are new content keys. Do the whole sweep in one
commit per component so a reviewer can check it visually.

---

#### W7 — Rework the homepage finance dashboard and the CFO section

> *Review: "The combined view resembles a CFO analytics/financial reporting product." · "Replace with an ATSuite operations view: pending approvals, subscription changes, billable events, exceptions, completed workflows and ERP export status. Use only fields available in ATSuite." · "Rename to 'Control for billing and commercial operations'."*

**Blocked on:** D5, Q1, and A2/D4 for the replacement fields

`components/cfo-dashboard.html` (173 lines) + `content/en/index.json:117-155` (38 keys),
block position 3.

Two problems in one section:

- **Copy** (`:117-135`): *"Built for the Office of the CFO"*, then cash flow, working
  capital, gross margin, board reporting, *"fully auditable revenue trail"*. The review:
  *"overreaches from operational billing control into finance-system outcomes. It reads
  like Zuora/Chargebee enterprise-finance positioning."*
- **The dashboard** (`:136-155` + the markup): five tiles — MRR/ARR `€2.4M`, Gross margin
  `68.2%` with a `€1.64M` contribution donut, Discount performance `−6.4%`, Subscription &
  usage `€186K/mo`, Renewal & indexation `94%` — over a live-streaming footer reading
  `8,461 events / minute · all queues green` and `RUN · 14 MAY 2026 · 09:42 CET`.

**How:**

1. **Copy first, it is unblocked and high-value.** Eyebrow `div-built-for-the-office` →
   *"CONTROL FOR BILLING AND COMMERCIAL OPERATIONS"*. Rewrite the two "challenges/results"
   lists (`li-inconsistent-cash-flow`, `li-more-predictable-cash-`, `li-better-reporting-for-m`,
   `li-improved-compliance-an`) onto the review's axis: traceability from agreement to
   invoice data, exception handling, approvals, audit logs, integration with finance
   systems. Ten `li-` keys, values only, ×3 locales.
2. **Then the tiles.** All five change meaning, so this is a rewrite of
   `components/cfo-dashboard.html:86-170`, not an edit. Target fields, from the review:
   pending approvals · subscription changes · billable events · exceptions · completed
   workflows · ERP export status. Every one needs Q1/A2 confirmation that ATSuite has that
   field.
3. Retire the tile content keys that no longer apply (`div-gross-margin`, `div-contribution`,
   `div-discount-performance`, `div-mrr-arr`, `div-18-4-yoy`, `div-2-1-pts-qoq`,
   `b-3-1-pts`…). Removals hit the Payload schema — batch with W4/W9–W12.
4. The `RUN · 14 MAY 2026` timestamp is also stale-dated. Whatever replaces it should not
   carry a fixed date.

---

#### W8 — Remove the predictive panels

> *Review: "Implied AI/predictive functions require proof and clear product availability. Remove unless these capabilities exist today and can be demonstrated. If roadmap-only, do not present them as live product features."*

**Blocked on:** Q1 — this single answer decides four separate edits

Predictive claims, all locations:

| Claim | Where |
|-------|-------|
| `Forecast accuracy 98.7% / predictive · 90d` | `components/home-hero.html:47-54`, `content/en/index.json:29-30` |
| `Predictive` / `cash flow` in the hero value strip | `content/en/index.json:42-43`, `components/home-hero.html:98-103` |
| `Revenue forecast · Q3` / `PREDICTIVE · 90D HORIZON` / `Renewals 94%` | `components/innovate-forecast.html:17-60`, `content/en/index.json:187-192` |
| `Predictive analytics for renewals, upsell and forecasting` | `content/en/index.json:184` |
| `predictive analytics` in the Innovate lede | `content/en/index.json:180` |
| `Analytics / Predictive` in the platform architecture diagram | `content/en/platform.json:36` |
| `94% PREDICTIVE ACCURACY` | `content/en/platform.json:122` — see W17 |
| The dotted forecast line in the SVG | `components/innovate-forecast.html:37-41` |

**How, if Q1 = "roadmap":** the Innovate section is *about* forward-looking capability
(*"We continuously add capabilities… so the platform you adopt today keeps compounding
tomorrow"*), so it need not be deleted — but it must move to future tense and lose the
94% and the forecast chart. The homepage hero card and value-strip pair are deletions.
`platform.json:36` becomes `Reporting` or similar.

**If Q1 = "exists":** each claim needs a number with a source (D2) and a demo path, and the
`94%` figures need a stated model and dataset. Higher bar than deleting.

---

#### W9 / W10 / W11 / W12 — The four remaining product mockups

> *Review: "Use real ATSuite screens as the source of truth. Crop and compose them for marketing, but do not redraw controls in ways that change functionality." · "For conceptual diagrams, use neutral process objects rather than fake application windows."*

**Blocked on:** A2, D4

| # | Mockup | Files | What is wrong |
|---|--------|-------|---------------|
| W9 | **CPQ hero** | `components/visuals/cpq-hero.html`, `content/en/cpq.json:10-40` | Browser chrome + URL (W2), `Northwind Telecom`, four hardcoded euro line items, six language pills |
| W10 | **Billing bill-run** | `components/visuals/billing-hero.html`, `content/en/billing.json:16-33` | Four named customers incl. IPVision, `22,163` / `€842,206` / `1,284` / `99.98%`, per-invoice euro amounts |
| W11 | **Subscription table** | `components/visuals/subscription-hero.html`, `content/en/subscription.json:16-38` | Four named customers incl. IPVision, `€2.4M ARR`, seat counts, statuses |
| W12 | **Quote-to-revenue board** | `components/q2c-board.html`, `content/en/index.json:51-71` | Five stage cards with invented values — see W14 for the `Revenue`/`Recognised` problem specifically |

**How — the same three-step shape for each:**

1. Strip identity: browser chrome, real customer names, employee names, internal IDs
   (`INV-7814`, `INV-7817`, `Q-2046`), and any date that will go stale.
2. Apply the approved fictional dataset (D4) — the *same* one in all four, which is the
   review's point: *"so data is consistent across pages"*.
3. When A2 lands, swap markup for `<img>` and retire the orphaned content keys in one
   batched schema change.

Also from the review, applying to all four: **"Use callout annotations outside the UI to
explain value. Do not place marketing claims inside product screens."** Today the claims
are *inside* the mock panels. That is a layout change, not a copy change.

The CPQ approval flow (`content/en/cpq.json:71-77`) also needs role labels instead of
names — the review asks for *"Sales Manager", "Deal Desk", "Finance approver"*. Note F2:
one of the three names is the real CEO.

---

#### W13 — Fix the people data on About

> *Review: "Image alt text says 'Henrik Müller' while the visible card says Kenneth Andreasen; CTO is named both Kristian Jacobsen and Kristian Hvid Jakobsen." · "Verify names, titles, portraits and alt text against a single approved management/board list."*

**Blocked on:** A3, A4

Confirmed in the repo:

| Problem | Evidence |
|---------|----------|
| Chairman's photo/alt mismatch | `src/about.html:119` renders `assets/board-henrik.jpeg` with `alt="{{i18n:about.meta.alt}}"`; `content/en/about.json:9` sets that to `"Henrik Müller"`; the card body at `about.json:34` reads `"Kenneth Andreasen"` |
| CTO named twice, differently | `about.json:40` `"Kristian Hvid Jakobsen"` (board) vs `about.json:55` `"Kristian Jacobsen"` (management) vs `about.json:11` `alt-3: "Kristian Jacobsen"` |
| Filename encodes the wrong name | `assets/board-henrik.jpeg` |

**How:** trivial once A3/A4 land — four `alt` values in `about.json:9-12`, plus whichever
of `h4-*` / `h3-*` is wrong, ×3 locales. Rename the asset file too (referenced once, in
`components/board-grid.html` and `src/about.html:119`).

**Do not guess which name is correct.** If the photograph is of a different person than the
card claims, this is a misidentification of a named board member, and the page should come
down until A3 is answered.

---

#### W14 — Draw the finance boundary

> *"State clearly that ATSuite is not an ERP, general ledger, accounting or financial-management system. It creates and controls commercial and billing data and integrates it into finance systems."* — head point 4, and the single most repeated theme in the review.

**Blocked on:** A6 (wording sign-off)

Three edits:

1. **The platform-overview flow.** `content/en/index.json:57-61` runs
   `Quoting → Subscription → Usage → Billing → Revenue`, and the fifth card
   (`index.json:71`, `components/q2c-board.html:67-69`) is labelled `Recognised` with
   `€1.86M`. Review: *"'Revenue' and 'recognition' suggest accounting/revenue-recognition
   functionality. End the flow with 'Invoice data / Finance hand-off' or 'Billing output'."*
   → change `div-revenue` and `div-recognised` values; the `€1.86M` is hardcoded in the
   component. Also `index.json:54`, which promises the suite automates
   *"quoting, subscriptions, billing, and recognition"*.
2. **The boundary statement itself**, added below the flow and on both the Billing and
   Subscription pages: *"ATSuite sends validated billing data to your ERP/accounting
   system; it does not replace the general ledger."* New content keys and a new element in
   three components — the one place in this plan where adding keys is right.
3. **Sweep the finance vocabulary.** `content/en/billing.json` says *"safeguard your
   financial information"* and *"seamless integration to payment gateways and accounting
   systems"*; `content/en/subscription.json:69` promises to *"Elevate operations, financial
   management, and customer relationships"*. Review: *"The total impression can be 'ATSuite
   is our finance system'."*

---

### HIGH

---

#### W15 — Rewrite the About origin story

> *Review: "I know – I wrote it but it needs to be changed."* — with the replacement supplied.

`content/{en,da,pl}/about.json:17`. Currently opens *"It began with the opportunity to meet
a pressing need. IPVision (now Dstny A/S) had a thriving business but urgently required…"*

**How:** unblocked, and the only item where the review hands us finished copy:

> *"ATSuite originated in the need to manage complex telecom operations at scale and has
> since evolved into a configurable platform for B2B subscription businesses."*

Value change ×3 locales. Note the Danish and Polish versions are full translations of the
old long paragraph — they need retranslating, not trimming. Note also that the board bios
(`about.json:35`, `:38`) legitimately reference IP Vision as company history — *"Co-founded
IP Vision in Denmark in 2005"* — which is biography, not a customer reference, and should
stay. Confirm with the CFO that W1's "everywhere" does not extend to founders' CVs.

---

#### W16 — Rewrite the homepage outcome strip

> *Review: "Profitability and cash-flow claims imply financial-management capabilities and may not be generated by ATSuite itself."*

**Blocked on:** Q1 (only for the predictive pair)

`content/en/index.json:31-45`, eight `<b>`+label pairs in `components/home-hero.html:58-112`.
Three offend: `Real-time / profitability`, `Predictive / cash flow`, `Faster / time-to-cash`.

**How:** value changes, and the review supplies the replacements — *"Controlled pricing and
approvals"*, *"Accurate billable data"*, *"Automated subscription changes"*, *"Fewer manual
handoffs"*, *"Traceable workflows"*. That is five phrases for eight slots, so either pick
five and delete three pairs (a markup change, and each slot has a bespoke SVG icon), or
keep eight and write three more in the same register. **Recommend five** — the strip is
crowded, and the review's five are stronger than the eight they replace.

Two of the eight are also unrelated claims that should be checked while we are here:
`~100%` *billing accuracy* (D2) and `Built in EU · GDPR-native` (Q5, W21).

---

#### W17 — Analytics: drop "predictive", drop "94%"

> *Review: "Strong quantified product claim with no stated model, dataset or proof. Use 'Operational reporting and configurable dashboards' unless predictive analytics is released and evidenced."*

**Blocked on:** Q1

`content/en/platform.json:117-122` — heading *"Insight that drives decisions."*, body
promising *"Advanced visualisation and predictive analytics"*, and the visual label
`94% PREDICTIVE ACCURACY`. Also `platform.json:36`, `Analytics / Predictive` inside the
architecture diagram, and `subscription.json:65`, *"Customer behaviour insights and
predictive models"*.

**How:** value changes only, using the review's own replacement phrase. Four keys, ×3 locales.

---

#### W18 — Platform architecture and API box

> *Review: "These are precise technical promises. Show only stable architecture facts. Replace 99.99% with an approved SLA statement or remove; never use an illustrative endpoint that resembles a public production URL."*

**Blocked on:** Q2

`content/en/platform.json:51-53` (`API · v3`, `REST · WEBHOOKS`, `99.99% uptime`) and
`:17-20` (`Web App / React · JS`, `API Gateway / REST · Spring Boot`).

**How:** the framework names are stable architecture facts and can stay. `99.99% uptime`
goes or becomes the approved SLA wording (Q2). Check `components/visuals/platform-hero.html`
and the `platform-split-section*.html` files for any endpoint string that looks like a
production URL — the review flags this specifically and it may be in markup rather than
content.

---

#### W19 — Split the integration list into three tiers

> *Review: "A logo/name list implies production-ready integrations. Separate 'available connectors' from 'integration patterns' and 'can integrate via API'."*

**Blocked on:** Q3

`content/en/platform.json:47-89` — 42 keys, 26 named vendors in six categories, under the
heading *"Pre-built connectors and a documented REST API mean ATSuite slots into the ERPs,
CRMs, ticketing tools and identity providers your teams already depend on — no
rip-and-replace."*

**How:** once Q3 returns the split, this is mostly a content edit — but the six category
headings become three tier headings, which changes the grid. `components/integration-grid.html`
takes its rows from an `{{#each}}` array in `layout.json` (`tools/README.md` explains the
mechanism), so **adding or removing a row is data, not code** — one of the few places this
repo makes restructuring cheap. Vendors that drop to tier 3 lose their named key entirely.

---

#### W20 — Deployment claims

> *Review: "Each item is a contractual/technical commitment. Is this one approved by Kristian? Replace 'GDPR-native' with concrete controls and hosting facts."*

**Blocked on:** Q4, Q5

`content/en/platform.json:124-137` — SaaS / Managed-as-a-Service / On-Premise /
GDPR-native / SSO, each with a specific promise (*"EU regions"*, *"SAML and OIDC"*,
*"Data residency, retention controls and audit trails out of the box"*, *"for regulated
industries, sovereign-data mandates"*). Also `content/en/index.json:34-35`,
`Built in EU · GDPR-native` in the hero strip.

**How:** hold entirely until Q4/Q5. Do not soften the wording as a stopgap — a vaguer
compliance claim is still a compliance claim.

---

#### W21 — Billing security copy

> *Review: "Compliance/security language must match implemented controls and contracts exactly. Route through security/legal review. Prefer specific, verifiable statements and link to a security page or data-processing documentation. Lets talk to Kristian."*

**Blocked on:** Q5

`content/en/billing.json:57-69` — *SSL encryption* / *"End-to-end encryption protects
financial information in transit and at rest"*, *GDPR & CCPA*, *2-factor auth*,
*Daily backups*.

Two claims are independently suspect on their face: **"end-to-end encryption"** has a
specific meaning that "in transit and at rest" contradicts, and **CCPA** is a
California statute — an unusual claim for a Copenhagen company selling into Europe.

**How:** hold for Q5. If a security page or DPA exists, the review's preference is to link
it rather than restate claims inline, which would shrink this section rather than rewrite it.

---

#### W22 — CRM integration claims on Sales and CPQ

> *Review: "Reads as installed native integrations, not possibilities. State actual supported integrations and what synchronises today. For the rest, say 'integration available through API/project configuration'."*

**Blocked on:** Q6

`content/en/sales.json:45-71` (26 keys) and `content/en/cpq.json:79-96` (26 keys) — near-
duplicate sections, both rendered by `components/integration-grid.html`. Four CRMs each with
a specific behavioural promise: *"Native object mapping for Accounts, Opportunities and
Products"*, *"Bi-directional sync with Dynamics Sales entities"*, *"Closed-won deals trigger
subscription, billing and provisioning workflows automatically"*.

**How:** same tiering as W19, and **edit both pages together** — they will otherwise
contradict each other, which is its own credibility problem.

---

#### W23 — Implementation headline

> *Review: "Memorable but dismisses the genuine complexity of CPQ/billing transformation and can undermine credibility with enterprise buyers."*

`content/en/implementation.json:12` — *"Seamless transition. Zero rocket science."* Also
the lede at `:13`, *"We make it a stress-free transition"*.

**How:** unblocked; the review supplies the replacement — *"A controlled transition from
fragmented processes to one operational flow."* — and asks that it be supported with
*discovery, configuration, integration, migration, validation and operations*. The page
already has a four-step section (`implementation.json:16-26`: Proof of Concept, Discovery
Workshops, Implementation, Operations); the review names six stages. Either expand the four
to six (the step list is an `{{#each}}` array, so extra steps are data — see W19) or keep
four and name the six in prose. Two keys minimum, ×3 locales.

---

### MEDIUM

---

#### W24 — Process headline

> *Review: "Generic automation language and potentially unrealistic. Use: 'Automate the handoffs your revenue process depends on.' Then give 2–3 real examples from ATSuite."*

**Blocked on:** A5 (the examples)

`content/en/process.json:12` — *"Eliminate manual work. Operate at machine speed."*

**How:** the headline swap is unblocked and the review gives the exact replacement. The
2–3 real examples are new content and new markup, and need A5. The hero visual
(`process.json:16-23`) already shows a four-step chain — *Quote signed → Provision service
(0.8s) → Generate invoice → Notify CRM (HubSpot)* — which is close to what is being asked
for, except `0.8s` is invented (W6) and `HUBSPOT` is a Q6 claim.

---

#### W25 — British English and terminology

> *Review: "British English is consistent: customise, monetise, optimisation, centre." · "'Billing' is distinguished from accounting, payments, collections and revenue recognition."*

Found in `content/en/`:

| Word | Where |
|------|-------|
| `customizable` | `sales.json:13`, `sales.json:30`, `subscription.json:50` |
| `monetization` | `index.json:99`, `index.json:132`, `nav.json:19`, `index-print.json:87` |
| `catalog` / `catalogs` | `cpq.json:42,43,47,59`, `index.json:88,89`, `index-print.json:76,77` |

`behavior`, `center`, `organize`, `analyze` and `color` are already clean — the site is
mostly British already (`optimisation`, `monetise`, `recognised`, `customise` all appear
correctly elsewhere), which makes the inconsistency more visible, not less.

`catalog` is the interesting one: it is arguably a product-noun (the ATSuite Catalog module)
rather than prose. **Decide once**, and if it is a module name, capitalise it so it reads as
one.

**How:** unblocked, mechanical, ~12 values in `content/en/` only — `da` and `pl` are
unaffected. Bundle F1 (the © 2027 footer) into the same commit. Then add a lint: a `grep -E`
in the build or a pre-commit hook that fails on the US-spelling list, so this does not
regress. That is the review's *"Language review"* checklist made executable.

---

## 4. Sequencing

The blockers are the schedule. Four tracks, the first two of which start today.

**Track A — ship this week, needs nobody** *(low risk, visibly improves the site)*
W2 (browser chrome), W15 (origin story), W23 (implementation headline), W25 + F1
(language + footer year), the copy half of W7 (CFO section rename), and the interim
option 1 of W5 (Cloudfarms above Dstny in the carousel).

**Track B — starts on D1/D2/D3, the commercial answers**
W1 (IPVision removal), W3 (hero + metadata), W6 (metrics triage), W16 (outcome strip).
These are the head points of the review and are gated only on decisions, not on assets —
push for D1–D3 first.

**Track C — starts on Q1–Q6, the product answers**
W8 (predictive), W17 (analytics), W18 (SLA), W19 (integrations), W20 (deployment),
W21 (security), W22 (CRM), W24 (process examples). Mostly value changes once the facts
arrive; the work is in getting the facts.

**Track D — starts on A2/D4, the screenshots**
W4, W9, W10, W11, W12, and the tiles half of W7. The largest single dependency in the
review, and the one most likely to slip. **Do the interim labelling now** — the review's
own *"Illustrative workflow — not product UI"* escape hatch means Track D does not have to
block a release.

**W13 (people data) sits outside the tracks.** It is a factual error about named
individuals on a live page and should be fixed the day A3/A4 arrive, ahead of anything else.

**Then, once:** the batched Payload schema change for every content key retired across
W4/W7/W9–W12, and the `da`/`pl` translation pass (§2.4 — budget 400–500 strings).

---

## 5. Working rules for whoever picks this up

1. **Freeze the CMS for the duration.** `tools/export-from-payload.js`: *"The CMS wins
   outright."* One editor publishing mid-branch silently reverts the work. Re-seed
   (`npm run payload:seed`) at the end, and run `npm run verify:export -- --check` to prove
   the database and the repo agree.
2. **Change values, never rename keys** (§2.4). `div-ipvision` holding "Cloudfarms" is free;
   renaming it is a Postgres migration.
3. **Edit `components/` *and* `src/`.** The first ships (§2.1), the second keeps
   `npm run blocks` round-tripping.
4. **Grep before believing a number is editable.** Most are hardcoded in markup (§2.2).
5. **Preserve line endings**: `content/**/*.json` is LF, everything HTML is CRLF (§2.5).
6. **Every English change is three changes.** `da` and `pl` are at 100% and indexed on it.
7. `npm run build:blocks` after every commit — it takes 137ms and reports per-locale
   coverage, which is the fastest signal that a key went missing.

---

## 6. The visual QA checklist the review asked for

> *Review: "Build a visual QA checklist covering domain/URL, personal data, customer data, amounts, dates, environment labels, hidden tooltips and file names."*

Make it executable, not a document. A `tools/verify-claims.js` run in the build would fail on:

| Check | Grep, roughly |
|-------|---------------|
| No domain or URL in a mockup | `atsuite\.app`, `https?://` outside `<head>` and footer links |
| No unapproved customer | `IPVision`, and the D1 answer for `Telavox`, `Northwind`, `Kontur` |
| No real person in mock data | the approved-people list from A4, matched outside `about.*` |
| No unlabelled currency or percentage | `€[\d,]+` / `\d+\.\d+%` in `components/` without an `illustrative` marker nearby |
| No stale date | `20\d\d` outside the footer year; catches `RUN · 14 MAY 2026`, `Issued · 14 May 2026`, and F1 |
| No US spelling | the W25 list |
| No leaked filename | `board-henrik` and anything else naming a person |
| Alt text matches the visible name | pair each `about.meta.alt*` against its card heading |

The first four are the review's actual objections. A check that runs in `npm run build` is
the only version of this that survives the next redesign.

---

## 7. The real ATSuite UI — reference for the recreations

Captured from `app.agree-technologies.io`, tenant `cloudfarmsqa`, 10 Sep 2026. Recorded
here because the recreations in W4 and W9–W12 have to match it, and the source screens
themselves cannot be published (they carry Cloudfarms' own customers).

**How far off the current mockups are:** the site draws a dark, gradient, marketing-shaped
UI. The product is a light MUI application with a left rail. They share nothing. This is
what the review meant by *"not identical to the application"*.

### Navigation (left rail, in order)

Bulletin · Commercial Product Catalog · Accounts · Billing · Tasks · Pipeline · BPMN ·
Application tasks · Dictionaries · Price management · Product management ·
Schedule management · Managed objects · Outlook · Account receivable · Tenants

### Design vocabulary

| Element | Reality |
|---|---|
| Ground | White cards on `#F7F8FA`; no gradients, no dark panels |
| Table headers | Small, uppercase, letter-spaced, mid-grey, thin bottom rule |
| Status pills | Rounded, pale fill + saturated text — `PAID` green, `OPEN` red, `PARTIALLY PAID` blue, `ACCEPTED` teal, `APPROVED` green, `DRAFT` grey |
| Money | `31 227,50 €` — space thousands, comma decimal, **trailing** symbol. The site currently writes `€186,400` |
| Dates | `2026-05-06`, with `286d overdue` in red or `settled` in grey underneath |
| Identifiers | Invoices `IN2026050332`; bill cycles `CF`, `CF_QTR`, `PRIO`, `RESELLER` |
| KPI row | Four tiles — Outstanding / Overdue / Due next 14 days / Paid — each dual-currency with a count beneath |
| Filter tabs | `All 159 · Outstanding 93 · Overdue 54 · Due next 14 days 36 · Open 91 · Partial 2 · Paid 66` |
| Pipeline stages | New (10%) · Customer Presentation (30%) · Proposal (60%) · Closing & Paperwork (80%) · Won · Lost — weighted total per column |
| Environment | A red diagonal **QA** ribbon, top-left. Must never appear in a marketing visual |

### Two things the real UI proves

- **Multi-currency is real** — the receivables tiles carry EUR and USD side by side. The
  site never mentions it, and it is a stronger claim than several it does make.
- **The ERP integration is Odoo**, not SAP or NetSuite — bill cycle `ODOO` is described as
  *"Bill Cycle Used To Import Odoo Invoices."* Worth confirming with Kristian whether it is
  supported or tenant-specific before naming it (Q3).

---

## 8. Two claims the site should be making — draft copy

Both come out of the platform itself, not out of positioning work. Both are verifiable in
a demo, which is the bar the review set. Sources: `invoicepdf/delivery.md`,
`invoicepdf/payments.md`, `invoicepdf/export.md`, and the receivables screen in
`cloudfarmsqa`.

### 8.1 The last mile of billing — the strongest thing we are not saying

Zuora and Chargebee generate an invoice and stop. ATSuite carries it through **statutory
Nordic delivery and gets an acknowledgement back**. That is not a feature gap they can
close with a release — it is a market they are not in.

What actually exists, verified in the code:

| Capability | Detail |
|---|---|
| Document generation | PDF **and** OIOUBL XML from the same invoice |
| Three delivery channels | `EMAIL`, `EAN` (NemHandel over SFTP), `BETALINGS_SERVICE` |
| Delivery is acknowledged | the EAN response is polled; GREEN + Final = delivered, anything else = failed. **We know whether the invoice was accepted** |
| Automatic fallback | a failed EAN delivery falls back to email rather than disappearing |
| Retry as an operation | `redeliver`, `redeliverFailedInvoices`, `reprocessAndRedeliver` — a failed delivery is a work item, not a lost invoice |
| Danish OCR payment ids | generated and printed on the PDF |
| Stripe payment links | on the invoice, with webhook receipt |
| Invoice export | a stored batch produces a downloadable CSV (bill-run or manual). **Generic as a mechanism; the only implemented target is one customer's ERP** — see §8.4 V2 |

**Proposed homepage section**, sitting after the quote-to-invoice-data flow:

> **Eyebrow:** THE LAST MILE
> **Heading:** Most billing systems stop at "invoice generated."
> **Body:** ATSuite generates the PDF and the OIOUBL e-invoice, delivers it over the
> channel the customer is actually set up for — e-invoice, email or Betalingsservice —
> and then tracks whether it was accepted. A rejected e-invoice becomes a work item with
> an owner, not a number that quietly never arrives. Failed deliveries retry, and fall
> back to email rather than disappearing.
> **Three tiles:** `OIOUBL e-invoice` · `EAN / NemHandel` · `Betalingsservice`
> **Boundary line (already approved wording):** payment capture, reconciliation and the
> ledger stay in your finance system.

**Why this is worth the space:** it is the one claim on the site a Danish or Nordic buyer
can verify in five minutes and that no global competitor can answer. For anyone invoicing
Danish public authorities, EAN/NemHandel is not a preference — it is mandatory.

**Also worth a line on the Billing page:** *"Invoice the Danish public sector without a
middleware project."*

### 8.2 Multi-currency — real, and completely unmentioned

The receivables screen totals Outstanding, Overdue, Due-next-14-days and Paid in **EUR and
USD side by side**, each with its own invoice count. The site never mentions currency once.

This also does something the review asked for: it **connects the approved Cloudfarms
testimonial to a capability**. Cloudfarms runs across Europe, North America, Latin America
and Asia — multi-currency is *why* one platform can carry that.

**Proposed additions:**

- Hero value strip, replacing nothing — there is room for a seventh:
  **`Multi-currency` / billing and receivables**
- Billing page capability card:
  > **MULTI-CURRENCY** — *Invoice in the currency the agreement is written in.*
  > Charges, invoices and receivables carry their own currency end to end, and your
  > receivables position is totalled per currency rather than flattened into one.
- Beneath the Cloudfarms quote, as the link between story and product:
  *"Four regions, one platform — and every invoice in its own currency."*

**One thing to confirm before publishing (see §8.3):** the screen shows per-currency
totals, *not* FX conversion or a consolidated base-currency figure. The copy above is
written to stay on the right side of that line. Do not upgrade it to "consolidated
multi-currency reporting" without checking.

### 8.3 Three things to verify before any of this ships — ANSWERED, see §8.4

| # | Question | Why it matters |
|---|---|---|
| V1 | Is multi-currency **per-invoice currency with per-currency totals**, or is there FX conversion to a base currency? | The draft copy assumes the former. The latter would be a bigger claim — and a wrong one if unsupported. |
| V2 | Is the accounting export **generic**, or is "KB economy" a specific integration built for one customer? | §8.1 says "accounting export". If it is one customer's integration, it must not be listed as a product connector — that is the Q3 mistake again. |
| V3 | Is **Odoo** supported, or tenant-specific? | A bill cycle in `cloudfarmsqa` reads *"Bill Cycle Used To Import Odoo Invoices"*. If supported, it is a better ERP name than the ones we just removed. If tenant-specific, it must not appear. |

All three are Kristian questions, and all three are cheap to answer.

### 8.4 V1–V3, answered — 11 September 2026

**V1 — No FX conversion.** Confirmed. Each invoice carries its own currency and the
receivables tiles total *per currency*; nothing is converted to a base currency. The §8.2
draft copy was written to that line and stands.

> One trap for later: `bi_financial` in the billing DB does hold `dim_currency_rate` and
> an `fx_convert_minor()` helper. That is **for the BI extractor**, not for invoicing.
> Seeing it is not licence to claim "consolidated multi-currency reporting".

**V2 — "Accounting export" was overstated, and the site has been corrected.**

"KB economy" is **KeyBalance** — an *external vendor's* Danish billing/ERP product
(`dstnyapi.keybalance.dk`), i.e. **Dstny's ERP**. It is the same class of thing as Odoo
for Cloudfarms: one customer's system, not a product connector. The evidence:

- `platform/service-catalog.md:106` — the `key-balance` service is an *"adapter to the
  **external** Dstny 'KeyBalance' Danish billing/ERP"*, and `"KeyBalance" is the external
  vendor's product name`.
- That adapter is **not deployed**: configured only through gitignored cloud-config
  (`keybalance.yml`), *"not a container in any stack yml — no evidence of prod deployment"*.
- The export that *does* run lives in the billing DB: `keybalance_mapping` (1,846 rows) and
  `sku_mapping` (4,136 rows) map category/SKU/product to a KB **varenr** (item number);
  `bpmshare.key_balance` carries `Kontonr` / `BetalingsMåde` / `FakGebyrgr`.
- The output is a **CSV an operator downloads**, encoded ISO-8859-1 because KeyBalance
  expects Latin-1. `invoicepdf` *"does not itself write anything to KB economy"*.

So what is genuinely generic is the **mechanism**: a stored batch selects invoices and
produces a downloadable CSV, in bill-run and manual flavours. Pointing that file at a given
accounting system is mapping work — roughly 6,000 rows of it for the one target built so far.

**Fixed on the site:** the Supported-connectors chip that read `Accounting export` now
reads **`Invoice export (CSV)`**. Mapping to a specific ERP stays in the third tier, where
`ERP & accounting systems` already sits under *"integration patterns, not shipped
connectors"*. Built and verified; `Accounting export` returns zero hits across `dist/`.

**V3 — Odoo is tenant-specific.** Confirmed by you. It stays off the site. (It was never
added — it was only ever a candidate.)

**Net effect on §8.1:** the "last mile" story is unchanged and still strong, because the
four claims that carry it — OIOUBL, EAN/NemHandel, Betalingsservice and delivery
acknowledgement — are national standards implemented in `invoicepdf` itself, not
per-customer adapters. Only the fifth bullet needed correcting.

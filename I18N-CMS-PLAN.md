# ATSuite Website — CMS + i18n Implementation Plan

Status: **decisions resolved, ready to start Phase 0**
Drafted: 2026-09-02
Scope: add editor-managed copy (CMS) and multi-language support to the static marketing site.

---

## 1. Decisions

| # | Decision | Answer |
|---|----------|--------|
| D1 | Locales | **English, Danish, Polish** |
| D2 | Deployment | **Netlify** |
| D3 | Who edits | **Non-technical editor — no markup of any kind in editable fields** |
| D4 | Mock-UI strings | **Translate the labels.** Currency: see §1.2 |

### 1.1 Locale codes — settled

`dk` is the *country* code for Denmark; the language subtag for Danish is `da`. `hreflang="dk"` is invalid and Google silently ignores invalid values, which would waste most of the SEO benefit of translating.

**Decision: `da` everywhere** — path, `lang`, and `hreflang` all agree, so there is no mismatch to get wrong later.

| Locale | Path | `<html lang>` | `hreflang` |
|---|---|---|---|
| English | `/en/` | `en` | `en` + `x-default` |
| Danish | `/da/` | `da` | `da` |
| Polish | `/pl/` | `pl` | `pl` |

### 1.2 Currency in the mock UI

The hero mockup shows `€186,400`, `€206,595`, `€2.4M ARR`. Two separate questions hide in "maybe we could have currency":

1. **Number formatting** — genuinely differs: `186,400` (en) vs `186.400` (da) vs `186 400` (pl). Handled by making the amounts ordinary translatable fields, so the translator writes the correct local form. No engineering cost.
2. **Switching currency** to DKK/PLN — **not recommended.** It means picking exchange rates that go stale, and re-deciding them every time a number changes. EUR is credible in all three markets for European B2B SaaS, and the mockup is illustrative rather than a price list.

Default: keep EUR, localize the formatting. Overridable later without touching the build.

---

## 2. Current state

| Page | Translatable text nodes | Translatable attrs |
|------|------------------------:|-------------------:|
| `index.html` | 190 | 13 |
| `platform.html` | 130 | 13 |
| `cpq.html` | 96 | 13 |
| `billing.html` | 65 | 13 |
| `sales.html` | 63 | 13 |
| `subscription.html` | 57 | 13 |
| `about.html` | 44 | 17 |
| `contact.html` | 42 | 19 |
| `process.html` | 39 | 13 |
| `implementation.html` | 28 | 13 |
| `index-print.html` | 131 | 2 |
| **Total** | **885** | **142** |

Plus ~40 strings in `shared.js` (nav + footer templates).
**~1,070 translatable units total**, or ~940 excluding `index-print.html`.

Other relevant facts:

- No build step. 11 standalone HTML files + `styles.css` / `shared.css` / `subpage.css` / `shared.js`.
- Nav and footer are **client-side injected** by `shared.js` into `<div id="site-nav">` / `<div id="site-foot">` mount points. Crawlers that do not run JS see no navigation.
- JSON-LD (Organization + WebSite schema) is also injected by `shared.js`, with an English-only `description`.
- SEO is heavily invested: canonical, `og:*`, `twitter:*`, JSON-LD, `sitemap.xml`, `robots.txt`.
- **79 internal `href="*.html"` links** across pages + `shared.js` that will need locale-awareness.
- Contact form posts to `https://api.web3forms.com/submit` — third-party, no backend to change.
- Remote is **Bitbucket** (`git@bitbucket.org:bpm-micro/agree-tech-website.git`). Node v24 available locally.

### 2.1 Markup audit — how much of the copy contains inline tags

Because D3 rules out markup in editable fields, every translatable string was classified:

| Category | Count | Editor sees |
|---|---:|---|
| Plain text, no inline markup at all | ~461 | A plain text box. No work needed |
| Markup present but **decorative and outside the text** — `<span class="dot"></span>`, `<span class="arr">→</span>` | ~107 | A plain text box. Extractor keys only the text run and leaves the icon span in the template |
| **Markup wrapping words mid-sentence** | **18** | Needs handling — see below |

Those 18 are the entire problem surface, and they split three ways:

- **5 are code, not prose** (`platform.html`: `id : uuid`, `term : months`, `ramp : schedule`, `sla : tier`, `region : enum`, `partner_ref : str`). A schema diagram. **Excluded from translation entirely** — no keys, no editor exposure.
- **8 are label pairs**, all the same shape: a bold lead plus a short tail. `<b>6+ years</b> in production`, `<b>~100%</b> billing accuracy`, `<b>Built in EU</b> · GDPR-native`, plus `<span class="ev">USAGE · INGEST</span> 8,461 events / minute`. These become **two plain fields** ("Highlight", "Text") — no markup, and safe to reorder per language because they are labels, not sentences.
- **5 are real prose** needing emphasis inside a sentence:
  - `index.html` hero: `The all-in-one CPQ & <span class="accent">billing</span> platform for B2B SaaS.`
  - `index.html`: a paragraph with `<span class="em">financial precision…</span>`
  - `contact.html`: `<b>Please note:</b> we only reply to demo…`

For those five, the editor types `*asterisks*` in an ordinary text field and the build converts them to the right span. `The all-in-one CPQ & *billing* platform for B2B SaaS.` One convention, five fields, each with inline help text in the CMS. Word order stays free, which a positional split would not allow.

**Net effect: no editor ever sees an HTML tag, and the mechanism costs one small function in `build.js`.** This is a much smaller problem than it looked before the audit.

### Side finding, unrelated to i18n

`assets/og-default.png` is referenced as `og:image` / `twitter:image` by **10 pages but does not exist** in `assets/`. Every social share of this site currently renders without a preview image. Cheap to fix, and worth doing regardless of whether this plan proceeds.

---

## 3. Target architecture

```
src/                      # today's HTML, with data-i18n keys added
  index.html  cpq.html  platform.html  ...
  _nav.html   _foot.html      # lifted out of shared.js
content/
  en.json                 # { "index.hero.h1": "The all-in-one CPQ & *billing* platform…", … }
  da.json
  pl.json
build.js                  # ~150 lines
dist/                     # build output — this is what gets published
  index.html              # redirect stub → /en/
  en/index.html  en/cpq.html  …
  dk/index.html  dk/cpq.html  …
  pl/index.html  pl/cpq.html  …
  assets/  *.css  *.js
  sitemap.xml  robots.txt
admin/
  index.html  config.yml  # Decap CMS
netlify.toml
```

**Build-time, not runtime.** Each locale gets real static HTML at its own URL. The runtime alternative (fetch JSON, swap text with JS) is less work but costs indexable per-language URLs, ranks one language only, and flashes untranslated copy — a bad trade for a site whose SEO is this deliberate.

**Editing flow:**

```
editor opens /admin  →  edits labelled form fields
   →  Decap commits to `draft` branch
   →  Netlify builds  draft--<site>.netlify.app   (noindex)
   →  review on the real site, real layout
   →  merge draft → main  =  live
```

---

## 4. Phases

Each phase is independently shippable and leaves the site working.

### Phase 0 — Baseline & de-risking · **DONE**

- ✅ Locale codes settled: `/en/`, `/da/`, `/pl/` (§1.1).
- ✅ Baseline snapshot of all 11 pages + 4 assets taken, with a `sha256` manifest, for the Phase 1 byte-diff gate.
- ✅ `assets/og-default.png` created (1200×630, brand navy + cyan, legible logo lockup). Regeneration source and instructions in `tools/`. The 10 pages that referenced it now resolve.
- ⚠️ **Decap + Bitbucket investigated — result below. This is a blocking decision for Phase 5 only.**

#### Phase 0 finding: the CMS backend needs a decision

The risk flagged in §6 is real. Two facts from the Decap docs:

1. **Git Gateway does not support Bitbucket** — GitHub and GitLab only. Git Gateway was the mechanism that would have let an editor log in with an email and password *without* a git account and *without* write access to the repository. On Bitbucket that option does not exist.
2. **The Bitbucket backend requires every CMS user to have write access to the repository.** Its client-side `implicit` auth also expires after 1 hour, and the Decap docs warn this "can lead to data loss" if it expires mid-edit. Server-side auth via Netlify as OAuth provider avoids the 1-hour expiry, but not the repo-access requirement.

This collides directly with D3 (non-technical editor). The options:

| Option | Editor experience | Cost |
|---|---|---|
| **A. Move the repo to GitHub**, use Git Gateway + Netlify Identity | Email + password login. No git account, no repo access, no token expiry | A one-time repo migration, an org decision |
| **B. Stay on Bitbucket**, Bitbucket backend + Netlify server-side OAuth | Editor needs a Bitbucket account with `Repository/Write` on the site repo | No migration, but a marketer holds commit rights to the website source, and consumes a Bitbucket seat |
| **C. Stay on Bitbucket**, skip the CMS — edit `content/*.json` in git | Developer-only. Contradicts D3 | Zero — but does not deliver the CMS |

**Decision: Option A — move the repo to GitHub.**

Migration steps (`gh` CLI is not installed on this machine, so step 1 is manual):

1. Create an empty `agree-tech-website` repo under the target GitHub org — **org name still needed**. Do not initialise it with a README, or the push in step 3 will conflict.
2. `git remote add github git@github.com:<org>/agree-tech-website.git`
3. `git push github --all && git push github --tags`
4. Repoint the Netlify site at the GitHub repo (Site configuration → Build & deploy → link to a different repository).
5. Keep Bitbucket as an archived mirror, or retire it — team's call.

**This does not block Phases 1–4.** The build pipeline, key extraction, and multi-locale output are all independent of which git host the CMS authenticates against.

---

### Phase 1 — Introduce a build step, change nothing visible · **DONE**

- ✅ 11 pages moved to `src/` with `git mv`, so history follows them.
- ✅ `build.js` written — `src/*.html` → `dist/*.html`, plus `assets/`, the three CSS files, `shared.js`, `robots.txt`, `sitemap.xml`.
- ✅ `npm run build` / `verify` / `dev` / `clean` added to `package.json`; `dist/` gitignored.
- ✅ **Gate passed: `identical : 15/15`, dist/ is byte-identical to the pre-build site.**
- ✅ Rendered `dist/index.html` in headless Chrome — nav injects, mega menu, hero, mock UI and value strip all correct, relative asset paths resolve.

**Non-obvious constraint found:** every source file uses **CRLF line endings with no BOM**. Any tool in the pipeline that normalizes line endings silently rewrites all 11 pages and destroys the byte-diff gate. `build.js` round-trips pages as utf8 strings (Node does not translate line endings) and copies static files as raw bytes.

The gate lives in `tools/verify-baseline.js` against `tools/baseline.sha256`, captured before the build step existed. It exits non-zero, so it can gate CI.

**Note for Phase 2:** lifting nav/footer into the markup deliberately changes the output, so this byte-gate stops applying to those pages at that point. It is replaced by a DOM-level comparison — see Phase 2.

---

### Phase 2 — Lift nav/footer/JSON-LD out of `shared.js` · **DONE**

- ✅ `src/_nav.html`, `src/_foot.html`, `src/_jsonld.html` created; `build.js` inlines them.
- ✅ Nav theming (`{{topbarDark}}`, logo variant, button classes) and active-link marking now resolve at build time. `build.js` reads `window.AT_PAGE` / `window.AT_NAV_DARK` from each page's existing script line, so pages still declare their own intent.
- ✅ `shared.js` cut from **188 lines to 45** — mega-menu hover only.
- ✅ **Gate passed: `identical DOM : 11/11`.**

The byte-diff gate stops applying here by design, so it is replaced by `tools/verify-dom.js`: every page is rendered twice in headless Chrome — once from the pre-change baseline, once from `dist/` — and the post-JavaScript DOM is compared. Indentation and JSON-LD formatting are canonicalized, since those legitimately differ; anything structural fails the build. All 11 pages match.

**The SEO win, measured in raw HTML source (what a non-JS crawler sees):**

| Page | Links before | Links after |
|---|---:|---:|
| `about.html` | 2 | 28 |
| `cpq.html` | 4 | 30 |
| `platform.html` | 4 | 30 |
| `index.html` | 12 | 38 |

JSON-LD went from absent in source to present. Previously all of this existed only after `shared.js` ran.

---

### Phase 3 — Extract keys into `content/en.json` · ~1 day

Write `extract.js` (a one-shot tool, not part of the build) that walks each `src/*.html`, assigns a key to every translatable node, rewrites the file with `data-i18n` attributes, and emits `content/en.json` from the existing copy.

Key naming, derived from document structure:

```
index.hero.eyebrow
index.hero.h1
index.hero.lede
index.hero.cta.demo
platform.integration.h2
nav.solutions.cpq.title
foot.tagline
```

Attributes use a separate syntax: `data-i18n-attr="content:index.meta.description"`.

**Three things this phase must get right:**

1. **Every value in `content/*.json` is plain text (D3).** Per the audit in §2.1, this is achieved by handling three cases:
   - Decorative spans (`<span class="dot"></span>`) stay in the template; only the text run gets a key.
   - The 8 label pairs become two keys each (`…highlight` + `…text`).
   - The 5 prose-emphasis strings use an `*asterisk*` convention that the build maps to `<span class="accent">`, `<span class="em">`, or `<b>` depending on the target element.

   The build **rejects any value containing `<`** — a hard failure, so markup cannot leak into the site through the CMS even by paste.

2. **Triage, do not extract blindly.** Three buckets: *translate* (prose, labels, CTAs), *leave as-is* (brand and product names — "ATSuite", "Agree Technologies" — plus the `platform.html` schema diagram), *format-only* (mock-UI amounts, see §1.2). Bucket 2 gets no key at all.

3. **Human review pass.** ~940 auto-generated keys will include bad splits and junk. Budget real time to read `en.json` top to bottom — this is the phase's real cost, not the tooling.

**Done when:** `dist/` still renders byte-identically, built entirely from `en.json` plus keyed templates.

**Risk:** highest of any phase. Mitigated by the byte-diff gate — if the English build does not reproduce the current site exactly, extraction is wrong.

---

### Phase 4 — Multi-locale build · ~4h

Locales: `en` → `/en/`, `da` → `/dk/`, `pl` → `/pl/` (see §1.1).

- `build.js` loops locales, writes `dist/<path>/*.html`.
- Rewrite the 79 internal links to be locale-relative (`href="contact.html"` → `/dk/contact.html`).
- Per-page `<html lang>` (`en` / `da` / `pl`), `hreflang` alternates (`en`, `da-DK`, `pl`) plus `x-default` → `/en/`, per-locale `canonical`.
- Per-locale `sitemap.xml` entries — 30 URLs total.
- Language switcher in `_nav.html`, linking to the *current page* in each other locale (not to the homepage — a common and annoying bug).
- `dist/index.html` root: static redirect to `/en/`, not JS language sniffing, which is unpredictable for crawlers.
- Missing key in a non-English locale falls back to English **and warns**; never render an empty element or a raw key.
- Translate the JSON-LD `description` per locale too — it is currently English-only inside `shared.js`.

**Done when:** all three locales build, `/dk/` and `/pl/` render English fallback copy everywhere, no broken internal links, `hreflang` validates.

---

### Phase 5 — Decap CMS · ~3h

- `admin/index.html` + `admin/config.yml`.
- One `files` collection per page per locale (11 pages × 3 locales), fields grouped and human-labelled — an editor sees "Hero headline", not `index.hero.h1`.
- All fields are `string` or `text` widgets. **No `markdown`/rich-text widget anywhere** — that is what would reintroduce tags, which D3 rules out.
- The five emphasis fields get `hint:` text explaining the `*asterisk*` convention.
- Character-count hints on headline fields, since Danish and Polish run longer (see Phase 7).
- Backend: **depends on the Phase 0 decision** — `git-gateway` + Netlify Identity if the repo moves to GitHub (Option A), `bitbucket` with server-side OAuth if it stays (Option B). Either way, `branch: draft` so edits never touch `main`.
- Do **not** use `auth_type: implicit` — its 1-hour token expiry can lose an editor's work mid-edit.

**Done when:** an editor can change a headline at `/admin` and the change lands as a commit on `draft`.

**Note:** Decap's built-in preview pane is near-useless for flat string collections — it renders form fields, not the page. The staging URL from Phase 6 is the real preview. Do not sell the side pane to editors.

---

### Phase 6 — Netlify + staging · ~2h

The site is already on Netlify, so this is configuration rather than migration — the main change is that Netlify starts running a build instead of serving the repo root.

- `netlify.toml`: build command, publish `dist/`.
- Production site builds `main` → `agree-tech.com`.
- Branch deploy builds `draft` → `draft--<site>.netlify.app`.
- **Staging must emit `noindex` and skip canonical/sitemap** — key off Netlify's `CONTEXT` env var in `build.js`. Easy to forget, and forgetting it means Google indexes duplicate content.
- Cut over DNS only after Phase 7 QA.

**Why Netlify:** Cloudflare Pages builds from GitHub/GitLab only. Netlify supports Bitbucket. If the repo ever moves to GitHub this constraint disappears.

**Optional upgrade:** Decap `editorial_workflow` plus per-PR deploy previews gives a draft/review/ready board and a URL per change. Verify it works on the Bitbucket backend before promising it to editors; the `draft`-branch setup above is the fallback that always works.

---

### Phase 7 — Translation & QA · content work, not engineering

**Volume: ~940 strings × 2 target languages = ~1,880 strings to translate.** This is the largest single cost in the project and it is not engineering time. Worth deciding early whether it goes to an agency (export `en.json`, hand back `da.json` / `pl.json`) or is done in the CMS by native speakers.

- QA per locale:
  - **Layout overflow.** Danish and Polish both run longer than English — Polish noticeably so. Highest-risk spots: the hero `<h1>`, the four nav items, and button labels like "Book a demo" / "Talk to an expert", which sit in a fixed-width nav bar.
  - No leaked `*asterisks*` or stray `<` (the build fails on the latter).
  - No untranslated English leaking through the fallback — the build's missing-key warnings are the checklist.
  - `hreflang` validates across all three locales.
- Polish needs `pl` typography checked: it uses a space as the thousands separator, which affects the mock-UI amounts.

---

### Phase 8 — Cutover · ~1h

- Point production at the built output.
- Verify `sitemap.xml`, `robots.txt`, and redirects from the old flat URLs (`/cpq.html` → `/en/cpq.html`) — **301, kept permanently**; those URLs have accumulated ranking.
- Resubmit the sitemap in Search Console.

---

## 5. Effort summary

| Phase | Estimate |
|-------|---------:|
| 0 Baseline & de-risking | 1h |
| 1 Build step | 3h |
| 2 Nav/footer lift | 2h |
| 3 Key extraction | 1 day |
| 4 Multi-locale | 4h |
| 5 Decap CMS | 3h |
| 6 Netlify + staging | 2h |
| 7 Translation QA (engineering side) | 3h |
| 8 Cutover | 1h |
| **Engineering total** | **~3 days** |

**Not included: translating ~1,880 strings into Danish and Polish.** That is the larger cost and it is content work — see Phase 7.

---

## 6. Open risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| ~~Decap's Bitbucket backend behaves differently from the documented GitHub path~~ | — | **Confirmed in Phase 0, and worse than expected: Git Gateway does not support Bitbucket at all.** Now an open decision, not a risk — see Phase 0 finding. Blocks Phase 5 only |
| Translation volume (~1,880 strings) stalls the project | Site ships with two empty locales | English fallback means a half-translated site still works and is never broken. Ship locales independently rather than waiting for all three |
| Extraction produces subtly wrong English output | Regression on the live site | Byte-diff gate at the end of Phase 3 |
| URL structure change loses SEO | Ranking loss | Permanent 301s from all 10 flat URLs, sitemap resubmission |
| Danish/Polish text overflows fixed-width nav and buttons | Visual breakage | Character-count hints in the CMS, explicit QA pass in Phase 7 |

*Resolved since first draft:* the inline-HTML risk was the top concern, but the §2.1 audit reduced it to 5 fields using an `*asterisk*` convention, with the build hard-failing on any `<` in a value.

---

## 7. Explicitly out of scope

- `index-print.html` (131 strings) — `Disallow`ed in `robots.txt`, stays English-only unless asked.
- Blog, or CMS-managed *pages*. This plan makes existing copy editable; it does not add a content model for creating new pages.
- Translating the web3forms contact form's confirmation emails.
- Redesign of any kind. English output should be visually identical to today.

---

## 8. Alternatives considered

| Approach | Why not |
|----------|---------|
| **Client-side i18n** (`data-i18n` + `fetch` at runtime, no build) | Least work, but one indexable language, no per-locale URLs, flash of untranslated content. Rejected on SEO grounds |
| **Astro** with built-in i18n routing | Better long-term home — real layouts, kills the duplicated inline `<style>` blocks. But it means converting 11 pages of hand-tuned markup, so a day-plus more work. Reasonable upgrade path later; the `content/*.json` files carry over unchanged |
| **Headless CMS** (Contentful, Storyblok, Sanity) | Monthly cost, heavier setup, and still needs the same build step. Overkill for ~1,000 static labels |

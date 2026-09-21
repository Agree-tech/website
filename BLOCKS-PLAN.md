# ATSuite Website — Component CMS Implementation Plan

Status: **Phases 0–5 done. Text, structure, media and preview all work in
Payload, and the CMS exports back to git. What remains is retiring Decap and
deciding where this runs.**
Drafted: 2026-09-04
Scope: give an editor real control over every page — reorder, add, remove and
configure sections, manage links and images, and preview — built on a palette of
reusable components rather than 51 one-off layouts.

---

## 1. Decisions

| # | Decision | Answer |
|---|----------|--------|
| D1 | CMS | **Payload 3.88**, headless. Editors work in Payload; `build.js` still renders static HTML to Netlify. |
| D2 | Database | **Postgres.** Not a preference — see §2.3. |
| D3 | Rendering | **Stays in `build.js`.** Pages are not rewritten as React. |
| D4 | Editor reach | **Every page**, homepage included. No page is developer-only. |
| D5 | Component strategy | **Consolidate first, then compose.** Build the palette by normalising existing markup, not by inventing new layouts. |
| D6 | Acceptance | **Byte-identity** against today's output, at every phase, until the palette is complete. |

### 1.1 The principle that reconciles D4 and D5

Reusable components and per-page control sound like opposites. They are not, and
the distinction that dissolves them is **how many props a component exposes**,
not whether it is a component.

- `CtaBand` takes four props and belongs on any page. Ten blocks collapse into it.
- `CFODashboard` has 38 content slots and only makes sense on the homepage.

Both are blocks. Both can be reordered, hidden, duplicated and edited. The second
simply cannot be meaningfully *reconfigured*, because its layout is the design.
An editor is never blocked from managing a page; they are only prevented from
rebuilding a bespoke visual into something it was never drawn to be.

That is the whole reconciliation: **everything is a block, so every page is
manageable; the palette is where reuse pays, and bespoke visuals stay bespoke.**

---

## 2. Current state

### 2.1 What is already built and proven

Phase 0 and 1 are complete and verified in the repository:

| Capability | State |
|---|---|
| Content in Payload | 66 globals, 950 localized fields, en/da/pl |
| Static build from Payload | `npm run build:payload` — byte-identical output |
| Pages cut into blocks | 51 blocks + `content/layout.json`, reassembles byte-identically |
| Static build from blocks | `npm run build:blocks` — byte-identical output |
| Both together | `--from-blocks --from-payload` — byte-identical output |
| Reordering | Demonstrated: editing `layout.json` moves the section in `dist/` |
| Acceptance gate | `npm run verify:parity`, 62 files compared |

### 2.2 Block inventory

51 blocks, 2,164 lines of markup, 853 content keys, 53 links, 4 images.

Grouped by section class, which is mechanical rather than a judgement call.
"Distinct" counts markup skeletons after content bindings are normalised away.

| Family | Blocks | Distinct | Verdict |
|---|---:|---:|---|
| `cta-band` / `cta-band-dark` | 10 | 6 | Consolidates — see §2.3 |
| `page-hero` / `page-hero-dark` | 9 | 8 | Shared frame, 6 carry a bespoke mock |
| `split-section` (all variants) | 21 | 21 | Mixed — breaks down below |
| Homepage sections | 11 | 8 | Bespoke visuals; 4 shared with `index-print` |
| **Total** | **51** | **43** | |

The 21 `split-section` blocks break down as: **5** feature grids (`f3` ×6),
**3** photo/value grids, **3** mock-card rows, **2** integration grids, and
**8** prose variants.

Target: **7 components + 11 bespoke visuals**, covering all 51 blocks.

### 2.3 Evidence that consolidation is real, not hopeful

The families look distinct only because nothing has ever been normalised. The
actual differences, measured:

- **The five feature grids differ by one accent colour.** With content and inline
  SVG icons held aside, `billing`, `cpq`, `process`, `sales` and `subscription`
  are the same markup apart from `acc-cyan` / `acc-green` / `acc-navy` and a
  matching `style` on one `<span class="dot">`. That is a single `accent` prop.
- **The CTA bands differ by** an inline `style="max-width:760px"`, one instance
  omitting its `<p>`, the second button pointing at `platform.html` versus
  `index.html`, and whitespace. Three props.
- **`index` and `index-print` share four sections** whose markup is identical and
  whose content keys differ — which is the definition of one component used twice.

None of these are design decisions to relitigate. They are props waiting to be
lifted, and that is why Phase 2 is mechanical work guarded by a byte gate rather
than a redesign.

### 2.4 The database constraint, recorded so it is not rediscovered

Payload stores a global's fields as columns on one table, and a localized global
keeps them in a companion `_locales` table read through

```sql
json_group_array(json_array("col1", "col2", …, "_locale"))
```

— one argument per column. **Postgres caps function arguments at 100**
(`FUNC_MAX_ARGS`, compile-time, error `54023`); **SQLite caps them at 127**. The
homepage has 183 translatable strings, so as a single global it cannot be read
back on either database.

This is why content is modelled as **one global per section**, not per page, and
why SQLite was abandoned. It also sets a hard ceiling for Phase 2: **no block may
exceed 99 fields.** The widest today is 42.

### 2.5 What an editor can do

§2.1 to §2.4 describe the state this plan was written against, and are left as
drafted. This table is kept current.

| | Today |
|---|---|
| Edit any text, 3 languages | ✅ in the block, where the section is |
| Reorder / hide / duplicate sections | ✅ drag in the page's layout |
| Add a card to a grid | ✅ an array row |
| Change where a button goes | ✅ a select over every page |
| Upload or swap an image | ✅ Media collection; build copies uploads to `dist/assets/` |
| Add a section from scratch | ✅ for the seven reusable components |
| Preview before publishing | ✅ Preview button, rendered by the build itself |
| Build a new page | ❌ — needs a slug, nav entry, sitemap and hreflang |

Each was verified by doing it against the running CMS and watching the built
site change, not by reading the schema.

---

## 3. Target architecture

```
cms/                          Payload + Postgres — the editor's world
  src/
    blocks/                   one Payload block config per component
    collections/Pages.ts      page = ordered list of block instances
    collections/Media.ts      uploads
    globals/Settings.ts       nav, footer, JSON-LD
  app/(payload)/preview/      live preview route

components/                   ONE html template per component, with slots
  cta-band.html   page-hero.html   feature-grid.html   …
  visuals/                    bespoke: cfo-dashboard.html, q2c-board.html, …

build.js                      renders page = Σ component(props, content)
dist/                         unchanged output, still static, still Netlify
```

`blocks/` and `shell/` from Phase 1 are **scaffolding**. They hold one file per
*instance*; Phase 2 replaces them with one file per *component* plus per-instance
props. `content/layout.json` grows from a list of names into a list of block
instances.

---

## 4. The component palette

Seven components absorb 40 of the 51 blocks. Props are derived from the actual
differences between existing instances — nothing is invented.

| Component | Absorbs | Props | Content slots |
|---|---:|---|---|
| `CtaBand` | 10 | `tone`, `narrow`, `showBody`, 2 × link | 4–5 |
| `PageHero` | 9 | `tone`, `visual` (none \| named), 0–2 × link | 3–35 |
| `SplitProse` | 8 | `side`, `alt`, `visual` | 8–16 |
| `FeatureGrid` | 5 | `accent`, cards[] | 2 + 3/card |
| `PhotoGrid` | 3 | `people[]`, `shape` | 3/person |
| `MockCardRow` | 3 | `cards[]` (3–5) | 3 + 2/card |
| `IntegrationGrid` | 2 | `accent`, logos[] | 2 + 4/logo |
| **Subtotal** | **40** | | |

The remaining **11 blocks are bespoke visuals** — the homepage hero mock, the Q2C
board, the module grid, the CFO dashboard, the quote carousel, the innovate
forecast, and the contact form. Each becomes a component with content slots and
no layout props: still reorderable, hideable and duplicable, just not
reconfigurable.

`PageHero`'s six mock variants and `SplitProse`'s inline diagrams are handled by
a `visual` prop that names a fragment in `components/visuals/`, so the frame is
shared even where the picture is not.

### 4.1 Repeating children become arrays

This is what turns "6 cards forever" into "add a card":

| Pattern | Instances | Count today |
|---|---:|---|
| `f3` feature card | 5 blocks | always 6 |
| `crm-card` | 2 blocks | 4 |
| `mock-card` | 3 blocks | 3, 4, 5 |
| `board` photo | 1 block | 4 |
| `imp-step` | 1 block | 4 |
| `inn-stat` | 2 blocks | 3 |

Each becomes a Payload `array` field. **This also solves the 99-field ceiling**:
an array is a separate table, so a block with 6 cards is no longer 20 columns on
one row.

### 4.2 Links and images

53 links and 4 images are currently frozen in markup. Both become fields:

- **Link** = `{ label, destination }`, where destination is a select over the 11
  internal pages plus "external URL" and "anchor on this page". 72 of the 79
  `<a>` tags already have an editable label; only the destination is missing.
- **Image** = a Payload `upload` relation to `Media`, with alt text localized.
  Only 7 assets exist today, so the migration is trivial and the value is future
  uploads.

---

## 5. Phases

Each phase ends with a gate that must pass before the next begins.

### Phase 0 — Content into Payload ✅ done

Gate: `npm run verify:parity` — 62 files byte-identical.

### Phase 1 — Pages cut into blocks ✅ done

Gate: `node tools/extract-blocks.js` round-trip + `build:blocks` parity.

### Phase 2 — Consolidate into components ✅ done

All 51 blocks are component instances; `blocks/` is empty and every entry in
`content/layout.json` carries its component, props and content keys.

**22 components.** Nine are reused and absorb 38 blocks; thirteen are used once.

| Component | Instances | | Component | Instances |
|---|---:|---|---|---:|
| `cta-band` | 10 | | `q2c-board` | 2 |
| `page-hero-split` | 6 | | `module-grid` | 2 |
| `split-prose` | 6 | | `innovate-forecast` | 2 |
| `feature-grid` | 5 | | 13 single-use | 13 |
| `page-hero` | 3 | | | |
| `integration-grid` | 2 | | **Total** | **51** |

The thirteen single-use ones are the hand-drawn sections — the homepage hero and
CFO dashboard, the contact form, the board and team grids. Converting them wins
no reuse and was never meant to: it makes every section a block of the same kind,
so Phase 4 can hand Payload one block type per component and an editor gets the
same add/reorder/remove handling everywhere. A section that cannot be
reconfigured can still be moved, hidden or duplicated.

`tools/components.js` is the renderer: `{{slot:}}` for a content key,
`{{prop:}}` for a literal, `{{include:}}` for a whole bespoke fragment,
`{{#each}}` over an array whose items also see the block's props, and a flat
`{{#if}}/{{else}}` that *refuses* to nest rather than mis-parsing.

`tools/extract-blocks.js` now refuses to run without `--check`: it would rewrite
`layout.json` from `src/` and replace all 51 instances with bare names.

**Byte-exactness: 45 of 51.** The six that differ are whitespace only, all from
the CTA and feature-grid families, and the DOM gate passes 11/11.

#### The gate had to change here, and why

Byte-identity does not survive this phase, for an honest reason: the whitespace
inside `<div class="ctas">` is formatting drift, not design. Four instances put
both buttons on one line, six put them on separate lines, and it correlates with
nothing. Encoding that as a prop would make a hand-editing accident part of the
component's API.

So the gate becomes `tools/verify-dom.js` — render both versions in headless
Chrome and compare the resulting DOM. **CtaBand passes 11/11.**

**One trap worth recording.** Whitespace between the buttons is only safe to
change because `.cta-band-dark .ctas` is `display: flex`, where it collapses.
The *light* variant on `index` and `index-print` has **no `.ctas` rule at all**
— those anchors are inline-block, so the whitespace between them renders as a
real gap. Both light instances are multi-line today, which is why the component's
canonical form is multi-line: it is the only form that is simultaneously
whitespace-safe for flex and gap-preserving for inline-block. Collapsing to one
line would have silently closed a gap on the homepage.

Every later family needs the same check before its whitespace is touched.
`FeatureGrid` needed it too: `sales` puts each card on one line where the other
four spread them over five. Safe there because `.f3` is a plain block container
whose children are all block-level, so the whitespace never rendered.

#### Bugs the consolidation surfaced

Normalising markup means reading all of it, which turns up things nobody was
looking for. Found so far, **not fixed** — fixing them changes output, which is
Phase 3's business, not Phase 2's:

- **`cpq`, sixth feature card:** the label is the literal string `06 · I18N`
  where every other card on the site has a content key. It is not in
  `content/`, so it cannot be translated and renders as English on the Danish
  and Polish pages. Preserved verbatim and carried as a `labelText` prop, so it
  is at least visible in the data instead of buried in markup.

### Phase 3 — Arrays, links and media ✅ done

| | State |
|---|---|
| Arrays | feature-grid cards, split-prose paragraphs, integration-grid bullets/cards/tags, board members |
| Links | 33 `href`s are props |
| Media | Payload `Media` collection; the build copies uploads into `dist/assets/` |

Media is fetched at build time and written beside the committed files, so a page
refers to `/assets/<name>` whichever it came from and the deployed site never
depends on the CMS being reachable. A name already in `assets/` is left alone —
the repository wins, so an upload cannot replace a stylesheet. Verified by
uploading an image, watching it reach `dist/assets/`, and confirming a colliding
name did not overwrite the repository's copy.

#### The point of no return was not one

§6.2 predicted this phase ends byte-identity. It did not, and the reason is
worth keeping: the *plumbing* is byte-neutral, and only a real content change
moves a pixel. Making the cpq label translatable produced identical pages,
because an untranslated locale falls back to English — which is exactly the
string that had been hardcoded. Uploaded media changes nothing until a page
points at it. So the gate stayed, and kept earning its keep.

#### Two bugs the phase surfaced

- **`payload.updateGlobal` copies English into every locale.** It reads the
  document before writing, that read resolves an untranslated field to the
  default locale, and the merged result is stored. Any field added after the
  first seed silently became "translated" in all three languages — coverage
  would have reported 100% while Danish readers saw English. The seed passes
  `fallbackLocale: 'none'` now. Caught by `verify:parity`, not by inspection.
- **`sed -i` rewrites a CRLF file as LF.** One edit to `src/cpq.html` changed
  every line ending and moved 262 bytes of output. Edits to CRLF files now go
  through a script that asserts the line-ending count is unchanged.

#### Still untranslated

`cpq.split-section.div-06-i18n` ("06 · I18N") exists in English only, so da and
pl report 827/828 and fall back. It needs a translation — a content decision,
not a code one.

### Phase 4a — Payload block schema ✅ done

A `Pages` collection whose `layout` is a `blocks` field over 22 generated block
types, one per component, seeded from `content/layout.json`. Under
`--from-blocks --from-payload` the build reads structure *and* strings from the
CMS, so a build is a consistent snapshot of one source rather than a mix.

Props became fields worth having: `dark` and `narrow` are checkboxes, accent and
button styles are selects over the values in use, and every `href` is a select
over all eleven pages rather than only the destinations currently linked — an
editor pointing a button somewhere new should not need a developer.
Markup-bearing props (icons, inline styles, the name of a bespoke visual) are
read-only, because they are not things to type into a box.

`verify:parity` now builds both sides composed, so it covers layout as well as
content. Verified beyond the gate by reordering the process page through the API
and watching the rendered section order follow.

Each page is now a readable list of sections in the sidebar:

```
Homepage      home-hero · q2c-board · module-grid · cfo-dashboard ·
              quote-carousel · innovate-forecast · cta-band
Platform      page-hero-split · split-prose ×5 · cta-band
Contact       page-hero · contact-form
```

### Phase 4b — Content into the blocks ✅ done

Every block carries its words in a **Text** group, one localized field per slot,
so a section is edited where the section is. The build reads them back under the
key each slot came from and flattens to the same `page.section.field` map as
before, which is why `localize()`, the fallback rule, the coverage gate and the
parity gate all kept working untouched. 62/62 identical, and a Danish edit made
through the API reaches the Danish page while English stays put.

**The globals do not go.** Page metadata, the nav and footer, and the text baked
into the hand-drawn visuals are not slots — 286 keys legitimately stay there.
Where a block *does* own a key the block wins, and clearing a field deletes the
key rather than falling through to the global's value. Otherwise clearing a
Danish translation would show a stale string nobody could find.

#### Structure follows English, never the current locale

Whether a CTA band has a paragraph is a property of the band, not of the language
being rendered. If "empty" meant both "no paragraph here" and "not translated
yet", a missing Danish translation would delete the element from the Danish page
instead of falling back. So the build decides structure from the English text and
nothing else.

#### Two bugs, both found by measuring

- **Writing the layout once per locale destroys it.** A blocks field written
  without its ids is replaced wholesale, so seeding three languages in sequence
  left one English row, nine Polish and no Danish at all. English is written
  first now, and the other locales reuse the ids Payload assigned.
- **The twenty-second queries were a blocked prompt.** Payload's dev schema push
  asks for confirmation before dropping a column, and a detached server has no
  terminal to answer, so every request hung until the client gave up — the
  server was reporting when the *client* disconnected. Postgres was answering in
  5 ms throughout, and the same query runs in 0.6 s with all 348 localized
  fields. A whole restriction had been built on that false reading and was torn
  back out. Resetting the database before a destructive schema change avoids the
  prompt; `npm run db:reset` does it.

### Phase 4c — Git as the record of what shipped ✅ done

    npm run export          # write the CMS back to content/ and layout.json
    npm run verify:export   # report drift, exit 1 — the CI form

Editing happens in the database; these files are what deployed. The export writes
exactly what the build reads, so `git log` still answers who changed a line, a
content change is a reviewable diff, and a rollback is `git revert`.

**Gate:** after a clean seed the export reproduces all 40 content files byte for
byte, and a build from the re-exported layout is byte-identical to one from the
original.

`layout.json` was reformatted once — it had grown three key orders as it was
migrated family by family — so a real change shows in a diff instead of drowning
in churn. Not wired to a Payload hook: committing from the server needs git
credentials wherever Payload runs, which is a deployment decision.

### Phase 5 — Preview ✅ done

A Preview button on each page opens `/preview?page=…&locale=…`, which calls the
build's own `renderOne`. Same templates, same components, same substitution, same
hreflang and robots decisions — preview and production cannot drift.

**Gate:** all 31 locale/page combinations come back byte-identical to what the
build writes.

**Not live-as-you-type, on purpose.** Payload's live preview streams the document
to an iframe for the browser to render, which would need this whole pipeline in
the browser — a second renderer, and a second answer to what the page says. Save
and look is slower and honest.

Two things this turned up:

- Assuming every locale is indexable gave `index-print` a Danish alternate it
  does not have. `renderOne` repeats the coverage arithmetic rather than
  approximating it.
- The asset passthrough first confined reads to the repository, which sounded
  safe and was not — the repository also holds `cms/.env` and `.git`. It serves
  an allowlist now: four stylesheets and `assets/`.

### Phase 6 — Retire Decap

Delete `admin/`, the Decap config generator's YAML emitter, and the Netlify
Identity dependency. `tools/cms-config.js` keeps `buildModel()`, which by then
feeds only Payload.

---

## 6. Effort and risk

| Phase | Effort | Risk |
|---|---|---|
| 2 — Consolidate | ~1.5 weeks | **Highest.** Mitigated entirely by the byte-identity gate. |
| 3 — Arrays, links, media | ~1 week | Low. Additive. |
| 4 — Block schema | ~4 days | Low. Layout already externalised. |
| 5 — Preview | ~3 days | Low. Renderer already exists. |
| 6 — Retire Decap | ~1 day | Low. |

**Total: roughly 4 weeks.**

### 6.1 The risk worth naming

Phase 2 touches the markup of every page, including the homepage's 1,504 lines of
hand-built mock UI. Byte-identity makes a regression *impossible to ship
silently*, but it does not make the work small, and it does not help if a
component's props are drawn too tightly and a later page needs a variant.

Mitigation: consolidate a family only when it has **three or more** members, and
leave two-member families alone. `IntegrationGrid` in §4 is borderline
and can be deferred without affecting anything else.

### 6.2 What byte-identity stops protecting

Once Phase 3 lets an editor add a card or change a destination, output stops
being byte-identical **by design**. The gate must then change from "identical" to
"identical when the data matches today's data" — a seeded fixture build. That
switch happens at the start of Phase 3 and is the point of no return; everything
before it is reversible.

---

## 7. Open questions

1. **Source of truth for layout.** Phase 4 moves page composition into Postgres.
   Content history then lives in the database, not git. Worth deciding whether
   Payload should also write back to `content/` on publish, keeping git as the
   record of what shipped.
2. **Who may restructure.** Reordering the homepage is a marketing decision with
   design consequences. Payload roles can separate "edit text" from "change
   layout"; worth deciding before inviting editors in.
3. **New pages.** Phase 4 makes a new page possible. It also needs a slug, nav
   placement, sitemap entry and hreflang set — none of which are automatic today.
4. **`index-print`.** It shares four sections with the homepage but is English
   only and `noindex`. Once both are block-composed, it could become a print
   *view* of the homepage rather than a second page. Out of scope, worth noting.

/**
 * content-source.js — where build.js gets its strings.
 *
 * Two implementations behind one shape: a flat map of `page.section.field` to
 * string, exactly what the templates were written against. Everything
 * downstream of this — rendering, fallback, coverage, hreflang, the sitemap —
 * is indifferent to which one produced it, which is what made moving the
 * content into a CMS a change to one function rather than to the build.
 *
 * A key absent from the map means "not translated in this locale". Both
 * sources must express that the same way: on disk the key is missing from the
 * JSON, and over HTTP the request carries fallback-locale=none so Payload
 * returns nothing rather than quietly substituting English. Getting that wrong
 * does not fail the build — it reports every locale as fully translated and
 * indexes machine-copied English at three URLs.
 */

const fs = require('fs');
const path = require('path');
const { templateOrder, sortPage } = require('./cms-config.js');

/**
 * Content keys are [a-z0-9-]; Payload field names are SQL columns and cannot
 * hold a hyphen. Underscore never appears in a content key, so the swap is
 * exactly reversible and needs no lookup table. cms/scripts/generate-globals.mjs
 * holds the other half of this pair.
 */
const fromIdent = (name) => name.replace(/_/g, '-');

/** Payload's own bookkeeping, not content. */
const RESERVED = new Set(['id', 'updatedAt', 'createdAt', 'globalType', '_status']);

/**
 * Content is stored one file per page, one object per section, so that the CMS
 * can present navigable entries instead of a single 950-field form. The build
 * wants none of that structure — it wants the flat page.section.field keys the
 * templates were written against — so the shape collapses on load.
 *
 * Blank values are dropped rather than kept. A field that is cleared can be
 * saved as an empty string; treating that as translated would publish a blank
 * element instead of falling back to English, and would report the locale as
 * further along than it is.
 */
function fromDisk(contentDir, code) {
  const dir = path.join(contentDir, code);
  if (!fs.existsSync(dir)) return {};

  const flat = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const page = file.replace(/\.json$/, '');
    const sections = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const [section, fields] of Object.entries(sections)) {
      for (const [field, value] of Object.entries(fields)) {
        if (typeof value !== 'string' || !value.trim()) continue;
        flat[`${page}.${section}.${field}`] = value;
      }
    }
  }
  return flat;
}

/**
 * Which globals to ask for, read from the templates rather than from content/.
 *
 * The placeholders are the only authority on what the site actually renders, so
 * deriving the list from them means the build fetches exactly what it needs and
 * keeps working after content/ is deleted — which is the point of moving the
 * content into a database. A section in Payload that no template references is
 * never requested; a placeholder with no global behind it surfaces as a missing
 * key, which the build already reports and fails on for English.
 */
function payloadSections(srcDir) {
  const seen = new Map();
  for (const key of templateOrder(srcDir).keys()) {
    const [page, section] = key.split('.');
    if (!page || !section) continue;
    seen.set(`${page}.${section}`, { page, section, slug: `page-${page}-${section}` });
  }
  return [...seen.values()];
}

async function fetchSection(baseUrl, { slug }, code) {
  // fallback-locale=none: see the note at the top of this file.
  const url = `${baseUrl}/api/globals/${slug}?locale=${code}&depth=0&fallback-locale=none`;
  const res = await fetch(url);
  if (res.status === 404) return {}; // a section the CMS does not know about
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);

  const doc = await res.json();
  const fields = {};
  for (const [name, value] of Object.entries(doc)) {
    if (RESERVED.has(name)) continue;
    if (typeof value !== 'string' || !value.trim()) continue;
    fields[fromIdent(name)] = value;
  }
  return fields;
}

/** Bounded concurrency: ~200 requests per build, and a dev server is one process. */
async function pool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

/**
 * Fetching is concurrent, assembly is not.
 *
 * Whichever response arrives first must not decide the order of the map, or the
 * build stops being reproducible: the rendered pages are unaffected — they are
 * substitution, not iteration — but dist/admin/preview/data.json serialises the
 * map, so a build would differ from the one before it for no reason anybody
 * could see. Ordering the assembly the way a sorted content file is ordered
 * (pages alphabetically, sections and fields in template order, via the same
 * sortPage the CMS config uses) makes the two sources produce identical bytes
 * and makes each build identical to the last.
 */
/**
 * Which keys the page blocks are responsible for.
 *
 * Derived from the layout, so it is the same answer in every locale: a key is
 * a block's to provide if some block declares a slot for it. Anything else —
 * page metadata, the nav and footer, and the text baked into the hand-drawn
 * visuals, which keep their own placeholders — still comes from the globals.
 *
 * The distinction matters when a translation is removed. If a global kept a
 * stale Danish string for a key a block now owns, clearing that field in the
 * CMS would show the stale text instead of falling back to English. Excluding
 * the block-owned keys from the globals is what makes clearing a field mean
 * what it says.
 */
function slotBackedKeys(layout) {
  const keys = new Set();
  const add = (page, section, slots) => {
    for (const [slot, value] of Object.entries(slots || {})) {
      const v = value || slot;
      keys.add(`${page}.${v.includes('.') ? v : `${section}.${v}`}`);
    }
  };
  for (const [page, blocks] of Object.entries(layout || {})) {
    for (const block of blocks) {
      add(page, block.section, block.slots);
      for (const value of Object.values(block.props || {})) {
        if (!Array.isArray(value)) continue;
        for (const row of value) add(page, block.section, row.slots);
      }
    }
  }
  return keys;
}

async function fromPayload(baseUrl, srcDir, code, layout) {
  const sections = payloadSections(srcDir);
  const fetched = new Array(sections.length);
  await pool(sections, 8, async (s, i) => {
    fetched[i] = await fetchSection(baseUrl, s, code);
  });

  const byPage = {};
  sections.forEach((s, i) => {
    (byPage[s.page] = byPage[s.page] || {})[s.section] = fetched[i];
  });

  const order = templateOrder(srcDir);
  const flat = {};
  // Sorted as filenames, not as page names: fromDisk() gets its order from
  // readdirSync().sort(), where "index-print.json" precedes "index.json"
  // because "-" sorts before ".". Comparing the bare names reverses that pair.
  const pages = Object.keys(byPage).sort((a, b) => (a + '.json' < b + '.json' ? -1 : 1));
  for (const page of pages) {
    for (const [section, fields] of Object.entries(sortPage(page, byPage[page], order))) {
      for (const [field, value] of Object.entries(fields)) {
        flat[`${page}.${section}.${field}`] = value;
      }
    }
  }

  if (!layout) return flat;

  /**
   * Where a block owns the key, the block's text wins — substituted in place
   * rather than appended, so the map keeps the order a sorted content file has
   * and the build stays reproducible.
   *
   * A key the block no longer has a value for is removed rather than left at the
   * global's value: that is what makes clearing a field in the CMS mean the
   * locale is untranslated, so it falls back to English instead of showing a
   * stale string nobody can find.
   */
  const owned = slotBackedKeys(layout);
  const fromBlocks = await textFromPages(baseUrl, code);
  for (const key of Object.keys(flat)) {
    if (!owned.has(key)) continue;
    if (key in fromBlocks) flat[key] = fromBlocks[key];
    else delete flat[key];
  }
  // A block-owned key the globals never had — a section added in the CMS.
  for (const [key, value] of Object.entries(fromBlocks)) {
    if (!(key in flat)) flat[key] = value;
  }
  return flat;
}

module.exports = { fromDisk, fromPayload, payloadSections };

/**
 * Images uploaded through the CMS, copied into dist/assets/.
 *
 * The site is static and stays that way: an uploaded image is fetched once at
 * build time and written beside the files that live in the repository, so the
 * deployed page refers to /assets/<name> either way and never asks the CMS for
 * anything. A file already present in assets/ is left alone — the repository
 * wins, so uploading something called styles.css cannot replace a stylesheet.
 *
 * Returns what it wrote, or an empty list when the CMS has no media or is not
 * being used as the source.
 */
async function fetchMedia(baseUrl, destDir, existing) {
  const res = await fetch(`${baseUrl}/api/media?limit=500&depth=0`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} listing media`);

  const { docs = [] } = await res.json();
  const written = [];

  for (const doc of docs) {
    const name = doc.filename;
    if (!name || existing.has(name)) continue;

    // Reject anything that would escape assets/ — the filename comes from an
    // upload, and a path separator in it would write outside the build.
    if (name !== path.basename(name)) throw new Error(`media filename is a path: ${name}`);

    const file = await fetch(`${baseUrl}/api/media/file/${encodeURIComponent(name)}`);
    if (!file.ok) throw new Error(`${file.status} fetching media ${name}`);
    fs.writeFileSync(path.join(destDir, name), Buffer.from(await file.arrayBuffer()));
    written.push(name);
  }
  return written;
}

module.exports.fetchMedia = fetchMedia;

/**
 * Page structure from the CMS: which sections a page has, in what order.
 *
 * The shape returned matches content/layout.json exactly, so build.js cannot
 * tell which side it came from — the same reason fromDisk and fromPayload exist
 * for the strings. Payload adds its own bookkeeping to every block (id,
 * blockType, blockName) and flattens props to the top level; this puts them back
 * into the component/props/slots shape the renderer expects.
 */
/**
 * Payload's own bookkeeping, plus `content` — the words, which are not part of
 * the structure. Layout says what a page is made of; the locale files say what
 * it says. Letting the text through here would write every string into
 * layout.json as well, in one language, beside the copies that already exist per
 * locale.
 */
const BLOCK_META = new Set(['id', 'blockType', 'blockName', 'section', 'lead', 'slots', 'content']);

function toInstance(block) {
  const props = {};
  for (const [key, value] of Object.entries(block)) {
    if (BLOCK_META.has(key)) continue;
    if (value === null || value === undefined) continue;
    // An array field comes back as rows carrying their own slots and props.
    props[key] = Array.isArray(value)
      ? value.map((row) => {
          const itemProps = {};
          for (const [k, v] of Object.entries(row)) {
            if (BLOCK_META.has(k)) continue;
            // Payload returns null for a checkbox nobody ticked; the file simply
            // has no key. Same meaning, and the export compares files.
            if (v === null || v === undefined) continue;
            itemProps[k] = v;
          }
          // Same rule as the block: a row with nothing to configure — a bullet
          // that is only its text — carries no props key at all.
          return Object.keys(itemProps).length
            ? { props: itemProps, slots: row.slots || {} }
            : { slots: row.slots || {} };
        })
      : value;
  }

  // One key order for every block. The file grew three different orders as it
  // was migrated family by family; since nothing reads it positionally, the
  // export settles on one so a real change is visible in a diff.
  const instance = { component: block.blockType, section: block.section };
  // Absent rather than empty: the lead is the whitespace and comment before a
  // section, and an empty one must not become the string "undefined".
  if (block.lead) instance.lead = block.lead;
  // Omitted when there are none, as the hand-written file has it. A block with
  // nothing to configure should not carry an empty object saying so.
  if (Object.keys(props).length) instance.props = props;
  instance.slots = block.slots || {};
  return instance;
}

async function layoutFromPayload(baseUrl) {
  const res = await fetch(`${baseUrl}/api/pages?limit=100&depth=0`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} listing pages`);

  const { docs = [] } = await res.json();
  const layout = {};
  for (const doc of docs) layout[doc.name] = (doc.layout || []).map(toInstance);
  return layout;
}

module.exports.layoutFromPayload = layoutFromPayload;

/**
 * The strings for one locale, read from the page blocks rather than the globals.
 *
 * Each block holds its own words now, one field per slot. The build still wants
 * the flat page.section.field map the templates were written against, so this
 * puts them back under the key each slot came from — the block's `slots` map —
 * falling back to the slot's own name for a block created in the CMS, which has
 * no history to carry.
 *
 * Structure is decided by English and nothing else. Whether a CTA band has a
 * paragraph is a property of the band, not of the language being rendered, so a
 * missing Danish translation has to fall back to English rather than delete the
 * element from the Danish page. That is why the caller passes `structure`: the
 * English map, used to decide which slots exist at all.
 */
function blockKey(section, slot, slots) {
  const value = (slots || {})[slot] || slot;
  return value.includes('.') ? `${value}` : `${section}.${value}`;
}

/**
 * A block keeps its words in a `content` group and its configuration beside it,
 * so the two never have to be told apart by guessing at names. Array rows carry
 * the same shape.
 */
function collectBlockText(page, block, flat) {
  const { section, slots, content } = block;

  for (const [name, value] of Object.entries(content || {})) {
    if (typeof value !== 'string' || !value.trim()) continue;
    flat[`${page}.${blockKey(section, fromIdent(name), slots)}`] = value;
  }

  for (const value of Object.values(block)) {
    if (!Array.isArray(value)) continue;
    for (const row of value) {
      for (const [rname, rvalue] of Object.entries(row.content || {})) {
        if (typeof rvalue !== 'string' || !rvalue.trim()) continue;
        flat[`${page}.${blockKey(section, fromIdent(rname), row.slots)}`] = rvalue;
      }
    }
  }
}

async function textFromPages(baseUrl, code) {
  const res = await fetch(`${baseUrl}/api/pages?limit=100&depth=0&locale=${code}&fallback-locale=none`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} reading pages for ${code}`);

  const { docs = [] } = await res.json();
  const flat = {};
  for (const doc of docs) for (const block of doc.layout || []) collectBlockText(doc.name, block, flat);
  return flat;
}

module.exports.textFromPages = textFromPages;

/**
 * A page's layout and text taken from a Payload document held in the admin —
 * unsaved, as the editor is typing.
 *
 * Live preview posts the form's current state to the preview frame, which sends
 * it here rather than rendering it itself. The same build then draws the page
 * from it. That is the whole trick: the editor sees changes that have not been
 * saved, and still sees them drawn by the code that will deploy them, because
 * nothing about the renderer changed — only where this one page's data came from.
 */
function fromLiveDoc(doc, code) {
  const page = doc.name;
  const blocks = (doc.layout || []).map(toInstance);

  const text = {};
  for (const block of doc.layout || []) collectBlockText(page, block, text);

  return { page, layout: blocks, text };
}

module.exports.fromLiveDoc = fromLiveDoc;
module.exports.toInstance = toInstance;
module.exports.collectBlockText = collectBlockText;

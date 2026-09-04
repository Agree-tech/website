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
async function fromPayload(baseUrl, srcDir, code) {
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
  return flat;
}

module.exports = { fromDisk, fromPayload, payloadSections };

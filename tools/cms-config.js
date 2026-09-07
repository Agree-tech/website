/**
 * cms-config.js — the site's content model, read from the templates.
 *
 * Derived rather than declared. Nine hundred keys across fourteen files is a
 * list nobody maintains by hand without it drifting the first time one is added
 * or renamed, so the model is read out of the templates themselves: whatever
 * they reference is what the CMS offers, always.
 *
 * Two decisions shape it, and both survive into Payload:
 *
 *   Sections and fields follow the template, not the alphabet. The content
 *   files were written sorted A–Z, which lists a page's buttons before its
 *   headline and its closing CTA before its hero. The editor instead lists
 *   them in the order a visitor meets them, and names each section after its
 *   heading, so a collapsed page reads like its own table of contents.
 *
 *   Labels come from the English *value*, not the key. A translator scanning a
 *   collapsed section needs to recognise the sentence, and "h3-built-for-fin"
 *   is not how anyone recognises a sentence.
 */

const fs = require('fs');
const path = require('path');

const PAGE_LABELS = {
  index: 'Homepage',
  platform: 'Platform',
  cpq: 'CPQ',
  billing: 'Billing automation',
  subscription: 'Subscription management',
  process: 'Process optimisation',
  sales: 'Sales',
  implementation: 'Implementation',
  about: 'About us',
  contact: 'Contact',
  nav: 'Navigation (every page)',
  foot: 'Footer (every page)',
  jsonld: 'Search engine data (every page)',
  'index-print': 'Homepage — print version',
};

/** Sidebar order: pages as a visitor meets them, shared parts last. */
const PAGE_ORDER = Object.keys(PAGE_LABELS);

const TAG_LABELS = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  p: 'Paragraph',
  li: 'List item',
  a: 'Link',
  b: 'Bold text',
  strong: 'Bold text',
  span: 'Label',
  div: 'Text',
  button: 'Button',
  blockquote: 'Quote',
  label: 'Form label',
};

const META_LABELS = {
  title: 'Browser tab and search result title',
  description: 'Search result description',
  'og-title': 'Share title — LinkedIn, Facebook',
  'og-description': 'Share description — LinkedIn, Facebook',
  'twitter-title': 'Share title — X',
  'twitter-description': 'Share description — X',
  'aria-label': 'Screen reader label',
  company: 'Form placeholder — Company',
  email: 'Form placeholder — Email',
  'first-name': 'Form placeholder — First name',
  'last-name': 'Form placeholder — Last name',
  message: 'Form placeholder — Message',
  website: 'Form placeholder — Website',
};

/**
 * Fixed section names: page metadata, and the shared parts, whose sections
 * have no heading to be named after. Keyed by page.section where the name
 * only makes sense on one page. Every other section is named after its first
 * heading — see sectionLabel().
 */
const SECTION_LABELS = {
  meta: 'Page metadata and social sharing',
  'nav.meta': 'Accessibility',
  'nav.main': 'Top bar links',
  'nav.mm-solutions': 'Solutions menu',
  'foot.main': 'Footer',
  'jsonld.org': 'Organisation',
};

const ACRONYMS = {
  cpq: 'CPQ', cta: 'CTA', cfo: 'CFO', q2c: 'Q2C', roi: 'ROI', kpi: 'KPI',
  erp: 'ERP', crm: 'CRM', b2b: 'B2B', eu: 'EU', api: 'API', ui: 'UI',
  saas: 'SaaS', atsuite: 'ATSuite', seo: 'SEO', faq: 'FAQ', mm: 'Menu',
};

/**
 * Long values get a textarea; short ones a single line.
 *
 * The length being measured is always the English value, because that is what
 * the config is generated from. Translated locales use a lower threshold:
 * across the current content Danish and Polish run up to 35% longer than the
 * English (90th percentile), so a 110-character English sentence becomes a
 * 150-character translation that no longer fits a single-line input.
 */
const TEXTAREA_OVER = 120;
const TEXTAREA_OVER_TRANSLATED = 90;

/**
 * The build throws on a "<" in a content value, so the CMS refuses it at the
 * point where a person can still fix it. ">" is allowed: platform.process
 * legitimately reads "If amt > 100k".
 */
const NO_MARKUP = ['^[^<]*$', 'Plain text only — the < character cannot be used here.'];

function humanize(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w, i) => ACRONYMS[w.toLowerCase()] || (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** A recognisable fragment of the sentence, with emphasis markers removed. */
function excerpt(value, max) {
  const clean = value.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut) + '…';
}

function fieldLabel(section, key, value) {
  if (section === 'meta') {
    if (META_LABELS[key]) return META_LABELS[key];
    if (/^alt(-\d+)?$/.test(key)) {
      const n = key.split('-')[1];
      return 'Image alt text' + (n ? ' ' + n : '');
    }
    return humanize(key);
  }
  const base = TAG_LABELS[key.split('-')[0]];
  if (!base) return humanize(key) + ' · ' + excerpt(value, 48);
  return base + ' · ' + excerpt(value, 56);
}

function hintFor(key, section, value, isDefaultLocale) {
  const parts = [];

  if (/\*[^*]+\*/.test(value)) {
    parts.push(
      'Text between *asterisks* is shown in the brand colour — keep the asterisks, and keep them in pairs.'
    );
  }
  if (section === 'meta') {
    if (/description$/.test(key)) parts.push('Around 150–160 characters reads best in search results.');
    else if (/title$/.test(key)) parts.push('Around 50–60 characters reads best in search results.');
  }
  if (!isDefaultLocale) {
    parts.unshift('English: “' + value + '”');
    parts.push('Leave blank to fall back to English.');
  }
  return parts.join('  ');
}

/**
 * Where every key sits in its template: key -> position, read in document
 * order. A section's position is that of its first key; a field's is where
 * its text appears on the page.
 */
function templateOrder(srcDir) {
  const order = new Map();
  let seq = 0;
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.html')).sort();
  for (const f of files) {
    const html = fs.readFileSync(path.join(srcDir, f), 'utf8');
    for (const m of html.matchAll(/\{\{i18n:([^}@]+)/g)) {
      const key = m[1].trim();
      if (!order.has(key)) order.set(key, seq++);
    }
  }
  return order;
}

/**
 * A page's sections and fields in template order. A key no template uses
 * sorts last, A–Z, rather than disappearing.
 */
function sortPage(page, sections, order) {
  const pos = (key) => (order.has(key) ? order.get(key) : Infinity);
  const byPos = (a, b) => pos(a[1]) - pos(b[1]) || a[0].localeCompare(b[0]);

  const ranked = Object.keys(sections)
    .map((section) => {
      const fields = Object.keys(sections[section])
        .map((field) => [field, `${page}.${section}.${field}`])
        .sort(byPos);
      const first = fields.length ? pos(fields[0][1]) : Infinity;
      return { section, first, fields };
    })
    .sort((a, b) => a.first - b.first || a.section.localeCompare(b.section));

  const out = {};
  for (const { section, fields } of ranked) {
    out[section] = {};
    for (const [field] of fields) out[section][field] = sections[section][field];
  }
  return out;
}

/**
 * Sections are named after their heading and numbered in page order, so the
 * collapsed list reads like a table of contents: "03 · Four modules. One
 * revenue engine." Page metadata and the shared parts keep fixed names.
 *
 * `fields` is the section's [key, value] pairs in template order; `number`
 * its position among the page's visible sections.
 */
function sectionLabel(page, section, fields, number) {
  const fixed = SECTION_LABELS[`${page}.${section}`] || SECTION_LABELS[section];
  if (fixed) return fixed;

  const heading = (re) => fields.find(([key]) => re.test(key));
  const pick = heading(/^h[12]-/) || heading(/^h[3-6]-/) || fields[0];
  const text = pick ? excerpt(pick[1], 64) : humanize(section);
  return String(number).padStart(2, '0') + ' · ' + text;
}

function yamlStr(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ') + '"';
}

/**
 * The site's content model as data: which pages exist, which sections each
 * holds, in what order, under what name.
 *
 * Read from the templates rather than declared, so it cannot drift from them.
 * cms/scripts/generate-globals.mjs turns this into Payload fields; it inherits
 * the page ordering, the heading-derived section names and the value-derived
 * field labels for free, and cannot disagree with the editor the
 * site actually ships with.
 *
 * Locale-specific choices stay with the emitter: which fields are required,
 * how long a value must be before it earns a textarea, and what a hint says
 * are answers that depend on the CMS asking.
 */
function buildModel({ contentDir, srcDir, defaultLocaleOnly }) {
  const order = templateOrder(srcDir);
  const pages = fs
    .readdirSync(path.join(contentDir, 'en'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  const ordered = PAGE_ORDER.filter((p) => pages.includes(p)).concat(
    pages.filter((p) => !PAGE_ORDER.includes(p)).sort()
  );

  return ordered.map((page) => {
    const sections = sortPage(
      page,
      JSON.parse(fs.readFileSync(path.join(contentDir, 'en', page + '.json'), 'utf8')),
      order
    );

    let visible = 0;
    return {
      name: page,
      label: PAGE_LABELS[page] || humanize(page),
      defaultLocaleOnly: defaultLocaleOnly ? defaultLocaleOnly.has(page + '.html') : false,
      sections: Object.keys(sections).map((section) => {
        const fields = Object.entries(sections[section]);
        if (section !== 'meta') visible++;
        return {
          name: section,
          label: sectionLabel(page, section, fields, visible),
          fields: fields.map(([key, value]) => ({
            name: key,
            label: fieldLabel(section, key, value),
            value,
          })),
        };
      }),
    };
  });
}

module.exports = {
  buildModel,
  templateOrder,
  sortPage,
  hintFor,
  TEXTAREA_OVER,
  TEXTAREA_OVER_TRANSLATED,
  NO_MARKUP,
};

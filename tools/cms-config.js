/**
 * cms-config.js — generates dist/admin/config.yml from content/en/.
 *
 * The config is generated rather than checked in because it is a mechanical
 * projection of the content: 919 keys across 14 files and 3 locales is roughly
 * 2,600 field definitions, and any hand-maintained copy would drift the first
 * time a key is added or renamed. Generating it means the CMS always offers
 * exactly the keys the templates actually use.
 *
 * Two decisions shape the output:
 *
 *   Labels come from the English *value*, not the key. A translator scanning a
 *   collapsed section needs to recognise the sentence, and "h3-built-for-fin"
 *   is not how anyone recognises a sentence.
 *
 *   Non-English fields carry the English source in their hint. Decap cannot
 *   show a reference locale beside the field, so the source text is baked into
 *   the field description at build time instead.
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

const SECTION_LABELS = { meta: 'Page metadata and social sharing' };

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

function yamlStr(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ') + '"';
}

function buildConfig({ contentDir, locales, defaultLocaleOnly, siteUrl, branch }) {
  const pages = fs
    .readdirSync(path.join(contentDir, 'en'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  const ordered = PAGE_ORDER.filter((p) => pages.includes(p)).concat(
    pages.filter((p) => !PAGE_ORDER.includes(p)).sort()
  );

  const L = [];
  let fieldCount = 0;

  L.push('# GENERATED by tools/cms-config.js from content/en/ — do not edit by hand.');
  L.push('# Add or rename a key in the templates, run the build, and it appears here.');
  L.push('');
  L.push('backend:');
  L.push('  name: git-gateway');
  L.push('  branch: ' + branch);
  //
  // Naming the provider in the URL is not decoration — it is what stops Decap
  // asking the gateway which provider it is.
  //
  // By default Decap fetches /.netlify/git/settings to discover whether the
  // gateway is backed by GitHub, GitLab or Bitbucket. On this site that path
  // returns Netlify's 404 *page*, and Decap rejects any non-JSON response with
  // "Your Git Gateway backend is not returning valid settings. Please make
  // sure it is enabled." — which reads like the gateway is off when it is on:
  // /.netlify/git/github/* answers correctly.
  //
  // Decap resolves a gateway_url ending in /github by reading the provider off
  // the URL and skipping the discovery call entirely, then rebuilding the same
  // API root it would have used anyway. So this says explicitly what the
  // 404-ing endpoint was supposed to say.
  //
  L.push('  gateway_url: /.netlify/git/github');
  L.push('');
  L.push('site_url: ' + yamlStr(siteUrl));
  L.push('display_url: ' + yamlStr(siteUrl));
  L.push('logo_url: "/assets/logo-black.png"');
  L.push('');
  L.push('media_folder: "assets"');
  L.push('public_folder: "/assets"');
  L.push('');
  L.push('collections:');

  for (const locale of locales) {
    L.push('  - name: ' + yamlStr(locale.code));
    L.push('    label: ' + yamlStr(locale.label));
    L.push('    label_singular: ' + yamlStr('Page'));
    L.push('    files:');

    for (const page of ordered) {
      if (!locale.isDefault && defaultLocaleOnly.has(page + '.html')) continue;

      const sections = JSON.parse(
        fs.readFileSync(path.join(contentDir, 'en', page + '.json'), 'utf8')
      );

      L.push('      - name: ' + yamlStr(page));
      L.push('        label: ' + yamlStr(PAGE_LABELS[page] || humanize(page)));
      L.push('        file: ' + yamlStr('content/' + locale.code + '/' + page + '.json'));
      L.push('        fields:');

      for (const section of Object.keys(sections)) {
        L.push('          - name: ' + yamlStr(section));
        L.push('            label: ' + yamlStr(SECTION_LABELS[section] || humanize(section)));
        L.push('            widget: object');
        L.push('            collapsed: true');
        L.push('            fields:');

        for (const [key, value] of Object.entries(sections[section])) {
          const hint = hintFor(key, section, value, locale.isDefault);
          L.push('              - name: ' + yamlStr(key));
          L.push('                label: ' + yamlStr(fieldLabel(section, key, value)));
          const textareaOver = locale.isDefault ? TEXTAREA_OVER : TEXTAREA_OVER_TRANSLATED;
          L.push('                widget: ' + (value.length > textareaOver ? 'text' : 'string'));
          L.push('                required: ' + (locale.isDefault ? 'true' : 'false'));
          L.push('                pattern: [' + yamlStr(NO_MARKUP[0]) + ', ' + yamlStr(NO_MARKUP[1]) + ']');
          if (hint) L.push('                hint: ' + yamlStr(hint));
          fieldCount++;
        }
      }
    }
  }

  return { yaml: L.join('\n') + '\n', fieldCount };
}

module.exports = { buildConfig };

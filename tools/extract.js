#!/usr/bin/env node
/**
 * extract.js — one-shot Phase 3 tool. NOT part of the build.
 *
 * Walks src/*.html, finds every translatable string, assigns it a key, replaces
 * the string in the template with a {{i18n:key}} placeholder, and writes the
 * English values to content/en.json.
 *
 * Placeholders rather than data-i18n attributes, because keys are assigned per
 * *text run*, not per element. `<div class="eyebrow"><span class="dot"></span>
 * OUR JOURNEY</div>` has one translatable run; replacing the element's whole
 * inner content would delete the icon span. Per-run placeholders leave sibling
 * markup and surrounding whitespace untouched, and make substitution at build
 * time a single string replace with no parser.
 *
 * Design constraints, from the plan:
 *
 *  - D3: no editor ever sees markup. A wrapper holding words mid-sentence is
 *    reported for manual handling (the *asterisk* convention) rather than being
 *    split positionally, which would break under a different word order.
 *  - Brand names and the platform.html schema diagram are excluded outright.
 *  - Keys are derived from document structure so they stay readable.
 *
 * Run with --dry to report without writing.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const CONTENT = path.join(ROOT, 'content');
const DRY = process.argv.includes('--dry');

/** Never descend into these. */
const OPAQUE = new Set(['script', 'style', 'svg', 'code', 'pre']);

/** Allowed inside a keyed element — decorative only. */
const INLINE = new Set(['b', 'i', 'em', 'strong', 'span', 'br', 'sup', 'sub']);

/** Elements that can hold a translatable string. */
const TEXT_HOSTS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'li', 'a', 'div', 'span', 'td', 'th', 'button', 'label',
  'figcaption', 'blockquote', 'summary', 'strong', 'b',
]);

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Attributes worth translating, per tag. */
const ATTR_TARGETS = [
  { tag: 'meta', attr: 'content', when: (a) => /description|og:title|og:description|twitter:title|twitter:description|og:site_name/i.test(a.name || a.property || '') },
  { tag: 'img', attr: 'alt' },
  { tag: 'input', attr: 'placeholder' },
  { tag: 'textarea', attr: 'placeholder' },
  { tag: '*', attr: 'aria-label' },
];

/** Strings that are brand/product names or otherwise must not be translated. */
const NEVER_TRANSLATE = [
  /^ATSuite$/i,
  /^Agree Technologies(\s+ApS)?$/i,
  /^atsuite\.app/i,
  /^[A-Z]{1,3}-\d+$/,        // Quote Q-2046 style ids
  /^\s*[+\-–—·|/]\s*$/,
];
// Currency amounts and percentages are deliberately NOT excluded: per the plan
// (§1.2) they are translatable so each locale can carry its own number format
// — 186,400 / 186.400 / 186 400.

/**
 * Which wrapper an emphasis marker maps back to.
 *
 * Returned as `span.accent` for a classed span or `b` for a bare tag. The two
 * must stay distinguishable: this site uses `<span class="em">`, and collapsing
 * that to `em` would silently emit an `<em>` tag with different styling.
 */
function emphasisClass(inner) {
  const m = inner.match(/<span\b[^>]*class="([^"]*)"[^>]*>|<(b|strong|em|i)\b[^>]*>/i);
  if (!m) return null;
  return m[1] ? `span.${m[1].trim().split(/\s+/)[0]}` : m[2].toLowerCase();
}

/** Rewrite `<span class="accent">x</span>` as `*x*` for the editor. */
function toAsterisks(inner) {
  return inner
    .replace(/<(b|i|em|strong|span)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, body) =>
      hasWords(textOf(body)) ? `*${body.replace(/<[^>]+>/g, '')}*` : m
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** platform.html's schema diagram — code, not prose. */
function isSchemaDiagram(text) {
  return /^[+\s]*[a-z_]+\s*:\s*(uuid|months|schedule|tier|enum|str|int|bool|date)$/i.test(text.trim());
}

// ---------------------------------------------------------------------------

function tokenize(html) {
  const tokens = [];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index > last) {
      tokens.push({ type: 'text', value: html.slice(last, m.index), start: last, end: m.index });
    }
    if (m[0].startsWith('<!--')) {
      tokens.push({ type: 'comment', start: m.index, end: re.lastIndex });
    } else if (m[1]) {
      tokens.push({ type: 'close', tag: m[1].toLowerCase(), start: m.index, end: re.lastIndex });
    } else {
      const tag = m[2].toLowerCase();
      tokens.push({
        type: 'open',
        tag,
        rawAttrs: m[3] || '',
        selfClosing: Boolean(m[4]) || VOID.has(tag),
        start: m.index,
        end: re.lastIndex,
      });
    }
    last = re.lastIndex;
  }
  if (last < html.length) {
    tokens.push({ type: 'text', value: html.slice(last), start: last, end: html.length });
  }
  return tokens;
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"|([\w:-]+)\s*=\s*'([^']*)'|([\w:-]+)/g;
  let m;
  while ((m = re.exec(raw))) {
    if (m[1]) attrs[m[1].toLowerCase()] = m[2];
    else if (m[3]) attrs[m[3].toLowerCase()] = m[4];
    else if (m[5]) attrs[m[5].toLowerCase()] = '';
  }
  return attrs;
}

function textOf(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Entities are markup too (D3). An editor must see `CPQ & billing`, never
 * `CPQ &amp; billing`, so values are stored decoded and re-escaped by the build.
 */
const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&apos;': "'", '&#39;': "'", '&nbsp;': ' ',
  '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
};

function decodeEntities(s) {
  return s
    .replace(/&(amp|lt|gt|quot|apos|nbsp|mdash|ndash|hellip);|&#39;/gi,
      (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function hasWords(s) {
  return /[A-Za-zÀ-ÿ]{2}/.test(s);
}

/** Inner content is text plus decorative inline tags only. */
function isLeafText(inner) {
  const tags = [...inner.matchAll(/<\/?([a-zA-Z][\w-]*)/g)].map((m) => m[1].toLowerCase());
  return tags.every((t) => INLINE.has(t));
}

/**
 * Does a tag wrap words in the middle of a sentence? Those are the cases the
 * audit found (18 of them) and they need the *asterisk* convention or a split,
 * so they are reported rather than silently keyed.
 */
function hasMidSentenceMarkup(inner) {
  const wrapped = [...inner.matchAll(/<(b|i|em|strong|span)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  if (!wrapped.length) return false;
  const insideHasWords = wrapped.some((w) => hasWords(textOf(w[2])));
  const outside = textOf(inner.replace(/<(b|i|em|strong|span)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));
  return insideHasWords && hasWords(outside);
}

function slug(s, max = 28) {
  return s
    .toLowerCase()
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .filter(Boolean)
    .slice(0, 4)
    .join('-')
    .slice(0, max);
}

// ---------------------------------------------------------------------------

/**
 * Is this element's content prose with emphasis *inside* a sentence?
 *
 * `The all-in-one CPQ & <span class="accent">billing</span> platform…` is prose:
 * there are words before the wrapper, so splitting it into positional fragments
 * would break as soon as a language wants different word order. Those get the
 * *asterisk* convention by hand.
 *
 * `<b>6+ years</b> in production` is a label pair: the wrapper leads, so the two
 * halves are independent and can safely become two fields.
 */
function isProseEmphasis(inner) {
  const re = /<(b|i|em|strong|span)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(inner))) {
    // A wrapper holding no letters is decoration — an arrow, a required-field
    // asterisk, a bullet. It stays in the template and is not a translation
    // problem, so it must not drag the whole string into manual handling.
    if (!hasWords(textOf(m[2]))) continue;
    if (hasWords(textOf(inner.slice(0, m.index)))) return true;
  }
  return false;
}

/** A <br> inside means the layout depends on the split — handle by hand. */
function hasLineBreak(inner) {
  return /<br\b/i.test(inner);
}

function extractPage(file, html) {
  const pageKey = path.basename(file, '.html').replace(/^_/, '').replace(/[^a-z0-9]+/gi, '-');
  const tokens = tokenize(html);

  const stack = [];
  const edits = [];       // { start, end, insert } applied back-to-front
  const entries = [];     // { key, value }
  const skipped = [];
  const manual = [];
  const seenManual = new Set();
  const emphRanges = [];  // inner spans already claimed as one emphasis field

  let opaqueDepth = 0;
  let sectionName = 'main';
  let sectionSeq = 0;
  const usedKeys = new Map();

  function uniqueKey(base) {
    const n = (usedKeys.get(base) || 0) + 1;
    usedKeys.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  /** Cache of per-element decisions, keyed by the open tag's offset. */
  const hostDecision = new Map();

  function decideHost(open, closeStart) {
    if (hostDecision.has(open.start)) return hostDecision.get(open.start);
    const inner = html.slice(open.end, closeStart);
    let verdict = 'key';

    // The schema diagram in platform.html is code. Not manual work — excluded.
    if (isSchemaDiagram(textOf(inner))) {
      verdict = 'skip';
    } else if (isLeafText(inner) && isProseEmphasis(inner)) {
      // Only a leaf can be prose. If the element contains block children, its
      // text runs belong to those children and are judged there instead.
      //
      // Emphasis inside a sentence becomes ONE field carrying *asterisks*, not
      // positional fragments — the editor sees no markup, and the translator
      // keeps the freedom to move the emphasised words.
      const cls = emphasisClass(inner);
      if (cls) {
        const value = toAsterisks(inner);
        const key = uniqueKey(
          `${pageKey}.${open.sectionName}.${open.tag}-${slug(value.replace(/\*/g, ''), 22)}`
        );
        entries.push({ key, value: decodeEntities(value) });

        // Replace only the trimmed core, so whitespace the browser would
        // render (a space after the opening tag) survives.
        const lead = inner.length - inner.trimStart().length;
        const tail = inner.length - inner.trimEnd().length;
        edits.push({
          start: open.end + lead,
          end: closeStart - tail,
          insert: `{{i18n:${key}@${cls}}}`,
        });
        emphRanges.push([open.end, closeStart]);
        verdict = 'emph';
      } else {
        verdict = 'manual';
      }
    }

    hostDecision.set(open.start, verdict);
    if (verdict === 'manual') {
      const sig = inner.trim().slice(0, 120);
      if (!seenManual.has(sig)) {
        seenManual.add(sig);
        manual.push({ page: path.basename(file), inner: sig });
      }
    }
    return verdict;
  }

  // Pre-compute, for every open tag, where its matching close tag is, so a text
  // run can ask its parent "are you a manual case?" before being keyed.
  const matchClose = new Map();
  {
    const st = [];
    for (const t of tokens) {
      if (t.type === 'open' && !t.selfClosing) st.push(t);
      else if (t.type === 'close') {
        for (let s = st.length - 1; s >= 0; s--) {
          if (st[s].tag === t.tag) {
            matchClose.set(st[s].start, t.start);
            st.length = s;
            break;
          }
        }
      }
    }
  }

  for (const t of tokens) {
    if (t.type === 'open' && OPAQUE.has(t.tag)) {
      if (!t.selfClosing) opaqueDepth++;
      continue;
    }
    if (t.type === 'close' && OPAQUE.has(t.tag)) {
      if (opaqueDepth > 0) opaqueDepth--;
      continue;
    }
    if (opaqueDepth > 0) continue;

    if (t.type === 'open') {
      const attrs = parseAttrs(t.rawAttrs);

      if (t.tag === 'section' || (t.tag === 'div' && attrs.id)) {
        sectionSeq++;
        sectionName = slug(attrs.id || attrs.class || '') || `s${sectionSeq}`;
      }

      // --- translatable attributes ---
      for (const target of ATTR_TARGETS) {
        if (target.tag !== '*' && target.tag !== t.tag) continue;
        if (target.when && !target.when(attrs)) continue;
        const val = attrs[target.attr];
        if (!val || !hasWords(val)) continue;
        if (NEVER_TRANSLATE.some((r) => r.test(val.trim()))) continue;

        // Locate the attribute's value inside the tag so we can swap just that.
        const tagSrc = html.slice(t.start, t.end);
        const vm = tagSrc.match(
          new RegExp(`\\b${target.attr}\\s*=\\s*"([^"]*)"`, 'i')
        );
        if (!vm) continue;
        const valStart = t.start + vm.index + vm[0].indexOf('"') + 1;
        const valEnd = valStart + vm[1].length;

        const label = attrs.name || attrs.property || target.attr;
        const key = uniqueKey(`${pageKey}.meta.${slug(label)}`);
        entries.push({ key, value: decodeEntities(val) });
        edits.push({ start: valStart, end: valEnd, insert: `{{i18n:${key}}}` });
      }

      if (!t.selfClosing) stack.push({ ...t, attrs, sectionName });
      continue;
    }

    if (t.type === 'close') {
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s].tag === t.tag) { stack.length = s; break; }
      }
      continue;
    }

    // --- text run ---
    if (t.type !== 'text') continue;

    const raw = t.value;
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text || !hasWords(text)) continue;

    const parent = stack[stack.length - 1];
    if (!parent || !TEXT_HOSTS.has(parent.tag)) continue;

    if (NEVER_TRANSLATE.some((r) => r.test(text))) { skipped.push(text); continue; }
    if (isSchemaDiagram(text)) { skipped.push(text); continue; }

    // A run inside an element already claimed as a single emphasis field must
    // not be keyed again — the outer field already covers these words.
    if (emphRanges.some(([a, b]) => t.start >= a && t.end <= b)) continue;

    const closeStart = matchClose.get(parent.start);
    if (closeStart === undefined) continue;
    const verdict = decideHost(parent, closeStart);
    if (verdict === 'manual' || verdict === 'emph') continue;
    if (verdict === 'skip') { skipped.push(text); continue; }

    // Replace only the trimmed core of this run, so surrounding whitespace and
    // any sibling markup (decorative spans, icons) survive untouched.
    const lead = raw.length - raw.trimStart().length;
    const tail = raw.length - raw.trimEnd().length;
    const coreStart = t.start + lead;
    const coreEnd = t.end - tail;

    const base = `${pageKey}.${parent.sectionName}.${parent.tag}-${slug(text, 22) || 'text'}`;
    const key = uniqueKey(base);
    entries.push({ key, value: decodeEntities(text) });

    edits.push({ start: coreStart, end: coreEnd, insert: `{{i18n:${key}}}` });
  }

  // Apply edits back-to-front so offsets stay valid.
  let out = html;
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) {
    out = out.slice(0, e.start) + e.insert + out.slice(e.end);
  }

  return { out, entries, skipped, manual };
}

// ---------------------------------------------------------------------------

function main() {
  const pages = fs
    .readdirSync(SRC)
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .sort();

  const partials = ['_nav.html', '_foot.html'].filter((f) =>
    fs.existsSync(path.join(SRC, f))
  );

  const all = {};
  let totalManual = [];
  let totalSkipped = 0;

  for (const file of [...pages, ...partials]) {
    const full = path.join(SRC, file);
    const html = fs.readFileSync(full, 'utf8');
    const { out, entries, skipped, manual } = extractPage(full, html);

    for (const { key, value } of entries) all[key] = value;
    totalManual = totalManual.concat(manual);
    totalSkipped += skipped.length;

    if (!DRY) fs.writeFileSync(full, out, 'utf8');
    console.log(`  ${file.padEnd(22)} ${String(entries.length).padStart(4)} keys`);
  }

  const keys = Object.keys(all).sort();
  const ordered = {};
  for (const k of keys) ordered[k] = all[k];

  if (!DRY) {
    fs.mkdirSync(CONTENT, { recursive: true });
    fs.writeFileSync(
      path.join(CONTENT, 'en.json'),
      JSON.stringify(ordered, null, 2) + '\n',
      'utf8'
    );
  }

  console.log(`\ntotal keys      : ${keys.length}`);
  console.log(`skipped (brand/code/numeric): ${totalSkipped}`);
  console.log(`needs manual handling       : ${totalManual.length}`);
  for (const m of totalManual) console.log(`    ${m.page}: ${m.inner}`);
  if (DRY) console.log('\n(dry run — nothing written)');
}

main();

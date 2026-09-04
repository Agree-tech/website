#!/usr/bin/env node
/**
 * extract-blocks.js — cuts each page template into an ordered list of blocks.
 *
 * This is the first half of making pages composable, and it is deliberately the
 * boring half: it changes no markup at all. A page becomes
 *
 *     shell/<page>.head.html  +  blocks in order  +  shell/<page>.tail.html
 *
 * and the concatenation must equal the original template byte for byte. Until
 * that holds there is no point giving an editor a reorder handle, because
 * nothing would prove that the page they reassemble is the page we shipped.
 *
 * The cut is on top-level <section> elements, which is where the content model
 * already draws its own boundaries — content keys are page.section.field, and
 * the section name comes from the element's class. So blocks and content
 * sections line up by construction rather than by a mapping someone maintains.
 *
 *     node tools/extract-blocks.js           # write blocks/ and shell/
 *     node tools/extract-blocks.js --check   # verify round-trip only
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BLOCKS = path.join(ROOT, 'blocks');
const SHELL = path.join(ROOT, 'shell');
const MANIFEST = path.join(ROOT, 'content', 'layout.json');

const CHECK = process.argv.includes('--check');

/**
 * Split on top-level <section> elements, counting depth so a nested section
 * cannot end its parent early. Everything between sections — the <head>, the
 * nav mount, per-page <style>, the closing tags — is page chrome and stays
 * where it is.
 */
function split(html) {
  const parts = [];
  const re = /<section\b[^>]*>|<\/section\s*>/g;
  let depth = 0;
  let start = -1;
  let last = 0;
  let m;

  while ((m = re.exec(html))) {
    const isOpen = m[0][1] !== '/';
    if (isOpen) {
      if (depth === 0) {
        start = m.index;
        if (start > last) parts.push({ kind: 'chrome', html: html.slice(last, start) });
      }
      depth++;
    } else {
      depth--;
      if (depth === 0) {
        const end = m.index + m[0].length;
        parts.push({ kind: 'section', html: html.slice(start, end) });
        last = end;
      }
    }
  }
  if (last < html.length) parts.push({ kind: 'chrome', html: html.slice(last) });
  return parts;
}

/**
 * A block's name is its section's class list, hyphen-joined — the same string
 * the content extractor used for the section key, so blocks/<page>/NN-<name>
 * and content keys page.<name>.field refer to the same thing. Falls back to the
 * id, which is how the platform page distinguishes its five split-sections.
 */
function blockName(sectionHtml, taken) {
  const open = sectionHtml.match(/<section\b[^>]*>/)[0];
  const cls = (open.match(/class="([^"]*)"/) || [, ''])[1].trim().split(/\s+/).filter(Boolean);
  const id = (open.match(/id="([^"]*)"/) || [, ''])[1].trim();

  let base = cls.join('-') || id || 'section';
  if (taken.has(base) && id) base = `${cls.join('-')}-${id}`;
  let name = base;
  let n = 2;
  while (taken.has(name)) name = `${base}-${n++}`;
  taken.add(name);
  return name;
}

function pages() {
  return fs
    .readdirSync(SRC)
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .sort();
}

function main() {
  const manifest = {};
  const failures = [];
  let blockCount = 0;

  if (!CHECK) {
    fs.rmSync(BLOCKS, { recursive: true, force: true });
    fs.rmSync(SHELL, { recursive: true, force: true });
    fs.mkdirSync(BLOCKS, { recursive: true });
    fs.mkdirSync(SHELL, { recursive: true });
  }

  for (const file of pages()) {
    const page = file.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(SRC, file), 'utf8');
    const parts = split(html);

    // The cut is only trustworthy if it is exactly reversible.
    if (parts.map((p) => p.html).join('') !== html) {
      failures.push(`${page}: split is lossy`);
      continue;
    }

    const taken = new Set();
    const order = [];
    let head = '';
    let tail = '';
    // Chrome between two sections is whitespace and a dev comment naming the
    // section that follows it ("<!-- Q2C BOARD -->"). It belongs to the block
    // below it, so each block carries the separator that precedes it and the
    // page reassembles as head + blocks + tail with nothing left over. The
    // comment travels with its block when the order changes, which is the
    // behaviour you want from a label.
    let pending = '';
    let seenSection = false;

    for (const part of parts) {
      if (part.kind === 'chrome') {
        if (!seenSection) head += part.html;
        else pending += part.html;
        continue;
      }
      seenSection = true;
      const name = blockName(part.html, taken);
      order.push(name);
      blockCount++;
      if (!CHECK) {
        fs.mkdirSync(path.join(BLOCKS, page), { recursive: true });
        fs.writeFileSync(path.join(BLOCKS, page, `${name}.html`), pending + part.html, 'utf8');
      }
      pending = '';
    }
    // Whatever followed the last section never belonged to a block.
    tail = pending;

    manifest[page] = order;
    if (!CHECK) {
      fs.writeFileSync(path.join(SHELL, `${page}.head.html`), head, 'utf8');
      fs.writeFileSync(path.join(SHELL, `${page}.tail.html`), tail, 'utf8');
    }
  }

  if (!CHECK) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  // Reassemble from what was written and compare with the template.
  if (!CHECK) {
    for (const file of pages()) {
      const page = file.replace(/\.html$/, '');
      const rebuilt =
        fs.readFileSync(path.join(SHELL, `${page}.head.html`), 'utf8') +
        manifest[page].map((b) => fs.readFileSync(path.join(BLOCKS, page, `${b}.html`), 'utf8')).join('') +
        fs.readFileSync(path.join(SHELL, `${page}.tail.html`), 'utf8');
      if (rebuilt !== fs.readFileSync(path.join(SRC, file), 'utf8')) {
        failures.push(`${page}: reassembly differs from src/${file}`);
      }
    }
  }

  console.log(`${Object.keys(manifest).length} pages, ${blockCount} blocks`);
  for (const [page, order] of Object.entries(manifest)) {
    console.log(`  ${page.padEnd(16)} ${order.join('  ')}`);
  }

  if (failures.length) {
    console.error('\nFAIL:');
    failures.forEach((f) => console.error('  ' + f));
    process.exit(1);
  }
  console.log('\nPASS — every page reassembles from its blocks byte for byte.');
}

main();

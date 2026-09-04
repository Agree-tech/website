#!/usr/bin/env node
/**
 * sort-content.js — puts content/<locale>/*.json in page order.
 *
 * The build reads each file as a map, so key order changes nothing on the
 * site. It is for people: a translation diff is easiest to review when it
 * runs top-to-bottom like the page, and the files then match the order the
 * CMS shows (which tools/cms-config.js derives from the templates itself).
 *
 * The files were first written A–Z by split-content.js. Run this after adding
 * keys to the templates, or whenever a file has drifted out of page order.
 *
 * Run with --check to report out-of-order files without writing (exit 1).
 */

const fs = require('fs');
const path = require('path');
const { templateOrder, sortPage } = require('./cms-config.js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const CONTENT = path.join(ROOT, 'content');
const CHECK = process.argv.includes('--check');

const order = templateOrder(SRC);
let changed = 0;
let total = 0;

const locales = fs
  .readdirSync(CONTENT)
  .filter((d) => fs.statSync(path.join(CONTENT, d)).isDirectory())
  .sort();

for (const locale of locales) {
  const dir = path.join(CONTENT, locale);
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const page = file.replace(/\.json$/, '');
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, 'utf8');
    // Keep the file's own line endings: a CRLF checkout is not "out of order".
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    const sorted =
      JSON.stringify(sortPage(page, JSON.parse(raw), order), null, 2).replace(/\n/g, eol) + eol;
    total++;
    if (sorted === raw) continue;
    changed++;
    if (CHECK) console.log(`  out of order: content/${locale}/${file}`);
    else fs.writeFileSync(full, sorted, 'utf8');
  }
}

console.log(
  CHECK ? `${changed}/${total} content files out of page order` : `${changed}/${total} content files reordered`
);
if (CHECK && changed) process.exit(1);

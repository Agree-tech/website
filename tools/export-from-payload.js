#!/usr/bin/env node
/**
 * export-from-payload.js — writes the CMS back out as the files git tracks.
 *
 * The database is where editing happens; these files are the record of what
 * shipped. Running this before a deploy — or after an editor publishes — puts
 * the two back in step, so `git log` still answers "who changed this line and
 * when", a content change can be reviewed as a diff, and rolling back is
 * `git revert` rather than an appeal to database backups.
 *
 * It writes exactly the files the build already reads:
 *
 *   content/<locale>/<page>.json   the strings, in page order
 *   content/layout.json            the page structure
 *
 * Nothing here is clever about merging. The CMS wins outright, because it is
 * the thing editors touch; a local edit to content/ that has not been seeded
 * back will be overwritten, which is the same rule seed.ts states in reverse.
 *
 *   node tools/export-from-payload.js           # write
 *   node tools/export-from-payload.js --check   # report drift, exit 1
 *
 * --check is the useful one in CI: it fails when the files no longer match the
 * database, which is exactly when somebody forgot to export.
 */

const fs = require('fs');
const path = require('path');
const { templateOrder, sortPage } = require('./cms-config.js');
const { fromPayload, layoutFromPayload } = require('./content-source.js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const CONTENT = path.join(ROOT, 'content');
const PAYLOAD_URL = (process.env.PAYLOAD_URL || 'http://localhost:3001').replace(/[/]+$/, '');
const CHECK = process.argv.includes('--check');

/** Mirrors build.js. Kept in step by the parity gate, which builds both sides. */
const LOCALES = ['en', 'da', 'pl'];
const DEFAULT_LOCALE_ONLY = new Set(['index-print']);

/**
 * Two-space JSON with one trailing newline, keeping whatever line endings the
 * file already has.
 *
 * content/ is mixed: most files are LF, a few are CRLF, and git is configured to
 * convert on checkout — so rewriting one wholesale in the other convention shows
 * up as an entire file changed with not a word different. sort-content.js reads
 * the existing ending for the same reason.
 */
function serialize(value, file) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const eol = existing.includes('\r\n') ? '\r\n' : '\n';
  return JSON.stringify(value, null, 2).replace(/\n/g, eol) + eol;
}

/** page.section.field -> { page: { section: { field } } }, in page order. */
function nest(flat, order) {
  const pages = {};
  for (const [key, value] of Object.entries(flat)) {
    const [page, section, ...rest] = key.split('.');
    const field = rest.join('.');
    if (!field) continue;
    ((pages[page] = pages[page] || {})[section] = pages[page][section] || {})[field] = value;
  }
  for (const page of Object.keys(pages)) pages[page] = sortPage(page, pages[page], order);
  return pages;
}

function main() {
  const order = templateOrder(SRC);
  const planned = new Map();

  return layoutFromPayload(PAYLOAD_URL)
    .then(async (layout) => {
      const layoutFile = path.join(CONTENT, 'layout.json');
      planned.set(layoutFile, serialize(layout, layoutFile));

      for (const code of LOCALES) {
        const flat = await fromPayload(PAYLOAD_URL, SRC, code, layout);
        for (const [page, sections] of Object.entries(nest(flat, order))) {
          // A locale that does not build a page has no file for it, and writing
          // an empty one would report the locale as further along than it is.
          if (DEFAULT_LOCALE_ONLY.has(page) && code !== 'en') continue;
          const file = path.join(CONTENT, code, `${page}.json`);
          planned.set(file, serialize(sections, file));
        }
      }

      const changed = [];
      for (const [file, contents] of planned) {
        const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
        if (current === contents) continue;
        changed.push(path.relative(ROOT, file).split(path.sep).join('/'));
        if (!CHECK) {
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, contents, 'utf8');
        }
      }

      console.log(`${planned.size} file(s) considered, ${changed.length} ${CHECK ? 'out of date' : 'written'}`);
      for (const f of changed.slice(0, 25)) console.log(`  ${CHECK ? '~' : '+'} ${f}`);
      if (changed.length > 25) console.log(`  … and ${changed.length - 25} more`);

      if (CHECK && changed.length) {
        console.error('\nFAIL — content/ does not match the CMS. Run: npm run export');
        process.exit(1);
      }
      if (CHECK) console.log('\nPASS — content/ matches the CMS.');
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}

main();

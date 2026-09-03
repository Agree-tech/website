#!/usr/bin/env node
/**
 * verify-dom.js — the Phase 2 acceptance gate.
 *
 * Phase 2 moves the nav, footer and JSON-LD out of shared.js and into the
 * markup, so dist/ is deliberately no longer byte-identical to the baseline
 * (tools/verify-baseline.js stops applying to those pages). What must not
 * change is the DOM the browser ends up with.
 *
 * So: render every page twice in headless Chrome — once from the pre-change
 * baseline snapshot, once from dist/ — and compare the resulting DOM after
 * JavaScript has run. Same DOM means the refactor was behaviour-preserving;
 * the difference is only that the markup now ships in the HTML rather than
 * being assembled at runtime.
 *
 * Usage: node tools/verify-dom.js <baseline-dir>
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, "dist", "en");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function findChrome() {
  const hit = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!hit) {
    console.error('Chrome not found. Set CHROME_PATH to your Chrome binary.');
    process.exit(1);
  }
  return hit;
}

function dumpDom(chrome, file) {
  return execFileSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=6000',
      '--dump-dom',
      'file:///' + file.replace(/\\/g, '/'),
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
  );
}

/**
 * Canonicalize a DOM dump so that only structural differences survive.
 *
 * Indentation is expected to differ — the partials are formatted for humans,
 * the old template literals were not — so inter-tag whitespace goes. JSON-LD
 * is re-serialized because the source is now pretty-printed where it used to
 * be JSON.stringify output; semantically identical, textually not.
 */
function canonical(html) {
  let out = html;

  out = out.replace(
    /(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (m, open, body, close) => {
      try {
        return open + JSON.stringify(JSON.parse(body)) + close;
      } catch {
        return m; // leave malformed JSON visible rather than hiding it
      }
    }
  );

  // --- things Phase 4 changes on purpose ---
  //
  // The gate is not asking "is the output identical" any more — it cannot be,
  // the site is multi-locale now. It asks the narrower question that still
  // matters: is the *content and structure* of the English page unchanged?
  // So the deliberate URL-level changes are normalized away, and anything else
  // that moved still fails.

  // Pages moved into /en/, so canonical and og:url gained a segment.
  out = out.split('agree-tech.com/en/').join('agree-tech.com/');

  // hreflang alternates are new.
  out = out.replace(/<link rel="alternate"[^>]*>/gi, '');

  // The language switcher is new.
  out = out.replace(/<div class="lang-switch"[\s\S]*?<\/div>/i, '');

  // Phase 5 adds the CMS invite hop to the homepages.
  out = out.replace(/<script>[^<]*invite_token[^<]*<\/script>/gi, '');

  // Assets are shared at the dist root, so their refs became absolute.
  out = out.replace(/(href|src)="\/(styles\.css|shared\.css|subpage\.css|shared\.js|assets\/)/g, '$1="$2');

  out = out
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();

  return out;
}

function firstDifference(a, b) {
  const len = Math.min(a.length, b.length);
  let i = 0;
  while (i < len && a[i] === b[i]) i++;
  const from = Math.max(0, i - 90);
  return {
    index: i,
    baseline: a.slice(from, i + 130),
    built: b.slice(from, i + 130),
  };
}

function main() {
  const baselineDir = process.argv[2];
  if (!baselineDir || !fs.existsSync(baselineDir)) {
    console.error('Usage: node tools/verify-dom.js <baseline-dir>');
    process.exit(1);
  }
  if (!fs.existsSync(DIST)) {
    console.error('dist/ does not exist — run `npm run build` first.');
    process.exit(1);
  }

  const chrome = findChrome();
  const pages = fs
    .readdirSync(DIST)
    .filter((f) => f.endsWith('.html'))
    .sort();

  const same = [];
  const differ = [];

  for (const page of pages) {
    const basePage = path.join(baselineDir, page);
    if (!fs.existsSync(basePage)) {
      console.log(`  ? ${page} — no baseline, skipped`);
      continue;
    }

    const a = canonical(dumpDom(chrome, basePage));
    const b = canonical(dumpDom(chrome, path.join(DIST, page)));

    if (a === b) {
      same.push(page);
      console.log(`  = ${page}`);
    } else {
      differ.push({ page, ...firstDifference(a, b) });
      console.log(`  ~ ${page}  (DOM differs)`);
    }
  }

  console.log(`\nidentical DOM : ${same.length}/${same.length + differ.length}`);

  if (differ.length) {
    for (const d of differ) {
      console.log(`\n--- ${d.page} — first difference at char ${d.index} ---`);
      console.log(`baseline: …${d.baseline}…`);
      console.log(`built   : …${d.built}…`);
    }
    console.error('\nFAIL — the refactor changed the rendered DOM.');
    process.exit(1);
  }

  console.log('\nPASS — every page renders an identical DOM to the baseline.');
}

main();

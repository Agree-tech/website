#!/usr/bin/env node
/**
 * verify-parity.js — the acceptance gate for the move to Payload.
 *
 * Builds the site twice — once from content/ on disk, once from the CMS — and
 * requires the two dist/ trees to be identical byte for byte. Both the strings
 * and the page structure come from the side under test, so this covers the
 * whole path an editor touches.
 *
 * That is the whole argument for the migration being safe. The templates, the
 * locale fallback, the coverage thresholds and the SEO output are untouched by
 * it; the only thing that changed is where the strings come from. If both
 * sources render the same bytes, then nothing was lost on the way into the
 * database — no dropped key, no smart quote turned into an entity, no locale
 * quietly falling back to English and reporting itself as translated.
 *
 * Needs the CMS running and seeded:
 *
 *     cd cms && docker compose up -d && npm run seed && npm run dev
 *     npm run verify:parity
 *
 * Exits non-zero on any difference so it can gate CI.
 */

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3001';

function build(args) {
  execFileSync(process.execPath, [path.join(ROOT, 'build.js'), ...args], {
    cwd: ROOT,
    stdio: 'pipe',
  });
}

/** Relative path -> sha256, for every file under dir. */
function hashTree(dir, base = dir, out = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) hashTree(full, base, out);
    else out.set(path.relative(base, full).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'));
  }
  return out;
}

async function reachable(url) {
  try {
    const res = await fetch(`${url}/api/globals/page-nav-main?depth=0`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await reachable(PAYLOAD_URL))) {
    console.error(`Cannot reach the CMS at ${PAYLOAD_URL}.`);
    console.error('Start it with:  cd cms && docker compose up -d && npm run dev');
    process.exit(1);
  }

  console.log('building from content/ (strings and layout on disk) ...');
  build(['--from-blocks']);
  const fromDisk = hashTree(DIST);

  // Kept out of the build's way so the second build starts from a clean dist/.
  const stash = fs.mkdtempSync(path.join(os.tmpdir(), 'parity-'));
  fs.cpSync(DIST, stash, { recursive: true });

  console.log(`building from the CMS at ${PAYLOAD_URL} (strings and layout) ...`);
  build(['--from-blocks', '--from-payload']);
  const fromCms = hashTree(DIST);

  fs.rmSync(stash, { recursive: true, force: true });

  const differ = [];
  const onlyDisk = [];
  const onlyCms = [];

  for (const [file, hash] of fromDisk) {
    if (!fromCms.has(file)) onlyDisk.push(file);
    else if (fromCms.get(file) !== hash) differ.push(file);
  }
  for (const file of fromCms.keys()) if (!fromDisk.has(file)) onlyCms.push(file);

  console.log(`\ncompared  : ${fromDisk.size} files`);
  console.log(`identical : ${fromDisk.size - differ.length - onlyDisk.length}`);

  for (const [label, list] of [
    ['differ', differ],
    ['only in the JSON build', onlyDisk],
    ['only in the CMS build', onlyCms],
  ]) {
    if (!list.length) continue;
    console.log(`${label} : ${list.length}`);
    list.forEach((f) => console.log(`    ~ ${f}`));
  }

  if (differ.length || onlyDisk.length || onlyCms.length) {
    console.error('\nFAIL — the CMS does not reproduce the site.');
    process.exit(1);
  }

  console.log('\nPASS — the CMS reproduces the site byte for byte.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * verify-baseline.js — the Phase 1 acceptance gate.
 *
 * Hashes every file in dist/ that the pre-build site also had, and compares
 * against tools/baseline.sha256 (captured before the build step existed).
 *
 * A clean pass proves the build pipeline is transparent: it moved the site
 * through src/ -> build.js -> dist/ without altering a single byte. That is
 * what makes it safe to start transforming content in Phase 3 — any later
 * drift in the English output shows up here as a diff.
 *
 * Exits non-zero on any mismatch so it can gate CI.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const MANIFEST = path.join(__dirname, 'baseline.sha256');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ does not exist — run `npm run build` first.');
    process.exit(1);
  }

  const expected = fs
    .readFileSync(MANIFEST, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, name] = line.split(/\s+/);
      return { hash, name };
    });

  const ok = [];
  const changed = [];
  const missing = [];

  for (const { hash, name } of expected) {
    const target = path.join(DIST, name);
    if (!fs.existsSync(target)) {
      missing.push(name);
      continue;
    }
    if (sha256(target) === hash) ok.push(name);
    else changed.push(name);
  }

  console.log(`identical : ${ok.length}/${expected.length}`);
  if (changed.length) {
    console.log(`changed   : ${changed.length}`);
    changed.forEach((n) => console.log(`    ~ ${n}`));
  }
  if (missing.length) {
    console.log(`missing   : ${missing.length}`);
    missing.forEach((n) => console.log(`    - ${n}`));
  }

  if (changed.length || missing.length) {
    console.error('\nFAIL — dist/ differs from the pre-build baseline.');
    process.exit(1);
  }

  console.log('\nPASS — dist/ is byte-identical to the pre-build site.');
}

main();

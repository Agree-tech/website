#!/usr/bin/env node
/**
 * build.js — Agree Technologies static site build
 *
 * Phase 1: src/ -> dist/ passthrough. No content transformation yet.
 *
 * The acceptance gate for this phase is that dist/ is byte-identical to the
 * pre-build site (see `npm run verify`). Every later phase adds a transform
 * inside render() and keeps that gate meaningful for the English locale.
 *
 * Source files use CRLF line endings and no BOM. Nothing here may normalize
 * either — pages round-trip as utf8 strings, static files copy as bytes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

/** Copied verbatim from the repo root. */
const STATIC_FILES = [
  'styles.css',
  'shared.css',
  'subpage.css',
  'shared.js',
  'robots.txt',
  'sitemap.xml',
];

/** Copied verbatim, recursively, from the repo root. */
const STATIC_DIRS = ['assets'];

/** Partials loaded once per build from src/_*.html */
function loadPartial(name) {
  return fs.readFileSync(path.join(SRC, name), 'utf8').replace(/\r?\n$/, '');
}

/**
 * Read the per-page globals the templates depend on. Every page carries a line
 * like `<script>window.AT_PAGE='billing'; window.AT_NAV_DARK=true;</script>`
 * ahead of the nav mount; that stays the page's own declaration of intent, we
 * just read it at build time instead of at runtime.
 */
function readPageConfig(html) {
  const pageMatch = html.match(/window\.AT_PAGE\s*=\s*['"]([^'"]*)['"]/);
  const darkMatch = html.match(/window\.AT_NAV_DARK\s*=\s*true/);
  return {
    page: pageMatch ? pageMatch[1] : '',
    onDark: Boolean(darkMatch),
  };
}

/**
 * Nav, themed for the page it lands on, with the active link marked.
 *
 * The active-link styling reproduces byte-for-byte what shared.js used to set
 * via el.style — including the browser's own serialization of the attribute —
 * so the rendered DOM is unchanged. tools/verify-dom.js is what proves it.
 */
function renderNav(navTemplate, { page, onDark }, pageFile) {
  let nav = navTemplate
    .replace('{{topbarDark}}', onDark ? ' on-dark' : '')
    .replace('{{logoFile}}', onDark ? 'logo-white' : 'logo-black')
    .replace('{{btnSecondary}}', onDark ? 'btn-outline-dark' : 'btn-ghost')
    .replace('{{btnPrimary}}', onDark ? 'btn-cyan' : 'btn-primary');

  // Previously: shared.js matched location.pathname.endsWith(href) at runtime.
  nav = nav.replace(
    /<a class="nav-link" href="([^"]+)">/g,
    (match, href) =>
      pageFile.endsWith(href)
        ? `<a class="nav-link" href="${href}" style="color: var(--navy); background: var(--cloud);">`
        : match
  );

  return nav;
}

/** Indent a partial to sit tidily where it is injected. */
function indent(block, spaces) {
  const pad = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n');
}

/**
 * Transform a single page.
 *
 * Phase 2: inline the nav, footer and JSON-LD that shared.js used to inject at
 * runtime, so they exist in the shipped HTML for crawlers that do not run JS.
 *
 * Phase 3 will substitute [data-i18n] keys here; Phase 4 will take a locale.
 */
function render(html, partials, pageFile /*, locale */) {
  const config = readPageConfig(html);

  let out = html;

  // JSON-LD into <head>, matching where shared.js appended it.
  out = out.replace('</head>', `${indent(partials.jsonld, 0)}\n</head>`);

  // outerHTML replacement — the mount points themselves are consumed.
  out = out.replace(
    '<div id="site-nav"></div>',
    renderNav(partials.nav, config, pageFile)
  );
  out = out.replace('<div id="site-foot"></div>', partials.foot);

  return out;
}

function listPages() {
  return fs
    .readdirSync(SRC)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !f.startsWith('_')) // partials, from Phase 2 onward
    .sort();
}

function build() {
  const started = Date.now();

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const partials = {
    nav: loadPartial('_nav.html'),
    foot: loadPartial('_foot.html'),
    jsonld: loadPartial('_jsonld.html'),
  };

  const pages = listPages();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(SRC, page), 'utf8');
    fs.writeFileSync(path.join(DIST, page), render(html, partials, page), 'utf8');
  }

  let staticCount = 0;
  for (const file of STATIC_FILES) {
    const from = path.join(ROOT, file);
    if (!fs.existsSync(from)) {
      console.warn(`  ! missing static file, skipped: ${file}`);
      continue;
    }
    fs.copyFileSync(from, path.join(DIST, file));
    staticCount++;
  }

  for (const dir of STATIC_DIRS) {
    const from = path.join(ROOT, dir);
    if (!fs.existsSync(from)) {
      console.warn(`  ! missing static dir, skipped: ${dir}/`);
      continue;
    }
    fs.cpSync(from, path.join(DIST, dir), { recursive: true });
    staticCount += fs.readdirSync(from).length;
  }

  console.log(
    `built ${pages.length} pages + ${staticCount} static files -> dist/ (${Date.now() - started}ms)`
  );
}

build();

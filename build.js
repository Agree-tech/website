#!/usr/bin/env node
/**
 * build.js — Agree Technologies static site build
 *
 * src/*.html are templates carrying {{i18n:key}} placeholders (see
 * tools/extract.js). This renders one static copy per locale:
 *
 *   dist/en/index.html   dist/da/index.html   dist/pl/index.html
 *
 * Real HTML per language at its own URL, rather than swapping text with
 * JavaScript at runtime — that is what makes each locale independently
 * indexable.
 *
 * Source files use CRLF line endings and no BOM. Nothing here may normalize
 * either — pages round-trip as utf8 strings, static files copy as bytes.
 */

const fs = require('fs');
const path = require('path');
const { buildConfig } = require('./tools/cms-config.js');
const { localize } = require('./tools/localize.js');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');

const SITE = 'https://www.agree-tech.com';

/**
 * `da` not `dk`: dk is the country code for Denmark, the language subtag for
 * Danish is `da`, and Google ignores an invalid hreflang outright.
 */
const LOCALES = [
  { code: 'en', lang: 'en', label: 'English', isDefault: true },
  { code: 'da', lang: 'da', label: 'Dansk' },
  { code: 'pl', lang: 'pl', label: 'Polski' },
];

/** English-only: it is Disallowed in robots.txt and not worth translating. */
const DEFAULT_LOCALE_ONLY = new Set(['index-print.html']);

/**
 * A locale below this much coverage is built and browsable — translators need
 * to preview it — but marked noindex and kept out of the sitemap and hreflang
 * set. An untranslated locale is a byte-identical copy of the English site at
 * a second URL, which is duplicate content, not a translation.
 */
const MIN_INDEXABLE_COVERAGE = 0.9;

/** Copied verbatim to the dist root, shared by every locale. */
const STATIC_FILES = ['styles.css', 'shared.css', 'subpage.css', 'shared.js', 'robots.txt'];
const STATIC_DIRS = ['assets'];

/** Root-relative so they resolve from any locale directory. */
const ASSET_REFS = ['styles.css', 'shared.css', 'subpage.css', 'shared.js'];

/**
 * The CMS commits here, never straight to the branch that publishes. An edit
 * becomes a Netlify branch deploy the editor can look at, and only a merge
 * makes it live.
 */
const CMS_BRANCH = 'draft';

/**
 * `node build.js --local-cms` puts local_backend into the CMS config, so the
 * editor at /admin/ can be opened against this checkout with `npx decap-server`
 * running, without Netlify Identity. Never part of a deploy: Netlify runs the
 * plain build.
 */
const LOCAL_CMS = process.argv.includes('--local-cms');

/**
 * Netlify Identity mails an invite to the site root with the token in the URL
 * fragment, and a fragment is invisible to a server-side redirect rule — so
 * the hop has to happen in the browser, on the page the root lands on.
 *
 * Inlined and guarded rather than loading the Identity widget site-wide: this
 * costs visitors 130 bytes and no request, where the widget would put ~40KB of
 * third-party JavaScript on the homepage to serve one invite a year.
 */
const INVITE_HOP =
  '<script>if(/[#&](invite_token|recovery_token|email_change_token)=/.test(location.hash))' +
  'location.replace("/admin/"+location.hash);</script>';

// ---------------------------------------------------------------------------

function loadPartial(name) {
  return fs.readFileSync(path.join(SRC, name), 'utf8').replace(/\r?\n$/, '');
}

function readPageConfig(html) {
  const pageMatch = html.match(/window\.AT_PAGE\s*=\s*['"]([^'"]*)['"]/);
  const darkMatch = html.match(/window\.AT_NAV_DARK\s*=\s*true/);
  return { page: pageMatch ? pageMatch[1] : '', onDark: Boolean(darkMatch) };
}

/** Links to the current page in every other locale. */
function renderLangSwitcher(locale, pageFile) {
  const items = LOCALES.map((l) =>
    l.code === locale.code
      ? `<span class="lang-current" aria-current="true">${l.code.toUpperCase()}</span>`
      : `<a class="lang-link" href="/${l.code}/${pageFile}" hreflang="${l.lang}" lang="${l.lang}">${l.code.toUpperCase()}</a>`
  ).join('\n        ');
  return `<div class="lang-switch" aria-label="Language">\n        ${items}\n      </div>`;
}

function renderNav(navTemplate, { onDark }, pageFile, locale) {
  let nav = navTemplate
    .replace('{{topbarDark}}', onDark ? ' on-dark' : '')
    .replace('{{logoFile}}', onDark ? 'logo-white' : 'logo-black')
    .replace('{{btnSecondary}}', onDark ? 'btn-outline-dark' : 'btn-ghost')
    .replace('{{btnPrimary}}', onDark ? 'btn-cyan' : 'btn-primary')
    .replace('{{langSwitcher}}', renderLangSwitcher(locale, pageFile));

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

/** The canonical path for a page within a locale, as it appears in a URL. */
function urlPath(locale, pageFile) {
  return pageFile === 'index.html'
    ? `/${locale.code}/`
    : `/${locale.code}/${pageFile}`;
}

/** Assets live at the dist root and are shared, so make their refs absolute. */
function absolutizeAssets(html) {
  let out = html;
  for (const ref of ASSET_REFS) {
    out = out.split(`href="${ref}"`).join(`href="/${ref}"`);
    out = out.split(`src="${ref}"`).join(`src="/${ref}"`);
  }
  out = out.split('src="assets/').join('src="/assets/');
  out = out.split('href="assets/').join('href="/assets/');
  return out;
}

/**
 * Rewrite everything that depends on which locale directory the page lands in:
 * asset paths, the language tag, canonical/og:url, and the hreflang set.
 */
function localizeUrls(html, locale, pageFile, localesForPage, indexable) {
  let out = html;

  if (!indexable) {
    out = out.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      '<meta name="robots" content="noindex, follow" />'
    );
  }

  out = absolutizeAssets(out);

  out = out.replace(/<html lang="[^"]*">/, `<html lang="${locale.lang}">`);

  // Move the EXISTING canonical target into this locale, rather than forcing it
  // to the page's own URL. index-print.html deliberately canonicalises to the
  // homepage; overwriting that would point a noindex duplicate at itself.
  const intoLocale = (p) => `${SITE}/${locale.code}${p === '/' ? '/' : p}`;

  out = out.replace(
    /<link rel="canonical" href="[^"]*?agree-tech\.com(\/[^"]*)" \/>/,
    (_, p) => `<link rel="canonical" href="${intoLocale(p)}" />`
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*?agree-tech\.com(\/[^"]*)" \/>/,
    (_, p) => `<meta property="og:url" content="${intoLocale(p)}" />`
  );

  const alternates = localesForPage
    .map(
      (l) =>
        `<link rel="alternate" hreflang="${l.lang}" href="${SITE}${urlPath(l, pageFile)}" />`
    )
    .concat(
      `<link rel="alternate" hreflang="x-default" href="${SITE}${urlPath(
        LOCALES.find((l) => l.isDefault),
        pageFile
      )}" />`
    )
    .join('\n');

  out = out.replace('</head>', `${alternates}\n</head>`);

  return out;
}

/** The page template with nav, footer and JSON-LD inlined; placeholders intact. */
function compose(html, partials, pageFile, locale) {
  const config = readPageConfig(html);

  let out = html;
  out = out.replace('</head>', `${partials.jsonld}\n</head>`);
  out = out.replace(
    '<div id="site-nav"></div>',
    renderNav(partials.nav, config, pageFile, locale)
  );
  out = out.replace('<div id="site-foot"></div>', partials.foot);
  return out;
}

function render(html, partials, pageFile, locale, strings, fallback, missing) {
  return localize(compose(html, partials, pageFile, locale), strings, fallback, missing);
}

function listPages() {
  return fs
    .readdirSync(SRC)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !f.startsWith('_'))
    .sort();
}

/**
 * Content is stored one file per page, one object per section, so that the CMS
 * can present 14 navigable entries instead of a single 908-field form. The
 * build wants none of that structure — it wants the flat page.section.field
 * keys the templates were written against — so the shape collapses on load.
 *
 * Blank values are dropped rather than kept. The CMS commits seen so far omit
 * fields the editor never touched, but a field that is cleared can be saved as
 * an empty string; treating that as translated would publish a blank element
 * instead of falling back to English, and would report the locale as further
 * along than it is.
 */
function loadContent(code) {
  const dir = path.join(CONTENT, code);
  if (!fs.existsSync(dir)) return {};

  const flat = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const page = file.replace(/\.json$/, '');
    const sections = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const [section, fields] of Object.entries(sections)) {
      for (const [field, value] of Object.entries(fields)) {
        if (typeof value !== 'string' || !value.trim()) continue;
        flat[`${page}.${section}.${field}`] = value;
      }
    }
  }
  return flat;
}

function writeSitemap(pages, indexable) {
  const urls = [];
  for (const page of pages) {
    const locales = DEFAULT_LOCALE_ONLY.has(page)
      ? indexable.filter((l) => l.isDefault)
      : indexable;
    for (const locale of locales) {
      const alts = locales
        .map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${SITE}${urlPath(l, page)}"/>`
        )
        .join('\n');
      urls.push(
        `  <url>\n    <loc>${SITE}${urlPath(locale, page)}</loc>\n${alts}\n  </url>`
      );
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') +
    '\n</urlset>\n';

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
  return urls.length;
}

/**
 * A static redirect, not JavaScript language sniffing — crawlers handle a
 * meta refresh and a 302 predictably.
 *
 * The root rule is forced (302!). dist/index.html exists at the same path, and
 * Netlify serves an existing file in preference to an unforced rule, so
 * without the "!" visitors got a 200 meta refresh instead of the 302 the rule
 * promised. dist/index.html stays for local static servers, which do not read
 * _redirects. An invite link's #fragment survives the 302 — browsers carry it
 * onto the Location target — so the hop on /en/ still catches it.
 */
function writeRootRedirect() {
  const def = LOCALES.find((l) => l.isDefault);
  fs.writeFileSync(
    path.join(DIST, 'index.html'),
    `<!doctype html>
<html lang="${def.lang}">
<head>
<meta charset="utf-8" />
<title>Agree Technologies</title>
<link rel="canonical" href="${SITE}/${def.code}/" />
${INVITE_HOP}
<meta http-equiv="refresh" content="0; url=/${def.code}/" />
</head>
<body><p>Redirecting to <a href="/${def.code}/">/${def.code}/</a></p></body>
</html>
`,
    'utf8'
  );

  // Old flat URLs kept ranking, so they redirect permanently.
  const lines = listPages()
    .filter((p) => p !== 'index.html')
    .map((p) => `/${p}  /${def.code}/${p}  301!`);
  lines.unshift(`/  /${def.code}/  302!`);
  fs.writeFileSync(path.join(DIST, '_redirects'), lines.join('\n') + '\n', 'utf8');
}

/**
 * Any deploy that is not the real site serves pages near-identical to it, so
 * without this it would compete with agree-tech.com in search results.
 *
 * "Not the real site" is deliberately not just CONTEXT !== 'production':
 * agree-tech.netlify.app builds in the production context too, and until the
 * custom domain is attached it is a staging site wearing a production label.
 * Keying on Netlify's URL instead means this switches itself off at cutover,
 * the moment the primary domain becomes agree-tech.com — no edit required.
 *
 * The comparison is by hostname with "www." stripped, so it does not matter
 * whether the primary domain in Netlify is set as the apex or as www. A
 * prefix match against SITE would have kept the live site noindex forever if
 * the apex were chosen, with nothing but a build-log line to say so.
 *
 * No CONTEXT at all means a local build, which nobody can crawl.
 */
function isLiveUrl(url) {
  const bare = (host) => host.replace(/^www\./, '');
  try {
    return bare(new URL(url).hostname) === bare(new URL(SITE).hostname);
  } catch {
    return false;
  }
}

function writeStagingHeaders() {
  const ctx = process.env.CONTEXT;
  if (!ctx) return null;
  const primary = process.env.URL || '';
  if (ctx === 'production' && isLiveUrl(primary)) return null;
  fs.writeFileSync(path.join(DIST, '_headers'), '/*\n  X-Robots-Tag: noindex\n', 'utf8');
  return primary ? `${ctx} @ ${primary}` : ctx;
}

/**
 * The CMS is a single static page plus a config file describing every editable
 * field. The config is generated from content/en/ on each build so that adding
 * a key to a template is all it takes for the key to appear in the editor —
 * there is no second list to keep in step.
 *
 * Beside it goes what the live preview (admin/preview.js) needs: every page
 * template with nav, footer and JSON-LD already inlined and asset paths made
 * absolute, but placeholders left in place, plus each locale's strings and the
 * list of entries to register for. The preview substitutes the entry being
 * edited into its template in the browser with the same localize() this build
 * uses, so the pane shows the page as it will deploy.
 */
function writeAdmin(partials, content) {
  const outDir = path.join(DIST, 'admin');
  const previewDir = path.join(outDir, 'preview');
  fs.mkdirSync(previewDir, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'admin', 'index.html'), path.join(outDir, 'index.html'));
  fs.copyFileSync(path.join(ROOT, 'admin', 'preview.js'), path.join(outDir, 'preview.js'));
  fs.copyFileSync(path.join(ROOT, 'tools', 'localize.js'), path.join(outDir, 'localize.js'));

  const def = LOCALES.find((l) => l.isDefault);
  const pages = listPages();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(SRC, page), 'utf8');
    fs.writeFileSync(
      path.join(previewDir, page),
      absolutizeAssets(compose(html, partials, page, def)),
      'utf8'
    );
  }
  fs.writeFileSync(
    path.join(previewDir, 'data.json'),
    JSON.stringify({
      pages: pages.map((p) => p.replace(/\.html$/, '')).concat(Object.keys(partials)),
      strings: content,
    }),
    'utf8'
  );

  const { yaml, fieldCount } = buildConfig({
    contentDir: CONTENT,
    srcDir: SRC,
    locales: LOCALES,
    defaultLocaleOnly: DEFAULT_LOCALE_ONLY,
    siteUrl: process.env.URL || SITE,
    branch: CMS_BRANCH,
    localBackend: LOCAL_CMS,
  });
  fs.writeFileSync(path.join(outDir, 'config.yml'), yaml, 'utf8');
  return fieldCount;
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
  const content = {};
  for (const locale of LOCALES) content[locale.code] = loadContent(locale.code);
  const en = content.en;
  const totalKeys = Object.keys(en).length;

  /**
   * Keys belonging to pages this locale never builds. index-print is English
   * only, so its keys are unreachable for da and pl — counting them in the
   * denominator caps a fully translated locale at 87% and leaves it noindex
   * forever. Coverage has to be measured against what the locale can actually
   * translate, not against every key in the project.
   */
  const unreachable = new Set(
    Object.keys(en).filter((k) => DEFAULT_LOCALE_ONLY.has(`${k.split('.')[0]}.html`))
  );

  // Coverage decides indexability, so it has to be known before rendering.
  for (const locale of LOCALES) {
    const translatable = locale.isDefault ? totalKeys : totalKeys - unreachable.size;
    const provided = Object.keys(content[locale.code]).filter((k) => k in en).length;
    locale.translated = provided;
    locale.translatable = translatable;
    locale.indexable =
      locale.isDefault || (translatable > 0 && provided / translatable >= MIN_INDEXABLE_COVERAGE);
  }
  const indexable = LOCALES.filter((l) => l.indexable);

  const coverage = [];

  for (const locale of LOCALES) {
    const outDir = path.join(DIST, locale.code);
    fs.mkdirSync(outDir, { recursive: true });

    const missing = new Set();
    let written = 0;

    for (const page of pages) {
      if (DEFAULT_LOCALE_ONLY.has(page) && !locale.isDefault) continue;

      const localesForPage = DEFAULT_LOCALE_ONLY.has(page)
        ? indexable.filter((l) => l.isDefault)
        : indexable;

      const html = fs.readFileSync(path.join(SRC, page), 'utf8');
      let out = render(
        html,
        partials,
        page,
        locale,
        content[locale.code],
        locale.isDefault ? null : en,
        missing
      );
      out = localizeUrls(out, locale, page, localesForPage, locale.indexable);

      // Only the homepages: / redirects to a locale homepage, so that is where
      // an invite link with a token fragment actually arrives.
      if (page === 'index.html') out = out.replace('</head>', INVITE_HOP + '\r\n</head>');

      fs.writeFileSync(path.join(outDir, page), out, 'utf8');
      written++;
    }

    // Coverage is what the locale file actually provides — not what this build
    // happened to encounter. Pages excluded from a locale (index-print) would
    // otherwise make an empty locale look partly translated.
    coverage.push({ locale, written, fellBack: missing.size, missingKeys: missing, translated: locale.translated });
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
    if (!fs.existsSync(from)) continue;
    fs.cpSync(from, path.join(DIST, dir), { recursive: true });
    staticCount += fs.readdirSync(from).length;
  }

  writeRootRedirect();
  const staging = writeStagingHeaders();
  const sitemapUrls = writeSitemap(pages, indexable);
  const cmsFields = writeAdmin(partials, content);

  for (const c of coverage) {
    const total = c.locale.translatable;
    const pct = total ? Math.round((c.translated / total) * 100) : 0;
    const index = c.locale.indexable ? 'indexed' : 'noindex';
    const note = c.fellBack
      ? `${c.translated}/${total} translated (${pct}%, ${index}) — ${c.fellBack} fell back to English`
      : `${c.translated}/${total} translated (${pct}%, ${index})`;
    console.log(`  ${c.locale.code}  ${String(c.written).padStart(2)} pages  ${note}`);
  }

  console.log(
    `\nbuilt ${LOCALES.length} locales + ${staticCount} static files, ${sitemapUrls} sitemap URLs -> dist/ (${Date.now() - started}ms)`
  );
  console.log(`admin/ CMS: ${cmsFields} editable fields on branch "${CMS_BRANCH}"`);
  if (staging) console.log(`context "${staging}" — whole deploy marked noindex via dist/_headers`);

  // English has no fallback, so a key it lacks is a raw placeholder on every
  // locale's page. Only a developer can cause this — the CMS marks every
  // English field required — and the deploy must fail rather than ship it.
  const enGap = coverage.find((c) => c.locale.isDefault).missingKeys;
  if (enGap.size) {
    console.error(`\nERROR: ${enGap.size} placeholder(s) have no English value — the raw key is on the page:`);
    for (const key of [...enGap].sort()) console.error(`  ${key}`);
    console.error('Add the value under its section in content/en/<page>.json.');
    process.exitCode = 1;
  }
}

build();

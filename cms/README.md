# cms/ — Payload trial

A Payload instance that owns the site's copy. It is **headless**: the static
build in `../` still renders every page, it just asks Payload for the strings
instead of reading `content/*.json`. No page was rewritten, and the deployed
HTML is unchanged — `npm run verify:parity` proves that byte for byte.

## Running it

```
cd cms
docker compose up -d      # Postgres on :5433
cp .env.example .env      # then edit PAYLOAD_SECRET
npm install
npm run seed              # loads ../content into the database, makes an admin user
npm run dev               # editor at http://localhost:3001/admin
```

Then, from the repository root:

```
npm run build:payload     # render the site from the CMS
npm run verify:parity     # prove it matches the content/*.json build exactly
```

`npm run seed` prints the admin credentials it creates. They are a default —
change the password on first login, or set `SEED_EMAIL` / `SEED_PASSWORD`.

## How the content model gets here

Nothing in this directory describes the site's fields by hand. `payload.config.ts`
imports `globals.generated.ts`, which `scripts/generate-globals.mjs` writes from
`../tools/cms-config.js` — the same function that prints the Decap config. Page
order, section names taken from headings, and field labels taken from the
English text are therefore identical in both editors, and neither can drift from
the templates. Add a `{{i18n:}}` placeholder to a template, run the build, and
the field appears in both.

The generated file is gitignored and rewritten on every `dev` and `build`.

## Two things that shaped the schema

**A global per section, not per page.** The obvious shape is one global per page
with sections as groups inside it. It cannot be read back. Payload stores a
group's fields as columns on one table, and a localized global keeps them in a
companion `_locales` table read through

```sql
json_group_array(json_array("col1", "col2", ..., "_locale"))
```

— one argument per column. Postgres caps function arguments at 100
(`FUNC_MAX_ARGS`, compile-time, error 54023) and SQLite at 127. The homepage has
183 translatable strings, so as a single global it fails on both. Sections are
the natural unit below a page and the widest is 42 fields. It also reads better:
the sidebar groups each page's sections under the page name, so a page is a
table of contents rather than one 183-field form.

**Postgres, not SQLite.** Same reason. SQLite was the first choice because it
needs no service, and it is what the limit above ruled out first.

## Field names

Content keys are `[a-z0-9-]`; SQL columns cannot hold a hyphen, so `-` becomes
`_`. No content key contains `_`, which makes the swap exactly reversible and
means the build needs no lookup table to turn a Payload document back into the
`page.section.field` keys the templates use. `generate-globals.mjs` fails loudly
if a key ever arrives with an underscore in it, because that is the assumption
breaking.

## Moving off SQLite's replacement

`docker-compose.yml` is local convenience. To deploy, point `DATABASE_URI` at a
hosted Postgres — nothing in `payload.config.ts` changes but the connection
string. The static build reaches the CMS over HTTP via `PAYLOAD_URL`, so it can
build on Netlify against a Payload deployed anywhere.

The dev-server deployment - the image, the two services in the stack's
`dev.yml`, the nginx blocks and why it needs migrations - is [DEPLOY.md](DEPLOY.md).

## Keeping git as the record of what shipped

Editing happens in the database; `content/` is what actually deployed. Bringing
them back into step is one command, run from the repository root:

```
npm run export          # write the CMS back to content/*.json and layout.json
npm run verify:export   # report drift and exit 1 — for CI
```

The export writes exactly the files the build already reads, so `git log` still
answers who changed a line and when, a content change is reviewable as a diff,
and rolling one back is `git revert` rather than an appeal to a database backup.

On the deployed CMS this is the **Publish site** button under the nav links:
`src/lib/publish.ts` clones the branch Netlify builds, runs this same export
against the running server, and pushes a commit authored by the editor who
pressed it. The export also copies new uploads into `assets/`, because the
deploy builds from git without the CMS and an image that exists only in the
database is a 404 on the live page. What the button needs from the server — a
token, and which branch — is in [DEPLOY.md](DEPLOY.md). The command above is
the same thing by hand, and the fallback.

**The CMS wins.** A local edit to `content/` that has not been seeded back is
overwritten — the same rule the seed states in reverse. Edit in one place.

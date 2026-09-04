# tools/

Build-time helpers. Nothing here is served.

## og-card.html

Source for `assets/og-default.png` (1200x630 social preview card).
`LOGO_SRC` is a placeholder replaced at render time.

Regenerate:

    sed "s|LOGO_SRC|file:///$(pwd)/assets/logo-white.png|" tools/og-card.html > /tmp/og.html
    chrome --headless --disable-gpu --hide-scrollbars \
           --force-device-scale-factor=1 --window-size=1200,630 \
           --virtual-time-budget=10000 \
           --screenshot=assets/og-default.png /tmp/og.html

## sort-content.js

Reorders `content/<locale>/*.json` so sections and fields follow the page,
top to bottom, the same order the CMS lists them in. Key order does not affect
the build; it keeps files and translation diffs readable.

    npm run sort            # rewrite files that are out of order
    npm run sort -- --check # report only, exit 1 if any are

## content-source.js

Where `build.js` gets its strings. Two implementations behind one shape — a flat
map of `page.section.field` — so the rest of the build does not know or care
which produced it:

- `fromDisk()` reads `content/<locale>/*.json`, the default.
- `fromPayload()` fetches the CMS in `cms/`, used by `node build.js --from-payload`.

Both promise that a *missing* key means "not translated", never "empty". The
HTTP side enforces that with `fallback-locale=none`; without it Payload would
substitute English and every locale would report itself fully translated.

## verify-parity.js

The acceptance gate for the CMS. Builds the site from `content/*.json` and again
from Payload, and requires the two `dist/` trees to be identical byte for byte.
Needs the CMS running and seeded.

    npm run verify:parity

`verify-baseline.js` above it is a Phase 1 gate and no longer passes: it hashes
flat `about.html` paths from before the build emitted `dist/<locale>/`.

## extract-blocks.js

Cuts each page template into an ordered list of blocks — the first half of
making pages composable, and deliberately the half that changes no markup:

    src/<page>.html  ->  shell/<page>.head.html
                       + blocks/<page>/*.html   (one per <section>)
                       + shell/<page>.tail.html

`content/layout.json` records the order, and is the file an editor's reordering
would write. The cut is on top-level `<section>` elements, which is already
where the content model draws its boundaries, so blocks and content sections
line up by construction. Whitespace and the dev comment before a section travel
with the block below them.

    npm run blocks          # rewrite blocks/ and shell/, verify the round-trip
    npm run build:blocks    # render the site from blocks instead of src/

The tool refuses to finish unless every page reassembles from its pieces byte
for byte, and `build:blocks` output is checked against the normal build the same
way. That equivalence is the whole point: until a page composed from parts is
provably the page we shipped, there is no safe way to let anyone rearrange it.

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

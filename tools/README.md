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

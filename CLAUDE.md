# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static marketing website for Agree Technologies' ATSuite platform — a CPQ (Configure, Price, Quote) and billing platform for B2B SaaS companies. The site is built with vanilla HTML, CSS, and JavaScript without any build tools or frameworks.

## Architecture

### Static Multi-Page Structure

The site consists of standalone HTML files that share common styles and components:

- **Main pages**: `index.html` (homepage), `about.html`, `contact.html`, `platform.html`, `implementation.html`
- **Solution pages**: `cpq.html`, `billing.html`, `subscription.html`, `process.html`, `sales.html`
- **Supplementary**: `index-print.html` (print-optimized version)

### Shared Component System

The site uses a client-side injection pattern for navigation and footer:

1. Each HTML page sets `window.AT_PAGE` (e.g., `'home'`, `'cpq'`) before loading `shared.js`
2. Each HTML page includes empty mount points: `<div id="site-nav"></div>` and `<div id="site-foot"></div>`
3. `shared.js` injects the navigation and footer HTML into these mount points
4. Navigation styling is controlled by `window.AT_NAV_DARK = true` for dark backgrounds (hero sections)

**Important**: When editing navigation or footer, modify the template strings in `shared.js:6-116`, not individual HTML files.

### Styling Architecture

Three-layer CSS system:

1. **styles.css** — Design system tokens (colors, typography, shadows) and base resets
2. **shared.css** — Reusable components (buttons, navigation, footer, cards, eyebrows)
3. **Page-specific styles** — Inline `<style>` blocks in each HTML file for page-unique components

### Design System

Key CSS custom properties defined in `styles.css:2-40`:

- **Colors**: Navy-based brand palette (`--navy`, `--blue`, `--cyan`, `--green`, `--violet`)
- **Typography**: Geist (display/body) and JetBrains Mono (monospace) from Google Fonts
- **Spacing**: Container max-width `--container: 1240px`
- **Shadows**: Card and pop shadows for depth

### Navigation Pattern

The navigation in `shared.js` implements:

- Sticky top bar with backdrop blur
- Mega menu dropdown for "Solutions" with icons and descriptions
- Active page highlighting based on `window.AT_PAGE`
- Theme switching (light/dark) based on `window.AT_NAV_DARK`
- Hover-based menu interactions (no click handlers)

## Content Structure

The `/uploads` directory contains markdown files with content documentation:

- `home.md` — Homepage content outline
- `about-agree-technologies-b2b-cpq-billing.md` — Company background
- `cpq-software-european-businesses.md`, `subscription-management-platform-b2b.md`, etc. — Solution-specific content
- `agree-tech-branding-colors-guide.md` — Brand color palette reference

These are reference materials, not build inputs.

## Common Patterns

### Page Structure Template

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Page Title · Agree Technologies</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:..." rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="shared.css" />
  <style>/* Page-specific styles */</style>
</head>
<body>
<script>window.AT_PAGE = 'page-key';</script>
<div id="site-nav"></div>

<!-- Page content -->

<div id="site-foot"></div>
<script src="shared.js"></script>
</body>
</html>
```

### Eyebrow Component

Small uppercase labels used throughout:

```html
<div class="eyebrow"><span class="dot"></span>CATEGORY · LABEL</div>
```

For dark backgrounds: `<div class="eyebrow on-dark">...`

### Button Variants

- `btn-primary` — Navy background
- `btn-blue` — Blue background
- `btn-cyan` — Cyan background
- `btn-ghost` — Outlined navy
- `btn-outline-dark` — Outlined white (for dark backgrounds)
- Add `btn-lg` for larger size

### Module Cards (4-module grid on homepage)

Uses accent color system with CSS custom properties:

- `acc-blue`, `acc-cyan`, `acc-green`, `acc-navy`, `acc-violet`
- Sets `--acc` (main color) and `--acc-soft` (background tint)
- Used in `styles.css:285-289` and throughout module components

## Development Workflow

### No Build Process

This is a static site with no build step. Changes to HTML/CSS/JS are immediately live when files are served.

### Local Development

Open HTML files directly in a browser, or use any static server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

### File Organization

- `/assets` — Images (logos, board member photos)
- `/uploads` — Content documentation markdown files
- Root — All HTML, CSS, and JS files

## Responsive Design

Breakpoints are defined per-page in inline styles:

- Large screens: Multi-column grids
- `max-width: 1000px` — Most grids collapse to single column
- `max-width: 920px` — Navigation links hidden
- `max-width: 600px` — Further spacing and typography adjustments

## Browser Support

Modern browsers only. Uses:

- CSS custom properties
- CSS Grid
- `backdrop-filter` (navigation blur)
- ES6+ JavaScript (arrow functions, template literals, `const`/`let`)

No IE11 support required.

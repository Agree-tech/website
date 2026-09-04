/**
 * localize.js — {{i18n:key}} substitution, shared by build.js and the CMS
 * preview (admin/preview.js). One implementation, so what an editor sees
 * while typing is produced by the same code that renders the deployed page:
 * same escaping, same emphasis handling, same fallback.
 *
 * CommonJS under node; a plain script exposing window.ATLocalize in the
 * browser. No dependencies either way.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ATLocalize = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function applyEmphasis(value, spec) {
    // spec is `span.accent` for a classed span, or `b` for a bare tag.
    const [tag, cls] = spec.split('.');
    const wrap = cls
      ? (inner) => `<${tag} class="${cls}">${inner}</${tag}>`
      : (inner) => `<${tag}>${inner}</${tag}>`;
    return value.replace(/\*([^*]+)\*/g, (_, inner) => wrap(inner));
  }

  /**
   * Swap {{i18n:key}} placeholders for their strings.
   *
   * A key missing from a target locale falls back to English and is counted, so
   * a half-translated locale is still a working page — never an empty element or
   * a raw key on screen. A key missing from English has nothing to fall back to:
   * the raw placeholder stays in place, and build() exits non-zero once the
   * summary is printed, so a deploy fails rather than shipping it.
   */
  function localize(html, strings, fallback, missing) {
    return html.replace(/\{\{i18n:([^}@]+)(?:@([^}]+))?\}\}/g, (raw, key, cls) => {
      let value;
      if (key in strings) value = strings[key];
      else if (fallback && key in fallback) {
        missing.add(key);
        value = fallback[key];
      } else {
        missing.add(key);
        return raw;
      }

      if (value.includes('<')) {
        throw new Error(
          `content value for "${key}" contains markup; values must be plain text`
        );
      }

      // Content is stored decoded so editors never see entities. Re-escape here.
      // `"` is included because 61 placeholders sit inside attributes (meta
      // content, alt, placeholder, aria-label): an unescaped quote there closes
      // the attribute and whatever follows becomes markup. &quot; renders as a
      // plain quote in text too, so one rule covers both contexts.
      // Emphasis is applied afterwards, since that step introduces real markup.
      const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      return cls ? applyEmphasis(escaped, cls) : escaped;
    });
  }

  return { applyEmphasis, localize };
});

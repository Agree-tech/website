/**
 * components.js — renders a block instance from a shared component template.
 *
 * A component is one HTML file with three kinds of hole in it:
 *
 *   {{slot:name}}        the instance's content key, resolved to the
 *                        {{i18n:page.section.key}} the templates already use
 *   {{prop:name}}        a literal string from the instance
 *   {{#if name}}…{{/if}} included when a prop or slot is present, with an
 *                        optional {{else}}
 *
 * Slots rather than keys because content keys are derived from the English
 * text, so every instance of a component has different ones — `a-book-a-demo`
 * on one page and `a-contact-me` on another. What is stable is the position:
 * eyebrow, heading, body, primary, secondary, in that order, every time. The
 * instance maps position to key and the component never learns either.
 *
 * A missing slot makes {{#if}} false, which is how one CTA band drops its
 * paragraph without needing a prop to say so.
 */

/** Nesting is not supported and not needed; keep components flat. */
const IF = /\{\{#if (\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

/**
 * A repeated child — the six cards of a feature grid, the four logos of an
 * integration row.
 *
 * The count is the instance's, not the component's, which is the whole point:
 * every feature grid on the site happens to have exactly six cards today, and
 * nothing about the markup requires that. Once the array is the thing being
 * rendered, a seventh card is data rather than a code change.
 */
const EACH = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

function render(template, instance, page, loadInclude) {
  const { section, props = {}, slots = {} } = instance;
  const has = (name) => {
    const v = name in slots ? slots[name] : props[name];
    return v !== undefined && v !== null && v !== false && v !== '';
  };

  let out = template;

  /**
   * Repeats first: each item is rendered as its own little instance, sharing
   * this one's page and section, so {{slot:}} and {{prop:}} mean the same thing
   * inside a card as outside it. An item's slots are its own content keys — the
   * six cards of a grid have six different sets — and its props its own markup,
   * which is how each card keeps its own icon.
   */
  out = out.replace(EACH, (raw, name, body) => {
    const items = props[name];
    if (!Array.isArray(items)) throw new Error(`component on "${page}" has no array prop "${name}"`);
    return items.map((item) => render(body, { ...item, section }, page, loadInclude)).join('');
  });

  // Conditionals first, so a false branch cannot leave a slot behind for the
  // substitutions below to fill in.
  // Nesting silently mis-parses — the inner {{/if}} would close the outer
  // block — so it is refused rather than rendered wrongly. Lift the inner
  // branch into a prop instead; components stay flat on purpose.
  for (const m of out.matchAll(IF)) {
    if (m[2].includes('{{#if ')) {
      throw new Error(`nested {{#if}} in a component on "${page}" — lift the inner branch into a prop`);
    }
  }
  IF.lastIndex = 0;

  let guard = 0;
  while (IF.test(out)) {
    IF.lastIndex = 0;
    out = out.replace(IF, (_, name, then, otherwise = '') => (has(name) ? then : otherwise));
    if (++guard > 10) throw new Error(`runaway {{#if}} in a component on "${page}"`);
  }

  // Hyphens allowed: a slot is often named after the content key it fills, and
  // content keys are hyphenated.
  out = out.replace(/\{\{slot:([\w-]+)(@[^}]+)?\}\}/g, (raw, name, emphasis = '') => {
    if (!(name in slots)) throw new Error(`component on "${page}" has no slot "${name}"`);
    return `{{i18n:${page}.${section}.${slots[name]}${emphasis}}}`;
  });

  out = out.replace(/\{\{prop:(\w+)\}\}/g, (raw, name) => {
    if (!(name in props)) throw new Error(`component on "${page}" has no prop "${name}"`);
    return String(props[name]);
  });

  /**
   * A named fragment pasted in verbatim — the mock dashboards and diagrams that
   * fill the right-hand side of a hero.
   *
   * These are the parts of the site that are drawings rather than content: five
   * hundred lines of hand-placed nodes, bars and SVG paths, each used by exactly
   * one page. Reuse has nothing to offer them, so they are not parameterised —
   * they keep their own {{i18n:}} keys and are included whole. What is shared is
   * the frame around them, which is the half that actually repeats.
   */
  out = out.replace(/\{\{include:(\w+)\}\}/g, (raw, name) => {
    if (!(name in props)) throw new Error(`component on "${page}" has no prop "${name}"`);
    if (!loadInclude) throw new Error(`component on "${page}" uses {{include:}} but no loader was given`);
    return loadInclude(String(props[name]));
  });

  const left = out.match(/\{\{(?!i18n:)[^}]*\}\}/);
  if (left) throw new Error(`unresolved ${left[0]} in a component on "${page}"`);

  return (instance.lead || '') + out;
}

module.exports = { render };

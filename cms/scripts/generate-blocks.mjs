#!/usr/bin/env node
/**
 * generate-blocks.mjs — projects content/layout.json into Payload block configs.
 *
 * Phase 2 turned every section of the site into a component instance: a
 * component name, some props, and a map from the component's slots to content
 * keys. That file is the page structure, and this turns it into a schema Payload
 * can put an editor in front of — one block type per component, one field per
 * prop, an array field for each repeating child.
 *
 * ## What a block holds
 *
 * Its words, one localized field per slot; its props — which page a button goes
 * to, whether a band is dark, an accent colour; and its repeating children as
 * array fields, so a seventh card is a row rather than an edit.
 *
 * It also keeps a hidden `slots` map. That is history: it says which content key
 * each slot was extracted from, so the build can go on emitting the keys the
 * templates were written against. A block created from scratch has no such map
 * and falls back to its slot names, which is what makes a new section possible
 * at all.
 *
 * Output is generated, gitignored and rewritten on every dev/build.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '..', '..')
const OUT = path.resolve(dirname, '..', 'src', 'blocks.generated.ts')

/** Props whose value is markup or a style attribute, not something to type into a box. */
const OPAQUE = new Set(['icon', 'bullet', 'lead', 'dotStyle', 'ledeStyle', 'ctasStyle', 'containerStyle', 'bodyClass', 'idAttr', 'style', 'visual', 'badgeClass'])

/** Friendly labels for the props an editor should actually recognise. */
const LABELS = {
  dark: 'Dark background',
  narrow: 'Narrow column',
  alt: 'Alternate background',
  flip: 'Visual on the left',
  arrow: 'Arrow on the second button',
  accent: 'Accent colour',
  primaryHref: 'First button links to',
  secondaryHref: 'Second button links to',
  primaryClass: 'First button style',
  secondaryClass: 'Second button style',
  image: 'Photo',
  badgeLetter: 'Badge letter',
}

const ACRONYMS = { cta: 'CTA', cpq: 'CPQ', q2c: 'Q2C', cfo: 'CFO', crm: 'CRM', href: 'link' }

/** "secondaryHref" and "page-hero-split" both have to read like English. */
const title = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => ACRONYMS[w] || w)
    .join(' ')
    .replace(/^./, (c) => c.toUpperCase())

/**
 * Every internal page, so a link field offers the whole site rather than only
 * the handful of destinations that happen to be in use. An editor pointing a
 * button somewhere new should not need a developer.
 */
function pageOptions(root) {
  return fs
    .readdirSync(path.join(root, 'src'))
    .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
    .sort()
}

function fieldFor(name, values, pages) {
  const kinds = new Set([...values].map((v) => (typeof v === 'boolean' ? 'bool' : 'str')))
  const base = { name, label: LABELS[name] || title(name) }

  // "No second button" is a real state — the about and contact heroes have one
  // button, not two — so an optional destination needs a way to say so.
  const optional = [...values].includes('')

  const withNone = (options) =>
    optional ? [{ label: '— none —', value: '' }, ...options] : options

  // A destination is always a choice over the site, never free text.
  if (/Href$/.test(name)) return { ...base, type: 'select', options: withNone(pages) }

  if (kinds.size === 1 && kinds.has('bool')) return { ...base, type: 'checkbox' }

  // A prop that only ever holds one of a handful of values is a choice, not a
  // free-text box — an accent colour or a button style should not be typed.
  const distinct = [...new Set(values)].filter((v) => v !== '')
  if (!OPAQUE.has(name) && distinct.length > 1 && distinct.length <= 8 && distinct.every((v) => typeof v === 'string' && v.length < 40)) {
    return { ...base, type: 'select', options: withNone(distinct.sort()) }
  }

  return {
    ...base,
    type: 'text',
    ...(OPAQUE.has(name)
      ? { admin: { readOnly: true, description: 'Markup or styling carried over from the page; edit in the component, not here.' } }
      : {}),
  }
}

/**
 * The words in a block, one localized field per slot.
 *
 * A slot name is either semantic (`eyebrow`, `heading`) on a component used in
 * several places, or the content key itself on one used once — either way it is
 * stable across that component's instances, which is what lets it be a column.
 * Hyphens become underscores for SQL, reversibly, because content keys never
 * contain one.
 *
 * Empty means untranslated, never "this instance has no body". Whether a block
 * *has* a paragraph is structure, and structure is the same in every language;
 * the build decides it from the English text, so a missing Danish translation
 * falls back rather than deleting the element from the Danish page.
 */
function contentFields(slots) {
  return [...slots].sort().map((slot) => ({
    name: slot.replace(/-/g, '_'),
    label: title(slot),
    type: 'text',
    localized: true,
    admin: { description: 'Leave blank to fall back to English.' },
  }))
}

function main() {
  const pages = pageOptions(ROOT)
  const layout = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'layout.json'), 'utf8'))

  // Gather every prop each component is ever given, and the values it takes.
  const comps = new Map()
  for (const entries of Object.values(layout)) {
    for (const e of entries) {
      if (typeof e === 'string') throw new Error(`layout still holds a plain block: ${e}`)
      if (!comps.has(e.component)) comps.set(e.component, { props: new Map(), arrays: new Map(), slots: new Set(), arraySlots: new Map(), count: 0 })
      const c = comps.get(e.component)
      c.count++
      for (const slot of Object.keys(e.slots || {})) c.slots.add(slot)
      for (const [k, v] of Object.entries(e.props || {})) {
        if (Array.isArray(v)) {
          if (!c.arrays.has(k)) c.arrays.set(k, new Map())
          const item = c.arrays.get(k)
          if (!c.arraySlots.has(k)) c.arraySlots.set(k, new Set())
          for (const it of v) {
            for (const slot of Object.keys(it.slots || {})) c.arraySlots.get(k).add(slot)
            for (const [ik, iv] of Object.entries(it.props || {})) {
              if (!item.has(ik)) item.set(ik, new Set())
              item.get(ik).add(iv)
            }
          }
        } else {
          if (!c.props.has(k)) c.props.set(k, new Set())
          c.props.get(k).add(v)
        }
      }
    }
  }

  const L = []
  L.push('// GENERATED by scripts/generate-blocks.mjs from ../content/layout.json — do not edit.')
  L.push('// Regenerated on every `npm run dev` and `npm run build`.')
  L.push('')
  L.push("import type { Block } from 'payload'")
  L.push('')

  // Hidden on every block: what the build needs and an editor must not retype.
  const HIDDEN = [
    "    { name: 'section', type: 'text', admin: { hidden: true } },",
    "    { name: 'lead', type: 'text', admin: { hidden: true } },",
    "    { name: 'slots', type: 'json', admin: { hidden: true } },",
  ]

  const names = []
  for (const [component, c] of [...comps].sort((a, b) => b[1].count - a[1].count)) {
    const varName = component.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())
    names.push({ varName, component, count: c.count })

    L.push(`/** ${c.count} instance${c.count === 1 ? '' : 's'} across the site. */`)
    L.push(`const ${varName}: Block = {`)
    L.push(`  slug: ${JSON.stringify(component)},`)
    L.push(`  labels: { singular: ${JSON.stringify(title(component))}, plural: ${JSON.stringify(title(component))} },`)
    // A photograph of the component on a page that uses it, so the picker shows
    // what each one looks like instead of twenty-two identical placeholders.
    // tools/block-thumbnails.mjs makes these; a missing file just falls back.
    if (fs.existsSync(path.resolve(dirname, '..', 'public', 'blocks', component + '.png'))) {
      L.push(`  imageURL: ${JSON.stringify(`/blocks/${component}.png`)},`)
      L.push(`  imageAltText: ${JSON.stringify(`${title(component)} section`)},`)
    }
    L.push('  fields: [')
    if (c.slots.size) {
      L.push('    {')
      L.push("      name: 'content',")
      L.push("      label: 'Text',")
      L.push("      type: 'group',")
      L.push('      fields: [')
      for (const f of contentFields(c.slots)) L.push('        ' + JSON.stringify(f) + ',')
      L.push('      ],')
      L.push('    },')
    }
    for (const [name, values] of c.props) {
      L.push('    ' + JSON.stringify(fieldFor(name, values, pages)) + ',')
    }
    for (const [arrayName, itemProps] of c.arrays) {
      L.push('    {')
      L.push(`      name: ${JSON.stringify(arrayName)},`)
      L.push(`      label: ${JSON.stringify(title(arrayName))},`)
      L.push("      type: 'array',")
      L.push('      fields: [')
      const rowSlots = c.arraySlots.get(arrayName) || new Set()
      if (rowSlots.size) {
        L.push('        {')
        L.push("          name: 'content',")
        L.push("          label: 'Text',")
        L.push("          type: 'group',")
        L.push('          fields: [')
        for (const f of contentFields(rowSlots)) L.push('            ' + JSON.stringify(f) + ',')
        L.push('          ],')
        L.push('        },')
      }
      for (const [ik, ivals] of itemProps) L.push('        ' + JSON.stringify(fieldFor(ik, ivals, pages)) + ',')
      L.push("        { name: 'slots', type: 'json', admin: { hidden: true } },")
      L.push('      ],')
      L.push('    },')
    }
    L.push(...HIDDEN)
    L.push('  ],')
    L.push('}')
    L.push('')
  }

  L.push('export const pageBlocks: Block[] = [')
  for (const n of names) L.push(`  ${n.varName},`)
  L.push(']')
  L.push('')

  fs.writeFileSync(OUT, L.join('\n'), 'utf8')
  const arrays = [...comps.values()].reduce((a, c) => a + c.arrays.size, 0)
  console.log(`blocks.generated.ts: ${names.length} block types, ${arrays} array field(s)`)
}

main()

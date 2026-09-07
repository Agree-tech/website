/**
 * seed-pages.mjs — loads content/layout.json and content/<locale>/*.json into
 * the Pages collection.
 *
 * Like seed.ts, this is the migration and not a sync: it overwrites each page
 * with what is on disk. Once an editor has rearranged a page in Payload,
 * re-running it discards that.
 *
 * Structure is written once, text once per locale. Layout is not localized —
 * the same sections appear in the same order in every language, only the words
 * differ — so a page has one structure and three sets of strings rather than
 * three structures that could drift apart.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '..', '..')

const LOCALES = ['en', 'da', 'pl']

const LABELS = {
  index: 'Homepage',
  platform: 'Platform',
  cpq: 'CPQ',
  billing: 'Billing automation',
  subscription: 'Subscription management',
  process: 'Process optimisation',
  sales: 'Sales',
  implementation: 'Implementation',
  about: 'About us',
  contact: 'Contact',
  'index-print': 'Homepage — print version',
}

/** Must match generate-blocks.mjs. Reversible: content keys never contain "_". */
const toField = (slot) => slot.replace(/-/g, '_')

/**
 * The string a slot points at, for one locale.
 *
 * A slot value carrying a dot is already "section.key" — image alt text lives
 * under <page>.meta — otherwise it is a key in the block's own section.
 */
function textFor(content, section, slotValue) {
  const [sec, key] = slotValue.includes('.')
    ? [slotValue.slice(0, slotValue.indexOf('.')), slotValue.slice(slotValue.indexOf('.') + 1)]
    : [section, slotValue]
  const value = content?.[sec]?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

const readContent = (locale, page) => {
  const file = path.join(ROOT, 'content', locale, `${page}.json`)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
}

/** A block: its props, the words for this locale, and where they came from. */
function toBlock(entry, content, english) {
  const { component, section, lead, slots = {}, props = {} } = entry
  // The row label in the layout list. Always from English: blockName is not a
  // localized field, so writing it once per locale would leave whichever locale
  // was seeded last — a Polish label above an English form. Without it every row reads "Untitled",
  // so a page is a stack of identical-looking bars and finding the section you
  // meant means opening them one at a time. The heading is what the section
  // actually says, which is how a person recognises it.
  const heading = (() => {
    // A reusable component names its slots semantically (heading, eyebrow); a
    // single-use one names them after the content key it was extracted from
    // (h2-meet-the-board). Try both, heading first, before giving up on the
    // section name.
    const names = Object.keys(slots)
    const candidates = [
      'heading',
      // Highest level first: a grid's own h2 names the section, an h3 inside it
      // names one card. Picking the card would label the row "Diversity".
      ...names.filter((n) => /^h[1-6]-/.test(n)).sort((a, b) => a.charCodeAt(1) - b.charCodeAt(1)),
      'eyebrow',
      ...names.filter((n) => /^(div|span|b)-/.test(n)),
    ]
    for (const key of candidates) {
      const value = slots[key] && textFor(english, section, slots[key])
      if (value) return value.length > 60 ? value.slice(0, 57) + '…' : value
    }
    return section
  })()

  const out = { blockType: component, blockName: heading, section, lead: lead ?? '', slots }

  // The words go in their own group, so the build can tell content from props
  // without knowing which is which.
  const text = {}
  for (const [slot, key] of Object.entries(slots)) {
    const value = textFor(content, section, key)
    if (value !== undefined) text[toField(slot)] = value
  }
  if (Object.keys(text).length) out.content = text

  for (const [k, v] of Object.entries(props)) {
    if (!Array.isArray(v)) {
      out[k] = v
      continue
    }
    out[k] = v.map((item) => {
      const row = { ...(item.props || {}), slots: item.slots ?? {} }
      const rowText = {}
      for (const [slot, key] of Object.entries(item.slots || {})) {
        const value = textFor(content, section, key)
        if (value !== undefined) rowText[toField(slot)] = value
      }
      if (Object.keys(rowText).length) row.content = rowText
      return row
    })
  }
  return out
}

async function main() {
  const payload = await getPayload({ config })
  const layout = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'layout.json'), 'utf8'))

  let pages = 0
  let blocks = 0
  const missing = []

  for (const [name, entries] of Object.entries(layout)) {
    const label = LABELS[name] || name

    // English first: this write establishes the structure, and Payload assigns
    // an id to every block and array row as it does so.
    const en = readContent('en', name)
    const existing = await payload.find({ collection: 'pages', where: { name: { equals: name } }, limit: 1 })
    const data = { name, label, layout: entries.map((e) => toBlock(e, en, en)) }
    const doc = existing.totalDocs
      ? await payload.update({ collection: 'pages', id: existing.docs[0].id, locale: 'en', fallbackLocale: 'none', data, depth: 0 })
      : await payload.create({ collection: 'pages', locale: 'en', fallbackLocale: 'none', data, depth: 0 })

    // Every other locale must reuse those ids. A blocks field written without
    // them is replaced wholesale — new rows, new ids — which discards the
    // localized values already stored against the old ones. Seeding three
    // languages that way leaves only fragments of the last one written.
    for (const locale of LOCALES.filter((l) => l !== 'en')) {
      const content = readContent(locale, name)
      if (!content) continue
      const layoutWithIds = entries.map((e, i) => {
        const block = toBlock(e, content, en)
        const stored = doc.layout[i]
        block.id = stored.id
        for (const [k, v] of Object.entries(block)) {
          if (!Array.isArray(v)) continue
          v.forEach((row, j) => { if (stored[k]?.[j]?.id) row.id = stored[k][j].id })
        }
        return block
      })
      await payload.update({
        collection: 'pages',
        id: doc.id,
        locale,
        fallbackLocale: 'none',
        data: { name, label, layout: layoutWithIds },
        depth: 0,
      })
    }

    pages++
    blocks += entries.length

    for (const e of entries) {
      for (const [slot, key] of Object.entries(e.slots || {})) {
        if (textFor(en, e.section, key) === undefined) missing.push(`${name}.${e.section}.${key}`)
      }
    }
  }

  console.log(`pages: ${pages} written across ${LOCALES.length} locales, ${blocks} blocks`)
  if (missing.length) {
    console.error(`\n${missing.length} slot(s) have no English text — the page would show a raw key:`)
    for (const m of missing.slice(0, 20)) console.error('  ' + m)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

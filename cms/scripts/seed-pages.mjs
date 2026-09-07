/**
 * seed-pages.mjs — loads content/layout.json into the Pages collection.
 *
 * Like seed.ts, this is the migration and not a sync: it overwrites each page's
 * layout with what is on disk. Once an editor has rearranged a page in Payload,
 * re-running it discards that.
 *
 * Layout is not localized. The same sections appear in the same order in every
 * language — only the words differ — so a page has one structure and three sets
 * of strings, rather than three structures that could drift apart.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '..', '..')

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

/** A block's fields are its props, plus what the build needs to render it. */
const toBlock = (entry) => {
  const { component, section, lead, slots, props = {} } = entry
  const out = { blockType: component, section, lead: lead ?? '', slots: slots ?? {} }
  for (const [k, v] of Object.entries(props)) {
    out[k] = Array.isArray(v)
      ? v.map((item) => ({ ...(item.props || {}), slots: item.slots ?? {} }))
      : v
  }
  return out
}

async function main() {
  const payload = await getPayload({ config })
  const layout = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'layout.json'), 'utf8'))

  let created = 0
  let updated = 0
  let blocks = 0

  for (const [name, entries] of Object.entries(layout)) {
    const data = {
      name,
      label: LABELS[name] || name,
      layout: entries.map(toBlock),
    }
    blocks += entries.length

    const existing = await payload.find({ collection: 'pages', where: { name: { equals: name } }, limit: 1 })
    if (existing.totalDocs) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data, depth: 0 })
      updated++
    } else {
      await payload.create({ collection: 'pages', data, depth: 0 })
      created++
    }
  }

  console.log(`pages: ${created} created, ${updated} updated, ${blocks} blocks total`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

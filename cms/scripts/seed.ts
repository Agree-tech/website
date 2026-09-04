/**
 * seed.ts — loads content/<locale>/*.json into Payload.
 *
 * One-way and idempotent: run it as often as you like, it overwrites each
 * global with what is on disk. This is the migration, not a sync — once editors
 * are working in Payload the database is the source of truth, and re-running
 * this would discard their work.
 *
 * Also creates the first admin user, because a Payload instance with no user
 * hands the next person who finds the URL the signup form.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config.js'
import { SECTIONS } from '../src/globals.generated.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '..', '..')

const LOCALES = ['en', 'da', 'pl'] as const

/** Must match generate-globals.mjs. Reversible because keys never contain "_". */
const toIdent = (key: string) => key.replace(/-/g, '_')

const ADMIN_EMAIL = process.env.SEED_EMAIL || 'editor@agree-tech.com'
const ADMIN_PASSWORD = process.env.SEED_PASSWORD || 'ChangeMe123!'

async function main() {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'users', limit: 1 })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Editor' },
    })
    console.log(`created admin user  ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`)
  } else {
    console.log('admin user already exists — left alone')
  }

  // content/<locale>/<page>.json holds every section of a page; each section is
  // now its own global, so read each file once and fan it out.
  const cache = new Map<string, Record<string, Record<string, string>>>()
  const readPage = (locale: string, page: string) => {
    const key = `${locale}/${page}`
    if (!cache.has(key)) {
      const file = path.join(ROOT, 'content', locale, `${page}.json`)
      cache.set(key, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {})
    }
    return cache.get(key)!
  }

  const failures: string[] = []
  let written = 0
  let values = 0

  for (const locale of LOCALES) {
    for (const entry of SECTIONS) {
      const { slug, page, section, defaultLocaleOnly } = entry
      if (defaultLocaleOnly && locale !== 'en') continue

      const fields = readPage(locale, page)[section]
      if (!fields) continue

      const data: Record<string, string> = {}
      for (const [key, value] of Object.entries(fields)) {
        // Blank means "not translated" everywhere else in this pipeline. Keep it
        // that way so Payload's fallback resolves to English, rather than
        // storing an empty string that renders as an empty element.
        if (typeof value !== 'string' || !value.trim()) continue
        data[toIdent(key)] = value
        values++
      }

      try {
        await payload.updateGlobal({ slug: slug as never, locale, data: data as never, depth: 0 })
        written++
      } catch (err) {
        failures.push(`${slug} [${locale}] ${Object.keys(data).length} fields — ${(err as Error).message.split('\n')[0]}`)
      }
    }
  }

  console.log(`seeded ${written} globals across ${LOCALES.length} locales, ${values} values`)
  if (failures.length) {
    console.error(`\n${failures.length} FAILED:`)
    for (const f of failures) console.error('  ' + f)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { pageGlobals } from './globals.generated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '· Agree Technologies',
    },
  },

  collections: [Users, Media, Pages],

  /**
   * One global per page, generated from the site's own content model. Globals
   * rather than a Pages collection because these are singletons: there is one
   * homepage, and an editor should never be able to create a second one or
   * delete the only one.
   */
  globals: pageGlobals,

  /**
   * The codes are the build's, and they are language subtags, not country
   * codes — `da` for Danish, never `dk`. They become the directory names in
   * dist/ and the hreflang values, so a mismatch here is an SEO bug, not a
   * cosmetic one.
   *
   * `fallback: true` mirrors what the static build already does: a key missing
   * from a locale renders the English string rather than an empty element, so
   * a half-translated locale is still a working site.
   */
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Dansk', code: 'da' },
      { label: 'Polski', code: 'pl' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  /**
   * Postgres, not SQLite. Payload stores a global's fields as columns on one
   * table, and reading one builds a json_array() with an argument per column —
   * which SQLite caps at 127, compiled into the driver rather than configurable.
   * The homepage global has 183 fields, so on SQLite it cannot be read back at
   * all. docker-compose.yml runs this locally; point DATABASE_URI at a hosted
   * instance to deploy.
   */
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
})

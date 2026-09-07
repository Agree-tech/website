import path from 'path'
import { fileURLToPath } from 'url'

import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Images an editor uploads.
 *
 * The site is static, so nothing is served from here at runtime: the build
 * copies what it finds into dist/assets/ beside the files already in the
 * repository, and pages keep referring to images by path. That keeps an
 * uploaded image and a committed one indistinguishable to the browser, and
 * keeps the deployed site free of a dependency on this server being up.
 *
 * `alt` is localized because alt text is prose — it is read aloud, and a Danish
 * page should not describe its images in English.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  admin: { useAsTitle: 'filename', group: 'Media' },
  upload: {
    // Beside the app rather than inside src/, so a rebuild never sweeps uploads
    // away with the compiled output.
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      admin: { description: 'Describes the image for screen readers and when it fails to load.' },
    },
  ],
}

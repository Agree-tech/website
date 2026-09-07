import type { CollectionConfig } from 'payload'

import { pageBlocks } from '../blocks.generated'

/**
 * The structure of each page: which sections it has, in what order, configured
 * how.
 *
 * One document per page of the site, matching the templates in src/. The build
 * reads the layout from here instead of content/layout.json, so reordering a
 * section or pointing a button somewhere else is an edit, not a deploy.
 *
 * Deliberately not a place to create pages yet. A new page needs a slug, a nav
 * entry, a sitemap URL and an hreflang set, none of which follow from a document
 * existing — so pages are seeded and an editor arranges what is there.
 *
 * The text is not here. It lives in the globals beside this collection, keyed by
 * page and section, and each block carries the mapping from its own slots to
 * those keys as hidden data. That means an editor can reorder, reconfigure and
 * duplicate every section on the site, but a section added from scratch has no
 * text behind it until the content moves into the blocks as well.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'name', 'updatedAt'],
    /**
     * Side by side with the form, redrawn as you type.
     *
     * Payload posts the unsaved document into the frame; the page sends it back
     * to the same route, which renders it with the build. So the preview shows
     * work that has not been saved, and still shows it drawn by the code that
     * deploys it — there is no second renderer, and nothing that can disagree
     * with the site.
     */
    livePreview: {
      // Absolute: Payload only accepts messages from the frame once
      // `url.startsWith(event.origin)`, and a path never starts with an origin.
      url: ({ data, locale }) =>
        `${process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3001'}/preview` +
        `?page=${encodeURIComponent(String(data?.name ?? 'index'))}` +
        `&locale=${encodeURIComponent(typeof locale === 'string' ? locale : locale?.code || 'en')}`,
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 834, height: 1112 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },

    /** The same page, in a tab of its own. Reads what is saved. */
    preview: (doc, { locale }) =>
      `/preview?page=${encodeURIComponent(String(doc?.name ?? 'index'))}&locale=${encodeURIComponent(locale || 'en')}`,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Matches the template filename. The build looks pages up by this.' },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'What this page is called in the sidebar.' },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
      admin: { description: 'The sections of the page, top to bottom. Drag to reorder.' },
    },
  ],
}

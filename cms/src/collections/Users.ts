import type { CollectionConfig } from 'payload'

/**
 * Editors. Payload owns authentication itself, which is the thing that made
 * this worth trying: the Decap editor depends on Netlify Identity, and Netlify
 * no longer provisions Identity for new sites.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Library' },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}

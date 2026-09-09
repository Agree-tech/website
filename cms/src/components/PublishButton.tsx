'use client'

import { Button, toast } from '@payloadcms/ui'
import { useState } from 'react'

/**
 * Sits under the nav links on every admin page. Pressing it commits the CMS to
 * the site repository and Netlify builds from that commit — lib/publish.ts says
 * why it is a commit and not a build hook. One request; the server makes sure
 * only one runs at a time.
 */
export function PublishButton() {
  const [busy, setBusy] = useState(false)

  const publish = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/publish', { method: 'POST', credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as {
        status?: string
        commit?: string
        files?: string[]
        error?: string
      }
      if (!res.ok) throw new Error(body.error || res.statusText)
      if (body.status === 'unchanged') {
        toast.info('Nothing to publish — the site already has everything.')
      } else {
        toast.success(
          `Published ${body.files?.length ?? 0} file(s) as ${body.commit?.slice(0, 7)}. Netlify is building.`,
        )
      }
    } catch (err) {
      toast.error(`Publish failed: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="publish-site">
      <Button buttonStyle="primary" size="small" disabled={busy} onClick={publish}>
        {busy ? 'Publishing…' : 'Publish site'}
      </Button>
      <p className="publish-site__hint">Commits the CMS to git; the site rebuilds from the commit.</p>
    </div>
  )
}

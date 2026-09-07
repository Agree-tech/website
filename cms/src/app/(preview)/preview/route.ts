import { createRequire } from 'module'
import path from 'path'

import type { NextRequest } from 'next/server'

/**
 * The repository root. Taken from the working directory rather than from
 * import.meta.url: Next compiles route files, and the compiled module's url is
 * not a path on disk — createRequire against it fails with "Cannot find module
 * 'unknown'". Next runs with the app directory as cwd, and the repository is
 * its parent.
 */
const ROOT = path.resolve(process.cwd(), '..')

/**
 * Renders a page exactly as the deploy would, and serves it.
 *
 * It calls the build's own renderOne, so preview and production cannot drift:
 * same templates, same components, same substitution, same hreflang and robots
 * decisions. A second renderer written for the admin would be a second source of
 * truth, and the whole point of a preview is that it is not one.
 *
 * Deliberately not live-as-you-type. Payload's live preview streams the document
 * to an iframe for the browser to render, which would need this entire pipeline
 * in the browser — a different renderer again. Saving and looking is slower and
 * honest; a preview that shows something the deploy will not is worse than none.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get('page') || 'index'
  const locale = req.nextUrl.searchParams.get('locale') || 'en'

  // The build is CommonJS and reads process.argv for its flags; the preview
  // always wants composed pages with the CMS as the source, which is what a
  // deploy from this database will do.
  // Anchored at the repository, for the same reason ROOT is.
  const require = createRequire(path.join(ROOT, 'package.json'))
  for (const flag of ['--from-blocks', '--from-payload']) {
    if (!process.argv.includes(flag)) process.argv.push(flag)
  }

  try {
    const { renderOne } = require(path.join(ROOT, 'build.js'))
    const html: string = await renderOne({ page, locale })

    // Assets are served from the dist root on the real site. Point them at the
    // passthrough beside this route so a preview needs nothing else running.
    const served = html
      .replace(/(href|src)="\/(styles|shared|subpage)\.css"/g, '$1="/preview/asset/$2.css"')
      .replace(/(href|src)="\/shared\.js"/g, '$1="/preview/asset/shared.js"')
      .replace(/(href|src)="\/assets\//g, '$1="/preview/asset/assets/')

    return new Response(served, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`<pre>Preview failed\n\n${message}</pre>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

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

export const dynamic = 'force-dynamic'

/**
 * Renders a page exactly as the deploy would, and serves it.
 *
 * GET reads the database. POST takes the document the admin is holding —
 * unsaved, mid-edit — and renders that instead, which is how live preview
 * updates as you type without a second renderer existing anywhere. Both call the
 * build's own renderOne, so what the editor sees is produced by the code that
 * will produce the deployed page: same templates, same components, same
 * substitution, same hreflang and robots decisions.
 */
function render(page: string, locale: string, doc?: unknown) {
  const require = createRequire(path.join(ROOT, 'package.json'))
  for (const flag of ['--from-blocks', '--from-payload']) {
    if (!process.argv.includes(flag)) process.argv.push(flag)
  }
  const { renderOne } = require(path.join(ROOT, 'build.js'))
  return renderOne({ page, locale, doc }) as Promise<string>
}

/**
 * Assets are served from the dist root on the real site. Point them at the
 * passthrough beside this route so a preview needs nothing else running.
 */
const localAssets = (html: string) =>
  html
    .replace(/(href|src)="\/(styles|shared|subpage)\.css"/g, '$1="/preview/asset/$2.css"')
    .replace(/(href|src)="\/shared\.js"/g, '$1="/preview/asset/shared.js"')
    .replace(/(href|src)="\/assets\//g, '$1="/preview/asset/assets/')

/**
 * Listens for the document Payload posts into the frame and asks this route to
 * draw it. Debounced, because a keystroke is not worth a round trip; and
 * position-preserving, so the page does not jump to the top while you type.
 *
 * Injected rather than built into the site: it exists only inside the preview
 * frame and never reaches a deployed page.
 */
const LIVE = `<script>
(function () {
  if (window.top === window.self) return;
  var timer, busy = false, latest = null;
  function draw(doc) {
    if (busy) { latest = doc; return; }
    busy = true;
    var y = window.scrollY;
    fetch(location.pathname + location.search, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc: doc }),
    })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (html) {
        if (html) {
          document.open();
          document.write(html);
          document.close();
          window.scrollTo(0, y);
        }
      })
      .catch(function () {})
      .finally(function () {
        busy = false;
        if (latest) { var next = latest; latest = null; draw(next); }
      });
  }
  // Payload sends nothing until the frame says it is listening. Without this
  // handshake the panel renders the saved page once and never updates, which
  // looks exactly like live preview being unsupported.
  function announce() {
    window.parent.postMessage({ type: 'payload-live-preview', ready: true }, window.location.origin);
  }
  announce();
  window.addEventListener('load', announce);

  window.addEventListener('message', function (e) {
    if (e.origin !== window.location.origin) return;
    var payload = e.data;
    if (!payload || payload.type !== 'payload-live-preview' || !payload.data) return;
    clearTimeout(timer);
    timer = setTimeout(function () { draw(payload.data); }, 400);
  });
})();
</script>`

function fail(message: string) {
  return new Response(`<pre>Preview failed\n\n${message}</pre>`, {
    status: 500,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

const page = (req: NextRequest) => req.nextUrl.searchParams.get('page') || 'index'
const locale = (req: NextRequest) => req.nextUrl.searchParams.get('locale') || 'en'

export async function GET(req: NextRequest) {
  try {
    const html = localAssets(await render(page(req), locale(req)))
    return new Response(html.replace('</body>', `${LIVE}\n</body>`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err))
  }
}

export async function POST(req: NextRequest) {
  try {
    const { doc } = await req.json()
    const html = localAssets(await render(page(req), locale(req), doc))
    return new Response(html.replace('</body>', `${LIVE}\n</body>`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err))
  }
}

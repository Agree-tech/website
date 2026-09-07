import fs from 'fs'
import path from 'path'

/**
 * The repository root. Taken from the working directory rather than from
 * import.meta.url: Next compiles route files, and the compiled module's url is
 * not a path on disk. Next runs with the app directory as cwd, and the
 * repository is its parent.
 */
const ROOT = path.resolve(process.cwd(), '..')

/**
 * Exactly what a previewed page asks for — the four root files and the images.
 *
 * An allowlist rather than a path check. Confining reads to the repository is
 * not enough: the repository also holds cms/.env, which carries the Payload
 * secret and the database password, and .git, which carries everything ever
 * committed. A preview needs four stylesheets and a folder of pictures, so that
 * is all this will serve.
 */
const FILES = new Set(['styles.css', 'shared.css', 'subpage.css', 'shared.js'])
const DIRS = ['assets']

const TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const rel = segments.join('/')

  const allowed = FILES.has(rel) || DIRS.some((dir) => rel.startsWith(`${dir}/`) && !rel.includes('..'))
  if (!allowed) return new Response('Not found', { status: 404 })

  // Belt and braces: resolve, then require the result to still be inside the
  // directory the allowlist named.
  const target = path.resolve(ROOT, rel)
  const base = FILES.has(rel) ? ROOT : path.resolve(ROOT, rel.split('/')[0])
  if (target !== base && !target.startsWith(base + path.sep)) {
    return new Response('Not found', { status: 404 })
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(fs.readFileSync(target), {
    headers: {
      'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'X-Robots-Tag': 'noindex',
    },
  })
}

import { execFile } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const run = promisify(execFile)

/**
 * Publishes the CMS by committing it to the site repository.
 *
 * The site is built by Netlify from what is in git, not from this server —
 * deliberately, so the CMS being down can never take the site down, and so
 * `git log` keeps answering who changed a line and when. Publishing is
 * therefore a commit: clone the branch Netlify builds, run the same export an
 * engineer would run by hand (tools/export-from-payload.js, pointed at this
 * very server), and push whatever changed. Netlify takes it from there.
 *
 * The commit is authored by the editor who pressed the button, so blame still
 * names a person; the committer is the CMS. Nothing is merged: the export
 * overwrites content/ with what the database holds, which is the rule the
 * export tool itself states.
 */

/** `owner/name` on GitHub. Overridable so a test can point at a local bare repository. */
const REPO = process.env.PUBLISH_REPO || 'Agree-tech/website'
const BRANCH = process.env.PUBLISH_BRANCH || 'payload'
const REMOTE = process.env.PUBLISH_REMOTE || `https://x-access-token@github.com/${REPO}.git`
/** Where the export reaches this server from inside the container: itself. */
const CMS_URL = process.env.PUBLISH_CMS_URL || 'http://localhost:3001'

export type PublishResult =
  | { status: 'unchanged' }
  | { status: 'published'; commit: string; files: string[]; url: string | null }

export class PublishBusyError extends Error {
  constructor() {
    super('A publish is already running — try again in a moment.')
  }
}

let inFlight: Promise<PublishResult> | null = null

/**
 * One at a time. Two editors pressing the button together would otherwise race
 * to push the same branch, and the loser would see a rejected push for no
 * reason of their own. The second caller is told, and retries.
 */
export function publish(author: { email: string; name?: string | null }): Promise<PublishResult> {
  if (inFlight) throw new PublishBusyError()
  inFlight = doPublish(author).finally(() => {
    inFlight = null
  })
  return inFlight
}

/**
 * The token never touches the clone: the URL carries only the username, and
 * git asks a credential helper for the password, which reads it from the
 * environment. `git remote -v` in the temporary clone shows nothing secret, and
 * neither does an error message that quotes the URL.
 */
function git(cwd: string, args: string[]) {
  return run(
    'git',
    [
      '-c',
      'credential.helper=!f() { echo "password=$GITHUB_TOKEN"; }; f',
      // The test remote is a bind-mounted directory owned by another uid.
      '-c',
      'safe.directory=*',
      ...args,
    ],
    { cwd, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, timeout: 120_000 },
  )
}

async function doPublish(author: { email: string; name?: string | null }): Promise<PublishResult> {
  if (REMOTE.startsWith('https://') && !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set on this server, so nothing can be pushed.')
  }

  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'publish-'))
  try {
    await git(dir, ['clone', '--quiet', '--depth', '1', '--branch', BRANCH, REMOTE, '.'])

    // The clone's own export, not this image's: what gets committed must be
    // produced by the code Netlify is about to build with.
    await run(process.execPath, [path.join(dir, 'tools', 'export-from-payload.js')], {
      cwd: dir,
      env: { ...process.env, PAYLOAD_URL: CMS_URL },
      timeout: 120_000,
    })

    const { stdout: status } = await git(dir, ['status', '--porcelain', '--', 'content', 'assets'])
    const files = status
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).trim())
    if (!files.length) return { status: 'unchanged' }

    await git(dir, ['add', '--', 'content', 'assets'])
    await git(dir, [
      '-c',
      'user.name=Agree Tech CMS',
      '-c',
      'user.email=cms@agree-tech.io',
      'commit',
      '--quiet',
      `--author=${author.name?.trim() || author.email} <${author.email}>`,
      '-m',
      subject(files),
    ])
    await git(dir, ['push', '--quiet', 'origin', `HEAD:${BRANCH}`])

    const commit = (await git(dir, ['rev-parse', 'HEAD'])).stdout.trim()
    const url = REMOTE.startsWith('https://') ? `https://github.com/${REPO}/commit/${commit}` : null
    return { status: 'published', commit, files, url }
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true })
  }
}

/**
 * A subject in the repository's own style: short, lowercase, saying what moved
 * — `publish about (da), contact (en)` — so the history reads without opening
 * the diff.
 */
function subject(files: string[]): string {
  const names = files.map((file) => {
    const page = file.match(/^content\/([a-z]+)\/([a-z0-9-]+)\.json$/)
    if (page) return `${page[2]} (${page[1]})`
    if (file === 'content/layout.json') return 'layout'
    return file.replace(/^assets\//, '')
  })
  const shown = names.slice(0, 4).join(', ')
  return names.length > 4 ? `publish ${shown} and ${names.length - 4} more` : `publish ${shown}`
}

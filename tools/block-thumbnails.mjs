#!/usr/bin/env node
/**
 * block-thumbnails.mjs — a picture of each component, for the block picker.
 *
 * Payload's "add a section" dialog shows a placeholder mountain for every block
 * unless a block declares an imageURL, which makes twenty-two components look
 * identical at the moment somebody is choosing between them. These are real
 * screenshots: each component is photographed on a page that actually uses it,
 * through the preview route, so the picture is the thing itself rather than a
 * drawing of it.
 *
 * Regenerate after changing a component's markup:
 *
 *     npm run thumbnails            # CMS must be running
 *
 * Chrome is driven over the DevTools protocol — no browser automation library
 * to install, and Node has a WebSocket client built in.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'cms', 'public', 'blocks')
const PAYLOAD_URL = (process.env.PAYLOAD_URL || 'http://localhost:3001').replace(/\/+$/, '')
const PORT = 9333

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean).find((p) => fs.existsSync(p))

if (!CHROME) {
  console.error('Chrome not found. Set CHROME_PATH.')
  process.exit(1)
}

/** The first page that uses each component, and where it sits on that page. */
function targets() {
  const layout = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'layout.json'), 'utf8'))
  const first = new Map()
  for (const [page, blocks] of Object.entries(layout)) {
    blocks.forEach((b, index) => {
      if (!first.has(b.component)) first.set(b.component, { page, index })
    })
  }
  return first
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const profile = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'thumbs-'))
  const chrome = spawn(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })

  let version = null
  for (let i = 0; i < 40 && !version; i++) {
    try { version = await (await fetch(`http://localhost:${PORT}/json/version`)).json() } catch { await sleep(500) }
  }
  if (!version) throw new Error('Chrome did not start')

  const list = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id
      pending.set(n, { resolve, reject })
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? reject(new Error(m.error.message)) : resolve(m.result)
    }
  }
  await new Promise((r) => (ws.onopen = r))
  await send('Page.enable')
  await send('Runtime.enable')
  // Wide and short: the picker shows a letterbox, and a tall screenshot of a
  // whole section would be legible only as a grey smear.
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

  const written = []
  const missed = []

  for (const [component, { page, index }] of targets()) {
    await send('Page.navigate', { url: `${PAYLOAD_URL}/preview?page=${page}&locale=en` })
    await sleep(2600)

    const { result } = await send('Runtime.evaluate', {
      expression: `(function () {
        var s = document.querySelectorAll('body > section')[${index}]
        if (!s) return null
        var r = s.getBoundingClientRect()
        // Absolute page coordinates. captureBeyondViewport measures the clip
        // from the top of the document, not the viewport, so scrolling the
        // section into view and using its viewport offset photographs the top
        // of the page every time.
        return JSON.stringify({
          x: 0,
          y: r.top + window.scrollY,
          width: 1440,
          height: Math.min(760, Math.max(180, r.height)),
        })
      })()`,
      returnByValue: true,
    })
    if (!result.value) { missed.push(component); continue }

    await sleep(400)
    const clip = { ...JSON.parse(result.value), scale: 0.4 }
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true })
    fs.writeFileSync(path.join(OUT, `${component}.png`), Buffer.from(data, 'base64'))
    written.push(component)
  }

  ws.close()
  chrome.kill()
  // Chrome can still hold a handle to its profile a moment after exit, and a
  // failure to delete a temp directory is not a failure to produce thumbnails.
  try { fs.rmSync(profile, { recursive: true, force: true }) } catch {}

  console.log(`${written.length} thumbnail(s) written to cms/public/blocks/`)
  if (missed.length) console.warn(`  ! no section found for: ${missed.join(', ')}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})

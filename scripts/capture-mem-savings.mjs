#!/usr/bin/env node
/**
 * capture-mem-savings.mjs — SessionStart capture for the claude-mem WhatsApp footer.
 *
 * Re-runs claude-mem's own context generator (the exact command its SessionStart
 * hook uses), parses the "Stats: N obs (Xt read) | Yt work | Z% savings" line it
 * emits, and persists a snapshot to .claude/.mem-savings.json for the WhatsApp
 * scripts to read later (including cron/script sends with no agent in the loop).
 *
 * Contract: NEVER blocks or fails a session. Any problem → exit 0 and write
 * nothing, so the footer is simply omitted (same philosophy as the RTK rule).
 *
 * The number is inherently an estimate: claude-mem's observation selection is
 * session-sensitive, so re-running yields a slightly different value than the
 * one injected at boot. That is why the footer is always marked "(est.)".
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

function readStdin() {
  // On a real hook run stdin carries the SessionStart payload and is closed;
  // on a manual TTY run there is nothing to read (and reading would block).
  if (process.stdin.isTTY) return ''
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function resolvePluginRoot() {
  const candidates = []
  if (process.env.CLAUDE_PLUGIN_ROOT) candidates.push(process.env.CLAUDE_PLUGIN_ROOT)

  const cacheDir = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'thedotmack', 'claude-mem')
  try {
    const versions = fs
      .readdirSync(cacheDir)
      .filter((v) => /^\d/.test(v))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true })) // newest first
    for (const v of versions) candidates.push(path.join(cacheDir, v))
  } catch {
    /* cache dir may not exist */
  }
  candidates.push(path.join(os.homedir(), '.claude', 'plugins', 'marketplaces', 'thedotmack', 'plugin'))

  for (const c of candidates) {
    const root = fs.existsSync(path.join(c, 'plugin', 'scripts')) ? path.join(c, 'plugin') : c
    if (
      fs.existsSync(path.join(root, 'scripts', 'bun-runner.js')) &&
      fs.existsSync(path.join(root, 'scripts', 'worker-service.cjs'))
    ) {
      return root
    }
  }
  return null
}

function main() {
  const stdin = readStdin()

  let cwd = process.cwd()
  try {
    const j = JSON.parse(stdin || '{}')
    if (j && typeof j.cwd === 'string' && j.cwd) cwd = j.cwd
  } catch {
    /* keep process.cwd() */
  }

  const pluginRoot = resolvePluginRoot()
  if (!pluginRoot) return

  // The context command rejects an empty stdin payload, so forward the hook's
  // own payload when present, else synthesize a minimal one scoped to this cwd.
  const feed =
    stdin && stdin.trim()
      ? stdin
      : JSON.stringify({ cwd, source: 'startup', hook_event_name: 'SessionStart', session_id: 'mem-savings-capture' })

  const bunBin = path.join(os.homedir(), '.bun', 'bin')
  const res = spawnSync(
    'node',
    [
      path.join(pluginRoot, 'scripts', 'bun-runner.js'),
      path.join(pluginRoot, 'scripts', 'worker-service.cjs'),
      'hook',
      'claude-code',
      'context',
    ],
    {
      cwd,
      input: feed,
      encoding: 'utf8',
      timeout: 25000,
      env: { ...process.env, PATH: `${bunBin}:${process.env.PATH || ''}`, CLAUDE_PLUGIN_ROOT: pluginRoot },
      stdio: ['pipe', 'pipe', 'ignore'],
    },
  )

  const out = res.stdout || ''
  const m = out.match(
    /Stats:\s*([\d,]+)\s*obs\s*\(([\d,]+)t\s*read\)\s*\|\s*([\d,]+)t\s*work(?:\s*\|\s*(\d+)%\s*savings)?/i,
  )
  if (!m) return

  const num = (s) => parseInt(String(s).replace(/,/g, ''), 10)
  const obs = num(m[1])
  const readTokens = num(m[2])
  const workTokens = num(m[3])
  if (!Number.isFinite(workTokens) || workTokens <= 0) return
  const percent = m[4] != null ? num(m[4]) : Math.round(((workTokens - readTokens) / workTokens) * 100)
  if (!Number.isFinite(percent)) return

  const outPath = path.join(cwd, '.claude', '.mem-savings.json')
  const data = { percent, workTokens, readTokens, obs, capturedAt: new Date().toISOString() }
  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n')
  } catch {
    /* never fail the session over a snapshot write */
  }
}

main()

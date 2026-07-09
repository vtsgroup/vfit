/**
 * claude-mem savings footer — shared helper for WhatsApp messages.
 *
 * Reads the per-session snapshot written by scripts/capture-mem-savings.mjs
 * (.claude/.mem-savings.json) and formats the mandatory-message footer line.
 *
 * Mirrors the RTK savings rule: only emit with REAL, fresh data — never invents
 * a number. Returns '' whenever there is no usable snapshot, so callers can
 * append it unconditionally and it simply disappears when there is no data.
 */
import fs from 'node:fs'
import path from 'node:path'

// "nesta sessão" — a snapshot older than this is considered stale and ignored,
// so a cron/script send days after the last interactive session omits the line
// instead of claiming a number that no longer reflects "this session".
const STALE_MS = 12 * 60 * 60 * 1000

export function readMemSavings(cwd = process.cwd()) {
  try {
    const p = path.join(cwd, '.claude', '.mem-savings.json')
    const data = JSON.parse(fs.readFileSync(p, 'utf8'))
    if (!data || typeof data !== 'object') return null

    const percent = Number(data.percent)
    const workTokens = Number(data.workTokens)
    if (!Number.isFinite(percent) || !Number.isFinite(workTokens) || workTokens <= 0) return null

    if (data.capturedAt) {
      const ts = Date.parse(data.capturedAt)
      if (Number.isFinite(ts) && Date.now() - ts > STALE_MS) return null
    }

    return {
      percent,
      workTokens,
      readTokens: Number(data.readTokens) || 0,
      obs: Number(data.obs) || 0,
      capturedAt: data.capturedAt || null,
    }
  } catch {
    return null
  }
}

function formatK(tokens) {
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : String(tokens)
}

/**
 * The footer line, or '' when there is no real data (omit entirely).
 * Example: "🧠 claude-mem: ~92% economia • ~156k tokens de trabalho indexados nesta sessão (est.)"
 */
export function buildMemSavingsFooter(cwd = process.cwd()) {
  const s = readMemSavings(cwd)
  if (!s) return ''
  return `🧠 claude-mem: ~${s.percent}% economia • ~${formatK(s.workTokens)} tokens de trabalho indexados nesta sessão (est.)`
}

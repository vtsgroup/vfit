#!/usr/bin/env node
/**
 * WhatsApp task notifier (VFIT)
 *
 * Goal: avoid re-typing Authorization header and keep started_at/ended_at consistent.
 *
 * Usage:
 *   # load env (outside git)
 *   set -a; source .env.local; set +a
 *
 *   node scripts/whatsapp-task.mjs start --task-id DESIGN-2026-02-24-PM --title "Design Sprint — ..." --priority ALTA
 *   node scripts/whatsapp-task.mjs end --task-id DESIGN-2026-02-24-PM --status success --deploy v3.0.1 --summary "✅ item" --summary "✅ item"
 *   node scripts/whatsapp-task.mjs preview end --task-id ... (uses /format instead of /task-notify)
 */

import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_GATEWAY_URL = 'https://whatsapp.iapersonal.app.br'

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      args._.push(a)
      continue
    }
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    if (key === 'summary') {
      const list = Array.isArray(args.summary) ? args.summary : (args.summary ? [args.summary] : [])
      list.push(next)
      args.summary = list
    } else {
      args[key] = next
    }
    i++
  }
  return args
}

function getTokenFromEnv() {
  return (
    process.env.WHATSAPP_NOTIFY_TOKEN
    || process.env.WHATSAPP_ADMIN_AUTH_TOKEN
    || process.env.ADMIN_AUTH_TOKEN
    || ''
  ).trim()
}

function getGatewayUrlFromEnv() {
  return (process.env.WHATSAPP_GATEWAY_URL || DEFAULT_GATEWAY_URL).replace(/\/+$/, '')
}

function normalizeActorLabel(raw) {
  // The gateway formatter already renders the robot prefix.
  // If we pass a label like "[🤖 Developer Agent]" it can become "[🤖 [🤖 Developer Agent]]".
  // Keep only the human-readable label.
  let s = String(raw || '').trim()
  // Strip leading bracketed robot prefix: "[🤖 ...]"
  s = s.replace(/^\[\s*🤖\s*/u, '')
  s = s.replace(/\]\s*$/u, '')
  // Strip any remaining robot emoji and surrounding brackets
  s = s.replace(/🤖/gu, '').trim()
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function normalizeTitle(raw) {
  // Titles should NOT include an actor prefix. Keep them task-only.
  let s = String(raw || '').trim()
  s = s.replace(/^\[\s*🤖[^\]]*\]\s*/u, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function getStatePath() {
  // keep out of git; .wrangler/ is already ignored
  return path.join(process.cwd(), '.wrangler', 'whatsapp-task-state.json')
}

function readState() {
  const p = getStatePath()
  try {
    const raw = fs.readFileSync(p, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
    return {}
  } catch {
    return {}
  }
}

function writeState(state) {
  const p = getStatePath()
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(state, null, 2) + '\n')
}

async function postJson(url, token, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const text = await res.text().catch(() => '')
  let json
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  if (!res.ok) {
    const msg = json?.error || text || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return json
}

function usageAndExit(msg) {
  if (msg) console.error(`\n❌ ${msg}\n`)
  console.error('Usage:')
  console.error('  node scripts/whatsapp-task.mjs start  --task-id <id> --title <title> [--priority ALTA] [--actor "Developer Agent"] [--why "..."] [--expected "..."] [--link <url>]')
  console.error('  node scripts/whatsapp-task.mjs end    --task-id <id> --title <title> --status success|failed [--result "..."] [--reason "..."] [--benefit "..."] [--deploy vX.Y.Z] [--summary "..."]...')
  console.error('  node scripts/whatsapp-task.mjs preview start|end ...   # uses /format (no send)')
  console.error('\nEnv (.env.local, ignored by git):')
  console.error('  WHATSAPP_NOTIFY_TOKEN=<ADMIN_AUTH_TOKEN>')
  console.error('  WHATSAPP_GATEWAY_URL=https://whatsapp.iapersonal.app.br')
  process.exit(1)
}

function toSingleLine(value, max = 240) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const [modeOrEvent, maybeEvent] = args._

  const preview = modeOrEvent === 'preview'
  const event = preview ? maybeEvent : modeOrEvent

  if (event !== 'start' && event !== 'end') usageAndExit('event deve ser start|end (ou preview start|end)')

  const token = getTokenFromEnv()
  if (!token) usageAndExit('WHATSAPP_NOTIFY_TOKEN (ou WHATSAPP_ADMIN_AUTH_TOKEN) não configurado')

  const gateway = getGatewayUrlFromEnv()
  const endpoint = preview ? '/format' : '/task-notify'

  const taskId = String(args['task-id'] || '').trim()
  const title = String(args.title || '').trim()
  if (!taskId) usageAndExit('--task-id é obrigatório')
  if (!title) usageAndExit('--title é obrigatório')

  const actorLabel = normalizeActorLabel(args.actor || 'Developer Agent')
  const priority = args.priority ? String(args.priority).trim() : undefined
  const linkUrl = args.link ? String(args.link).trim() : undefined
  const deployVersion = args.deploy ? String(args.deploy).trim() : undefined
  const status = args.status ? String(args.status).trim() : undefined
  const why = toSingleLine(args.why)
  const expected = toSingleLine(args.expected)
  const result = toSingleLine(args.result)
  const reason = toSingleLine(args.reason)
  const benefit = toSingleLine(args.benefit)

  const normalizedTitle = normalizeTitle(title)

  let summary = Array.isArray(args.summary)
    ? args.summary.map((s) => String(s).trim()).filter(Boolean)
    : (typeof args.summary === 'string' && args.summary.trim() ? [args.summary.trim()] : undefined)

  const nowIso = new Date().toISOString()

  const state = readState()
  const key = String(taskId)

  let startedAtIso = args['started-at'] ? String(args['started-at']).trim() : undefined
  let endedAtIso = args['ended-at'] ? String(args['ended-at']).trim() : undefined

  if (event === 'start') {
    startedAtIso = startedAtIso || nowIso
    state[key] = { started_at: startedAtIso, title }
    writeState(state)
  }

  if (event === 'end') {
    if (status !== 'success' && status !== 'failed') {
      usageAndExit('no evento end, --status deve ser success|failed')
    }

    const saved = state[key]
    startedAtIso = startedAtIso || saved?.started_at
    endedAtIso = endedAtIso || nowIso

    if (!startedAtIso) {
      usageAndExit('no evento end é obrigatório ter started_at (via --started-at ou estado salvo pelo evento start)')
    }

    if (!summary || summary.length === 0) {
      summary = [
        result || (status === 'success'
          ? `Resultado direto: ${normalizedTitle} concluído com sucesso.`
          : `Resultado direto: ${normalizedTitle} encerrado com pendências.`),
        reason || 'Motivo: garantir execução com rastreabilidade operacional.',
        benefit || 'Vantagem prática: decisão rápida com contexto completo no grupo.',
      ]
    }
  }

  const action = event === 'start'
    ? (why || undefined)
    : undefined
  const details = event === 'start'
    ? (expected || undefined)
    : undefined

  const body = {
    event,
    actor_label: actorLabel,
    title: normalizedTitle,
    task_id: taskId,
    priority,
    action,
    details,
    status,
    deploy_version: deployVersion,
    link_url: linkUrl,
    started_at: startedAtIso,
    ended_at: endedAtIso,
    summary,
  }

  const json = await postJson(`${gateway}${endpoint}`, token, body)

  // Print minimal useful output
  if (json?.data?.message) {
    console.log(json.data.message)
  } else {
    console.log(JSON.stringify(json, null, 2))
  }

  // cleanup state on successful end
  if (!preview && event === 'end') {
    delete state[key]
    writeState(state)
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err?.message || err}\n`)
  process.exit(1)
})

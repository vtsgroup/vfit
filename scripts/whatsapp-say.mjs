#!/usr/bin/env node
/**
 * whatsapp-say — envia uma mensagem PERSONALIZADA ao grupo do WhatsApp.
 *
 * Diferente de whatsapp-task.mjs (que usa os templates de task/deploy do worker),
 * este manda texto livre pelo endpoint /send do worker e anexa, no fim, o rodapé
 * de economia do claude-mem (mesma regra: só com dado real, senão omite).
 *
 * Uso:
 *   node scripts/whatsapp-say.mjs --text "linha 1\nlinha 2"
 *   printf '%s\n' "resumo multilinha…" | node scripts/whatsapp-say.mjs --stdin
 *   node scripts/whatsapp-say.mjs --preview --text "..."     # compõe e mostra, NÃO envia
 *
 * Flags:
 *   --text "<txt>"   texto da mensagem (\n vira quebra de linha)
 *   --stdin          lê o texto do stdin (ideal para blocos multilinha)
 *   --group "<nome>" sobrescreve o grupo destino
 *   --no-footer      não anexa o rodapé de economia
 *   --preview        não envia; só imprime a mensagem final
 *
 * Env (.env.local): WHATSAPP_NOTIFY_TOKEN (ou WHATSAPP_ADMIN_AUTH_TOKEN / ADMIN_AUTH_TOKEN),
 *                   WHATSAPP_GATEWAY_URL (ou WHATSAPP_NOTIFY_URL), WHATSAPP_GROUP_NAME
 */
import fs from 'node:fs'
import { buildMemSavingsFooter } from './lib/mem-savings.mjs'

const DEFAULT_GATEWAY_URL = 'https://vfit-whatsapp.vd-b0b.workers.dev'

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { args._.push(a); continue }
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) { args[key] = true; continue }
    args[key] = next
    i++
  }
  return args
}

function getToken() {
  return (
    process.env.WHATSAPP_NOTIFY_TOKEN
    || process.env.WHATSAPP_ADMIN_AUTH_TOKEN
    || process.env.ADMIN_AUTH_TOKEN
    || ''
  ).trim()
}

function getGatewayBase() {
  let g = (process.env.WHATSAPP_GATEWAY_URL || process.env.WHATSAPP_NOTIFY_URL || DEFAULT_GATEWAY_URL).trim()
  // WHATSAPP_NOTIFY_URL costuma apontar para .../task-notify — derivar a base.
  return g.replace(/\/(task-notify|send|format)\/?$/, '').replace(/\/+$/, '')
}

function readStdin() {
  if (process.stdin.isTTY) return ''
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  let text = ''
  if (args.stdin) {
    text = readStdin()
  } else if (typeof args.text === 'string') {
    text = args.text.replace(/\\n/g, '\n')
  } else if (args._.length) {
    text = args._.join(' ')
  }
  text = String(text || '').trim()
  if (!text) {
    console.error('\n❌ Nada para enviar. Use --text "..." , --stdin, ou passe o texto como argumento.\n')
    process.exit(1)
  }

  if (!args['no-footer']) {
    const footer = buildMemSavingsFooter()
    if (footer) text = `${text}\n\n${footer}`
  }

  if (args.preview) {
    console.log('----- PREVIEW (não enviado) -----')
    console.log(text)
    console.log('---------------------------------')
    return
  }

  const token = getToken()
  if (!token) {
    console.error('\n❌ WHATSAPP_NOTIFY_TOKEN (ou WHATSAPP_ADMIN_AUTH_TOKEN) não configurado.\n')
    process.exit(1)
  }
  const gateway = getGatewayBase()
  const groupName = (typeof args.group === 'string' && args.group)
    || process.env.WHATSAPP_GROUP_NAME
    || undefined

  const res = await fetch(`${gateway}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, group_name: groupName }),
  })
  const raw = await res.text().catch(() => '')
  let json
  try { json = JSON.parse(raw) } catch { json = { raw } }
  if (!res.ok || json?.success === false) {
    console.error(`\n❌ Falha ao enviar: ${json?.error || raw || `HTTP ${res.status}`}\n`)
    process.exit(1)
  }
  console.log('✅ Mensagem enviada ao grupo.')
}

main().catch((err) => {
  console.error(`\n❌ ${err?.message || err}\n`)
  process.exit(1)
})

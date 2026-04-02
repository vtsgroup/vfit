#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const wranglerPath = path.join(root, 'wrangler.toml')
const outPath = path.join(root, 'docs/ULTRA-PLANO-MVP-PRODUCAO/WORKERS-PAID-READINESS.generated.md')

const content = fs.readFileSync(wranglerPath, 'utf-8')

const queuesProducerEnabled = (content.match(/^\[\[queues\.producers\]\]/gm) ?? []).length
const queuesConsumerEnabled = (content.match(/^\[\[queues\.consumers\]\]/gm) ?? []).length
const triggersEnabled = /^\[triggers\]$/m.test(content)
const cronEntries = [...content.matchAll(/^\s*"([^"]+)"\s*,?\s*(?:#.*)?$/gm)].map((m) => m[1])

const requiredBindings = ['EMAIL_QUEUE', 'VIDEO_ENCODE_QUEUE', 'PDF_QUEUE', 'AI_QUEUE']
const optionalBindings = requiredBindings.map((binding) => ({
  binding,
  present: new RegExp(`^\\s*#?\\s*binding\\s*=\\s*"${binding}"`, 'm').test(content),
}))

const now = new Date().toISOString()

const markdown = `# Workers Paid Readiness Report\n\n` +
`> Generated at: ${now}\n\n` +
`## Summary\n\n` +
`- Queues producers enabled blocks: **${queuesProducerEnabled}**\n` +
`- Queues consumers enabled blocks: **${queuesConsumerEnabled}**\n` +
`- Triggers section enabled: **${triggersEnabled ? 'yes' : 'no'}**\n\n` +
`## Queue Bindings (declared in wrangler.toml comments or active blocks)\n\n` +
optionalBindings.map((item) => `- ${item.binding}: ${item.present ? 'present' : 'missing'}`).join('\n') +
`\n\n## Cron Expressions Found\n\n` +
(cronEntries.length > 0 ? cronEntries.map((cron) => `- ${cron}`).join('\n') : '- none detected') +
`\n\n## Operational Recommendation\n\n` +
`1. Confirm Workers Paid is active in Cloudflare dashboard.\n` +
`2. Enable queues + triggers in wrangler.toml only after approval.\n` +
`3. Execute release gate and controlled deploy.\n`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, markdown, 'utf-8')

console.log(`Readiness report written: ${outPath}`)

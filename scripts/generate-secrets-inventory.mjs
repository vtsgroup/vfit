#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const typesPath = resolve(root, 'workers/types.ts')
const outputPath = resolve(root, 'docs/ULTRA-PLANO-MVP-PRODUCAO/SECRETS-INVENTORY.generated.md')

const source = readFileSync(typesPath, 'utf8')

const bindingsMatch = source.match(/export type Bindings = \{([\s\S]*?)\n\}/)
if (!bindingsMatch) {
  throw new Error('Não foi possível localizar `export type Bindings` em workers/types.ts')
}

const bindingBlock = bindingsMatch[1]
const lines = bindingBlock.split('\n')

const domains = new Map([
  ['JWT_SECRET', 'Auth/JWT'],
  ['JWT_REFRESH_SECRET', 'Auth/JWT'],
  ['ASAAS_API_KEY', 'Pagamentos'],
  ['ASAAS_WEBHOOK_TOKEN', 'Pagamentos'],
  ['STRIPE_SECRET_KEY', 'Pagamentos'],
  ['STRIPE_WEBHOOK_SECRET', 'Pagamentos'],
  ['REPLICATE_API_TOKEN', 'IA'],
  ['RESEND_API_KEY', 'Comunicação'],
  ['EMAIL_FROM', 'Comunicação'],
  ['ONESIGNAL_APP_ID', 'Comunicação'],
  ['ONESIGNAL_REST_KEY', 'Comunicação'],
  ['NEON_DATABASE_URL', 'Banco'],
  ['GOOGLE_CLIENT_ID', 'OAuth'],
  ['GOOGLE_CLIENT_SECRET', 'OAuth'],
  ['GOOGLE_REDIRECT_URI', 'OAuth'],
  ['FACEBOOK_APP_ID', 'OAuth'],
  ['FACEBOOK_APP_SECRET', 'OAuth'],
  ['FACEBOOK_REDIRECT_URI', 'OAuth'],
  ['TURNSTILE_SECRET_KEY', 'Bot protection'],
  ['R2_VIDEOS_URL', 'Storage URL'],
  ['R2_IMAGES_URL', 'Storage URL'],
])

const defaultOwnerByDomain = new Map([
  ['Auth/JWT', 'Backend Security Owner'],
  ['Pagamentos', 'Payments Owner'],
  ['IA', 'AI Platform Owner'],
  ['Comunicação', 'Engagement Owner'],
  ['Banco', 'Data Platform Owner'],
  ['OAuth', 'Identity Owner'],
  ['Bot protection', 'Security Operations'],
  ['Storage URL', 'Infra Owner'],
  ['Outros', 'Infra Owner'],
])

const defaultRotationByDomain = new Map([
  ['Auth/JWT', '90 dias'],
  ['Pagamentos', '90 dias'],
  ['IA', '180 dias'],
  ['Comunicação', '180 dias'],
  ['Banco', '90 dias'],
  ['OAuth', '90 dias'],
  ['Bot protection', '180 dias'],
  ['Storage URL', 'Sob demanda'],
  ['Outros', '180 dias'],
])

const secrets = []
for (const rawLine of lines) {
  const line = rawLine.trim()
  if (!line || line.startsWith('//')) continue
  if (line.includes('?')) continue
  const match = line.match(/^([A-Z0-9_]+):\s*string\b/)
  if (!match) continue

  const key = match[1]
  const domain = domains.get(key) || 'Outros'
  secrets.push({
    key,
    domain,
    owner: defaultOwnerByDomain.get(domain) || 'Infra Owner',
    rotation: defaultRotationByDomain.get(domain) || '180 dias',
  })
}

const generatedAt = new Date().toISOString()

const markdown = [
  '# Secrets Inventory (Gerado automaticamente)',
  '',
  `> Fonte: workers/types.ts`,
  `> Gerado em: ${generatedAt}`,
  '',
  '| Secret | Domínio | Owner sugerido | Rotação sugerida |',
  '|---|---|---|---|',
  ...secrets.map((s) => `| ${s.key} | ${s.domain} | ${s.owner} | ${s.rotation} |`),
  '',
  `Total de itens inventariados: **${secrets.length}**.`,
  '',
].join('\n')

writeFileSync(outputPath, markdown, 'utf8')

// eslint-disable-next-line no-console
console.log(`Inventário gerado em: ${outputPath}`)

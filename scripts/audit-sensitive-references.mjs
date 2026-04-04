#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'

const root = process.cwd()
const outputPath = resolve(root, 'docs/ULTRA-PLANO-MVP-PRODUCAO/SENSITIVE-REFERENCES-AUDIT.generated.md')

function parseArgs(argv) {
  const args = { failOn: null }
  for (const item of argv) {
    if (item.startsWith('--fail-on=')) {
      args.failOn = item.split('=')[1]?.toUpperCase() || null
    }
  }
  return args
}

const cli = parseArgs(process.argv.slice(2))

const includeExt = new Set(['.md', '.ts', '.tsx', '.mjs', '.json', '.yml', '.yaml', '.toml', '.sh'])
const ignoreDirs = new Set(['node_modules', '.git', 'dist', '.wrangler', 'out'])

const patterns = [
  { name: 'postgres_connection_string_with_credentials', severity: 'P0', regex: /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/gi },
  { name: 'neon_token_prefix', severity: 'P0', regex: /npg_[A-Za-z0-9]+/gi },
  { name: 'authorization_bearer_hardcoded', severity: 'P0', regex: /Authorization\s*:\s*Bearer\s+[A-Za-z0-9._-]{20,}/gi },
  { name: 'wrangler_oauth_token_hardcoded', severity: 'P0', regex: /oauth_token\s*=\s*"[A-Za-z0-9._-]{20,}"/gi },
  { name: 'hardcoded_password_like', severity: 'P0', regex: /password"\s*:\s*"(?!<)[^"]{6,}"/gi },
  { name: 'known_admin_email', severity: 'P1', regex: /(victor\.duarte@(?:personalia\.(?:com\.br|app\.br)|(?:ia)?personal\.app\.br|vfit\.app\.br)|emerson\.xavier@personalia\.app\.br)/gi },
]

function listFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    if (ignoreDirs.has(entry)) continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...listFiles(full))
      continue
    }
    if (!includeExt.has(extname(full))) continue
    out.push(full)
  }
  return out
}

const files = listFiles(root)
const findings = []

for (const filePath of files) {
  const rel = filePath.replace(`${root}/`, '')
  const content = readFileSync(filePath, 'utf8')
  for (const p of patterns) {
    const matches = content.match(p.regex)
    if (matches && matches.length > 0) {
      findings.push({ file: rel, pattern: p.name, severity: p.severity, count: matches.length })
    }
  }
}

const bySeverity = findings.reduce((acc, f) => {
  acc[f.severity] = (acc[f.severity] || 0) + f.count
  return acc
}, {})

const severityOrder = ['P0', 'P1', 'P2']

function shouldFail(failOn) {
  if (!failOn) return false
  const threshold = severityOrder.indexOf(failOn)
  if (threshold === -1) return false

  return findings.some((f) => {
    const sev = severityOrder.indexOf(f.severity)
    return sev !== -1 && sev <= threshold
  })
}

const md = [
  '# Auditoria de Referências Sensíveis (Gerado automaticamente)',
  '',
  `> Gerado em: ${new Date().toISOString()}`,
  '',
  '## Resumo',
  `- Total de arquivos analisados: **${files.length}**`,
  `- Achados P0: **${bySeverity.P0 || 0}**`,
  `- Achados P1: **${bySeverity.P1 || 0}**`,
  `- Modo fail-on: **${cli.failOn || 'off'}**`,
  '',
  '## Achados',
  '| Arquivo | Pattern | Severidade | Ocorrências |',
  '|---|---|---|---:|',
  ...findings.map((f) => `| ${f.file} | ${f.pattern} | ${f.severity} | ${f.count} |`),
  '',
  '## Observação',
  '- Este relatório é auxiliar e pode gerar falso positivo em exemplos didáticos.',
].join('\n')

writeFileSync(outputPath, md, 'utf8')
console.log(`Audit report gerado em: ${outputPath}`)

if (shouldFail(cli.failOn)) {
  console.error(`[security:audit] Falha por política fail-on=${cli.failOn}.`)
  process.exit(1)
}

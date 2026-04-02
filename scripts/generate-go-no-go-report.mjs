#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const checks = [
  {
    name: 'LOTE 017 registrado',
    test: () => readFileSafe('docs/ULTRA-PLANO-MVP-PRODUCAO/EXECUCAO-LOTES/LOTE-011-020.md').includes('LOTE 017: DONE'),
  },
  {
    name: 'LOTE 018 registrado',
    test: () => readFileSafe('docs/ULTRA-PLANO-MVP-PRODUCAO/EXECUCAO-LOTES/LOTE-011-020.md').includes('LOTE 018: DONE'),
  },
  {
    name: 'LOTE 019 registrado',
    test: () => readFileSafe('docs/ULTRA-PLANO-MVP-PRODUCAO/EXECUCAO-LOTES/LOTE-011-020.md').includes('LOTE 019: DONE'),
  },
  {
    name: 'LOTE 020 registrado',
    test: () => readFileSafe('docs/ULTRA-PLANO-MVP-PRODUCAO/EXECUCAO-LOTES/LOTE-011-020.md').includes('LOTE 020: DONE'),
  },
  {
    name: 'Migration 0011 presente',
    test: () => existsSync(resolve('migrations/hyperdrive/0011_admin_account_notes.sql')),
  },
  {
    name: 'Relatório de auditoria web presente',
    test: () => existsSync(resolve('docs/ULTRA-PLANO-MVP-PRODUCAO/WEB-SECURITY-AUDIT.generated.md')),
  },
  {
    name: 'Quality Gates atualizados até Gate 18',
    test: () => /Gate\s+18\b/.test(readFileSafe('docs/ULTRA-PLANO-MVP-PRODUCAO/QUALITY-GATES.md')),
  },
]

function readFileSafe(path) {
  try {
    return readFileSync(resolve(path), 'utf8')
  } catch {
    return ''
  }
}

const results = checks.map((c) => ({ name: c.name, ok: Boolean(c.test()) }))
const go = results.every((r) => r.ok)
const generatedAt = new Date().toISOString()

let md = ''
md += '# GO / NO-GO — MVP Produção (LOTE 020)\n\n'
md += `Gerado em: **${generatedAt}**\n\n`
md += `Decisão: **${go ? 'GO ✅' : 'NO-GO ❌'}**\n\n`
md += '| Critério | Status |\n'
md += '|---|---|\n'
for (const r of results) {
  md += `| ${r.name} | ${r.ok ? '✅' : '❌'} |\n`
}
md += '\n'
md += '## Observações\n\n'
md += '- GO exige execução dos gates técnicos (lint, type-check, workers type-check, build, smoke API).\n'
md += '- Deploy deve ocorrer exclusivamente via `npm run cf:deploy` após validação final.\n'

const out = resolve('docs/ULTRA-PLANO-MVP-PRODUCAO/GO-NO-GO-MVP.generated.md')
writeFileSync(out, md, 'utf8')

console.log(`[go-no-go] report written: ${out}`)
if (!go) process.exitCode = 2

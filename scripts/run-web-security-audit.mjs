#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const targets = [
  { name: 'Frontend', url: 'https://vfit.app.br', kind: 'frontend' },
  { name: 'API Health', url: 'https://api.vfit.app.br/health', kind: 'api' },
]

const headerChecks = {
  frontend: [
    'strict-transport-security',
    'content-security-policy',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
  ],
  api: [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'access-control-allow-origin',
  ],
}

function pass(v) {
  return v ? '✅' : '❌'
}

function curlHead(url, { origin } = {}) {
  const startedAt = Date.now()

  const originHeader = origin ? `-H "Origin: ${origin}"` : ''

  // -I: HEAD (headers only)
  // -D -: dump headers to stdout
  // -o /dev/null: discard body
  // -m 12: hard timeout
  const cmd = `curl -sS -I -D - -o /dev/null -m 12 ${originHeader} "${url}"`

  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1024 * 1024 })
    const elapsed = Date.now() - startedAt

    const lines = out.split(/\r?\n/).filter(Boolean)
    const httpLines = lines.filter((l) => l.toUpperCase().startsWith('HTTP/'))
    const statusLine = httpLines.length ? httpLines[httpLines.length - 1] : ''
    const statusMatch = statusLine.match(/HTTP\/\S+\s+(\d{3})/)
    const status = statusMatch ? Number(statusMatch[1]) : null

    const headers = {}
    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim().toLowerCase()
      const value = line.slice(idx + 1).trim()
      // manter último valor (suficiente para checks)
      headers[key] = value
    }

    return { status, headers, elapsed, error: null }
  } catch (error) {
    return {
      status: null,
      headers: {},
      elapsed: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function inspectTarget(target) {
  const origin = target.kind === 'api' ? 'https://vfit.app.br' : null
  const { status, headers, elapsed, error } = curlHead(target.url, { origin })

  const checks = headerChecks[target.kind].map((headerName) => {
    const value = headers[headerName] || null
    return {
      headerName,
      value,
      ok: Boolean(value),
    }
  })

  return {
    ...target,
    status,
    elapsed,
    checks,
    ok: Boolean(status) && checks.every((c) => c.ok),
    networkOk: Boolean(status),
    error,
  }
}

const results = await Promise.all(targets.map(inspectTarget))
const allOk = results.every((r) => r.ok)
const generatedAt = new Date().toISOString()

let md = ''
md += '# Web Security Audit — LOTE 019\n\n'
md += `Gerado em: **${generatedAt}**\n\n`
md += `Status geral: **${allOk ? 'GO ✅' : 'ATENÇÃO ⚠️'}**\n\n`
md += '| Alvo | HTTP | Tempo | Resultado |\n'
md += '|---|---:|---:|---|\n'
for (const r of results) {
  md += `| ${r.name} | ${r.status ?? 'ERR'} | ${r.elapsed}ms | ${r.ok ? '✅' : '❌'} |\n`
}
md += '\n'

for (const r of results) {
  md += `## ${r.name}\n\n`
  md += `URL: ${r.url}\n\n`
  if (r.error) {
    md += `Erro: ${r.error}\n\n`
  }
  if (r.networkOk === false) {
    md += '> Observação: falha de rede/timeout durante auditoria. Headers abaixo podem estar indisponíveis por conectividade, não por configuração.\n\n'
  }
  md += '| Header | Presente | Valor |\n'
  md += '|---|---|---|\n'
  for (const c of r.checks) {
    const value = c.value ? c.value.replace(/\|/g, '\\|') : '-' 
    md += `| ${c.headerName} | ${pass(c.ok)} | ${value} |\n`
  }
  md += '\n'
}

md += '## Critérios\n\n'
md += '- Frontend: CSP + HSTS + hardening headers presentes.\n'
md += '- API: CORS explícito + hardening headers presentes.\n'
md += '- Divergências devem gerar ajuste em `public/_headers`, middleware e CORS policy.\n'

const out = resolve('docs/ULTRA-PLANO-MVP-PRODUCAO/WEB-SECURITY-AUDIT.generated.md')
writeFileSync(out, md, 'utf8')

console.log(`[web-audit] report written: ${out}`)
if (!allOk) {
  console.log('[web-audit] completed with findings')
}

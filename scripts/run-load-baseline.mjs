#!/usr/bin/env node

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const baseUrl = process.env.LOAD_TEST_BASE_URL || 'https://api.iapersonal.app.br'
const authToken = process.env.LOAD_TEST_AUTH_TOKEN || ''
const outputPath = resolve(process.cwd(), 'docs/ULTRA-PLANO-MVP-PRODUCAO/LOAD-TEST-BASELINE.generated.md')

function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function runScenario({ name, method, path, totalRequests, concurrency, headers = {} }) {
  const latencies = []
  let ok = 0
  let fail = 0

  const started = Date.now()

  for (let i = 0; i < totalRequests; i += concurrency) {
    const burst = Array.from({ length: Math.min(concurrency, totalRequests - i) }, async () => {
      const t0 = performance.now()
      try {
        const res = await fetch(`${baseUrl}${path}`, { method, headers })
        const t1 = performance.now()
        latencies.push(t1 - t0)

        if (res.ok) ok += 1
        else fail += 1
      } catch {
        const t1 = performance.now()
        latencies.push(t1 - t0)
        fail += 1
      }
    })

    await Promise.all(burst)
  }

  const durationMs = Date.now() - started
  const sorted = [...latencies].sort((a, b) => a - b)
  const rps = durationMs > 0 ? (totalRequests / durationMs) * 1000 : 0

  return {
    name,
    method,
    path,
    totalRequests,
    concurrency,
    ok,
    fail,
    successRate: totalRequests > 0 ? (ok / totalRequests) * 100 : 0,
    durationMs,
    rps,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted.length ? sorted[sorted.length - 1] : 0,
  }
}

async function main() {
  const scenarios = [
    {
      name: 'Health check',
      method: 'GET',
      path: '/health',
      totalRequests: 200,
      concurrency: 20,
    },
    {
      name: 'Public exercises list',
      method: 'GET',
      path: '/api/v1/exercises?page=1&per_page=20',
      totalRequests: 120,
      concurrency: 12,
    },
  ]

  if (authToken) {
    scenarios.push(
      {
        name: 'Auth me (token)',
        method: 'GET',
        path: '/api/v1/auth/me',
        totalRequests: 100,
        concurrency: 10,
        headers: { Authorization: `Bearer ${authToken}` },
      },
      {
        name: 'Payments balance (token)',
        method: 'GET',
        path: '/api/v1/payments/balance',
        totalRequests: 80,
        concurrency: 8,
        headers: { Authorization: `Bearer ${authToken}` },
      },
      {
        name: 'Assessments list (token)',
        method: 'GET',
        path: '/api/v1/assessments?page=1&per_page=20',
        totalRequests: 80,
        concurrency: 8,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )
  }

  const results = []
  for (const scenario of scenarios) {
    console.log(`[load-baseline] Running: ${scenario.name}`)
    const result = await runScenario(scenario)
    results.push(result)
  }

  const generatedAt = new Date().toISOString()
  const tokenMode = authToken ? 'enabled' : 'disabled'

  const markdown = [
    '# Load Test Baseline (Gerado automaticamente)',
    '',
    `> Gerado em: ${generatedAt}`,
    `> Base URL: ${baseUrl}`,
    `> Auth scenarios: ${tokenMode}`,
    '',
    '## Resultados',
    '| Cenário | Requisições | Concorrência | Sucesso | Falha | Taxa sucesso | RPS | p50 (ms) | p95 (ms) | p99 (ms) | máx (ms) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...results.map((r) =>
      `| ${r.name} | ${r.totalRequests} | ${r.concurrency} | ${r.ok} | ${r.fail} | ${r.successRate.toFixed(2)}% | ${r.rps.toFixed(2)} | ${r.p50.toFixed(2)} | ${r.p95.toFixed(2)} | ${r.p99.toFixed(2)} | ${r.max.toFixed(2)} |`
    ),
    '',
    '## Interpretação inicial',
    '- Baseline não destrutivo (carga controlada) para referência do Lote 009.',
    '- Usar este resultado como comparativo para tuning futuro (Lote 010+).',
    '- Para cenários protegidos, executar com `LOAD_TEST_AUTH_TOKEN` em janela controlada.',
    '',
    '## Próximos passos',
    '1. Repetir baseline em horários de pico e fora de pico.',
    '2. Comparar variação de p95/p99 com metas de SLO do Lote 008.',
    '3. Evoluir para cenários de escrita com dados de teste isolados.',
    '',
  ].join('\n')

  writeFileSync(outputPath, markdown, 'utf8')
  console.log(`Load baseline report gerado em: ${outputPath}`)
}

main().catch((err) => {
  console.error('[load-baseline] failed:', err)
  process.exit(1)
})

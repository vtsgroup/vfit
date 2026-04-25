#!/usr/bin/env node
/**
 * Super QA — Visita rotas públicas em mobile + desktop, captura screenshots,
 * detecta console errors, requests falhos, overflows horizontais e crash de página.
 *
 * Uso:
 *   node scripts/super-qa.mjs                    # roda em prod (https://vfit.app.br)
 *   QA_BASE_URL=http://localhost:3000 node ...   # local
 *   QA_ROUTES_FILTER=nutricao node ...           # apenas rotas que matcham
 */

import { chromium, devices } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.QA_BASE_URL || 'https://vfit.app.br'
const FILTER = process.env.QA_ROUTES_FILTER || ''
const OUT_DIR = path.resolve('test-results/super-qa')
const TIMEOUT_NAV = 30_000
const TIMEOUT_IDLE = 5_000

// Rotas públicas / com fallback no-auth (são as que conseguimos QA sem login)
const ROUTES = [
  // Marketing / institucional
  { path: '/', tag: 'home' },
  { path: '/pricing', tag: 'marketing' },
  { path: '/sobre', tag: 'marketing' },
  { path: '/contato', tag: 'marketing' },
  { path: '/carreiras', tag: 'marketing' },
  { path: '/afiliados', tag: 'marketing' },
  { path: '/app-personal-trainer', tag: 'marketing' },
  { path: '/nutricionistas', tag: 'marketing' },

  // Auth
  { path: '/login', tag: 'auth' },
  { path: '/register', tag: 'auth' },
  { path: '/register/personal', tag: 'auth' },
  { path: '/register/student', tag: 'auth' },
  { path: '/forgot-password', tag: 'auth' },
  { path: '/reset-password', tag: 'auth' },
  { path: '/verify-email', tag: 'auth' },

  // Onboarding
  { path: '/welcome', tag: 'onboarding' },
  { path: '/onboarding', tag: 'onboarding' },
  { path: '/onboarding/loading', tag: 'onboarding' },
  { path: '/onboarding/notifications', tag: 'onboarding' },
  { path: '/onboarding/paywall', tag: 'onboarding' },
  { path: '/onboarding/result', tag: 'onboarding' },

  // Guest area
  { path: '/guest/explore', tag: 'guest' },
  { path: '/guest/calculators', tag: 'guest' },
  { path: '/guest/workouts', tag: 'guest' },

  // App pages (vão exibir login wall ou demo data — ainda assim valem QA visual)
  { path: '/nutricao', tag: 'app' }, // <— alvo do hotfix
  { path: '/treinos', tag: 'app' },
  { path: '/treinos/novo', tag: 'app' },
  { path: '/exercicios', tag: 'app' },
  { path: '/avaliacoes', tag: 'app' },
  { path: '/avaliacoes/nova', tag: 'app' },
  { path: '/progresso', tag: 'app' },
  { path: '/progresso/conquistas', tag: 'app' },
  { path: '/progresso/corporal', tag: 'app' },
  { path: '/progresso/streaks', tag: 'app' },
  { path: '/perfil', tag: 'app' },
  { path: '/perfil/editar', tag: 'app' },
  { path: '/perfil/assinatura', tag: 'app' },
  { path: '/perfil/notificacoes', tag: 'app' },
  { path: '/perfil/equipamentos', tag: 'app' },
  { path: '/perfil/lembretes', tag: 'app' },
  { path: '/perfil/tema', tag: 'app' },
  { path: '/plano', tag: 'app' },
  { path: '/ia', tag: 'app' },
  { path: '/ia/dieta', tag: 'app' },
  { path: '/ia/macros', tag: 'app' },
  { path: '/ia/recuperacao', tag: 'app' },
  { path: '/ia/treino-adaptado', tag: 'app' },
  { path: '/social', tag: 'app' },
  { path: '/treino-ativo', tag: 'app' },

  // Legal
  { path: '/termos', tag: 'legal' },
  { path: '/privacidade', tag: 'legal' },
  { path: '/cookies', tag: 'legal' },
  { path: '/lgpd', tag: 'legal' },
  { path: '/excluir-conta', tag: 'legal' },

  // Blog
  { path: '/blog', tag: 'blog' },
  { path: '/blog/ia-personal-trainer', tag: 'blog' },

  // Misc
  { path: '/offline', tag: 'misc' },
  { path: '/status', tag: 'misc' },
  { path: '/_not-found-test-404', tag: 'misc' }, // intentional 404 probe
].filter((r) => !FILTER || r.path.includes(FILTER) || r.tag.includes(FILTER))

// Padrões para ignorar como ruído (ex: blocked by CSP, OneSignal noise)
const IGNORED_CONSOLE_PATTERNS = [
  /OneSignal/i,
  /\[OneSignal\]/i,
  /favicon/i,
  /manifest\.json/i, // alguns warnings de PWA
  /MutationObserver/i, // browser extension noise
  /third-?party cookie/i,
  /Failed to load resource: net::ERR_BLOCKED_BY_CLIENT/i, // ad blockers
]

const IGNORED_NETWORK_PATTERNS = [
  /onesignal\.com/i,
  /google-analytics/i,
  /googletagmanager/i,
  /facebook\.com\/tr/i,
  /\/api\/v1\/.*\/me/i, // 401 esperado sem auth
  /\.well-known\/assetlinks\.json/i, // não disponível em todos os ambientes
]

function shouldIgnoreConsole(text) {
  return IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text))
}
function shouldIgnoreNetwork(url) {
  return IGNORED_NETWORK_PATTERNS.some((p) => p.test(url))
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function qaRoute(context, route, viewportTag) {
  const page = await context.newPage()
  const errors = []
  const failedRequests = []
  const consoleErrors = []
  const consoleWarnings = []

  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    if (shouldIgnoreConsole(text)) return
    if (type === 'error') consoleErrors.push(text)
    else if (type === 'warning') consoleWarnings.push(text)
  })

  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`)
  })

  page.on('requestfailed', (req) => {
    const url = req.url()
    if (shouldIgnoreNetwork(url)) return
    failedRequests.push(`${req.failure()?.errorText || 'failed'} ${url}`)
  })

  page.on('response', (resp) => {
    const url = resp.url()
    if (shouldIgnoreNetwork(url)) return
    const status = resp.status()
    if (status >= 500) {
      failedRequests.push(`HTTP ${status} ${url}`)
    }
  })

  let navStatus = 0
  let navError = null
  const startedAt = Date.now()

  try {
    const resp = await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT_NAV,
    })
    navStatus = resp?.status() ?? 0
    // give app a moment to hydrate / fetch
    await page.waitForLoadState('networkidle', { timeout: TIMEOUT_IDLE }).catch(() => {})
  } catch (e) {
    navError = e.message
  }

  // Layout checks
  let overflowX = false
  let bodyText = ''
  let title = ''
  try {
    const dims = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      title: document.title,
      bodyText: (document.body?.innerText || '').slice(0, 4000),
    }))
    overflowX = dims.docW > dims.winW + 1
    title = dims.title
    bodyText = dims.bodyText
  } catch {
    /* page may have crashed */
  }

  // Visible crash markers
  const crashMarkers = []
  if (/Application error|Internal Server Error|something went wrong|Erro interno|crashed/i.test(bodyText)) {
    crashMarkers.push('error-text-on-page')
  }
  if (/this\.props|undefined is not an object|cannot read prop/i.test(bodyText)) {
    crashMarkers.push('react-error-leak')
  }

  // Screenshot
  const slug = route.path.replace(/\//g, '_').replace(/^_/, '') || 'home'
  const shotPath = path.join(OUT_DIR, viewportTag, `${slug}.png`)
  await ensureDir(path.dirname(shotPath))
  try {
    await page.screenshot({ path: shotPath, fullPage: true, timeout: 15_000 })
  } catch (e) {
    errors.push(`screenshot-failed: ${e.message}`)
  }

  await page.close()

  const ms = Date.now() - startedAt
  const severity =
    navError || navStatus >= 500 || crashMarkers.length || errors.length
      ? 'critical'
      : navStatus === 404 && route.path !== '/_not-found-test-404'
      ? 'critical'
      : consoleErrors.length || failedRequests.length || overflowX
      ? 'high'
      : consoleWarnings.length
      ? 'medium'
      : 'ok'

  return {
    path: route.path,
    tag: route.tag,
    viewport: viewportTag,
    navStatus,
    navError,
    title,
    overflowX,
    crashMarkers,
    consoleErrors,
    consoleWarnings,
    failedRequests,
    errors,
    ms,
    screenshot: path.relative(process.cwd(), shotPath),
    severity,
  }
}

async function main() {
  console.log(`\n🧪 Super QA — base: ${BASE_URL}`)
  console.log(`📋 Rotas: ${ROUTES.length} | Filtro: ${FILTER || '(nenhum)'}\n`)

  await ensureDir(OUT_DIR)

  const browser = await chromium.launch({ headless: true })

  // Mobile (Pixel 7 — match playwright.config)
  const mobileCtx = await browser.newContext({
    ...devices['Pixel 7'],
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })
  // Desktop
  const desktopCtx = await browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })

  const results = []

  // Mobile run
  console.log('📱 MOBILE PASS (Pixel 7)\n')
  for (const route of ROUTES) {
    process.stdout.write(`  ${route.path.padEnd(48)} `)
    const r = await qaRoute(mobileCtx, route, 'mobile')
    results.push(r)
    const icon = { ok: '✅', medium: '🟡', high: '🟠', critical: '🔴' }[r.severity]
    console.log(`${icon} ${r.severity.padEnd(8)} ${r.navStatus || '—'} ${r.ms}ms`)
  }

  // Desktop run
  console.log('\n🖥  DESKTOP PASS (1440x900)\n')
  for (const route of ROUTES) {
    process.stdout.write(`  ${route.path.padEnd(48)} `)
    const r = await qaRoute(desktopCtx, route, 'desktop')
    results.push(r)
    const icon = { ok: '✅', medium: '🟡', high: '🟠', critical: '🔴' }[r.severity]
    console.log(`${icon} ${r.severity.padEnd(8)} ${r.navStatus || '—'} ${r.ms}ms`)
  }

  await browser.close()

  // Save raw JSON
  await fs.writeFile(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))

  // Build markdown report
  const byPath = new Map()
  for (const r of results) {
    const key = r.path
    if (!byPath.has(key)) byPath.set(key, [])
    byPath.get(key).push(r)
  }

  const counts = { ok: 0, medium: 0, high: 0, critical: 0 }
  for (const r of results) counts[r.severity]++

  const lines = []
  lines.push(`# Super QA Report — VFIT v3.2.0`)
  lines.push(``)
  lines.push(`- **Base URL:** ${BASE_URL}`)
  lines.push(`- **Data:** ${new Date().toISOString()}`)
  lines.push(`- **Rotas testadas:** ${ROUTES.length} (mobile + desktop = ${results.length} runs)`)
  lines.push(``)
  lines.push(`## Resumo`)
  lines.push(``)
  lines.push(`| Severity | Count |`)
  lines.push(`|----------|------:|`)
  lines.push(`| 🔴 critical | ${counts.critical} |`)
  lines.push(`| 🟠 high | ${counts.high} |`)
  lines.push(`| 🟡 medium | ${counts.medium} |`)
  lines.push(`| ✅ ok | ${counts.ok} |`)
  lines.push(``)

  // Critical & high tables
  for (const sev of ['critical', 'high', 'medium']) {
    const items = results.filter((r) => r.severity === sev)
    if (!items.length) continue
    lines.push(`## ${sev.toUpperCase()} (${items.length})`)
    lines.push(``)
    lines.push(`| Path | Viewport | Status | Issues |`)
    lines.push(`|------|----------|-------:|--------|`)
    for (const r of items) {
      const issues = []
      if (r.navError) issues.push(`navError: ${r.navError}`)
      if (r.navStatus >= 400 && r.path !== '/_not-found-test-404') issues.push(`HTTP ${r.navStatus}`)
      if (r.crashMarkers.length) issues.push(`crash: ${r.crashMarkers.join(',')}`)
      if (r.overflowX) issues.push('overflow-x')
      if (r.consoleErrors.length) issues.push(`${r.consoleErrors.length} console-error`)
      if (r.failedRequests.length) issues.push(`${r.failedRequests.length} req-failed`)
      if (r.consoleWarnings.length) issues.push(`${r.consoleWarnings.length} warn`)
      lines.push(`| \`${r.path}\` | ${r.viewport} | ${r.navStatus || '—'} | ${issues.join(' · ') || '—'} |`)
    }
    lines.push(``)
  }

  // Detailed per-route — only non-ok
  const problematic = [...byPath.entries()].filter(([, runs]) => runs.some((r) => r.severity !== 'ok'))
  if (problematic.length) {
    lines.push(`## Detalhes por rota (não-ok)`)
    lines.push(``)
    for (const [p, runs] of problematic) {
      lines.push(`### \`${p}\``)
      lines.push(``)
      for (const r of runs) {
        if (r.severity === 'ok') continue
        lines.push(`**${r.viewport}** — ${r.severity} — HTTP ${r.navStatus || '—'} — ${r.ms}ms`)
        lines.push(``)
        if (r.navError) lines.push(`- nav error: \`${r.navError}\``)
        if (r.crashMarkers.length) lines.push(`- crash markers: ${r.crashMarkers.join(', ')}`)
        if (r.overflowX) lines.push(`- ⚠️ horizontal overflow`)
        if (r.consoleErrors.length) {
          lines.push(`- console errors:`)
          for (const e of r.consoleErrors.slice(0, 5)) lines.push(`  - \`${e.slice(0, 200)}\``)
        }
        if (r.failedRequests.length) {
          lines.push(`- failed requests:`)
          for (const f of r.failedRequests.slice(0, 5)) lines.push(`  - \`${f.slice(0, 200)}\``)
        }
        lines.push(`- screenshot: \`${r.screenshot}\``)
        lines.push(``)
      }
    }
  }

  await fs.writeFile(path.join(OUT_DIR, 'REPORT.md'), lines.join('\n'))

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`📊 Resumo: 🔴 ${counts.critical} · 🟠 ${counts.high} · 🟡 ${counts.medium} · ✅ ${counts.ok}`)
  console.log(`📄 Report: ${path.relative(process.cwd(), path.join(OUT_DIR, 'REPORT.md'))}`)
  console.log(`📸 Screenshots: ${path.relative(process.cwd(), OUT_DIR)}/{mobile,desktop}/`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  // Exit code
  process.exit(counts.critical > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('💥 super-qa crashed:', err)
  process.exit(2)
})

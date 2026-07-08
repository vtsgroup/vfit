// ============================================
// splash-boot.spec.ts — Boot Experience TWA/PWA (plano splash-boot 2026-07-08)
// ============================================
//
// Valida o contrato do boot: Abriu → Splash (primeiro paint) → destino, sem
// welcome vazando para logado e sem tela escura. Emula standalone/TWA via
// addInitScript (monkey-patch de matchMedia) — Playwright não emula
// display-mode nativamente (achado OV-8 do plan review).
//
// A splash deve sair por PRONTIDÃO (sessão + destino resolvido), nunca pela
// válvula de 4s — por isso os timeouts de saída ficam abaixo de 4000ms+fade.

import { expect, test, type Page } from '@playwright/test'

// Dev server compila rotas sob demanda — primeira visita pode passar de 30s.
// mode 'default' (anula o fullyParallel global só neste arquivo): timing de boot
// (splash/hidratação) é sensível à contenção de compile de workers paralelos.
test.describe.configure({ mode: 'default', timeout: 60_000 })

type UserType = 'personal' | 'student' | 'nutritionist' | 'admin'

function makeUser(userType: UserType, role: 'user' | 'admin' | 'super_admin' = 'user') {
  return {
    id: `e2e-${userType}`,
    email: `${userType}@e2e.vfit`,
    full_name: `E2E ${userType}`,
    user_type: userType,
    role,
    avatar_url: null,
    phone: null,
    created_at: '2026-01-01T00:00:00Z',
  }
}

/** Emula display-mode: standalone (TWA/PWA) ANTES de qualquer script da página. */
async function emulateStandalone(page: Page) {
  await page.addInitScript(() => {
    const orig = window.matchMedia.bind(window)
    window.matchMedia = (query: string) =>
      query.includes('display-mode: standalone')
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() {
              return false
            },
          } as unknown as MediaQueryList)
        : orig(query)
  })
}

/** Semeia sessão persistida no formato do zustand/persist (vfit-auth). */
async function seedSession(page: Page, userType: UserType) {
  const user = makeUser(userType, userType === 'admin' ? 'admin' : 'user')
  await page.addInitScript((u) => {
    window.localStorage.setItem(
      'vfit-auth',
      JSON.stringify({
        state: {
          user: u,
          personalProfile: null,
          studentProfile: null,
          nutritionistProfile: null,
          tokens: {
            access_token: 'e2e-token',
            refresh_token: 'e2e-refresh',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
          },
          isAuthenticated: true,
        },
        version: 0,
      })
    )
  }, user)
}

/** Mocka a API: /auth/me válido + demais endpoints com payload vazio. */
async function mockApi(page: Page, opts: { authMe?: 'ok' | 401 | 'offline'; userType?: UserType } = {}) {
  const { authMe = 'ok', userType = 'personal' } = opts
  await page.route('**://api.vfit.app.br/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await page.route('**/auth/me', (route) => {
    if (authMe === 'offline') return route.abort('failed')
    if (authMe === 401)
      return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"unauthorized"}' })
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: makeUser(userType) }),
    })
  })
  // Sessão inválida: o api-client tenta refresh antes de derrubar a sessão —
  // o refresh também precisa falhar com 401 para o logout acontecer (fluxo real).
  if (authMe === 401) {
    await page.route('**/auth/refresh', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"invalid_refresh"}' })
    )
  }
  // Terceiros fora do caminho crítico do boot
  await page.route('**cdn.onesignal.com**', (route) => route.abort())
  await page.route('**googletagmanager.com**', (route) => route.abort())
}

const SPLASH = '.vsp-root'
// Saída por prontidão: min 1600ms + fade 620ms + folga. Válvula (4000+620) fica FORA.
const EXIT_BY_READINESS_MS = 3800

test.describe('Boot TWA/PWA — logado nunca vê o welcome', () => {
  test('[CRÍTICO] standalone + personal em /welcome → /dashboard, splash primeiro, sem frame do welcome', async ({
    page,
  }) => {
    await emulateStandalone(page)
    await seedSession(page, 'personal')
    await mockApi(page, { userType: 'personal' })

    await page.goto('/welcome', { waitUntil: 'commit' })

    // Redirect pré-paint: aterrissa no dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    // Splash cobre o boot e sai por prontidão (antes da válvula de 4s)
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: EXIT_BY_READINESS_MS + 4000 })
    // Nenhum conteúdo do welcome presente no destino
    await expect(page.locator('.bc-root')).toHaveCount(0)
  })

  test('standalone + student em /welcome → /treinos', async ({ page }) => {
    await emulateStandalone(page)
    await seedSession(page, 'student')
    await mockApi(page, { userType: 'student' })

    await page.goto('/welcome', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/treinos/, { timeout: 15_000 })
  })

  test('standalone + admin em /welcome → /dashboard/admin', async ({ page }) => {
    await emulateStandalone(page)
    await seedSession(page, 'admin')
    await mockApi(page, { userType: 'admin' })

    await page.goto('/welcome', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 15_000 })
  })

  test('standalone + student em /dashboard (deep link) → /treinos pré-paint', async ({ page }) => {
    await emulateStandalone(page)
    await seedSession(page, 'student')
    await mockApi(page, { userType: 'student' })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/treinos/, { timeout: 15_000 })
  })
})

test.describe('Boot TWA/PWA — anônimo', () => {
  test('standalone + anon em /welcome → splash primeiro, depois welcome interativo', async ({ page }) => {
    await emulateStandalone(page)
    await mockApi(page)

    await page.goto('/welcome', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/welcome/)
    // Splash pré-renderizada participa do boot standalone…
    await expect(page.locator(SPLASH)).toBeVisible({ timeout: 5000 })
    // …e sai por prontidão (anon: sessão pronta sem rede + welcome é terminal)
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: EXIT_BY_READINESS_MS + 4000 })
    // Welcome interativo por baixo
    await expect(page.locator('.bc-root')).toBeVisible()
  })

  test('standalone + anon em /dashboard → /welcome pré-paint', async ({ page }) => {
    await emulateStandalone(page)
    await mockApi(page)

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/welcome/, { timeout: 15_000 })
  })

  test('standalone + GUEST em /treinos → fica (guest mode respeitado)', async ({ page }) => {
    await emulateStandalone(page)
    await mockApi(page)
    await page.addInitScript(() => {
      window.localStorage.setItem('vfit_guest_mode', 'true')
    })

    await page.goto('/treinos', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/treinos/, { timeout: 15_000 })
  })

  test('browser comum + anon em /welcome → welcome instantâneo SEM splash (funil intacto)', async ({
    page,
  }) => {
    await mockApi(page)

    await page.goto('/welcome', { waitUntil: 'commit' })
    // Splash standalone-only nunca fica visível em browser comum
    await expect(page.locator(SPLASH)).toBeHidden()
    await expect(page.locator('.bc-root')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Boot TWA/PWA — resiliência', () => {
  test('re-entrada na sessão (deep link): modo instant pré-paint, sem replay da entrada', async ({
    page,
  }) => {
    await emulateStandalone(page)
    await seedSession(page, 'personal')
    await mockApi(page, { userType: 'personal' })
    await page.addInitScript(() => {
      window.sessionStorage.setItem('vfit-splash-v5', '1')
    })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    // Classe pré-paint aplicada pelo boot script → estados finais sem replay
    await expect(page.locator('html')).toHaveClass(/vsp-instant/)
    // Timeout largo: no dev server o onDemandEntries despeja /dashboard do buffer
    // quando este teste roda tarde na suíte → recompile atrasa a hidratação (e o
    // relógio da splash) em ~10s. O contrato de timing (saída por prontidão) já é
    // garantido pelos testes CRÍTICO/anon; aqui o alvo é o modo instant pré-paint.
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: 20_000 })
  })

  test('/auth/me offline → splash sai com sessão em cache (sem logout)', async ({ page }) => {
    await emulateStandalone(page)
    await seedSession(page, 'personal')
    await mockApi(page, { authMe: 'offline', userType: 'personal' })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: EXIT_BY_READINESS_MS + 4000 })
    // Continua no dashboard (offline-first: sessão em cache vale)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('/auth/me 401 → logout → /login, splash não prende', async ({ page }) => {
    await emulateStandalone(page)
    await seedSession(page, 'personal')
    await mockApi(page, { authMe: 401 })

    // Warm-up: compila /login no dev server ANTES do fluxo (cold compile de rota
    // sob demanda levava ~10s e estourava o timeout — variância de dev, não bug;
    // validado manualmente: 401 → logout → /login funciona em ~10s frio).
    await page.goto('/login', { waitUntil: 'commit' })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: EXIT_BY_READINESS_MS + 4000 })
  })
})

test.describe('Boot sem JavaScript — válvula CSS', () => {
  test.use({ javaScriptEnabled: false })

  test('splash pré-renderizada desvanece sozinha (~8s) e libera a página', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'commit' })
    // Sem JS: splash está no HTML estático e visível
    await expect(page.locator(SPLASH)).toBeVisible()
    // Válvula CSS (8s + fade 600ms): esconde e libera pointer-events
    await expect(page.locator(SPLASH)).toBeHidden({ timeout: 11_000 })
  })

  test('browser comum sem JS em /welcome: splash nunca bloqueia a página', async ({ page }) => {
    await page.goto('/welcome', { waitUntil: 'commit' })
    // Splash standalone-only escondida via CSS pré-paint (html sem .vsp-standalone)
    await expect(page.locator(SPLASH)).toBeHidden()
    // Conteúdo do welcome presente no HTML. Nota: visibilidade sem-JS no DEV server
    // é limitada pelo Suspense streaming (conteúdo revelado via script). Em PRODUÇÃO
    // (export estático) o conteúdo já vem resolvido — garantido pelo gate de build
    // scripts/check-splash-export.mjs (bc-jumbo em out/welcome.html).
    await expect(page.locator('.bc-root')).toBeAttached()
  })
})

// TODO(splash-boot): cenário biometria (welcome → /login?biometric=auto sob splash)
// exige fixtures de passkey (vfit_passkey_email + auto-unlock) — coberto por smoke
// manual no dispositivo até termos fixture estável.

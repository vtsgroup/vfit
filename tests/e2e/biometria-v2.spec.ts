// ============================================
// biometria-v2.spec.ts — App lock + enrollment (plano biometria v2, onda 2)
// ============================================
//
// Cobre a LÓGICA DE DECISÃO/APARÊNCIA (o valor de produto), sem completar o crypto
// WebAuthn — a conclusão real de registro/login por passkey continua no smoke manual
// no dispositivo (mesmo precedente do splash-boot.spec.ts, TODO no rodapé daquele arquivo).
//
// Técnica: mockamos a API e PENDURAMOS o endpoint de options do passkey (nunca resolve),
// então o lock screen permanece visível e assertável (não fail-open, não navega).
// Emula standalone/TWA via matchMedia (Playwright não emula display-mode nativamente) e
// registra um virtual authenticator via CDP para garantir que WebAuthn esteja disponível.
//
// Usa usuário PERSONAL (dashboard, sem redirect de onboarding do aluno) para isolar o gate.
// O comportamento é role-agnóstico; as rotas por papel já são cobertas por splash-boot.spec.ts.

import { expect, test, type Page } from '@playwright/test'

// Dev server compila rotas sob demanda — mode default (sem paralelo intra-arquivo) evita
// contenção de compile atrapalhar o timing de hidratação/boot.
test.describe.configure({ mode: 'default', timeout: 60_000 })

// CDP (newCDPSession) + virtual authenticator só existem no Chromium.
test.skip(({ browserName }) => browserName !== 'chromium', 'WebAuthn virtual authenticator via CDP requer Chromium')

const DAY_MS = 24 * 60 * 60 * 1000
const LOCK = '[aria-label="Desbloqueio biométrico"]'
const ENROLL = '[aria-label="Ative o desbloqueio por biometria"]'

const PERSONAL = {
  id: 'e2e-personal',
  email: 'personal@e2e.vfit',
  full_name: 'E2E Personal',
  user_type: 'personal' as const,
  role: 'user' as const,
  avatar_url: null,
  phone: null,
  created_at: '2026-01-01T00:00:00Z',
}

/** Emula display-mode: standalone (TWA/PWA) ANTES de qualquer script da página. */
async function emulateStandalone(page: Page) {
  await page.addInitScript(() => {
    const orig = window.matchMedia.bind(window)
    window.matchMedia = (query: string) =>
      query.includes('display-mode: standalone')
        ? ({
            matches: true, media: query, onchange: null,
            addListener() {}, removeListener() {},
            addEventListener() {}, removeEventListener() {},
            dispatchEvent() { return false },
          } as unknown as MediaQueryList)
        : orig(query)
  })
}

/** Semeia sessão persistida (zustand/persist vfit-auth) — usuário personal autenticado. */
async function seedSession(page: Page) {
  await page.addInitScript((u) => {
    window.localStorage.setItem(
      'vfit-auth',
      JSON.stringify({
        state: {
          user: u, personalProfile: null, studentProfile: null, nutritionistProfile: null,
          tokens: { access_token: 'e2e-token', refresh_token: 'e2e-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600 },
          isAuthenticated: true,
        },
        version: 0,
      })
    )
  }, PERSONAL)
}

interface PasskeyFixture {
  registered?: boolean
  policy?: 'always' | 'daily' | 'weekly' | 'off'
  autoUnlock?: boolean
  lastAuthAt?: number | null // timestamp ms; null = nunca
  offer?: boolean // vfit_offer_biometric (enrollment)
}

/** Semeia o localStorage de biometria conforme o cenário. */
async function seedPasskey(page: Page, fx: PasskeyFixture) {
  await page.addInitScript((args) => {
    const { userId, email, fx } = args as { userId: string; email: string; fx: PasskeyFixture }
    if (fx.registered) {
      window.localStorage.setItem(`passkey_registered_${userId}`, 'true')
      window.localStorage.setItem('passkey_email', email)
      window.localStorage.setItem('vfit_biometric_user', JSON.stringify({ name: 'E2E Personal', avatar: null, email }))
    }
    if (fx.autoUnlock) window.localStorage.setItem('vfit_biometric_auto_unlock', 'true')
    if (fx.policy) window.localStorage.setItem('vfit_biometric_lock_policy', fx.policy)
    if (fx.lastAuthAt != null) window.localStorage.setItem('vfit_biometric_last_auth_at', String(fx.lastAuthAt))
    if (fx.offer) window.localStorage.setItem('vfit_offer_biometric', '1')
  }, { userId: PERSONAL.id, email: PERSONAL.email, fx })
}

/** Mocka a API. Pendura o endpoint de options do passkey → lock permanece visível.
 *  ORDEM IMPORTA: no Playwright a rota registrada por ÚLTIMO tem prioridade. Registra
 *  as amplas primeiro e as específicas (auth/me, passkey options) por último. */
async function mockApi(page: Page, opts: { hangPasskey?: boolean } = {}) {
  await page.route('**cdn.onesignal.com**', (route) => route.abort())
  await page.route('**googletagmanager.com**', (route) => route.abort())
  await page.route('**://api.vfit.app.br/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  )
  await page.route('**/auth/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: PERSONAL }) })
  )
  // Registrado por último → vence a rota ampla acima para a URL de options.
  await page.route('**/auth/passkey/**/options', (route) => {
    if (opts.hangPasskey) return // nunca resolve → lock fica em 'prompting', assertável
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

/** Garante que WebAuthn esteja disponível (supportsPasskey) via virtual authenticator CDP. */
async function enableWebAuthn(page: Page) {
  const client = await page.context().newCDPSession(page)
  await client.send('WebAuthn.enable')
  await client.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true },
  })
}

// ============================================
// B3 — App Lock no boot
// ============================================
test.describe('App lock no boot (B3)', () => {
  test('standalone + passkey + policy daily + lastAuth vencido → lock aparece', async ({ page }) => {
    await emulateStandalone(page)
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { registered: true, autoUnlock: true, policy: 'daily', lastAuthAt: Date.now() - 2 * DAY_MS })
    await mockApi(page, { hangPasskey: true })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page.locator(LOCK)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Usar senha' })).toBeVisible()
  })

  test('standalone + passkey + lastAuth recente (dentro da janela) → SEM lock', async ({ page }) => {
    await emulateStandalone(page)
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { registered: true, autoUnlock: true, policy: 'daily', lastAuthAt: Date.now() - 1000 })
    await mockApi(page, { hangPasskey: true })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await page.waitForTimeout(2500)
    await expect(page.locator(LOCK)).toHaveCount(0)
  })

  test('standalone + passkey + policy off → SEM lock', async ({ page }) => {
    await emulateStandalone(page)
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { registered: true, autoUnlock: true, policy: 'off', lastAuthAt: Date.now() - 30 * DAY_MS })
    await mockApi(page, { hangPasskey: true })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await page.waitForTimeout(2500)
    await expect(page.locator(LOCK)).toHaveCount(0)
  })

  test('browser comum (NÃO standalone) + passkey vencido → SEM lock (app-like only)', async ({ page }) => {
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { registered: true, autoUnlock: true, policy: 'daily', lastAuthAt: Date.now() - 2 * DAY_MS })
    await mockApi(page, { hangPasskey: true })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await page.waitForTimeout(2500)
    await expect(page.locator(LOCK)).toHaveCount(0)
  })

  test('lock oferece válvula de escape "Usar senha" (nunca prende o usuário)', async ({ page }) => {
    await emulateStandalone(page)
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { registered: true, autoUnlock: true, policy: 'always', lastAuthAt: null })
    await mockApi(page, { hangPasskey: true })

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page.locator(LOCK)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Use sua biometria para continuar')).toBeVisible({ timeout: 12_000 })
    // Garantia "nunca prende o usuário": mesmo com a biometria pendente/travada, a saída
    // por senha está sempre presente e habilitada. O click→logout→/login em si é trivial
    // (logout(); router.push) e fica no smoke manual — mesmo precedente do splash-boot.spec.ts,
    // que defere cenários de interação de passkey por fragilidade de fixture (mock de /auth/me
    // sempre autenticado re-loga após o logout; em produção daria 401 e o logout gruda).
    const escape = page.getByRole('button', { name: 'Usar senha' })
    await expect(escape).toBeVisible()
    await expect(escape).toBeEnabled()
  })
})

// ============================================
// B1 — Enrollment full-screen pós-cadastro
// ============================================
test.describe('Enrollment full-screen (B1)', () => {
  test('autenticado + oferta pendente + sem passkey → passo full-screen aparece', async ({ page }) => {
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { offer: true })
    await mockApi(page)

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page.locator(ENROLL)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Ativar biometria' })).toBeVisible()
  })

  test('"Agora não" → some e consome a oferta (reload não reaparece)', async ({ page }) => {
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { offer: true })
    await mockApi(page)

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page.locator(ENROLL)).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Agora não' }).click()
    await expect(page.locator(ENROLL)).toHaveCount(0)

    // Flag consumido → reload não reabre o passo
    await page.reload({ waitUntil: 'commit' })
    await page.waitForTimeout(2500)
    await expect(page.locator(ENROLL)).toHaveCount(0)
  })

  test('sem oferta pendente → passo NÃO aparece', async ({ page }) => {
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, {}) // sem offer
    await mockApi(page)

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await page.waitForTimeout(2500)
    await expect(page.locator(ENROLL)).toHaveCount(0)
  })

  test('oferta pendente mas já tem passkey local → passo NÃO aparece', async ({ page }) => {
    await enableWebAuthn(page)
    await seedSession(page)
    await seedPasskey(page, { offer: true, registered: true })
    await mockApi(page)

    await page.goto('/dashboard', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    await page.waitForTimeout(2500)
    await expect(page.locator(ENROLL)).toHaveCount(0)
  })
})

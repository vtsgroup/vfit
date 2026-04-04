/**
 * tests/e2e/onboarding.spec.ts
 *
 * E2E — Fluxo de onboarding B2C (welcome → plan generation → plano)
 */

import { expect, test } from '@playwright/test'

test.describe('Onboarding B2C — Public pages', () => {
  test('welcome page loads', async ({ page }) => {
    await page.goto('/welcome')
    // Should show welcome content or redirect to login
    await expect(page).toHaveURL(/\/welcome|\/login/)
  })

  test('pricing page renders plans', async ({ page }) => {
    await page.goto('/pricing')
    // Should show plan cards
    await expect(page.getByText(/Pro|Grátis|Max/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Onboarding B2C — Authenticated flow', () => {
  const accessToken = process.env.E2E_ACCESS_TOKEN
  const refreshToken = process.env.E2E_REFRESH_TOKEN
  const userJson = process.env.E2E_USER_JSON

  const hasAuth = Boolean(accessToken && refreshToken && userJson)

  test.skip(!hasAuth, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON')

  test('authenticated user can access dashboard', async ({ page }) => {
    const user = JSON.parse(userJson as string)

    await page.addInitScript(
      ({ token, refresh, u }) => {
        window.localStorage.setItem(
          'vfit-auth',
          JSON.stringify({
            state: {
              user: u,
              personalProfile: null,
              studentProfile: null,
              tokens: { access_token: token, refresh_token: refresh, expires_at: Math.floor(Date.now() / 1000) + 3600 },
              isAuthenticated: true,
            },
            version: 0,
          })
        )
      },
      { token: accessToken as string, refresh: refreshToken as string, u: user }
    )

    await page.goto('/dashboard')
    // Should land on dashboard (personal or student)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('personal dashboard shows main sections', async ({ page }) => {
    const user = JSON.parse(userJson as string)

    await page.addInitScript(
      ({ token, refresh, u }) => {
        window.localStorage.setItem(
          'vfit-auth',
          JSON.stringify({
            state: {
              user: u,
              personalProfile: null,
              studentProfile: null,
              tokens: { access_token: token, refresh_token: refresh, expires_at: Math.floor(Date.now() / 1000) + 3600 },
              isAuthenticated: true,
            },
            version: 0,
          })
        )
      },
      { token: accessToken as string, refresh: refreshToken as string, u: user }
    )

    await page.goto('/dashboard')

    // Wait for data to load
    await page.waitForTimeout(3000)

    // Should show stats or welcome hero
    const hasContent = await page
      .locator('text=/Alunos|Receita|Treinos|Bom dia|Boa tarde|Boa noite/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)

    expect(hasContent).toBe(true)
  })
})

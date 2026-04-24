/**
 * tests/e2e/checkout.spec.ts
 *
 * E2E — Fluxo de pagamento (pricing, plans, pipeline)
 */

import { expect, test } from '@playwright/test'

const accessToken = process.env.E2E_ACCESS_TOKEN
const refreshToken = process.env.E2E_REFRESH_TOKEN
const userJson = process.env.E2E_USER_JSON

const hasAuth = Boolean(accessToken && refreshToken && userJson)

function injectAuth(page: import('@playwright/test').Page) {
  const user = JSON.parse(userJson as string)
  return page.addInitScript(
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
}

test.describe('Checkout — Public', () => {
  test('pricing page shows plan options', async ({ page }) => {
    await page.goto('/pricing')
    // Should show all plan names by testid
    await expect(page.getByTestId('plan-name-essencial')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-pro')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-pro-plus')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-max')).toBeVisible({ timeout: 10000 })
  })

  test('pricing page has CTA buttons', async ({ page }) => {
    await page.goto('/pricing')

    // Should have at least one action button
    const buttons = page.getByRole('button', { name: /assinar|começar|upgrade|experimentar/i })
    const count = await buttons.count()
    // At least 1 CTA should be visible (or links)
    const links = page.getByRole('link', { name: /assinar|começar|upgrade|experimentar/i })
    const linkCount = await links.count()
    expect(count + linkCount).toBeGreaterThan(0)
  })
})

test.describe('Checkout — Dashboard payments', () => {
  test.skip(!hasAuth, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON')

  test('payments page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/financeiro')
    await page.waitForTimeout(3000)

    // Should show payments/finance heading
    const hasContent = await page
      .locator('text=/Financeiro|Pagamento|Receita|Cobrança/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    expect(hasContent).toBe(true)
  })

  test('create payment page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/payments/create')
    await expect(page).toHaveURL(/\/dashboard\/payments\/create/)
  })

  test('pipeline page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/pipeline')
    await page.waitForTimeout(3000)

    // Should show pipeline heading
    await expect(
      page.getByRole('heading', { name: /Pipeline/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test('pipeline shows columns', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/pipeline')
    await page.waitForTimeout(3000)

    // Should show at least the column headers
    const hasColumns = await page
      .locator('text=/Convidados|Ativos|Em Risco|Inativos/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    expect(hasColumns).toBe(true)
  })
})

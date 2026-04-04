/**
 * tests/e2e/workout.spec.ts
 *
 * E2E — Fluxo de treinos (listagem, criação, plano ativo)
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

test.describe('Workouts — Personal view', () => {
  test.skip(!hasAuth, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON')

  test('workouts page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/workouts')
    await expect(page).toHaveURL(/\/dashboard\/workouts/)

    // Should show workouts page heading or content
    await page.waitForTimeout(3000)
    const hasContent = await page
      .locator('text=/Treino|Workout|Criar/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    expect(hasContent).toBe(true)
  })

  test('create workout page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/dashboard/workouts/create')
    await expect(page).toHaveURL(/\/dashboard\/workouts\/create/)
  })
})

test.describe('Workouts — Student plan view', () => {
  test.skip(!hasAuth, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON')

  test('plan page loads for student', async ({ page }) => {
    // Override user to student type for this test
    const user = JSON.parse(userJson as string)
    const studentUser = { ...user, user_type: 'student' }

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
      { token: accessToken as string, refresh: refreshToken as string, u: studentUser }
    )

    await page.goto('/plano')
    await page.waitForTimeout(3000)

    // Should show plan page or empty state
    const hasContent = await page
      .locator('text=/Meu Plano|plano ativo|Gerar Plano/i')
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false)
    expect(hasContent).toBe(true)
  })

  test('progress page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/progresso')
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/progresso/)
  })

  test('streaks page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/progresso/streaks')
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/progresso\/streaks/)
  })

  test('conquistas page loads', async ({ page }) => {
    await injectAuth(page)
    await page.goto('/progresso/conquistas')
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/progresso\/conquistas/)
  })
})

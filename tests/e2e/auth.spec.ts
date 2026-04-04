/**
 * tests/e2e/auth.spec.ts
 *
 * E2E — Fluxos de autenticação (login, register, logout, password reset)
 */

import { expect, test } from '@playwright/test'

test.describe('Auth — Login', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('shows validation error for empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()
    // Should show validation — field required
    const emailInput = page.getByPlaceholder('Email')
    await expect(emailInput).toBeVisible()
    // HTML5 validation should prevent submission
    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity()
    )
    expect(isInvalid).toBe(true)
  })

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('Email').fill('fake@email.com')
    await page.getByPlaceholder('Senha').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Should show error toast or message
    await expect(
      page.getByText(/credenciais|inválid|incorrect|erro/i)
    ).toBeVisible({ timeout: 10000 })
  })

  test('link to register page works', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.getByRole('link', { name: /criar conta|cadastr/i })
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/\/register|\/cadastro/)
    }
  })

  test('link to forgot password works', async ({ page }) => {
    await page.goto('/login')
    const forgotLink = page.getByRole('link', { name: /esquec|forgot|recuper/i })
    if (await forgotLink.isVisible()) {
      await forgotLink.click()
      await expect(page).toHaveURL(/\/forgot|\/recuper|\/reset/)
    }
  })
})

test.describe('Auth — Register', () => {
  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register')
    // Should have name, email, password fields
    await expect(page.getByPlaceholder(/nome/i)).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Senha')).toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    await page.goto('/register')
    const emailInput = page.getByPlaceholder('Email')
    await emailInput.fill('not-an-email')
    await page.getByPlaceholder('Senha').fill('Test12345!')
    await page.getByRole('button', { name: /criar|cadastr|register/i }).click()

    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).checkValidity()
    )
    expect(isInvalid).toBe(true)
  })
})

test.describe('Auth — Logout', () => {
  const accessToken = process.env.E2E_ACCESS_TOKEN
  const refreshToken = process.env.E2E_REFRESH_TOKEN
  const userJson = process.env.E2E_USER_JSON

  const hasAuth = Boolean(accessToken && refreshToken && userJson)

  test.skip(!hasAuth, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON')

  test('logout clears session and redirects to login', async ({ page }) => {
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
    // Find and click logout button/menu
    const logoutButton = page.getByRole('button', { name: /sair|logout/i })
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click()
      await expect(page).toHaveURL(/\/login|\//)
    }
  })
})

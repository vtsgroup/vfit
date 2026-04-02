import { expect, test } from '@playwright/test'

type E2EUser = {
  id: string
  email: string
  full_name: string
  user_type: 'personal' | 'student' | 'admin'
  role: 'user' | 'admin' | 'super_admin'
  avatar_url: string | null
  phone: string | null
  created_at: string
}

const accessToken = process.env.E2E_ACCESS_TOKEN
const refreshToken = process.env.E2E_REFRESH_TOKEN
const userJson = process.env.E2E_USER_JSON

const hasAuthFixture = Boolean(accessToken && refreshToken && userJson)

test.describe('S92 • Fluxo autenticado dashboard', () => {
  test.skip(!hasAuthFixture, 'Defina E2E_ACCESS_TOKEN, E2E_REFRESH_TOKEN e E2E_USER_JSON para habilitar este teste.')

  test('abre /dashboard/students com sessão pré-carregada', async ({ page }) => {
    const user = JSON.parse(userJson as string) as E2EUser

    await page.addInitScript(
      ({ token, refresh, u }) => {
        const storageValue = {
          state: {
            user: u,
            personalProfile: null,
            studentProfile: null,
            tokens: {
              access_token: token,
              refresh_token: refresh,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            },
            isAuthenticated: true,
          },
          version: 0,
        }

        window.localStorage.setItem('vfit-auth', JSON.stringify(storageValue))
      },
      {
        token: accessToken as string,
        refresh: refreshToken as string,
        u: user,
      }
    )

    await page.goto('/dashboard/students')
    await expect(page).toHaveURL(/\/dashboard\/students/)
    await expect(page.getByRole('heading', { name: 'Alunos' })).toBeVisible()
  })
})

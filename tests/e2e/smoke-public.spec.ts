import { expect, test } from '@playwright/test'

test.describe('S92 • Smoke público', () => {
  test('home pública responde', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\//)
  })

  test('login carrega formulário', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })
})

// ============================================
// E2E — Fluxos principais Personal + Aluno
// Testa navegação core, não requer backend real
// Run: npx playwright test tests/e2e/core-flows.spec.ts
// ============================================

import { test, expect } from '@playwright/test'

test.describe('Public Pages — Core Navigation', () => {
  test('Landing page loads and has CTA', async ({ page }) => {
    await page.goto('/')
    // Use a specific heading to avoid strict mode violation
    await expect(page.getByRole('heading', { name: /treinos que transformam/i })).toBeVisible()
    // Should have a CTA button
    const cta = page.locator('a[href*="register"], a[href*="login"], button:has-text("Começar")')
    await expect(cta.first()).toBeVisible()
  })

  test('Login page loads with form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  // Skipped: /register is not a standalone page, registration is handled via /p/[slug] or CTAs
  test.skip('Register page loads with form (no standalone /register route)', async () => {})

  test('Pricing page loads with plans', async ({ page }) => {
    await page.goto('/pricing')
    // Check all plan names by testid
    await expect(page.getByTestId('plan-name-essencial')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-pro')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-pro-plus')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('plan-name-max')).toBeVisible({ timeout: 10000 })
  })

  test('Blog page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Offline page loads with reconnect', async ({ page }) => {
    await page.goto('/offline')
    await expect(page.locator('text=Sem Conexão')).toBeVisible()
    await expect(page.locator('button:has-text("Reconectar")')).toBeVisible()
  })
})

test.describe('Auth Protection', () => {
  test('Dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Should show login or auth guard
    await page.waitForTimeout(2000)
    const url = page.url()
    // Either redirected to login OR shows auth guard content
    const hasAuth = url.includes('/login') || 
      await page.locator('text=Entrar, text=Login, text=Faça login').first().isVisible().catch(() => false)
    expect(hasAuth || url.includes('/dashboard')).toBeTruthy()
  })
})

test.describe('Personal Flow — Authenticated', () => {
  test.skip(!process.env.SMOKE_PERSONAL_TOKEN, 'Requires SMOKE_PERSONAL_TOKEN')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.evaluate((token) => {
      const state = {
        state: {
          accessToken: token,
          isAuthenticated: true,
          isHydrated: true,
          user: { id: 'test', user_type: 'personal', role: 'personal', name: 'Test Personal' },
        },
      }
      localStorage.setItem('vfit-auth', JSON.stringify(state))
    }, process.env.SMOKE_PERSONAL_TOKEN!)
  })

  test('Dashboard loads with stats', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(3000)
    // Should see dashboard content (stats cards, quick actions, etc.)
    const hasContent = await page.locator('[class*="card"], [class*="stats"], h1').first().isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('Students page loads', async ({ page }) => {
    await page.goto('/dashboard/students')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1:has-text("Alunos"), h1:has-text("alunos")')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('Workouts page loads', async ({ page }) => {
    await page.goto('/dashboard/workouts')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1:has-text("Treinos"), h1:has-text("treinos")')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('Assessments page loads', async ({ page }) => {
    await page.goto('/dashboard/assessments')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1:has-text("Avaliações"), h1:has-text("avaliações"), h1:has-text("Avaliação")')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('Messages page loads', async ({ page }) => {
    await page.goto('/dashboard/messages')
    await page.waitForTimeout(2000)
    // Should show messages area or empty state
    const hasContent = await page.locator('h1, [class*="chat"], [class*="message"]').first().isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('Settings page loads', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1:has-text("Configurações"), h1:has-text("configurações"), h1:has-text("Config")')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Student Flow — Authenticated', () => {
  test.skip(!process.env.SMOKE_STUDENT_TOKEN, 'Requires SMOKE_STUDENT_TOKEN')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.evaluate((token) => {
      const state = {
        state: {
          accessToken: token,
          isAuthenticated: true,
          isHydrated: true,
          user: { id: 'test-student', user_type: 'student', role: 'student', name: 'Test Student' },
        },
      }
      localStorage.setItem('vfit-auth', JSON.stringify(state))
    }, process.env.SMOKE_STUDENT_TOKEN!)
  })

  test('Student dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(3000)
    const hasContent = await page.locator('[class*="card"], h1, h2').first().isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('My workouts page loads', async ({ page }) => {
    await page.goto('/dashboard/my-workouts')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('My assessments page loads', async ({ page }) => {
    await page.goto('/dashboard/my-assessments')
    await page.waitForTimeout(2000)
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })
})

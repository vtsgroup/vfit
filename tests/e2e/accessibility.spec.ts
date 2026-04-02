// ============================================
// Accessibility Audit — axe-core via Playwright
// Tests critical pages for WCAG 2.1 AA violations
// Run: npx playwright test tests/e2e/accessibility.spec.ts
// ============================================

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const CRITICAL_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Blog', path: '/blog' },
  { name: 'Offline', path: '/offline' },
]

test.describe('Accessibility Audit — WCAG 2.1 AA', () => {
  for (const page of CRITICAL_PAGES) {
    test(`${page.name} (${page.path}) should have no critical a11y violations`, async ({ page: pw }) => {
      await pw.goto(page.path, { waitUntil: 'domcontentloaded' })
      // Wait for initial render
      await pw.waitForTimeout(1000)

      const results = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Ignore known non-critical issues
        .disableRules(['color-contrast']) // Often false positives on dark themes
        .analyze()

      // Allow minor violations but fail on serious/critical
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )

      if (criticalViolations.length > 0) {
        const report = criticalViolations.map((v) => (
          `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
          `  Help: ${v.helpUrl}\n` +
          `  Nodes: ${v.nodes.length}\n` +
          v.nodes.slice(0, 3).map((n) => `    - ${n.html.slice(0, 100)}`).join('\n')
        )).join('\n\n')

        console.log(`\n🔴 Accessibility violations on ${page.name}:\n${report}\n`)
      }

      expect(
        criticalViolations,
        `${page.name} has ${criticalViolations.length} critical/serious a11y violations`
      ).toHaveLength(0)
    })
  }
})

test.describe('Accessibility — Dashboard (authenticated)', () => {
  test.skip(!process.env.SMOKE_PERSONAL_TOKEN, 'Requires SMOKE_PERSONAL_TOKEN')

  test('Dashboard should have no critical a11y violations', async ({ page: pw }) => {
    // Set auth token
    await pw.goto('/login', { waitUntil: 'domcontentloaded' })
    await pw.evaluate((token) => {
      const state = {
        state: {
          accessToken: token,
          isAuthenticated: true,
          isHydrated: true,
          user: { user_type: 'personal' },
        },
      }
      localStorage.setItem('vfit-auth', JSON.stringify(state))
    }, process.env.SMOKE_PERSONAL_TOKEN!)

    await pw.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await pw.waitForTimeout(2000)

    const results = await new AxeBuilder({ page: pw })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(critical).toHaveLength(0)
  })
})

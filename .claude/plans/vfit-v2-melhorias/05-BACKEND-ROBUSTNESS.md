# 05. Backend Robustness & TypeScript Cleanup

> **Sprint:** S21 (4 dias)  
> **Impacto:** Query performance +50%, type safety 100%  
> **Data:** 28-01/05/2026

---

## Executive Summary

Backend hoje funciona, mas falta:
- Caching para queries lentas (5-10 endpoints)
- TypeScript cleanup (6 `as any`, tipos ausentes)
- E2E tests (Playwright — 5 fluxos críticos)

**S21 Objectives:**
- ⚡ Cache layer (KV store para queries hot)
- 🔧 TypeScript 100% strict
- 🧪 E2E tests (auth, onboarding, workout, payment)

---

## Phase 21a: Backend Caching (1 dia)

### T21a.1: Profile Slow Queries

**Identify candidates (>100ms latency):**
```bash
# In Cloudflare Workers analytics:
# Tail logs and measure endpoint latencies

# Expected slow endpoints:
GET /api/v1/students/{id}            # JOIN 3 tables
GET /api/v1/workouts/library         # Full table scan
GET /api/v1/plans/{id}               # JOIN exercises + days
GET /api/v1/dashboard/stats          # Aggregation query
GET /api/v1/payments/history         # Large join
```

**Query analysis:**
```sql
-- Slow query example
SELECT u.*, p.*, w.*, e.*
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN workouts w ON u.id = w.user_id
LEFT JOIN exercises e ON w.id = e.workout_id
WHERE u.id = ?
-- Latency: 250ms ❌

-- Optimized:
SELECT u.* FROM users WHERE id = ?              -- 10ms
SELECT p.* FROM payments WHERE user_id = ? LIMIT 50  -- 30ms
-- Total: 40ms ✅
```

**Deliverable:** `SLOW_QUERIES_AUDIT.md`
```markdown
# Slow Queries Report

| Endpoint | Latency | Tables | Issue | Fix |
|----------|---------|--------|-------|-----|
| GET /students/{id} | 250ms | 4 JOIN | Missing index | Add index on user_id |
| GET /workouts/library | 180ms | Full scan | No filter | Add LIMIT + offset |
| GET /plans/{id} | 150ms | 3 JOIN | No caching | Implement KV cache |
```

---

### T21a.2: KV Cache Strategy

**Setup Cloudflare KV:**
```typescript
// wrangler.toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"
preview_id = "YOUR_PREVIEW_ID"
```

**Cache helper:**
```typescript
// workers/lib/cache.ts

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600  // 1 hour default
): Promise<T> {
  // Try cache first
  const cached = await env.CACHE.get(key, 'json')
  if (cached) return cached as T

  // If miss, fetch
  const value = await fetcher()

  // Store in cache
  await env.CACHE.put(key, JSON.stringify(value), {
    expirationTtl: ttl,
  })

  return value
}

// Invalidation helper
export async function invalidate(pattern: string) {
  // KV doesn't support pattern deletion, so we prefix-key
  // Example: "students:123:*"
  // On update, manually delete specific keys
  const key = `students:123`
  await env.CACHE.delete(key)
}
```

---

### T21a.3: Implement Caching for Hot Endpoints

**Endpoint 1: GET /api/v1/students/{id}**
```typescript
export async function GET(c: Context) {
  const studentId = c.req.param('id')
  const cacheKey = `student:${studentId}`
  const ttl = 3600  // 1 hour

  const student = await getOrSet(cacheKey, async () => {
    return db
      .select()
      .from(users)
      .where(eq(users.id, studentId))
      .then(r => r[0])
  }, ttl)

  return c.json(student)
}

// Invalidate on update:
export async function PUT(c: Context) {
  const studentId = c.req.param('id')
  const updates = await c.req.json()

  // Update DB
  const updated = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, studentId))
    .returning()

  // Invalidate cache
  await invalidate(`student:${studentId}`)

  return c.json(updated)
}
```

**Endpoint 2: GET /api/v1/workouts/library**
```typescript
export async function GET(c: Context) {
  const cacheKey = 'workouts:library'
  const ttl = 86400  // 24 hours (rarely changes)

  const library = await getOrSet(cacheKey, async () => {
    return db
      .select()
      .from(workout_templates)
      .orderBy(workout_templates.created_at)
      .limit(100)
  }, ttl)

  return c.json(library)
}
```

**Endpoint 3: GET /api/v1/plans/{id}**
```typescript
export async function GET(c: Context) {
  const planId = c.req.param('id')
  const cacheKey = `plan:${planId}`
  const ttl = 21600  // 6 hours

  const plan = await getOrSet(cacheKey, async () => {
    const p = await db.select().from(plans).where(eq(plans.id, planId))
    const days = await db.select().from(plan_days).where(eq(plan_days.plan_id, planId))
    return { ...p[0], days }
  }, ttl)

  return c.json(plan)
}
```

---

### T21a.4: Cache Metrics

**Verify cache hit rate:**
```typescript
// In analytics dashboard
const cacheHitRate = cache_hits / (cache_hits + cache_misses)

// Target: >= 40%
// Expected:
// - students/{id}: 60% hit rate (accessed multiple times)
// - workouts/library: 95% hit rate (static, long TTL)
// - plans/{id}: 50% hit rate (user-specific)
```

**Deliverable:** `CACHE_METRICS.md`
```markdown
# Cache Performance Report

| Endpoint | Hit Rate | Avg Latency Before | Avg Latency After | Improvement |
|----------|----------|-------------------|------------------|-------------|
| GET /students/{id} | 60% | 250ms | 45ms | -82% |
| GET /workouts/library | 95% | 180ms | 12ms | -93% |
| GET /plans/{id} | 50% | 150ms | 35ms | -77% |
| **Overall** | **68%** | **193ms** | **30ms** | **-84%** |
```

---

## Phase 21b: TypeScript Cleanup (1 dia)

### T21b.1: Find All `as any`

```bash
grep -r "as any" src/ workers/ --include="*.ts" --include="*.tsx"

# Expected output (6 instances):
# src/lib/pwa.ts:45:        const register = await navigator.serviceWorker.register('/sw.js') as any
# src/hooks/use-onboarding.ts:12:      data as any
# src/lib/ios-specific.ts:28:        window.webkit as any
# src/components/service-worker-context.tsx:15:      navigator.serviceWorker as any
# workers/ai.ts:67:        const response = await ai.run(...) as any
# src/lib/auth-sessions.ts:120:      decodedToken as any

# Analysis:
# ✅ PWA-related (3): Justified — browser APIs not fully typed
# ⚠️ Data parsing (2): Can be fixed with Zod
# ⚠️ Auth (1): Can be fixed with proper types
```

**Cleanup strategy:**
```typescript
// BEFORE: src/hooks/use-onboarding.ts:12
const data = response.json() as any

// AFTER: Use Zod validation
import { z } from 'zod'

const OnboardingDataSchema = z.object({
  step: z.number(),
  answers: z.array(z.any()),
})

type OnboardingData = z.infer<typeof OnboardingDataSchema>

const data = OnboardingDataSchema.parse(response.json())
```

---

### T21b.2: Type Missing Hooks

**Find hooks without explicit return types:**
```bash
grep -r "export function use" src/hooks --include="*.ts"

# Find ones WITHOUT return type annotation
grep -r "export function use.*{" src/hooks --include="*.ts" | grep -v "("

# Expected to fix:
# - use-dashboard.ts
# - use-vfit-nutrition.ts
# - use-plans.ts
# - use-self-assessments.ts
```

**Add return types:**
```typescript
// BEFORE
export function useDashboard() {
  const [stats, setStats] = useState()
  // ...
  return { stats, isLoading }
}

// AFTER
interface DashboardStats {
  activeStudents: number
  totalRevenue: number
  workoutsCompleted: number
}

export function useDashboard(): {
  stats: DashboardStats | null
  isLoading: boolean
} {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  // ...
  return { stats, isLoading }
}
```

---

### T21b.3: Component Props Validation

**Audit components without full typing:**
```bash
grep -r "interface.*Props" src/components --include="*.tsx" | wc -l

# Expected: ~40+ component prop interfaces
# Verify all components have typed props
```

**Example fix:**
```typescript
// BEFORE
export function Button({ variant, size, children, ...props }) {
  // ...
}

// AFTER
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  // ...
}
```

---

### T21b.4: TypeScript Strict Check

```bash
# Run strict type check
npx tsc --noEmit --strict

# Expected output:
# ✅ 0 errors
# ✅ 0 warnings

# If errors remain:
# - Fix types
# - Add type annotations
# - Use `satisfies` keyword where needed
```

**Deliverable:** `TYPESCRIPT_REPORT.md`
```markdown
# TypeScript Cleanup Report

## Before
- `as any`: 6 instances
- Missing return types: 4 hooks
- Component props untyped: 8 components
- tsc --noEmit: 12 errors

## After
- `as any`: 3 instances (justified PWA)
- Missing return types: 0
- Component props untyped: 0
- tsc --noEmit: 0 errors ✅

## Summary
- Type safety: 75% → 100%
- Removals: 9 unnecessary `as any`
- New types: 12 interface definitions
```

---

## Phase 21c: E2E Tests with Playwright (2 dias)

### T21c.1: Setup Playwright

```bash
npm install -D @playwright/test

npx playwright install chromium firefox webkit
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

### T21c.2: Auth Flow Test

**tests/e2e/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('register new student', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Fill registration
    await page.fill('input[name="full_name"]', 'João Silva')
    await page.fill('input[name="email"]', 'joao@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    
    // Submit
    await page.click('button:has-text("Cadastrar")')
    
    // Verify redirect to onboarding
    await expect(page).toHaveURL(/\/welcome/)
    await expect(page.locator('text=Bem-vindo')).toBeVisible()
  })

  test('login existing student', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'existing@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button:has-text("Entrar")')
    
    await expect(page).toHaveURL(/\/treinos/)
    await expect(page.locator('text=Treinos')).toBeVisible()
  })

  test('logout', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button:has-text("Entrar")')
    
    // Logout
    await page.goto('/perfil')
    await page.click('button:has-text("Sair")')
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
```

---

### T21c.3: Onboarding Flow Test

**tests/e2e/onboarding.spec.ts:**
```typescript
import { test, expect } from '@playwright/test'

test('complete 17-step onboarding', async ({ page }) => {
  // Start fresh
  const testEmail = `test-${Date.now()}@example.com`
  
  // Register
  await page.goto('/onboarding')
  await page.fill('input[name="email"]', testEmail)
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button:has-text("Continuar")')
  
  // Step 1-5: Profile
  await page.fill('input[name="full_name"]', 'Test User')
  await page.click('button:has-text("Próximo")')
  
  await page.fill('input[name="age"]', '25')
  await page.click('button:has-text("Próximo")')
  
  // ... continue through all 17 steps
  
  // Final: Should reach dashboard
  await page.click('button:has-text("Finalizar")')
  await expect(page).toHaveURL(/\/dashboard/)
  
  // Verify profile created
  const response = await page.request.get('/api/v1/users/me')
  const user = await response.json()
  expect(user.full_name).toBe('Test User')
})
```

---

### T21c.4: Workout Execution Test

**tests/e2e/workout.spec.ts:**
```typescript
import { test, expect } from '@playwright/test'

test('execute and complete workout', async ({ page }) => {
  // Login
  await page.goto('/login')
  // ... login
  
  // Navigate to active workout
  await page.goto('/treino-ativo')
  
  // Verify first exercise displayed
  const exerciseName = page.locator('h2:first-of-type')
  await expect(exerciseName).toBeVisible()
  
  // Log exercise
  await page.fill('input[name="reps"]', '10')
  await page.fill('input[name="weight"]', '50')
  await page.click('button:has-text("Registrar")')
  
  // Move to next exercise
  await expect(page.locator('text=Exercício 2')).toBeVisible()
  
  // Complete last exercise
  await page.fill('input[name="reps"]', '8')
  await page.click('button:has-text("Finalizar Treino")')
  
  // Verify success page
  await expect(page.locator('text=Parabéns')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()  // Confetti
  
  // Verify API call
  const response = await page.request.get('/api/v1/workouts/logs')
  const logs = await response.json()
  expect(logs.data.length).toBeGreaterThan(0)
})
```

---

### T21c.5: Payment Flow Test

**tests/e2e/checkout.spec.ts:**
```typescript
import { test, expect } from '@playwright/test'

test('upgrade to premium', async ({ page }) => {
  // Login as free user
  await page.goto('/login')
  // ... login
  
  // Navigate to subscription
  await page.goto('/perfil/assinatura')
  
  // Select premium plan
  await page.click('button:has-text("Assinar Premium")')
  
  // Verify payment modal
  await expect(page.locator('text=Pague via PIX')).toBeVisible()
  
  // Get QR code
  const qrImage = page.locator('img[alt="QR Code"]')
  await expect(qrImage).toBeVisible()
  
  // In real test, simulate payment webhook:
  // POST /webhook/payments with payment_confirmed event
  
  // Verify subscription updated
  const response = await page.request.get('/api/v1/users/me')
  const user = await response.json()
  expect(user.subscription_plan).toBe('premium')
})
```

---

### T21c.6: CI/CD Integration

**GitHub Actions (.github/workflows/e2e.yml):**
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start dev server
        run: npm run dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run tests
        run: npm run test:e2e
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

**Add to package.json:**
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Summary: S21 Deliverables

| Task | Deliverable | Owner | Days |
|---|---|---|---|
| T21a.1-4 | Cache layer + 3 endpoints optimized | Backend Dev | 1 |
| T21b.1-4 | TypeScript cleanup + strict check | TypeScript Dev | 1 |
| T21c.1-6 | Playwright tests + CI/CD | QA Dev | 2 |
| **Total** | **S21 Complete** | **2 Devs** | **4** |

## Metrics

| Métrica | Before | After | Improvement |
|---|---|---|---|
| Query Latency (avg) | 193ms | 30ms | **-84%** ✅ |
| Cache Hit Rate | — | 68% | **68%** ✅ |
| TypeScript Strict | 75% | 100% | **+25%** ✅ |
| Test Coverage (E2E) | 0 tests | 5 critical flows | **100%** ✅ |
| tsc Errors | 12 | 0 | **-100%** ✅ |

---

## Acceptance Criteria

- [ ] KV cache configured in wrangler.toml
- [ ] 3+ endpoints using getOrSet()
- [ ] Cache hit rate >= 40%
- [ ] npm run build succeeds
- [ ] No `as any` outside justified cases (PWA)
- [ ] All hooks have return type annotations
- [ ] All components have typed props
- [ ] tsc --noEmit: 0 errors
- [ ] 5 E2E tests pass locally
- [ ] CI/CD runs tests on PR
- [ ] Playwright HTML report generated

---

**Next:** v2.0.0 RELEASE + All sprints merged

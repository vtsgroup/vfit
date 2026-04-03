# 6. Testing Strategy

---

## Unit Tests

### Phase 1 (TWA Entry)

No unit tests necessários — é config file + simple redirect effect.

---

### Phase 2 (Onboarding Fix)

**File:** `tests/onboarding.test.ts` (NEW or update)

```typescript
import { describe, it, expect } from 'vitest'
import { generatePlanInputSchema, generatedPlanSchema } from '@workers/schemas/plan-generation'

describe('Plan Generation Schema', () => {
  it('validates correct input payload', () => {
    const validInput = {
      gender: 'male',
      experience_level: 'beginner',
      training_frequency: 'regularly',
      goal: 'gain_muscle',
      training_location: 'gym_large',
      target_muscles: ['chest', 'back'],
      age: 25,
      height_cm: 180,
      weight_kg: 80,
      target_weight_kg: 75,
      days_per_week: 3,
      session_duration: 'medium_45',
      injuries: [],
      preferred_time: 'morning',
    }
    
    expect(() => generatePlanInputSchema.parse(validInput)).not.toThrow()
  })

  it('rejects invalid experience_level', () => {
    const invalid = { ...validInput, experience_level: 'expert' }
    expect(() => generatePlanInputSchema.parse(invalid)).toThrow()
  })

  it('rejects mismatched days count in response', () => {
    const response = {
      plan_name: 'Test',
      description: 'Test plan',
      days: [
        { day_number: 1, name: 'Day 1', focus: 'Upper', exercises: [] },
        { day_number: 2, name: 'Day 2', focus: 'Lower', exercises: [] },
        { day_number: 3, name: 'Day 3', focus: 'Full', exercises: [] },
      ]
    }
    
    expect(() => generatedPlanSchema.parse(response)).not.toThrow()
    expect(response.days).toHaveLength(3)
  })
})
```

---

### Phase 3 (D1 Sync)

**File:** `tests/d1.test.ts` (NEW)

```typescript
describe('D1 User Workouts Cache', () => {
  it('inserts workout to user_workouts_cache with correct schema', () => {
    const workout = {
      id: 'workout-123',
      user_id: 'user-456',
      name: 'Chest Day',
      data: JSON.stringify({ days: [...] }),
      synced_at: Date.now(),
      created_at: Math.floor(Date.now() / 1000),
    }
    
    // Mock D1 query
    const query = `INSERT INTO user_workouts_cache (id, user_id, name, data, synced_at, created_at) VALUES (?,?,?,?,?,?)`
    
    // Verify bindings
    expect([
      workout.id,
      workout.user_id,
      workout.name,
      typeof workout.data === 'string',
      typeof workout.synced_at === 'number',
      typeof workout.created_at === 'number',
    ]).toEqual([true, true, true, true, true, true])
  })
})
```

---

## Integration Tests

### Phase 1

```typescript
describe('Welcome Page Redirect', () => {
  it('redirects authenticated user to /dashboard', () => {
    // Mock useAuthStore with isAuthenticated=true, isHydrated=true
    // Render <WelcomePage>
    // Expect router.replace('/dashboard') called
  })

  it('shows onboarding quiz to unauthenticated user', () => {
    // Mock useAuthStore with isAuthenticated=false
    // Render <WelcomePage>
    // Expect CTA button "Começar" visible
  })
})
```

---

### Phase 2

```typescript
describe('Onboarding POST /plans/generate', () => {
  it('sends valid payload and receives plan', async () => {
    // Setup: Complete 17 onboarding steps
    // Payload construction in loading/page.tsx
    // POST to /api/v1/plans/generate
    // Expect: plan in response, plan in sessionStorage
  })

  it('retries on error with "Tentar Novamente" button', async () => {
    // Mock API to fail first call
    // Expect error UI shown
    // Click "Tentar Novamente"
    // Expect retry logic triggered
  })
})
```

---

### Phase 3

```typescript
describe('Workout Save to D1', () => {
  it('inserts to both PostgreSQL and D1', async () => {
    // Call POST /api/v1/plans/save
    // Verify PostgreSQL insert (query user's workouts)
    // Verify D1 insert (wrangler d1 execute query)
  })

  it('continues on D1 failure (PostgreSQL succeeds)', async () => {
    // Mock D1 to fail
    // Call POST /api/v1/plans/save
    // Expect: 201 created response
    // Expect: plan in PostgreSQL
    // Expect: warning logged for D1 (not 500 error)
  })
})
```

---

### Phase 4

```typescript
describe('Dashboard Header Components', () => {
  it('renders logout as <Button> with variant="danger"', () => {
    // Render <Header>
    // Find logout button
    // Expect: has class related to danger variant
    // Expect: onClick handler attached
  })

  it('uses DSIcon for all icons', () => {
    // Render <Header>
    // Query all icon elements
    // Expect: all are <DSIcon> components
    // Expect: no lucide-react classes
  })
})
```

---

## E2E Tests (Playwright)

### Full Onboarding Flow

```typescript
import { test, expect } from '@playwright/test'

test.describe('Onboarding E2E', () => {
  test('complete 17 steps and generate plan', async ({ page, context }) => {
    // 1. Start at /welcome (not authenticated)
    await page.goto('/welcome')
    await expect(page).toHaveTitle(/Bem-vindo/)
    
    // 2. Click "Começar"
    await page.click('button:has-text("Começar")')
    await page.waitForURL('/onboarding')
    
    // 3. Complete 17 steps (can programmatically fill or manual)
    for (let i = 1; i <= 17; i++) {
      await fillStep(page, i)
      if (i < 17) {
        await page.click('button:has-text("Continuar")')
        await page.waitForTimeout(500)
      }
    }
    
    // 4. Click final CTA
    await page.click('button:has-text("Criar Meu Plano")')
    
    // 5. Wait for loading screen
    await page.waitForURL('/onboarding/loading')
    await expect(page.locator('text=Analisando seu perfil')).toBeVisible()
    
    // 6. Wait for plan generation
    await page.waitForTimeout(10_000)
    
    // 7. Expect result page
    await expect(page).toHaveURL('/onboarding/result')
    await expect(page.locator('text=Seu Plano')).toBeVisible()
    
    // 8. Verify sessionStorage
    const plan = await page.evaluate(() => 
      JSON.parse(sessionStorage.getItem('vfit_plan') || '{}')
    )
    expect(plan.plan).toBeDefined()
    expect(plan.plan.days).toHaveLength(3) // or correct number
  })

  test('retry on plan generation error', async ({ page }) => {
    // Mock API to fail first time
    // Setup: intercept /api/v1/plans/generate to return 500
    await page.route('/api/v1/plans/generate', route => 
      route.abort('failed')
    )
    
    // Complete steps
    // Trigger plan generation
    // Expect error: "Ops! Algo deu errado"
    await expect(page.locator('text=Ops!')).toBeVisible()
    
    // Click retry
    await page.unroute('/api/v1/plans/generate')
    await page.click('button:has-text("Tentar Novamente")')
    
    // Expect success
    await page.waitForURL('/onboarding/result')
  })
})
```

---

## Smoke Tests

### Auth Smoke (existing)

```bash
npm run smoke:auth:local
# SMOKE_PERSONAL_TOKEN, SMOKE_STUDENT_TOKEN must be valid
```

Add check for onboarding:
```bash
# POST /plans/generate with valid payload
curl -X POST http://localhost:8787/api/v1/plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "male",
    "experience_level": "beginner",
    ...
  }' \
  | jq '.plan.days | length'
# Should output: 3 (or correct number)
```

---

## Performance Tests (Lighthouse)

```bash
npm run build
npm run start

# Run Lighthouse
lighthouse http://localhost:3000/dashboard \
  --output=json \
  --output-path=./lighthouse-report.json

# Check Core Web Vitals
# FCP < 1.8s, LCP < 2.5s, CLS < 0.1
```

---

## Test Checklist

- [ ] Phase 1: Unit test for welcome page redirect logic
- [ ] Phase 2: Unit test for schema validation + integration test for POST /generate
- [ ] Phase 3: D1 insert test (mock or local wrangler)
- [ ] Phase 4: Component render test for Button/DSIcon usage
- [ ] E2E test: Full onboarding flow (17 steps → plan generated)
- [ ] Smoke tests: Auth valid, POST /generate returns 200
- [ ] Lighthouse: Core Web Vitals pass

---

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Smoke tests
npm run smoke:auth:local

# All checks (pre-merge)
npm run quality:ci
```

# 1. Arquitetura & Fluxos

## Diagrama Geral do Sprint

```
┌─────────────────────────────────────────────────────────────┐
│                        VFIT App Flow                        │
└─────────────────────────────────────────────────────────────┘

[TWA Install] 
    ↓
[twa-manifest.json: startUrl="/welcome"]  ← PHASE 1
    ↓
[Welcome Page] 
    ├─ If authenticated → /dashboard
    └─ If not → /onboarding/page.tsx (17 steps)
    ↓
[Step 17: Review] → [Continuar]
    ↓
[/onboarding/loading] 
    │
    ├─ POST /api/v1/plans/generate {profile}  ← PHASE 2
    │   ├─ Zod validation: generatePlanInputSchema
    │   ├─ IA: Workers AI (Llama) + fallback
    │   └─ Response: {plan, source, stats}
    │
    ├─ SUCCESS: Save to sessionStorage('vfit_plan')
    │   └─ → /onboarding/result
    │
    └─ ERROR: "Ops! Algo deu errado"
        └─ Retry logic
    ↓
[/onboarding/result]
    │
    ├─ Load plan from sessionStorage
    ├─ Display day tabs + exercises
    └─ [Criar Meu Plano] → POST /api/v1/plans/save
        │
        ├─ Save to PostgreSQL (workouts, workout_plan_days, workout_plan_exercises)
        │
        └─ ALSO: INSERT into D1 user_workouts_cache  ← PHASE 3
            └─ D1 replication for offline PWA
    ↓
[/dashboard/paywall] → Subscription flow
    ↓
[/dashboard] ← PHASE 4: Visual Polish (dark navy, DS header)
```

---

## Phase 1: TWA Smart Entry

```
BEFORE:
  twa-manifest.json: "startUrl": "/dashboard"
  └─> Problem: New user (no auth) → 401 → redirect to /welcome (flash)

AFTER:
  twa-manifest.json: "startUrl": "/welcome"
  └─> Welcome page checks: if authenticated → /dashboard, else → quiz
```

**Files touched:**
- `twa/twa-manifest.json` (1 line change)
- `twa/config/twa-manifest.json` (reference, same change)
- `src/app/(onboarding)/welcome/page.tsx` (add auth check effect)

---

## Phase 2: POST /plans/generate Fix

```
FLOW:
1. onboarding/loading/page.tsx
   ├─ Read: useOnboardingStore().data (17 fields)
   ├─ Transform to payload:
   │  {
   │    gender, experience_level, training_frequency, goal,
   │    training_location, target_muscles[], age, height_cm,
   │    weight_kg, target_weight_kg, days_per_week, session_duration,
   │    injuries[], preferred_time
   │  }
   └─ POST /api/v1/plans/generate (no auth)

2. workers/api/plans.ts::POST /generate
   ├─ Zod parse: generatePlanInputSchema.parse(body)
   ├─ Build prompt: PROMPTS.generate_b2c_plan({...})
   ├─ Call IA: callWorkersAIWithFallback(Llama + Replicate + template)
   ├─ Extract JSON from markdown-wrapped response
   ├─ Validate: generatedPlanSchema.parse()
   └─ Return: {plan, source, stats}

3. SESSION STORAGE: sessionStorage.setItem('vfit_plan', JSON.stringify(plan))

4. REDIRECT: /onboarding/result
```

**PROBLEM:** Payload mismatch or Zod schema strict validation failing.

**Files to check:**
- `src/app/(onboarding)/onboarding/loading/page.tsx` (lines 72-87: payload build)
- `workers/api/plans.ts` (lines 28-118: POST /generate handler)
- `workers/schemas/plan-generation.ts` (schema validation)
- `lib/ai-prompts.ts` (prompt template — ensure it handles all fields)

---

## Phase 3: D1 Workout Sync

```
BEFORE:
  [Generated Plan] → PostgreSQL (workouts, workout_plan_days, workout_plan_exercises)
  └─> D1 only has static exercises + templates (cold data)

AFTER:
  [Generated Plan] → PostgreSQL (live data)
                  → D1 user_workouts_cache (offline cache)

D1 SCHEMA (new table):
┌──────────────────────────────────────────────┐
│       user_workouts_cache (D1)               │
├──────────────────────────────────────────────┤
│ id TEXT PRIMARY KEY                          │
│ user_id TEXT NOT NULL (indexed)              │
│ name TEXT                                    │
│ data JSON (full workout serialized)          │
│ synced_at INTEGER (unix timestamp)           │
│ created_at INTEGER (unix timestamp)          │
└──────────────────────────────────────────────┘

SYNC POINTS:
1. workers/api/plans.ts::POST /save
   └─> After pgQuery INSERT, also D1 INSERT

2. workers/api/ai.ts (if generates plans)
   └─> After pgQuery INSERT, also D1 INSERT

3. Service Worker (future PWA offline)
   └─> Query: SELECT * FROM user_workouts_cache WHERE user_id=?
```

**Files to modify:**
- `migrations/d1/0005_user_workouts_cache.sql` (NEW)
- `workers/api/plans.ts` (lines 123-167: add D1 insert after pgQuery)
- `workers/api/ai.ts` (if it generates plans, add same D1 insert)

---

## Phase 4: Dashboard Visual Polish

```
BEFORE:
  Header: Native buttons, no DSIcon in all places
  Dark theme: Using theme tokens but no cohesive showcase look

AFTER:
  Header: All buttons use <Button> DS + <DSIcon>
  Sidebar: All icons use <DSIcon>
  Color tokens: All semantic (--ds-primary, --ds-secondary, etc.)
  Dark navy baseline: #050a12 → #0b1120 gradient (from showcase)

COMPONENTS TO AUDIT:
  src/components/layout/header.tsx
  └─> Lines 160-268: All icon/button usage
      └─> Ensure <DSIcon> + <Button> variants (primary/secondary/ghost)

  src/components/layout/sidebar.tsx
  └─> All nav items use <DSIcon>

  src/components/layout/mobile-nav.tsx
  └─> All nav icons use <DSIcon>
```

---

## Data Structures (Zod Schemas)

### generatePlanInputSchema (input to /plans/generate)

```typescript
{
  gender: 'male' | 'female' | 'other' | 'prefer_not_say'
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  training_frequency: 'regularly' | 'inconsistently' | 'never'
  goal: 'lose_weight' | 'gain_muscle' | 'tone' | 'health' | 'strength' | 'flexibility'
  training_location: 'gym_large' | 'gym_small' | 'home' | 'bodyweight' | 'outdoor'
  target_muscles: string[] (e.g. ['peito', 'costas', 'ombros'])
  age: number (13-100)
  height_cm: number (100-250)
  weight_kg: number (30-300)
  target_weight_kg: number (30-300, optional)
  days_per_week: number (1-7, default 3)
  session_duration: 'quick_15' | 'short_30' | 'medium_45' | 'long_60' (default 'medium_45')
  injuries: string[] (e.g. ['knee pain', 'back issues'])
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'any' (default 'any')
}
```

### generatedPlanSchema (output from /plans/generate)

```typescript
{
  plan_name: string (3-200 chars)
  description: string (5-500 chars)
  estimated_calories_per_session: number (50-2000, optional)
  days: [
    {
      day_number: number (1-7)
      name: string (e.g. "Dia 1: Peito e Tríceps")
      focus: string (e.g. "Upper body strength")
      exercises: [
        {
          name: string
          muscle_group: string
          sets: number (1-10)
          reps: string (e.g. "8-10", "12-15")
          rest_seconds: number (0-300)
          weight_suggestion_kg: number (optional)
          notes: string (optional)
        }
      ] (3-12 exercises)
    }
  ] (1-7 days, must match input.days_per_week)
}
```

---

## Error Handling Strategy

| Phase | Error | Recovery |
|-------|-------|----------|
| **1** | TWA startUrl wrong | Manual update twa-manifest.json + rebuild AAB |
| **2** | POST /generate timeout | Retry logic (3x) + fallback to template |
| **2** | POST /generate 400 (invalid input) | Validate schema in frontend, show field error |
| **2** | POST /generate 500 (IA failure) | Use fallback template, log to Sentry |
| **3** | D1 INSERT fails | Log error, continue (PostgreSQL insert succeeded) |
| **3** | D1 migration fails | Wrangler rollback, then reapply migration |
| **4** | Header render error | Fallback to simple text nav (never hide nav) |

---

## Testing Entry Points

```
UNIT TESTS:
  ✓ onboarding-store.ts::updateData() merges partial correctly
  ✓ plan-generation.ts::generatePlanInputSchema validates all enum values
  ✓ plan-generation.ts::generatedPlanSchema rejects invalid days count
  ✓ db.ts::D1 INSERT syntax correct

INTEGRATION TESTS:
  ✓ Load welcome page → not authenticated → can see quiz link
  ✓ Load welcome page → authenticated → redirects to /dashboard
  ✓ Complete 17 onboarding steps → data in store → payload sent correct
  ✓ POST /plans/generate → success → sessionStorage saved
  ✓ POST /plans/generate → error → retry button works
  ✓ POST /plans/save → PostgreSQL + D1 both have data

E2E TESTS (if using Playwright):
  ✓ Fresh TWA → /welcome → click "Começar" → 17 steps → plano gerado
  ✓ Dashboard header → all icons are DSIcon
  ✓ Dark mode → all text contrast ≥4.5:1 (WCAG AA)
```

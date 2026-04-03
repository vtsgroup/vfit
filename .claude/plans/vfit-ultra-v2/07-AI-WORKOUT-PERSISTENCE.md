# Sprint 6 — AI Workout Persistence

> **Fase:** 2 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 6-8h
> **Objetivo:** Plano de treino gerado pela IA é salvo no DB e sobrevive refresh/close

---

## 🎯 Problema

1. **Plano IA salvo em sessionStorage** — fecha o app = perdeu o treino
2. **`/plano` lê de sessionStorage** — não existe plano "ativo" no DB
3. **POST `/plans/generate`** gera treino mas retorna sem persistir
4. **Exercícios gerados não linkam com tabela de exercícios** — são texto livre
5. **Sem histórico de planos** — aluno não vê planos anteriores

---

## 📋 Tasks

### T6.1 — Backend: Salvar plano IA no DB
**Arquivo:** `workers/api/plans.ts`

**Modificar** `POST /plans/generate` para salvar automaticamente:

```typescript
// Após IA gerar o plano:
const planId = generateId()

// 1. Salvar plano
await pgQuery(env, `
  INSERT INTO ai_plans (id, student_id, title, description, goal, duration_weeks,
    days_per_week, session_duration, experience_level, plan_data, is_active, created_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, NOW())
`, [
  planId, userId,
  `Plano ${goalLabel} - ${daysPerWeek}x/semana`,
  `Treino personalizado para ${goalLabel}`,
  goal, 4, // 4 semanas padrão
  daysPerWeek, sessionDuration, experienceLevel,
  JSON.stringify(generatedPlan), // plano completo em JSON
])

// 2. Desativar planos anteriores
await pgQuery(env, `
  UPDATE ai_plans SET is_active = FALSE WHERE student_id = $1 AND id != $2
`, [userId, planId])

// 3. Retornar plano salvo (não mais sessionStorage)
return success(c, { plan_id: planId, plan: generatedPlan })
```

### T6.2 — Migration: Tabela ai_plans
**Criar:** `migrations/hyperdrive/XXXX_create_ai_plans.sql`

```sql
CREATE TABLE IF NOT EXISTS ai_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_weeks INTEGER DEFAULT 4,
  days_per_week INTEGER DEFAULT 3,
  session_duration TEXT,
  experience_level TEXT,
  plan_data JSONB NOT NULL, -- estrutura completa do plano
  is_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_plans_student ON ai_plans(student_id);
CREATE INDEX idx_ai_plans_active ON ai_plans(student_id) WHERE is_active = TRUE;
```

**Estrutura do plan_data JSONB:**
```json
{
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": 1,
          "name": "Treino A - Peito e Tríceps",
          "warmup": "5 min esteira/bicicleta",
          "exercises": [
            {
              "name": "Supino Reto com Barra",
              "sets": 4,
              "reps": "8-12",
              "rest": "90s",
              "notes": "Foco na contração"
            }
          ],
          "cooldown": "5 min alongamento"
        }
      ]
    }
  ]
}
```

### T6.3 — Backend: GET plano ativo
**Endpoint:** `GET /api/v1/vfit/plan/active`

```typescript
vfit.get('/plan/active', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  const plan = await pgQueryOne(c.env, `
    SELECT id, title, description, goal, duration_weeks,
      days_per_week, session_duration, experience_level,
      plan_data, is_active, created_at
    FROM ai_plans
    WHERE student_id = $1 AND is_active = TRUE
    ORDER BY created_at DESC LIMIT 1
  `, [user.id])

  if (!plan) return success(c, null)
  return success(c, plan)
})
```

### T6.4 — Backend: GET histórico de planos
**Endpoint:** `GET /api/v1/vfit/plans`

```typescript
vfit.get('/plans', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  const plans = await pgQuery(c.env, `
    SELECT id, title, description, goal, is_active, created_at
    FROM ai_plans
    WHERE student_id = $1
    ORDER BY created_at DESC LIMIT 20
  `, [user.id])

  return success(c, plans)
})
```

### T6.5 — Backend: Ativar plano
**Endpoint:** `POST /api/v1/vfit/plan/:id/activate`

```typescript
vfit.post('/plan/:id/activate', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  const planId = c.req.param('id')

  // Desativar todos
  await pgQuery(c.env, `
    UPDATE ai_plans SET is_active = FALSE WHERE student_id = $1
  `, [user.id])

  // Ativar o selecionado
  await pgQuery(c.env, `
    UPDATE ai_plans SET is_active = TRUE, activated_at = NOW() WHERE id = $1 AND student_id = $2
  `, [planId, user.id])

  return success(c, { activated: true })
})
```

### T6.6 — Frontend: /plano lê do DB
**Arquivo:** `src/app/(app)/plano/page.tsx`

**Antes:**
```tsx
const plan = JSON.parse(sessionStorage.getItem('vfit-plan') || 'null')
```

**Depois:**
```tsx
import { useActivePlan } from '@/hooks/use-vfit-plan'

export default function PlanoPage() {
  const { data: plan, isLoading } = useActivePlan()

  if (isLoading) return <PlanSkeleton />
  if (!plan) return <EmptyPlanState onGenerate={() => router.push('/ia/treino')} />

  return <PlanView plan={plan} />
}
```

### T6.7 — Hook: useActivePlan
**Criar:** `src/hooks/use-vfit-plan.ts`

```typescript
export function useActivePlan() {
  const isReady = useAuthStore(s => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['vfit', 'plan', 'active'],
    queryFn: () => api.get('/vfit/plan/active').then(r => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.DYNAMIC, // atualiza frequentemente
  })
}

export function usePlanHistory() {
  const isReady = useAuthStore(s => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['vfit', 'plans'],
    queryFn: () => api.get('/vfit/plans').then(r => r.data),
    enabled: isReady,
  })
}

export function useActivatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) =>
      api.post(`/vfit/plan/${planId}/activate`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vfit', 'plan'] })
      qc.invalidateQueries({ queryKey: ['vfit', 'plans'] })
    },
  })
}
```

### T6.8 — Frontend: Remover sessionStorage do plano
**Arquivo:** `src/app/(onboarding)/onboarding/loading/page.tsx`

Remover: `sessionStorage.setItem('vfit-plan', JSON.stringify(plan))`
O plano agora é salvo no DB pelo backend.

### T6.9 — "Treino do dia" no dashboard
**Arquivo:** `src/app/(app)/treinos/page.tsx`

Com plano ativo, mostrar o treino do dia baseado na semana/dia atual:

```typescript
function getTodayWorkout(plan: AIPlan) {
  const dayOfWeek = new Date().getDay() // 0=domingo
  const activeDays = plan.plan_data.weeks[0].days // semana 1
  const dayIndex = Math.min(dayOfWeek - 1, activeDays.length - 1)
  return activeDays[Math.max(0, dayIndex)]
}
```

---

## ✅ Critérios de Aceite

- [ ] POST /plans/generate salva automaticamente no DB
- [ ] Plano sobrevive refresh, close, e reinstall do app
- [ ] GET /vfit/plan/active retorna plano ativo
- [ ] /plano renderiza plano do DB, não de sessionStorage
- [ ] Histórico de planos acessível
- [ ] Plano anterior pode ser reativado
- [ ] "Treino do dia" aparece na home do aluno
- [ ] sessionStorage removido do flow de plano

---

## 📁 Arquivos Impactados

```
workers/api/plans.ts — salvar no DB
workers/api/vfit.ts — endpoints de plano ativo
migrations/hyperdrive/XXXX_create_ai_plans.sql (NOVO)
src/app/(app)/plano/page.tsx — ler do DB
src/app/(app)/treinos/page.tsx — treino do dia
src/hooks/use-vfit-plan.ts (NOVO)
src/app/(onboarding)/onboarding/loading/page.tsx — remover sessionStorage
```

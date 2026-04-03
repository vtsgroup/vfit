# Phase 3: D1 Workout Sync — Treinos para D1

**Duração:** 1.5-2 horas  
**Bloqueadores:** Phase 2 DEVE estar concluído  
**Dependências:** PostgreSQL inserts devem funcionar primeiro

---

## Problema

Treinos criados pelo onboarding vão apenas para PostgreSQL. D1 fica vazio. PWA offline não consegue acessar treinos sem conexão.

---

## Solução

Criar tabela D1 `user_workouts_cache` + replicar cada treino novo para lá.

```
PostgreSQL (live) → Treino ativo, histórico
D1 (cache)        → Cópia comprimida para offline, acesso rápido
```

---

## Tasks

### 3.1 — Criar Migration D1

**File:** `migrations/d1/0005_user_workouts_cache.sql` (NEW)

```sql
-- migrations/d1/0005_user_workouts_cache.sql
-- User Workouts Cache — offline availability for PWA

CREATE TABLE IF NOT EXISTS user_workouts_cache (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSON NOT NULL,              -- full workout serialized (day[].exercises[])
  synced_at INTEGER NOT NULL,      -- unix timestamp (milliseconds)
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_user_workouts_user ON user_workouts_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_created ON user_workouts_cache(created_at DESC);

-- Seed (optional): soft-delete marker
ALTER TABLE user_workouts_cache ADD COLUMN IF NOT EXISTS deleted_at INTEGER;
```

**Why:**
- `id` = workout ID (same as PostgreSQL)
- `user_id` = for filtering by user
- `data` = JSON blob (entire workout structure)
- `synced_at` = when we last synced (for conflict detection)
- `created_at` = when created (for sorting)

---

### 3.2 — Aplicar Migration

**Command:**
```bash
wrangler d1 migrations create vfit-exercises add_user_workouts_cache
# Copiar 0005_user_workouts_cache.sql para migrations/d1/
wrangler d1 migrations apply vfit-exercises --remote
```

**Verify:**
```bash
wrangler d1 execute vfit-exercises --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
# Deve listar: exercises, workout_templates, user_workouts_cache (novo)
```

---

### 3.3 — Modificar `workers/api/plans.ts`

**File:** `workers/api/plans.ts`

**Location 1:** POST /save (lines 123-167)

Add D1 insert after successful PostgreSQL insert:

```typescript
plans.post('/save', async (c) => {
  const userId = c.get('userId')
  if (!userId) throw new BadRequestError('Usuário não identificado')

  const body = await c.req.json()
  const plan = generatedPlanSchema.parse(body.plan)

  const planId = generateId()
  const now = new Date().toISOString()

  // INSERT to PostgreSQL
  await pgQuery(c.env, `INSERT INTO workout_plans (...)`, [...])
  
  for (const day of plan.days) {
    // ... INSERT days + exercises to PostgreSQL
  }

  // NEW: ALSO INSERT to D1
  try {
    const planData = {
      id: planId,
      name: plan.plan_name,
      days: plan.days,
      stats: {
        total_exercises: plan.days.reduce((s, d) => s + d.exercises.length, 0),
        created_at: now,
      }
    }
    
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO user_workouts_cache (id, user_id, name, data, synced_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      planId,
      userId,
      plan.plan_name,
      JSON.stringify(planData),
      Date.now(),
      Math.floor(new Date(now).getTime() / 1000)
    ).run()
    
    console.log(`[D1] Synced workout ${planId} for user ${userId}`)
  } catch (err) {
    console.warn(`[D1] Failed to sync workout ${planId}:`, err)
    // Do NOT fail the request — PostgreSQL insert succeeded, D1 is cache
  }

  return created({ plan_id: planId })
})
```

**Location 2:** POST /regenerate (lines 399-445)

Add same D1 insert after creating new plan.

---

### 3.4 — Verificar `workers/api/ai.ts`

**If** `ai.ts` também gera planos (via chat ou outro endpoint):

**Action:** Adicionar mesmo D1 insert pattern.

**Grep:**
```bash
grep -n "INSERT INTO workout_plans" workers/api/ai.ts
```

Se encontrar, aplicar mesmo padrão de D1 insert.

---

### 3.5 — Testar D1 Insert

**Local test:**
```bash
# 1. Dev mode
npm run wrangler:dev

# 2. Chamar POST /api/v1/plans/save com payload
curl -X POST http://localhost:8787/api/v1/plans/save \
  -H "Content-Type: application/json" \
  -d '{
    "plan": {
      "plan_name": "Test Workout",
      "description": "...",
      "days": [...]
    }
  }'

# 3. Verificar D1 insert
wrangler d1 execute vfit-exercises --local --command \
  "SELECT id, user_id, name, synced_at FROM user_workouts_cache LIMIT 5"
```

**Remote test (após deploy):**
```bash
wrangler d1 execute vfit-exercises --remote --command \
  "SELECT id, user_id, name, synced_at FROM user_workouts_cache WHERE user_id='<test-user-id>'"
```

---

## Handling Edge Cases

### Case 1: D1 insert falha, PostgreSQL sucesso

**Current behavior:** Log warning, request continues (correto)

**Fallback:** PWA fica sem offline, mas web funciona normal.

### Case 2: D1 tiene dados desincronizados

**Solution:** Adicionar `synced_at` e comparar timestamps.

```typescript
// Pseudo-code para Service Worker (futuro)
const cached = await db.query('SELECT * FROM user_workouts_cache WHERE id=?')
const live = await fetch('/api/workouts/' + id)
if (live.updated_at > cached.synced_at) {
  // Use live
} else {
  // Use cached
}
```

### Case 3: Usuário deletar treino em PostgreSQL

**Need:** Soft delete tracking

```typescript
// Add to D1 migration
ALTER TABLE user_workouts_cache ADD COLUMN deleted_at INTEGER;

// When deleting from PostgreSQL
await pgQuery('DELETE FROM workout_plans WHERE id=$1', [planId])
// Then mark in D1
await c.env.DB.prepare(
  'UPDATE user_workouts_cache SET deleted_at = ? WHERE id = ?'
).bind(Date.now(), planId).run()
```

---

## Deploy Checklist

- [ ] Migration criada: `migrations/d1/0005_user_workouts_cache.sql`
- [ ] Migration aplicada: `wrangler d1 migrations apply vfit-exercises --remote`
- [ ] `workers/api/plans.ts` modificado (POST /save + /regenerate)
- [ ] `workers/api/ai.ts` verificado e modificado se necessário
- [ ] D1 insert testado localmente
- [ ] Nenhum erro em `wrangler tail`
- [ ] Test data aparece em `SELECT * FROM user_workouts_cache`

---

## Rollback

```bash
# Se D1 migration falhar
wrangler d1 migrations rollback vfit-exercises --remote

# Se código quebrar
git revert <commit>
wrangler deploy
```

---

## Estimativa

| Task | Tempo |
|------|-------|
| 3.1 | 15 min |
| 3.2 | 10 min |
| 3.3 | 30 min |
| 3.4 | 15 min |
| 3.5 | 20 min |
| Deploy + verify | 15 min |
| **Total** | **1h 45min** |

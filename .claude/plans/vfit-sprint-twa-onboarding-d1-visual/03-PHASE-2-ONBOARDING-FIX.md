# Phase 2: Onboarding Quiz Fix — POST /plans/generate

**Duração:** 2-3 horas  
**Bloqueadores:** Sim (Phase 3 depende disso)  
**Dependências:** Phase 1 deve estar concluído

---

## Problema

Usuário completa 17 passos do onboarding → tela de loading → POST `/api/v1/plans/generate` falha com erro "Ops! Algo deu errado. Vamos tentar de novo."

**Impacto:** Conversão interrompida, usuário nunca cria plano.

---

## Root Cause Analysis

Possíveis causas (investigar nesta ordem):

1. **Payload mismatch**: `loading/page.tsx` envia campos que `generatePlanInputSchema` não aceita
2. **Enum values**: Valores do onboarding store não batem com schema (ex: `'beginner'` vs `'iniciante'`)
3. **IA timeout**: Workers AI timeout (>30s), fallback template não ativado
4. **JSON parsing**: Resposta IA não é JSON válido, regex não consegue extrair
5. **CORS/Auth**: Endpoint rejeita request (raro, já tem `optionalAuth`)

---

## Investigation Plan

### Step 1: Check Payload Construction

**File:** `src/app/(onboarding)/onboarding/loading/page.tsx`  
**Lines:** 72-87

```typescript
const payload = {
  gender: data.gender || 'prefer_not_say',
  experience_level: data.experience_level || 'beginner',
  training_frequency: data.training_frequency || 'never',
  goal: data.goal || 'health',
  training_location: data.training_location || 'gym_large',
  target_muscles: data.target_muscles,
  age: data.age || 25,
  height_cm: data.height_cm || 170,
  weight_kg: data.weight_kg || 70,
  target_weight_kg: data.target_weight_kg || data.weight_kg || 70,
  days_per_week: data.days_per_week,
  session_duration: data.session_duration,
  injuries: data.injuries,
  preferred_time: data.preferred_time,
}
```

**Validar:**
- ✓ Todos os campos obrigatórios presentes
- ✓ Enum values correspondidos com schema
- ✓ Arrays (target_muscles, injuries) não são null

### Step 2: Check Zod Schema

**File:** `workers/schemas/plan-generation.ts`

**Verify:**
```typescript
export const generatePlanInputSchema = z.object({
  gender: z.enum(['male', 'female', 'other', 'prefer_not_say']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  training_frequency: z.enum(['regularly', 'inconsistently', 'never']),
  goal: z.enum([...]),
  // ... etc
})
```

**Cuidado:** Schema pode ter `refine()` ou `superRefine()` que rejeita em produção.

### Step 3: Check API Handler

**File:** `workers/api/plans.ts`  
**Lines:** 28-118

**Steps:**
1. Line 30: `const input = generatePlanInputSchema.parse(body)` — se falhar, retorna 400
2. Lines 36-52: PROMPTS.generate_b2c_plan() — confere se toma todos os campos
3. Lines 55-64: callWorkersAIWithFallback() — confere timeout + fallback
4. Lines 67-73: JSON extraction com regex — pode falhar se IA retorna markdown diferentes
5. Line 74: generatedPlanSchema.parse() — validação da resposta

### Step 4: Check IA Fallback

**File:** `lib/workers-ai.ts` (ou equivalente)

**Confere:**
- Timeout configurado (ex: 30s)
- Fallback model existe: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Se IA falha, deve usar `getDefaultPlan()`

### Step 5: Check Response Validation

**File:** `workers/schemas/plan-generation.ts`

**Verify:**
```typescript
export const generatedPlanSchema = z.object({
  plan_name: z.string().min(3).max(200),
  description: z.string().min(5).max(500),
  estimated_calories_per_session: z.number().min(50).max(2000).optional(),
  days: z.array(...).min(1).max(7),
})
```

**Crítico:** `days.length` DEVE ser === `input.days_per_week`

---

## Common Fixes

### Fix A: Enum Value Mismatch

**If:** Schema espera `'beginner'` mas frontend envia `'iniciante'`

**Action:** Alinhar nomes em ambos os lados. **Recomendação: usar português no frontend, mapa para inglês no payload.**

```typescript
// No loading/page.tsx
const experienceMap = {
  'iniciante': 'beginner',
  'intermediário': 'intermediate',
  'avançado': 'advanced',
}

const payload = {
  experience_level: experienceMap[data.experience_level] || 'beginner',
  // ...
}
```

### Fix B: JSON Parsing Failure

**If:** IA retorna markdown wrapper que regex não consegue extrair

**Action:** Melhorar regex ou usar JSON.parse com try-catch mais robusto.

```typescript
// Current (line 68)
const jsonMatch = raw.match(/\{[\s\S]*\}/)

// More robust
let parsed
try {
  // Try direct JSON
  parsed = JSON.parse(raw)
} catch {
  // Try markdown wrapper
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) {
    parsed = JSON.parse(match[1])
  } else {
    // Try last resort: brace extraction
    const braceMatch = raw.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      parsed = JSON.parse(braceMatch[0])
    } else {
      throw new Error('Could not extract JSON from response')
    }
  }
}
```

### Fix C: Days Count Mismatch

**If:** IA retorna 4 dias mas input pediu 3

**Action:** Validar após parse, se não bater, usar fallback template.

```typescript
// Already exists at line 89-97
if (plan.days.length !== input.days_per_week) {
  plan = getDefaultPlan({...})
  source = 'fallback'
}
```

**Verificar:** `getDefaultPlan()` realmente retorna o número correto de dias?

### Fix D: IA Timeout

**If:** `callWorkersAIWithFallback` toma mais de 30s

**Action:** Aumentar timeout ou forçar fallback mais cedo.

```typescript
// In workers/api/plans.ts
const result = await callWorkersAIWithFallback(
  c.env,
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  prompt,
  {
    max_tokens: 4096,
    temperature: 0.6,
    timeout: 25_000, // 25s (leave room for fallback)
    fallbackModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  }
)
```

---

## Debug Checklist para Copilot

- [ ] Ler `loading/page.tsx` payload (linhas 72-87)
- [ ] Comparar com `plan-generation.ts::generatePlanInputSchema`
- [ ] Rodar `npm run workers:test` se existir teste unitário
- [ ] Chamar `/api/v1/plans/generate` com curl + payload válido localmente
- [ ] Verificar Cloudflare Workers logs: `wrangler tail`
- [ ] Testar fallback template: `getDefaultPlan({ goal: 'muscle_gain', days_per_week: 3 })`

---

## Deploy Checklist

- [ ] Todos os tipos TypeScript validam: `npm run type-check`
- [ ] Lint passa: `npm run lint`
- [ ] Smoke test de auth: `npm run smoke:auth:local`
- [ ] Endpoint `/plans/generate` retorna status 200 com payload válido
- [ ] Resposta segue `generatedPlanSchema`

---

## Teste Manual E2E

```bash
# 1. Dev mode
npm run dev & npm run wrangler:dev

# 2. Abrir http://localhost:3000/onboarding
# Completar 17 passos (mockar answers se necessário)

# 3. Deve redirecionar para /onboarding/loading

# 4. Monitorar logs
# - Frontend: console.log payload enviado
# - Backend: wrangler tail — ver POST /plans/generate request/response

# 5. Se erro, adicionar logging
# - Add try-catch com console.error detalhado
# - Log payload antes de enviar

# 6. Se sucesso, confere
# - sessionStorage tem 'vfit_plan'
# - /onboarding/result carrega plano
# - Plano tem 17 dias? (ou correct number)
```

---

## Estimativa

| Task | Tempo |
|------|-------|
| Investigação | 30 min |
| Fix implementation | 45 min |
| Teste local | 30 min |
| Deploy + validation | 15 min |
| **Total** | **2-3h** |

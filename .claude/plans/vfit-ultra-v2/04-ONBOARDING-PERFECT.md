# Sprint 3 — Onboarding Perfect

> **Fase:** 1 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 8-10h
> **Objetivo:** Flow completo que FUNCIONA: onboarding → treino → assessment → nutrição

---

## 🎯 Problema

1. **Emojis no loading** — 🏋️ 🎯 💪 devem ser SVG animados premium
2. **Dados só em sessionStorage** — fechou app = perdeu tudo
3. **Paywall quebrado** — "Assinar Premium Anual" dá erro, cai no dashboard sem nada
4. **"Continuar gratuitamente" não faz nada útil** — vai pro dashboard vazio
5. **Após responder 17 perguntas, NADA acontece** — sem assessment, sem nutrição
6. **Preços do paywall ≠ preços da subscription page**

---

## 📋 Tasks

### T3.1 — SVGs animados no loading
**Arquivo:** `src/app/(onboarding)/onboarding/loading/page.tsx`

**Substituir emojis por SVG components:**

| Fase | Emoji Atual | SVG Target |
|------|:-----------:|-----------|
| 1 | 📊 | `<AnalyzingIcon />` — gráfico de barras com shimmer |
| 2 | 🏋️ | `<ExerciseIcon />` — haltere com pulso |
| 3 | 🎯 | `<TargetIcon />` — alvo com seta |
| 4 | ⚡ | `<OptimizeIcon />` — raio com glow |
| 5 | ✨ | `<CompleteIcon />` — checkmark com sparkles |

**Criar:** `src/components/onboarding/loading-icons.tsx` (NOVO)
Cada ícone: SVG 64×64px, `stroke="currentColor"`, animação CSS (não framer-motion).

```tsx
// Exemplo: ExerciseIcon com pulso
export function ExerciseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("animate-pulse", className)}
      fill="none" stroke="currentColor" strokeWidth="2">
      {/* Dumbbell SVG path */}
      <rect x="8" y="24" width="12" height="16" rx="2" />
      <rect x="44" y="24" width="12" height="16" rx="2" />
      <rect x="20" y="28" width="24" height="8" rx="1" />
    </svg>
  )
}
```

### T3.2 — Persistir dados do onboarding no backend
**Backend:** `workers/api/vfit.ts` (ou criar `workers/api/onboarding.ts`)

**Novo endpoint:** `POST /api/v1/onboarding/complete`

```typescript
// Schema de input:
const onboardingCompleteSchema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  training_frequency: z.string(),
  goal: z.enum(['lose_weight', 'gain_muscle', 'tone', 'health', 'strength', 'flexibility']),
  training_location: z.enum(['gym_large', 'gym_small', 'home', 'bodyweight', 'outdoor']),
  target_muscles: z.array(z.string()),
  age: z.number().min(13).max(99),
  height_cm: z.number().min(120).max(220),
  weight_kg: z.number().min(30).max(300),
  target_weight_kg: z.number().optional(),
  days_per_week: z.number().min(1).max(7),
  session_duration: z.enum(['quick_15', 'short_30', 'medium_45', 'long_60']),
  injuries: z.array(z.string()),
  preferred_time: z.enum(['morning', 'afternoon', 'evening', 'any']),
})

// Ações:
// 1. Salvar perfil B2C na tabela students (ou vfit_profiles)
// 2. Criar self_assessment automática (T5.1)
// 3. Calcular nutrition targets (T5.4)
// 4. Marcar onboarding_completed = true
// 5. Retornar { profile_id, assessment_id, nutrition_targets }
```

**Frontend — chamar após a IA gerar o plano:**
```typescript
// src/app/(onboarding)/onboarding/loading/page.tsx
// Após POST /plans/generate, chamar:
await api.post('/onboarding/complete', onboardingStore.data)
```

### T3.3 — Fix redirect pós-paywall
**Arquivo:** `src/app/(onboarding)/onboarding/paywall/page.tsx`

**Fluxo correto:**
```
Paywall
├── "Assinar Premium" → /perfil/assinatura (checkout funcional, Sprint 4)
├── "Continuar grátis" → /treinos (app B2C com plano IA ativado)
└── ✕ Fechar → /treinos (idem)
```

**Atualmente:** Redirect para `/dashboard` (que mostra o B2B dashboard, não o B2C app).
**Fix:** Redirect para `/treinos` (tab root do app B2C).

### T3.4 — Paywall usa VFIT_PLANS
**Dependência:** Sprint 2 (T2.3)
Já coberto no sprint de pricing. Garantir que paywall importa de `config/constants.ts`.

### T3.5 — Flow "continuar gratuitamente"
**O que deve acontecer:**
1. Salvar plano IA gerado no DB (Sprint 6, T6.1)
2. Ativar plano como plano free (1 plano/mês, 3 treinos/semana)
3. Redirect para `/plano` mostrando o plano recém-criado
4. Dashboard mostra "Treino do dia" do plano ativo

### T3.6 — Steps motivacionais com SVG
**Arquivo:** `src/components/onboarding/steps/`

Substituir emojis nos steps por SVG components:

| Step | Emoji | SVG |
|------|:-----:|-----|
| StepMotivational (6) | 💪🔥 | Ilustração motivacional SVG |
| StepSocialProof (15) | ⭐👥 | Ícones de estrela + pessoas SVG |
| StepReady (16) | 🚀 | Rocket SVG com animação |

**Manter emojis APENAS em:** Textos descritivos, labels não-interativos.

### T3.7 — Salvar como perfil B2C
**Ver T3.2** — O endpoint `/onboarding/complete` salva os dados no banco.

**Tabela alvo:** `students` (colunas existentes que mapeiam):
- `gender` → `gender`
- `height_cm` → `height_cm`
- `weight_kg` → `weight_kg`
- `goal` → novo campo ou usar `notes`
- `experience_level` → novo campo
- `training_location` → novo campo
- `preferred_time` → novo campo
- `onboarding_completed` → novo campo boolean
- `onboarding_completed_at` → novo campo timestamptz

**Migration necessária:** `migrations/hyperdrive/XXXX_add_onboarding_fields.sql`
```sql
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS goal TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS training_location TEXT,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT,
  ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS days_per_week INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS session_duration TEXT DEFAULT 'medium_45',
  ADD COLUMN IF NOT EXISTS injuries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_muscles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
```

### T3.8 — Auto-trigger assessment + nutrition
**Dependência:** Sprint 5 (T5.1–T5.8)
Após onboarding complete:
1. Endpoint cria `self_assessment` com dados do onboarding
2. Calcula nutrition targets baseado no assessment
3. Frontend recebe IDs e redireciona com dados preenchidos

---

## ✅ Critérios de Aceite

- [ ] Zero emojis como ícones no loading do onboarding
- [ ] Dados do onboarding persistidos no DB (não sessionStorage)
- [ ] "Continuar grátis" redireciona para `/treinos` com plano ativo
- [ ] "Assinar Premium" vai para checkout funcional
- [ ] Assessment auto-criada com dados do onboarding
- [ ] Nutrition targets calculados automaticamente
- [ ] Migration SQL criada e documentada

---

## 📁 Arquivos Impactados

```
src/components/onboarding/loading-icons.tsx (NOVO)
src/app/(onboarding)/onboarding/loading/page.tsx
src/app/(onboarding)/onboarding/paywall/page.tsx
src/app/(onboarding)/onboarding/result/page.tsx
workers/api/onboarding.ts (NOVO) ou workers/api/vfit.ts
workers/schemas/onboarding.ts (NOVO)
migrations/hyperdrive/XXXX_add_onboarding_fields.sql (NOVO)
```

# Sprint 5 — Auto-Assessment & Nutrition Bridge

> **Fase:** 2 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 8-10h
> **Objetivo:** Onboarding gera assessment + nutrição automaticamente. Dados reais, não hardcoded.

---

## 🎯 Problema

1. **Onboarding coleta 15+ campos mas NÃO cria assessment** — dados perdem-se no sessionStorage
2. **Nutrição hardcoded:** `{ calories: 2000, protein: 150, carbs: 250, fat: 65 }` para TODOS
3. **Página de dieta IA** (`/ia/dieta`) tem Mifflin-St Jeor mas depende de `self_assessment` que não existe
4. **Aluno responde 17 perguntas e chega no dashboard sem nada** — assessment vazia, nutrição genérica
5. **Fórmulas de body composition existem** (`lib/assessment-formulas.ts`, `lib/body-composition.ts`) mas não são chamadas

---

## 📋 Tasks

### T5.1 — Auto-criar self_assessment do onboarding
**Backend:** Dentro do endpoint `POST /api/v1/onboarding/complete` (T3.2)

```typescript
// Após salvar perfil B2C, criar self_assessment automática:
const assessmentId = generateId()
await pgQuery(env, `
  INSERT INTO self_assessments (
    id, user_id, assessment_type,
    weight_kg, height_cm, age,
    activity_level, goal,
    source, notes, created_at
  ) VALUES ($1, $2, 'initial', $3, $4, $5, $6, $7, 'onboarding', 'Auto-gerada do onboarding', NOW())
`, [
  assessmentId, userId,
  data.weight_kg, data.height_cm, data.age,
  mapExperienceToActivity(data.experience_level), // beginner→sedentary, intermediate→moderate, advanced→active
  data.goal,
])
```

**Mapeamento experience → activity_level:**
```typescript
function mapExperienceToActivity(exp: string): string {
  switch (exp) {
    case 'beginner': return 'sedentary'
    case 'intermediate': return 'moderately_active'
    case 'advanced': return 'very_active'
    default: return 'lightly_active'
  }
}
```

### T5.2 — Calcular BMI, BMR e TDEE
**Usar:** `lib/body-composition.ts` (já existe!) + `lib/assessment-formulas.ts`

```typescript
import { calculateBMI, getBMICategory } from '@lib/body-composition'

// Dentro do onboarding/complete:
const bmi = calculateBMI(data.weight_kg, data.height_cm)
const bmiCategory = getBMICategory(bmi)

// Mifflin-St Jeor BMR
const bmr = data.gender === 'male'
  ? 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age + 5
  : 10 * data.weight_kg + 6.25 * data.height_cm - 5 * data.age - 161

// TDEE com fator de atividade
const activityMultiplier: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}
const tdee = Math.round(bmr * (activityMultiplier[activityLevel] || 1.375))

// Salvar no assessment
await pgQuery(env, `
  UPDATE self_assessments
  SET bmi = $1, bmr = $2, tdee = $3, bmi_category = $4
  WHERE id = $5
`, [bmi, bmr, tdee, bmiCategory, assessmentId])
```

### T5.3 — Migration: Campos BMR/TDEE no self_assessments
**Verificar se existem**, senão criar:

```sql
ALTER TABLE self_assessments
  ADD COLUMN IF NOT EXISTS bmi NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS bmr INTEGER,
  ADD COLUMN IF NOT EXISTS tdee INTEGER,
  ADD COLUMN IF NOT EXISTS bmi_category TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS age INTEGER;
```

### T5.4 — Calcular nutrition targets personalizados
**Lógica (baseada em evidência nutricional):**

```typescript
function calculateNutritionTargets(
  tdee: number,
  goal: string,
  weight_kg: number,
  gender: string
): NutritionTargets {
  // Ajuste calórico por objetivo
  let targetCalories: number
  switch (goal) {
    case 'lose_weight':
      targetCalories = Math.round(tdee * 0.80) // -20% deficit
      break
    case 'gain_muscle':
      targetCalories = Math.round(tdee * 1.15) // +15% surplus
      break
    case 'tone':
      targetCalories = Math.round(tdee * 0.90) // -10% leve deficit
      break
    default:
      targetCalories = tdee // manutenção
  }

  // Macros
  // Proteína: 1.6-2.2g/kg (usar 2g/kg para maioria)
  const proteinPerKg = goal === 'gain_muscle' ? 2.2 : 1.8
  const protein = Math.round(weight_kg * proteinPerKg)

  // Gordura: 25-30% das calorias
  const fatCalories = targetCalories * 0.25
  const fat = Math.round(fatCalories / 9)

  // Carboidratos: restante
  const carbCalories = targetCalories - (protein * 4) - (fat * 9)
  const carbs = Math.round(carbCalories / 4)

  // Fibra
  const fiber = gender === 'male' ? 38 : 25

  // Água
  const water = Math.round(weight_kg * 35) // 35ml/kg

  return {
    calories: targetCalories,
    protein,
    carbs: Math.max(carbs, 50), // mínimo 50g
    fat,
    fiber,
    water_ml: water,
  }
}
```

### T5.5 — Salvar nutrition targets no DB
**Migration:** `migrations/hyperdrive/XXXX_create_nutrition_targets.sql`

```sql
CREATE TABLE IF NOT EXISTS nutrition_targets (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id TEXT REFERENCES self_assessments(id),
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  fiber INTEGER DEFAULT 25,
  water_ml INTEGER DEFAULT 2500,
  goal TEXT,
  source TEXT DEFAULT 'auto', -- 'auto' | 'manual' | 'ai'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nutrition_student ON nutrition_targets(student_id);
-- Unique active target per student
CREATE UNIQUE INDEX idx_nutrition_active ON nutrition_targets(student_id) WHERE is_active = TRUE;
```

### T5.6 — Backend: GET nutrition targets
**Endpoint:** `GET /api/v1/vfit/nutrition`

```typescript
vfit.get('/nutrition', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  const targets = await pgQueryOne(c.env, `
    SELECT * FROM nutrition_targets
    WHERE student_id = $1 AND is_active = TRUE
  `, [user.id])

  if (!targets) {
    // Fallback: valores padrão genéricos (mas isso NÃO deve acontecer após onboarding)
    return success(c, {
      calories: 2000, protein: 150, carbs: 250, fat: 65,
      source: 'default', is_personalized: false,
    })
  }

  return success(c, { ...targets, is_personalized: true })
})
```

### T5.7 — Frontend: Nutrição usa dados reais
**Arquivo:** `src/app/(app)/nutricao/page.tsx`

**Antes (hardcoded):**
```tsx
const dailyTargets = { calories: 2000, protein: 150, carbs: 250, fat: 65 }
```

**Depois (do backend):**
```tsx
import { useNutritionTargets } from '@/hooks/use-vfit-nutrition'

export default function NutricaoPage() {
  const { data: targets, isLoading } = useNutritionTargets()

  if (isLoading) return <NutritionSkeleton />

  const dailyTargets = targets?.is_personalized
    ? targets
    : DEFAULT_TARGETS // fallback visual, mas com banner "Complete seu perfil"
  // ...
}
```

### T5.8 — Hook: useNutritionTargets
**Criar:** `src/hooks/use-vfit-nutrition.ts`

```typescript
export function useNutritionTargets() {
  const isReady = useAuthStore(s => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['vfit', 'nutrition', 'targets'],
    queryFn: () => api.get('/vfit/nutrition').then(r => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.SEMI_STATIC, // mudam pouco
  })
}
```

### T5.9 — Assessment page mostra dados reais
**Arquivo:** `src/app/(app)/avaliacoes/page.tsx`

Se existir self_assessment auto-gerada, mostrar na lista com badge "Auto" e valores preenchidos.
Permitir editar/complementar com medidas adicionais (circunferências).

### T5.10 — Banner "Dados estimados"
Quando nutrição vier de auto-cálculo (source='auto'), exibir banner:

```
┌──────────────────────────────────┐
│ ℹ️ Valores estimados a partir     │
│    do seu perfil. Consulte um     │
│    nutricionista para maior       │
│    precisão. [Editar metas]       │
└──────────────────────────────────┘
```

---

## ✅ Critérios de Aceite

- [ ] Onboarding cria self_assessment automaticamente
- [ ] BMI, BMR, TDEE calculados com Mifflin-St Jeor
- [ ] Nutrition targets personalizados por objetivo/peso/atividade
- [ ] `/nutricao` mostra valores reais, não hardcoded 2000kcal
- [ ] `/avaliacoes` mostra assessment auto-criada
- [ ] Fórmulas existentes em `lib/body-composition.ts` são reutilizadas
- [ ] Banner informativo quando dados são estimados
- [ ] Migrations criadas para nutrition_targets e campos extras

---

## 📁 Arquivos Impactados

```
workers/api/onboarding.ts (ou vfit.ts) — lógica de auto-assessment
lib/nutrition-calc.ts (NOVO) — funções de cálculo nutricional
migrations/hyperdrive/XXXX_alter_self_assessments.sql (NOVO)
migrations/hyperdrive/XXXX_create_nutrition_targets.sql (NOVO)
src/app/(app)/nutricao/page.tsx — usar dados reais
src/app/(app)/avaliacoes/page.tsx — mostrar auto-assessment
src/hooks/use-vfit-nutrition.ts (NOVO)
```

---

## ⚠️ Dependências

- **Sprint 3 (T3.2):** Endpoint `/onboarding/complete` é o trigger
- **lib/body-composition.ts:** Funções BMI já existem
- **lib/assessment-formulas.ts:** Fórmulas de composição corporal

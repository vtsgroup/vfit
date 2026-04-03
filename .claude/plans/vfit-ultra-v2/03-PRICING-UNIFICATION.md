# Sprint 2 — Pricing Unification

> **Fase:** 1 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 3-4h
> **Objetivo:** Uma única fonte de verdade para todos os preços B2C e B2B

---

## 🎯 Problema

**4 definições de preço divergentes encontradas:**

| Local | Mensal B2C | Anual B2C |
|-------|:----------:|:---------:|
| `config/constants.ts` VFIT_PLANS | R$ 19,90 | R$ 149,90/ano |
| `perfil/assinatura/page.tsx` | R$ 29,90 | R$ 238,80/ano |
| `paywall-plans.tsx` | R$ 14,90 | R$ 89,90/ano |
| `use-platform-checkout.ts` + `workers/api/platform.ts` | (B2B duplicado) | (B2B duplicado) |

**Resultado:** Aluno vê preço X no onboarding, preço Y na assinatura, preço Z no paywall.

---

## 📋 Tasks

### T2.1 — Definir preços finais B2C
**Arquivo:** `config/constants.ts` — Seção `VFIT_PLANS`

**Decisão necessária do stakeholder:**

| Plano | Slug | Preço Mensal | Preço Anual | Economia |
|-------|------|:----------:|:---------:|:--------:|
| Grátis | `free` | R$ 0 | R$ 0 | — |
| Premium | `premium` | **R$ 19,90** | — | — |
| Premium Anual | `premium_annual` | — | **R$ 149,90** (R$ 12,49/mês) | 37% |

> **Recomendação:** Usar os preços do `config/constants.ts` como fonte de verdade.
> Se quiser preços diferentes, atualizar APENAS neste arquivo.

**Adicionar helpers:**
```typescript
// config/constants.ts
export function getVfitPlanPrice(slug: string): number {
  return VFIT_PLANS[slug as keyof typeof VFIT_PLANS]?.price ?? 0
}

export function getVfitPlanMonthlyPrice(slug: string): number {
  const plan = VFIT_PLANS[slug as keyof typeof VFIT_PLANS]
  if (!plan) return 0
  if (plan.duration_days === 365) return Math.round((plan.price / 12) * 100) / 100
  return plan.price
}

export function getVfitAnnualSavings(): number {
  const monthly = VFIT_PLANS.premium.price * 12
  const annual = VFIT_PLANS.premium_annual.price
  return Math.round(((monthly - annual) / monthly) * 100)
}
```

### T2.2 — Fix `perfil/assinatura/page.tsx`
**Arquivo:** `src/app/(app)/perfil/assinatura/page.tsx`

**Remover:**
```typescript
// ❌ Hardcoded prices
const plans = [
  { name: 'Premium Mensal', price: 29.90 },
  { name: 'Premium Anual', price: 19.90 }, // per month
]
```

**Substituir por:**
```typescript
import { VFIT_PLANS, getVfitPlanMonthlyPrice, getVfitAnnualSavings } from '@config/constants'

const plans = [
  {
    slug: 'premium',
    name: VFIT_PLANS.premium.name,
    price: VFIT_PLANS.premium.price,
    period: '/mês',
  },
  {
    slug: 'premium_annual',
    name: VFIT_PLANS.premium_annual.name,
    price: getVfitPlanMonthlyPrice('premium_annual'),
    totalPrice: VFIT_PLANS.premium_annual.price,
    period: `/mês (R$ ${VFIT_PLANS.premium_annual.price.toFixed(2).replace('.', ',')}/ano)`,
    savings: `${getVfitAnnualSavings()}%`,
  },
]
```

### T2.3 — Fix `paywall-plans.tsx`
**Arquivo:** `src/components/paywall/paywall-plans.tsx`

**Remover todos os preços hardcoded.** Importar de `VFIT_PLANS`.
Os descontos L2 (20%) e L3 (40%) podem ser calculados dinamicamente:
```typescript
const baseAnnualPrice = VFIT_PLANS.premium_annual.price
const l2Price = Math.round(baseAnnualPrice * 0.80 * 100) / 100 // 20% off
const l3Price = Math.round(baseAnnualPrice * 0.60 * 100) / 100 // 40% off
```

### T2.4 — Fix `use-platform-checkout.ts` (B2B)
**Arquivo:** `src/hooks/use-platform-checkout.ts`

**Remover:**
```typescript
const PLAN_PRICES = { trial: {...}, pro: {...}, profissional: {...}, max: {...} }
```

**Substituir por:**
```typescript
import { PLANS } from '@config/constants'

function getPlanPrice(slug: string, billing: 'monthly' | 'annual'): number {
  const plan = PLANS[slug]
  if (!plan) return 0
  if (billing === 'annual') return plan.price * 12 * (1 - ANNUAL_DISCOUNT)
  return plan.price
}
```

### T2.5 — Fix `workers/api/platform.ts` (B2B backend)
**Arquivo:** `workers/api/platform.ts`

**Mesmo padrão:** Remover `PLAN_PRICES` local, importar de `@config/constants`.

### T2.6 — Criar `lib/pricing.ts` (shared helper)
**Arquivo:** `lib/pricing.ts` (NOVO — acessível por frontend e workers)

```typescript
/**
 * lib/pricing.ts
 * Single source of truth para cálculos de preço.
 * Importado por frontend e workers.
 */
import { PLANS, VFIT_PLANS } from '@config/constants'

export const ANNUAL_DISCOUNT_B2B = 0.20 // 20% off para personals
export const ANNUAL_DISCOUNT_B2C = 0    // B2C já tem preço anual explícito

export function getB2BPrice(slug: string, billing: 'monthly' | 'annual'): number {
  const plan = PLANS[slug as keyof typeof PLANS]
  if (!plan) return 0
  if (billing === 'annual') {
    return Math.round(plan.price * 12 * (1 - ANNUAL_DISCOUNT_B2B) * 100) / 100
  }
  return plan.price
}

export function getB2CPrice(slug: string): number {
  const plan = VFIT_PLANS[slug as keyof typeof VFIT_PLANS]
  return plan?.price ?? 0
}

export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}
```

### T2.7–T2.9 — Validação cruzada
- Paywall lê de VFIT_PLANS ✓
- Subscription page lê de VFIT_PLANS ✓
- Backend checkout usa mesmos preços ✓
- Nenhum preço hardcoded restante ✓

---

## ✅ Critérios de Aceite

- [ ] `grep -rn "29.90\|14.90\|238.80\|89.90\|149.90" src/ --include="*.tsx"` retorna APENAS imports de constants
- [ ] `config/constants.ts` é a ÚNICA fonte de preços
- [ ] Helper `formatBRL()` usado em toda exibição de preço
- [ ] Paywall, subscription page, onboarding — todos mostram mesmo preço
- [ ] Backend checkout calcula usando mesma fonte

---

## 📁 Arquivos Impactados

```
config/constants.ts (modificar VFIT_PLANS + adicionar helpers)
lib/pricing.ts (NOVO)
src/app/(app)/perfil/assinatura/page.tsx
src/components/paywall/paywall-plans.tsx
src/hooks/use-platform-checkout.ts
workers/api/platform.ts
```

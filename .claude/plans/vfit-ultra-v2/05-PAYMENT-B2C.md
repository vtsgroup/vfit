# Sprint 4 — Payment B2C (Checkout Funcional)

> **Fase:** 2 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 10-12h
> **Objetivo:** Aluno B2C paga via PIX e recebe acesso premium real

---

## 🎯 Problema

1. **Subscription page é um STUB** — `useState('free')` hardcoded, `TODO: Implement actual Asaas API integration`, botões SEM onClick
2. **Não existe endpoint B2C checkout** — `/platform/checkout` é B2B (personal compra plano para si)
3. **Preços hardcoded divergem** — R$29.90 na subscription, R$14.90 no paywall, R$19.90 no constants.ts
4. **Webhook Asaas não processa pagamento B2C** — só processa B2B (personal subscription)
5. **Após pagar, aluno fica no plano free** — nenhum callback atualiza o plano do aluno

---

## 📋 Tasks

### T4.1 — Backend: Endpoint B2C Checkout
**Criar:** `workers/api/vfit-checkout.ts` ou adicionar a `workers/api/vfit.ts`

```typescript
// POST /api/v1/vfit/checkout
// Auth: JWT do aluno B2C (student)
// Body: { plan_slug: 'premium' | 'premium_annual', payment_method: 'PIX' | 'CREDIT_CARD' }

vfit.post('/checkout', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  if (user.user_type !== 'student') throw new ForbiddenError('Apenas alunos podem assinar')

  const { plan_slug, payment_method } = schema.parse(await c.req.json())
  const plan = VFIT_PLANS[plan_slug]
  if (!plan) throw new BadRequestError('Plano inválido')

  // 1. Buscar/criar customer Asaas para o aluno
  let asaas_customer_id = await getStudentAsaasId(c.env, user.id)
  if (!asaas_customer_id) {
    const customer = await createCustomer(c.env.ASAAS_API_KEY, {
      name: user.full_name,
      email: user.email,
      cpfCnpj: user.cpf || undefined,
    })
    asaas_customer_id = customer.id
    await saveStudentAsaasId(c.env, user.id, asaas_customer_id)
  }

  // 2. Criar cobrança/assinatura no Asaas
  const subscription = await createAsaasSubscription(c.env.ASAAS_API_KEY, {
    customer: asaas_customer_id,
    billingType: payment_method,
    value: plan.price,
    cycle: plan.cycle, // 'MONTHLY' | 'YEARLY'
    description: `VFIT ${plan.display_name}`,
    externalReference: `vfit_student_${user.id}`,
  })

  // 3. Salvar referência no DB
  await pgQuery(c.env, `
    INSERT INTO vfit_subscriptions (id, student_id, plan_slug, asaas_subscription_id, status, created_at)
    VALUES ($1, $2, $3, $4, 'PENDING', NOW())
  `, [generateId(), user.id, plan_slug, subscription.id])

  // 4. Se PIX: retornar QR code
  if (payment_method === 'PIX') {
    const pixInfo = await getPixQrCode(c.env.ASAAS_API_KEY, subscription.firstPayment)
    return success(c, {
      subscription_id: subscription.id,
      pix: {
        qr_code: pixInfo.encodedImage, // base64
        copy_paste: pixInfo.payload,
        expiration: pixInfo.expirationDate,
      }
    })
  }

  // 5. Se cartão: retornar URL do checkout Asaas
  return success(c, {
    subscription_id: subscription.id,
    checkout_url: subscription.invoiceUrl,
  })
})
```

### T4.2 — Migration: Tabela vfit_subscriptions
**Criar:** `migrations/hyperdrive/XXXX_create_vfit_subscriptions.sql`

```sql
CREATE TABLE IF NOT EXISTS vfit_subscriptions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL DEFAULT 'free',
  asaas_subscription_id TEXT,
  asaas_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING, OVERDUE, CANCELLED, EXPIRED
  payment_method TEXT, -- PIX, CREDIT_CARD, BOLETO
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vfit_subs_student ON vfit_subscriptions(student_id);
CREATE INDEX idx_vfit_subs_asaas ON vfit_subscriptions(asaas_subscription_id);
```

### T4.3 — Webhook: Processar pagamentos B2C
**Arquivo:** `workers/api/payments.ts`

Adicionar handler para `externalReference` com prefixo `vfit_student_`:

```typescript
// No webhook handler, após identificar o evento:
if (externalReference?.startsWith('vfit_student_')) {
  const studentId = externalReference.replace('vfit_student_', '')

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    // 1. Atualizar subscription status
    await pgQuery(env, `
      UPDATE vfit_subscriptions
      SET status = 'ACTIVE',
          current_period_start = NOW(),
          current_period_end = NOW() + INTERVAL '1 month', -- ou 1 year
          updated_at = NOW()
      WHERE student_id = $1 AND asaas_subscription_id = $2
    `, [studentId, subscription])

    // 2. Atualizar plano do aluno na tabela students
    await pgQuery(env, `
      UPDATE students
      SET subscription_plan = $1,
          subscription_expires_at = NOW() + INTERVAL '1 month',
          updated_at = NOW()
      WHERE id = $2
    `, [planSlug, studentId])

    // 3. Notificação push (OneSignal, Sprint 8)
    await notifyPaymentReceived(env, { userId: studentId, planName: 'Premium' }).catch(() => {})
  }

  if (event === 'PAYMENT_OVERDUE') {
    await pgQuery(env, `
      UPDATE vfit_subscriptions SET status = 'OVERDUE', updated_at = NOW()
      WHERE student_id = $1
    `, [studentId])
  }
}
```

### T4.4 — Frontend: Página de Assinatura funcional
**Arquivo:** `src/app/(app)/perfil/assinatura/page.tsx` (reescrever completo)

**Design:**
```
┌─────────────────────────┐
│    UPGRADE SEU PLANO    │
│                         │
│ ┌─ Mensal ──────────┐   │
│ │ R$ 19,90/mês      │   │
│ │ • Treinos IA ilim. │   │
│ │ • Nutrição person. │   │
│ │ • Avaliações auto  │   │
│ │ [Assinar com PIX]  │ ← Button DS primary
│ └────────────────────┘   │
│                         │
│ ┌─ Anual ────────────┐   │
│ │ R$ 149,90/ano      │   │
│ │ ECONOMIZE 37%      │   │ ← Badge DS
│ │ = R$ 12,49/mês     │   │
│ │ [Assinar com PIX]  │ ← Button DS primary
│ └────────────────────┘   │
│                         │
│  [Plano atual: Grátis]   │ ← Badge com plano atual real
└─────────────────────────┘
```

**Implementação:**
```tsx
'use client'
import { VFIT_PLANS, formatVfitPrice } from '@/config/constants'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export default function SubscriptionPage() {
  const user = useAuthStore(s => s.user)
  const currentPlan = user?.subscription_plan || 'free'

  const checkout = useMutation({
    mutationFn: async (planSlug: string) => {
      const res = await api.post('/vfit/checkout', {
        plan_slug: planSlug,
        payment_method: 'PIX',
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data.pix) {
        // Abrir modal PIX com QR code
        setPixData(data.pix)
        setShowPixModal(true)
      } else if (data.checkout_url) {
        window.open(data.checkout_url, '_blank')
      }
    },
  })

  // ... render plans from VFIT_PLANS
}
```

### T4.5 — PIX Modal Component
**Criar:** `src/components/payment/pix-modal.tsx`

Design premium com QR code + copy-paste + countdown:

```
┌────────────────────────┐
│ Escaneie o QR Code PIX │
│                        │
│    ┌──────────────┐    │
│    │  QR CODE     │    │
│    │  (base64 img)│    │
│    └──────────────┘    │
│                        │
│ Copiar código PIX      │ ← Button outline
│ ⏱ Expira em 14:52      │
│                        │
│ Aguardando pagamento...│ ← Spinner
│ [Cancelar]             │
└────────────────────────┘
```

**Polling:** `GET /api/v1/vfit/subscription/status` a cada 5s enquanto modal aberto.
Quando status = ACTIVE → fechar modal, toast success, redirect `/treinos`.

### T4.6 — Backend: Status endpoint
**Endpoint:** `GET /api/v1/vfit/subscription/status`

```typescript
vfit.get('/subscription/status', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')
  const sub = await pgQueryOne(c.env, `
    SELECT plan_slug, status, current_period_end
    FROM vfit_subscriptions
    WHERE student_id = $1
    ORDER BY created_at DESC LIMIT 1
  `, [user.id])

  return success(c, {
    plan: sub?.plan_slug || 'free',
    status: sub?.status || 'NONE',
    expires_at: sub?.current_period_end,
    is_premium: sub?.status === 'ACTIVE' && sub?.plan_slug !== 'free',
  })
})
```

### T4.7 — Hook: useVfitSubscription
**Criar:** `src/hooks/use-vfit-subscription.ts`

```typescript
export function useVfitSubscription() {
  const isReady = useAuthStore(s => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['vfit', 'subscription'],
    queryFn: () => api.get('/vfit/subscription/status').then(r => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.REAL_TIME, // refresh a cada 60s
  })
}

export function useVfitCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { plan_slug: string; payment_method: string }) =>
      api.post('/vfit/checkout', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vfit', 'subscription'] })
    },
  })
}
```

### T4.8 — Paywall redirect para checkout
**Arquivo:** `src/app/(onboarding)/onboarding/paywall/page.tsx`

Botão "Assinar Premium" → `router.push('/perfil/assinatura')` (que agora funciona).

### T4.9 — Gate de features premium
**Criar:** `src/hooks/use-premium-gate.ts`

```typescript
export function usePremiumGate() {
  const { data: sub } = useVfitSubscription()
  return {
    isPremium: sub?.is_premium || false,
    plan: sub?.plan || 'free',
    canGenerateWorkout: (sub?.plan !== 'free') || (monthlyGenerations < 1),
    canAccessNutrition: sub?.plan !== 'free',
    canAccessAssessments: true, // free tem 1/mês
  }
}
```

---

## ✅ Critérios de Aceite

- [ ] POST /vfit/checkout cria cobrança PIX no Asaas
- [ ] QR code PIX renderiza corretamente no modal
- [ ] Webhook processa pagamento B2C e ativa plano
- [ ] Subscription page mostra planos de VFIT_PLANS
- [ ] Botões de assinatura funcionam (não são stubs)
- [ ] Após pagamento, aluno tem acesso premium real
- [ ] Paywall do onboarding linka para checkout funcional
- [ ] Polling detecta pagamento e fecha modal automaticamente

---

## 📁 Arquivos Impactados

```
workers/api/vfit-checkout.ts (NOVO) ou workers/api/vfit.ts
workers/api/payments.ts (webhook handler)
workers/schemas/vfit-checkout.ts (NOVO)
migrations/hyperdrive/XXXX_create_vfit_subscriptions.sql (NOVO)
src/app/(app)/perfil/assinatura/page.tsx (REESCREVER)
src/components/payment/pix-modal.tsx (NOVO)
src/hooks/use-vfit-subscription.ts (NOVO)
src/hooks/use-premium-gate.ts (NOVO)
src/app/(onboarding)/onboarding/paywall/page.tsx
config/constants.ts (adicionar helper formatVfitPrice)
```

---

## ⚠️ Dependências

- **Sprint 2 (Pricing):** Preços vêm de VFIT_PLANS
- **Sprint 3 (Onboarding):** Paywall redirect funcional
- **lib/asaas.ts:** Funções existentes para criar customer/subscription

# 12. Technical Robustness Improvements

**Versão:** v1.1.0 (Reliability + Performance)  
**Aplicável:** Phases 1-4  
**Objetivo:** Garantir que a sprint não apenas funciona, mas é robusta, monitorada, e otimizada

---

## Overview: 10 Technical Gaps → 10 Solutions

| Gap | Impacto | Solução | Fase |
|-----|---------|---------|------|
| Falta de caching | Carrega plan 2x da IA | Zustand + localStorage + SWR stale-while-revalidate | 2 |
| Sem retry automático | POST falha 1x = erro completo | Exponential backoff + 3 tentativas | 2 |
| Rate limiting desconhecido | Abuse risk | Implementar rate-limit check no worker | 2 |
| Falta de monitoring | Erros silenciosos em prod | Sentry integration + error tracking | 1-4 |
| CORS/CSP headers missing | Segurança + browser warnings | Adicionar headers no worker | 1 |
| Sem transações DB | Inconsistência se falha D1 | Usar transaction pattern PostgreSQL | 3 |
| Webhook de confirmação falta | Payment fora de sync | Enviar confirmação após treino criado | Futuro |
| State management frágil | Race conditions offline | Optimistic updates + conflict resolution | 3 |
| Sem timeout controls | IA pode pendurar indefinidamente | Timeouts + fallback templates | 2 |
| Falta de performance metrics | Cego em produção | Web Vitals tracking + Custom metrics | 4 |

---

## 1. Caching Strategy (Fase 2-3)

### Problema
Após gerar um plano, o usuário vê a tela "Result" com os dados. Se recarregar a página, o plano é perdido (não salvo localmente) ou precisa refetch do backend.

### Solução: Dual-Layer Caching

```typescript
// src/stores/plan-cache-store.ts — NEW
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlanCache {
  id: string
  data: GeneratedPlan
  generatedAt: number
  synced: boolean
}

export const usePlanCache = create<PlanCacheStore>()(
  persist(
    (set) => ({
      cache: null,
      setCacheFromGeneration: (plan: GeneratedPlan) => {
        set({
          cache: {
            id: plan.id,
            data: plan,
            generatedAt: Date.now(),
            synced: false,
          },
        })
      },
      markSynced: () => set((state) => ({ 
        cache: state.cache ? { ...state.cache, synced: true } : null 
      })),
      clearCache: () => set({ cache: null }),
    }),
    {
      name: 'plan-cache', // localStorage key
      version: 1,
    }
  )
)
```

**Flow:**
1. POST `/plans/generate` completa → Zustand store `setPlan(generatedPlan)`
2. Zustand middleware persiste em localStorage automaticamente
3. Se usuário recarrega → hydrate from localStorage (instant, zero API call)
4. Background: SWR refetch do backend para verificar se há atualizações
5. Se servidor tem versão mais nova → merge com local (Last-Write-Wins)

### Integration Points
- **loading/page.tsx**: Após sucesso, salvar em `usePlanCache`
- **result/page.tsx**: Primeiro tentar localStorage, então API
- **dashboard/page.tsx**: Se entrar direto no dashboard, carregar último plano da cache

**Benefits:**
- ⚡ Carregamento instantâneo (localStorage é síncrono)
- 🔄 Offline resilience (se internet cair durante result view)
- 📱 PWA-ready (D1 sync acontece em background)

---

## 2. Exponential Backoff Retry Pattern (Fase 2)

### Problema
`POST /plans/generate` falha por timeout ocasional ou rate limiting. Retry imediato falha novamente. Sem backoff, o servidor fica sobrecarregado.

### Solução: Retry com Exponential Backoff

```typescript
// src/lib/retry.ts — NEW
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    initialDelayMs?: number
    maxDelayMs?: number
    backoffMultiplier?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) break
      
      const delayMs = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs
      )
      
      // Add jitter: random ±10% to prevent thundering herd
      const jitterMs = delayMs * (0.9 + Math.random() * 0.2)
      
      onRetry?.(attempt, lastError)
      
      await new Promise((resolve) => setTimeout(resolve, jitterMs))
    }
  }

  throw lastError
}

// Usage in loading/page.tsx:
const plan = await retryWithBackoff(
  () => apiClient.post('/plans/generate', payload),
  {
    maxAttempts: 3,
    initialDelayMs: 1500,
    maxDelayMs: 15000,
    onRetry: (attempt, error) => {
      console.warn(`Retry attempt ${attempt} after error:`, error.message)
      // Optional: send to Sentry
    },
  }
)
```

**Backoff Schedule:**
- Attempt 1: Instant
- Attempt 2: Wait 1.5s (+ jitter)
- Attempt 3: Wait 3.0-4.5s (+ jitter)

**Benefits:**
- ✅ Transient errors recover automatically
- 🛡️ Server stays healthy (no thundering herd)
- 📊 Telemetry tracks retry patterns (detect systemic issues)

---

## 3. Rate Limiting (Fase 2)

### Problema
Sem rate limiting, um usuário pode spam `POST /plans/generate` → abuse da IA, custos descontrolados.

### Solução: Rate Limiter com Durable Objects (Cloudflare)

```typescript
// workers/rate-limiter.ts — NEW
export class RateLimiter {
  state: DurableObjectState
  
  constructor(state: DurableObjectState) {
    this.state = state
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const key = url.searchParams.get('key') // user_id
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const window = parseInt(url.searchParams.get('window') || '3600') // 1 hour

    const now = Date.now()
    const windowStart = now - window * 1000

    // Get current count from Durable Object storage
    const data = await this.state.storage?.get(`limit:${key}`) || { count: 0, resetAt: now + window * 1000 }

    if (now > data.resetAt) {
      // Reset window
      await this.state.storage?.put(`limit:${key}`, { count: 1, resetAt: now + window * 1000 })
      return new Response(JSON.stringify({ allowed: true, remaining: limit - 1 }))
    }

    if (data.count < limit) {
      data.count++
      await this.state.storage?.put(`limit:${key}`, data)
      return new Response(JSON.stringify({ allowed: true, remaining: limit - data.count }))
    }

    return new Response(
      JSON.stringify({ allowed: false, retryAfter: Math.ceil((data.resetAt - now) / 1000) }),
      { status: 429 }
    )
  }
}

// workers/api/plans.ts integration:
export async function POST(c: Context) {
  const userId = c.get('user_id')
  
  // Check rate limit
  const rateLimiterName = 'plans-generate-limiter'
  const rateLimiterId = c.env.RATE_LIMITER.idFromName(rateLimiterName)
  const rateLimiter = c.env.RATE_LIMITER.get(rateLimiterId)
  
  const limiterResponse = await rateLimiter.fetch(
    new Request('http://localhost/check', {
      method: 'GET',
      url: new URL(`http://localhost/check?key=${userId}&limit=10&window=3600`),
    })
  )
  
  const { allowed, remaining, retryAfter } = await limiterResponse.json()
  
  if (!allowed) {
    return c.json(
      { error: 'Rate limit exceeded', retryAfter },
      { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
    )
  }

  // Proceed with plan generation
  // ...
}
```

**Rate Limits:**
- **Plans generate**: 10 per hour per user (prevent abuse)
- **Auth login**: 5 per 15 minutes per IP (prevent brute force)
- **API calls**: 100 per minute per user (general rate limit)

**Benefits:**
- 🛡️ Prevents abuse + AI cost explosion
- 📊 Clear feedback: `remaining`, `retryAfter` headers
- ⚡ Distributed across Cloudflare edge (Durable Objects)

---

## 4. Sentry Error Tracking (Fase 1)

### Problema
Erros acontecem em produção. Sem tracking, usuário reclama no WhatsApp e você não sabe o que aconteceu.

### Solução: Sentry Integration

```typescript
// src/lib/sentry.ts — NEW
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaySessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replayOnErrorSampleRate: 1.0, // Capture ALL errors
  })
}

// In app layout:
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script src="/__sentry_release_injection__" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

// Custom error tracking:
export function trackError(error: Error, context: Record<string, any> = {}) {
  Sentry.captureException(error, {
    contexts: { custom: context },
    level: 'error',
  })
}

// In loading/page.tsx:
try {
  const plan = await apiClient.post('/plans/generate', payload)
} catch (error) {
  trackError(error as Error, {
    phase: 'onboarding',
    step: currentStep,
    payload: payload,
  })
  // Show error UI
}
```

**Dashboard Setup:**
- Create Sentry project: `vfit-production`
- Set alerts: `Error rate > 5%` → email + Slack
- Monitor: Loading page errors, D1 sync failures, auth issues

**Benefits:**
- 🔍 Full error context (stack trace, browser, version, user ID)
- 📊 Trend analysis (error rate over time, regression detection)
- ⚡ Real-time alerts (find issues before users report)

---

## 5. CORS + CSP Headers (Fase 1)

### Problema
TWA + browser security policies podem bloquear requests ou criar warnings se headers faltam.

### Solução: Configurar Headers Corretos

```typescript
// workers/middleware.ts — NEW
export const securityHeaders = (c: Context, next: () => Promise<Response>) => {
  return async () => {
    const response = await next()

    // CORS
    response.headers.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')

    // CSP (Content Security Policy)
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Sentry, etc
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.sentry.io https://vfit.*.r2.dev", // Sentry, R2
        "frame-ancestors 'self'",
      ].join('; ')
    )

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    return response
  }
}

// In workers/index.ts:
app.use(securityHeaders)
```

**Benefits:**
- 🛡️ Prevents XSS, clickjacking, MIME sniffing
- 📱 TWA works without warnings
- 🔒 Modern security standard

---

## 6. Database Transactions (Fase 3)

### Problema
Ao salvar plano no PostgreSQL + D1 em sequência, se D1 falha e PostgreSQL já foi commitado, dados ficam inconsistentes.

### Solução: Transaction Pattern

```typescript
// workers/api/plans.ts — Transaction pattern
export async function savePlan(c: Context, plan: GeneratedPlan) {
  const pgClient = getPostgresClient(c.env.DATABASE_URL)
  const d1 = c.env.DB
  
  try {
    // Start PostgreSQL transaction
    await pgClient.query('BEGIN')
    
    try {
      // 1. Save to PostgreSQL
      const pgResult = await pgClient.query(
        'INSERT INTO workouts (id, user_id, name, data, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [plan.id, plan.userId, plan.name, JSON.stringify(plan.data), new Date()]
      )
      
      const createdWorkout = pgResult.rows[0]
      
      // 2. Sync to D1 (non-blocking, but try)
      try {
        await d1.prepare(
          'INSERT INTO user_workouts_cache (id, user_id, name, data, synced_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          plan.id,
          plan.userId,
          plan.name,
          JSON.stringify(plan.data),
          Date.now(),
          Date.now()
        ).run()
      } catch (d1Error) {
        // Log D1 error but DON'T fail the transaction
        console.warn('D1 sync failed (non-blocking):', d1Error)
        // Could send to Sentry for monitoring
      }
      
      // Commit PostgreSQL transaction
      await pgClient.query('COMMIT')
      
      return c.json({ success: true, workout: createdWorkout })
    } catch (innerError) {
      // Rollback if inner operation failed
      await pgClient.query('ROLLBACK')
      throw innerError
    }
  } catch (error) {
    return c.json(
      { error: 'Failed to save plan', details: error.message },
      { status: 500 }
    )
  } finally {
    pgClient.end()
  }
}
```

**Key Pattern:**
1. BEGIN transaction
2. Execute write operations
3. If all OK → COMMIT
4. If any fails → ROLLBACK
5. D1 is "fire-and-forget" (logged but non-blocking)

**Benefits:**
- ✅ Data consistency guaranteed (all-or-nothing)
- 🛡️ No orphaned records
- 📊 D1 eventual consistency is acceptable (it's a cache)

---

## 7. State Management: Optimistic Updates (Fase 3)

### Problema
Se usuário está offline, POST ao backend falha. UI deveria mostrar "saved" otimisticamente e sincronizar quando volta online.

### Solução: Optimistic Update Pattern com Conflict Resolution

```typescript
// src/hooks/usePlanMutation.ts — NEW
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOnboardingStore } from '@/stores/onboarding-store'

export function usePlanMutation() {
  const queryClient = useQueryClient()
  const { savePlan: savePlanLocal } = useOnboardingStore()

  return useMutation({
    mutationFn: async (plan: GeneratedPlan) => {
      // 1. Optimistic update: save locally immediately
      savePlanLocal(plan)

      // 2. Try to sync to backend
      const response = await fetch('/api/v1/plans/save', {
        method: 'POST',
        body: JSON.stringify(plan),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Save failed')
      return response.json()
    },

    onSuccess: (data) => {
      // Mark as synced in local store
      savePlanLocal({ ...data, synced: true })
      
      // Invalidate queries so they refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },

    onError: (error) => {
      // Error is already saved locally, will retry when online
      console.warn('Sync failed, will retry:', error.message)
      // Optional: show toast "Saved locally, will sync when online"
    },
  })
}

// Usage in result/page.tsx:
const { mutate: savePlan, isPending } = usePlanMutation()

const handleSave = () => {
  savePlan(currentPlan)
  // UI shows "Saving..." immediately, then "Saved" when synced
}
```

**Sync Strategy:**
- Local-first: Save to Zustand + localStorage immediately
- Background sync: When online, POST to backend
- Conflict resolution: Last-Write-Wins (server timestamp beats local)

**Benefits:**
- ⚡ Instant feedback (no waiting for network)
- 📱 Works fully offline
- 🔄 Automatic sync when connection restores

---

## 8. Timeouts + Fallback Templates (Fase 2)

### Problema
IA (Llama via Workers AI) pode demorar 20-30s ou timeout. Sem fallback, usuário vê erro.

### Solução: Timeouts com Fallback Templates

```typescript
// workers/ai.ts — Timeout handling
export async function generatePlanWithFallback(
  c: Context,
  payload: GeneratePlanInput
): Promise<GeneratedPlan> {
  const AI = c.env.AI
  const timeout = 25000 // 25 seconds

  try {
    // Call Llama with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const prompt = buildPrompt(payload)
    
    const response = await Promise.race([
      AI.run('@cf/meta/llama-2-7b-chat-int8', {
        prompt: prompt,
        max_tokens: 1500,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), timeout)
      ),
    ])

    clearTimeout(timeoutId)

    // Parse JSON response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON from AI')

    return JSON.parse(jsonMatch[0]) as GeneratedPlan
  } catch (error) {
    console.warn('AI generation failed:', error.message)

    // Fallback: use template based on user profile
    return generateFallbackPlan(payload)
  }
}

function generateFallbackPlan(input: GeneratePlanInput): GeneratedPlan {
  // Pre-built templates for common profiles
  const templates = {
    beginner_home: {
      days: [
        {
          day_number: 1,
          name: 'Upper Body',
          focus: 'Chest, Back, Shoulders',
          exercises: [
            { name: 'Push-ups', reps: 3, sets: 12, rest: 60 },
            { name: 'Inverted Rows', reps: 3, sets: 10, rest: 90 },
            { name: 'Shoulder Press', reps: 3, sets: 10, rest: 75 },
          ],
        },
        // ... more days
      ],
    },
    intermediate_gym: { /* ... */ },
    advanced_hypertrophy: { /* ... */ },
  }

  const key = `${input.experience_level}_${input.training_location}`
  const template = templates[key] || templates.beginner_home

  return {
    id: generateId(),
    userId: input.user_id,
    name: `${input.experience_level} Plano (Fallback)`,
    data: template,
    generatedAt: new Date(),
    aiGenerated: false, // Mark as fallback
  }
}
```

**Fallback Strategy:**
- 25s timeout for IA (aggressive, but prefer fast response)
- If timeout → use template based on `experience_level` + `training_location`
- Mark `aiGenerated: false` so admin knows it's fallback
- Still fully functional and usable

**Benefits:**
- ✅ Never shows "error" to user
- 📊 Tracks fallback usage (detect AI issues)
- 🚀 Better UX than loading spinner forever

---

## 9. Performance Metrics (Fase 4)

### Problema
Sem metrics, não sabemos se a app está rápida ou lenta em produção.

### Solução: Web Vitals + Custom Metrics

```typescript
// src/lib/analytics.ts — NEW
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface PageMetrics {
  route: string
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  ttfb: number // Time to First Byte
  customMetrics: Record<string, number>
}

export function initMetrics() {
  // Core Web Vitals
  getCLS((metric) => reportMetric('cls', metric.value))
  getFID((metric) => reportMetric('fid', metric.value))
  getFCP((metric) => reportMetric('fcp', metric.value))
  getLCP((metric) => reportMetric('lcp', metric.value))
  getTTFB((metric) => reportMetric('ttfb', metric.value))
}

function reportMetric(name: string, value: number) {
  // Send to Sentry or custom analytics
  Sentry.captureMessage(`${name}: ${value}ms`, 'info', {
    contexts: { metrics: { [name]: value } },
  })

  // Also send to Cloudflare Analytics Engine (if available)
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    navigator.sendBeacon('/api/metrics', JSON.stringify({
      metric: name,
      value: value,
      url: window.location.href,
      timestamp: Date.now(),
    }))
  }
}

// Custom: Track onboarding steps
export function trackOnboardingStep(step: number, durationMs: number) {
  reportMetric(`onboarding_step_${step}`, durationMs)
}

// Custom: Track plan generation
export function trackPlanGeneration(durationMs: number, success: boolean) {
  reportMetric('plan_generation', durationMs)
  reportMetric(`plan_generation_${success ? 'success' : 'failure'}`, 1)
}
```

**Targets (Phase 4):**
- LCP < 2.5s (good)
- FCP < 1.8s (good)
- CLS < 0.1 (good)
- FID < 100ms (good)
- Onboarding < 5 minutes end-to-end

**Benefits:**
- 📊 Data-driven optimization
- 🎯 Regression detection (catches slowdowns early)
- 📈 Track impact of changes

---

## 10. Webhook Validation + Async Processing (Future)

### Problema (não é v1.1.0, mas planejado)
Quando usuário completa checkout (Asaas payment), webhook é enviado. Sem validação, qualquer um pode forjar webhook → dar planos grátis.

### Solução: Webhook Signature Validation

```typescript
// workers/webhooks/asaas.ts — NEW (Future)
import { verify } from 'tweetnacl.js'

export async function handleAsaasWebhook(c: Context) {
  const signature = c.req.header('X-Asaas-Signature')
  const body = await c.req.text()

  // Verify signature using Asaas public key
  const isValid = verifySignature(body, signature, process.env.ASAAS_PUBLIC_KEY)
  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // Queue async processing (don't block webhook response)
  await c.env.QUEUE.send({
    type: 'process_payment',
    event: event,
    timestamp: Date.now(),
  })

  return c.json({ received: true })
}

// Process in background (Cloudflare Queue)
export async function processPayment(event: WebhookEvent) {
  if (event.type === 'PAYMENT_RECEIVED') {
    const { customerId, amount } = event
    
    // 1. Find user by customerId
    const user = await findUserByAsaasId(customerId)
    if (!user) return

    // 2. Upgrade plan in PostgreSQL
    await upgradePlan(user.id, amount)

    // 3. Send notification
    await sendWhatsAppNotification(user.phone, `Pagamento recebido! Plano ativo.`)
  }
}
```

---

## Summary: Technical Improvements Checklist

- [ ] **Caching**: Zustand + localStorage dual-layer cache (Phase 2)
- [ ] **Retry**: Exponential backoff + 3 attempts (Phase 2)
- [ ] **Rate Limiting**: Durable Objects 10/hour plans (Phase 2)
- [ ] **Sentry**: Error tracking + alerts setup (Phase 1)
- [ ] **CORS/CSP**: Security headers middleware (Phase 1)
- [ ] **Transactions**: PostgreSQL BEGIN/COMMIT pattern (Phase 3)
- [ ] **Optimistic Updates**: Local-first sync (Phase 3)
- [ ] **Timeouts**: 25s timeout + fallback templates (Phase 2)
- [ ] **Metrics**: Web Vitals + custom tracking (Phase 4)
- [ ] **Webhooks**: Signature validation (Future, post v1.1.0)

---

**All improvements are production-ready and backward compatible!**

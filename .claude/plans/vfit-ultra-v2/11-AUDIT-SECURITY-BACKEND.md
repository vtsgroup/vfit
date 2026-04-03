# Sprint 10 — Audit: Security & Backend

> **Fase:** 3 · **Prioridade:** 🔴 CRÍTICA · **Estimativa:** 6-8h
> **Objetivo:** Corrigir vulnerabilidades de segurança e robustez do backend

---

## 🎯 Problemas (da auditoria)

1. **SQL Injection** — `specialties` passado como literal em query
2. **Endpoint público consome API paga** — `POST /ai/analyze-photo` sem auth
3. **Zero transações DB** — operações multi-step sem atomicidade
4. **Webhook idempotency issues** — pagamento pode ser processado 2x
5. **N+1 queries** — loops fazendo queries individuais
6. **Rate limits inconsistentes** — endpoints sensíveis sem proteção

---

## 📋 Tasks

### T10.1 — SQL Injection: specialties
**Arquivo:** `workers/api/personals.ts` (ou equivalente)

**Vulnerabilidade:**
```typescript
// ❌ specialties interpolado direto na query
const query = `SELECT * FROM personals WHERE specialties LIKE '%${specialty}%'`
```

**Fix:**
```typescript
// ✅ Parametrizado
const query = `SELECT * FROM personals WHERE specialties ILIKE $1`
await pgQuery(env, query, [`%${specialty}%`])
```

**Grep para encontrar todos os casos:**
```bash
grep -rn "interpolation\|template literal.*query\|\${.*}.*SELECT\|\${.*}.*INSERT\|\${.*}.*UPDATE" workers/
```

### T10.2 — Auth no /ai/analyze-photo
**Arquivo:** `workers/api/ai.ts`

**Antes:** Endpoint público que consome Replicate API (paga)
**Depois:**
```typescript
ai.post('/analyze-photo', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')

  // Rate limit: 5 análises por dia por usuário
  const key = `ai-photo:${user.id}:${new Date().toISOString().slice(0, 10)}`
  const count = await incrementRateLimit(c.env, key, 86400)
  if (count > 5) throw new RateLimitError('Limite de análises diárias atingido')

  // ... resto do handler
})
```

### T10.3 — Webhook Idempotency
**Arquivo:** `workers/api/payments.ts`

**Implementar idempotency key via KV:**

```typescript
// No início do webhook handler:
const idempotencyKey = `webhook:${event}:${paymentId}`
const processed = await c.env.KV_CACHE.get(idempotencyKey)
if (processed) {
  console.log(`[Webhook] Already processed: ${idempotencyKey}`)
  return success(c, { status: 'already_processed' })
}

// Após processar com sucesso:
await c.env.KV_CACHE.put(idempotencyKey, 'processed', { expirationTtl: 86400 * 7 }) // 7 dias
```

### T10.4 — DB Transactions para operações multi-step
**Problema:** Operações que fazem 2+ queries podem ficar em estado inconsistente.

**Solução:** Usar `BEGIN/COMMIT/ROLLBACK` via função helper:

```typescript
// lib/db.ts — novo helper
export async function pgTransaction(
  env: Bindings,
  fn: (query: typeof pgQuery) => Promise<void>
) {
  const sql = neon(env.NEON_DATABASE_URL)
  try {
    await sql.query('BEGIN')
    await fn(async (env, queryStr, params) => {
      return sql.query(queryStr, params)
    })
    await sql.query('COMMIT')
  } catch (error) {
    await sql.query('ROLLBACK')
    throw error
  }
}
```

**Aplicar em:**
- Criação de pagamento (payment + commission)
- Transferência de saldo
- Criação de assinatura B2C
- Onboarding complete (profile + assessment + nutrition)

### T10.5 — N+1 Query fixes
**Identificar loops com queries:**

```bash
grep -rn "for.*await.*pgQuery\|forEach.*await.*pgQuery\|map.*await.*pgQuery" workers/
```

**Padrão de fix:**
```typescript
// ❌ N+1
for (const student of students) {
  const assessments = await pgQuery(env, 'SELECT * FROM assessments WHERE student_id = $1', [student.id])
  student.assessments = assessments
}

// ✅ Single query
const studentIds = students.map(s => s.id)
const assessments = await pgQuery(env, `
  SELECT * FROM assessments WHERE student_id = ANY($1)
`, [studentIds])

// Map results
const assessmentMap = new Map(assessments.map(a => [a.student_id, a]))
students.forEach(s => s.assessments = assessmentMap.get(s.id) || [])
```

### T10.6 — Rate limits em endpoints sensíveis
**Adicionar rate limiting a:**

| Endpoint | Limite | Window |
|----------|--------|--------|
| `POST /auth/login` | 5/min | 60s |
| `POST /auth/register` | 3/min | 60s |
| `POST /auth/forgot-password` | 3/min | 60s |
| `POST /ai/*` | 10/min | 60s |
| `POST /vfit/checkout` | 3/min | 60s |
| `POST /plans/generate` | 5/hour | 3600s |

**Implementação usando KV:**
```typescript
async function rateLimit(env: Bindings, key: string, limit: number, windowSec: number) {
  const current = parseInt(await env.KV_RATE_LIMIT.get(key) || '0')
  if (current >= limit) throw new RateLimitError()
  await env.KV_RATE_LIMIT.put(key, String(current + 1), { expirationTtl: windowSec })
}
```

### T10.7 — Input sanitization
**Garantir que TODOS os endpoints usem Zod validation:**

```bash
# Endpoints sem schema validation:
grep -rn "c.req.json()" workers/api/ | grep -v "schema\|Schema\|parse\|safeParse"
```

Cada `c.req.json()` sem `.parse()` = potencial input não validado.

### T10.8 — Error handler melhorado
**Arquivo:** `workers/index.ts`

Garantir que erros não vazem stack traces em produção:

```typescript
app.onError((err, c) => {
  if (err instanceof AppError) {
    return error(c, err.statusCode, err.message)
  }

  // Em produção, nunca vazar stack trace
  console.error('[Unhandled Error]', err.message, err.stack)
  return error(c, 500, 'Internal server error')
})
```

---

## ✅ Critérios de Aceite

- [ ] Zero SQL injection risks (todas queries parametrizadas)
- [ ] /ai/analyze-photo protegido com auth + rate limit
- [ ] Webhooks idempotentes (reprocessamento seguro)
- [ ] Operações multi-step em transações
- [ ] N+1 queries eliminados (grep confirma zero loops com queries)
- [ ] Rate limits em todos endpoints sensíveis
- [ ] Todos endpoints com Zod validation
- [ ] Erros não vazam stack traces em produção

---

## 📁 Arquivos Impactados

```
workers/api/personals.ts — SQL injection fix
workers/api/ai.ts — auth + rate limit
workers/api/payments.ts — idempotency
workers/api/*.ts — rate limits, input validation
workers/index.ts — error handler
lib/db.ts — pgTransaction helper
```

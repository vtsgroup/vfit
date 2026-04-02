# 📋 Plano Executivo — VFIT

> Atualizado em 17/02/2026 — 8/10 fases concluídas + 3 Sprints + 2 Hotfixes

---

## 📊 Status Atual do Projeto

### Números

| Métrica | Valor |
|---|---|
| Backend (Workers) | ~12.000 linhas TypeScript |
| Frontend (Next.js) | ~120 arquivos, 47 páginas + 5 layouts |
| Endpoints backend | ~145 (16 sub-routers) |
| Tabelas PostgreSQL | 24 (inclui chat, passkeys, asaas_customers) |
| Tabelas D1 | 5 (cold data) |
| Hooks frontend | 71+ (TanStack Query) |
| Componentes React | ~64 |
| Testes Vitest | 133 (9 arquivos, 100% passing) |
| Fases concluídas | 8/10 (1, 2, 3, 4, 5, 7, 8, 9) |

### URLs em Produção

| Serviço | URL | Status |
|---|---|---|
| 🌐 **Frontend** | https://iapersonal.app.br | ✅ Online |
| 🌐 **Frontend (fallback)** | https://personal-ia-prod.pages.dev | ✅ Online |
| ⚡ **Backend API** | https://api.iapersonal.app.br | ✅ Online |
| 🩺 **Health Check** | https://api.iapersonal.app.br/health | ✅ Healthy |
| 💪 **Exercícios** | https://api.iapersonal.app.br/api/v1/exercises | ✅ 79 exercícios |
| 🏋️ **Muscle Groups** | https://api.iapersonal.app.br/api/v1/muscle-groups | ✅ 14 grupos |

### ✅ O que funciona AGORA

- ✅ **Registro de Personal Trainer** — Cria conta real no PostgreSQL
- ✅ **Login** — Retorna JWT tokens (access + refresh)
- ✅ **Dashboard autenticado** — Stats, alunos, pagamentos
- ✅ **Endpoint /me** — Retorna perfil completo do usuário
- ✅ **Rotas D1** — Exercícios, muscle groups, templates, series types, equipment types
- ✅ **CORS** — Configurado para `iapersonal.app.br` e `personal-ia-prod.pages.dev`
- ✅ **Turnstile** — **Produção** (bypass removido 14/02/2026)
- ✅ **Modo demo** — Fallback automático quando backend offline + recovery 30s
- ✅ **Chat** — Polling-based (7 endpoints, 7 hooks, 5 componentes)
- ✅ **Passkey/WebAuthn** — Login biométrico (7 endpoints)
- ✅ **OAuth Google** — Login social
- ✅ **Testes** — 133 testes Vitest (9 arquivos)

### Conta de Teste (Real)

| Campo | Valor |
|---|---|
| **Email** | `<test_user_email>` |
| **Senha** | `<test_user_password>` |
| **Tipo** | Personal Trainer |
| **CREF** | `123456-G/SP` |
| **Referral Code** | `SF9BGN4L` |
| **Plano** | Trial (expira 21/02/2026) |

### Contas Demo (Mock — para quando backend offline)

| Tipo | Email | Senha |
|---|---|---|
| Personal | `personal@teste.com` | `teste123` |
| Aluno | `aluno@teste.com` | `teste123` |

> ⚠️ Contas demo só funcionam no modo offline (mock). Para login real use credenciais de teste do secret manager.

---

## 🏗️ Infraestrutura

### Cloudflare Workers (Backend)

| Recurso | Binding | Status |
|---|---|---|
| D1 Database | `DB` (vfiti-exercises) | ✅ Operacional |
| KV Cache | `KV_CACHE` | ✅ Operacional |
| KV Sessions | `KV_SESSIONS` | ✅ Operacional |
| KV Rate Limit | `KV_RATE_LIMIT` | ✅ Operacional |
| R2 Videos | `R2_VIDEOS` | ✅ Binding OK |
| R2 Images | `R2_IMAGES` | ✅ Binding OK |
| Analytics | `ANALYTICS` | ✅ Binding OK |

### Secrets Configurados no Worker

| Secret | Status | Nota |
|---|---|---|
| `JWT_SECRET` | ✅ Configurado | Random 256-bit |
| `JWT_REFRESH_SECRET` | ✅ Configurado | Random 256-bit |
| `TURNSTILE_SECRET_KEY` | ✅ **Produção** | Real key (bypass removido 14/02) |
| `NEON_DATABASE_URL` | ✅ Configurado | PostgreSQL São Paulo (HTTP, sem Hyperdrive) |
| `ASAAS_API_KEY` | ✅ **Produção** | Prefixo `$aact_` (pagamentos reais!) |
| `ASAAS_WEBHOOK_TOKEN` | ✅ Configurado | Token forte 64 hex chars |
| `STRIPE_SECRET_KEY` | ✅ Configurado | Gateway secundário |
| `RESEND_API_KEY` | ✅ Configurado | Email transacional |
| `ONESIGNAL_APP_ID` | ✅ Configurado | Push notifications |
| `ONESIGNAL_REST_API_KEY` | ✅ Configurado | Push notifications |
| `GOOGLE_CLIENT_ID` | ✅ Configurado | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | ✅ Configurado | OAuth Google |
| `REPLICATE_API_TOKEN` | ✅ Configurado | IA (Replicate) |

### Neon PostgreSQL

| Propriedade | Valor |
|---|---|
| **Região** | AWS São Paulo (sa-east-1) |
| **Versão** | PostgreSQL 17 |
| **Endpoint** | `ep-dark-cherry-acytzooy-pooler.sa-east-1.aws.neon.tech` |
| **Database** | `neondb` |
| **Tabelas** | 24 criadas via psql + scripts/run-migration-neon.mjs |
| **Migrations** | 7 (0001–0007) |
| **Plano** | Free (0.5 GB) |

### Tabelas PostgreSQL (24)

```
users, personals, students, workouts, workout_exercises, workout_logs,
assessments, student_badges, payments, affiliates, referrals,
affiliate_commissions, personal_reviews, workout_plans, plan_purchases,
notifications, personal_settings, payment_subscriptions, pix_transfers,
asaas_customers, ai_usage_logs, conversations, messages, user_passkeys
```

---

## 🔧 Fixes Críticos Aplicados (sessão 06/02)

### 1. `sql()` → `sql.query()` (lib/db.ts)
O driver `@neondatabase/serverless` retorna uma tagged template function.
Chamadas convencionais **devem** usar `.query()`:
```typescript
// ❌ ERRADO — throws "can only be called as tagged-template"
const rows = await sql(query, params)
// ✅ CORRETO
const rows = await sql.query(query, params)
```

### 2. CORS — iapersonal.app.br (workers/middleware/cors.ts)
Domínio customizado adicionado à lista de origens permitidas.

### 3. Turnstile Secret Key — Produção
- **Site Key** (frontend): `0x4AAAAAACbwFTxZJC74DsMB` (real, hardcoded em `turnstile.tsx`)
- **Secret Key** (backend): configurado via `wrangler secret put TURNSTILE_SECRET_KEY` (real)
- **⚠️ Bypass `XXXX.DUMMY.TOKEN.XXXX` REMOVIDO em 14/02/2026**
- Para testes curl, usar token real do widget

### 4. Dashboard 401 — hooks auth-aware (use-dashboard.ts)
React Query hooks disparavam antes do Zustand reidratar do localStorage.
Fix: `enabled: isAuthenticated && isHydrated` em todos os hooks.

### 5. Frontend token extraction (use-auth.ts)
Backend retorna `data.tokens.access_token` — frontend alinhado com essa estrutura.

---

## 🎯 Próximos Passos

### FASE 6 — Workers Paid + Queues/Crons ($5/mês) 🟡

- [ ] Ativar plano pago no Cloudflare dashboard
- [ ] Descomentar bindings no `wrangler.toml` (Queues, Crons)
- [ ] Ativar email queue (consumer já existe)
- [ ] Ativar 4 cron triggers
- [ ] Migrar `neon()` → `Pool` e reativar Hyperdrive

### FASE 10 — Testes, CI/CD, Monitoramento 🟢

- [ ] Expandir Vitest (133 → 200+ testes)
- [ ] Playwright E2E (fluxo completo registro → treino → cobrança)
- [ ] GitHub Actions (lint → build → test → deploy)
- [ ] Sentry error tracking
- [ ] Uptime monitor (BetterStack)

### Manutenção Imediata

- [ ] Atualizar webhook token no painel Asaas → Configurações → Webhooks
- [ ] Responsividade mobile refinada (375px–1920px)
- [ ] Skeleton loading em todas as telas

---

## 🔧 Comandos Úteis

```bash
# === DEPLOY ===
npx wrangler deploy --env=""                                      # Backend Worker
npm run build && npx wrangler pages deploy out --project-name=personal-ia-prod  # Frontend

# === DEBUG ===
npx wrangler tail --format=pretty                                 # Logs em tempo real
npx wrangler secret list                                          # Listar secrets

# === BANCO ===
/opt/homebrew/opt/libpq/bin/psql "$NEON_DATABASE_URL"

# === TESTES CURL ===
# Registro
curl -s -X POST "https://api.iapersonal.app.br/api/v1/auth/register/personal" \
  -H "Content-Type: application/json" \
  -d '{"email":"<novo_email>","password":"<password>","full_name":"Nome","cpf":"000.000.000-00","cref":"000000-G/SP","cref_state":"SP","turnstile_token":"<turnstile_token_real>"}'

# Login
curl -s -X POST "https://api.iapersonal.app.br/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<test_user_email>","password":"<test_user_password>","turnstile_token":"<turnstile_token_real>"}'

# Request autenticado (substituir TOKEN)
curl -s "https://api.iapersonal.app.br/api/v1/auth/me" \
  -H "Authorization: Bearer TOKEN"

# Health
curl -s "https://api.iapersonal.app.br/health" | python3 -m json.tool

# === BACKUP ===
node scripts/cf-backup.js
node scripts/cf-deploy.js
```

---

## 📁 Arquitetura de Código

### Backend (workers/)

```
workers/
├── index.ts          # Hono router principal, error handler, crons, queues
├── types.ts          # Bindings, AppContext, JWTPayload
├── api/
│   ├── auth.ts       # Login, registro, refresh, /me (833 linhas)
│   ├── oauth.ts      # Google/Facebook OAuth
│   ├── personals.ts  # Profile, settings, stats, /public/:slug
│   ├── students.ts   # CRUD alunos, convites, badges
│   ├── workouts.ts   # Treinos, exercícios, logs
│   ├── assessments.ts # Avaliações físicas
│   ├── payments.ts   # Cobranças, stats, webhooks
│   ├── reviews.ts    # Avaliações de personais
│   ├── notifications.ts # CRUD notificações
│   ├── affiliates.ts # Programa de afiliados
│   └── ai.ts         # Geração de treinos IA
└── middleware/
    ├── auth.ts       # JWT verify, requireType, optionalAuth
    ├── cors.ts       # Origens permitidas
    ├── rate-limit.ts # Rate limiting via KV
    ├── analytics.ts  # Analytics Engine
    └── request-id.ts # X-Request-Id header
```

### Frontend (src/)

```
src/
├── app/
│   ├── layout.tsx          # Root layout, providers
│   ├── page.tsx            # Landing page
│   ├── (auth)/             # Login, registro, forgot/reset password
│   └── dashboard/          # 26 páginas protegidas
│       ├── page.tsx        # Dashboard home (stats + AuthGuard)
│       ├── students/       # Alunos (CRUD)
│       ├── workouts/       # Treinos (CRUD + create)
│       ├── assessments/    # Avaliações (CRUD + create)
│       ├── payments/       # Financeiro (CRUD + create)
│       ├── affiliates/     # Afiliados
│       ├── notifications/  # Notificações
│       ├── settings/       # Configurações
│       └── ai/             # IA (geração de treinos)
├── components/             # ~40 componentes React
├── hooks/                  # TanStack Query hooks (auth-aware)
├── stores/                 # Zustand (auth, app)
└── lib/                    # api-client, mock-api, utils
```

### Libs compartilhadas (lib/)

```
lib/
├── db.ts             # pgQuery via sql.query() (Neon), d1 helpers
├── auth-helpers.ts   # JWT sign/verify (Web Crypto API)
├── email.ts          # Queue-based email (graceful degrade)
├── errors.ts         # AppError, NotFoundError, etc.
├── response.ts       # success(), error(), paginated()
├── turnstile.ts      # Cloudflare Turnstile verify
└── version.ts        # APP_VERSION
```

---

## 📝 Notas Técnicas Importantes

### Neon Driver (@neondatabase/serverless)
- **SEMPRE** usar `sql.query(string, params[])` para chamadas convencionais
- A função `sql` é uma tagged template — `sql(string, params)` NÃO funciona
- Connection string usa endpoint `-pooler` (PgBouncer)

### Zustand Persist + React Query
- Zustand reidrata do localStorage de forma assíncrona
- Hooks React Query **devem** ter `enabled: isAuthenticated && isHydrated`
- Sem isso, requests disparam sem token → 401

### Turnstile Test Keys (Cloudflare)
- Site Key (frontend): `1x00000000000000000000AA` (20 zeros + AA)
- Secret Key (backend): `1x0000000000000000000000000000000AA` (31 zeros + AA)
- Dummy token para curl: `XXXX.DUMMY.TOKEN.XXXX`

### Free Plan Limitations
- ❌ Queues (não pode criar)
- ❌ Crons (excedeu limite de 5)
- ❌ Hyperdrive (precisa de config real)
- ❌ `cpu_ms` (só plano pago)
- Todos desabilitados no `wrangler.toml` e no código

### Email (Resend) — Status atual
- Envio **direto** no endpoint de convite (sem Queue), adequado para baixo volume.
- `RESEND_API_KEY` configurada e `EMAIL_FROM` usando o padrão de teste do Resend.
- Quando houver domínio final, ajustar `EMAIL_FROM` e o link base do convite.
- Para escala: reativar Queue e consumer assíncrono.

### psql Local
```bash
/opt/homebrew/opt/libpq/bin/psql "$NEON_DATABASE_URL"
```

---

## ✅ Checklist de Produção

- [x] Frontend deployed (CF Pages)
- [x] Backend deployed (CF Workers)
- [x] D1 Database com seed data (79 exercícios, 14 grupos)
- [x] KV Namespaces (cache, sessions, rate limit)
- [x] R2 Buckets (videos, images)
- [x] JWT Secrets configurados
- [x] Neon PostgreSQL (20 tabelas, São Paulo)
- [x] Registro de personal trainer
- [x] Login com JWT tokens
- [x] Dashboard autenticado sem 401
- [x] CORS para domínio customizado
- [x] Turnstile (produção ✅)
- [x] Modo demo funcional + recovery automático 30s
- [x] Documentação backend (~145 endpoints)
- [x] OneSignal + Push Notifications (FASE 1)
- [x] Triggers automáticos em 7 endpoints (FASE 2)
- [x] Dashboard Pro com Recharts (FASE 3)
- [x] Treino interativo + gamificação (FASE 4)
- [x] LGPD compliant + termos + cookies (FASE 8)
- [x] Asaas produção — pagamentos reais (FASE 5)
- [x] Chat polling-based + push notifications (FASE 7)
- [x] SEO completo + JSON-LD + GA4 + Security Headers (FASE 9)
- [x] Passkey/WebAuthn (7 endpoints) + OAuth Google
- [x] Testes Vitest — 133 testes, 9 arquivos (Sprint 2-3)
- [ ] Migrar neon() → Pool para Hyperdrive TCP
- [ ] Queues (plano pago $5/mês)
- [ ] Crons (plano pago $5/mês)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Sentry error tracking

### ✅ Integrations Status
- [x] Asaas ✅ **Produção** (pagamentos reais, webhooks configurados)
- [x] Stripe ✅ Configurado (gateway secundário)
- [x] Replicate ✅ Token ativo (IA)
- [x] OAuth Google ✅ Ativo
- [x] OneSignal ✅ Ativo (push + in-app)
- [x] Turnstile ✅ Produção (bypass removido)
- [ ] Atualizar webhook token no painel Asaas (token forte configurado no Worker)

---

## 📚 Documentação Adicional

| Documento | Conteúdo |
|---|---|
| [docs/BACKEND.md](BACKEND.md) | 109 endpoints, schemas, bindings |
| [docs/CF-OPERATIONS.md](CF-OPERATIONS.md) | Scripts backup/deploy |
| [docs/INFRAESTRUTURA-CF.md](INFRAESTRUTURA-CF.md) | Recursos Cloudflare |
| [docs/DEPLOY.md](DEPLOY.md) | Guia de deploy |
| [DOCUMENTACAO-MVP.md](../DOCUMENTACAO-MVP.md) | Documentação original (21 LOTEs) |

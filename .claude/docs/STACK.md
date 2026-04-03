# Stack & Infraestrutura — VFIT

> **v1.0.2** · SaaS para Personal Trainers · Atualizado: 02/04/2026

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 15 (App Router, static export) + Tailwind CSS v4 + Zustand 5 + TanStack Query 5 |
| **Backend** | Hono.js v4 no Cloudflare Workers |
| **DB principal** | Neon PostgreSQL 17 (26 tabelas) via Hyperdrive (`lib/db.ts`) |
| **DB exercícios** | Cloudflare D1 (`vfit-exercises`, 5 tabelas cold data) |
| **Cache/sessão** | Cloudflare KV (`vfit-sessions`, `vfit-cache`, `vfit-rate-limit`) |
| **Mídia** | R2 (vídeos ≤10MB, imagens, PDFs) + CF Stream (vídeos >30s, HLS) + CF Image Resizing |
| **Pagamentos** | Asaas (PIX/boleto/cartão) + Stripe |
| **E-mail** | Resend via `lib/email-resend.ts` |
| **Push** | OneSignal via `lib/onesignal.ts` |
| **IA** | Replicate API + CF Workers AI (Llama) |
| **Analytics** | GA4 + CF Analytics Engine |

---

## Mapa Rápido

| Pergunta | Resposta |
|----------|---------|
| Onde está a API? | `workers/api/*.ts` (17 sub-routers, ~150 endpoints) |
| Onde está o router principal? | `workers/index.ts` |
| Onde ficam os schemas Zod? | `workers/schemas/*.ts` |
| Onde ficam os hooks React Query? | `src/hooks/use-*.ts` (76 hooks) |
| Onde está o auth? | Backend: `workers/api/auth.ts` · Frontend: `src/stores/auth-store.ts` |
| Onde está o API client? | `src/lib/api-client.ts` |
| Onde ficam as páginas? | `src/app/` (48 pages + 5 layouts) |
| Onde está o DB helper? | `lib/db.ts` → `pgQuery`, `pgQueryOne`, `pgQueryCount`, `generateId` |
| Onde está o payment? | `workers/api/payments.ts` (~2200 linhas, 22 endpoints) |
| Onde está o chat? | Backend: `workers/api/chat.ts` · Frontend: `src/components/chat/` |
| Onde estão as migrations? | `migrations/hyperdrive/*.sql` (9 arquivos) |
| Onde está o deploy script? | `scripts/cf-deploy.js` → `npm run cf:deploy` |
| Onde estão os testes? | `tests/` (133 unit tests, Vitest) |
| Onde está o manifest PWA? | `public/manifest.json` + `public/sw.js` |
| Onde está o TWA? | `twa/` (build pipeline, keystore, scripts) · `docs/TWA-DOCUMENTATION.md` |
| Onde está o assetlinks? | `public/.well-known/assetlinks.json` |
| Onde estão as constantes? | `config/constants.ts` (PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL) |
| Onde está a estratégia de mídia? | `docs/MEDIA-STRATEGY.md` |

---

## URLs & Credenciais

| Item | Valor |
|------|-------|
| **Frontend** | `https://iapersonal.app.br` (fallback: `vfit.pages.dev`) |
| **Backend API** | `https://api.iapersonal.app.br` (fallback: `vfit-api.vd-b0b.workers.dev`) |
| **GitHub** | `https://github.com/vtsgroup/vfit` |
| **CF Account ID** | `b0bf95d0fabb322ac3df37bd84ec0c77` |
| **GA4** | `G-XGXZ4R6JXH` |
| **OneSignal App** | `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` |
| **Turnstile Site Key** | `0x4AAAAAACbwFTxZJC74DsMB` |
| **Neon DB** | `NEON_DATABASE_URL` (via secret manager) |
| **psql local** | `/opt/homebrew/opt/libpq/bin/psql "CONNECTION_STRING"` |

### Contas Admin

| Role | Email | Senha |
|------|-------|-------|
| super_admin | (definir no secret manager) | (definir no secret manager) |
| admin | (definir no secret manager) | (definir no secret manager) |
| personal (teste) | (definir no secret manager) | (definir no secret manager) |

---

## Arquitetura Resumida

```
Request → CF Workers → requestId → CORS → secureHeaders → rateLimit → authMiddleware(JWT) → Route Handler → Zod → Business Logic → pgQuery/d1Query → success/created/paginated
```

- Access token: 1h TTL (HMAC-SHA256 Web Crypto) · Refresh: 30d · Sessions: KV
- Passwords: bcryptjs cost 12
- API Client: auto-prefix `/api/v1`, token refresh deduplicado, demo mode fallback

---

## Estrutura de Pastas

```
src/
├── app/dashboard/{rota}/   # Pages Next.js
├── components/ui/          # Design System v2 (ÚNICA fonte de componentes base)
├── components/{domínio}/   # Componentes de feature
├── hooks/                  # Data fetching (TanStack Query)
├── stores/                 # Estado global: auth-store.ts, app-store.ts
└── lib/                    # Utilities frontend

workers/
├── index.ts                # Hono app entry point
├── api/{rota}.ts           # Route handlers (um arquivo por domínio)
├── middleware/             # auth.ts, cors.ts, rate-limit.ts
└── schemas/                # Zod schemas de validação

lib/                        # Código compartilhado worker (db, email, cache)
config/                     # Constantes, planos, equipamentos
scripts/                    # Scripts operacionais (deploy, migrações)
migrations/                 # SQL migrations (hyperdrive/ + d1/)
docs/                       # Documentação detalhada
```

---

## Migração Recente (02/04/2026)

| Item | Antes (legacy) | Agora (produção) |
|------|----------------|-------------------|
| **GitHub Repo** | `victor-development/personal-ia` | **`vtsgroup/vfit`** |
| **Workspace** | `personal-ia-prod/` | **`vfit-production/`** |
| **CF Worker** | `personal-ia-api` | **`vfit-api`** |
| **CF Pages** | `personal-ia-prod` | **`vfit`** |
| **D1 Database** | `personaliai-exercises` | **`vfit-exercises`** |
| **KV Namespaces** | `personaliai-*` | **`vfit-*`** |
| **R2 Bucket** | `personaliai-media` | **`vfit-media`** |
| **Package name** | `personal-ia` | **`vfit`** |

**O que NÃO mudou:** Domínios (`iapersonal.app.br`), Neon DB, CF Account, funcionalidades.

> Ver `.claude/docs/MIGRATION-CONTEXT.md` para detalhes completos.

---

## Docs Detalhados (Referência)

| Doc | Conteúdo |
|-----|----------|
| `docs/BACKEND.md` | Todos os ~150 endpoints, tabelas de rotas completas |
| `docs/DESIGN-SYSTEM-COLORS.md` | Paleta completa, contrastes WCAG |
| `docs/ASAAS-INTEGRATION.md` | API Asaas completa, webhooks |
| `docs/INFRAESTRUTURA-CF.md` | Bindings, secrets, IDs CF completos |
| `docs/CF-OPERATIONS.md` | Deploy, backup, scripts |
| `docs/MEDIA-STRATEGY.md` | R2 vs Stream vs Images vs Pages |
| `docs/PWA-MEGA-PLAN.md` | Service Worker, manifest, offline |
| `docs/TWA-DOCUMENTATION.md` | TWA completo: keystore, SHA-256, Play Store |
| `docs/CHANGELOG.md` | Histórico de deploys e mudanças |
| `docs/WHATSAPP-GATEWAY.md` | Gateway WhatsApp completo |
| `docs/INDEX.md` | Índice completo de toda documentação |

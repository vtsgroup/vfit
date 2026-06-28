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
| Onde está o TWA? | `twa/` (build pipeline, keystore, scripts) · `.claude/docs/TWA-DOCUMENTATION.md` |
| Onde está o assetlinks? | `public/.well-known/assetlinks.json` |
| Onde estão as constantes? | `config/constants.ts` (PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL) |
| Onde está a estratégia de mídia? | `.claude/docs/MEDIA-STRATEGY.md` |

---

## URLs & Credenciais

| Item | Valor |
|------|-------|
| **Frontend** | `https://vfit.app.br` (fallback: `vfit.pages.dev`) |
| **Backend API** | `https://api.vfit.app.br` (fallback: `vfit-api.vd-b0b.workers.dev`) |
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
.claude/docs/               # Documentação detalhada
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

**O que NÃO mudou:** Domínios (`vfit.app.br`), Neon DB, CF Account, funcionalidades.

> Migração concluída. Detalhes históricos em `.claude/docs/archive/`.

---

## Docs Detalhados (Referência)

| Doc | Conteúdo |
|-----|----------|
| `.claude/docs/BACKEND.md` | Todos os ~150 endpoints, tabelas de rotas completas |
| `.claude/docs/DESIGN-SYSTEM.md` | Paleta completa, contrastes WCAG, componentes |
| `.claude/docs/ASAAS-INTEGRATION.md` | API Asaas completa, webhooks |
| `.claude/docs/STACK.md` | Bindings, secrets, IDs CF, infraestrutura |
| `.claude/docs/DEPLOY.md` | Deploy, backup, scripts, operações |
| `.claude/docs/MEDIA-STRATEGY.md` | R2 vs Stream vs Images vs Pages |
| `.claude/docs/PWA-MEGA-PLAN.md` | Service Worker, manifest, offline |
| `.claude/docs/TWA-DOCUMENTATION.md` | TWA completo: keystore, SHA-256, Play Store |
| `.claude/docs/CHANGELOG.md` | Histórico de deploys e mudanças |
| `.claude/docs/WHATSAPP-GATEWAY.md` | Gateway WhatsApp completo |
| `.claude/docs/INDEX.md` | Índice completo de toda documentação |
# 🔑 INFRAESTRUTURA CLOUDFLARE - IDs & Recursos

> ⚠️ Este arquivo contém IDs de produção. NÃO commitar secrets/tokens.
> Última atualização: 2026-02-22

---

## 📋 Conta Cloudflare

| Campo | Valor |
|-------|-------|
| **Account Name** | victor.pt @ vts dev |
| **Account ID** | `b0bf95d0fabb322ac3df37bd84ec0c77` |
| **Email** | vts@victor.pt |
| **Auth Method** | OAuth Token (via `wrangler login`) |

---

## 🗄️ D1 Database (Cold Data)

| Campo | Valor |
|-------|-------|
| **Name** | `vfiti-exercises` |
| **Database ID** | `988c03d5-bf9a-4394-b65a-adebbe0b87e4` |
| **Region** | ENAM (Eastern North America) |
| **Binding** | `DB` |
| **Uso** | Exercise library, templates, muscle groups, series types |

---

## 📦 KV Namespaces

### KV_CACHE (Cache geral)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_CACHE` |
| **ID** | `e7147f8855184a4a8f72307756596df4` |
| **Binding** | `KV_CACHE` |
| **Uso** | Cache de dados, profiles, exercises |

### KV_SESSIONS (Sessões de auth)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_SESSIONS` |
| **ID** | `91d34b6725564de39e8ed891e742e76d` |
| **Binding** | `KV_SESSIONS` |
| **Uso** | JWT sessions, refresh tokens, TTL 24h |

### KV_RATE_LIMIT (Rate limiting)
| Campo | Valor |
|-------|-------|
| **Title** | `KV_RATE_LIMIT` |
| **ID** | `d94c62b1e8f248a6bd1ea6a11e18f09c` |
| **Binding** | `KV_RATE_LIMIT` |
| **Uso** | Contadores de rate limit por IP/rota |

---

## 🪣 R2 Buckets

### R2_VIDEOS
| Campo | Valor |
|-------|-------|
| **Bucket Name** | `vfit-videos` |
| **Binding** | `R2_VIDEOS` |
| **Custom Domain** | `videos.vfit.app.br` |
| **Storage Class** | Standard |
| **Uso** | Vídeos de exercícios (vertical 9:16 + horizontal 16:9) |

### R2_IMAGES
| Campo | Valor |
|-------|-------|
| **Bucket Name** | `vfit-images` |
| **Binding** | `R2_IMAGES` |
| **Custom Domain** | `images.vfit.app.br` |
| **Storage Class** | Standard |
| **Uso** | Fotos de avaliações, profile photos, logos, PDFs |

---

## 📮 Queues (a criar quando deploy do Worker)

| Queue | Binding | Uso |
|-------|---------|-----|
| `vfiti-email-sender` | `EMAIL_QUEUE` | Envio de emails |
| `vfiti-video-encoder` | `VIDEO_ENCODE_QUEUE` | Encoding de vídeos |
| `vfiti-pdf-generator` | `PDF_QUEUE` | Geração de PDFs |
| `vfiti-ai-batch` | `AI_QUEUE` | Batch de requests IA |

> ⚠️ Queues são criados automaticamente no primeiro deploy do Worker.

---

## 🔗 Hyperdrive

| Campo | Valor |
|-------|-------|
| **Name** | `vfiti-db` |
| **Binding** | `HYPERDRIVE` |
| **Connection** | PostgreSQL via Neon |
| **Status** | ⚠️ **Configurado mas BYPASSED** |
| **Motivo** | `neon()` HTTP driver é incompatível com Hyperdrive TCP (causa HTTP 530 error 1016) |
| **Solução atual** | `lib/db.ts` usa `NEON_DATABASE_URL` diretamente (HTTP) |
| **Solução futura** | Migrar de `neon()` para `Pool` de `@neondatabase/serverless` (suporta TCP) |

> ⚠️ Hyperdrive está comentado no `wrangler.toml`. Reativar somente após migrar para `Pool`.

---

## 📊 Analytics Engine

| Campo | Valor |
|-------|-------|
| **Binding** | `ANALYTICS` |
| **Uso** | Tracking de eventos (AI usage, payments, workouts) |

> Auto-criado no primeiro deploy do Worker.

---

## 🔐 Secrets (todos ✅ configurados via `wrangler secret put`)

| Secret | Status | Descrição |
|--------|--------|-----------|
| `JWT_SECRET` | ✅ Configurado | Chave para assinar JWT access tokens (HMAC-SHA256) |
| `JWT_REFRESH_SECRET` | ✅ Configurado | Chave para refresh tokens |
| `NEON_DATABASE_URL` | ✅ Configurado | Connection string PostgreSQL Neon (sa-east-1) |
| `ASAAS_API_KEY` | ✅ **Produção** | API key Asaas (prefixo `$aact_` = produção, `$aact_hmlg_` = sandbox) |
| `ASAAS_WEBHOOK_TOKEN` | ✅ Configurado | Token forte (64 hex chars) para validar webhooks |
| `STRIPE_SECRET_KEY` | ✅ Configurado | Gateway de pagamento secundário |
| `REPLICATE_API_TOKEN` | ✅ Configurado | Token da API Replicate (IA) |
| `RESEND_API_KEY` | ✅ Configurado | Email transacional via Resend |
| `ONESIGNAL_APP_ID` | ✅ Configurado | `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` |
| `ONESIGNAL_REST_API_KEY` | ✅ Configurado | REST API key OneSignal (push) |
| `TURNSTILE_SECRET_KEY` | ✅ **Produção** | Cloudflare Turnstile captcha (bypass REMOVIDO 14/02/2026) |
| `GOOGLE_CLIENT_ID` | ✅ Configurado | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | ✅ Configurado | OAuth Google |

> ℹ️ Total: **13 secrets** configurados. Facebook OAuth removido (não implementado).

---

## 🌐 Domínios

| Domínio | Serviço | Status |
|---------|---------|--------|
| `vfit.app.br` | Cloudflare Pages (frontend) | ✅ Ativo |
| `vfit.pages.dev` | Cloudflare Pages (fallback) | ✅ Ativo |
| `vfiti-api.vd-b0b.workers.dev` | Cloudflare Workers (backend fallback) | ✅ Ativo |
| `api.vfit.app.br` | Custom domain Workers (backend) | ✅ Ativo |
| `videos.vfit.app.br` | R2 Public Access (vídeos) | ⬜ Pendente |
| `images.vfit.app.br` | R2 Public Access (imagens) | ⬜ Pendente |
| `stream.vfit.app.br` | CF Stream (video adaptive) | ⬜ Futuro (Sprint E) |

---

## 📹 Cloudflare Stream (Futuro — Sprint E)

| Campo | Valor |
|-------|-------|
| **Status** | ⬜ A configurar |
| **Uso** | Vídeos de exercícios >30s com adaptive bitrate (HLS/DASH) |
| **Pricing** | $5/1000 min storage + $1/1000 min viewed |
| **Setup** | Dashboard > Stream > Enable + criar API token |
| **Secret** | `CF_STREAM_API_TOKEN` (a criar) |

> Vídeos curtos (≤30s, ≤10MB) ficam em R2. Stream só para vídeos longos que precisam de qualidade adaptativa.

---

## 🖼️ Cloudflare Image Transformations (ATIVO)

| Campo | Valor |
|-------|-------|
| **Status** | ✅ **Enabled** na zona `vfit.app.br` (Dashboard > Images > Transformations) |
| **Como o app usa** | Loader custom do `next/image` → `src/lib/cf-image-loader.ts` (`next.config.ts`: `images.loader: 'custom'`). Gera `srcset` multi-largura real **mesmo com `output: 'export'`**. |
| **URL Pattern** | `vfit.app.br/cdn-cgi/image/width=N,quality=75,format=auto/<source>` |
| **Escopo (transforma)** | same-zone: estáticos de `vfit.app.br` (ex. `/blog/*.webp`) **+ R2 `images.vfit.app.br`** (uploads do dashboard, on-the-fly em runtime) |
| **Pass-through (NÃO toca)** | SVG, `data:`/`blob:`, URLs já `/cdn-cgi/image/`, e origens externas (`replicate.delivery`, `googleusercontent.com`, `fbcdn.net`) — a CF só redimensiona same-zone por padrão |
| **Fora de escopo** | Vídeos = CF Stream / `videos.vfit.app.br` (produto separado, já adaptativo) |
| **Pricing** | Free tier 5.000 transformations únicas/mês; depois $0.50/1000 |

> ⚠️ **NÃO reativar `images.unoptimized: true`** no `next.config.ts`: no Next 15.5 ele é OR'd em toda `<Image>` e zera o `srcSet`, desligando o resize globalmente. O loader custom **exige** o guard de SVG (com loader custom o caso `.svg → unoptimized` do Next não se aplica).

## ⚡ Auditoria de Performance da Zona (Free) — 2026-06-28

Zone `vfit.app.br` = `f1821903ed0a96fe7aa4b681073ed617` · plano **Free** · auditado via Global API.
**Free está no teto de performance** — já ligados: Brotli, Early Hints (103), HTTP/2+3, 0-RTT, TLS 1.3+0RTT (min 1.3), SSL strict, Speed Brain, cache aggressive, browser TTL 8d, Always Online, WebSockets, Opportunistic Encryption, Auto-HTTPS-Rewrites.
- **OFF por design (manter):** Rocket Loader (quebra React/Next), Email Obfuscation (re-ligar = React #418), Auto-Minify (depreciado, Next já minifica).
- **Bloqueado no Free (`editable=false`) → ligar quando assinar o Pro:** **Polish** (Lossy + WebP/AVIF, cobre imagens fora do `next/image`: OG, `<img>` cru) + **Mirage** (low-qual-first em mobile lento). Flip via API: `PATCH /zones/{id}/settings/polish` `{value:"lossy"}` e `/settings/mirage` `{value:"on"}`.

> Headers de segurança/perf (CSP, HSTS, XFO, Permissions-Policy, `Link:` preconnect) vivem em **`public/_headers`** (autoritativo, versionado, deploy via Pages). **Nunca** setar via Global API — config no repo sobrevive a redeploys e bate com o docs-gate.

> Estratégia completa: ver `.claude/docs/MEDIA-STRATEGY.md`

---

## 📝 Comandos Úteis

### Revogar token Wrangler sem exposição

> Procedimento padrão quando houver suspeita de vazamento de credencial.

```bash
# 1) Encerrar sessão local (pode retornar erro se já estiver deslogado)
npx wrangler logout || true

# 2) Apagar credencial local antiga
rm -f ~/.wrangler/config/default.toml

# 3) Fazer login novamente (manual, via browser OAuth)
npx wrangler login

# 4) Validar autenticação sem imprimir token
npx wrangler whoami
```

Regras rápidas:
- Nunca usar `cat ~/.wrangler/config/default.toml` em terminal/log compartilhado.
- Nunca exportar token (`export CF_TOKEN=...`) em shell persistente.
- Nunca logar header `Authorization`.

```bash
# Verificar conta
npx wrangler whoami

# Listar recursos
npx wrangler d1 list
npx wrangler kv namespace list
npx wrangler r2 bucket list

# Aplicar migrations D1
npx wrangler d1 execute vfiti-exercises --remote --file=migrations/d1/0001_initial_schema.sql

# Criar Hyperdrive (quando tiver Neon)
npx wrangler hyperdrive create vfiti-db --connection-string="$NEON_DATABASE_URL"

# Configurar secrets
npx wrangler secret put JWT_SECRET
npx wrangler secret put REPLICATE_API_TOKEN

# Deploy
npx wrangler deploy
```

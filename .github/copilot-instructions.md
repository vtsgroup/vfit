# VFIT — Copilot Instructions

> **AUTO-GENERATED** — NÃO editar diretamente.
> Fonte: `.claude/docs/*.md` · Script: `scripts/sync-ai-docs.mjs`
> Para editar, modifique os arquivos em `.claude/docs/` e execute:
> ```bash
> node scripts/sync-ai-docs.mjs
> ```

---

# Cost Optimization — GitHub Copilot

> **Seção exclusiva para GitHub Copilot.** Claude Code não precisa desta seção.
> Princípio central: Modelos com multiplicador `0×` são ilimitados em planos pagos.

---

## Modelos Zero-Cost (Multiplier `0×`)

| Modelo | Disponível em | Ideal para |
|--------|--------------|------------|
| **GPT-5 mini** | Free · Pro · Pro+ | 90% das tarefas diárias · padrão de fallback |
| **GPT-4.1** | Free · Pro · Pro+ | Código controlado · edições simples |
| **Raptor mini** *(preview)* | Free · Pro · Pro+ | Completions inline · boilerplate |

---

## Hierarquia de Multiplicadores

| Tier | `×` | Modelos |
|------|:---:|---------|
| 🟢 ZERO | `0×` | GPT-5 mini · GPT-4.1 · Raptor mini |
| 🟡 Ultra-baixo | `0.25×` | Grok Code Fast 1 |
| 🟡 Baixo | `0.33×` | Claude Haiku 4.5 · Gemini 3 Flash · GPT-5.1-Codex-Mini |
| 🔵 Padrão | `1×` | Claude Sonnet 4/4.5/4.6 · Gemini 2.5/3/3.1 Pro · GPT-5.1/5.2/5.3-Codex |
| 🔴 Caro | `3×` | Claude Opus 4.5 · Claude Opus 4.6 |
| ⛔ Proibido | `30×` | Claude Opus 4.6 Fast Mode (Pro+ only) |

---

## Decisão por Tipo de Tarefa

| Tarefa | Modelo | `×` |
|--------|--------|:---:|
| Perguntas sobre docs · "onde está X?" | GPT-5 mini | `0×` |
| Explicações conceituais · debugging simples | GPT-5 mini | `0×` |
| Edições CSS · texto · ajustes isolados | GPT-4.1 | `0×` |
| Completions inline · boilerplate | Raptor mini | `0×` |
| Análise de UI · imagens · diagramas | Gemini 3 Flash | `0.33×` |
| Debugging com stack trace claro | Claude Haiku 4.5 | `0.33×` |
| Agentic tasks longas · automações | Grok Code Fast 1 | `0.25×` |
| Refatoração 1–4 arquivos | Claude Sonnet 4.5 / GPT-5.2-Codex | `1×` |
| Features novas · 5–10 arquivos | Claude Sonnet 4.6 / GPT-5.3-Codex | `1×` |
| Raciocínio multi-arquivo (10+) · migrations | Claude Opus 4.6 | `3×` |
| Debug crítico sem contexto | Claude Opus 4.6 | `3×` |

---

## Regras de Economia

**NUNCA use Opus para:** perguntas conceituais, consultas de docs, CSS, ajustes de texto

**Reserve Opus apenas para:** refatorações multi-arquivo (5+), features complexas, migrations, debugging sem contexto

### Checklist Antes de Modelos Premium

- "Qual arquivo / componente exato?"
- "A resposta já está em `.claude/docs/`?"
- "GPT-5 mini já tentou e falhou?"
- "O erro tem stack trace legível?"

> Se qualquer resposta for "sim" → use `0×` ou `0.33×` primeiro.

---

## Planos

| Plano | Preço | Premium Requests | Modelos |
|-------|------:|:----------------:|---------|
| **Free** | $0 | 50/mês | Haiku 4.5 · GPT-4.1 · GPT-5 mini · Raptor mini |
| **Pro** | $10/mês | 300/mês | Todos exceto Opus Fast Mode |
| **Pro+** | $39/mês | 1.500/mês | TODOS incluindo Opus Fast Mode |

> Requests `0×` **não consomem** o limite de premium requests.

---

# Regras Críticas — VFIT

> **NÃO VIOLAR** — Estas regras existem por bugs reais encontrados em produção.
> Qualquer violação pode causar 401s, dados errados, deploy quebrado ou pagamentos incorretos.

---

## 1. Neon Driver — SEMPRE `.query()`

```typescript
// ❌ await sql(query, params)     → tagged template, não aceita (string, params)
// ✅ await sql.query(query, params)
```

---

## 2. React Query — AUTH GUARD OBRIGATÓRIO em todo useQuery

```typescript
// ❌ return useQuery({ queryKey: ['x'], queryFn: ... })  → 401 antes de hidratar
// ✅ SEMPRE:
const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
return useQuery({ queryKey: ['x'], queryFn: ..., enabled: isReady })
// Com ID: enabled: isReady && !!id
// Com polling: refetchInterval: isReady ? 60_000 : false
```

> Sem guard → Zustand não hidratou → request sem token → 401 → demo mode ativado silenciosamente.

---

## 3. TypeScript Dual Config

- `tsconfig.json` → Editor IntelliSense (lib/, workers/, src/)
- `tsconfig.workers.json` → Wrangler build (só lib/, workers/, config/)
- `next.config.ts` → `ignoreBuildErrors: true` (workers/lib não passam pelo Next build)

---

## 4. Turnstile — Bypass REMOVIDO

- Dummy token `XXXX.DUMMY.TOKEN.XXXX` **não funciona** desde 14/02/2026
- Para testes curl: use token real ou desative no CF dashboard

---

## 5. Asaas — PRODUÇÃO ATIVA

- `lib/asaas.ts` detecta sandbox vs prod pelo prefixo da API key
- **⚠️ Pagamentos reais!** `$aact_xxx` = produção

---

## 6. OneSignal — sempre best-effort

```typescript
await notifyPaymentReceived(c.env, { ... }).catch(() => {})  // nunca falhar o endpoint principal
```

---

## 7. Pagamentos — net_amount do Asaas

```typescript
// ❌ netAmount = amount - platformFee                    → platformFee é 0%, errado
// ✅ netAmount = asaasPayment.netValue                   → valor real creditado
// ❌ netAmount = amount - platformFee - commissionAmount  → comissão é custo da PLATAFORMA
// ✅ commission_amount salvo para tracking, NÃO subtrai do net_amount
```

---

## 8. Demo Mode — recovery automático

- Backend offline → demo mode (mock data) → retry /health a cada 30s → auto-recovery
- UI: `DemoModeBanner` exibe aviso amarelo fixo

---

## 9. Schema PostgreSQL — Colunas corretas

```
❌ personals.user_id / students.user_id    → ✅ personals.id = users.id (same PK)
❌ u.avatar_url                            → ✅ u.profile_photo_url
❌ a.weight / a.height                     → ✅ a.weight_kg / a.height_cm
❌ a.body_fat                              → ✅ a.body_fat_percentage
❌ slug                                    → ✅ public_url_slug
❌ plan_type / plan_expires_at             → ✅ subscription_plan / subscription_expires_at
❌ billing_type / fail_reason              → ✅ payment_method / failed_reason
❌ read (boolean)                          → ✅ read_at (timestamptz)
```

---

## 10. Auth Store Types

```typescript
type UserType = 'personal' | 'student' | 'admin'  // user.user_type
type Role = 'user' | 'admin' | 'super_admin'       // user.role
// ❌ user.type → ✅ user.user_type
// ❌ user_type === 'super_admin' → ✅ role === 'super_admin'
```

---

## 11. Smoke Auth — OBRIGATÓRIO no QA/deploy gate

- Para qualquer bloco de QA final, go/no-go ou preparação de deploy: executar `npm run smoke:auth:local`
- `SMOKE_PERSONAL_TOKEN` + `SMOKE_STUDENT_TOKEN` devem estar válidos no `.env.local`
- Evidência obrigatória em `.claude/docs/archive/legacy-plans/AUTH-SMOKE.generated.md`
- Se houver `failed` no smoke autenticado: **deploy bloqueado** até correção

---

## 12. Tailwind CSS v4 — Sintaxe Canônica OBRIGATÓRIA

**Gradientes:**
```
❌ bg-gradient-to-r   → ✅ bg-linear-to-r
❌ bg-gradient-to-b   → ✅ bg-linear-to-b
```

**Opacidade — NUNCA bracket notation:**
```
❌ bg-white/[0.06]    → ✅ bg-white/6
❌ border-white/[0.03] → ✅ border-white/3
```

**Cores customizadas — SEMPRE alias do tema:**
```
❌ bg-[#0E1525]       → ✅ bg-kpi-dark
```

**Flexbox:**
```
❌ flex-shrink-0      → ✅ shrink-0
❌ flex-grow          → ✅ grow
```

**Tamanhos — Classes canônicas quando divisível por 4px:**
```
❌ h-[600px]          → ✅ h-150    (600/4=150)
❌ w-[800px]          → ✅ w-200    (800/4=200)
```

**Z-index — Sem brackets:**
```
❌ z-[9999]           → ✅ z-9999
```

> **Regra de grep:** `grep -rn "bg-gradient-to-" src/` antes de commit. Zero tolerância.

---

## 13. Tailwind CSS v4 — Variáveis CSS (Sintaxe Nova)

```
❌ bg-[var(--md3-surface)]        → ✅ bg-(--md3-surface)
❌ text-[var(--md3-on-surface)]   → ✅ text-(--md3-on-surface)
❌ border-[var(--md3-outline)]    → ✅ border-(--md3-outline)
```

**Background size:**
```
❌ bg-[length:200%_100%]  → ✅ bg-size-[200%_100%]
```

> **Regra de grep:** `grep -rn "\-\[var(--" src/components/ui/` deve retornar **zero** resultados.

---

## 14. Componente `<Button>` — OBRIGATÓRIO para CTAs

**SEMPRE usar `<Button>` de `@/components/ui/button` para:**
- Botões de submit/enviar (formulários, chat, geradores)
- CTAs primários (Gerar Treino, Gerar Conteúdo, Assinar)
- Botões de ação com texto (Copiar, Tentar Novamente, Deletar)

**Variantes:** `primary` (default), `secondary`, `outline`, `ghost`, `ghost-danger`, `danger`, `workout`, `assessment`, `payment`

**Tamanhos:** `sm` (h-10), `md` (h-12, default), `lg` (h-14), `icon` (h-11 w-11)

**Props especiais:** `loading` (spinner + disabled), `ripple` (default true)

**Permitido como `<button>` nativo:** Chips, tabs, toggles, dot indicators, hamburger, accordion, close X, drag handles, cards clicáveis, dropdown items.

```typescript
// ❌ NUNCA para CTAs:
<button className="rounded-xl bg-brand-primary px-6 py-3 ...">Gerar Treino</button>

// ✅ SEMPRE:
import { Button } from '@/components/ui/button'
<Button loading={isPending}><Sparkles className="h-4 w-4" />Gerar Treino</Button>
```

---

## 15. Barrel Exports (index.ts) — NOMES DEVEM COINCIDIR

- Barrel file: `src/components/ui/index.ts`
- **SEMPRE** verificar o nome exato exportado pelo arquivo-fonte antes de adicionar ao barrel
- Ao criar novo componente em `ui/`, adicionar ao barrel no mesmo PR

```typescript
// ❌ NUNCA inventar nomes: export { MD3StatusIndicator } from './md3-badge'
// ✅ SEMPRE verificar: export { MD3Badge, MD3Chip, MD3Status } from './md3-badge'
```

---

## 16. Ícones — SEMPRE DSIcon

```typescript
// ❌ import { Bell } from 'lucide-react'
// ✅ import { DSIcon } from '@/components/ui/ds-icon'
//    <DSIcon name="bell" size={20} />
```

---

## 17. Wrangler — SEMPRE ATUALIZADO

**🔴 REGRA ABSOLUTA:** Atualizar antes de qualquer deploy e no início de cada sessão:

```bash
npm install -g wrangler@latest && wrangler --version
```

**❌ NUNCA** fazer deploy com wrangler desatualizado.

---

## 18. WhatsApp Operacional — INÍCIO/FIM OBRIGATÓRIO

- Toda ação operacional deve registrar `start` e `end` no grupo WhatsApp
- Escopo: deploy, hotfix, migração, rollback, correção crítica, auditoria
- O `end` deve conter `started_at` + `ended_at` para duração
- Deploy sem WhatsApp = falha (cf-deploy.js exige, bypass só com `--allow-no-whatsapp`)

> Ver `DEPLOY.md` para detalhes do helper script e formato das mensagens.

---

## 19. Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:
1. `.claude/docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante — backend→`BACKEND.md`, migration→schema docs
3. Este arquivo — se regras mudaram

**Nunca** deploy sem documentação correspondente.

---

## 20. Documentação & Tracking — OBRIGATÓRIO

### Documentação centralizada em `.claude/docs/`
- **TODA** documentação técnica, operacional e de design DEVE estar em `.claude/docs/`
- Arquivos de referência: RULES, STACK, CONVENTIONS, DEPLOY, DESIGN-SYSTEM, BACKEND, CHANGELOG
- Documentação auxiliar/histórica → `.claude/docs/archive/`
- Após criar/editar docs, rodar `node scripts/sync-ai-docs.mjs` para atualizar `.github/copilot-instructions.md`

### Planos com Tracking obrigatório
- **TODO plano** de trabalho (sprint, feature, migration) DEVE ter um `TRACKING.md`
- Localização: `.claude/plans/<nome-do-plano>/TRACKING.md`
- Formato: checkbox list `- [x]` / `- [ ]` com ID de task (T1.1, T2.3, etc.)
- Contagem de progresso no final: `45/136 (33%)`
- Tabela de deploys com versão, sprint, data, commit, nº arquivos

### Marcar progresso em tempo real
- **ANTES** de começar uma task → marcar como `🔄 Em progresso`
- **APÓS** completar uma task → marcar como `✅ Concluído` com `[x]`
- **Se bloqueada** → marcar `❌ Bloqueado` com motivo
- **Se adiada** → marcar `⏩ Deferred → SX` com destino
- **NUNCA** deixar task sem status atualizado ao final de uma sessão
- Atualizar `Última atualização` no topo do TRACKING com versão atual

### Ao final de CADA sessão
1. Verificar que TRACKING.md reflete estado real de TODAS as tasks tocadas
2. CHANGELOG.md atualizado com versão + mudanças
3. Commit docs junto com código (ou em commit separado antes do deploy)

---

## O que NUNCA fazer

- Não commitar direto na `main`. Sempre feature branch.
- Não usar `git push --force` sem confirmação explícita.
- Não rodar `npm run cf:deploy` sem o usuário confirmar.
- Não alterar scripts em `scripts/` sem instrução explícita.
- Não rodar migrations sem planejar rollback.
- Não instalar dependências novas sem justificar.
- Não remover validações de auth/segurança existentes.
- Não ler/escrever `.env` ou `.env.local`.

---

## Prioridades

`segurança > correção > UX > performance > DX`

---

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

**O que NÃO mudou:** Domínios (`iapersonal.app.br`), Neon DB, CF Account, funcionalidades.

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
| **Bucket Name** | `personal-ia-videos` |
| **Binding** | `R2_VIDEOS` |
| **Custom Domain** | `videos.iapersonal.app.br` |
| **Storage Class** | Standard |
| **Uso** | Vídeos de exercícios (vertical 9:16 + horizontal 16:9) |

### R2_IMAGES
| Campo | Valor |
|-------|-------|
| **Bucket Name** | `personal-ia-images` |
| **Binding** | `R2_IMAGES` |
| **Custom Domain** | `images.iapersonal.app.br` |
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
| `iapersonal.app.br` | Cloudflare Pages (frontend) | ✅ Ativo |
| `vfit.pages.dev` | Cloudflare Pages (fallback) | ✅ Ativo |
| `vfiti-api.vd-b0b.workers.dev` | Cloudflare Workers (backend fallback) | ✅ Ativo |
| `api.iapersonal.app.br` | Custom domain Workers (backend) | ✅ Ativo |
| `videos.iapersonal.app.br` | R2 Public Access (vídeos) | ⬜ Pendente |
| `images.iapersonal.app.br` | R2 Public Access (imagens) | ⬜ Pendente |
| `stream.iapersonal.app.br` | CF Stream (video adaptive) | ⬜ Futuro (Sprint E) |

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

## 🖼️ Cloudflare Image Resizing (Futuro)

| Campo | Valor |
|-------|-------|
| **Status** | ⬜ A habilitar |
| **Uso** | Otimização on-the-fly de imagens R2 (resize, WebP/AVIF) |
| **URL Pattern** | `images.iapersonal.app.br/cdn-cgi/image/width=300,quality=80/path/to/image.jpg` |
| **Pricing** | $0.50/1000 transformations únicas |
| **Setup** | Dashboard > Speed > Optimization > Image Resizing > Enable |

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

---

# Convenções de Código — VFIT

> Padrões obrigatórios de código, imports, TypeScript e CSS.

---

## Imports Padrão

### Backend (Workers)

```typescript
import { pgQuery, pgQueryOne, pgQueryCount, generateId } from '@lib/db'
import { d1Query, d1QueryOne } from '@lib/db'
import { AppError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, RateLimitError } from '@lib/errors'
import { success, error, paginated, created, noContent } from '@lib/response'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext, Bindings, Variables, JWTPayload } from '@workers/types'
import { createCustomer, createPayment, getBalance, createTransfer } from '@lib/asaas'
import { notify, notifyNewWorkout, notifyPaymentReceived, notifyPaymentOverdue, notifyNewStudent } from '@lib/onesignal'
import { PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL } from '@config/constants'
```

### Frontend (Next.js)

```typescript
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
// Hooks: import { useWorkouts, useCreateWorkout } from '@/hooks/use-workouts'
```

---

## TypeScript

- **TypeScript strict**. Nunca `any` sem comentário justificando.
- **Imports**: alias `@/` para `src/`. Nunca paths relativos com `../../../`.
- **Comentários de seção**: `// ============================================` no topo de cada arquivo.
- Dual config: `tsconfig.json` (editor) vs `tsconfig.workers.json` (wrangler build).

---

## Componentes UI

- **Design System**: componentes base SEMPRE de `src/components/ui/`.
- **Ícones**: SEMPRE `<DSIcon name="..." />`. Nunca importar lucide/heroicons direto.
- **AuthGuard**: toda page de dashboard usa `<AuthGuard requiredType="personal|student">`.
- **Dados**: NUNCA fetch direto — sempre via hooks em `src/hooks/`.
- **Barrel exports**: ao criar componente em `ui/`, adicionar ao `src/components/ui/index.ts`.

---

## CSS / Tailwind v4

### Sintaxe Canônica (OBRIGATÓRIA desde v4)

```
❌ bg-gradient-to-r    → ✅ bg-linear-to-r
❌ bg-white/[0.06]     → ✅ bg-white/6
❌ bg-[var(--custom)]  → ✅ bg-(--custom)
❌ flex-shrink-0       → ✅ shrink-0
❌ flex-grow           → ✅ grow
❌ h-[600px]           → ✅ h-150 (quando divisível por 4)
❌ z-[9999]            → ✅ z-9999
❌ bg-[length:200%]    → ✅ bg-size-[200%_100%]
```

### Cores

- CSS vars `--ds-*` e classes semânticas (`brand-primary`, `text-primary`, `text-muted`)
- **Nunca** hardcode hex no JSX
- Usar aliases do tema em vez de brackets

### Grep de Validação

```bash
grep -rn "bg-gradient-to-" src/              # deve retornar zero
grep -rn "\-\[var(--" src/components/ui/      # deve retornar zero
grep -rn "className.*bg-brand-primary.*font-semibold" src/ | grep "<button"  # deve retornar zero para CTAs
```

---

## React Query — Auth Guard

```typescript
// SEMPRE em todo useQuery:
const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
return useQuery({
  queryKey: ['x'],
  queryFn: ...,
  enabled: isReady,  // ← OBRIGATÓRIO
})
// Com ID: enabled: isReady && !!id
// Com polling: refetchInterval: isReady ? 60_000 : false
```

---

## Neon Driver

```typescript
// ❌ await sql(query, params)
// ✅ await sql.query(query, params)
```

---

## Regras do Agente

1. Leia o arquivo relevante ANTES de propor mudanças.
2. Se a task envolve workers, leia o endpoint existente primeiro.
3. Para mudanças no Design System, leia `.claude/docs/DESIGN-SYSTEM.md` primeiro.
4. Planeje antes de modificar >3 arquivos simultâneos.
5. Use `multi_replace_string_in_file` para edições em batch.
6. `grep_search` com regex antes de `semantic_search`.
7. Paralelizar tools independentes na mesma chamada.
8. **Documentar SEMPRE** — toda mudança reflete em `.claude/docs/` e TRACKING.md.
9. **Tracking em tempo real** — marcar task in-progress ANTES, done DEPOIS. Nunca deixar desatualizado.
10. Ao final de sessão: CHANGELOG + TRACKING + docs relevantes DEVEM estar atualizados.

---

## Economia de Tokens

**❌ NUNCA:**
- Re-ler arquivos já lidos na conversa — o contexto persiste
- Re-explorar o projeto — `.claude/docs/` tem tudo documentado
- `semantic_search` amplo — use `grep_search` com regex preciso
- Ler arquivo inteiro — use `startLine` / `endLine`
- Edições sequenciais uma a uma — agrupe com `multi_replace_string_in_file`

**✅ SEMPRE:**
- Reutilizar contexto da conversa antes de qualquer tool call
- Confirmar escopo exato antes de abrir múltiplos arquivos
- Referenciar `.claude/docs/` sem re-ler

---

# Deploy & Operações — VFIT

> Pipeline de deploy, WhatsApp, smoke auth, manutenção.

---

## Deploy (OBRIGATÓRIO via script)

```bash
npm run cf:deploy                              # patch bump + build + deploy + git push
node scripts/cf-deploy.js patch --msg "fix X"  # com mensagem personalizada
npm run cf:deploy:minor                        # minor version
npm run cf:deploy:major                        # major version
npm run cf:deploy:dry                          # simula sem executar
# Parcial:
node scripts/cf-deploy.js patch --skip-workers --msg "frontend only"
node scripts/cf-deploy.js patch --skip-pages --msg "API only"
```

> **🔴 NUNCA** `wrangler deploy` ou `wrangler pages deploy` isolado.
> **🔴 NUNCA** `git push` sem bump de versão.

---

## Comandos Essenciais

```bash
npm run dev               # Dev frontend (Next.js)
npm run wrangler:dev      # Dev worker local
npm run lint              # ESLint
npm run type-check        # TypeScript (frontend + workers)
npm run test              # Vitest (unit)
npm run test:e2e          # Playwright (E2E)
npm run quality:ci        # Gate completo (docs + security + lint + type + test + build)
```

---

## Manutenção de Dependências

### Wrangler (CF Workers CLI)

- **🔴 OBRIGATÓRIO:** Atualizar antes de CADA deploy e no início de cada sessão:

```bash
npm install -g wrangler@latest && wrangler --version
```

- **NUNCA** fazer deploy com wrangler desatualizado — causa warnings, bugs, falhas silenciosas

### Comandos Auxiliares

```bash
# Migration Neon
NEON_DATABASE_URL="$NEON_DATABASE_URL" node scripts/run-migration-neon.mjs migrations/hyperdrive/ARQUIVO.sql

# Secrets / Logs
echo "valor" | npx wrangler secret put NOME --env=""
npx wrangler tail --format=pretty
```

---

## Smoke Auth — Gate de Deploy

- Para qualquer QA final ou go/no-go: executar `npm run smoke:auth:local`
- `SMOKE_PERSONAL_TOKEN` + `SMOKE_STUDENT_TOKEN` devem estar válidos no `.env.local`
- Evidência em `.claude/docs/archive/legacy-plans/AUTH-SMOKE.generated.md`
- Se houver `failed`: **deploy bloqueado** até correção

---

## WhatsApp Operacional — REGRA OBRIGATÓRIA

> **Documentação completa:** `.claude/docs/WHATSAPP-GATEWAY.md`

### Quando enviar (escopo)

| Ação | Exige start/end? |
|------|:----------------:|
| Deploy (cf:deploy) | ✅ Sim (automático) |
| Hotfix / Migração SQL / Rollback | ✅ Sim |
| Correção crítica em produção | ✅ Sim |
| Sprint/feature longa (30+ min) | ✅ Sim |
| Edição simples 1-2 arquivos | ❌ Não |
| Leitura/análise / Testes locais | ❌ Não |

### Como enviar — Helper Script

**SEMPRE usar** `scripts/whatsapp-task.mjs`:

```bash
# START (antes de iniciar)
node scripts/whatsapp-task.mjs start \
  --task-id "DEPLOY-2026-04-02-AM" \
  --title "Deploy v1.0.3 — descrição curta" \
  --priority "ALTA" \
  --actor "Developer Agent" \
  --why "motivo curto" \
  --expected "ganho esperado"

# END (após concluir)
node scripts/whatsapp-task.mjs end \
  --task-id "DEPLOY-2026-04-02-AM" \
  --title "Deploy v1.0.3 — descrição curta" \
  --status "success" \
  --actor "Developer Agent" \
  --deploy "v1.0.3" \
  --result "Resultado direto: frase assertiva" \
  --reason "Motivo: frase complementar" \
  --benefit "Vantagem prática: benefício direto"
```

### Atalhos npm

```bash
npm run notify:start -- --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
npm run notify:end   -- --task-id ID --title "..." --status success --result "..." --reason "..." --benefit "..."
```

### Preview (sem enviar)

```bash
node scripts/whatsapp-task.mjs preview start --task-id ID --title "..." --priority ALTA --why "..." --expected "..."
```

### Padrão do task_id

Formato: `<CONTEXTO>-<DATA>-<PERIODO>`

Exemplos: `DEPLOY-2026-04-02-AM`, `HOTFIX-AUTH-2026-04-02-PM`, `MIGRATION-USERS-2026-04-02-AM`

### Tom de comunicação

- **Menos técnico, mais executivo/objetivo**
- No fechamento: frase direta, sem rodeios
- resultado/motivo/benefício devem ser **complementares, sem repetição**
- **NÃO** incluir 🤖 ou colchetes no `--actor` (Worker adiciona automaticamente)

### Variáveis necessárias (já em `.env.local`)

```
WHATSAPP_NOTIFY_URL=https://whatsapp.iapersonal.app.br/task-notify
WHATSAPP_NOTIFY_TOKEN=<ADMIN_AUTH_TOKEN>
```

---

## Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:

1. `.claude/docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante (backend→`.claude/docs/BACKEND.md`, migration→schema docs)
3. `.claude/docs/RULES.md` — se regras mudaram
# Operações Cloudflare — VFIT

> Guia de comandos para backup, deploy e manutenção do ambiente Cloudflare.
> Atualizado em 26/02/2026

---

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run cf:backup` | Backup de D1, KV e migrations |
| `npm run cf:deploy` | Deploy completo (patch: 1.0.0 → 1.0.1) |
| `npm run cf:deploy:minor` | Deploy com bump minor (1.0.0 → 1.1.0) |
| `npm run cf:deploy:major` | Deploy com bump major (1.0.0 → 2.0.0) |
| `npm run cf:deploy:dry` | Dry-run — simula deploy sem executar |
| `npm run cf:pages` | Deploy somente Pages (sem versão) |
| `npm run wrangler:deploy` | Deploy somente Workers |
| `npm run db:migrate:d1` | Aplicar migrations D1 |
| `npm run ops:slo:baseline` | Gerar baseline SLO/SLA inicial |
| `npm run ops:load:baseline` | Executar baseline de carga (cenários públicos) |
| `npm run ops:neon:drill` | Gerar runbook/evidência de backup+restore Neon |
| `npm run ops:web:audit` | Auditoria de headers e postura web de segurança |

---

## 🗂️ cf:backup

Faz backup dos dados do Cloudflare para o diretório local `backups/`.

### O que é salvo

| Recurso | Formato | Detalhes |
|---------|---------|----------|
| **D1 Database** | JSON por tabela | Tabelas de aplicação detectadas dinamicamente no D1 remoto |
| **D1 Schema** | SQL | DDL completo (`_schema.sql`) |
| **KV Keys** | JSON | Lista de chaves de cada namespace |
| **Migrations** | SQL | Cópia dos arquivos `migrations/d1/` e `migrations/hyperdrive/` |
| **Metadados** | JSON | Versão, timestamp, IDs dos recursos |

### Uso

```bash
npm run cf:backup
```

> Observação: o backup D1 usa `--remote` para consultar o banco Cloudflare remoto.

### Estrutura de saída

```
backups/
└── 2025-02-07T14-30-00/
    ├── backup-meta.json
    ├── d1/
    │   ├── _schema.sql
    │   ├── muscle_groups.json
    │   ├── exercises.json
    │   ├── workout_templates.json
    │   ├── series_types.json
    │   └── equipment_types.json
    ├── kv/
    │   ├── KV_CACHE_keys.json
    │   ├── KV_SESSIONS_keys.json
    │   └── KV_RATE_LIMIT_keys.json
    └── migrations/
        ├── d1/
        └── hyperdrive/
```

### Recursos Cloudflare

| Recurso | Nome / ID |
|---------|-----------|
| D1 Database | `vfiti-exercises` — `988c03d5-bf9a-4394-b65a-adebbe0b87e4` |
| KV Cache | `e7147f8855184a4a8f72307756596df4` |
| KV Sessions | `91d34b6725564de39e8ed891e742e76d` |
| KV Rate Limit | `d94c62b1e8f248a6bd1ea6a11e18f09c` |
| R2 Videos | `personal-ia-videos` |
| R2 Images | `personal-ia-images` |

---

## 📈 Baseline Operacional (S97-S98)

Conjunto de comandos para gerar evidências de monitoramento, performance e continuidade.

### Execução rápida

```bash
npm run ops:slo:baseline
npm run ops:load:baseline
npm run ops:neon:drill
npm run ops:web:audit
```

### Artefatos gerados

- `.claude/docs/archive/legacy-plans/SLO-SLA-BASELINE.generated.md`
- `.claude/docs/archive/legacy-plans/LOAD-TEST-BASELINE.generated.md`
- `.claude/docs/archive/legacy-plans/NEON-BACKUP-RESTORE-DRILL.generated.md`
- `.claude/docs/archive/legacy-plans/WEB-SECURITY-AUDIT.generated.md`

### Interpretação operacional mínima

- `ops:slo:baseline`: define metas iniciais e error budget para API/Auth/Payments.
- `ops:load:baseline`: estabelece referência p50/p95/p99 para comparação futura.
- `ops:neon:drill`: formaliza trilha de restore com critérios de aceite (RTO/RPO).
- `ops:web:audit`: valida headers críticos (CSP, HSTS, CORS e hardening).

---

## 👁️ Observabilidade (S97-R2)

### Sentry — variáveis mínimas

Frontend (`.env.local`):

```bash
NEXT_PUBLIC_SENTRY_DSN=<dsn-frontend>
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_RELEASE=<version>
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
```

Worker (secret manager):

```bash
echo "<dsn-worker>" | npx wrangler secret put SENTRY_DSN_WORKER --env=""
echo "production" | npx wrangler secret put SENTRY_ENVIRONMENT --env=""
echo "<version>" | npx wrangler secret put SENTRY_RELEASE --env=""
echo "0" | npx wrangler secret put SENTRY_TRACES_SAMPLE_RATE --env=""
```

### Uptime monitor externo (runbook curto)

Monitores mínimos recomendados:

1. `https://api.iapersonal.app.br/health` (intervalo 1 min)
2. `https://iapersonal.app.br` (intervalo 1 min)

Alertas:

- Trigger: 2 falhas consecutivas
- Canal: email operacional + grupo técnico
- Escalonamento P0: indisponibilidade > 5 min

---

## 🚀 cf:deploy

Pipeline completo de deploy que executa em sequência:

```
Bump Versão → Update Files → Type Check → Lint → Build → Deploy Pages → Deploy Workers → Git Tag
```

### Uso

```bash
# Deploy padrão (patch: 1.0.0 → 1.0.1)
npm run cf:deploy

# Deploy minor (1.0.0 → 1.1.0)
npm run cf:deploy:minor

# Deploy major (1.0.0 → 2.0.0)
npm run cf:deploy:major

# Dry-run (simula tudo sem executar)
npm run cf:deploy:dry
```

### Opções avançadas (via node direto)

```bash
# Deploy somente Pages (sem Workers)
node scripts/cf-deploy.js patch --skip-workers

# Deploy somente Workers (sem Pages)
node scripts/cf-deploy.js minor --skip-pages

# Dry-run major
node scripts/cf-deploy.js major --dry-run

# Deploy (inclui WhatsApp gateway worker)
node scripts/cf-deploy.js patch --include-whatsapp
```

### Notificações automáticas no WhatsApp (deploy pipeline)

Quando configurado, o deploy pipeline envia mensagens `start/end` via gateway.

Variáveis de ambiente (local/CI):

- `WHATSAPP_NOTIFY_URL` (ex.: https://whatsapp.iapersonal.app.br/task-notify)
- `WHATSAPP_NOTIFY_TOKEN` (Bearer = `ADMIN_AUTH_TOKEN` do gateway)
- `WHATSAPP_GROUP_NAME` (opcional; fallback)
- `WHATSAPP_LINK_URL` (opcional; ex.: https://iapersonal.app.br)
- `WHATSAPP_ACTOR_LABEL` (opcional)

Regras obrigatórias do formato estão em: `.claude/docs/WHATSAPP-GATEWAY.md`

### Pipeline detalhado

| Etapa | Comando | Obrigatório |
|-------|---------|-------------|
| 1. Bump versão | `npm version {type}` | ✅ |
| 2. Update version files | `update-version.js` → `manifest.json` + `lib/version.ts` | ✅ |
| 3. Type check | `tsc --noEmit` | ✅ |
| 4. Lint | `eslint src/` | ⚠️ Opcional |
| 5. Build | `next build` | ✅ |
| 6. Deploy Pages | `wrangler pages deploy` → `vfit` | ✅* |
| 7. Deploy Workers | `wrangler deploy` | ⚠️ Opcional |
| 8. Git tag | `git tag v{version}` + commit | ⚠️ Opcional |

\* Pode ser pulado com `--skip-pages`

### Versionamento

O sistema usa [SemVer](https://semver.org/):

- **Patch** (1.0.**X**): Bug fixes, ajustes pequenos
- **Minor** (1.**X**.0): Novas features, melhorias
- **Major** (**X**.0.0): Breaking changes, redesigns

Arquivos atualizados automaticamente a cada deploy:
- `package.json` → campo `version`
- `public/manifest.json` → campo `version` (PWA)
- `lib/version.ts` → constantes `APP_VERSION`, `BUILD_DATE`, `BUILD_NUMBER`

---

## 🔄 Fluxo recomendado

### Deploy de rotina (bug fixes)

```bash
npm run cf:backup      # Backup antes
npm run cf:deploy      # Patch automático
git push --follow-tags # Push com tags
```

### Deploy de feature

```bash
npm run cf:backup
npm run cf:deploy:minor
git push --follow-tags
```

### Antes de mudanças no banco

```bash
npm run cf:backup                    # Backup OBRIGATÓRIO
npm run db:migrate:d1                # Aplicar migration
npm run cf:deploy:minor              # Deploy
```

---

## 🏗️ Infraestrutura

### Pages (Frontend)
- **Projeto**: `vfit`
- **URL**: https://vfit.pages.dev
- **Branch**: `main`
- **Output**: `out/` (Next.js static export)

### Workers (Backend API)
- **Nome**: `vfiti-api` (definido no `wrangler.toml`)
- **URL**: https://api.iapersonal.app.br
- **Bindings ativos**: D1, KV×3, R2×2, Analytics Engine
- **Bindings inativos**: Hyperdrive (bypassed — neon() HTTP incompatível com TCP), Queues×4, Crons×4 (free plan)

### Conta Cloudflare
- **Account ID**: `b0bf95d0fabb322ac3df37bd84ec0c77`
- **Email**: `vts@victor.pt`

---

## ⚠️ Troubleshooting

### "Wrangler not authenticated"
```bash
npx wrangler login
```

### Revogar token Wrangler com segurança (sem expor)

> Use este fluxo sempre que houver suspeita de exposição de credencial.

1. **Encerrar sessão local atual**
```bash
npx wrangler logout
```

2. **Revogar sessão/token no painel Cloudflare**
- Cloudflare Dashboard → Profile → **API Tokens / Connected Applications**
- Revogue a sessão/token relacionado ao Wrangler CLI

3. **Limpar credenciais locais antigas**
```bash
rm -f ~/.wrangler/config/default.toml
```

4. **Autenticar novamente com OAuth**
```bash
npx wrangler login
```

5. **Validar sem imprimir token**
```bash
npx wrangler whoami
```

#### Regras operacionais para não vazar token

- **Nunca** usar `cat ~/.wrangler/config/default.toml` em terminal compartilhado/gravado.
- **Nunca** exportar token em variável shell (`export CF_TOKEN=...`).
- **Nunca** registrar header `Authorization` em logs.
- Preferir comandos do Wrangler já autenticado (sem manipular token manualmente).
- Se precisar automação por API, usar token de curta duração e revogar ao final.

### Build falha no type-check
```bash
npm run type-check    # Ver erros
# Corrigir e tentar novamente
npm run cf:deploy
```

### Deploy Pages falha
```bash
# Verificar se o projeto existe
npx wrangler pages project list

# Deploy manual
npm run build
npm run cf:pages
```

### Restaurar backup D1
```bash
# Usar o arquivo SQL do schema
npx wrangler d1 execute vfiti-exercises --file=backups/<timestamp>/d1/_schema.sql

# Importar dados (precisa converter JSON → INSERT statements)
```

---

# Design System — VFIT

> Paleta web (Next.js), contrastes WCAG, componentes UI, tokens CSS.
> Para design system mobile (React Native), ver `.claude/vfit-design-system.md`.

---

## Cores & Contraste (Web — Tema Atual)

### Fundos do Tema

| Token | Light | Dark |
|-------|-------|------|
| `bg-primary` | `#ffffff` | `#050A12` |
| `bg-secondary` | `#F8FAFB` | `#0B1221` |
| `bg-tertiary` | `#F1F4F6` | `#111B2E` |

### Texto Seguro (mín WCAG AA 4.5:1)

| Texto | vs Light bg | vs Dark bg |
|-------|:-----------:|:----------:|
| `text-primary` (#0F172A / #F0F4F8) | **17.85:1** AAA | **17.95:1** AAA |
| `text-secondary` (#475569 / #94A3B8) | **7.58:1** AAA | **7.74:1** AAA |
| `text-muted` (#94A3B8 / #64748B) | **2.56:1** ❌ | **4.17:1** ⚠️ |

> ⚠️ `text-muted` em light mode (2.56:1) — APENAS para placeholders/captions decorativos, NUNCA para texto informativo.

### Botões — Escala Zinc

| Variant | Light (bg → text) | Dark (bg → text) |
|---------|-------------------|-------------------|
| **secondary** | `zinc-300` (#d4d4d8) → `zinc-700` · 12.08:1 AAA | `zinc-600` (#52525b) → `zinc-100` · 6.99:1 AA |
| **outline** | `zinc-200` (#e4e4e7) → `zinc-600` · 13.62:1 AAA | `zinc-500` (#71717a) → `zinc-100` · 4.37:1 AA-lg |

> **Por que zinc?** Slate tem subtom azul (+18 RGB) que compete com verde da marca. Zinc é neutro (+4 RGB), como Apple HIG System Gray.

### ❌ NUNCA em Light Mode (contraste < 3:1 vs branco)

- `text-brand-primary` (#22C55E) como texto → use `green-700` (#15803d, 4.67:1)
- `text-success` (#10B981) como texto → use `emerald-700` (#047857, 5.47:1)
- `text-warning` (#F59E0B) como texto → use `amber-700` (#B45309, 4.86:1)
- `text-whatsapp` (#25D366) como texto → use `green-700` (#15803d, 4.67:1)

> **Regra**: Cores vibrantes em light mode → usar como **superfície com texto escuro**, nunca como texto sobre branco.

### ✅ Seguro em Dark Mode (todas ≥ 4.5:1 vs #050A12)

- `brand-primary` 8.71:1 · `success` 7.82:1 · `warning` 9.24:1 · `error` 5.27:1 · `info` 5.39:1 · `ai` 4.68:1 · `whatsapp` 10.0:1

### Shadow 3D — Fórmula

```
Light: superfície → shadow 2 tons mais escuro (zinc-300 → shadow zinc-400 #a1a1aa)
Dark:  superfície → shadow zinc-800 (#27272a) — funciona universal
```

---

## Componente `<Button>` — Design System

**Arquivo:** `@/components/ui/button`

### Variantes

| Variant | Uso |
|---------|-----|
| `primary` (default) | CTA principal — verde com depth 3D |
| `secondary` | Ação secundária — zinc neutro |
| `outline` | Ação terciária — borda com hover |
| `ghost` | Ação sutil — sem borda, hover leve |
| `ghost-danger` | Ação destrutiva sutil |
| `danger` | Ação destrutiva enfática |
| `workout` | Específico de treinos |
| `assessment` | Específico de avaliações |
| `payment` | Específico de pagamentos |

### Tamanhos

| Size | Height |
|------|--------|
| `sm` | h-10 |
| `md` (default) | h-12 |
| `lg` | h-14 |
| `icon` | h-11 w-11 |

### Props

- `loading` — Spinner + disabled automático
- `ripple` — Efeito ripple (default true)

---

## Ícones — DSIcon (OBRIGATÓRIO)

```typescript
// ❌ import { Bell } from 'lucide-react'
// ✅ import { DSIcon } from '@/components/ui/ds-icon'
//    <DSIcon name="bell" size={20} />
```

Componente wrapper que centraliza todos os ícones. Nunca importar lucide/heroicons diretamente.

---

## CSS Tokens (globals.css)

### Cores semânticas

```css
--ds-brand-primary: var(--color-green-500);
--ds-text-primary: ...;
--ds-text-secondary: ...;
--ds-text-muted: ...;
--ds-bg-primary: ...;
--ds-bg-secondary: ...;
--ds-bg-tertiary: ...;
```

### Aliases do tema

| Alias | Uso | Exemplo |
|-------|-----|---------|
| `bg-kpi-dark` | Background KPI cards (dark) | `bg-kpi-dark/80` |
| `shadow-glass` | Shadow glassmorphism | `shadow-glass` |

### Regras de CSS

- CSS vars `--ds-*` e classes Tailwind semânticas (`brand-primary`, `text-primary`)
- **Nunca** hardcode cores hex no JSX
- Usar aliases do tema (`bg-kpi-dark`) em vez de brackets (`bg-[#0E1525]`)

---

## Acessibilidade (WCAG 2.1 AA)

- Contraste ≥4.5:1 para texto normal, ≥3:1 para texto grande
- Focus states visíveis (2–4px ring)
- Cor + ícone para significado semântico (erro = vermelho + X)
- Botões: min 44×44px touch target
- `prefers-reduced-motion: reduce` respeitado

---

## Doc Detalhado

Para paleta completa, contrastes exaustivos e regras de manutenção:
→ Ver seção "Cores & Contraste" abaixo (merged)

Para design system v3 spec:
→ `.claude/docs/design-system/vfit-design-system-v3-docs.md`
# 🎨 Design System — Cores & Contraste (Data-Driven)

> **v3.0** · Atualizado em 18/03/2026 · Auditado via WCAG 2.1 contrast ratio
> **Fonte**: `src/app/globals.css` + `src/components/ui/button.tsx` + `src/components/ui/avatar-plan-badge.tsx`
> **Referência rápida** para criar combinações perfeitas e manter consistência visual.

---

## 📐 Padrões WCAG 2.1

| Nível | Ratio mínimo | Uso |
|-------|:------------:|-----|
| **AAA** ✅ | ≥ 7.0:1 | Texto body · máxima legibilidade |
| **AA** ✅ | ≥ 4.5:1 | Texto normal · mínimo aceitável |
| **AA-lg** ⚠️ | ≥ 3.0:1 | Texto ≥18px bold ou ≥24px · ícones · bordas UI |
| **FAIL** ❌ | < 3.0:1 | Não usar para texto · apenas decoração |

> **Regra do projeto**: Texto body → mínimo AA (4.5:1). Títulos grandes/ícones → mínimo AA-lg (3.0:1). Botões com bg colorido → texto no botão mínimo AA (4.5:1).

---

## 🌙 Paleta Completa

### Backgrounds

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `bg-primary` | `#ffffff` | `#050A12` | Fundo principal da página |
| `bg-secondary` | `#F8FAFB` | `#0B1221` | Cards, seções alternadas |
| `bg-tertiary` | `#F1F4F6` | `#111B2E` | Inputs, áreas recuadas |
| `bg-page` | `#F5F7FA` | `#050A12` | Área de conteúdo (alias) |
| `bg-elevated` | — | `#080E1A` | Camada elevada (modais, popovers) |
| `bg-surface-1` | — | `#0B1221` | Superfície nível 1 |
| `bg-surface-2` | — | `#111B2E` | Superfície nível 2 |
| `bg-surface-3` | — | `#182640` | Superfície nível 3 (mais clara) |
| `kpi-dark` | `#F8FAFC` | `#0E1525` | Cards KPI hero |

### Textos

| Token | Light | Dark | vs bg-primary Light | vs bg-primary Dark |
|-------|-------|------|:-------------------:|:------------------:|
| `text-primary` | `#0F172A` | `#F0F4F8` | **17.85:1** AAA ✅ | **17.95:1** AAA ✅ |
| `text-secondary` | `#475569` | `#94A3B8` | **7.58:1** AAA ✅ | **7.74:1** AAA ✅ |
| `text-muted` | `#94A3B8` | `#64748B` | **2.56:1** FAIL ❌ | **4.17:1** AA-lg ⚠️ |

> ⚠️ **`text-muted` em light mode** tem apenas 2.56:1 — usar **apenas** para texto decorativo, placeholders, captions ≥14px. NUNCA para texto informativo crítico.

### Brand

| Token | Hex | vs Dark bg | vs Light bg | Uso |
|-------|-----|:----------:|:-----------:|-----|
| `brand-primary` | `#22C55E` | **8.71:1** AAA ✅ | **2.28:1** FAIL ❌ | Botão CTA, ícones, badges |
| `brand-primary-hover` | `#4ADE80` | — | — | Hover do brand-primary |
| `brand-accent` | `#84CC16` | **10.07:1** AAA ✅ | — | Destaque secundário |
| `brand-mint` | `#86EFAC` | **14.17:1** AAA ✅ | — | Gradientes, glow |
| `brand-deep` | `#166534` | — | — | Shadow 3D do primary |
| `brand-glow` | `rgba(34,197,94,0.30)` | — | — | Glow effects |

> ⚠️ **`brand-primary` em light mode** tem apenas 2.28:1 vs branco — funciona como **cor de superfície** (botão) mas **NÃO** como texto sobre fundo branco. Para texto verde em light mode, use `brand-deep` (#166534, 8.04:1 vs branco).

### Status

| Token | Hex | on Dark bg | on Light bg | Texto branco sobre | Nota |
|-------|-----|:----------:|:-----------:|:------------------:|------|
| `success` | `#10B981` | **7.82:1** AAA ✅ | **2.54:1** FAIL ❌ | **2.54:1** FAIL ❌ | ⚠️ Light: usar como bg com texto escuro |
| `warning` | `#F59E0B` | **9.24:1** AAA ✅ | **2.15:1** FAIL ❌ | **2.15:1** FAIL ❌ | ⚠️ Light: usar como bg com texto escuro |
| `error` | `#EF4444` | **5.27:1** AA ✅ | **3.76:1** AA-lg ⚠️ | **3.76:1** AA-lg ⚠️ | Texto branco OK apenas ≥18px bold |
| `info` | `#3B82F6` | **5.39:1** AA ✅ | **3.68:1** AA-lg ⚠️ | **3.68:1** AA-lg ⚠️ | Similar ao error |
| `ai` | `#8B5CF6` | **4.68:1** AA ✅ | **4.23:1** AA-lg ⚠️ | **4.23:1** AA-lg ⚠️ | Borderline — preferir texto escuro |
| `whatsapp` | `#25D366` | **10.0:1** AAA ✅ | **1.98:1** FAIL ❌ | **1.98:1** FAIL ❌ | Light: sempre texto escuro |

> **Regra**: Cores de status como `success`, `warning`, `whatsapp` **em light mode** devem ser usadas como **background com texto escuro** (#0F172A), nunca como texto sobre branco.

### Sidebar

| Combo | Ratio | Grade |
|-------|:-----:|:-----:|
| Texto branco ON sidebar-bg (dark `#102A20`) | **15.28:1** | AAA ✅ |
| Brand dot ON sidebar-bg (dark) | **6.71:1** | AA ✅ |
| Texto ativo ON sidebar-active (dark `#1A3B2E`) | **11.12:1** | AAA ✅ |
| Texto ON sidebar-bg (light `#ffffff`) | **7.58:1** | AAA ✅ |
| Texto ativo ON sidebar-active (light `#F0FDF4`) | **17.05:1** | AAA ✅ |

---

## 🔘 Botões — Análise Completa

### Hierarquia Visual (por importância)

| # | Variant | Light bg | Dark bg | Propósito |
|---|---------|----------|---------|-----------|
| 1 | `primary` | `#22C55E` (brand) | `#22C55E` | CTA principal — ação primária |
| 2 | `secondary` | `#d4d4d8` (zinc-300) | `#52525b` (zinc-600) | Ação secundária forte |
| 3 | `outline` | `#e4e4e7` (zinc-200) | `#71717a` (zinc-500) | Ação terciária / cancelar |
| 4 | `ghost` | transparent | transparent | Ação contextual mínima |
| 5 | `danger` | `#EF4444` | `#EF4444` | Ação destrutiva |
| 6 | `workout` | emerald gradient | emerald gradient | Contextual — treinos |
| 7 | `assessment` | violet gradient | violet gradient | Contextual — avaliações |
| 8 | `payment` | amber gradient | amber gradient | Contextual — pagamentos |

### Por que Zinc? (Pesquisa de Design Systems)

**Análise de subtom RGB** das escalas de cinza Tailwind:
| Scale | 300 subtom | 600 subtom | Compatibilidade com verde |
|-------|:----------:|:----------:|:-------------------------:|
| **slate** | AZUL (+11) | AZUL (+18) | ❌ Compete com brand verde |
| **gray** | AZUL (+5) | AZUL (+13) | ⚠️ Leve competição |
| **zinc** | NEUTRO (+4) | AZUL (+6) | ✅ Mínima interferência |
| **neutral** | NEUTRO (0) | NEUTRO (0) | ✅ Ultra-neutro, mas "flat" |
| **stone** | NEUTRO → QUENTE | VERMELHO (+6) | ❌ Tom quente ≠ tech/fitness |

**Referências reais:**
- **Apple HIG**: System Gray usa subtom azul mínimo (+3 RGB) — `zinc` é o match mais próximo
- **Material Design 3**: Usa "surface container" levemente tinted pela cor primária — para marca verde, neutro funciona melhor
- **Conclusão**: `zinc` → equilíbrio perfeito entre neutralidade (não compete com verde) e personalidade (não parece "flat")

**Para ambos os modos**: Mesma escala (zinc), tons diferentes:
- Light mode: `zinc-300` (#d4d4d8) / `zinc-200` (#e4e4e7)
- Dark mode: `zinc-600` (#52525b) / `zinc-500` (#71717a)
- Shadow 3D: `zinc-400` (#a1a1aa) light / `zinc-800` (#27272a) dark

### Contraste Detalhado

| Variant | Mode | Btn bg | vs Page bg | Text vs Btn | Text Grade | 3D Shadow depth |
|---------|------|--------|:----------:|:-----------:|:----------:|:---------------:|
| **primary** | light | `#22C55E` | 2.28:1 | **8.73:1** | AAA ✅ | 3.13:1 |
| | dark | `#22C55E` | 8.71:1 | **8.73:1** | AAA ✅ | 3.13:1 |
| **secondary** | light | `#d4d4d8` (zinc-300) | 1.48:1 | **12.08:1** | AAA ✅ | 1.34:1 |
| | dark | `#52525b` (zinc-600) | 2.57:1 | **6.99:1** | AA ✅ | 2.66:1 |
| **outline** | light | `#e4e4e7` (zinc-200) | 1.23:1 | **13.62:1** | AAA ✅ | 1.52:1 |
| | dark | `#71717a` (zinc-500) | 4.10:1 | **4.37:1** | AA-lg ⚠️ | 1.60:1 |
| **danger** | light | `#EF4444` | 3.76:1 | **3.76:1** | AA-lg ⚠️ | 2.21:1 |
| | dark | `#EF4444` | 5.27:1 | **3.76:1** | AA-lg ⚠️ | 2.21:1 |
| **workout** | light | `#34d399` | 1.92:1 | 1.92:1 | FAIL ❌ | 4.0:1 |
| | dark | `#34d399` | 10.32:1 | 1.92:1 | FAIL ❌ | 4.0:1 |
| **assessment** | light | `#a78bfa` | 2.72:1 | 2.72:1 | FAIL ❌ | 4.03:1 |
| | dark | `#a78bfa` | 7.29:1 | 2.72:1 | FAIL ❌ | 4.03:1 |
| **payment** | light | `#fbbf24` | 1.67:1 | 1.67:1 | FAIL ❌ | 4.25:1 |
| | dark | `#fbbf24` | 11.88:1 | 1.67:1 | FAIL ❌ | 4.25:1 |

> **Nota**: `workout`, `assessment`, `payment` usam texto branco sobre cores vibrantes — o contraste texto/bg é baixo (design choice para impacto visual). Compensado pelo tamanho grande (font-bold, ≥14px) e alta saturação da cor. Para texto small nesses botões, usar texto escuro.

### Shadow 3D — Cores de Profundidade

| Variant | Shadow color | vs Btn bg | Efeito |
|---------|-------------|:---------:|--------|
| primary | `#166534` | 3.13:1 | Forte — profundidade clara |
| secondary (light) | `#94a3b8` | 1.73:1 | Sutil — coerente com tom neutro |
| secondary (dark) | `#1e293b` | 2.96:1 | Médio — visível no dark |
| outline (light) | `#94a3b8` | 2.08:1 | Sutil |
| outline (dark) | `#1e293b` | 1.86:1 | Sutil |
| danger | `#991B1B` | 2.21:1 | Médio |
| workout | `#065F46` | 4.0:1 | Forte |
| assessment | `#4C1D95` | 4.03:1 | Forte |
| payment | `#92400E` | 4.25:1 | Forte |

---

## 📊 Slate Scale — Referência Rápida

A escala Slate é a base dos botões neutros. Tabela de contraste para decisões rápidas:

| Tom | Hex | vs Branco | vs `#050A12` | vs slate-700 | vs slate-100 |
|-----|-----|:---------:|:------------:|:------------:|:------------:|
| **slate-100** | `#f1f5f9` | 1.10:1 | **18.11:1** | **9.45:1** | 1.0:1 |
| **slate-200** | `#e2e8f0` | 1.23:1 | **16.09:1** | **8.40:1** | 1.13:1 |
| **slate-300** | `#cbd5e1` | 1.48:1 | **13.36:1** | **6.97:1** | 1.36:1 |
| **slate-400** | `#94a3b8` | 2.56:1 | **7.74:1** | 4.04:1 | 2.34:1 |
| **slate-500** | `#64748b` | **4.76:1** | **4.17:1** | 2.18:1 | **4.34:1** |
| **slate-600** | `#475569` | **7.58:1** | 2.62:1 | 1.37:1 | **6.92:1** |
| **slate-700** | `#334155` | **10.35:1** | 1.92:1 | 1.0:1 | **9.45:1** |
| **slate-800** | `#1e293b` | **14.63:1** | 1.36:1 | 1.41:1 | **13.35:1** |
| **slate-900** | `#0f172a` | **17.85:1** | 1.11:1 | 1.72:1 | **16.30:1** |

### Fórmula de Escolha de Slate

**Light mode** (fundo branco `#ffffff`):
- Botão surface: **slate-200 a slate-300** (visível sem ser pesado)
- Texto sobre botão: **slate-600 a slate-700** (AA+ garantido)
- Texto body: **slate-700+** para AA, **slate-900** para AAA

**Dark mode** (fundo `#050A12`):
- Botão surface: **slate-500 a slate-600** (destaque suficiente 2.6–4.2:1)
- Texto sobre botão: **slate-100** (6.9–4.3:1 = AA)
- Texto body: **slate-200+** para AAA

---

## 🏗️ Dark Mode — Camadas de Profundidade

| Camada | Hex | Contraste com anterior | Uso |
|--------|-----|:----------------------:|-----|
| 0 — bg-primary | `#050A12` | — (base) | Fundo da página |
| 1 — bg-elevated | `#080E1A` | 1.03:1 | Modais, drawers |
| 2 — bg-surface-1 | `#0B1221` | 1.03:1 | Cards nível 1 |
| 3 — bg-surface-2 | `#111B2E` | 1.09:1 | Cards nível 2, inputs |
| 4 — bg-surface-3 | `#182640` | 1.14:1 | Áreas destacadas, hovers |

> Os deltas são sutis (1.03–1.14:1) — é proposital para o estilo "midnight pulse". A distinção vem de: (1) bordas glass `rgba(255,255,255,0.08)`, (2) shadows `shadow-surface`, (3) gradientes sutis. NÃO depender apenas da cor de fundo para separar camadas.

---

## ⚠️ Problemas Conhecidos & Decisões

### 1. `text-muted` em Light Mode = 2.56:1 (FAIL)
**Decisão**: Aceito como design choice. Usado APENAS para:
- Placeholders de input
- Timestamps e metadata decorativa
- Captions em texto ≥14px
- **NUNCA** para labels de formulário, mensagens de erro, ou texto informativo

### 2. Status colors em Light Mode (success/warning/whatsapp < 3:1)
**Decisão**: Essas cores são usadas como **superfícies** (badges, pills) com texto escuro (#0F172A), não como texto sobre branco. Em dark mode funcionam perfeitamente como texto.

### 3. Botões coloridos (workout/assessment/payment) — texto branco FAIL
**Decisão**: Texto branco sobre cores vibrantes é uma escolha de impacto visual. Os botões são sempre ≥14px bold (tamanho grande), o que reduz o requisito para AA-lg (3:1). A alta saturação cromática compensa perceptualmente.

### 4. Brand-primary como texto em light mode = 2.28:1 (FAIL)
**Regra**: NUNCA usar `text-brand-primary` para texto sobre fundo branco. Usar `text-green-700` (#15803d, 4.67:1 AA ✅) ou `brand-deep` (#166534, 8.04:1 AAA ✅).

---

## 🧮 Combinações Seguras — Quick Reference

### Texto sobre fundos (mínimo AA 4.5:1)

| Fundo (Light) | Texto seguro |
|----------------|-------------|
| `#ffffff` (bg-primary) | `#0F172A` (17.85:1) · `#475569` (7.58:1) · `#334155` (10.35:1) |
| `#F8FAFB` (bg-secondary) | `#0F172A` (17.05:1) · `#475569` (7.24:1) |
| `#F5F7FA` (bg-page) | `#0F172A` (16.63:1) · `#475569` (7.06:1) |
| `#cbd5e1` (btn secondary) | `#334155` (6.97:1) · `#475569` (5.10:1) |
| `#e2e8f0` (btn outline) | `#334155` (8.40:1) · `#475569` (6.15:1) |

| Fundo (Dark) | Texto seguro |
|--------------|-------------|
| `#050A12` (bg-primary) | `#F0F4F8` (17.95:1) · `#94A3B8` (7.74:1) · `#e2e8f0` (16.09:1) |
| `#0B1221` (bg-secondary) | `#F0F4F8` (16.92:1) · `#94A3B8` (7.30:1) |
| `#111B2E` (bg-tertiary) | `#F0F4F8` (15.57:1) · `#94A3B8` (6.71:1) |
| `#475569` (btn secondary) | `#f1f5f9` (6.92:1) · `#F0F4F8` (6.15:1) |
| `#64748b` (btn outline) | `#f1f5f9` (4.34:1) · `#F0F4F8` (3.86:1) |

### Cores sobre fundos escuros (para ícones/badges, mín AA-lg 3:1)

| Cor | vs `#050A12` | Grade |
|-----|:------------:|:-----:|
| `#22C55E` brand-primary | 8.71:1 | AAA ✅ |
| `#10B981` success | 7.82:1 | AAA ✅ |
| `#F59E0B` warning | 9.24:1 | AAA ✅ |
| `#EF4444` error | 5.27:1 | AA ✅ |
| `#3B82F6` info | 5.39:1 | AA ✅ |
| `#8B5CF6` ai | 4.68:1 | AA ✅ |
| `#25D366` whatsapp | 10.0:1 | AAA ✅ |

### Cores sobre fundos claros (para ícones/badges, mín AA-lg 3:1)

| Cor | vs `#ffffff` | Grade | Alternativa segura |
|-----|:------------:|:-----:|-------------------|
| `#22C55E` brand | 2.28:1 | FAIL ❌ | Use `#15803d` green-700 (4.67:1 AA ✅) |
| `#10B981` success | 2.54:1 | FAIL ❌ | Use `#047857` emerald-700 (5.47:1 AA ✅) |
| `#F59E0B` warning | 2.15:1 | FAIL ❌ | Use `#B45309` amber-700 (4.86:1 AA ✅) |
| `#EF4444` error | 3.76:1 | AA-lg ⚠️ | Use `#B91C1C` red-700 (6.05:1 AA ✅) |
| `#3B82F6` info | 3.68:1 | AA-lg ⚠️ | Use `#1D4ED8` blue-700 (6.50:1 AA ✅) |
| `#8B5CF6` ai | 4.23:1 | AA-lg ⚠️ | OK para ícones grandes; texto use `#6D28D9` violet-700 (6.95:1) |
| `#25D366` whatsapp | 1.98:1 | FAIL ❌ | Use `#15803d` green-700 (4.67:1 AA ✅) |

---

## 🎯 Regras para Manutenção

### Ao criar novos componentes:

1. **Verificar contraste texto/fundo** — mínimo 4.5:1 (AA) para texto normal
2. **Verificar contraste superfície/fundo** — botões precisam ≥1.3:1 em light, ≥2.5:1 em dark
3. **Shadow 3D** — cor do shadow deve ser ≥1.5:1 mais escura que a superfície
4. **Testar ambos os modos** — SEMPRE light E dark. Cores vibrantes geralmente só funcionam em um
5. **Usar scale Zinc** para neutros — tom neutro sem competir com verde da marca

### Ao escolher cores:

```
Light mode: fundo claro → texto escuro → status como superfície
Dark mode:  fundo escuro → texto claro → status como texto direto
```

### Hierarquia de botões (respeitando contraste):

```
primary (verde 3D) > secondary (zinc-300/600 3D) > outline (zinc-200/500 3D) > ghost (transparente)
```

### Fórmula para shadow 3D sólido:

```
Regra: shadow-color ≈ 2 tons mais escuro que a superfície na escala Zinc
Light: superfície zinc-300 → shadow zinc-400 (#a1a1aa)
Dark:  superfície zinc-600 → shadow zinc-800 (#27272a)
```

---

## 📝 Formulários — Selects & Inputs

### Estilos Globais (globals.css)

Todos os `<select>`, `<input>` e `<textarea>` recebem estilos consistentes via CSS global:

| Propriedade | Light | Dark |
|-------------|-------|------|
| Background | `#ffffff` (branco) | `var(--color-bg-surface-1)` (#0B1221) |
| Border | `#E2E8F0` (slate-200) | `rgba(255,255,255,0.10)` |
| Text | `var(--color-text-primary)` | `var(--color-text-primary)` |
| Focus border | `rgba(34,197,94,0.5)` | `rgba(34,197,94,0.5)` |
| Focus ring | `0 0 0 3px rgba(34,197,94,0.12)` | `0 0 0 3px rgba(34,197,94,0.12)` |
| Border radius | `0.75rem` (12px) | `0.75rem` (12px) |

> **Dark mode inputs**: Usam `bg-surface-1` (#0B1221) — 1 nível acima do bg da página (#050A12) — para diferenciar o input do fundo sem ser jarring.

### Select Arrow

Custom SVG arrow via `background-image` — cor `#94A3B8` (text-secondary) para ambos os modos.

---

## 🔒 Modais — Z-Index & Scroll Lock

### Hierarquia de Z-Index

| Nível | z-index | Uso |
|-------|:-------:|-----|
| Base content | 0-10 | Click-away overlays, menus dropdown |
| Mobile nav backdrop | 40 | Overlay escuro do menu mobile |
| Mobile nav bar | 45 | Barra de navegação inferior |
| **Standard modals** | **50** | Edição, confirmação, detalhes |
| Calendar/crop modals | 60 | Modais sobre modais |
| PWA overlays | 9998-10000 | Install banners, gates |
| Splash screen | 9999 | Tela de loading inicial |

### Scroll Lock (useScrollLock)

Hook `src/hooks/use-scroll-lock.ts` — previne scroll do body quando modais estão abertos:
- Usa `position: fixed` no body (preserva posição do scroll)
- Suporta modais aninhados via counter
- Restaura scroll position ao fechar

**Aplicado em**: admin/personals, admin/users, admin/payments, exercises, feedback-modal, calendar, workouts/create, photo-upload, passkey-prompt

---

## 🔧 Script de Auditoria

Para re-auditar após mudanças, rodar:

```bash
python3 -c "
# Cole o script Python do audit aqui
# Ou execute: python3 scripts/audit-colors.py
"
```

> **Atualizar este doc** sempre que: mudar `globals.css`, alterar button.tsx, criar novo componente com cores, ou durante sprints de UI/polish.

---

## 👤 AvatarWithPlanBadge — Componente DS Premium

> **Desde v5.8.5** · `src/components/ui/avatar-plan-badge.tsx`

Componente que combina Avatar + indicador de plano como overlay premium. Substitui o antigo `PlanBadge` standalone (que ocupava espaço horizontal no header).

### Design (v3 — Border-based, SVG Icons)

```
  ┌──────────┐
  │   •      │  ← Dot verde ativo (top-right, animate-pulse)
  │ ┌──────┐ │
  │ │Avatar│ │  ← Border colorida real (border-2, border-box)
  │ └──────┘ │      Sizing preciso: sm=36px = ds3-action-btn
  │  [⚡Pro] │  ← Badge centralizado (SVG filled icon + label)
  └──────────┘
```

### Sizing Pixel-Perfect (Material Design 3)

O container usa `border` real (não `ring`) para sizing preciso via `border-box`:

| Size | Avatar | Container | Border | Total | Match |
|------|--------|-----------|--------|------:|-------|
| `sm` | 32px (h-8) | 36px (h-9 w-9) | border-2 (2px×2) | **36px** | = ds3-action-btn ✓ |
| `md` | 40px (h-10) | 44px (h-11 w-11) | border-2 (2px×2) | **44px** | — |
| `lg` | 48px (h-12) | 52px (h-13 w-13) | border-2 (2px×2) | **52px** | — |
| `xl` | 64px (h-16) | 68px (h-17 w-17) | border-2 (2px×2) | **68px** | — |

> **Fórmula:** Container = Avatar + (border-width × 2). Border é `border-box`, consumida dentro do container.
> **Alinhamento:** `sm` = 36px = `ds3-action-btn` (36×36) — pixel-perfect no header.

### Ícones SVG Filled

Todos os ícones são **SVG filled inline** (`fill="currentColor"`, viewBox `0 0 12 12`). Zero emojis.

| Plano | Ícone | Descrição | SVG Path |
|-------|:-----:|-----------|----------|
| trial | ✦ sparkle | 4-pointed sparkle preenchido | `M6 0L7.5 4.5L12 6L...` |
| pro | ⚡ bolt | Raio/lightning bolt preenchido | `M7 0L3 7h3l-1 5...` |
| profissional | ★ star | Estrela 5 pontas preenchida | `M6 .5l1.76 3.57...` |
| max | 👑 crown | Coroa preenchida com base | `M1 8l1.5-5L5.5 6...` |

### Configuração por Plano

| Slug DB | Nome Display | Ícone SVG | Border | Badge BG | Glow |
|---------|:------------|:---------:|--------|----------|------|
| `trial` | **Grátis** | sparkle | zinc-300 / zinc-600 | zinc-600 | — |
| `pro` | **Pro** | bolt | emerald-400 / emerald-500 | emerald-600 | `0_0_6px rgba(34,197,94,0.3)` |
| `profissional` | **Pro+** | star | violet-400 / violet-500 | violet-600 | `0_0_6px rgba(139,92,246,0.3)` |
| `max` | **Max** | crown | amber-400 / amber-500 | gradient amber→orange | `0_0_8px rgba(245,158,11,0.35)` |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `src` | `string \| null` | — | URL da foto do avatar |
| `name` | `string` | — | Nome para initials fallback |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho do avatar + badge |
| `showActiveDot` | `boolean` | `true` | Dot verde animado top-right |
| `linkToPlans` | `boolean` | `false` | Wrapa com Link para `/dashboard/plans` |
| `planOverride` | `string` | — | Forçar slug do plano (para previews) |
| `hideBadge` | `boolean` | `false` | Ocultar badge de plano |

### Badge Details por Tamanho

| Size | Badge text | Badge padding | Icon size | Dot size | Dot border |
|------|-----------|--------------|-----------|----------|-----------|
| `sm` | 5.5px | px-1 py-px | 7×7px | 8×8px | border (1px) |
| `md` | 6.5px | px-1.5 py-px | 8×8px | 10×10px | border-[1.5px] |
| `lg` | 7.5px | px-1.5 py-0.5 | 10×10px | 12×12px | border-2 |
| `xl` | 9px | px-2 py-0.5 | 12×12px | 14×14px | border-2 |

### Uso

```tsx
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'

// Header — user pill com badge + link para upgrade (36px = ds3-action-btn)
<AvatarWithPlanBadge src={user?.avatar_url} name={user?.full_name} size="sm" linkToPlans />

// Sidebar — card de info com badge
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} size="md" linkToPlans />

// Sem dot verde
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} showActiveDot={false} />

// Preview forçando plano
<AvatarWithPlanBadge src={user.avatar_url} name={user.full_name} planOverride="max" />
```

### Integração atual

| Local | Size | linkToPlans | Notas |
|-------|------|:-----------:|-------|
| Header desktop (user pill) | `sm` | ✅ | 36px — alinhado com ds3-action-btn |
| Header mobile | `sm` | ✅ | 36px — alinhado com bell/hamburger |
| Sidebar user card | `md` | ✅ | 44px — glassmorphism card |
| Mobile drawer | `md` | ✅ | 44px — badge overlay no drawer |

### Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| v1 | v5.8.4 | Ring overlay no avatar, emojis como ícones |
| v2 | v5.8.5 | Ring + badge centralizado + dot + glow |
| **v3** | **v5.8.6** | **Border real (não ring) para sizing preciso, SVG filled icons, sm=36px=ds3-action-btn** |

### Nomenclatura de Planos — Canônica (v5.8.5+)

| Slug DB | Display Name | Tier (UI) | Preço | Alunos |
|---------|:------------|:--------:|------:|--------|
| `trial` | **Grátis** | GRÁTIS | R$ 0 | 5 |
| `pro` | **Pro** | PRO | R$ 29,90/mês | Ilimitados |
| `profissional` | **Pro+** | PRO+ | R$ 69,90/mês | Ilimitados |
| `max` | **Max** | MAX | R$ 129,90/mês | Ilimitados |

> ⚠️ **Regra**: NUNCA usar "Essencial", "Trainer", "Trial", "Free", "Profissional" como display name. Os nomes canônicos são **Grátis, Pro, Pro+, Max**.
> O slug no banco de dados permanece `trial`, `pro`, `profissional`, `max` (sem alterar schema).

---

*Última auditoria: 18/03/2026 — Todas as combinações verificadas com WCAG 2.1 contrast ratio algorithm.*

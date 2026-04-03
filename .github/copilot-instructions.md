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
- "A resposta já está em `docs/`?"
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
- Evidência obrigatória em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`
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
1. `docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante — backend→`BACKEND.md`, migration→schema docs
3. Este arquivo — se regras mudaram

**Nunca** deploy sem documentação correspondente.

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

---

## Economia de Tokens

**❌ NUNCA:**
- Re-ler arquivos já lidos na conversa — o contexto persiste
- Re-explorar o projeto — `docs/` tem tudo documentado
- `semantic_search` amplo — use `grep_search` com regex preciso
- Ler arquivo inteiro — use `startLine` / `endLine`
- Edições sequenciais uma a uma — agrupe com `multi_replace_string_in_file`

**✅ SEMPRE:**
- Reutilizar contexto da conversa antes de qualquer tool call
- Confirmar escopo exato antes de abrir múltiplos arquivos
- Referenciar `docs/` sem re-ler

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
- Evidência em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`
- Se houver `failed`: **deploy bloqueado** até correção

---

## WhatsApp Operacional — REGRA OBRIGATÓRIA

> **Documentação completa:** `docs/WHATSAPP-GATEWAY.md`

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

1. `docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante (backend→`BACKEND.md`, migration→schema docs)
3. `.claude/docs/RULES.md` — se regras mudaram

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
→ `docs/DESIGN-SYSTEM-COLORS.md`

Para design system v3 spec:
→ `docs/design-system/vfit-design-system-v3-docs.md`

---

# Backend Map — VFIT

> Resumo dos endpoints e schemas. Para referência completa, ver `docs/BACKEND.md`.

---

## Arquitetura

```
workers/
├── index.ts          # Entry point Hono — registra todas as rotas
├── api/
│   ├── auth.ts       # Login, register, refresh, logout, password reset
│   ├── users.ts      # Profile, settings, avatar, subscription
│   ├── personals.ts  # Personal trainer management
│   ├── students.ts   # Student management, invites
│   ├── workouts.ts   # Workout CRUD, templates, sharing
│   ├── exercises.ts  # Exercise library (D1)
│   ├── assessments.ts # Body assessments, measurements
│   ├── payments.ts   # Asaas integration (~2200 linhas, 22 endpoints)
│   ├── chat.ts       # Real-time chat
│   ├── content.ts    # AI content generation
│   ├── notifications.ts # Push notification management
│   ├── admin.ts      # Admin panel endpoints
│   ├── public.ts     # Public pages, SEO
│   ├── media.ts      # R2 upload/download
│   ├── webhooks.ts   # Asaas/Stripe webhooks
│   └── ...           # 17 sub-routers total
├── middleware/
│   ├── auth.ts       # JWT validation, requireType
│   ├── cors.ts       # CORS headers
│   └── rate-limit.ts # Rate limiting via KV
└── schemas/          # Zod validation schemas
```

---

## Padrão de Response

```typescript
// Sucesso
success(data)                    // 200 { success: true, data }
created(data)                    // 201 { success: true, data }
noContent()                      // 204
paginated(data, total, page, limit) // 200 { success: true, data, pagination }

// Erro
throw new BadRequestError('msg')   // 400
throw new UnauthorizedError('msg') // 401
throw new ForbiddenError('msg')    // 403
throw new NotFoundError('msg')     // 404
throw new ConflictError('msg')     // 409
throw new RateLimitError('msg')    // 429
```

---

## DB Helpers

```typescript
import { pgQuery, pgQueryOne, pgQueryCount, generateId } from '@lib/db'

// Query múltiplas rows
const users = await pgQuery<User>(sql, 'SELECT * FROM users WHERE active = $1', [true])

// Query uma row (ou null)
const user = await pgQueryOne<User>(sql, 'SELECT * FROM users WHERE id = $1', [id])

// Count
const total = await pgQueryCount(sql, 'SELECT COUNT(*) FROM users WHERE active = $1', [true])

// Generate ID
const id = generateId() // nanoid
```

---

## Tabelas Principais (Neon PostgreSQL)

| Tabela | Descrição | Relações |
|--------|-----------|----------|
| `users` | Todos os usuários | PK compartilhado com `personals`/`students` |
| `personals` | Dados do personal trainer | `personals.id = users.id` |
| `students` | Dados do aluno | `students.id = users.id` |
| `workouts` | Treinos criados | `personal_id → personals.id` |
| `workout_exercises` | Exercícios do treino | `workout_id → workouts.id` |
| `assessments` | Avaliações físicas | `student_id, personal_id` |
| `payments` | Pagamentos Asaas | `personal_id, student_id` |
| `chat_messages` | Mensagens do chat | `sender_id, receiver_id` |
| `notifications` | Notificações push | `user_id → users.id` |
| `sessions` | Sessões de auth | KV (não tabela) |

> **⚠️ Colunas corretas** — ver regra §9 em `RULES.md`.

---

## Auth Flow

```
POST /api/v1/auth/register → create user + personal/student + session → tokens
POST /api/v1/auth/login    → verify password → create session → tokens
POST /api/v1/auth/refresh  → verify refresh token → new access token
POST /api/v1/auth/logout   → delete session from KV
```

- Access token: 1h TTL (HMAC-SHA256)
- Refresh token: 30d TTL
- Sessions: KV (`vfit-sessions`)
- Passwords: bcryptjs cost 12

---

## Referência Completa

→ `docs/BACKEND.md` — Todos os ~150 endpoints com métodos, params e responses

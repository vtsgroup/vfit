# VFIT — Copilot Instructions

> **v7.0 UPDATED** · SaaS para Personal Trainers · 02/04/2026

---

## 💰 COST OPTIMIZATION — PRIORIDADE MÁXIMA

> **Princípio central**: Modelos com multiplicador `0×` são **ilimitados** em planos pagos.
> Escale apenas quando o modelo mais barato falhar. A pasta `docs/` já tem tudo — referencie, nunca re-explore.

---

### 🆓 Modelos Zero-Cost (Multiplier `0×`)

Não consomem premium requests em planos pagos — use sem restrição:

| Modelo | Disponível em | Ideal para |
|--------|--------------|------------|
| **GPT-5 mini** | Free · Pro · Pro+ | 90% das tarefas diárias · padrão de fallback |
| **GPT-4.1** | Free · Pro · Pro+ | Código controlado · edições simples · refatoração pequena |
| **Raptor mini** *(preview, VSCode only)* | Free · Pro · Pro+ | Completions inline · boilerplate extenso |
| **Goldeneye** *(preview, VSCode only)* | Free apenas | Uso exclusivo no plano gratuito |

> **Copilot Free**: apenas os modelos acima + Claude Haiku 4.5 — limite de **50 requests + 2.000 completions/mês**.

---

### ⚡ Hierarquia de Multiplicadores (Planos Pagos)

| Tier | `×` | Modelos |
|------|:---:|---------|
| 🟢 **ZERO** | `0×` | GPT-5 mini · GPT-4.1 · Raptor mini |
| 🟡 **Ultra-baixo** | `0.25×` | Grok Code Fast 1 |
| 🟡 **Baixo** | `0.33×` | Claude Haiku 4.5 · Gemini 3 Flash · GPT-5.1-Codex-Mini |
| 🔵 **Padrão** | `1×` | Claude Sonnet 4 / 4.5 / 4.6 · Gemini 2.5 Pro · Gemini 3 / 3.1 Pro · GPT-5.1 · GPT-5.2 · GPT-5.3-Codex família |
| 🔴 **Caro** | `3×` | Claude Opus 4.5 · Claude Opus 4.6 |
| ⛔ **Proibido** | `30×` | Claude Opus 4.6 Fast Mode *(Pro+ only)* |

> **Pro $10/mês** → 300 premium requests · **Pro+ $39/mês** → 1.500 requests · Extras: **$0,04/request**

---

### 🎯 Decisão por Tipo de Tarefa

| Tarefa | Modelo | `×` | Razão |
|--------|--------|:---:|-------|
| Perguntas sobre docs · "onde está X?" | **GPT-5 mini** | `0×` | Já tá nos docs — zero custo |
| Explicações conceituais · debugging simples | **GPT-5 mini** | `0×` | Suficiente para contexto claro |
| Edições CSS · texto · ajustes isolados | **GPT-4.1** | `0×` | Preciso e gratuito |
| Completions inline · boilerplate | **Raptor mini** | `0×` | Especializado para completions |
| Análise de UI · imagens · diagramas | **Gemini 3 Flash** | `0.33×` | Multimodal mais barato |
| Debugging com stack trace claro | **Claude Haiku 4.5** | `0.33×` | Análise rápida e barata |
| Agentic tasks longas · automações | **Grok Code Fast 1** | `0.25×` | Ultra-rápido · quasi-gratuito |
| Refatoração 1–4 arquivos | **Claude Sonnet 4.5** ou **GPT-5.2-Codex** | `1×` | Padrão ideal |
| Features novas · 5–10 arquivos | **Claude Sonnet 4.6** ou **GPT-5.3-Codex** | `1×` | Alto contexto sem exagero |
| Raciocínio multi-arquivo (10+) · migrations | **Claude Opus 4.6** | `3×` | Último recurso · use raramente |
| Debug crítico sem nenhum contexto | **Claude Opus 4.6** | `3×` | Máxima precisão · justifique o uso |

---

### 📏 Regras de Economia de Tokens

**❌ NUNCA:**
- Re-ler arquivos já lidos na conversa — o contexto persiste
- Re-explorar o projeto — `docs/` tem tudo documentado, referencie diretamente
- `semantic_search` amplo — use `grep_search` com regex preciso
- Ler arquivo inteiro — use `startLine` / `endLine`
- Edições sequenciais uma a uma — agrupe com `multi_replace_string_in_file`
- Opus para conceitos, docs, CSS, ajustes de texto ou erros com stack trace

**✅ SEMPRE:**
- Reutilizar contexto da conversa antes de qualquer tool call
- `grep_search` com regex antes de `semantic_search`
- Paralelizar tools independentes na mesma chamada
- Confirmar escopo exato antes de abrir múltiplos arquivos
- Referenciar `docs/` sem re-ler — já está documentado

---

### 🤔 Checklist Antes de Modelos Premium

Antes de escalar para Sonnet (`1×`) ou Opus (`3×`), pergunte:

- "Qual arquivo / componente exato?"
- "A resposta já está em `docs/`?"
- "GPT-5 mini já tentou e falhou?"
- "Tem linha / função específica para apontar?"
- "O erro tem stack trace legível?"

> **Se qualquer resposta for "sim" → use modelo `0×` ou `0.33×` primeiro.**

---

### 💡 Comparativo de Planos

| Plano | Preço | Premium Requests | Completions | Modelos |
|-------|------:|:----------------:|:-----------:|---------|
| **Free** | $0 | 50/mês (total) | 2.000/mês | Haiku 4.5 · GPT-4.1 · GPT-5 mini · Raptor mini · **Goldeneye** |
| **Pro** | $10/mês · $100/ano | 300/mês · +$0,04 extra | ♾️ Ilimitado | Todos exceto **Goldeneye** e **Opus 4.6 Fast Mode** |
| **Pro+** | $39/mês · $390/ano | 1.500/mês · +$0,04 extra | ♾️ Ilimitado | **TODOS** incluindo Opus 4.6 Fast Mode (`30×`) |
| **Business** | $19/seat/mês | 300/user/mês · +$0,04 extra | ♾️ Ilimitado | Todos exceto Raptor mini · Goldeneye · Opus Fast Mode |
| **Enterprise** | $39/seat/mês | 1.000/user/mês · +$0,04 extra | ♾️ Ilimitado | Todos exceto Raptor mini · Goldeneye |

> **⚠️ Notas importantes:**
> - **Goldeneye** é exclusivo do plano Free — Pro perde acesso a ele
> - **Raptor mini** disponível em Free · Pro · Pro+ — **não** em Business/Enterprise
> - **Coding agent** (modo agentic completo) requer Pro ou superior — Free não tem
> - **Third-party Agents** apenas em Pro+ e Enterprise
> - Requests `0×` (GPT-5 mini · GPT-4.1 · Raptor mini) **não consomem** o limite de premium requests

---

### Escolha Inteligente de Modelo

**USE SEMPRE O MODELO MAIS BARATO QUE RESOLVE A TAREFA**

| Tarefa | Modelo | Razão |
|--------|--------|-------|
| Perguntas simples (onde está X?) | Gratuito/Haiku | Respostas diretas |
| Leitura/explicação de código | Sonnet 4.5 | Padrão eficiente |
| Edições pontuais (1-3 arquivos) | Sonnet 4.5 | Balanço custo/qualidade |
| Refatoração complexa (5+ arquivos) | Opus 4.6 | Alto contexto |
| Geração de código novo completo | GPT 5.3 Codex | Velocidade |
| Tarefas críticas (deploy/migrations) | Opus 4.6 | Máxima precisão |

### Regras de Economia

1. **NUNCA use Opus para:** perguntas conceituais, consultas de docs, explicações de código, ajustes de texto/CSS isolados
2. **Use Sonnet 4.5 (padrão) para:** 90% das tarefas, edições em até 3 arquivos, debugging com stack trace claro
3. **Reserve Opus apenas para:** refatorações multi-arquivo (5+), features complexas novas, migrations, debugging sem contexto
4. **Fast Mode apenas quando:** velocidade explicitamente solicitada, deadline crítico, boilerplate extenso

### Economia de Tokens

❌ NUNCA: re-ler arquivos já lidos · semantic_search amplo (use grep_search) · ler arquivo inteiro (use ranges) · edições sequenciais (use batch)

✅ SEMPRE: use contexto da conversa · startLine/endLine precisos · grep_search com regex · multi_replace_string_in_file · paralelização inteligente

### Antes de Ferramentas Caras, PERGUNTE:
- "Qual arquivo específico?" · "Componente X ou Y?" · "Já tentou [solução óbvia]?" · "Pode apontar linha/função?"

---

## 🗺️ MAPA RÁPIDO

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
| Onde está o assetlinks? | `public/.well-known/assetlinks.json` (2 SHA-256: Google + Upload) |
| Onde estão as constantes? | `config/constants.ts` (PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL) |
| Onde está a estratégia de mídia? | `docs/MEDIA-STRATEGY.md` (R2 vs Stream vs Images vs Pages, PWA offline) |
| Onde estão os vídeos estáticos? | `public/videos/` (auth BG) · R2 para exercise videos · Stream para >30s |

---

## 🎯 Stack

- **Frontend:** Next.js 15 (App Router, static export) + Tailwind CSS v4 + Zustand 5 + TanStack Query 5
- **Backend:** Hono.js v4 no Cloudflare Workers
- **DB:** Neon PostgreSQL 17 (26 tabelas) + D1 SQLite (5 tabelas cold data)
- **Storage:** R2 (vídeos ≤10MB, imagens, PDFs) + KV (cache, sessions, rate-limit)
- **Media:** CF Stream (vídeos exercícios >30s, HLS adaptive) + CF Image Resizing (resize on-the-fly)
- **Pagamentos:** Asaas (PIX/boleto/cartão) + Stripe
- **Push:** OneSignal · **IA:** Replicate API · **Analytics:** GA4 + CF Analytics Engine

---

## 🎨 Design System — Cores & Contraste (Data-Driven)

> **Doc completo**: `docs/DESIGN-SYSTEM-COLORS.md` — paleta, contrastes WCAG, combinações seguras, regras de manutenção.
> **Consultar SEMPRE** antes de criar/alterar componentes com cores.

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

> ⚠️ `text-muted` em light mode (2.56:1) — usar APENAS para placeholders/captions decorativos, NUNCA para texto informativo.

### Botões — Escala Zinc (neutro, sem competir com verde)

| Variant | Light (bg → text) | Dark (bg → text) |
|---------|-------------------|-------------------|
| **secondary** | `zinc-300` (#d4d4d8) → `zinc-700` · 12.08:1 AAA | `zinc-600` (#52525b) → `zinc-100` · 6.99:1 AA |
| **outline** | `zinc-200` (#e4e4e7) → `zinc-600` · 13.62:1 AAA | `zinc-500` (#71717a) → `zinc-100` · 4.37:1 AA-lg |

> **Por que zinc?** Slate tem subtom azul (+18 RGB) que compete com verde da marca. Zinc é quase neutro (+4 RGB), como Apple HIG System Gray.

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

## ⚡ Credenciais & URLs

| Item | Valor |
|------|-------|
| Frontend | `https://iapersonal.app.br` (fallback: `personal-ia-prod.pages.dev`) |
| Backend API | `https://api.iapersonal.app.br` (fallback: `vfit-api.vd-b0b.workers.dev`) |
| Neon DB | `NEON_DATABASE_URL (via secret manager)` |
| psql local | `/opt/homebrew/opt/libpq/bin/psql "CONNECTION_STRING_ACIMA"` |
| CF Account ID | `b0bf95d0fabb322ac3df37bd84ec0c77` |
| GA4 | `G-XGXZ4R6JXH` |
| OneSignal App | `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` |
| Turnstile Site Key | `0x4AAAAAACbwFTxZJC74DsMB` |

### Contas Admin

| Role | Email | Senha |
|------|-------|-------|
| super_admin | <definir-no-secret-manager> | <definir-no-secret-manager> |
| admin | <definir-no-secret-manager> | <definir-no-secret-manager> |
| personal (teste) | <definir-no-secret-manager> | <definir-no-secret-manager> |

---

## 🔴 Regras Críticas (NÃO VIOLAR)

### 1. Neon Driver — SEMPRE `.query()`
```typescript
// ❌ await sql(query, params)     → tagged template, não aceita (string, params)
// ✅ await sql.query(query, params)
```

### 2. React Query — AUTH GUARD OBRIGATÓRIO em todo useQuery
```typescript
// ❌ return useQuery({ queryKey: ['x'], queryFn: ... })  → 401 antes de hidratar
// ✅ SEMPRE:
const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
return useQuery({ queryKey: ['x'], queryFn: ..., enabled: isReady })
// Com ID: enabled: isReady && !!id
// Com polling: refetchInterval: isReady ? 60_000 : false
```
> Sem guard → Zustand não hidratou → request sem token → 401 → demo mode ativado silenciosamente

### 3. TypeScript Dual Config
- `tsconfig.json` → Editor IntelliSense (lib/, workers/, src/)
- `tsconfig.workers.json` → Wrangler build (só lib/, workers/, config/)
- `next.config.ts` → `ignoreBuildErrors: true` (workers/lib não passam pelo Next build)

### 4. Turnstile — Bypass REMOVIDO
- Dummy token `XXXX.DUMMY.TOKEN.XXXX` **não funciona** desde 14/02/2026
- Para testes curl: use token real ou desative no CF dashboard

### 5. Asaas — PRODUÇÃO ATIVA
- `lib/asaas.ts` detecta sandbox vs prod pelo prefixo da API key
- **⚠️ Pagamentos reais!** `$aact_xxx` = produção

### 6. OneSignal — sempre best-effort
```typescript
await notifyPaymentReceived(c.env, { ... }).catch(() => {})  // nunca falhar o endpoint principal
```

### 7. Pagamentos — net_amount do Asaas
```typescript
// ❌ netAmount = amount - platformFee                    → platformFee é 0%, errado
// ✅ netAmount = asaasPayment.netValue                   → valor real creditado
// ❌ netAmount = amount - platformFee - commissionAmount  → comissão é custo da PLATAFORMA
// ✅ commission_amount salvo para tracking, NÃO subtrai do net_amount
```

### 8. Demo Mode — recovery automático
- Backend offline → demo mode (mock data) → retry /health a cada 30s → auto-recovery
- UI: `DemoModeBanner` exibe aviso amarelo fixo

### 9. Schema PostgreSQL — Colunas corretas
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

### 10. Smoke Auth — OBRIGATÓRIO no QA/deploy gate
- Para qualquer bloco de QA final, go/no-go ou preparação de deploy: executar `npm run smoke:auth:local`.
- `SMOKE_PERSONAL_TOKEN` + `SMOKE_STUDENT_TOKEN` devem estar válidos no `.env.local` (admin recomendado).
- Evidência obrigatória em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`.
- Se houver `failed` no smoke autenticado: **deploy bloqueado** até correção.
- `smoke:auth:local:mutations` é opcional para trilha estendida e não substitui o gate base.

### 11. WhatsApp Operacional — INÍCIO/FIM OBRIGATÓRIO no grupo
- **REGRA OBRIGATÓRIA ABSOLUTA:** toda ação operacional iniciada deve registrar `start` no grupo WhatsApp, e toda ação finalizada deve registrar `end`.
- Escopo mínimo: deploy, hotfix, migração, rollback, correção crítica, execução de gate, auditoria operacional e qualquer mudança em produção.
- O `end` deve sempre conter `started_at` + `ended_at` para cálculo de duração.
- Mensagem de fechamento deve ser assertiva com 3 blocos: **Resultado direto**, **Motivo**, **Vantagem prática**.
- O deploy script `scripts/cf-deploy.js` é estrito por padrão: sem `WHATSAPP_NOTIFY_URL` + `WHATSAPP_NOTIFY_TOKEN`, o deploy falha (bypass permitido só com `--allow-no-whatsapp`).
- Se uma ação iniciou sem `start`/`end`, a execução deve ser tratada como **não conforme** até regularização no grupo.

### 12. Tailwind CSS v4 — Sintaxe Canônica OBRIGATÓRIA
> **Desde 03/03/2026** · Projeto usa Tailwind CSS v4. TODAS as classes devem usar a **sintaxe canônica v4**.

**Gradientes:**
```
❌ bg-gradient-to-r   → ✅ bg-linear-to-r
❌ bg-gradient-to-b   → ✅ bg-linear-to-b
❌ bg-gradient-to-br  → ✅ bg-linear-to-br
❌ bg-gradient-to-t   → ✅ bg-linear-to-t
```

**Opacidade — NUNCA bracket notation:**
```
❌ bg-white/[0.06]    → ✅ bg-white/6
❌ border-white/[0.03] → ✅ border-white/3
❌ from-white/[0.04]  → ✅ from-white/4
❌ hover:bg-white/[0.08] → ✅ hover:bg-white/8
```

**Cores customizadas — SEMPRE usar alias do tema (globals.css):**
```
❌ bg-[#0E1525]       → ✅ bg-kpi-dark
❌ bg-[#0E1525]/80    → ✅ bg-kpi-dark/80
❌ border-[#0E1525]   → ✅ border-kpi-dark
```

**Flexbox — NUNCA prefixo antigo:**
```
❌ flex-shrink-0      → ✅ shrink-0
❌ flex-grow          → ✅ grow
```

**Tamanhos — Usar classes canônicas quando divisível por 4px:**
```
❌ h-[600px]          → ✅ h-150    (600/4=150)
❌ w-[800px]          → ✅ w-200    (800/4=200)
❌ min-w-[220px]      → ✅ min-w-55 (220/4=55)
❌ h-[2px]            → ✅ h-0.5    (2/4=0.5)
❌ min-h-[88px]       → ✅ min-h-22 (88/4=22)
```

**Z-index — Sem brackets para valores numéricos:**
```
❌ z-[9999]           → ✅ z-9999
❌ z-[999]            → ✅ z-999
```

**Shadows — Usar aliases do tema quando disponíveis:**
```
❌ shadow-[0_8px_32px_rgba(0,0,0,0.4)] → ✅ shadow-glass
```

> **⚠️ Regra:** Rodar `grep -rn "bg-gradient-to-" src/` antes de commit. Zero tolerância a sintaxe legada.

### 13. Tailwind CSS v4 — Variáveis CSS (Sintaxe Nova)
> **Desde 09/03/2026** · Corrigido em batch de 9 arquivos (120+ ocorrências).

**Variáveis CSS — NUNCA `[var(...)]`, SEMPRE `(...)`:**
```
❌ bg-[var(--md3-surface)]        → ✅ bg-(--md3-surface)
❌ text-[var(--md3-on-surface)]   → ✅ text-(--md3-on-surface)
❌ border-[var(--md3-outline)]    → ✅ border-(--md3-outline)
❌ ring-[var(--md3-primary)]      → ✅ ring-(--md3-primary)
❌ from-[var(--md3-primary)]      → ✅ from-(--md3-primary)
❌ shadow-[var(--md3-elevation)]  → ✅ shadow-(--md3-elevation)
```

**Background size — NUNCA `bg-[length:]`:**
```
❌ bg-[length:200%_100%]  → ✅ bg-size-[200%_100%]
```

> **Regra de grep:** `grep -rn "\-\[var(--" src/components/ui/` deve retornar **zero** resultados.

### 14. Componente `<Button>` — OBRIGATÓRIO para CTAs
> **Desde 09/03/2026** · Design System padronizado com 3D depth, ripple, glass shine.

**SEMPRE usar `<Button>` de `@/components/ui/button` para:**
- Botões de submit/enviar (formulários, chat, geradores)
- CTAs primários (Gerar Treino, Gerar Conteúdo, Assinar, etc.)
- Botões de navegação com texto (Voltar, Ver Biblioteca, Gerar outro)
- Botões de ação com texto (Copiar, Tentar Novamente, Deletar)

**Variantes disponíveis:**
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

**Tamanhos:** `sm` (h-10), `md` (h-12, default), `lg` (h-14), `icon` (h-11 w-11)

**Props especiais:** `loading` (spinner + disabled), `ripple` (default true)

**Permitido ficar como `<button>` nativo:**
- Chips de seleção / tabs / toggles (UI interativa customizada)
- Dot indicators / slide navigation
- Hamburger menu (ícone animado)
- Accordion toggles (disclosure widget)
- Close X em modais/overlays
- Drag handles
- Cards clicáveis full-width
- Items de dropdown/menu

```typescript
// ❌ NUNCA para CTAs:
<button className="rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-bg-dark ...">
  Gerar Treino
</button>

// ✅ SEMPRE:
import { Button } from '@/components/ui/button'
<Button loading={isPending}>
  <Sparkles className="h-4 w-4" />
  Gerar Treino
</Button>
```

> **Regra de grep:** `grep -rn "className.*bg-brand-primary.*font-semibold" src/ | grep "<button"` deve retornar **zero** para CTAs.

### 15. Barrel Exports (index.ts) — NOMES DEVEM COINCIDIR
> **Desde 09/03/2026** · 15 exports incorretos corrigidos em `src/components/ui/index.ts`.

- Barrel file: `src/components/ui/index.ts`
- **SEMPRE** verificar o nome exato exportado pelo arquivo-fonte antes de adicionar ao barrel
- Usar `as` para aliases quando necessário (ex: `CardHeader as GlassCardHeader`)
- Ao criar novo componente em `ui/`, adicionar ao barrel no mesmo PR

```typescript
// ❌ NUNCA inventar nomes que não existem no source:
export { MD3StatusIndicator } from './md3-badge'  // ← não existe!

// ✅ SEMPRE verificar o source:
export { MD3Badge, MD3Chip, MD3Status } from './md3-badge'  // ← nomes reais
```

### 16. Wrangler — SEMPRE ATUALIZADO (Automático)
> **Desde 12/03/2026** · Atualização obrigatória a cada início de sessão e antes de deploy.

**🔴 REGRA ABSOLUTA:** O Copilot **DEVE** executar `npm install -g wrangler@latest` automaticamente:
- No **início de cada sessão** de trabalho (primeira interação)
- **Antes de qualquer deploy** (`cf-deploy.js`)
- Quando `wrangler --version` mostrar "update available"

**Fluxo obrigatório:**
```bash
# 1. Verificar + atualizar (silencioso, sem perguntar)
npm install -g wrangler@latest

# 2. Confirmar versão
wrangler --version

# 3. Se versão mudou → atualizar este arquivo (header + seção Manutenção)
```

**❌ NUNCA:**
- Fazer deploy com wrangler desatualizado
- Ignorar aviso "update available" no output do deploy
- Perguntar ao usuário se deve atualizar — **apenas atualize**

**✅ SEMPRE:**
- Atualizar silenciosamente no background
- Registrar nova versão no header deste arquivo + seção "Manutenção de Dependências"
- Se o deploy mostrou "update available", atualizar e informar ao usuário

> **Justificativa:** Wrangler desatualizado causa warnings, bugs de build, incompatibilidades com CF APIs e falhas silenciosas em bindings.

---

## 📦 Imports Padrão

### Backend
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

### Frontend
```typescript
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
// Hooks: import { useWorkouts, useCreateWorkout } from '@/hooks/use-workouts'
```

---

## 🚀 Deploy (OBRIGATÓRIO via script)

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

> **🔴 NUNCA** `wrangler deploy` ou `wrangler pages deploy` isolado. **NUNCA** `git push` sem bump de versão.

### ⚙️ Manutenção de Dependências

**Wrangler (Cloudflare Workers CLI)**
- Versão atual: **4.75.0** (atualizado 18/03/2026)
- **🔴 OBRIGATÓRIO:** Antes de QUALQUER deploy, verificar se há atualização:
  ```bash
  wrangler --version  # se output mostra "update available", atualizar imediatamente
  npm install -g wrangler@latest
  ```
- **NUNCA** fazer deploy com wrangler desatualizado — pode causar bugs, warnings e falhas
- Após atualizar, registrar nova versão neste arquivo e em `/memories/vfit-project.md`
- **Ver Regra 16** abaixo — atualização é automática e obrigatória a cada início de sessão

### Comandos Auxiliares
```bash
# Manutenção
npm install -g wrangler@latest                 # atualizar wrangler globalmente
wrangler --version                              # verificar versão

# Migration Neon
NEON_DATABASE_URL="$NEON_DATABASE_URL" node scripts/run-migration-neon.mjs migrations/hyperdrive/ARQUIVO.sql

# Secrets / Logs
echo "valor" | npx wrangler secret put NOME --env=""
npx wrangler tail --format=pretty
```

---

## 🏛️ Arquitetura Resumida

```
Request → CF Workers → requestId → CORS → secureHeaders → rateLimit → authMiddleware(JWT) → Route Handler → Zod → Business Logic → pgQuery/d1Query → success/created/paginated
```

- Access token: 1h TTL (HMAC-SHA256 Web Crypto) · Refresh: 30d · Sessions: KV · Passwords: bcryptjs cost 12
- API Client: auto-prefix `/api/v1`, token refresh deduplicado, demo mode fallback

---

## 📖 Docs Detalhados (NÃO duplicar aqui)

| Doc | Conteúdo |
|-----|----------|
| `docs/DESIGN-SYSTEM-COLORS.md` | **Paleta completa, contrastes WCAG, combinações seguras, regras de manutenção** |
| `docs/BACKEND.md` | Todos os ~150 endpoints, tabelas de rotas completas |
| `docs/PLANO-CONTINUIDADE.md` | Fases 1-10, schema DB completo (26 tabelas), próximos passos |
| `docs/PLANO-ACAO-COMPLETO.md` | Auditoria SQL, bugs, sprints |
| `docs/PLANO-EXECUTIVO.md` | Estado geral do projeto |
| `docs/INFRAESTRUTURA-CF.md` | Bindings, secrets, IDs CF completos |
| `docs/ASAAS-INTEGRATION.md` | API Asaas completa, webhooks |
| `docs/CF-OPERATIONS.md` | Deploy, backup, scripts |
| `docs/MEDIA-STRATEGY.md` | R2 vs Stream vs Images vs Pages, PWA offline, custos |
| `docs/PWA-MEGA-PLAN.md` | Service Worker, manifest, offline |
| `docs/TWA-DOCUMENTATION.md` | TWA completo: keystore, SHA-256, build, Play Store, assetlinks |
| `docs/CHANGELOG.md` | Histórico de deploys e mudanças |

---

## 📜 Regra: Documentação Pós-Deploy

Após CADA deploy, atualizar **na mesma sessão**:
1. `docs/CHANGELOG.md` — entry com data + mudanças
2. Arquivo relevante — backend→`BACKEND.md`, migration→`PLANO-CONTINUIDADE.md`, feature→ambos
3. `docs/COPILOT-MEMORY.md` — se números mudaram
4. Este arquivo — se regras críticas/imports/schema mudaram

**Nunca** deploy sem documentação correspondente.

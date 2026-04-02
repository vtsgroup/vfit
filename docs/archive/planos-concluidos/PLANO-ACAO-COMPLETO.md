# 🗺️ PLANO DE AÇÃO COMPLETO — VFIT

> **Data:** 16/02/2026 | **Atualizado:** 17/02/2026
> **Status:** ✅ SPRINTS 1 E 2 CONCLUÍDOS E DEPLOYADOS
> **Passkey/Biometria:** ✅ Funcionando em produção
> **Deploy Backend:** Workers v`7236abcd` — 17/02/2026 (Sprint 2)
> **Deploy Frontend:** Pages `ab930ade` — 17/02/2026 (Sprint 2)
> **Testes:** ✅ 86 testes passando (Vitest)

---

## 📊 Resumo da Auditoria (Atualizado pós-execução)

| Categoria | Resultado |
|---|---|
| **Páginas frontend** | 47/47 existem ✅ |
| **Hooks com auth guard** | 53/53 corretos ✅ (use-dashboard.ts corrigido) |
| **Navegação/sidebar** | 16/16 rotas com páginas ✅ |
| **Imports mortos** | 0 encontrados ✅ |
| **Bugs SQL (colunas erradas)** | ✅ **17/17 corrigidos** (7 arquivos) |
| **CSP Security** | ✅ **unsafe-eval removido + 4 directives adicionadas** |
| **API Client** | ✅ **demo mode + Content-Type corrigidos** |
| **SEO/Config** | ✅ **sitemap, aggregateRating, manifest corrigidos** |

---

## ✅ FASE A — BUGS CRÍTICOS (SQL Runtime Errors) — CONCLUÍDA 17/02/2026

> **Status:** ✅ Todos os 17 bugs SQL corrigidos e deployados
> **Tempo real:** ~1 hora
> **Impacto:** 7 arquivos, 17 queries SQL corrigidas

### A1. `workers/api/chat.ts` — 5 bugs

| # | Linha | Bug | Correção |
|---|---|---|---|
| 1 | ~132 | `u.avatar_url` → não existe em `users` | `u.profile_photo_url` |
| 2 | ~194 | `u.avatar_url` (2ª ocorrência) | `u.profile_photo_url` |
| 3 | ~240 | `u.avatar_url` (3ª ocorrência) | `u.profile_photo_url` |
| 4 | ~155 | `WHERE user_id = $1` em students | `WHERE id = $1` |
| 5 | ~165 | `WHERE user_id = $1` em students (2ª) | `WHERE id = $1` |

### A2. `workers/api/reviews.ts` — 2 bugs

| # | Bug | Correção |
|---|---|---|
| 1 | `average_rating` e `total_reviews` não existem em `personals` | Remover UPDATE ou criar migration com ALTER TABLE |
| 2 | `conditions` e `params` nunca declarados no GET | Adicionar declaração de variáveis |

### A3. `workers/api/users.ts` — 9 bugs (LGPD delete + export)

| # | Função | Bug | Correção |
|---|---|---|---|
| 1 | DELETE /me | `WHERE user_id = $2` em personals | `WHERE id = $2` |
| 2 | DELETE /me | `WHERE user_id = $2` em students | `WHERE id = $2` |
| 3 | DELETE /me | `INSERT ... read` em notifications | `read_at` (timestamptz, não boolean) |
| 4 | GET /data-export | `user_id` em students SELECT | remover ou usar `id` |
| 5 | GET /data-export | `billing_type` em payments | `payment_method` |
| 6 | GET /data-export | `personal_id` em payments | `recipient_id` |
| 7 | GET /data-export | `billing_type` (student) | `payment_method` |
| 8 | GET /data-export | `body_fat_pct` em assessments | `body_fat_percentage` |
| 9 | GET /data-export | `read` em notifications | `read_at` |

### A4. `workers/api/admin.ts` — 1 bug

| # | Bug | Correção |
|---|---|---|
| 1 | `a.weight`, `a.height`, `a.body_fat` em assessments | `a.weight_kg`, `a.height_cm`, `a.body_fat_percentage` |

### A5. `workers/api/payments.ts` — 1 bug

| # | Bug | Correção |
|---|---|---|
| 1 | `fail_reason` em pix_transfers webhook | `failed_reason` |

### A6. `workers/api/students.ts` — 1 bug

| # | Bug | Correção |
|---|---|---|
| 1 | `metadata` coluna não existe em students UPDATE | Remover referência a metadata ou usar `notes` |

### A7. `workers/api/ai.ts` — 1 bug

| # | Bug | Correção |
|---|---|---|
| 1 | `s.total_workouts_completed` (wrong table alias/join) | Verificar se o JOIN está correto com `students s` |

---

## ✅ FASE B — SEGURANÇA (CSP + API Client) — CONCLUÍDA 17/02/2026

> **Status:** ✅ CSP hardened + API Client corrigido
> **Tempo real:** ~15 minutos

### B1. CSP — `public/_headers`

| # | Issue | Ação |
|---|---|---|
| 1 | `'unsafe-eval'` no `script-src` | **REMOVER** — permite XSS via eval() |
| 2 | Diretiva `object-src` ausente | Adicionar `object-src 'none'` |
| 3 | Diretiva `base-uri` ausente | Adicionar `base-uri 'self'` |
| 4 | Diretiva `form-action` ausente | Adicionar `form-action 'self'` |
| 5 | `upgrade-insecure-requests` ausente | Adicionar |

### B2. API Client — `src/lib/api-client.ts`

| # | Issue | Ação |
|---|---|---|
| 1 | Demo mode usa `_demoMode = true` direto | Trocar para `setDemoMode(true)` para disparar evento + retry timer |
| 2 | `Content-Type: application/json` em GET requests | Condicionar ao método ter body |

---

## ✅ FASE C — SEO & CONFIG — CONCLUÍDA 17/02/2026

> **Status:** ✅ Sitemap limpo, aggregateRating removido, manifest atualizado
> **Tempo real:** ~10 minutos

### C1. SEO

| # | Issue | Ação |
|---|---|---|
| 1 | `/login` e `/register/*` no sitemap mas bloqueados em `robots.txt` | Remover do sitemap OU remover do robots.txt |
| 2 | JSON-LD `aggregateRating` hardcoded (4.8, 127 reviews) | Remover até ter reviews reais (risco de penalização Google) |
| 3 | `/profile` (perfil público) ausente do sitemap | Adicionar se é conteúdo público |
| 4 | Páginas institucional (`/sobre`, `/blog`, `/carreiras`, `/contato`) ausentes do sitemap | Adicionar ao sitemap.xml |
| 5 | `lastmod` idêntico em todas URLs | Diferenciar por página |
| 6 | JSON-LD `Organization.sameAs` array vazio | Adicionar redes sociais quando existirem |

### C2. Manifest

| # | Issue | Ação |
|---|---|---|
| 1 | `orientation` ausente | Adicionar `"orientation": "portrait-primary"` |
| 2 | `related_applications` ausente | Adicionar `"related_applications": []` |

---

## ✅ FASE D — HOOKS & FRONTEND — CONCLUÍDA 17/02/2026

> **Status:** ✅ refetchInterval condicional no use-dashboard.ts
> **Tempo real:** ~5 minutos

| # | Arquivo | Issue | Ação |
|---|---|---|---|
| 1 | `src/hooks/use-dashboard.ts` | `refetchInterval: 30_000` sem condicional | `refetchInterval: isReady ? 30_000 : false` |

---

## 🟡 FASE E — MIGRATIONS NECESSÁRIAS — ✅ CONCLUÍDA 17/02/2026

> **Status:** ✅ Migration 0008 aplicada + try/catch removido
> **Método:** psql direto (run-migration-neon.mjs falhou com tagged template)

### E1. Migration 0008 — `average_rating` e `total_reviews`

```sql
-- migrations/hyperdrive/0008_reviews_columns.sql (APLICADA)
ALTER TABLE personals ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,1) DEFAULT 0;
ALTER TABLE personals ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_personals_rating ON personals(average_rating DESC) WHERE is_public_profile = true;
```

**Resultado:** Colunas criadas, index parcial criado, `updatePersonalRating()` em `reviews.ts` agora faz UPDATE direto sem try/catch.

---

## 🔵 FASE F — MELHORIAS FUTURAS

> **Prioridade:** BAIXA → Parcialmente executada no Sprint 2
> **Estimativa:** Variável

### F1. Infraestrutura — ✅ Hyperdrive ativado

| # | Melhoria | Benefício | Status |
|---|---|---|---|
| 1 | ~~Ativar Hyperdrive~~ | Connection pooling, -40ms latência | ✅ ID `4aa45e1bd72742ec8eab876215cee1a2` |
| 2 | Ativar Queues (email, PDF, IA) | Reliability, async processing | ❌ Workers Paid ($5/mês) |
| 3 | Ativar Cron Triggers | Jobs agendados (pagamentos, lembretes) | ❌ Workers Paid ($5/mês) |
| 4 | Ativar Durable Objects | WebSocket real-time chat | ❌ Workers Paid ($5/mês) |

### F2. Testes & CI/CD — ✅ Vitest configurado (86 testes)

| # | Item | Status |
|---|---|---|
| 1 | ~~Testes unitários para lib/~~ | ✅ 6 suites, 86 testes (errors, response, auth-helpers, cache, db, constants) |
| 2 | Testes de integração para endpoints | ❌ Pendente (Miniflare) |
| 3 | E2E tests para flows críticos | ❌ Pendente (Playwright) |
| 4 | GitHub Actions CI pipeline | ❌ Pendente |
| 5 | Monitoring (Sentry ou equivalente) | ❌ Pendente |

### F3. UX / Performance — ✅ Optimistic updates implementados

| # | Melhoria | Status |
|---|---|---|
| 1 | Skeleton loading em todas as páginas | ✅ Já existentes |
| 2 | ~~Optimistic updates nos mutations~~ | ✅ 5 hooks (delete/update workout, delete/status student, cancel payment) |
| 3 | Prefetch de rotas adjacentes | ❌ Pendente |
| 4 | Image optimization pipeline (R2 + Workers) | ❌ Pendente |
| 5 | WebSocket chat (substituir polling) | ❌ Requer Workers Paid |

### F4. Features Pendentes

| # | Feature | Complexidade |
|---|---|---|
| 1 | Notificações WhatsApp via API oficial | Alta |
| 2 | Relatórios em PDF (avaliações, treinos) | Média |
| 3 | Import/Export de treinos (CSV/JSON) | Baixa |
| 4 | Multi-idioma (i18n) | Alta |
| 5 | Tema claro/escuro toggle | Baixa |
| 6 | Analytics dashboard mais detalhado | Média |

---

## 📋 ORDEM DE EXECUÇÃO

```
SPRINT 1 (17/02/2026) ✅ CONCLUÍDO:
├── ✅ FASE A: 17 bugs SQL corrigidos em 7 arquivos
├── ✅ FASE B: CSP hardened + API Client corrigido
├── ✅ FASE C: SEO fixes (sitemap, aggregateRating, manifest)
├── ✅ FASE D: Hook polling guard (use-dashboard.ts)
├── ✅ Deploy backend Workers v`eef99620`
└── ✅ Deploy frontend Pages `e2ba336d`

SPRINT 2 (17/02/2026) ✅ CONCLUÍDO:
├── ✅ FASE E: Migration 0008 (average_rating + total_reviews + index)
├── ✅ FASE F1: Hyperdrive ativado (ID 4aa45e1bd72742ec8eab876215cee1a2)
├── ✅ FASE F2: Vitest configurado (86 testes, 6 suites)
├── ✅ FASE F3: Optimistic updates (5 mutations com rollback)
├── ✅ Deploy backend Workers v`7236abcd`
└── ✅ Deploy frontend Pages `ab930ade`

SPRINT 3 (17/02/2026) ✅ CONCLUÍDO:
├── ✅ CI: Vitest step adicionado ao GitHub Actions workflow
├── ✅ Prefetch: Confirmado automático pelo Next.js 15 App Router
├── ✅ Export/Import treinos: Backend (GET /:id/export, POST /import) + Frontend (hooks, botões)
│   └── Fix: Route ordering bug (POST /import movido antes de /:id)
├── ✅ Dark mode polish: CSS vars para glass nav, 5 charts, mobile tab colors
│   └── Adicionadas: --nav-glass-bg, --nav-glass-border, --nav-glass-shadow, --chart-dot-stroke
│   └── Fixados: mobile-nav.tsx, revenue-area-chart, workouts-bar-chart, students-pie-chart, payments-status-chart, student-progress-charts
├── ✅ Integration tests: auth-middleware (9), auth-schema (19), workouts-schema (19) → 133 testes total
├── ✅ Deploy backend Workers `a4075eea`
└── ✅ Deploy frontend Pages `d31876d0`

SPRINT 4 (Futuro):
├── Workers Paid ($5/mês) → Queues + Crons + WebSocket
├── Testes E2E (Playwright)
├── Testes de integração com Miniflare
├── i18n (en/pt-BR)
└── Analytics dashboard mais detalhado
```

---

## ✅ O QUE JÁ ESTÁ BOM

| Área | Status |
|---|---|
| **Passkey/Biometria** | ✅ Funcionando (fix completo 16/02/2026) |
| **Auth flow completo** | ✅ Login, register, refresh, OAuth, passkey |
| **Auth guards (52/53 hooks)** | ✅ Padrão isHydrated + isAuthenticated |
| **47 páginas funcionais** | ✅ Todas com rotas corretas |
| **16 itens de navegação** | ✅ Todos com páginas correspondentes |
| **PWA completo** | ✅ Manifest, SW, install banner, push |
| **SEO base** | ✅ OG tags, JSON-LD, meta tags, GA4 |
| **Security headers** | ✅ HSTS, X-Frame, nosniff, XSS-Protection |
| **CORS multi-origin** | ✅ iapersonal.app.br + pages.dev |
| **Rate limiting** | ✅ KV-based por rota |
| **Demo mode recovery** | ✅ Auto-retry 30s via /health |
| **Chat (polling-based)** | ✅ 7 endpoints, 5 componentes (com bugs SQL) |
| **Pagamentos Asaas** | ✅ Produção ativa |
| **Afiliados** | ✅ 3 tiers, comissões, saques |
| **Gamificação** | ✅ XP, níveis, 10 badges |
| **IA (Replicate)** | ✅ Geração de treinos, chat, comparação |

---

## 🔧 Fix do Passkey — Documentação

### Problema Original
Login biométrico (WebAuthn/Passkey) retornava 500 → 400 → finalmente identificado como `column "slug" does not exist`.

### Causa Raiz
A query SQL no handler `POST /auth/passkey/login/complete` usava nomes de colunas errados da tabela `personals`:

| Query usava | Coluna real | Tabela |
|---|---|---|
| `slug` | `public_url_slug` | personals |
| `plan_type` | `subscription_plan` | personals |
| `plan_expires_at` | `subscription_expires_at` | personals |
| `WHERE user_id = $1` | `WHERE id = $1` | personals (PK = users.id) |

### Correção Aplicada
1. **Removida** a busca de perfil extra do `login/complete` (alinhando com o login normal que não retorna perfil)
2. **Response** agora segue o mesmo formato de `POST /auth/login`
3. **Frontend** ajustado para não depender de `data.personal`/`data.student`
4. **`auth: false`** adicionado nas chamadas de passkey (são endpoints públicos)
5. **Array de origens/RP IDs** permitidos para flexibilidade

### Outros fixes durante a investigação
- `requireUserVerification: false` (v11 default era true)
- `NotFoundError('Passkey')` em vez de `NotFoundError('Passkey não encontrado')` (duplicação)
- Error wrapping para converter erros desconhecidos em BadRequestError com mensagem real
- Debug endpoint temporário `GET /passkeys/debug/last-error`

### Arquivos Modificados
- `workers/api/passkey.ts` — Backend handler
- `src/hooks/use-passkey.ts` — Frontend hook (`auth: false`)
- `src/components/auth/passkey-login.tsx` — Frontend component (removido profile handling)

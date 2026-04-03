# 🧠 COPILOT MEMORY — VFIT Prod

> **v5.6** — Atualizado em 26/02/2026
> Memória principal do GitHub Copilot para o projeto.

---

## 📌 Projeto

| Item | Valor |
|---|---|
| **Nome** | VFIT |
| **Tipo** | SaaS para Personal Trainers |
| **Repo** | /Users/macos/Development/apps/personal-ia-prod |
| **Frontend** | https://iapersonal.app.br |
| **Backend** | https://api.iapersonal.app.br |
| **CF Account** | `b0bf95d0fabb322ac3df37bd84ec0c77` |

---

## 🛠️ Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router, src/, static export) | 15 |
| React | React | 18.3.1 |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` |
| UI Components | Shadcn/ui | latest |
| Animations | Framer Motion | 12.x |
| State | Zustand (persist) | 5.x |
| Data Fetching | TanStack Query | 5.x |
| Backend | Hono.js (CF Workers) | 4.x |
| Validation | Zod | 4.x |
| Database Hot | PostgreSQL via Neon (`neon()` HTTP driver) | 17 |
| Database Cold | Cloudflare D1 | SQLite |
| Cache/Sessions | Cloudflare KV | 3 namespaces |
| Storage | Cloudflare R2 | 2 buckets |
| Payments | Asaas (primary, **produção**) + Stripe | — |
| Push | OneSignal (Web Push + in-app) | — |
| IA | Replicate API | — |
| Email | Resend API (direto, sem queue) | — |
| Deploy | CF Pages (frontend) + Workers (backend) | wrangler v4 |
| PWA | Service Worker manual + manifest | — |
| Testes | Vitest v4.0.18 (207 testes, 16 arquivos) | — |
| Auth | JWT (Web Crypto) + Passkey/WebAuthn + OAuth Google | — |
| Chat | Polling-based (5s/15s/30s) — sem WebSocket (CF free plan) | — |

---

## 📋 Estado dos Lotes — TODOS ✅ CONCLUÍDOS

| # | Lote | Status |
|---|---|---|
| 01 | Fundação do Projeto | ✅ CONCLUÍDO |
| 02 | Schemas de Banco + Infra CF | ✅ CONCLUÍDO |
| 03 | Backend Core Workers | ✅ CONCLUÍDO |
| 04 | Auth System | ✅ CONCLUÍDO |
| 05 | API Users & Students | ✅ CONCLUÍDO |
| 06 | API Workouts | ✅ CONCLUÍDO |
| 07 | API Assessments | ✅ CONCLUÍDO |
| 08 | Payments & Affiliates | ✅ CONCLUÍDO |
| 09 | AI Integration | ✅ CONCLUÍDO |
| 10 | Frontend Layout | ✅ CONCLUÍDO |
| 11 | Auth Pages | ✅ CONCLUÍDO |
| 12 | Dashboard Personal | ✅ CONCLUÍDO |
| 13 | Gestão de Alunos | ✅ CONCLUÍDO |
| 14 | Frontend Workouts | ✅ CONCLUÍDO |
| 15 | Frontend Assessments | ✅ CONCLUÍDO |
| 16 | Frontend Payments | ✅ CONCLUÍDO |
| 17 | Affiliates Frontend | ✅ CONCLUÍDO |
| 18 | App do Aluno | ✅ CONCLUÍDO |
| 19 | Perfil Público | ✅ CONCLUÍDO |
| 20 | PWA & Offline | ✅ CONCLUÍDO |
| 21 | Deploy & CI/CD | ✅ CONCLUÍDO |

---

## 📊 Números do Projeto

| Métrica | Valor |
|---|---|
| Endpoints Backend | ~160 (18 sub-routers) |
| Tabelas PostgreSQL | 26 (inclui feedback_replies, feedback_suggestions, conversations, messages, user_passkeys, asaas_customers) |
| Tabelas D1 | 5 |
| Páginas Frontend | 48 + 5 layouts |
| Hooks React | 76+ (TanStack Query) |
| Schemas Zod | 64+ |
| Funções lib/ | ~58 |
| Middleware | 5 |
| Secrets CF | 13 (todos ✅) |
| Componentes React | ~66 |
| Fases concluídas | 8/10 (1, 2, 3, 4, 5, 7, 8, 9) |
| Testes Vitest | 207 testes, 16 arquivos, 100% passing |
| Migrations PG | 10 (0001–0009 + 0019_audit_log) |

---

## 🌐 Infraestrutura Cloudflare

| Recurso | Nome/ID | Status |
|---|---|---|
| D1 | `vfiti-exercises` (`988c03d5-...`) | ✅ Ativo |
| KV_CACHE | `e7147f88...` | ✅ Ativo |
| KV_SESSIONS | `91d34b67...` | ✅ Ativo |
| KV_RATE_LIMIT | `d94c62b1...` | ✅ Ativo |
| R2 Videos | `personal-ia-videos` | ✅ Ativo |
| R2 Images | `personal-ia-images` | ✅ Ativo |
| Analytics Engine | Dataset padrão | ✅ Ativo |
| Hyperdrive | `vfiti-db` | ⚠️ Configurado mas BYPASSED — `neon()` HTTP driver incompatível com TCP. `lib/db.ts` usa `NEON_DATABASE_URL` direto. Futuro: migrar para `Pool` de `@neondatabase/serverless` |
| Queues | — | ❌ Desabilitado (free plan CF) |
| Cron Triggers | — | ❌ Desabilitado (free plan CF) |

### 📲 WhatsApp Gateway (Unipile)

| Item | Valor |
|---|---|
| URL | https://whatsapp.iapersonal.app.br |
| Worker | `vfiti-whatsapp` |
| Secrets Store (ID) | `88b0ebf0455e437c8d75597ba6aae568` |
| Unipile WhatsApp `account_id` | `JS5qShIlTT2SXd3YCjUDew` |
| Grupo "Logs e Docs: VFIT" `chat_id` | `IQx4ESW6UaGxUnesme7atQ` |

---

## ⚠️ Regras Críticas

1. **Neon Driver**: Usar `sql.query(query, params)` — NUNCA `sql(query, params)`
2. **Neon + Hyperdrive**: `neon()` (HTTP driver) é INCOMPATÍVEL com Hyperdrive (TCP). `lib/db.ts` usa `NEON_DATABASE_URL` diretamente. Migrar para `Pool` no futuro.
3. **React Query + Zustand**: Sempre `enabled: isReady` com `isAuthenticated && isHydrated`
4. **Tailwind v4**: `@import "tailwindcss"` + `@theme inline {}` (NÃO `@tailwind`)
5. **TypeScript Dual Config**: `tsconfig.json` (editor, inclui `tests/**/*.ts`) + `tsconfig.workers.json` (wrangler)
6. **next.config.ts**: `ignoreBuildErrors: true` (workers/lib conflitam com DOM types)
7. **OneSignal**: Sempre `.catch(() => {})` em chamadas notify (best-effort)
8. **Asaas**: Produção ativa (auto-detecção pelo prefixo da API key)
9. **Turnstile**: Produção ativa — bypass `XXXX.DUMMY.TOKEN.XXXX` **REMOVIDO** em 14/02/2026
10. **Schema PG**: `personals.id = users.id` e `students.id = users.id` (same PK, SEM coluna `user_id`)
11. **Post-Deploy**: Documentação DEVE ser atualizada na mesma sessão após CADA deploy (ver regra abaixo)

---

## 🔑 Convenções de Código

- **Naming**: camelCase (variáveis), PascalCase (componentes/types)
- **Imports Backend**: `@lib/`, `@workers/`, `@config/`
- **Imports Frontend**: `@/` alias para src/
- **CSS**: Tailwind utility classes, sem CSS modules
- **API**: RESTful, respostas JSON via `success()` / `created()` / `paginated()`
- **Errors**: Zod validation + error classes em lib/errors.ts
- **IDs**: `crypto.randomUUID()` via `generateId()`
- **Auth**: JWT HMAC-SHA256 via Web Crypto (não jose/jsonwebtoken)

---

## 📝 Próximos Passos

### ✅ Estado operacional mais recente (S96/S97)
- Gate Wave 4 fechado 100% com `ops:release:gate` aprovado.
- Smoke auth autenticado válido (evidência em `docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md`).
- Baseline S97-R1 executada e documentada:
	- `SLO-SLA-BASELINE.generated.md`
	- `LOAD-TEST-BASELINE.generated.md`
	- `NEON-BACKUP-RESTORE-DRILL.generated.md`
	- `WEB-SECURITY-AUDIT.generated.md`
- Sentry integrado em frontend + workers (S97-R2).

### 🔴 Próxima prioridade operacional (S97-S98 fechamento)
- [x] Integrar Sentry (frontend + workers) com DSN e captura padronizada.
- [ ] Configurar monitor externo de uptime com alerta para `api.iapersonal.app.br`.
- [ ] Formalizar rotina de backup/snapshot com janela e responsáveis.
- [ ] Definir canal de alertas (email/Slack) para erro rate e indisponibilidade.

### 🔴 Prioridade Alta — Admin Super Powers
- [ ] **Edição completa de usuários** (super admin) — editar qualquer campo de `users`, `personals`, `students`
- [ ] **Edição de personals** — alterar plano, CREF, status, especialidades, limite de alunos
- [ ] **Visualizar saldo de cada personal** — card com saldo disponível, total recebido, total sacado
- [ ] **Ajuste manual de saldo** — dar bônus, debitar, corrigir valores direto pelo painel admin
- [ ] **Gerenciamento de pagamentos admin** — cancelar, estornar, confirmar manualmente
- [ ] **Logs de auditoria** — registrar toda ação manual do admin (quem, quando, o quê, valor anterior/novo)

### 🟡 Prioridade Média — Melhorias de Valor
- [ ] **Dashboard financeiro avançado** — gráficos de receita por personal, por período, projeções
- [ ] **Relatórios exportáveis** — CSV/PDF de pagamentos, alunos, treinos por período
- [ ] **Notificações admin** — alertas de pagamentos grandes, saques, novos cadastros
- [ ] **Bulk actions** — aprovar/rejeitar múltiplos pagamentos/saques de uma vez

### 🟢 Prioridade Normal — Infraestrutura
- [ ] Habilitar Queues quando Workers Paid ($5/mês) — FASE 6
- [ ] Habilitar Cron Triggers — FASE 6
- [ ] Migrar `neon()` → `Pool` para suportar Hyperdrive TCP
- [ ] Testes E2E com Playwright — FASE 10
- [ ] CI/CD GitHub Actions — FASE 10
- [ ] Sentry error tracking — FASE 10
- [ ] Responsividade mobile refinada (375px–1920px)
- [ ] Skeleton loading em todas as telas
- [ ] Atualizar webhook token no painel Asaas (token forte 64 hex)

---

## 🏆 Fases Concluídas

| Fase | Descrição | Data | Arquivos-chave |
|---|---|---|---|
| FASE 1 | OneSignal + Push Notifications | 13/02/2026 | `lib/onesignal.ts`, `onesignal-provider.tsx`, `push-notification-prompt.tsx` |
| FASE 2 | Triggers Automáticos (7 triggers) | 13/02/2026 | `payments.ts`, `workouts.ts`, `students.ts`, `assessments.ts`, `auth.ts` |
| FASE 3 | Dashboard Pro (6 Recharts) | 13/02/2026 | `charts/revenue-chart.tsx`, `students-chart.tsx`, `workouts-chart.tsx`, etc. |
| FASE 4 | App do Aluno Premium | 14/02/2026 | `workout-execution.tsx`, `rest-timer.tsx`, `gamification-card.tsx`, `photo-comparison.tsx` |
| FASE 5 | Pagamentos Produção (Asaas) | 14/02/2026 | `lib/asaas.ts`, `payments.ts`, Turnstile bypass removido |
| FASE 7 | Chat & Comunicação (polling) | 14/02/2026 | `workers/api/chat.ts`, `use-chat.ts`, `chat-window.tsx`, 7 endpoints, 7 hooks |
| FASE 8 | LGPD, Segurança & Termos | 14/02/2026 | `(legal)/termos`, `privacidade`, `cookies`, `cookie-consent.tsx`, `users.ts` (LGPD) |
| FASE 9 | Production Blockers (SEO/GA4/Security) | 14/02/2026 | `layout.tsx` (SEO), `_headers`, `json-ld.tsx`, auth guards 22 hooks |

### Sprints Pós-Fases (16-17/02/2026)

| Sprint | Descrição | Data | Principais mudanças |
|---|---|---|---|
| Sprint 1 | 17 bugs SQL corrigidos, segurança, SEO | 16/02/2026 | 7 arquivos API corrigidos, Passkey fix |
| Sprint 2 | Vitest setup (86 testes), optimistic updates | 16/02/2026 | 6 arquivos de teste, Hyperdrive ativado |
| Sprint 3 | CI melhorias, export/import treinos, dark mode, +47 testes | 16/02/2026 | 133 testes total, 9 arquivos |
| Hotfix | Hyperdrive TCP → neon() HTTP incompatibility fix | 17/02/2026 | `lib/db.ts` usa `NEON_DATABASE_URL` direto |
| Hotfix | TypeScript errors em 9 arquivos de teste | 17/02/2026 | `tsconfig.json` + 6 test files corrigidos |

---

## 🧪 Testes (Vitest v4.0.18)

| Arquivo | Testes | Descrição |
|---|---|---|
| `tests/config/constants.test.ts` | 17 | PLANS, FEES, BADGES, RATE_LIMITS |
| `tests/lib/errors.test.ts` | 21 | AppError + 8 subclasses |
| `tests/lib/response.test.ts` | 14 | success, created, noContent, paginated |
| `tests/lib/auth-helpers.test.ts` | 21 | JWT sign/verify, bcrypt, generateTokens |
| `tests/lib/cache.test.ts` | 6 | KV cache get/set/invalidate |
| `tests/api/auth-middleware.test.ts` | 10 | JWT middleware, requireType |
| `tests/api/auth-schema.test.ts` | 19 | Zod schemas validation |
| `tests/api/workout-schema.test.ts` | 17 | Workout Zod schemas |
| `tests/integration/auth-flow.test.ts` | 8 | Auth flow integration |
| **TOTAL** | **133** | **100% passing** |

---

## 📝 Última Atualização

- **Data**: 26/02/2026
- **Estado**: Wave 4 concluindo hardening de segurança (S94) + testes/docs (S95-S96)
- **Deploy mais recente**: v3.7.0 — Wave 3 (Student App, Skeletons, Command Palette, Onboarding)
- **Versão atual**: 3.7.0
- **Testes**: 207 testes Vitest, 16 arquivos, 100% passing
- **Foco atual**: fechamento de documentação operacional e preparação para Wave 4 deploy gate
- **Issue ativa**: Nenhuma bloqueante
- **Último hardening**: 2FA TOTP + CSRF + audit_log expandido (auth/users/payments)

---

## 📜 Regra Obrigatória: Documentação Pós-Deploy

> **REGRA:** Após CADA deploy (backend, frontend, migration, hotfix), a documentação DEVE ser atualizada **na mesma sessão de trabalho**. Isso inclui:
>
> 1. **CHANGELOG.md** — Adicionar entry com data, tipo (deploy/hotfix/migration), e mudanças
> 2. **Arquivo(s) relevante(s)** — Atualizar os docs dos arquivos onde foram feitas mudanças:
>    - Deploy backend → `BACKEND.md`, `PLANO-EXECUTIVO.md`
>    - Deploy frontend → `PLANO-EXECUTIVO.md`
>    - Migration → `PLANO-CONTINUIDADE.md` (tabelas), `BACKEND.md` (schema)
>    - Hotfix → `CHANGELOG.md` + arquivo relevante
>    - Nova feature → `PLANO-CONTINUIDADE.md` (fase), `BACKEND.md` (endpoints)
> 3. **COPILOT-MEMORY.md** — Atualizar números (endpoints, tabelas, testes, fases) se mudaram
> 4. **copilot-instructions.md** — Atualizar se mudou algo nas regras críticas, imports, ou schema
>
> **Nunca** fazer deploy sem atualizar a documentação correspondente na mesma sessão.

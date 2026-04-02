# VFIT — Plano de Continuidade Executivo

> **v5.0** · Atualizado em 17/02/2026
> De "MVP funcional" → "Produto profissional pronto para receita"

---

## 🧾 Atualização Operacional (28/02/2026)

- Executada limpeza definitiva de alunos convidados/duplicados no Neon para o personal Emerson (`personal_id: 2fb61a39-cf00-47ac-9f6d-e43a30611df6`).
- Base final preservada com 3 alunos: **Maria Betânia Melo Duarte**, **Victor Agostinho Melo Duarte** e **Victor Duarte**.
- Menções de Rafaela removidas dessa base operacional (consulta pós-limpeza: `0` ocorrências por nome/email).
- Script de operação adicionado em [scripts/cleanup-emerson-students.mjs](scripts/cleanup-emerson-students.mjs).

---

## 📊 Estado Atual (16/02/2026)

### Números Reais do Projeto

| Métrica | Valor |
|---|---|
| Endpoints backend | **~161** (19 sub-routers Hono, inclui media + workout sessions + XP) |
| Páginas frontend | **47 pages + 5 layouts** |
| Tabelas PostgreSQL (Neon) | **30** (inclui XP Economy + exercise_media) |
| Tabelas D1 (cold data) | **5** (exercises, muscle_groups, etc.) |
| Bindings CF ativos | **7** (1 D1 + 3 KV + 2 R2 + 1 Analytics) |
| Secrets configurados | **13** (inclui TURNSTILE_SECRET_KEY) |
| Service Worker | **v3** (cache v5) |
| Funções Asaas | **17** exportadas |
| Funções OneSignal | **8** (core + convenience) |
| Hooks frontend | **79+** query hooks + mutations (TanStack Query) |
| Componentes React | **~64** |
| FASEs concluídas | **8/10** (1, 2, 3, 4, 5, 7, 8, 9*) |
| Passkey/Biometria | **✅ Funcionando** (fix 16/02/2026) |
| Testes Vitest | **190** (13 arquivos, 100% passing) |
| Bugs SQL identificados | **17** (todos corrigidos Sprint 1 — 16/02/2026) |

### ✅ O que funciona AGORA

- **~138 endpoints** backend (Hono.js / CF Workers)
- **47 páginas + 5 layouts** frontend (Next.js 15 static export)
- **Auth completo** (JWT, refresh, Turnstile produção ✅, OAuth Google)
- **Dashboard Pro** com Recharts (6 gráficos reais, sparklines, métricas %)
- **CRUD completo:** alunos, treinos, avaliações, pagamentos
- **IA:** geração de treinos via Replicate (8 endpoints)
- **Pagamentos:** Asaas (PIX/boleto/cartão) — sandbox funcionando
- **Webhooks:** 2 Asaas (cobranças + transferências) + 1 Stripe
- **Afiliados:** programa com referral cookies + comissão automática
- **PWA:** instalável, offline, SW v3/cache v5, OneSignal SDK integrado
- **Admin panel:** CRUD usuários, bypass, saldo Asaas em tempo real
- **OneSignal:** `lib/onesignal.ts` com 8 funções prontas + 7 triggers automáticos
- **Notificações in-app:** tabela `notifications` + endpoints CRUD + push em eventos reais
- **Push Prompt:** componente inteligente no dashboard
- **Marketplace:** CRUD de planos de treino + compras
- **Avaliações:** fotos, evolução, badges, PDF
- **Saques PIX:** endpoint + webhook de status
- **Treino Interativo:** execução step-by-step, timer de descanso, log de carga/reps
- **Gamificação:** XP, níveis, 7 badges, streaks, celebração visual
- **LGPD Compliant:** termos, privacidade, cookies, anonimização, data export
- **Cookie Consent:** banner enterprise com auto-approve analytics
- **Evolução Visual:** fotos before/after com slider comparativo
- **SEO Completo:** metadataBase, OG image 1200×630, Twitter Cards, robots.txt, sitemap.xml, canonical URLs
- **JSON-LD AEO/GEO:** SoftwareApplication + Organization + FAQPage (6 Q&As)
- **Security Headers:** CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- **Google Analytics 4:** GA4 (G-XGXZ4R6JXH) com gtag.js
- **Auth Guards:** 22 query hooks com isHydrated check (previne demo mode silencioso)
- **Demo Mode Recovery:** retry 30s + DemoModeBanner visual + CustomEvent

### ❌ O que falta para produto profissional

- **Queues/Crons** — desabilitados (free plan CF)
- **Testes** — zero testes automatizados
- **Email transacional** — só convite de aluno funciona

---

## 🔧 Configurações de Produção Atuais

### URLs

| Serviço | URL |
|---|---|
| Frontend | https://iapersonal.app.br |
| Frontend fallback | https://personal-ia-prod.pages.dev |
| Backend API | https://api.iapersonal.app.br |
| Health Check | https://api.iapersonal.app.br/health |

### Contas Admin

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Victor | `<super_admin_email>` | `<super_admin_password>` | super_admin |
| Emerson | `<admin_email>` | `<admin_password>` | admin |

### Secrets no Worker (wrangler secret)

| Secret | Status | Valor/Nota |
|---|---|---|
| NEON_DATABASE_URL | ✅ | Definida via secret manager (`$NEON_DATABASE_URL`) |
| JWT_SECRET | ✅ | Configurado |
| ASAAS_API_KEY | ✅ | **Produção** (prefixo `$aact_` = pagamentos reais!) |
| ASAAS_WEBHOOK_TOKEN | ✅ | Token forte 64 hex chars (atualizar no painel Asaas!) |
| STRIPE_SECRET_KEY | ✅ | Configurado |
| REPLICATE_API_TOKEN | ✅ | Configurado |
| RESEND_API_KEY | ✅ | Configurado |
| ONESIGNAL_APP_ID | ✅ | `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` |
| ONESIGNAL_REST_API_KEY | ✅ | Configurado |
| TURNSTILE_SECRET_KEY | ✅ | Produção |
| GOOGLE_CLIENT_ID | ✅ | Configurado |
| GOOGLE_CLIENT_SECRET | ✅ | Configurado |

### Asaas — Estado Atual

| Item | Valor |
|---|---|
| Ambiente | **Produção** (detecção automática via prefixo `$aact_`) |
| Base URL | https://api.asaas.com/api/v3 |
| Webhooks configurados | 2 (cobranças + transferências) |
| Webhook URL cobranças | `https://api.iapersonal.app.br/api/v1/payments/webhooks/asaas` |
| Webhook URL transferências | `https://api.iapersonal.app.br/api/v1/payments/webhooks/asaas/transfer` |
| Token webhook | `piaWebhook2026Test` (header: `asaas-access-token`) |

### Bindings Cloudflare (wrangler.toml)

| Tipo | Binding | Status |
|---|---|---|
| D1 Database | `DB` | ✅ Ativo |
| KV Cache | `KV_CACHE` | ✅ Ativo |
| KV Sessions | `KV_SESSIONS` | ✅ Ativo |
| KV Rate Limit | `KV_RATE_LIMIT` | ✅ Ativo |
| R2 Videos | `R2_VIDEOS` | ✅ Ativo |
| R2 Images | `R2_IMAGES` | ✅ Ativo |
| Analytics | `ANALYTICS` | ✅ Ativo |
| Hyperdrive | `HYPERDRIVE` | ❌ Comentado |
| 4 Queues | EMAIL/VIDEO/PDF/AI | ❌ Comentados |
| 4 Crons | daily triggers | ❌ Comentados |
| Custom domain | `api.iapersonal.app.br` | ❌ Comentado |

---

## 🗃️ Banco de Dados — 30 Tabelas PostgreSQL

| # | Tabela | Finalidade |
|---|---|---|
| 1 | `users` | Usuários (email, senha, tipo, role) |
| 2 | `personals` | Perfil do personal (CREF, plano, slug) |
| 3 | `students` | Alunos vinculados a personal |
| 4 | `workouts` | Treinos |
| 5 | `workout_exercises` | Exercícios de um treino |
| 6 | `workout_logs` | Logs de treinos completados |
| 7 | `assessments` | Avaliações físicas |
| 8 | `student_badges` | Badges de gamificação |
| 9 | `payments` | Cobranças Asaas/Stripe |
| 10 | `affiliates` | Programa de afiliados |
| 11 | `referrals` | Vínculos afiliado↔referido |
| 12 | `affiliate_commissions` | Comissões |
| 13 | `personal_reviews` | Avaliações de alunos |
| 14 | `workout_plans` | Marketplace de planos |
| 15 | `plan_purchases` | Compras de planos |
| 16 | `notifications` | Notificações in-app |
| 17 | `personal_settings` | Configurações do personal |
| 18 | `payment_subscriptions` | Assinaturas recorrentes |
| 19 | `pix_transfers` | Saques PIX |
| 20 | `asaas_customers` | Cache de clientes Asaas |
| 21 | `ai_usage_logs` | Tracking de uso de IA (billing/analytics) |
| 22 | `conversations` | Conversas chat personal↔aluno |
| 23 | `messages` | Mensagens das conversas |
| 24 | `user_passkeys` | Credenciais WebAuthn/Passkey biométrico |

**D1 (cold data):** `exercises` (79), `muscle_groups` (14), `workout_templates`, `series_types`, `equipment_types`

---

## 🎯 FASES DE EXECUÇÃO

### Prioridade de implementação:
```
FASE 1  → OneSignal + Push Notifications        ✅ CONCLUÍDA (13/02/2026)
FASE 2  → Triggers Automáticos                   ✅ CONCLUÍDA (13/02/2026)
FASE 3  → Dashboard Pro (Recharts)                ✅ CONCLUÍDA (13/02/2026)
FASE 4  → App do Aluno Premium                    ✅ CONCLUÍDA (14/02/2026)
FASE 8  → LGPD, Segurança & Termos               ✅ CONCLUÍDA (14/02/2026)
FASE 9  → Production Blockers (SEO/GA4/Security)  ✅ CONCLUÍDA (14/02/2026)
FASE 5  → Pagamentos Produção (Asaas live)        ✅ CONCLUÍDA (14/02/2026)
FASE 6  → Workers Paid + Queues/Crons ($5/mês)    ❌ PENDENTE
FASE 7  → Chat & Comunicação                      ✅ CONCLUÍDA (14/02/2026)
FASE 10 → Testes, CI/CD, Monitoramento            ❌ PENDENTE
```

---

## ✅ FASE 1 — OneSignal + Push Notifications [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 13/02/2026

### O que foi implementado:

- ✅ **OneSignal App criado:** ID `3043de4e-d7aa-4fa1-a61b-5abea28d2f47`
- ✅ **Secrets configurados:** `ONESIGNAL_APP_ID` + `ONESIGNAL_REST_API_KEY` no Worker
- ✅ **Service Worker:** `OneSignalSDKWorker.js` em `/public/` com SDK v16
- ✅ **SW integrado:** `sw.js` importa OneSignal SDK sem conflito de escopo
- ✅ **Provider React:** `src/components/providers/onesignal-provider.tsx`
  - Carrega SDK via `<Script>`
  - `OneSignal.login(userId)` após autenticação
  - Tags: `user_type`, `personal_id`, `user_name`
  - `OneSignal.logout()` no logout
- ✅ **Push Prompt:** `src/components/pwa/push-notification-prompt.tsx`
  - Card inteligente no dashboard
  - Exibe após 2º login (personal) ou 3º login (aluno)
  - Toggle permanente em Settings
- ✅ **Helper Backend:** `lib/onesignal.ts` (~210 linhas)
  - `sendPush()` — core, REST API v1
  - `notify()` — high-level (in-app + push)
  - `notifyNewWorkout()` — treino atribuído
  - `notifyPaymentReceived()` — pagamento confirmado
  - `notifyPaymentOverdue()` — pagamento vencido
  - `notifyNewStudent()` — aluno aceito
  - `notifyAssessmentCompleted()` — avaliação feita
  - `notifyTrialExpiring()` — trial expirando
- ✅ **Segments OneSignal:** Configurados no painel
- ✅ **Toggle Settings:** Componente no `/dashboard/settings`

---

## ✅ FASE 2 — Triggers Automáticos de Notificação [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 13/02/2026

### O que foi implementado:

- ✅ **7 triggers automáticos** inseridos nos endpoints reais (best-effort pattern)
- ✅ **payments.ts** — `notifyPaymentReceived()` no webhook PAYMENT_CONFIRMED
- ✅ **payments.ts** — `notifyPaymentOverdue()` no webhook PAYMENT_OVERDUE
- ✅ **payments.ts** — `notify()` ao criar cobrança (aluno notificado)
- ✅ **workouts.ts** — `notifyNewWorkout()` ao criar treino para aluno
- ✅ **students.ts** — `notifyNewStudent()` ao aceitar convite
- ✅ **assessments.ts** — `notifyAssessmentCompleted()` ao criar avaliação
- ✅ **auth.ts** — `notify()` welcome message ao registrar (in-app only)
- ✅ **Pattern:** `.catch(() => {})` em todas as chamadas (best-effort, nunca falha o endpoint principal)

### Arquivos modificados:
- `workers/api/payments.ts` — 3 triggers (confirmed, overdue, created)
- `workers/api/workouts.ts` — 1 trigger (new workout)
- `workers/api/students.ts` — 1 trigger (accept invite)
- `workers/api/assessments.ts` — 1 trigger (assessment completed)
- `workers/api/auth.ts` — 1 trigger (welcome)

---

## ✅ FASE 3 — Dashboard Pro [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 13/02/2026

### O que foi implementado:

- ✅ **Recharts** instalado como dependência
- ✅ **6 componentes de gráficos** criados:
  - `src/components/dashboard/charts/revenue-chart.tsx` — AreaChart receita mensal (6 meses)
  - `src/components/dashboard/charts/students-chart.tsx` — PieChart alunos ativos/inativos/pendentes
  - `src/components/dashboard/charts/workouts-chart.tsx` — BarChart treinos por semana (últimas 8 semanas)
  - `src/components/dashboard/charts/payments-chart.tsx` — BarChart stacked pagamentos por status
  - `src/components/dashboard/charts/student-progress-chart.tsx` — LineChart progresso do aluno
  - `src/components/dashboard/charts/student-frequency-chart.tsx` — BarChart frequência semanal
- ✅ **Dashboard Personal** redesenhado com gráficos reais
- ✅ **Dashboard Aluno** com progresso e frequência
- ✅ **Sparklines** nos cards de stats
- ✅ **Variação percentual** com indicadores ▲/▼ coloridos
- ✅ **Theme dark** — gráficos com cores consistentes (zinc/brand)

---

## ✅ FASE 4 — App do Aluno Premium [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 14/02/2026

### O que foi implementado:

#### 4.1 Treino Interativo
- ✅ **`src/components/workouts/workout-execution.tsx`** — Componente principal com 5 fases:
  1. **Overview** — lista de exercícios, estimativa de tempo
  2. **Active** — exercício atual com inputs de reps/carga por série
  3. **Rest** — timer de descanso circular com countdown SVG
  4. **Summary** — feedback (sentimento, notas), revisão do treino
  5. **Complete** — celebração com XP ganho, badges desbloqueados, confetes
- ✅ **`src/components/workouts/rest-timer.tsx`** — Timer circular SVG:
  - Transição de cores (verde → amarelo → vermelho)
  - Vibração ao completar (Vibration API)
  - Botão skip, toggle som
- ✅ **`src/app/dashboard/workouts/execute/page.tsx`** — Nova rota
- ✅ **`POST /workouts/:id/complete`** — Reescrito com:
  - Cálculo correto de streaks (compara datas, trata mesmo dia e dia consecutivo)
  - XP: 50 base + bônus de streak (3+ dias: +10, 7+ dias: +20)
  - Retorna `stats`, `new_badges`, `xp_earned`
- ✅ **`useCompleteWorkout`** hook no `use-workouts.ts`

#### 4.2 Gamificação
- ✅ **`src/components/workouts/gamification-card.tsx`**:
  - `calculateLevel(totalWorkouts, totalBadges)` — XP = workouts×50 + badges×100
  - `GamificationCard` — barra de XP, nível, próximo nível
  - `XPEarnedBanner` — celebração animada ao ganhar XP
- ✅ **7 badges automáticos:** `first_workout`, `workouts_10/50/100`, `streak_7/30/100`
- ✅ **`checkAndAwardBadges()`** retorna badges recém-desbloqueados
- ✅ **Nível/XP no dashboard** do aluno (welcome header)

#### 4.3 Evolução Visual
- ✅ **`src/components/workouts/photo-comparison.tsx`** — Slider before/after com drag
- ✅ **"Treinar Agora" CTA** no dashboard do aluno
- ✅ **Treinos clicáveis** com ícone Play para treinos ativos

### Deploy: Backend v454f062b + Frontend 62860745

---

## ✅ FASE 5 — Pagamentos Produção (Asaas Live) [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 14/02/2026

### O que foi implementado:

#### 5.1 Migração Sandbox → Produção
- ✅ API Key de produção configurada via `wrangler secret put ASAAS_API_KEY`
- ✅ `lib/asaas.ts` auto-detecta pelo prefixo da chave:
  - `$aact_hmlg_xxx` → sandbox | `$aact_xxx` → produção
- ✅ URL automática: `https://api.asaas.com/v3` (produção)

#### 5.2 Segurança de Produção
- ✅ **Turnstile bypass removido** — `XXXX.DUMMY.TOKEN.XXXX` não funciona mais em `lib/turnstile.ts`
- ✅ **Webhook token forte** — 64 hex chars gerado com `openssl rand -hex 32`
- ✅ Token atualizado via `wrangler secret put ASAAS_WEBHOOK_TOKEN`
- ⚠️ **PENDENTE:** Atualizar o novo token no painel Asaas → Configurações → Webhooks

#### 5.3 Webhooks Configurados
- ✅ Cobranças: `POST /api/v1/payments/webhooks/asaas`
  - Eventos: CONFIRMED, RECEIVED, OVERDUE, REFUNDED, DELETED, PAYMENT_CREATED
  - Processa: atualiza status, gera comissão de afiliado, notificação push
- ✅ Transferências: `POST /api/v1/payments/webhooks/asaas/transfer`
  - Eventos: TRANSFER_DONE, TRANSFER_FAILED, TRANSFER_CANCELLED, etc.
  - Processa: atualiza status do saque, notifica personal

#### 5.4 Migration ai_usage_logs
- ✅ Tabela `ai_usage_logs` criada no Neon (UUID, 3 indexes)
- ✅ Migration SQL corrigida: `UUID` em vez de `VARCHAR(36)` (compatível com `users.id`)

#### 5.5 Auth Guards Verificados
- ✅ `use-payments.ts` — 6 queries com `isHydrated` guard
- ✅ `use-admin.ts` — 8 queries com `isHydrated` guard
- ✅ Todos os 22+ hooks confirmados com auth guard

#### 5.6 Funcionalidades de Pagamento Ativas
- ✅ Cobranças avulsas (PIX, boleto, cartão)
- ✅ Assinaturas recorrentes (séries, mensal, trimestral, etc.)
- ✅ Saques PIX para personal (detecção automática de tipo de chave)
- ✅ Split automático: 3.5% taxa plataforma
- ✅ Comissões de afiliados (25/30/35% por tier)
- ✅ QR Code PIX automático
- ✅ Marketplace de planos de treino

### Deploy: Backend v f5843bed + Frontend 872a9ed6

---

## FASE 6 — Workers Paid + Queues/Crons
> **Prioridade:** 🟡 ALTA · **Estimativa:** 2-3h · **Dependência:** Fase 5

### 6.1 Upgrade para Workers Paid ($5/mês)
- [ ] Ativar plano pago no Cloudflare dashboard
- [ ] Descomentar bindings no `wrangler.toml`:
  - 4 Queues (email, video, pdf, ai)
  - 4 Cron Triggers
  - Hyperdrive

### 6.2 Queue: Email Sender
- [ ] Ativar `vfiti-email-sender` queue
- [ ] Consumer já existe no `index.ts` — testar
- [ ] Templates de email:
  - Bem-vindo
  - Cobrança criada
  - Pagamento confirmado
  - Treino disponível
  - Lembrete de pagamento
  - Reset de senha (já existe)

### 6.3 Cron: Daily Jobs
- [ ] `0 8 * * *` — Lembrete diário de treino (alunos com treino hoje)
- [ ] `0 */4 * * *` — Verificar pagamentos vencidos → notificar
- [ ] `0 2 * * 1` — Calcular comissões de afiliados da semana
- [ ] `0 3 * * *` — Cache warming (já implementado)

### Entregáveis Fase 6:
- ✅ Emails automáticos via Queue
- ✅ 4 Crons rodando diariamente
- ✅ Hyperdrive ativo (connection pooling)

---

## ✅ FASE 7 — Chat & Comunicação [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 14/02/2026

### O que foi implementado:

#### 7.1 Database (2 tabelas + 6 índices)
- ✅ **`conversations`** — unique(personal_id, student_id), unread counters, archive, last_message_at/preview
- ✅ **`messages`** — text/image/audio/workout/system types, JSONB metadata, read_at tracking
- ✅ **Migration** `0004_chat_tables.sql` — rodada no Neon via psql
- ✅ **6 índices** incluindo partial index em mensagens não lidas

#### 7.2 Backend API (7 endpoints)
- ✅ **`workers/schemas/chat.ts`** — 4 schemas Zod (sendMessage, listMessages, createConversation, listConversations)
- ✅ **`workers/api/chat.ts`** — 7 endpoints auth-protected:
  - `GET /chat/unread-count` — contagem total de não lidas
  - `GET /chat/conversations` — listar conversas com preview + filtros
  - `POST /chat/conversations` — criar ou obter conversa existente
  - `GET /chat/conversations/:id/messages` — mensagens com paginação
  - `POST /chat/conversations/:id/messages` — enviar + push notification
  - `PATCH /chat/conversations/:id/read` — marcar como lido (zera unread counter)
  - `PATCH /chat/conversations/:id/archive` — arquivar/desarquivar
- ✅ **Segurança:** `verifyConversationAccess()` valida que user pertence à conversa
- ✅ **Push integrado:** `notify()` em novas mensagens com deep link `/dashboard/messages?conversation={id}`

#### 7.3 Frontend Hooks (7 hooks com auth guard)
- ✅ **`src/hooks/use-chat.ts`**:
  - `useConversations` (polling 15s)
  - `useMessages` (polling 5s quando ativo)
  - `useUnreadMessages` (polling 30s)
  - `useCreateConversation`, `useSendMessage`, `useMarkRead`, `useArchiveConversation`

#### 7.4 Frontend Componentes (5 componentes)
- ✅ **`ConversationList`** — busca, avatares, unread badges, skeleton loading, timestamps relativos (date-fns)
- ✅ **`ChatWindow`** — header com participante, auto-scroll, mark-as-read automático, menu ações
- ✅ **`MessageBubble`** — own/other styling, system messages, imagem, read status (Check/CheckCheck)
- ✅ **`ChatInput`** — textarea auto-resize, Enter/Shift+Enter, botão enviar
- ✅ **`EmptyChat`** — estados: nenhuma conversa selecionada / nenhuma conversa

#### 7.5 Página de Mensagens
- ✅ **`/dashboard/messages`** — split layout responsivo (lista esquerda + chat direita)
- ✅ **Deep link** via `?conversation=ID` (push notifications)
- ✅ **Mobile responsive** — alterna entre lista e chat
- ✅ **Navegação** — "Mensagens" adicionado ao menu personal e aluno

### Arquitetura:
- **Polling-based** (sem WebSocket — CF free plan não suporta)
- Conversas: 15s │ Mensagens ativas: 5s │ Unread count: 30s
- Push via OneSignal em cada nova mensagem

---

## ✅ FASE 8 — LGPD, Segurança & Termos [CONCLUÍDA]
> **Status:** ✅ 100% Concluída em 14/02/2026

### O que foi implementado:

#### 8.1 Páginas Legais (Enterprise, Ultra Modern)
- ✅ **`src/app/(legal)/layout.tsx`** — Layout compartilhado com branding, nav, ambient glow
- ✅ **`src/app/(legal)/termos/page.tsx`** — Termos de Uso:
  - 10 seções com ícones Lucide e TOC navegável
  - Texto enterprise: LGPD, CDC, Marco Civil da Internet
  - Versão 2.0, badge, data de atualização
- ✅ **`src/app/(legal)/privacidade/page.tsx`** — Política de Privacidade:
  - Tabela de dados × finalidade × base legal (DataTable component)
  - Seção de direitos LGPD Art. 18 com 6 cards
  - Controlador, DPO, retenção de dados
- ✅ **`src/app/(legal)/cookies/page.tsx`** — Política de Cookies:
  - CookieCard component por cookie individual
  - Cookies essenciais (auth-storage, __cf_bm, cf_clearance)
  - Analytics auto-aprovados (Cloudflare Analytics = server-side, sem PII)
  - Links para políticas de terceiros (OneSignal, Google)

#### 8.2 Cookie Consent Banner
- ✅ **`src/components/ui/cookie-consent.tsx`** — Banner enterprise:
  - Auto-approve analytics (Cloudflare Analytics = privacy-first)
  - Toggle granular com switch buttons (essential fixo, analytics configurável)
  - localStorage persistence com versionamento (`pia-cookie-consent` v2.0)
  - Backdrop blur + slide-in animation
  - Links para Termos, Privacidade, Cookies
  - Adicionado ao `Providers` (aparece em todas as páginas)

#### 8.3 LGPD Backend
- ✅ **`DELETE /users/me`** — Anonimização completa (Art. 16 LGPD):
  - Substitui nome por "Usuário Removido", email por `anon_xxx@deleted.iapersonal.app.br`
  - CPF zerado, phone/password/avatar removidos
  - Perfil anonimizado (CREF deleted, slug removido, bio null)
  - Fotos removidas do R2 (best-effort)
  - Sessões revogadas no KV
  - Log de auditoria na tabela notifications
- ✅ **`GET /users/me/data-export`** — Portabilidade (Art. 18, V):
  - Retorna JSON completo com metadados LGPD (_meta com DPO, base legal)
  - Dados do usuário + perfil + treinos + logs + avaliações + badges + pagamentos + notificações
  - Diferenciado por tipo (personal exporta alunos criados, student exporta logs)

#### 8.4 Consentimento nos Formulários
- ✅ **`register/personal/page.tsx`** — Checkbox obrigatório "Li e aceito os Termos de Uso e Política de Privacidade"
- ✅ **`register/student/page.tsx`** — Mesmo checkbox, bloqueia submit até aceitar
- ✅ Links abrem `/termos` e `/privacidade` em nova aba

### Deploy: Backend 69fbe868 + Frontend 70126f36

---

## FASE 9 — Polish Visual & UX
> **Prioridade:** 🟢 MÉDIA · **Estimativa:** 4-5h · **Dependência:** Fases 3-4
> **NOTA:** FASE 9 foi reformulada para "Production Blockers" e CONCLUÍDA em 14/02/2026

### ✅ Production Blockers — Tudo Concluído (14/02/2026)

#### Auth Guards (CRÍTICO)
- ✅ **22 query hooks** em 5 arquivos receberam `isHydrated` check
- ✅ Padrão: `const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)` + `enabled: isReady`
- ✅ Arquivos: `use-workouts.ts`, `use-students.ts`, `use-assessments.ts`, `use-affiliates.ts`, `use-student-app.ts`
- ✅ Previne 401 → demo mode silencioso antes do Zustand reidratar

#### Demo Mode Recovery
- ✅ `api-client.ts`: Recovery automático via retry a cada 30s (`/health`)
- ✅ `DemoModeBanner` component: banner amarelo fixo quando demo mode ativo
- ✅ `CustomEvent('demo-mode-change')` para comunicação reativa

#### SEO Completo (3/10 → 9/10)
- ✅ `metadataBase`: hardcoded `https://iapersonal.app.br` (era localhost:3000)
- ✅ OG Image: `public/og-image.png` (1200×630, 64KB) + SVG source
- ✅ Twitter Cards: `summary_large_image` com imagem e descrição
- ✅ `public/robots.txt`: Allow público, Disallow dashboard/auth
- ✅ `public/sitemap.xml`: 8 URLs com priority/changefreq
- ✅ Canonical URLs via `alternates.canonical`
- ✅ Keywords expandidos: 10 termos SEO
- ✅ robots meta: index, follow, googleBot com max-snippet

#### Google Analytics 4
- ✅ Measurement ID: `G-XGXZ4R6JXH`
- ✅ gtag.js no `<head>` de `layout.tsx`
- ✅ CSP atualizado para permitir domínios GA

#### JSON-LD AEO/GEO 2026
- ✅ `SoftwareApplicationSchema`: preço R$0, rating 4.8, 8 features listados
- ✅ `OrganizationSchema`: nome, logo, contact
- ✅ `FAQSchema`: 6 perguntas/respostas (landing page)

#### Security Headers (0/10 → 10/10)
- ✅ Content-Security-Policy (strict, domínios whitelistados)
- ✅ Strict-Transport-Security (HSTS com preload)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera/mic/geo bloqueados

#### Migration
- ✅ `migrations/hyperdrive/0003_ai_usage_logs.sql` — CREATE TABLE + 3 indexes
- ⏳ Precisa rodar no Neon (SQL pronta)

### 9.1 Responsividade (Pendente — pós-lançamento)
- [ ] Testar e corrigir TODAS as telas em:
  - iPhone SE (375px)
  - iPhone 14 Pro (393px)
  - Samsung Galaxy (360px)
  - iPad (768px)
  - Desktop (1920px)
- [ ] Bottom nav no mobile (tab bar nativo feel)

### 9.2 Skeleton Loading
- [ ] Skeleton screens em TODAS as listagens
- [ ] Shimmer animation consistente
- [ ] Loading states bonitos (não spinners genéricos)

### 9.3 Micro-interactions
- [ ] Toast notifications com animação suave
- [ ] Haptic feedback (vibração) em ações importantes
- [ ] Pull-to-refresh no mobile
- [ ] Swipe actions em listagens (swipe para deletar/editar)
- [ ] Animações de transição entre páginas

### 9.4 Dark Mode Refinement
- [ ] Revisar contrastes (WCAG AA)
- [ ] Ícones consistentes (Lucide em todos)
- [ ] Tipografia: verificar hierarquia visual

### Entregáveis Fase 9:
- ✅ 100% responsivo e testado
- ✅ Skeleton loading em todas as telas
- ✅ Micro-interactions profissionais

---

## FASE 10 — Testes, CI/CD & Monitoramento
> **Prioridade:** 🟡 ALTA · **Estimativa:** 5-6h · **Dependência:** Nenhuma

### 10.1 Testes
- [x] Setup Vitest (unit tests) — **133 testes, 9 arquivos, 100% passing**
- [x] Testes dos helpers: `lib/errors.ts`, `lib/response.ts`, `lib/auth-helpers.ts`, `lib/cache.ts`
- [x] Testes dos schemas: `auth.ts`, `workouts.ts`
- [x] Testes middleware: `auth-middleware.test.ts`
- [x] Testes integration: `auth-flow.test.ts`
- [x] Testes config: `constants.test.ts`
- [ ] Setup Playwright (E2E):
  - Fluxo de registro
  - Fluxo de login
  - Criar aluno → criar treino → cobrar
- [ ] Coverage > 80%

### 10.2 CI/CD
- [ ] GitHub Actions:
  - `lint` → `build` → `test` → `deploy` (automático em push to main)
  - Deploy preview em PRs
- [ ] Wrangler deploy automático

### 10.3 Monitoramento
- [ ] Sentry (error tracking) — Free tier
- [ ] Uptime monitor (BetterStack ou UptimeRobot)
- [ ] Analytics real (Cloudflare Analytics Engine já bind)
- [ ] Health check endpoint melhorado

### Entregáveis Fase 10:
- ✅ Testes unitários e E2E
- ✅ CI/CD automático
- ✅ Monitoramento de erros e uptime

---

## 📅 Timeline Sugerida

| Semana | Fases | Foco | Status |
|--------|-------|------|--------|
| **Semana 1** | 1 + 2 + 3 | Push + Triggers + Dashboard Pro | ✅ Concluída |
| **Semana 1** | 4 + 8 | App Aluno + LGPD | ✅ Concluída |
| **Semana 1** | 9 | Production Blockers (SEO/GA4/Security/Auth Guards) | ✅ Concluída |
| **Semana 1** | 5 | Asaas Produção + Turnstile + Migration | ✅ Concluída |
| **Semana 2** | 7 | Chat & Comunicação (polling-based) | ✅ Concluída |
| **Semana 2** | 6 | Workers Paid + Queues/Crons | ⏳ Requer upgrade $5/mês |
| **Semana 3** | 10 | Testes + CI/CD | ❌ Pendente |

**Progresso: 8/10 fases concluídas (80%)**
**Tempo restante estimado: ~10-15h de desenvolvimento**

---

## 🔧 Sprints Pós-Fases (16-17/02/2026)

### Sprint 1 — Bug Fixes & Security (16/02/2026)
- ✅ **17 bugs SQL corrigidos** em 7 arquivos backend (chat, reviews, LGPD, admin, passkey, assessments)
- ✅ Nomes de colunas corrigidos (slug→public_url_slug, plan_type→subscription_plan, weight→weight_kg, etc.)
- ✅ Passkey login fix (credential lookup corrigido)
- ✅ Segurança: SQL injection prevention, input validation
- **Arquivos:** `workers/api/chat.ts`, `reviews.ts`, `users.ts`, `admin.ts`, `passkey.ts`, `assessments.ts`, `payments.ts`

### Sprint 2 — Vitest Setup + Optimistic Updates (16/02/2026)
- ✅ **Vitest v4.0.18** configurado com `vitest.config.ts`
- ✅ **86 testes** em 6 arquivos criados
- ✅ Optimistic updates em mutations TanStack Query
- ✅ Hyperdrive binding ativado no wrangler.toml
- **Arquivos:** `tests/config/constants.test.ts`, `tests/lib/errors.test.ts`, `tests/lib/response.test.ts`, `tests/lib/auth-helpers.test.ts`, `tests/lib/cache.test.ts`, `tests/api/auth-middleware.test.ts`

### Sprint 3 — CI + Export/Import + Dark Mode + Integration Tests (16/02/2026)
- ✅ **+47 testes** (total: 133) em 3 novos arquivos
- ✅ Export/import de treinos (JSON)
- ✅ Dark mode polish
- ✅ Integration tests (auth flow completo)
- **Arquivos:** `tests/api/auth-schema.test.ts`, `tests/api/workout-schema.test.ts`, `tests/integration/auth-flow.test.ts`

### Hotfix — Hyperdrive TCP vs neon() HTTP (17/02/2026)
- ✅ **Diagnóstico:** `neon()` é HTTP-only driver, Hyperdrive TCP (`connectionString` com porta 5432) causa HTTP 530 error 1016
- ✅ **Fix:** `lib/db.ts` `getHyperdriveUrl()` sempre usa `NEON_DATABASE_URL` (HTTP) em vez de `HYPERDRIVE.connectionString` (TCP)
- ✅ **Deploy:** Worker version `37a1e899-3cca-4b7d-95d1-98cc5867dc65`
- ✅ **Verificado:** Todos os endpoints PG funcionando
- **Solução futura:** Migrar de `neon()` para `Pool` de `@neondatabase/serverless` (suporta TCP nativo)

### Hotfix — TypeScript Errors em Testes (17/02/2026)
- ✅ `tsconfig.json` — adicionado `"tests/**/*.ts"` ao `include` para path aliases resolverem
- ✅ `tests/config/constants.test.ts` — `Object.values()` casts para `as const` objects
- ✅ `tests/lib/response.test.ts` — `res.json()` casts com tipo `Json`
- ✅ `tests/lib/auth-helpers.test.ts` — `signAccessToken` payload corrigido (added email, removed role)
- ✅ `tests/api/auth-middleware.test.ts` — `err as AppError` cast, unused param removido
- ✅ `tests/api/auth-schema.test.ts` — variável `_unused` com `void`

---

## ⚠️ Issues Conhecidos

| Issue | Severidade | Detalhe |
|---|---|---|
| Tailwind v4 warnings | 🟢 Baixa | ~150 sugestões de classes (cosmético, não afeta build) |
| `<img>` vs `<Image>` | 🟢 Baixa | 3 arquivos usam `<img>` em vez de `next/image` |
| Stripe webhook | 🟡 Média | Parcialmente implementado (falta verificar assinatura) |
| Queues/Crons | 🟡 Média | Código existe mas desabilitado no wrangler.toml (free plan) |
| Hyperdrive | ⚠️ Média | Configurado mas BYPASSED — `neon()` HTTP driver incompatível com TCP. Migrar para `Pool` |
| Custom domain API | 🟡 Média | `api.iapersonal.app.br` comentado no wrangler.toml |
| Webhook Asaas token | 🔴 Alta | Token atualizado no Worker, **PRECISA atualizar no painel Asaas** → Configurações → Webhooks |

---

## 🔑 Comandos Úteis

```bash
# Deploy backend
npx wrangler deploy --env=""

# Deploy frontend
npm run build && CLOUDFLARE_ACCOUNT_ID=b0bf95d0fabb322ac3df37bd84ec0c77 npx wrangler pages deploy out --project-name=personal-ia-prod --commit-dirty=true

# Secrets
echo "valor" | npx wrangler secret put NOME --env=""

# Logs tempo real
npx wrangler tail --format=pretty

# Login teste
curl -s -X POST "https://api.iapersonal.app.br/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<admin_email>","password":"<admin_password>","turnstile_token":"<turnstile_token_real>"}'

# PostgreSQL local
/opt/homebrew/opt/libpq/bin/psql "$NEON_DATABASE_URL"
```

---

## 💰 Custos Mensais Projetados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Cloudflare Workers | Paid | $5/mês |
| Cloudflare Pages | Free | $0 |
| Neon PostgreSQL | Free (0.5GB) | $0 |
| OneSignal | Free (10k subs) | $0 |
| Asaas | Pay-per-use | ~1% por transação |
| Resend (email) | Free (100/dia) | $0 |
| Domínio | .app.br | ~R$ 40/ano |
| **Total** | | **~$5/mês + taxas transação** |

---

## 🎯 Definição de "Perfeito"

O produto estará "perfeito" quando:

1. ✅ Personal cria conta → cadastra alunos → gera treino IA → cobra → recebe PIX
2. ✅ Aluno recebe push → abre app → faz treino interativo → registra carga
3. ✅ Personal recebe push de pagamento confirmado em tempo real
4. ✅ Tudo funciona offline (PWA) e no celular
5. ✅ Dashboard com métricas reais e gráficos
6. ✅ Chat entre personal e aluno
7. ✅ LGPD compliant
8. ✅ Zero erros em produção (monitoramento ativo)
9. ✅ Deploy automático em push to main

---

## 🚀 Próximo Passo Imediato

### Opções (em ordem de prioridade):

**FASE 5 — Asaas Produção** 🔴 CRÍTICO
- Trocar API key sandbox → produção
- `echo "KEY_PROD" | npx wrangler secret put ASAAS_API_KEY --env=""`
- URL muda automaticamente pelo prefixo da chave
- Requer conta Asaas produção ativa

**FASE 9 — Polish Visual & UX** 🟡
- Responsividade mobile (375px-1920px)
- Skeleton loading, micro-interactions
- Bottom nav mobile, pull-to-refresh

**FASE 6 — Workers Paid + Queues/Crons** 🟡
- Requer upgrade para Workers Paid ($5/mês)
- Emails automáticos via Queue
- Crons diários (lembrete treino, vencidos)

**FASE 7 — Chat** ✅
- Chat polling-based (7 endpoints, 7 hooks, 5 componentes)
- Página /dashboard/messages com split layout responsivo
- Push notifications em novas mensagens

**FASE 10 — Testes & CI/CD** 🟢
- Vitest + Playwright
- GitHub Actions
- Sentry error tracking

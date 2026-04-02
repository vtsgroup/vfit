# 🏗️ Backend — VFIT API

> Atualizado em 26/02/2026

## Visão Geral

| Item | Valor |
|---|---|
| **Runtime** | Cloudflare Workers |
| **Framework** | Hono v4 (TypeScript) |
| **Entry Point** | `workers/index.ts` |
| **Endpoints** | ~180+ (22 sub-routers — atualizado mar/2026) |
| **URL Produção** | https://api.iapersonal.app.br |
| **Worker Name** | `vfiti-api` |
| **Database** | Neon PostgreSQL 17 (HTTP via `neon()`, sem Hyperdrive TCP) |
| **Testes** | 207 Vitest (16 arquivos, 100% passing) |

---

## 🗂️ Estrutura de Arquivos

```
workers/
├── index.ts              # App Hono principal (~450 linhas)
├── types.ts              # Bindings, Variables, JWTPayload, AppContext
├── api/
│   ├── auth.ts           # Registro, login, tokens, sessões, 2FA, reset (15 endpoints)
│   ├── oauth.ts          # Google + Facebook OAuth (4 endpoints)
│   ├── users.ts          # CRUD user + upload foto R2 + LGPD (7 endpoints)
│   ├── personals.ts      # Perfil + stats + público (5 endpoints)
│   ├── students.ts       # Gestão de alunos (8 endpoints)
│   ├── workouts.ts       # Treinos + exercícios + logs + histórico (18 endpoints)
│   ├── workout-sessions.ts # Sessão guiada de treino (5 endpoints)
│   ├── exercise-media.ts # Mídia por exercício + upload R2 (5 endpoints)
│   ├── assessments.ts    # Avaliações + fotos + PDF + v2 composição + Story analytics (21 endpoints)
│   ├── payments.ts       # Pagamentos + webhooks + marketplace (~22 endpoints)
│   ├── affiliates.ts     # Programa de afiliados (7 endpoints)
│   ├── reviews.ts        # Reviews de alunos (7 endpoints)
│   ├── notifications.ts  # Notificações in-app + preferências (8 endpoints)
│   ├── ai.ts             # Geração IA + transcrição (8 endpoints)
│   ├── ai.ts             # Geração IA + transcrição (8 endpoints)
│   ├── chat.ts           # Chat personal↔aluno, polling (7 endpoints)
│   ├── passkey.ts        # WebAuthn/Passkey biométrico (7 endpoints)
│   ├── search.ts         # Busca unificada para command palette (1 endpoint)
│   ├── admin.ts          # Admin panel completo (15 endpoints)
│   ├── calendar.ts       # Agenda/eventos (4 endpoints) — tabela lazy-created
│   ├── feedback.ts       # Sugestões/melhorias + auto-reply IA (4 endpoints)
│   ├── agents.ts         # Agentes Unipile/Instagram com kill-switch (3 endpoints)
│   └── cpf.ts            # Consulta CPF via HubDev — público, rate-limited (1 endpoint)
├── middleware/
│   ├── auth.ts           # JWT verify (Web Crypto) + requireType
│   ├── cors.ts           # Multi-origin CORS
│   ├── rate-limit.ts     # Rate limiting via KV
│   ├── analytics.ts      # Analytics Engine tracking
│   ├── request-id.ts     # X-Request-Id header
│   └── request-logger.ts # Request logging (aplicado globalmente via app.use('*'))
├── schemas/
│   ├── auth.ts           # 9 schemas Zod (register, login, reset, etc.)
│   ├── users.ts          # 7 schemas (update, photo, settings)
│   ├── workouts.ts       # 17 schemas (create, exercises, logs, templates, history)
│   ├── workout-sessions.ts # 2 schemas (advance, log)
│   ├── exercise-media.ts # 3 schemas (create, update, upload)
│   ├── assessments.ts    # 15 schemas (create, photos, notifications, skinfolds, bioimpedance, protocol)
│   ├── payments.ts       # 11 schemas (payments, plans, subscriptions)
│   ├── ai.ts             # 9 schemas (generate, compare, chat)
│   └── chat.ts           # 4 schemas (sendMessage, listMessages, createConversation, listConversations)
├── cron/
│   └── xp-expiration.ts  # handleXPExpiration — executado pelo cron 0 3 * * * (ATIVO)
└── queues/               # Queue consumers — vfiti-email-sender (ATIVO), pdf-generator (ATIVO), video-encoder e ai-batch (TODO)

lib/
├── db.ts                 # pgQuery (Neon) + d1Query helpers + generateId
├── auth-helpers.ts       # JWT sign/verify (Web Crypto), bcrypt, sessions
├── asaas.ts              # Client Asaas completo (18 funções exportadas)
├── onesignal.ts          # OneSignal push + in-app (8 funções)
├── errors.ts             # AppError + 8 subclasses (400-503)
├── response.ts           # success(), created(), noContent(), paginated()
├── turnstile.ts          # Cloudflare Turnstile verification
├── cache.ts              # KV cache: cacheGetOrFetch(), cacheInvalidate()
├── email-resend.ts       # Email via Resend API
├── email.ts              # Email via Queue (graceful degrade)
├── ai-prompts.ts         # Prompts para IA (Replicate)
├── version.ts            # APP_VERSION auto
├── unipile-agents.ts     # dispatchInstagramAgent + getUnipileAgentsConfig (agents.ts)
├── cpf-lookup.ts         # lookupCpf via HubDev API (cpf.ts)
└── calendar-reminders.ts # dispatchCalendarReminders — usado pelo cron 0 8 * * *

config/
├── constants.ts          # PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL
├── ai-models.ts          # Mapeamento de modelos IA
└── index.ts              # Barrel export
```

---

## 📡 Endpoints Completos (~145)

### Rotas Públicas (sem autenticação)

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/` | Health check básico |
| `GET` | `/health` | Health check detalhado (D1, KV, R2) |
| `GET` | `/api/v1/exercises` | Exercícios (D1, com filtros) |
| `GET` | `/api/v1/muscle-groups` | Grupos musculares (D1) |
| `GET` | `/api/v1/templates` | Templates de treino (D1) |
| `GET` | `/api/v1/series-types` | Tipos de séries (D1) |
| `GET` | `/api/v1/equipment-types` | Tipos de equipamento (D1) |
| `GET` | `/api/v1/personals/:slug/public` | Perfil público de personal |
| `GET` | `/api/v1/reviews/personal/:personalId` | Reviews públicas |
| `GET` | `/api/v1/invitations/:token/info` | Dados do personal para página de cadastro via convite (full_name, photo, cref, specialties, student_name) |
| `GET` | `/api/v1/assessments/share/:token` | Avaliação compartilhada via token público (mínimo 32 chars) |
| `POST` | `/api/v1/cpf/lookup` | Consulta nome por CPF + data nascimento (rate limit: 5/min por IP; LGPD-compliant) |

### Auth (`/api/v1/auth`) — 15 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/register/personal` | Turnstile | Registro de personal |
| `POST` | `/register/student` | Turnstile | Registro de aluno (via convite) |
| `POST` | `/login` | Turnstile | Login email/senha → JWT |
| `POST` | `/refresh` | ❌ | Renovar access token |
| `POST` | `/logout` | ✅ | Logout + blacklist tokens |
| `POST` | `/forgot-password` | Turnstile | Solicitar reset |
| `POST` | `/reset-password` | ❌ | Redefinir senha via token |
| `POST` | `/verify-email` | ❌ | Verificar email |
| `POST` | `/change-password` | ✅ | Alterar senha |
| `GET` | `/me` | ✅ | Dados user + profile |
| `GET` | `/sessions` | ✅ | Listar sessões ativas do usuário |
| `DELETE` | `/sessions/:sessionId` | ✅ | Revogar sessão específica do próprio usuário |
| `POST` | `/2fa/setup` | ✅ | Iniciar setup 2FA TOTP |
| `POST` | `/2fa/verify` | ✅ | Confirmar código e habilitar 2FA |
| `POST` | `/2fa/disable` | ✅ | Desabilitar 2FA com código TOTP |

### OAuth (`/api/v1/auth/oauth`) — 4 endpoints

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/google` | Redirect → Google consent |
| `GET` | `/google/callback` | Callback Google OAuth |
| `GET` | `/facebook` | Redirect → Facebook |
| `GET` | `/facebook/callback` | Callback Facebook OAuth |

### Users (`/api/v1/users`) — 8 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/me` | ✅ | User + profile completo |
| `GET` | `/me/onboarding` | Personal | Estado do onboarding do personal |
| `PATCH` | `/me` | ✅ | Atualizar perfil base |
| `PATCH` | `/me/onboarding` | Personal | Atualizar progresso/conclusão do onboarding |
| `DELETE` | `/me` | ✅ | LGPD: anonimização de conta (Art. 16) |
| `POST` | `/me/photo` | ✅ | URL para upload de foto |
| `PUT` | `/me/photo/upload` | ✅ | Upload direto para R2 |
| `GET` | `/me/data-export` | ✅ | LGPD: portabilidade de dados (Art. 18, V) |

### Personals (`/api/v1/personals`) — 5 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/me` | Personal | Perfil completo |
| `PATCH` | `/me` | Personal | Atualizar perfil |
| `PATCH` | `/settings` | Personal | Configurações |
| `GET` | `/stats` | Personal | Dashboard stats |
| `GET` | `/:slug/public` | ❌ | Perfil público |

### Students (`/api/v1/students`) — 11 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/` | Personal | Listar alunos (paginado) |
| `GET` | `/export?format=csv` | Personal | Exportar alunos em CSV |
| `POST` | `/invite` | Personal | Convidar por email |
| `POST` | `/invite/quick` | Personal | Convite rápido (QR / ao vivo; email opcional) |
| `GET` | `/me` | Student | Meu perfil |
| `PATCH` | `/me` | Student | Atualizar meu perfil |
| `GET` | `/:id` | Personal | Detalhes aluno |
| `PATCH` | `/:id` | Personal | Atualizar aluno |
| `PATCH` | `/:id/user` | Personal | Atualizar dados base do user (nome/telefone/foto) |
| `PATCH` | `/:id/status` | Personal | Mudar status |
| `DELETE` | `/:id` | Personal | Remover (soft) |

### Search (`/api/v1/search`) — 1 endpoint

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/?q=texto&limit=8` | ✅ | Busca unificada (alunos, treinos, cobranças, ações rápidas) |

### Workouts (`/api/v1/workouts`) — 23 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/` | Personal | Criar treino |
| `GET` | `/` | Personal | Listar treinos |
| `GET` | `/my` | Student | Meus treinos |
| `GET` | `/history/heatmap?year=YYYY` | Student | Heatmap anual de dias treinados |
| `GET` | `/history/progress?exercise_id=x&days=180` | Student | Evolução de carga por exercício |
| `GET` | `/logs` | ✅ | Histórico de logs |
| `GET` | `/logs/:id` | ✅ | Detalhe de um log |
| `POST` | `/from-template` | Personal | Clonar de template D1 |
| `GET` | `/:id` | ✅ | Detalhes treino |
| `PATCH` | `/:id` | Personal | Atualizar treino |
| `DELETE` | `/:id` | Personal | Arquivar treino |
| `POST` | `/:id/duplicate` | Personal | Duplicar treino |
| `POST` | `/:id/exercises` | Personal | Adicionar exercício |
| `PATCH` | `/:id/exercises/:eid` | Personal | Atualizar exercício |
| `DELETE` | `/:id/exercises/:eid` | Personal | Remover exercício |
| `PUT` | `/:id/exercises/reorder` | Personal | Reordenar exercícios |
| `POST` | `/:id/complete` | Student | Registrar conclusão (+ XP credit + daily goal + streak best-effort) |
| `GET` | `/:id/history` | ✅ | Histórico do treino |
| `GET` | `/:id/session` | Student | Obter/criar sessão guiada de treino |
| `POST` | `/:id/session/advance` | Student | Avançar fase (`exercise/rest/next_preview/completed`) |
| `POST` | `/:id/session/log` | Student | Registrar log da sessão (sets/reps/carga) |
| `POST` | `/:id/session/complete` | Student | Finalizar sessão e creditar XP |
| `DELETE` | `/:id/session` | Student | Resetar sessão guiada |

### Exercise Media (`/api/v1/exercises`) — 5 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/:exerciseId/media` | ✅ | Listar mídias ativas do exercício |
| `POST` | `/:exerciseId/media` | Personal/Admin | Criar mídia de exercício |
| `PUT` | `/:exerciseId/media/:id` | Personal/Admin | Atualizar mídia |
| `DELETE` | `/:exerciseId/media/:id` | Personal/Admin | Soft delete (`is_active=false`) |
| `POST` | `/:exerciseId/media/upload` | Personal/Admin | Upload direto R2 (vídeo/thumbnail) |

### XP Economy (`/api/v1/xp`) — 11 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/balance` | Student | Saldo XP atual (cached KV 5m) |
| `GET` | `/history` | Student | Histórico de transações (`?limit=50&offset=0`) |
| `GET` | `/limits` | Student | Status de limites diários |
| `GET` | `/goals/today` | Student | Meta diária atual com progresso |
| `GET` | `/goals/history` | Student | Histórico de metas (`?days=7`, max 30) |
| `GET` | `/streak` | Student | Streak atual + milestones (cached KV 10m) |
| `GET` | `/expiring` | Student | XP prestes a expirar (`?days=7`, max 30) |
| `GET` | `/student/:id/balance` | Personal | Saldo de aluno (ownership check) |
| `GET` | `/student/:id/streak` | Personal | Streak de aluno (ownership check) |
| `POST` | `/admin/reverse` | Personal | Reverter transação (`{transaction_id, reason}`) |
| `POST` | `/admin/expire` | Personal | Trigger manual de expiração XP |

### Assessments (`/api/v1/assessments`) — 22 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/story-preference` | ✅ | Buscar preferência de Story (KV por usuário) |
| `POST` | `/story-preference` | ✅ | Salvar preferência de Story (goal, step, play, variant, clean/lock) com fallback best-effort (`saved: false`) se KV indisponível |
| `POST` | `/story-events` | ✅ | Telemetria de Story (open/play/pause/complete/share/export) no Analytics Engine (best-effort, não quebra UX em falha de analytics) |
| `POST` | `/` | Personal | Criar avaliação (v2: calcula composição corporal completa) |
| `GET` | `/` | Personal | Listar avaliações |
| `GET` | `/protocols` | Personal | Listar protocolos disponíveis (Pollock, Petroski, etc.) |
| `GET` | `/my` | Student | Minhas avaliações |
| `GET` | `/my/evolution` | Student | Evolução temporal |
| `GET` | `/student/:studentId/history` | Personal | Histórico completo + séries para gráficos |
| `GET` | `/compare?ids=a,b` | ✅ | Comparar duas avaliações do mesmo aluno |
| `GET` | `/badges/:studentId` | ✅ | Badges gamificação |
| `GET` | `/:id` | ✅ | Detalhes avaliação |
| `GET` | `/:id/evolution` | ✅ | Evolução vs avaliação anterior (diffs, score) |
| `GET` | `/:id/interpretation` | ✅ | Interpretação textual IA |
| `PATCH` | `/:id` | Personal | Atualizar |
| `DELETE` | `/:id` | Personal | Remover + cleanup R2 |
| `POST` | `/:id/photos` | Personal | URL upload foto |
| `PUT` | `/:id/photos/upload` | Personal | Upload direto R2 |
| `DELETE` | `/:id/photos/:photoId` | Personal | Remover foto |
| `GET` | `/:id/pdf` | ✅ | Gerar/baixar PDF |
| `POST` | `/:id/notify` | Personal | Notificar aluno (push + in-app + notified_at) |
| `POST` | `/:id/edit-photos` | Personal | Editar fotos com IA |

### Payments (`/api/v1/payments`) — ~26 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/webhooks/asaas` | Webhook | Webhook Asaas cobranças |
| `POST` | `/webhooks/asaas/transfer` | Webhook | Webhook Asaas transferências (status) |
| `POST` | `/webhooks/asaas/transfer-auth` | Webhook | Webhook Asaas autorização transferências |
| `POST` | `/webhooks/stripe` | Webhook | Webhook Stripe |
| `POST` | `/` | Personal | Criar cobrança (split auto) |
| `GET` | `/` | Personal | Listar pagamentos |
| `GET` | `/stats` | Personal | Estatísticas financeiras |
| `GET` | `/dashboard` | Personal | KPIs financeiros (mês atual/anterior, crescimento, ticket médio, top alunos) |
| `GET` | `/dashboard/chart` | Personal | Séries de gráfico (receita diária 30d e mensal 12m) |
| `GET` | `/dashboard/pending` | Personal | Cobranças pendentes/atrasadas com totais |
| `GET` | `/export?format=csv|pdf&period=month|quarter|year` | Personal | Exportar relatório financeiro em CSV/PDF |
| `POST` | `/link` | Personal | Criar cobrança e retornar link de WhatsApp pré-formatado |
| `GET` | `/my` | Student | Meus pagamentos |
| `GET` | `/:id` | ✅ | Detalhes pagamento |
| `GET` | `/:id/pix` | ✅ | QR Code PIX |
| `PATCH` | `/:id` | Personal | Atualizar status |
| `DELETE` | `/:id` | Personal | Cancelar |
| `POST` | `/subscriptions` | Personal | Criar assinatura recorrente |
| `DELETE` | `/subscriptions/:id` | Personal | Cancelar assinatura |
| `POST` | `/withdraw` | Personal | Solicitar saque PIX |
| `GET` | `/withdrawals` | Personal | Listar saques |
| `POST` | `/plans` | Personal | Criar plano marketplace |
| `GET` | `/plans` | ✅ | Listar planos |
| `GET` | `/plans/:id` | ✅ | Detalhes plano |
| `PATCH` | `/plans/:id` | Personal | Atualizar plano |
| `DELETE` | `/plans/:id` | Personal | Remover plano |
| `POST` | `/plans/:id/buy` | ✅ | Comprar plano |

### Affiliates (`/api/v1/affiliates`) — 7 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/activate` | Personal | Ativar programa |
| `GET` | `/dashboard` | Personal | Dashboard afiliado |
| `GET` | `/link` | Personal | Link + QR code |
| `GET` | `/referrals` | Personal | Listar referidos |
| `GET` | `/commissions` | Personal | Listar comissões |
| `POST` | `/withdraw` | Personal | Solicitar saque PIX |
| `GET` | `/withdrawals` | Personal | Listar saques |

### Reviews (`/api/v1/reviews`) — 7 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/personal/:personalId` | ❌ | Reviews públicas |
| `POST` | `/personal/:personalId` | Student | Criar review |
| `GET` | `/my` | Student | Minha review |
| `PATCH` | `/my` | Student | Atualizar |
| `DELETE` | `/my` | Student | Remover |
| `GET` | `/` | Personal | Listar todas |
| `PATCH` | `/:id/manage` | Personal | Gerenciar visibilidade |

### Notifications (`/api/v1/notifications`) — 8 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/` | ✅ | Listar (paginado) |
| `GET` | `/unread-count` | ✅ | Contagem não lidas |
| `GET` | `/preferences` | ✅ | Buscar preferências de notificação |
| `PATCH` | `/preferences` | ✅ | Atualizar preferências de canais/eventos |
| `PATCH` | `/read-all` | ✅ | Marcar todas lidas |
| `DELETE` | `/clear` | ✅ | Limpar lidas |
| `PATCH` | `/:id/read` | ✅ | Marcar como lida (idempotente) |
| `DELETE` | `/:id` | ✅ | Remover (idempotente) |

### AI (`/api/v1/ai`) — 8 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/workout/generate` | Personal | Gerar treino IA |
| `POST` | `/photos/compare` | Personal | Comparar fotos |
| `POST` | `/assistant` | ✅ | Chat assistente |
| `POST` | `/content/generate` | Personal | Gerar conteúdo |
| `POST` | `/sentiment/analyze` | Personal | Análise sentimento |
| `POST` | `/billing/smart` | Personal | Sugestão cobranças |
| `POST` | `/video/transcribe` | Personal | Transcrição vídeo |
| `GET` | `/usage` | ✅ | Uso mensal |

### Admin (`/api/v1/admin`) — 16 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/stats` | Admin | Métricas da plataforma + saldo Asaas |
| `GET` | `/users` | Admin | Listar todos os usuários |
| `GET` | `/users/:id` | Admin | Detalhes de um usuário |
| `PATCH` | `/users/:id` | Admin | Editar usuário |
| `DELETE` | `/users/:id` | Admin | Desativar usuário |
| `POST` | `/users/:id/bonus` | Admin | Adicionar bônus financeiro |
| `GET` | `/personals` | Admin | Listar personals |
| `PATCH` | `/personals/:id` | Admin | Editar personal |
| `GET` | `/payments` | Admin | Todas as transações |
| `POST` | `/payments` | Admin | Criar cobrança (admin) |
| `PATCH` | `/payments/:id` | Admin | Atualizar pagamento |
| `GET` | `/subscriptions` | Admin | Listar assinaturas |
| `GET` | `/affiliates` | Admin | Comissões e afiliados |
| `GET` | `/withdrawals` | Admin | Todos os saques PIX |
| `POST` | `/smoke/tokens` | super_admin | Emitir tokens temporários para smoke (sem Turnstile) |
| `GET` | `/infra/readiness` | super_admin | Prontidão de filas/crons/bindings para operação Workers Paid |

> Nota operacional (24/02/2026): `DELETE /admin/payments/:id` foi reforçado com deleção atômica de dependências (`affiliate_commissions`) + pagamento para evitar erro de FK em cenários concorrentes.

### Chat (`/api/v1/chat`) — 7 endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/unread-count` | ✅ | Contagem total de não lidas |
| `GET` | `/conversations` | ✅ | Listar conversas com preview + filtros |
| `POST` | `/conversations` | ✅ | Criar ou obter conversa existente |
| `GET` | `/conversations/:id/messages` | ✅ | Mensagens com paginação |
| `POST` | `/conversations/:id/messages` | ✅ | Enviar mensagem + push notification |
| `PATCH` | `/conversations/:id/read` | ✅ | Marcar como lido (zera unread counter) |
| `PATCH` | `/conversations/:id/archive` | ✅ | Arquivar/desarquivar conversa |

### Debug (`/api/v1/debug`) — 3 endpoints

> Uso temporário de pré-produção para observabilidade mobile sem console.
> Todas as rotas exigem autenticação e os logs ficam persistidos no PostgreSQL (`app_logs`).
> Admin/super_admin podem consultar escopo global via query string.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/logs` | ✅ | Salvar log do cliente (`debug/info/warn/error`) |
| `GET` | `/logs` | ✅ | Listar logs (padrão: do usuário). Admin: `?scope=all&user_id=<uuid>&level=error&q=...` |
| `DELETE` | `/logs` | ✅ | Limpar logs do usuário autenticado |

### Calendar (`/api/v1/calendar`) — 4 endpoints

> Agenda de sessões do personal. Tabela `calendar_events` criada via `ensureCalendarSchema()` (lazy migration inline em `calendar.ts`).
> Students veem apenas seus eventos; personals veem os próprios; admin vê todos.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/events?from=ISO&to=ISO` | ✅ | Listar eventos por range de datas. Retorna personal_name e student_name via JOIN. |
| `POST` | `/events` | personal/admin | Criar evento (`title`, `notes`, `meeting_url`, `start_at`, `end_at`, `color`, `status`, `student_id`). Valida ownership do aluno. |
| `PATCH` | `/events/:id` | personal/admin | Atualizar evento (owner check). Valida `end_at > start_at`. |
| `DELETE` | `/events/:id` | personal/admin | Remover evento (owner check). |

### Feedback (`/api/v1/feedback`) — 4 endpoints

> Sistema de sugestões/melhorias com auto-reply gerado por IA (Gemini 2.5 Flash via Replicate API).
> Auto-reply é assíncrono via `executionCtx.waitUntil`. Fallback para resposta pré-definida aleatória se token ausente ou API falhar.
> Tabelas: `feedback_suggestions`, `feedback_replies`.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/` | ✅ | Enviar sugestão (category: feature/improvement/bug/ui/other; max 5/dia por usuário). Dispara auto-reply IA (`sender_type: 'ai'`, `sender_name: 'Victor (IA)'`). |
| `GET` | `/mine` | ✅ | Listar minhas sugestões com reply_count e last_reply. Ordena por `has_new_reply DESC, updated_at DESC`. |
| `GET` | `/:id` | ✅ (owner) | Detalhe + todas as replies em ordem cronológica. Zera `has_new_reply` ao acessar. |
| `POST` | `/:id/reply` | ✅ (owner) | Enviar nova mensagem na thread (min 2, max 2000 chars). |

### Agents (`/api/v1/agents`) — 3 endpoints

> Integração com Unipile para automação de Instagram (post, DM, comment, human-handoff).
> Kill-switch operacional duplo: variável de ambiente + KV_SESSIONS. Requer `UNIPILE_*` secrets configurados.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | admin/super_admin | Diagnóstico: provider, enabled, kill_switch (env + KV), dry_run_default, capabilities, ready. |
| `POST` | `/instagram/dispatch` | personal/admin/super_admin | Roteador de intents (`post\|dm\|comment\|handoff`). Bloqueado se kill-switch ativo (retorna 503 com `fallback: 'handoff_humano'`). |
| `POST` | `/kill-switch` | super_admin | Ativar/desativar kill-switch via KV_SESSIONS (TTL 30d). Body: `{ enabled: boolean, reason?: string }`. |

### Passkey (`/api/v1/auth`) — 7 endpoints
> ⚠️ **Path correto:** montado em `/api/v1/auth` (não `/api/v1/passkey` como indicado anteriormente). `app.route('/api/v1/auth', passkeyRoutes)` em `workers/index.ts`.

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/register/options` | ✅ | Opções para registro de passkey |
| `POST` | `/register/verify` | ✅ | Verificar e salvar passkey |
| `POST` | `/login/options` | ❌ | Opções para login com passkey |
| `POST` | `/login/verify` | ❌ | Verificar passkey e retornar JWT |
| `GET` | `/` | ✅ | Listar passkeys do usuário |
| `DELETE` | `/:id` | ✅ | Remover passkey |
| `PATCH` | `/:id` | ✅ | Renomear passkey |

---

## 🗄️ Banco de Dados — 28 Tabelas PostgreSQL (Neon)

| # | Tabela | Colunas-chave |
|---|---|---|
| 1 | `users` | id, email, password_hash, full_name, user_type (personal/student), role (user/admin/super_admin), profile_photo_url, phone |
| 2 | `personals` | id (= users.id, SEM user_id), cref, public_url_slug, specialties, subscription_plan, subscription_expires_at, total_students, average_rating |
| 3 | `students` | id (= users.id, SEM user_id), personal_id, status (active/inactive/invited), fitness_level, goals, height_cm |
| 4 | `workouts` | id, personal_id, student_id, name, type, status (active/archived), description |
| 5 | `workout_exercises` | id, workout_id, exercise_name, sets, reps, weight, rest_time, order_index |
| 6 | `workout_logs` | id, workout_id, student_id, completed_at, duration_minutes, notes, rating |
| 7 | `assessments` | id, personal_id, student_id, weight_kg, height_cm, body_fat_percentage, muscle_mass_kg, notes, photos JSON, **v2:** protocol, density_formula, skinfolds JSONB, body_density, fat_mass_kg, lean_mass_kg, lean_mass_percentage, muscle_mass_percentage, bone_mass_kg, residual_mass_kg, sum_of_skinfolds, bmi_classification, fat_classification, waist_hip_ratio, waist_hip_classification, waist_risk, ideal_weight_kg, weight_to_lose_kg, basal_metabolic_rate, total_daily_expenditure, somatotype, water_percentage, visceral_fat_level, metabolic_age, ai_interpretation, notified_at, body_composition JSONB |
| 8 | `student_badges` | id, student_id, badge_type, earned_at |
| 9 | `payments` | id, payer_id, recipient_id, amount, status, asaas_payment_id, payment_method, due_date, paid_at, failed_reason |
| 10 | `affiliates` | id, personal_id, referral_code, commission_tier (bronze/silver/gold), total_referrals, total_earned |
| 11 | `referrals` | id, affiliate_id, referred_user_id, created_at |
| 12 | `affiliate_commissions` | id, affiliate_id, referral_id, amount, status, paid_at |
| 13 | `personal_reviews` | id, personal_id, student_id, rating (1-5), review_text, is_public, is_featured |
| 14 | `workout_plans` | id, personal_id, title, description, price, exercises JSON |
| 15 | `plan_purchases` | id, plan_id, buyer_id, payment_id, purchased_at |
| 16 | `notifications` | id, user_id, type, title, message, read_at (timestamptz), link, created_at |
| 17 | `personal_settings` | id, personal_id, settings JSONB |
| 18 | `payment_subscriptions` | id, personal_id, student_id, asaas_subscription_id, status |
| 19 | `pix_transfers` | id, personal_id, amount, status, asaas_transfer_id, pix_key |
| 20 | `asaas_customers` | id, user_id, personal_id, asaas_customer_id, name, email, cpf_cnpj |
| 21 | `ai_usage_logs` | id, user_id, task_type, model_used, tokens_used, created_at |
| 22 | `conversations` | id, personal_id, student_id, last_message_at, last_message_preview, unread_personal, unread_student |
| 23 | `messages` | id, conversation_id, sender_id, content, message_type, metadata, read_at, created_at |
| 24 | `user_passkeys` | id, user_id, credential_id, public_key, counter, device_type, device_name, last_used_at |
| 25 | `assessment_evolution` | id, assessment_id (FK→assessments), previous_assessment_id, weight_diff, fat_percentage_diff, fat_mass_diff, lean_mass_diff, muscle_mass_diff, bmi_diff, waist_diff, overall_score (0-100), diffs JSONB, perimeter_diffs JSONB, days_between, created_at |
| 26 | `notification_preferences` | id, user_id (unique), in_app_enabled, push_enabled, email_enabled, workout_enabled, payment_enabled, student_enabled, assessment_enabled, marketing_enabled, updated_at |
| 27 | `app_logs` | id, user_id (nullable), user_type, user_role, level, source, message, stack, context JSONB, path, user_agent, request_id, created_at |
| 28 | `audit_log` | id, actor_user_id, actor_role, action, target_type, target_id, metadata JSONB, ip_address, user_agent, request_id, created_at |
| 29 | `calendar_events` | id UUID PK, personal_id UUID FK→personals, student_id UUID FK→students (nullable), title VARCHAR(120), notes TEXT, meeting_url TEXT, start_at TIMESTAMPTZ, end_at TIMESTAMPTZ, color VARCHAR(20) DEFAULT 'blue', status VARCHAR(20), created_at, updated_at. Indexes: personal_id+start_at, student_id+start_at. **Tabela criada inline via `ensureCalendarSchema()` — não está em `migrations/`.** |
| 30 | `feedback_suggestions` | user_id, category VARCHAR (feature/improvement/bug/ui/other), title VARCHAR(200), description TEXT(2000), status, priority, has_new_reply BOOLEAN, created_at, updated_at, resolved_at |
| 31 | `feedback_replies` | feedback_id FK, user_id (nullable — NULL = IA), message TEXT, sender_type VARCHAR (user/ai), sender_name VARCHAR, created_at |

> ⚠️ **Colunas corretas:** `personals`/`students` usam `id = users.id` (same PK, SEM `user_id`). Usar `public_url_slug` (não `slug`), `subscription_plan` (não `plan_type`), `weight_kg` (não `weight`), `body_fat_percentage` (não `body_fat`), `read_at` (não `read`), `payment_method` (não `billing_type`), `profile_photo_url` (não `avatar_url`).

### D1 (Cold Data) — 5 Tabelas

| Tabela | Registros | Descrição |
|---|---|---|
| `muscle_groups` | 14 | Grupos musculares |
| `exercises` | 79 | Exercícios com vídeos |
| `workout_templates` | 6 | Templates de treino |
| `series_types` | 13 | Tipos de séries |
| `equipment_types` | 16 | Tipos de equipamento |

---

## 📚 Libraries (lib/)

### lib/db.ts — Database Helpers

```typescript
// PostgreSQL (Neon)
pgQuery<T>(env: Bindings, sql: string, params?: unknown[]): Promise<T[]>
pgQueryOne<T>(env: Bindings, sql: string, params?: unknown[]): Promise<T | null>
pgQueryCount(env: Bindings, sql: string, params?: unknown[]): Promise<number>

// D1 (SQLite)
d1Query<T>(db: D1Database, sql: string, params?: unknown[]): Promise<T[]>
d1QueryOne<T>(db: D1Database, sql: string, params?: unknown[]): Promise<T | null>

// Utilities
generateId(): string  // crypto.randomUUID()
buildWhereClause(filters: Record<string, unknown>): { where: string; params: unknown[] }
```

### lib/asaas.ts — Asaas Payment Client (18 funções)

```typescript
// Customers
createCustomer(env, input): Promise<AsaasCustomer>
getCustomer(env, id): Promise<AsaasCustomer>
findCustomerByCpf(env, cpf): Promise<AsaasCustomer | null>

// Payments
createPayment(env, input): Promise<AsaasPayment>
getPayment(env, id): Promise<AsaasPayment>
listPayments(env, filters): Promise<AsaasPayment[]>
getPixQrCode(env, paymentId): Promise<{ qrCode, payload }>
cancelPayment(env, id): Promise<void>

// Subscriptions
createSubscription(env, input): Promise<AsaasSubscription>
getSubscription(env, id): Promise<AsaasSubscription>
updateSubscription(env, id, input): Promise<AsaasSubscription>
cancelSubscription(env, id): Promise<void>

// Transfers
createTransfer(env, input): Promise<AsaasTransfer>
listTransfers(env): Promise<AsaasTransfer[]>
getTransfer(env, id): Promise<AsaasTransfer>

// Balance
getBalance(env): Promise<AsaasBalance>
getStatistics(env, filters): Promise<AsaasStatistics>

// Detecção automática de ambiente pelo prefixo da API key
```

### lib/onesignal.ts — Push + In-App (8 funções)

```typescript
sendPush(env, options): Promise<{ success, id? }>           // Core push via REST API
notify(env, options): Promise<void>                          // In-app + push
notifyNewWorkout(env, options): Promise<void>                // Treino atribuído
notifyPaymentReceived(env, options): Promise<void>           // Pagamento confirmado
notifyPaymentOverdue(env, options): Promise<void>            // Pagamento vencido
notifyNewStudent(env, options): Promise<void>                // Aluno aceito
notifyAssessmentCompleted(env, options): Promise<void>       // Avaliação feita
notifyTrialExpiring(env, options): Promise<void>             // Trial expirando
```

### lib/errors.ts — 9 Error Classes

```typescript
AppError              // Base (status, message, code, details)
BadRequestError       // 400
UnauthorizedError     // 401
ForbiddenError        // 403
NotFoundError         // 404
ConflictError         // 409
RateLimitError        // 429
InternalError         // 500
ServiceUnavailableError // 503
```

### lib/response.ts — Response Helpers

```typescript
success(data): Response           // 200 { success: true, data }
created(data): Response           // 201 { success: true, data }
noContent(): Response             // 204
error(msg, status): Response      // { success: false, error: msg }
paginated(data, page, limit, total): Response  // { success: true, data, pagination }
```

### lib/unipile-agents.ts — Agentes Unipile/Instagram

```typescript
getUnipileAgentsConfig(env): { enabled, kill_switch_env, dry_run_default }
dispatchInstagramAgent(env, { intent, message, target, metadata, actor_user_id, actor_user_type, dry_run }): Promise<AgentResult>
// intents: 'post' | 'dm' | 'comment' | 'handoff'
```

### lib/cpf-lookup.ts — Consulta CPF (HubDev)

```typescript
lookupCpf(cpf: string, birthDate: string, token: string): Promise<{ success: boolean, full_name?: string, status_rf?: string, error?: string }>
// birthDate formato DD/MM/YYYY
// Retorna APENAS full_name e status_rf — sem outros dados (LGPD)
```

### lib/calendar-reminders.ts — Lembretes de Agenda (Cron)

```typescript
dispatchCalendarReminders(env, { windowsMinutes: number[], toleranceMinutes: number }): Promise<{ sent: number, skipped: number }>
// windowsMinutes: janelas de antecedência para enviar push (ex: [1440, 60] = 24h e 1h antes)
// toleranceMinutes: margem de tolerância para evitar duplicatas
```

---

## 🔧 Bindings & Secrets

### Bindings Ativos

| Binding | Tipo | ID/Nome |
|---|---|---|
| `DB` | D1 | `vfiti-exercises` (`988c03d5-...`) |
| `KV_CACHE` | KV | `e7147f88...` |
| `KV_SESSIONS` | KV | `91d34b67...` |
| `KV_RATE_LIMIT` | KV | `d94c62b1...` |
| `R2_VIDEOS` | R2 | `personal-ia-videos` |
| `R2_IMAGES` | R2 | `personal-ia-images` |
| `ANALYTICS` | Analytics Engine | Dataset padrão |

### Secrets (produção)

| Secret | Uso |
|---|---|
| `DATABASE_URL` | PostgreSQL principal (nome neutro; usado por `lib/db.ts`) |
| `NEON_DATABASE_URL` | Legado temporário (fallback enquanto migração completa) |
| `JWT_SECRET` | Access tokens (HMAC-SHA256) |
| `JWT_REFRESH_SECRET` | Refresh tokens |
| `ASAAS_API_KEY` | **Produção** (prefixo `$aact_` = real) |
| `ASAAS_WEBHOOK_TOKEN` | Token forte (webhook) |
| `STRIPE_SECRET_KEY` | Gateway secundário |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe |
| `REPLICATE_API_TOKEN` | IA (Replicate) |
| `RESEND_API_KEY` | Email transacional |
| `ONESIGNAL_APP_ID` | Push notifications |
| `ONESIGNAL_REST_KEY` | Push notifications (REST) |
| `TURNSTILE_SECRET_KEY` | **Produção** (bypass removido) |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GOOGLE_REDIRECT_URI` | OAuth Google |
| `FACEBOOK_APP_ID` | OAuth Facebook |
| `FACEBOOK_APP_SECRET` | OAuth Facebook |
| `FACEBOOK_REDIRECT_URI` | OAuth Facebook |
| `EMAIL_FROM` | Remetente padrão (Resend) |
| `HUBDEV_API_TOKEN` | HubDev API — consulta CPF (`cpf.ts`). Optional: graceful degrade retorna `{ available: false }` se ausente. |
| `SENTRY_DSN_WORKER` | Sentry error monitoring (`@sentry/cloudflare`). Optional: desativado se ausente. |
| `SENTRY_ENVIRONMENT` | Label de ambiente Sentry (ex: `production`, `staging`) |
| `SENTRY_RELEASE` | Label de release Sentry (ex: `v5.2.5`) |
| `SENTRY_TRACES_SAMPLE_RATE` | Taxa de tracing Sentry (0.0–1.0). Default: 0 (desativado). |

---

## 🏛️ Arquitetura do Request

```
Request → CF Workers Edge
  → requestIdMiddleware (X-Request-Id)
  → corsMiddleware (iapersonal.app.br, vfit.pages.dev)
  → secureHeaders
  → rateLimitMiddleware (KV_RATE_LIMIT)
  → authMiddleware (JWT Web Crypto → userId, userType em c.var)
  → Route Handler
    → Zod schema validation (zValidator)
    → Business logic
    → pgQuery(env, sql, params) ou d1Query(env.DB, sql, params)
    → success(data) / created(data) / paginated(data, page, limit, total)
```

### Auth
- Access token: 1h TTL (HMAC-SHA256 via Web Crypto)
- Refresh token: 30d TTL
- Sessions: KV_SESSIONS com TTL
- Blacklist: Token revocation via KV
- Passwords: bcryptjs (cost 12)

---

---

## ⏰ Cron Handlers (workers/index.ts — `handleScheduled`)

> Dois crons estão ativos em produção. Os outros dois são placeholders (TODO LOTE 08).

| Cron Expression | Status | O que executa |
|---|---|---|
| `0 8 * * *` | **ATIVO** | `dispatchCalendarReminders(env, { windowsMinutes: [1440, 60] })` — lembretes 24h e 1h antes de eventos de agenda |
| `0 3 * * *` | **ATIVO** | `warmCache(env)` (pré-aquece KV com muscle_groups, series_types, equipment_types, exercise_counts) + `handleXPExpiration(env)` (expira XP com TTL vencido) |
| `0 */4 * * *` | TODO (placeholder) | Payment checks — não implementado |
| `0 2 * * 1` | TODO (placeholder) | Affiliate commission calc (segunda 2h) — não implementado |

---

## 🚀 Deploy

```bash
# Backend
npx wrangler deploy --env=""

# Logs
npx wrangler tail --format=pretty

# Secrets
echo "valor" | npx wrangler secret put NOME --env=""

# Health check
curl https://api.iapersonal.app.br/health
```

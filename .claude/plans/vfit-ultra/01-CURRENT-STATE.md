# 01 — Estado Atual (Auditoria Completa)

> Retrato fiel do VFIT em **2026-06-21**, fruto de varredura completa do código (frontend, workers, migrations, docs). Esta é a **base factual** de todas as decisões do plano.

---

## 1. Arquitetura em uma imagem

```
┌─────────────────────────── FRONTEND (CF Pages, static export) ───────────────────────────┐
│  Next.js 15 App Router · Tailwind v4 · Zustand 5 · TanStack Query 5                        │
│                                                                                            │
│  (public)  →  landing, blog, legal, pricing        [sem auth]                              │
│  (auth)    →  login, register/{personal,student}, reset, verify, oauth/callback           │
│  (onboarding) → welcome, quiz(16 passos), result, paywall(3 camadas), notifications       │
│  (app)     →  ALUNO: treinos, exercícios, progresso, nutrição, avaliações, ia, perfil     │
│  dashboard →  PERSONAL/ADMIN: students, workouts, payments, assessments, admin/*          │
│  guest     →  modo demo (3 views)                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                         │ /api/v1
┌─────────────────────────── BACKEND (CF Workers) ─────────────────────────────────────────┐
│  Hono v4 · 39 módulos · ~215 endpoints                                                     │
│  Request → requestId → CORS → secureHeaders → rateLimit → authMiddleware(JWT) → handler   │
│            → Zod → lógica → pgQuery/d1Query → success/created/paginated                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
       │ Neon PG 17 (59 tabelas, HTTP)      │ D1 (5 tabelas, cold)     │ KV (sessions/cache/rate)
       │ R2 (vídeos/imagens/pdf)            │ Asaas + Stripe           │ Resend · OneSignal · Replicate
```

---

## 2. Mapa de Rotas (frontend) — por painel

### 2.1 Público `(public)` — sem auth
`/` · `/pricing` · `/blog` + `/blog/[slug]` (≈8 posts) · `/sobre` · `/contato` · `/termos` · `/privacidade` · `/lgpd` · `/cookies` · `/excluir-conta` · `/status` · `/carreiras` · `/afiliados` · `/nutricionistas` · `/app-personal-trainer`

### 2.2 Autenticação `(auth)` — sem auth (NO_INDEX)
`/login` · `/register` · `/register/personal` · `/register/student` · `/forgot-password` · `/reset-password` · `/verify-email` · `/auth/callback` (OAuth Google)

### 2.3 Onboarding `(onboarding)`
`/welcome` · `/onboarding` (quiz 16 passos) · `/onboarding/loading` · `/onboarding/result` · `/onboarding/paywall` · `/onboarding/notifications`

### 2.4 Painel do Aluno `(app)` — auth: student
- **Treino:** `/treinos` · `/treinos/[id]` · `/treinos/novo` · `/treino-ativo` · `/treino-ativo/concluido`
- **Plano:** `/plano` · `/plano/editar` · `/plano/ajustes`
- **Exercícios:** `/exercicios` · `/exercicios/[id]` · `/exercicios/detalhe` · `/musculos/detalhe`
- **Progresso:** `/progresso` · `/progresso/corporal` · `/progresso/exercicio/[id]` · `/progresso/streaks` · `/progresso/conquistas`
- **Nutrição:** `/nutricao`
- **Avaliações:** `/avaliacoes` · `/avaliacoes/[id]` · `/avaliacoes/nova`
- **IA:** `/ia` · `/ia/treino-adaptado` · `/ia/recuperacao` · `/ia/dieta` · `/ia/macros`
- **Social:** `/social` *(placeholder "Em breve")*
- **Perfil:** `/perfil` + 14 subtelas (`/editar`, `/assinatura`, `/notificacoes`, `/lembretes`, `/equipamentos`, `/tema`, `/unidades`, `/descanso`, `/desafios`, `/gamificacao`, `/offline`, `/sobre`, `/changelog`)

### 2.5 Painel do Personal `dashboard` — auth: personal/admin/super_admin
- **Home/config:** `/dashboard` · `/complete-profile` · `/onboarding` · `/settings`
- **Alunos:** `/students` · `/students/view` · `/students/edit` · `/students/invite` · `/students/import` · `/students/assessment/new`
- **Treinos:** `/workouts` · `/create` · `/view` · `/execute` · `/exercises/create` · `/exercises/library` · `/media/library`
- **Avaliações:** `/assessments` · `/create` · `/view` · `/success-detail`
- **Nutrição:** `/meal-plans` · `/nutrition-assessments`
- **Comunicação:** `/messages` · `/notifications`
- **Agenda/Financeiro:** `/calendar` · `/payments` (+create/view/checkout/withdraw) · `/financeiro`
- **Planos/Marketplace:** `/plans` (+checkout/success) · `/marketplace` (+create/view/checkout)
- **Outros:** `/exercises` · `/ai` · `/affiliates` · `/logs`

### 2.6 Admin/Super-Admin `dashboard/admin`
`/admin` · `/users` · `/personals` · `/payments` · `/exercises` · `/muscle-groups` · `/workouts` · `/feedback` · `/config` (super-admin) · `/design-system` · `/smoke` (super-admin)

### 2.7 Especiais/públicas
`/p/[slug]` (perfil público do personal) · `/profile?slug=` · `/assessment/share?token=` · `/offline` · `/guest/{workouts,explore,calculators}`

---

## 3. Backend — inventário (215+ endpoints, 39 módulos)

| Domínio | Módulo | #Endpoints | Status |
|---------|--------|-----------|--------|
| Auth | `auth.ts` | 15 | ✅ Sólido (JWT, 2FA, passkey, Turnstile) |
| Users | `users.ts` | 8 | ✅ Inclui LGPD (export/delete) |
| Personals | `personals.ts` | 5 | ✅ |
| Students | `students.ts` | 16 | ✅ |
| Workouts | `workouts.ts` | 26 | ✅ |
| Assessments | `assessments.ts` | 26 | ✅ v2 body composition + PDF + IA |
| Payments | `payments.ts` | 33 | ✅ Asaas/Stripe/webhooks/split |
| XP/Gamif. | `xp.ts` + `gamification.ts` + `challenges.ts` | 11+2+2 | ⚠️ 7 tabelas XP (over-engineered) |
| Affiliates | `affiliates.ts` | 6 | ⚠️ commission cron placeholder |
| Reviews | `reviews.ts` | 7 | ✅ |
| Notifications | `notifications.ts` | 8 | ✅ multi-canal |
| Chat | `chat.ts` | 7 | ⚠️ N+1 no list de mensagens |
| AI | `ai.ts` + `plans.ts` | 8+10 | ⚠️ sem proteção a prompt injection |
| Admin | `admin.ts` | 46 | ⚠️ falta paginação em vários list |
| Calendar | `calendar.ts` | 4 | ⚠️ MVP |
| Feedback | `feedback.ts` | 4 | ✅ workflow 6 status |
| Config | `config.ts` | 7 | ✅ planos B2B/B2C em D1 |
| Consultations | `consultations.ts` | 7 | ⚠️ sem cancel explícito |
| Onboarding | `onboarding.ts` | 2 | ✅ |
| Progress/Measure | `progress.ts` + `measurements.ts` + `self-assessments.ts` | 6+3+5 | ✅ |
| VFIT Nutrition | `vfit.ts` | 23 | ✅ (B2C nutrição) |
| Subscription | `subscription.ts` | 3 | ⚠️ trial B2C incompleto |
| Nutritionist | `nutritionist.ts` | 11 | ⚠️ lógica de negócio rasa |
| Exercise Media | `exercise-media.ts` + `b2c-exercise-media.ts` | 6+0 | ⛔ b2c vazio |
| OAuth/Passkey | `oauth.ts` + `passkey.ts` | 2+7 | ✅ |
| Platform | `platform.ts` | 5+ | ⛔ routing incompleto |
| Templates | `templates.ts` | 2 | ⚠️ read-only |
| CPF/Search/Agents/Debug | vários | 1+1+3+4 | ✅/⚠️ |

**Crons:** `xp-expiration`, `consultation-reconciliation`, `calendar-reminders`.
**Queues:** `email-sender` ✅, `pdf-generator` ✅, `video-encoder` ⛔ TODO, `ai-batch` ⛔ TODO.

---

## 4. Modelo de Trial & Billing — HOJE

### Personal Trainer
- Cadastro cria `personals` com `subscription_plan='trial'`, `subscription_status='trial'`, `trial_ends_at = NOW()+14d`.
- **Sem cartão** para começar. Após 14d, **sem enforcement automático** confirmado (sem cron de downgrade verificado).
- Receita do personal vem de cobrar os próprios alunos (Asaas split).

### Aluno (B2C)
- Tabela `vfit_subscriptions`: `plan_type` ∈ {free, premium, premium_annual}, `payment_status`, `asaas_subscription_id`.
- **Sem trial dedicado.** Free imediato; premium exige pagamento no paywall.
- Paywall de 3 camadas (planos → 20% off → 40% off) aparece **depois do quiz**.
- **Bug conhecido:** check de subscription no app sempre retorna `false` (`perfil/page.tsx:65` — "TODO Sprint 25").

### Pagamentos
- Asaas (PIX/boleto/cartão) produção ativa + Stripe secundário.
- Webhook atualiza status; **sem wrapper transacional** (risco de inconsistência Asaas↔DB).
- `net_amount = asaasPayment.netValue` (regra crítica §7 do RULES).

---

## 5. Fluxos críticos — passo a passo HOJE

### Login (já rápido)
`/login` → CPF/email + senha (+Turnstile soft, +2FA opcional) → `/auth/me` → redirect por `user_type`. **Passkey/biometria já implementados.**

### Cadastro Personal (2 passos)
Passo 1: nome, CPF (lookup Receita), nascimento, email, senha. Passo 2: CREF, estado, especialidades, termos, Turnstile → cria conta + trial 14d → `/dashboard/complete-profile`.

### Cadastro Aluno (1 passo, ou via convite)
Email, senha, nome, CPF opcional → acesso imediato (free) ou linkado ao personal via `invitation_token`.

### Onboarding Aluno (16 passos, 2-3 min)
gênero → experiência → frequência → objetivo → local → músculos → (motivacional) → idade → altura → peso → peso-alvo → dias/semana → duração → lesões → horário → (prova social) → "criar plano" → `POST /plans/generate` (IA 30-45s) → result → paywall.

---

## 6. Gaps & Problemas Conhecidos (consolidado)

### 🔴 Críticos (quebram experiência ou negócio)
1. **Subscription check sempre `false`** no app do aluno (`perfil/page.tsx:65`).
2. **Custom workout API não conectada** (`treinos/novo` — TODO POST `/custom-workouts`).
3. **Sem enforcement de trial** (personal 14d expira mas nada acontece automaticamente).
4. **Paywall pede cartão cedo demais** — contra a estratégia de 1 mês grátis.
5. **Sem wrapper transacional em pagamentos** (risco Asaas↔DB inconsistente).

### 🟡 Importantes (incompletos)
6. **Social do aluno** = "Em breve" inteiro (`/social`).
7. **IA subpages** (dieta, macros, recuperação, treino-adaptado) majoritariamente placeholder.
8. **Paginação ausente** em `/admin/users` e outros list endpoints (O(n) memória).
9. **5 sistemas de Card** concorrentes + **13 variantes de Button** (fragmentação).
10. **10 cores hardcoded** (`bg-[#...]`) furando os tokens.
11. **N+1** no list de chat; **TTL de cache** de exercícios alto (7d → stale).
12. **Validações faltando:** due_date no passado, body_fat > 100%, reps > 1000, email de convite sem sanity check.
13. **PDF de avaliação síncrono** no endpoint (risco timeout 10s) apesar de queue existir.
14. **b2c-exercise-media.ts vazio**; **platform.ts routing incompleto**.

### 🟢 Polish (perfeição)
15. Telas sem os 4 estados completos (loading/vazio/erro/sucesso) — ~60% das telas.
16. Spinners genéricos, empty states sem ilustração, poucas micro-interações.
17. Tipografia sem hierarquia clara; espaçamento mobile inconsistente.
18. Rotas duplicadas (`/exercicios/[id]` vs `/exercicios/detalhe`).
19. Acessibilidade: faltam `aria-label` em ícones, falta teste com leitor de tela.

---

## 7. Pontos Fortes (preservar a todo custo)

- ⭐ **Treino ativo** — UX excepcional (offline-first, wake-lock, timers, edição inline). É a joia do produto.
- ⭐ **Nutrição com câmera IA + barcode** — diferencial real.
- ⭐ **Avaliações físicas v2** — body composition + PDF + interpretação IA.
- ⭐ **Pagamentos Asaas** — split, PIX, withdraw, webhooks. Robusto.
- ⭐ **Auth** — JWT + 2FA + passkey + Turnstile. Nível produção.
- ⭐ **Admin** — 46 endpoints, simulação de usuário, notas de risco, gestão completa.
- ⭐ **LGPD** — export e exclusão de conta.

---

## 8. Conclusão da auditoria

> O VFIT **não precisa de reescrita**. Precisa de **acabamento cirúrgico**: alinhar a estratégia de trial, acelerar o topo do funil, fechar os 15-30% finais de cada tela, endurecer o backend nos pontos certos e unificar/modernizar o design. Esse é exatamente o trabalho dos docs 02-08.

# TRACKING — Plano Final MVP (Sprint 0-3)

**Última atualização:** 2026-07-02 ~03h (sessão noturna autônoma) · Branch: `feat/sprint1-track-a-treinos`
**Plano:** `.claude/plans/PLANO_FINAL_MVP.md` + docs em `./plano-final/`
**Gate:** `quality:ci` exit 0 · 390 testes (26 files) · build ok · lint 0 erros

---

## 🌙 Resumo da sessão noturna (para ler amanhã)

Sprints 1 **e 2** implementados e commitados na branch (sem deploy, sem push — regras).
A descoberta central: o plano superestimava o trabalho — CRUD de treinos, execução, dashboard
pessoal e marketplace listing **já existiam**. O trabalho real foi conectar o aluno ao fluxo B2B,
consertar 3 sistemas divergentes de XP, streak congelada, e tornar a compra do marketplace REAL
(Asaas PIX + entrega automática).

### Commits da sessão (nesta ordem)

| Commit | Conteúdo |
|--------|----------|
| `2f434c92` | Track A: aluno vê/executa treinos do personal + XP no fluxo B2C |
| `2dbfe642` | Tracks B+C: XP/streak unificados + WhatsApp (treino atribuído, milestones) |
| `b33e20f7` | Testes: computeLevelProgress + applyStreakDecay (15 casos) |
| `effc012c` | Sprint 2: checkout PIX real no marketplace + entrega automática |
| *(último)* | Self-review da branch: 3 fixes (refund seguro, retry de entrega, polling finito) + BACKEND.md atualizado |

### 🔎 Self-review (`/review-pr` da branch vs main)

Review das 4 dimensões (bugs/segurança/runtime/qualidade) sobre os ~1.470 diffs. 3 issues reais encontrados e **corrigidos**:
1. 🔴 Webhook refund podia rebaixar compra paga se `DELETED` de cobrança antiga regenerada chegasse depois — agora exige match de `asaas_payment_id`
2. 🔴 Entrega sem retry: falha transiente na clonagem deixava comprador pago sem plano para sempre — agora re-tenta no retry do webhook E no polling de status (self-healing)
3. 🟡 Polling do checkout nunca parava após confirmação — agora para em `completed`/`refunded`
Nenhum issue de segurança (auth ok em todas rotas novas; queries parametrizadas; sem secrets em logs).

### 🔴 AÇÕES QUE SÓ VOCÊ PODE FAZER (amanhã)

1. **Secret WhatsApp**: `npx wrangler secret put WHATSAPP_NOTIFY_TOKEN` no worker da API — sem ele, WhatsApp falha silencioso (push continua ok)
2. **Smoke tokens**: gerar em `https://vfit.app.br/dashboard/admin/smoke` → atualizar `.env.local` → `npm run smoke:auth:local` (gate de deploy)
3. **Cron triggers**: decidir reativar `[triggers] crons` no `wrangler.toml` (exige plano CF pago) — urgência baixa: streak agora quebra na leitura
4. **Webhook Asaas**: confirmar no painel Asaas que o webhook aponta para `POST /api/v1/payments/webhooks/asaas` com eventos PAYMENT_CONFIRMED/RECEIVED/REFUNDED (já usado pelas assinaturas — se assinatura funciona, marketplace funciona)
5. **QA do fluxo completo** (T1.8) + **deploy v5.5.0** (`npm run cf:deploy`) — só com sua confirmação
6. **Revisar/mergear** a branch `feat/sprint1-track-a-treinos` → PR → main

---

## Sprint 0 — Bugs Críticos (02/07) ✅ DEPLOYED v5.4.1

- [x] T0.1 Bug #1: Roteamento — 4 placeholder pages (/desafios, /comunidade, /perfil/seguranca, /configuracoes)
- [x] T0.2 Bug #2: Timeout no api-client (5s GET / 30s mutações) + LoadFailed em /treinos, /nutricao, /progresso
- [x] T0.3 Bug #3: Avaliação duplicada — Idempotency-Key + KV replay + dedup 60s + guard useRef
- [x] T0.4 Deploy v5.4.1 + tag + smoke

## Sprint 1 — Track A: Treinos (02/07) ✅ `2f434c92`

> Gap analysis: CRUD (T1.1), assignment (T1.2) e execução (T1.3) **já existiam** no sistema B2B.
> Dois sistemas paralelos identificados: B2B (`workouts`/`workout_logs`) e B2C (`workout_plans`/`workout_sessions`).

- [x] T1.1 CRUD de treinos (personal) — ✅ já existia (`workers/api/workouts.ts`, `/dashboard/workouts`)
- [x] T1.2 Assignment treino→aluno — ✅ já existia (`workouts.student_id` via create/duplicate/clone-template)
- [x] T1.3 Execution tracking — ✅ já existia (sessão guiada `workout_session_state` + `workout_logs`; B2C `workout_sessions`)
- [x] T1.4 XP na conclusão B2C — `completeB2CWorkout` credita XP (idempotente), grava `xp_earned`, meta diária + streak
- [x] T1.5 Aluno vê treinos atribuídos — seção "Treinos do seu personal" em `(app)/treinos` via `useMyWorkouts`
- [x] T1.6 Execução no shell do aluno — rota `(app)/treinos/executar?id=` com `WorkoutPlayer` (prop `backHref`)
- [x] T1.7 Notificação ao atribuir treino — coberto por T3.2 (push + WhatsApp em create + duplicate)
- [ ] T1.8 QA fluxo completo: personal cria → atribui → aluno executa → XP/streak — **bloqueado por smoke tokens**

## Sprint 1 — Track B: Dashboard + Gamificação (02/07) ✅ `2dbfe642`

- [x] T2.1 Dashboard pessoal — ✅ já existia (`FirstWinCommandCenter` em `(app)/treinos`)
- [x] T2.2 Unificar XP — `computeLevelProgress(total_earned)` como fonte única; `/gamification/profile` lê o ledger; badges streak 7/30/100 reais; 3ª fórmula client-side removida (`student-dashboard.tsx`). **Bug extra corrigido:** `xp_balances.level` nunca era atualizado → header mostrava "Nível 1" eterno
- [x] T2.3 Streak em tempo real — decay na leitura (`applyStreakDecay`): hoje/ontem intacta, gap 2d+freeze mantém, senão 0
- [ ] T2.4 Cron diário — ❌ Bloqueado: `[triggers] crons` desabilitado (limite conta CF Free) — decisão sua

## Sprint 1 — Track C: Marketplace + Notificações (02/07) ✅ `2dbfe642`

- [x] T3.1 Marketplace listing — ✅ já existia (`/dashboard/marketplace` + `GET /payments/plans`, dados reais)
- [x] T3.2 WhatsApp notifications — `lib/whatsapp.ts` novo (resolve chat por telefone); treino atribuído → push + WhatsApp (create + duplicate, via `waitUntil`); streak milestone → evento `streak.milestone` + `lib/streak-notifications.ts` nos 3 completion sites. ⚠️ Requer secret `WHATSAPP_NOTIFY_TOKEN`
- [x] T3.3 Add to Cart — ⏩ Deferred permanente: fluxo "Comprar → checkout PIX" direto implementado no Sprint 2; carrinho não agrega

## Sprint 2 — Monetização (02/07, adiantado na sessão noturna) ✅

> O `POST /plans/:id/buy` antigo era compra FAKE: gravava `plan_purchases` sem cobrar, sem entregar
> (`delivered=false` para sempre) e contava venda otimista. Agora é real, no padrão do subscription checkout.

- [x] T4.1 Asaas integration — buy cria cobrança PIX real (customer → payment → QR; rollback se DB falhar; CPF obrigatório; mínimo R$5; retoma PIX pendente). Webhook `plan_purchase_`: pending→completed idempotente, conta venda, insere em `payments` (criador vê no `/dashboard/financeiro`), entrega e notifica
- [x] T4.2 Checkout flow — frontend: campo CPF, tela QR PIX + copia-e-cola, polling 5s (`usePurchaseStatus`), tela sucesso → `/plano`. Cartão/boleto "EM BREVE" (PIX-only)
- [x] T4.3 Financial dashboard — ✅ já existia (`/dashboard/financeiro`); venda de marketplace agora entra via linha em `payments` (recipient = criador, `net_amount = creator_share`)
- [x] T4.4 Entrega automática — `lib/marketplace-delivery.ts`: parser tolerante de `plan_content` ({weeks} do form ou {days} genérico) → clona `workout_plans` B2C + days + exercises para o comprador; `delivered=true` + `cloned_workout_ids`. 9 testes de parser
- [ ] T4.5 Cartão de crédito + boleto no marketplace — futuro (PIX-only no MVP)

## Sprint 3 — Scale (16/07+)

- [ ] T5.1 Community, challenges (placeholders "Em Breve" no ar)
- [ ] T5.2 Analytics
- [ ] T5.3 Mobile/TWA polish

---

**Progresso:** 20/23 (87%) — pendentes: T1.8 (QA, precisa smoke tokens), T2.4 (cron, decisão sua), T4.5 (futuro)

## ⚠️ Riscos/Notas técnicas para revisão

- `plan_content` legado: planos publicados ANTES do form atual podem ter shape não parseável → compra confirma mas `delivered=false` (log `[Marketplace] ... entrega adiada`); comprador é avisado "liberado em instantes" — precisa re-trigger manual ou ajuste do plano
- Streak: `/progress/streak` e `/challenges/streak` ainda calculam on-read próprio (unificação de tabela adiada — divergência agora é mínima pois `xp_streaks` quebra na leitura)
- `user_streaks` (migration 0022) é tabela órfã — candidata a DROP em migration futura
- WhatsApp: só alcança números que já são chat na conta Unipile conectada (limitação do gateway)

## Deploys

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| v5.4.1 | Sprint 0 | 2026-07-02 | 47b17add | 15+ |
| v5.5.0 | Sprint 1+2 | *pendente confirmação* | — | ~25 |

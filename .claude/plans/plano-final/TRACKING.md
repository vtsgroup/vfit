# TRACKING — Plano Final MVP (Sprint 0-3)

**Última atualização:** 2026-07-02 · v5.4.1 → em desenvolvimento Sprint 1
**Plano:** `.claude/plans/PLANO_FINAL_MVP.md` + docs em `./plano-final/`

---

## Sprint 0 — Bugs Críticos (02/07)

- [x] T0.1 Bug #1: Roteamento — 4 placeholder pages (/desafios, /comunidade, /perfil/seguranca, /configuracoes)
- [x] T0.2 Bug #2: Timeout no api-client (5s GET / 30s mutações) + LoadFailed em /treinos, /nutricao, /progresso
- [x] T0.3 Bug #3: Avaliação duplicada — Idempotency-Key + KV replay + dedup 60s + guard useRef
- [x] T0.4 Deploy v5.4.1 + tag + smoke

## Sprint 1 — Track A: Treinos (02/07)

> Gap analysis revelou que CRUD (T1.1), assignment (T1.2) e execução (T1.3) **já existiam** no sistema B2B
> (`workers/api/workouts.ts` + `workout-sessions.ts` + `/dashboard/workouts`). O trabalho real do Track A
> era conectar o aluno (shell `(app)`) ao fluxo B2B e corrigir o XP do fluxo B2C.

- [x] T1.1 CRUD de treinos (personal) — ✅ já existia (`workers/api/workouts.ts`, `/dashboard/workouts`)
- [x] T1.2 Assignment treino→aluno — ✅ já existia (`workouts.student_id` via create/duplicate/clone-template)
- [x] T1.3 Execution tracking — ✅ já existia (sessão guiada `workout_session_state` + `workout_logs`; B2C `workout_sessions`)
- [x] T1.4 XP na conclusão B2C — `completeB2CWorkout` agora credita XP (idempotente), grava `xp_earned`, atualiza meta diária + streak (best-effort)
- [x] T1.5 Aluno vê treinos atribuídos — seção "Treinos do seu personal" em `(app)/treinos` via `useMyWorkouts`
- [x] T1.6 Execução no shell do aluno — rota `(app)/treinos/executar?id=` com `WorkoutPlayer` (prop `backHref` nova)
- [x] T1.7 Notificação WhatsApp ao atribuir treino — ✅ coberto por T3.2 (`notifyWorkoutAssigned` em create + duplicate)
- [ ] T1.8 QA fluxo completo: personal cria → atribui → aluno executa → XP/streak

## Sprint 1 — Track B: Dashboard + Gamificação (02/07)

- [x] T2.1 Dashboard pessoal — ✅ já existia (`FirstWinCommandCenter` em `(app)/treinos`: treino de hoje, streak, XP, stats)
- [x] T2.2 Unificar XP — fonte única `computeLevelProgress` no `xp-service`; `/gamification/profile` lê ledger; badges de streak reais; 3ª fórmula client-side removida (`student-dashboard.tsx` → `useXPBalance`); fix: `xp_balances.level` nunca era atualizado ("Nível 1" eterno)
- [x] T2.3 Streak em tempo real — decay na leitura em `getOrCreateStreak` (quebra sem depender de treino novo)
- [ ] T2.4 Cron diário — ❌ Bloqueado: `[triggers] crons` desabilitado no wrangler.toml (limite conta Free) — decisão de negócio; urgência reduzida pelo decay na leitura

## Sprint 1 — Track C: Marketplace + Notificações (02/07)

- [x] T3.1 Marketplace listing — ✅ já existia (`/dashboard/marketplace` + `GET /payments/plans`, dados reais)
- [x] T3.2 WhatsApp notifications — `lib/whatsapp.ts` novo; treino atribuído (create + duplicate) → push + WhatsApp; streak milestone → evento `streak.milestone` + push + WhatsApp nos 3 pontos de conclusão. ⚠️ Requer secret `WHATSAPP_NOTIFY_TOKEN` no worker da API
- [x] T3.3 Add to Cart — ⏩ Deferred → S2: "Comprar → checkout" direto já existe; carrinho sem checkout real não agrega

## Sprint 2 — Monetização

- [ ] T4.1 Asaas integration (receber pagamento)
- [ ] T4.2 Checkout flow
- [ ] T4.3 Financial dashboard

---

**Progresso:** 15/19 (79%) — pendentes: T1.7 (WhatsApp assign ✅ coberto por T3.2), T1.8 (QA fluxo), T2.4 (cron, bloqueado), T4.x (Sprint 2)

## Deploys

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| v5.4.1 | Sprint 0 | 2026-07-02 | 47b17add | 15+ |

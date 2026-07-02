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
- [ ] T1.7 Notificação WhatsApp ao atribuir treino (OneSignal `notifyNewWorkout` já existe; WhatsApp pendente → Track C)
- [ ] T1.8 QA fluxo completo: personal cria → atribui → aluno executa → XP/streak

## Sprint 1 — Track B: Dashboard + Gamificação

- [ ] T2.1 Dashboard pessoal (próximo treino, streak, XP, stats)
- [ ] T2.2 Unificar XP (dois sistemas hoje: `xp_transactions` vs `workout_sessions.xp_earned` em gamification.ts)
- [ ] T2.3 Streak logic + cron diário

## Sprint 1 — Track C: Marketplace + Notificações

- [ ] T3.1 Marketplace listing
- [ ] T3.2 WhatsApp notifications (treino atribuído, streak atingida)
- [ ] T3.3 Add to Cart (checkout Sprint 2)

## Sprint 2 — Monetização

- [ ] T4.1 Asaas integration (receber pagamento)
- [ ] T4.2 Checkout flow
- [ ] T4.3 Financial dashboard

---

**Progresso:** 10/17 (59%)

## Deploys

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| v5.4.1 | Sprint 0 | 2026-07-02 | 47b17add | 15+ |

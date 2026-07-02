# VFIT — MVP Roadmap Monetização Rápida

**Objetivo:** Ganhar dinheiro em 4 semanas (treinos reais funcionando)  
**Status Atual:** v5.4.0 (auth + onboarding prontos, mas dados travados)  
**Público:** Personal trainers + alunos deles (SaaS B2B)

---

## Estado Atual vs. Ideal (12 semanas)

```
HOJE (v5.4.0)                    SEMANA 2 (MVP)                 MÊS 3 (Scale)
├─ Auth + Onboarding ✓           ├─ Treinos funcionais ✓        ├─ 1000 alunos
├─ Landing page ✓               ├─ Marketplace básico ✓        ├─ Gamificação full
├─ Dados travados ✗             ├─ Notificações WhatsApp ✓     ├─ Comunidade
├─ Rotas quebradas ✗            ├─ Pagamentos Asaas ✓         ├─ Analytics
└─ Gamificação broken ✗        └─ Dashboard pessoal ✓        └─ Mobile app TWA
```

---

## Sprint 0: "Estabilizar o Navio" (3-4 dias)

**Goal:** Tornar MVP viável (fix bugs críticos, não novas features)

### Tasks (Paralelo)
- [ ] **Bug 1: Roteamento interno** — `/perfil/seguranca`, `/desafios`, `/comunidade`, `/configuracoes` não servem landing page
  - Implementar placeholder pages (Em Breve) OU implementar stubs básicos
  - Duração: 2-3h (human) / 15min (CC)
  - Deploy: v5.4.1

- [ ] **Bug 2: Páginas travadas** — `/treinos`, `/nutricao`, `/progresso` stuck em "Carregando..."
  - Adicionar timeout + fallback UI + Sentry logging
  - Duração: 2-3h / 20min
  - Deploy: v5.4.1

- [ ] **Bug 3: Avaliação duplicada** — Duas avaliações idênticas no POST
  - Implementar idempotency key na requisição
  - Desabilitar botão após clique
  - Constraint BD: unique(user_id, timestamp)
  - Duração: 1-2h / 10min
  - Deploy: v5.4.1

- [ ] **Fine-tuning mobile** — Espaçamento da página `/register/student?from=onboarding`
  - Ajustar padding/margin (rodar `/ui-ux-pro-max` agora)
  - Duração: 30min / 5min

### Outcome
- ✅ Alunos conseguem acessar `/desafios`, `/comunidade`, `/configuracoes`
- ✅ `/treinos` e `/nutricao` carregam ou mostram erro amigável
- ✅ Avaliação física salva sem duplicação
- ✅ Registro mobile tem espaçamento correto
- 🚀 Deploy v5.4.1 → Pronto para próxima fase

**Critical Path:** FIX 3 bugs em paralelo durante HOJE/AMANHÃ

---

## Sprint 1: "MVP Funciona" (1.5 semanas)

**Goal:** Treinos funcionam, pessoal consegue ganhar dinheiro

### 1.1 Backend de Treinos (Real)

**Contexto:** Treinos existem como seeds/mockados; precisam ser:
- Criáveis por personal trainer (CRUD)
- Sincronizáveis com alunos em tempo real
- Editáveis mid-week sem quebrar planos
- Histórico de execução (check-ins)

**Tasks:**
- [ ] API `/api/workouts/create` — POST (personal cria treino)
  - Schema: { title, exercises[], tempo, notas }
  - Validation: JWT + role=personal
  - DB: workouts table (já existe?)
  - Duração: 3h / 30min

- [ ] API `/api/workouts/assign` — POST (personal atribui a aluno)
  - Schema: { workoutId, studentId, startDate, endDate }
  - Validation: JWT + ownership (pessoal é owner do treino)
  - DB: student_workouts (nova table)
  - Duração: 2h / 20min

- [ ] API `/api/workouts/execute` — POST (aluno marca execução)
  - Schema: { studentWorkoutId, exercises[{ exerciseId, reps, weight, notes }] }
  - Sync: Real-time push via WebSocket OU polling
  - DB: workout_executions (nova table)
  - Duração: 4h / 45min

- [ ] Sync Cliente → Backend
  - Zustand store: currentWorkout, exercises[], executionLog
  - Mutation: POST /api/workouts/execute com retry + offline fallback
  - Validation: Certifique-se de que peso/reps/duração passam integrity check
  - Duração: 3h / 35min

**Total Esforço:** 12h (human) / 2h (CC) | **Precedência:** CRÍTICA

### 1.2 Gamificação Funciona (XP + Streaks)

**Contexto:** XP varia por rota; Streaks sempre = 0. Precisam estar unified.

**Tasks:**
- [ ] Unificar XP em Zustand + API
  - GET `/api/user/xp` → retorna saldo actual de BD
  - Zustand dispatch em cada mudança de rota → poll fresh
  - Duração: 2h / 20min

- [ ] Streak Logic
  - Cron job: Às 23:59 UTC, incrementar streak se treino de hoje foi completo
  - Tabela: user_streaks { userId, currentStreak, lastDate, longestStreak }
  - API: GET `/api/user/streak` → current + longest
  - Duração: 3h / 30min

- [ ] UI Consistency
  - Card CARTEIRA VFIT puxar de GET /api/user/xp (nunca hardcoded)
  - Streak badge em cada página puxar de GET /api/user/streak
  - Duração: 1h / 15min

**Total Esforço:** 6h / 1h | **Precedência:** ALTA

### 1.3 Marketplace Básico (Listings)

**Contexto:** Personal vende treinos/ebooks/coaching. MVP = listing + pagina de detalhe.

**Tasks:**
- [ ] Tabela: products { id, personalId, title, description, price, type[workout/ebook/coaching], status }
  - Índice: personalId, status
  - Duração: 30min / 5min

- [ ] API `/api/products/create` — Personal cria produto
  - Schema: { title, description, price, type, mediaUrl }
  - Validation: JWT + role=personal
  - Duração: 2h / 20min

- [ ] API `/api/products/list` — Público vê listings
  - Filtering: type, price range, personal (favorite personals)
  - Pagination
  - Duração: 2h / 20min

- [ ] Page `/dashboard/marketplace` — Browse + detalhe
  - Grid de products
  - Detail modal / page (title, description, preço, fotos, reviews stub)
  - "Add to Cart" button (checkout próximo sprint)
  - Duração: 4h / 40min

**Total Esforço:** 8.5h / 1.5h | **Precedência:** MÉDIA (não bloqueia ganhar dinheiro se pagamento direto funcionar)

### 1.4 Notificações WhatsApp

**Contexto:** Personal precisa notificar aluno quando treino foi criado, quando é hora de treinar.

**Tasks:**
- [ ] Trigger: Novo treino atribuído → enviar WhatsApp
  - Template: "Nova aula! {title} preparada por {trainerName}. Veja em vfit.app.br/treinos"
  - Gateway: Já existe (WHATSAPP-GATEWAY.md)
  - Duração: 2h / 25min

- [ ] Trigger: Streao de 7+ dias → enviar parabéns
  - Template: "🔥 7 dias seguidos! Parabéns, {studentName}! Mantenha o ritmo."
  - Duração: 1h / 12min

- [ ] Trigger: Treino não feito em 2 dias → lembrete
  - Template: "Ei {studentName}, seu treino {workoutTitle} espera você! Vamos?"
  - Duração: 1h / 12min

**Total Esforço:** 4h / 50min | **Precedência:** MÉDIA (adiciona retenção, não bloqueia)

### 1.5 Dashboard Pessoal

**Contexto:** Aluno vê seus treinos, streak, XP, progresso.

**Tasks:**
- [ ] Page `/dashboard` — Cards principais
  - Current workout (próximo a fazer)
  - Streak counter (days + longest)
  - XP balance
  - Recent executions (last 5)
  - Stats card (total workouts, total exercises, lifetime XP)
  - Duração: 4h / 45min

- [ ] Responsive mobile
  - Duração: 1.5h / 15min

**Total Esforço:** 5.5h / 1h | **Precedência:** ALTA

### Sprint 1 Summary

| Component | Human | CC | Bloqueio | Status |
|---|---|---|---|---|
| Treinos Backend | 12h | 2h | **CRÍTICA** | Comece HOJE |
| Gamificação (XP+Streak) | 6h | 1h | ALTA | Paralelo |
| Marketplace Basic | 8.5h | 1.5h | Média | Paralelo |
| Notificações WhatsApp | 4h | 50min | Média | Paralelo |
| Dashboard | 5.5h | 1h | ALTA | Paralelo |
| **TOTAL** | **36h** | **6h** | — | **1.5 semanas** |

**Como isso é possível?** CC comprime 36h human em ~6h = 6x mais rápido. Treinos + Gamificação + Dashboard = MVP pronto em 1.5 semanas.

---

## Sprint 2: "Ganhar Dinheiro" (1 semana)

**Goal:** Pagamentos funcionam, primeira transação real

### Tasks
- [ ] Integração Asaas (já documentado)
  - Personal pode receber pagamento
  - Aluno pode pagar por produto (treino/coaching/ebook)
  - Duração: 4h / 45min (já tem infra, só conectar endpoints)

- [ ] Checkout Flow
  - Adicionar ao carrinho → Checkout → Asaas → Sucesso/erro
  - Duração: 3h / 35min

- [ ] Dashboard Financeiro (Personal)
  - Revenue total, transações recentes, payout schedule
  - Duração: 2h / 25min

**Total:** 9h / 1.5h

---

## Sprint 3: "Scale" (2+ semanas)

**Goal:** 100+ alunos, comunidade, analytics

### Features (não bloqueiam ganhar dinheiro)
- [ ] Comunidade (feed de alunos compartilhando progresso)
- [ ] Desafios (30-day challenges, badges)
- [ ] Analytics (personal vê dados de seus alunos)
- [ ] Mobile app (TWA — documentado em TWA-DOCUMENTATION.md)
- [ ] Refinements (UI polish, performance, a/b tests)

---

## Cronograma Realista

```
HOJE        → Semana 1 (fix bugs críticos + treinos backend)
├─ Sprint 0: 3-4 dias (3 bug fixes)
└─ Sprint 1: 10 dias (treinos, gamificação, marketplace, notificações, dashboard)

SEMANA 2 → Semana 2.5
└─ Sprint 2: 5 dias (pagamentos + checkout)
            🎉 FIRST REVENUE

SEMANA 3+ → Scale
└─ Sprint 3: Features bônus (comunidade, challenges, mobile, analytics)
```

---

## Recursos & Dependências

### Já Existe (NÃO REESCREVER)
- ✅ Auth (OAuth, JWT, sessions)
- ✅ Onboarding (personal + student flows)
- ✅ Design System (BROADCAST dark theme)
- ✅ Notificações (WhatsApp gateway)
- ✅ Pagamentos (Asaas API)
- ✅ Infra (Cloudflare Workers, D1, R2)
- ✅ Database (26 PostgreSQL tables, 5 D1 tables)

### Novo (Precisa Ser Construído)
- **Treinos:** workouts table, assignment logic, execution tracking
- **Gamificação:** streak cron, unified XP store, real-time sync
- **Marketplace:** products table, listing pages, product detail page
- **Dashboard:** personal stats cards, charts, responsive mobile
- **Checkout:** Asaas integration, cart flow, success page

### Externo (Já contratado / pronto)
- Asaas (pagamentos)
- WhatsApp (notificações)
- Cloudflare (infra)
- Google Analytics (futura)

---

## Risks & Mitigations

| Risk | Impacto | Mitigação |
|---|---|---|
| Treinos complexos demais | Bloqueia MVP | Começar com CRUD básico, refinar depois |
| Sync em tempo real falha | Usuarios perdem dados | Implementar retry + offline fallback |
| Asaas integration lenta | Bloqueia pagamentos | Use sandbox primeiro, depois live |
| Notificações WhatsApp falham | Desengajamento | Fallback: email + in-app notification |
| Mobile responsivo quebrado | Usuários saem | Testar em 3 breakpoints (375px, 768px, 1024px) |

---

## Métricas de Sucesso (Week 2)

- ✅ 1º treino criado por personal
- ✅ 1º treino atribuído a aluno
- ✅ 1º treino executado (check-in)
- ✅ XP sincronizado (mesmo valor em todas as rotas)
- ✅ Notificação WhatsApp enviada
- ✅ Dashboard carrega sem erros

## Métricas de Sucesso (Week 4)

- ✅ 1ª transação paga (Asaas)
- ✅ 50+ alunos ativos
- ✅ 10+ treinos criados
- ✅ Revenue > $0 (qualquer amount)

---

## Recomendação Final

**NÃO PERFECCIONAR.** Perfecção matou startups.

1. Fix 3 bugs críticos HOJE (4h)
2. Treinos + Gamificação + Dashboard SEMANA 1 (36h human / 6h CC)
3. Pagamentos SEMANA 2 (9h human / 1.5h CC)
4. **Ganhar dinheiro na semana 2**
5. Polish + scale depois

**Você pode estar ganhando dinheiro em 2 semanas.**  
**Comece AGORA.**

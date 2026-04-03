# 📊 TRACKING — VFIT Ultra v2

> Status em tempo real de cada sprint e task.
> ⬜ = Pendente · 🔄 = Em progresso · ✅ = Concluído · ❌ = Bloqueado
> **Última atualização:** 03/04/2026 — v1.2.6

---

## Fase 1 — Fundação

### S0: Visual Foundation ✅ (v1.2.1 — commit `565b2e48`)
- [x] T0.1 — Auditar todas as ocorrências de `bg-green`, `bg-emerald` fora de botões/badges
- [x] T0.2 — Redefinir CSS vars de fundo: cards B2C usam `bg-surface-1/2` navy
- [x] T0.3 — Substituir fundos verdes de cards por navy + borda glass
- [x] T0.4 — Atualizar quick-action cards do student dashboard (verde → navy glass)
- [x] T0.5 — Atualizar stats cards do student dashboard
- [x] T0.6 — Padronizar empty states: fundo navy, ícone SVG, sem emojis
- [x] T0.7 — Documentar palette decision no DESIGN-SYSTEM.md
> **27 arquivos** modificados. Deploy em v1.2.1.

### S1: Navbar & Header ✅ (v1.2.2 — commit `f4f85d3b`)
- [x] T1.1 — Criar `StudentHeader` (sticky top, avatar, notifs, título da página)
- [x] T1.2 — Redesign `BottomNavigation` com SVG custom dual-state (outline/filled)
- [x] T1.3 — Criar ícone IA premium (sparkles customizado ou brain SVG)
- [x] T1.4 — Adicionar FAB ou quick-action no navbar se necessário
- [x] T1.5 — Safe-area insets no novo header
- [x] T1.6 — Integrar no layout `(app)`
- [x] T1.7 — Testar admin→student view com novo layout
> **16 arquivos** modificados. Deploy em v1.2.2.

### S2: Pricing Unification ✅ (v1.2.3 — commit `4d72eeed`)
- [x] T2.1 — Definir preços finais B2C em `config/constants.ts` VFIT_PLANS
- [x] T2.2 — Remover hardcoded prices de `perfil/assinatura/page.tsx`
- [x] T2.3 — Remover hardcoded prices de `paywall-plans.tsx`
- [x] T2.4 — Remover PLAN_PRICES duplicado de `use-platform-checkout.ts`
- [x] T2.5 — Remover PLAN_PRICES duplicado de `workers/api/platform.ts`
- [x] T2.6 — Criar helper `getPlanPrice(slug, billing)` centralizado
- [x] T2.7 — Atualizar paywall para ler de VFIT_PLANS
- [x] T2.8 — Atualizar subscription page para ler de VFIT_PLANS
- [x] T2.9 — Verificar consistência frontend ↔ backend
> **11 arquivos** (lib/pricing.ts + 10 consumers). 175 inserções / 112 remoções. Deploy em v1.2.3.

### S3: Dynamic D1 Config ✅ (v1.2.4 — commit `ce88a080`)
> ⚠️ Sprint NÃO estava no plano original — foi criado como extensão do S2.
> Escopo: tornar TODOS os preços e configs dinâmicos via D1, gerenciáveis pelo super_admin.

- [x] T3.extra.1 — Migration D1 `0006_platform_config.sql` (3 tabelas + seed completo)
- [x] T3.extra.2 — API CRUD `workers/api/config.ts` (7 endpoints: 3 públicos + 4 admin)
- [x] T3.extra.3 — React Query hooks `use-platform-config.ts` (6 hooks com fallback estático)
- [x] T3.extra.4 — Admin Config Page `/dashboard/admin/config` (6 tabs: B2B, B2C, Fees, XP, Rate Limits, Cache)
- [x] T3.extra.5 — QuickLink "Configuração" no admin dashboard
- [x] T3.extra.6 — Aplicar migration D1 remota (87 rows seed)
- [x] T3.extra.7 — TypeScript check 0 erros + deploy
> **6 arquivos** novos/modificados. D1: 3 tabelas, 28 registros seed. Deploy em v1.2.4.

### S3b: Onboarding Perfect ✅ (v1.2.5 — commit `e8ce2960`)
- [x] T3.1 — Substituir TODOS os emojis por DSIcon (17 steps + 6 pages + 3 paywall = 24 arquivos)
- [x] T3.2 — Persistir dados do onboarding no DB via `useSyncOnboarding` hook + POST `/onboarding`
- [x] T3.3 — Corrigir redirect pós-paywall (todos `/plano` → `/login?from=onboarding&plan=X`)
- [x] T3.4 — Paywall já usa VFIT_PLANS + pricing helpers (confirmado, sem mudanças)
- [x] T3.5 — Flow "continuar gratuitamente" → `/login?from=onboarding&plan=free`
- [ ] T3.6 — ⏩ Deferred → S9 (precisa custom SVG illustrations)
- [ ] T3.7 — ⏩ Deferred → S5 (precisa tabela B2C student no backend)
- [ ] T3.8 — ⏩ Deferred → S5 (precisa assessment backend)
> **24 arquivos** modificados (269 inserções / 180 deleções) + 1 hook novo. Deploy em v1.2.5.

---

## Fase 2 — Funcionalidade

### S4: Payment B2C
- [ ] T4.1 — Criar endpoint `POST /api/v1/vfit/checkout` (B2C)
- [ ] T4.2 — Integrar Asaas PIX para B2C (criar customer + payment)
- [ ] T4.3 — Implementar onClick no botão "Assinar" da subscription page
- [ ] T4.4 — Criar hook `useVfitCheckout` para B2C
- [ ] T4.5 — Mostrar QR code PIX na subscription page
- [ ] T4.6 — Implementar webhook B2C para confirmar pagamento
- [ ] T4.7 — Atualizar `subscription_plan` do student após confirmação
- [ ] T4.8 — Implementar cancelamento de assinatura
- [ ] T4.9 — UI de upgrade/downgrade na subscription page
- [ ] T4.10 — Testar flow completo: assinar → pagar → confirmar → ativar

### S5: Auto Assessment & Nutrition
- [ ] T5.1 — Criar endpoint `POST /api/v1/self-assessments/from-onboarding`
- [ ] T5.2 — Mapear dados: onboarding → self_assessment (weight, height, goal, activity)
- [ ] T5.3 — Calcular BMI + classificação automaticamente
- [ ] T5.4 — Gerar metas nutricionais personalizadas (Mifflin-St Jeor)
- [ ] T5.5 — Salvar nutrition_targets no perfil do student
- [ ] T5.6 — `nutricao/page.tsx` ler targets do perfil (não hardcoded)
- [ ] T5.7 — Bridge: onboarding complete → auto-create assessment
- [ ] T5.8 — Bridge: assessment → auto-calculate nutrition targets
- [ ] T5.9 — Mostrar assessment no dashboard pós-onboarding
- [ ] T5.10 — Dieta IA funcionar sem assessment manual (usar auto)

### S6: AI Workout Persistence
- [ ] T6.1 — Salvar plano gerado no DB (tabela `vfit_plans` ou `workout_plans`)
- [ ] T6.2 — Criar endpoint `POST /api/v1/plans/activate` (ativar plano)
- [ ] T6.3 — Criar endpoint `GET /api/v1/plans/active` (plano ativo do student)
- [ ] T6.4 — Frontend: redirecionar para /plano após ativação
- [ ] T6.5 — /plano/page.tsx buscar plano do DB (não sessionStorage)
- [ ] T6.6 — Exercícios do plano IA → vincular com biblioteca D1
- [ ] T6.7 — Suportar regeneração de plano (com limite free: 1/mês)
- [ ] T6.8 — Histórico de planos gerados
- [ ] T6.9 — Fluxo "Meu Plano" → abre plano ativo, não template

### S7: Student Dashboard B2C
- [ ] T7.1 — Criar `StudentDashboardB2C` separado do B2B
- [ ] T7.2 — Quick actions: Treinar agora → /treino-ativo, Avaliações → /avaliacoes, Plano → /plano
- [ ] T7.3 — Card "Treino do dia" → ler do plano ativo
- [ ] T7.4 — Mini KPIs mobile-first (streak, XP, próximo treino)
- [ ] T7.5 — Progress ring semanal (treinos feitos / meta)
- [ ] T7.6 — Card de nutrição resumo (kcal hoje)
- [ ] T7.7 — Follow-up cards (completar perfil, fazer avaliação, iniciar treino)
- [ ] T7.8 — Redirect admin→student para app B2C (/treinos), não dashboard B2B

---

## Fase 3 — Integração

### S8: OneSignal & Follow-ups
- [ ] T8.1 — Adicionar `OneSignalProvider` no layout `(app)`
- [ ] T8.2 — Sincronizar external_id do student B2C
- [ ] T8.3 — Tags B2C: `user_type=student`, `plan=free|premium`, `onboarding_complete`
- [ ] T8.4 — Push: Lembrete de treino diário (horário preferido do onboarding)
- [ ] T8.5 — Push: Streak prestes a quebrar (18h sem treino)
- [ ] T8.6 — Push: Pagamento confirmado
- [ ] T8.7 — Push: Novo plano gerado pela IA
- [ ] T8.8 — In-app follow-up cards: completar perfil, fazer avaliação, primeiro treino
- [ ] T8.9 — In-app: Upgrade prompt após 3 treinos (free limit approaching)
- [ ] T8.10 — Configuração de preferências de notificação funcional

### S9: Animations & Premium Icons
- [ ] T9.1 — Implementar LazyMotion + domAnimation (eliminar 40-60KB)
- [ ] T9.2 — Criar SVG icon set para onboarding (substituir emojis)
- [ ] T9.3 — SVG icons para loading phases (substituir 🏋️ 🎯 etc)
- [ ] T9.4 — Redesign bottom nav icons: SVG dual-state (outline + filled)
- [ ] T9.5 — Micro-interactions: button press, card tap, tab switch
- [ ] T9.6 — Page transitions entre tabs do app B2C
- [ ] T9.7 — Skeleton loading para todas as páginas B2C
- [ ] T9.8 — Pull-to-refresh com animação premium
- [ ] T9.9 — Confetti/celebration no workout complete

### S10: Audit — Security & Backend
- [ ] T10.1 — Fix SQL injection em specialties literal (personals.ts)
- [ ] T10.2 — Mover /ai/analyze-photo para depois do authMiddleware
- [ ] T10.3 — Implementar idempotência nos webhooks Asaas/Stripe
- [ ] T10.4 — Remover DDL em runtime (notifications.ts)
- [ ] T10.5 — Adicionar rate limit: chat, passkey, student invite
- [ ] T10.6 — Fix `throw new Error()` → AppError subclasses (14 ocorrências)
- [ ] T10.7 — Adicionar onError handler às 21 mutations faltando
- [ ] T10.8 — Queue handler: tipar messages com union discriminada

---

## Fase 4 — Excelência

### S11: Audit — Performance & Bundle
- [ ] T11.1 — Dynamic import xlsx na página de import
- [ ] T11.2 — Dynamic import pdf-lib no componente de export
- [ ] T11.3 — Dynamic import qrcode (2 páginas)
- [ ] T11.4 — Lazy load charts em student-dashboard e assessment-detail
- [ ] T11.5 — Limpar CSS morto do globals.css (18 keyframes + 30 classes)
- [ ] T11.6 — Comprimir PNG 3.3MB → WebP
- [ ] T11.7 — Remover fontes Syne/DM Sans do carregamento global
- [ ] T11.8 — Adicionar React.memo em componentes de lista

### S12: Audit — Cleanup & DX
- [ ] T12.1 — Remover 36 console.log de produção
- [ ] T12.2 — Tipar as 20 instâncias de `as any`
- [ ] T12.3 — Unificar componentes duplicados (stats-card, rest-timer, page-transition)
- [ ] T12.4 — Remover zod schemas mortos do frontend
- [ ] T12.5 — Remover imports não utilizados (14 instâncias)
- [ ] T12.6 — Padronizar paginação (success inline vs paginated helper)
- [ ] T12.7 — Adicionar Suspense para useSearchParams (5 páginas)

### S13: Polish Final
- [ ] T13.1 — Adicionar aria-label="Voltar" nos 11 botões back
- [ ] T13.2 — Aumentar touch target dos botões back (p-1 → min-h-11 min-w-11)
- [ ] T13.3 — Criar skeletons mobile para views do aluno
- [ ] T13.4 — Substituir empty states inline por EmptyState component
- [ ] T13.5 — Adicionar error.tsx em rotas críticas do dashboard
- [ ] T13.6 — QA completo: onboarding → plano → treino → avaliação → pagamento
- [ ] T13.7 — Lighthouse audit mobile: meta 90+
- [ ] T13.8 — Deploy v2.0.0

---

## Contagem

| Fase | Sprints | Tasks | Concluídas |
|:----:|:-------:|:-----:|:----------:|
| 1 | S0–S3b | 33 + 7 extra + 5 S3b | **45/48** ✅ (3 deferred) |
| 2 | S4–S7 | 37 | 0/37 |
| 3 | S8–S10 | 28 | 0/28 |
| 4 | S11–S13 | 23 | 0/23 |
| **Total** | **14+1** | **136** | **45** (33%) |

### Deploys realizados

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| v1.2.1 | S0: Visual Foundation | 03/04/2026 | `565b2e48` | 27 |
| v1.2.2 | S1: Navbar & Header | 03/04/2026 | `f4f85d3b` | 16 |
| v1.2.3 | S2: Pricing Unification | 03/04/2026 | `4d72eeed` | 11 |
| v1.2.4 | S3: Dynamic D1 Config | 03/04/2026 | `ce88a080` | 6 |
| v1.2.5 | S3b: Onboarding Perfect | 03/04/2026 | `e8ce2960` | 24 |
| v1.2.6 | Docs: Regra 20 & Tracking | 03/04/2026 | `115994cf` | 4 |

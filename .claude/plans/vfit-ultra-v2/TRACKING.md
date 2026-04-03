# 📊 TRACKING — VFIT Ultra v2

> Status em tempo real de cada sprint e task.
> ⬜ = Pendente · 🔄 = Em progresso · ✅ = Concluído · ❌ = Bloqueado

---

## Fase 1 — Fundação

### S0: Visual Foundation
- [ ] T0.1 — Auditar todas as ocorrências de `bg-green`, `bg-emerald` fora de botões/badges
- [ ] T0.2 — Redefinir CSS vars de fundo: cards B2C usam `bg-surface-1/2` navy
- [ ] T0.3 — Substituir fundos verdes de cards por navy + borda glass
- [ ] T0.4 — Atualizar quick-action cards do student dashboard (verde → navy glass)
- [ ] T0.5 — Atualizar stats cards do student dashboard
- [ ] T0.6 — Padronizar empty states: fundo navy, ícone SVG, sem emojis
- [ ] T0.7 — Documentar palette decision no DESIGN-SYSTEM.md

### S1: Navbar & Header
- [ ] T1.1 — Criar `StudentHeader` (sticky top, avatar, notifs, título da página)
- [ ] T1.2 — Redesign `BottomNavigation` com SVG custom dual-state (outline/filled)
- [ ] T1.3 — Criar ícone IA premium (sparkles customizado ou brain SVG)
- [ ] T1.4 — Adicionar FAB ou quick-action no navbar se necessário
- [ ] T1.5 — Safe-area insets no novo header
- [ ] T1.6 — Integrar no layout `(app)`
- [ ] T1.7 — Testar admin→student view com novo layout

### S2: Pricing Unification
- [ ] T2.1 — Definir preços finais B2C em `config/constants.ts` VFIT_PLANS
- [ ] T2.2 — Remover hardcoded prices de `perfil/assinatura/page.tsx`
- [ ] T2.3 — Remover hardcoded prices de `paywall-plans.tsx`
- [ ] T2.4 — Remover PLAN_PRICES duplicado de `use-platform-checkout.ts`
- [ ] T2.5 — Remover PLAN_PRICES duplicado de `workers/api/platform.ts`
- [ ] T2.6 — Criar helper `getPlanPrice(slug, billing)` centralizado
- [ ] T2.7 — Atualizar paywall para ler de VFIT_PLANS
- [ ] T2.8 — Atualizar subscription page para ler de VFIT_PLANS
- [ ] T2.9 — Verificar consistência frontend ↔ backend

### S3: Onboarding Perfect
- [ ] T3.1 — Substituir emojis do loading por SVG animados
- [ ] T3.2 — Persistir dados do onboarding no DB (não só sessionStorage)
- [ ] T3.3 — Corrigir redirect pós-paywall (skip → treinos, subscribe → checkout)
- [ ] T3.4 — Usar preços de VFIT_PLANS no paywall
- [ ] T3.5 — Implementar flow "continuar gratuitamente" funcional
- [ ] T3.6 — Melhorar steps motivacionais (SVG illustrations)
- [ ] T3.7 — Salvar onboarding como perfil B2C no backend
- [ ] T3.8 — Auto-trigger assessment + nutrition após onboarding

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

| Fase | Sprints | Tasks |
|:----:|:-------:|:-----:|
| 1 | S0–S3 | 33 |
| 2 | S4–S7 | 37 |
| 3 | S8–S10 | 28 |
| 4 | S11–S13 | 23 |
| **Total** | **14** | **121** |

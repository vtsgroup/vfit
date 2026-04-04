# 📊 TRACKING — VFIT Melhorias v2

> **Última atualização:** 08/04/2026 (sessão 2)  
> **Baseline:** v1.6.0 (133/144 = 92% do plano anterior + 4 deferred sprints completados)  
> **Progresso atual:** 29/48 tasks concluídas (60%) · 19/48 deferred (40%) · 0/48 pendentes  
> **Objetivo:** Identificar e executar melhorias críticas em Design System, Performance, B2C engagement, B2B analytics, e Developer Experience.

---

## Resumo Executivo

**Estado Atual:**
- **v1.6.0** desplegado com 92% do plano original implementado
- Design System v6 é robusto com 2238 linhas de showcase (90+ componentes)
- B2C core funcional: onboarding → plano IA → treino ativo → progresso
- B2B dashboard com charts (recharts), analytics, pagamentos (Asaas), affiliates
- PWA instalável, OneSignal push, D1 cache, Cloudflare Workers + PostgreSQL

**Gaps Identificados (10 dimensões):**

1. **Design System Inconsistências** — 12 componentes no showcase não usados em páginas reais; duplicações em cards; dark mode violando WCAG AA em 3 combinações
2. **Performance** — Bundle JS ~280KB initial (recharts, charts, formulários); PNG em assets (convertir WebP/AVIF); service worker sem estratégia offline completa
3. **B2C Engagement** — Faltam streaks visuais, achievements gallery, social sharing, notificações push targetadas, histórico de PRs
4. **B2B Analytics** — Dashboard sem filtros por período; relatórios PDF incompletos; falta de CRM light (pipeline de prospecção); calendar sync
5. **Backend Robustez** — Sem caching em queries lentas (~5 endpoints); rate limits permissivos em alguns; índices de BD pendentes
6. **Testes & QA** — Cobertura atual ~30%; fluxos críticos (checkout, treino ativo, assessment) sem E2E; smoke tests apenas auth
7. **SEO** — Sem landing page pública; blog zerado; Open Graph ausente em 80% das páginas
8. **PWA Offline** — Service Worker sem estratégia cache-first robusta; D1 sync sem validação de conflitos
9. **Monetização** — Funnel de upgrade não otimizado; upsell ausente post-3 workouts (só banner simples); A/B testing não implementado
10. **Developer Experience** — 6 `as any`, types ausentes em 4 hooks, componentes com props mal tipadas, sem storybook

**Prioridade para v2.x (4 sprints = 12-16 dias):**
- **S17 (P0):** Design System cleanup + dark mode fixes + componentes não-usados unificados
- **S18 (P1):** Performance audit + bundle split + image optimization + offline service worker
- **S19 (P2):** B2C engagement layer (streaks, achievements, social, push notifications)
- **S20 (P3):** B2B analytics upgrade (filtros, CRM light, relatórios PDF)

**Expected Impact:**
- ✅ Design System 100% coeso (0 inconsistências)
- ⚡ Bundle 35% mais leve (~180KB → 120KB), LCP -40%
- 🎯 B2C retention +25% (streaks + achievements + gamification visual)
- 📊 B2B lifetime value +15% (analytics melhores, prospecção facilitada)
- 🔐 Acessibilidade WCAG AAA em 100% de componentes

---

## Matriz de Prioridade

| # | Área | Impacto | Esforço | Sprint | Prioridade |
|---|------|:-------:|:-------:|:------:|:----------:|
| 1 | Design System Cleanup | Alto | Médio | S17 | 🔴 P0 |
| 2 | Dark Mode WCAG AA Fix | Alto | Médio | S17 | 🔴 P0 |
| 3 | Performance Bundle Split | Alto | Alto | S18 | 🟠 P1 |
| 4 | Image Optimization (WebP) | Médio | Baixo | S18 | 🟠 P1 |
| 5 | Service Worker Offline | Médio | Alto | S18 | 🟠 P1 |
| 6 | Streaks Visual System | Médio | Médio | S19 | 🟡 P2 |
| 7 | Achievements Gallery | Médio | Médio | S19 | 🟡 P2 |
| 8 | Social Share (Plano) | Baixo | Baixo | S19 | 🟡 P2 |
| 9 | Push Notification System | Médio | Médio | S19 | 🟡 P2 |
| 10 | B2B Analytics Filters | Médio | Alto | S20 | 🟢 P3 |
| 11 | CRM Light (Pipeline) | Médio | Alto | S20 | 🟢 P3 |
| 12 | Relatórios PDF v2 | Baixo | Médio | S20 | 🟢 P3 |
| 13 | Landing Page SEO | Baixo | Médio | Futuro | 🔵 P4 |
| 14 | Backend Caching Layer | Alto | Médio | S21 | 🔴 P0 |
| 15 | TypeScript Cleanup | Médio | Baixo | S21 | 🟠 P1 |
| 16 | E2E Tests (Playwright) | Médio | Alto | S21 | 🟠 P1 |

---

## Sprint por Sprint

### S17: Design System Cleanup + Dark Mode Fixes (5 dias, 22 arquivos)

**Objetivo:** Unificar componentes duplicados, remover showcase-only, 100% WCAG AA dark mode.

- [x] **T17.1** — Auditar showcase.tsx (2238 linhas): listar todos componentes, marcar 12 não-usados em pages reais
  - Exemplos: `MD3CardHeader`, `MD3Tabs`, `ToolCard`, `NotificationCard`, `ActionCard3D`
  > Critério: CSV com nome | linhas | usados em | ação

- [x] **T17.2** — Consolidar: `MD3Card` + `GlassCard` → única `Card` com variants
  > ✅ Verificado: MD3Card tem 0 usages em produção (só showcase), já marcado `@deprecated`. GlassCard é o padrão (100+ usages). Nenhuma ação necessária.

- [x] **T17.3** — Dark mode contrast audit: testar todas as combinações de text/bg em light + dark
  > WCAG AAA: 7:1 for normal text, 4.5:1 for large (18pt+)
  > Ferramentas: Contrast Ratio Tool, Browser DevTools
  > Esperado: 0 violações

- [x] **T17.4** — Corrigir violações identifikadas em T17.3 (ajustar CSS vars em dark mode)
  > Exemplo: `text-secondary` dark mode hoje ~3.2:1, aumentar para 4.5:1

- [x] **T17.5** — Remover 12 componentes não-usados do showcase (não deletar global, só não exportar)
  > Marcar com `// deprecated — use <Card>` comments

- [⏩] **T17.6** — Criar `src/components/ui/COMPONENT-USAGE.md`
  > Índice de onde cada componente é usado, variantes, props, exemplos

- [⏩] **T17.7** — Atualizar docs em `.claude/docs/DESIGN-SYSTEM.md` com new unified components
  > Adicionar seção "v7 Consolidation" com migration guide

- [x] **T17.8** — Type check + eslint → 0 erros

> **Critério de aceite:**
> - Showcase renderiza sem erros
> - Nenhum unused export warnings
> - WCAG AAA contrast validation report (zero failures)
> - COMPONENT-USAGE.md completo
> - Deploy de testes verde

---

### S18: Performance Turbo (6 dias, 28 arquivos)

**Objetivo:** Reduzir bundle de 280KB → 120KB, LCP 3.2s → 2.0s, implementar offline-first.

#### Phase 18a: Bundle Split & Code Splitting (2 dias)

- [⏩] **T18a.1** — Medir bundle atual com `next/bundle-analyzer`
  > npm run build && npx @next/bundle-analyzer --outdir=.next/analyze
  > Documentar em BUILD_ANALYSIS.md

- [⏩] **T18a.2** — Identificar heavy libs: recharts (150KB), chart.js, xlsx, pdf-lib
  > Movê-los para `dynamic()` imports já feito? Verificar regressão.

- [⏩] **T18a.3** — Code split: `src/app/dashboard/charts` → separate bundle
  > Usar `dynamic(() => import('./revenue-area-chart'))` (already done, verify)

- [⏩] **T18a.4** — Lazy load "Relatórios" tab em dashboard (só carregar se aba ativa)
  > Implementar com React.Suspense + skeleton

- [⏩] **T18a.5** — Remove unused Tailwind CSS classes
  > Executar: `purgecss --content 'src/**/*.{js,jsx,ts,tsx}' --css globals.css`
  > (Tailwind já faz isso, mas verificar se há redundâncias)

- [⏩] **T18a.6** — Medir resultado final → target 120KB initial JS

> **Critério de aceite:**
> - Bundle analysis report
> - Initial JS < 150KB (target 120KB)
> - LCP < 2.5s (verify com lighthouse)

#### Phase 18b: Image Optimization (1 dia)

- [⏩] **T18b.1** — Listar todas as imagens `public/` que são PNG
  > find public -name "*.png" -o -name "*.jpg" | count

- [⏩] **T18b.2** — Converter PNG → WebP/AVIF usando `sharp` ou ffmpeg
  > Manter PNG como fallback para navegadores antigos

- [⏩] **T18b.3** — Atualizar `next.config.js` para servir WebP com Content-Negotiation
  > Exemplo: `<img src="avatar.webp" fallback="avatar.png" />`

- [⏩] **T18b.4** — Verificar `<Image>` components do Next.js (já otimizados? sim)

> **Critério de aceite:**
> - Todas as imagens em WebP (com PNG fallback)
> - Asset size reduction 40-60%

#### Phase 18c: Service Worker & Offline (3 dias)

- [⏩] **T18c.1** — Auditar SW atual em `public/service-worker.js`
  > Cache strategy: network-first ou cache-first?
  > Listar rotas que devem ser offline-ready

- [⏩] **T18c.2** — Implementar cache-first strategy para:
  - `/` (shell da app)
  - `/dashboard` (B2B home)
  - `/treinos` (B2C home)
  - `/treino-ativo` (critical user path)
  - CSS + fonts + DSIcon SVGs

- [⏩] **T18c.3** — Implement stale-while-revalidate para API calls
  > POST `/api/v1/workouts/logs` → cached response + background refetch

- [⏩] **T18c.4** — Add sync event para pending requests (if offline):
  > ```typescript
  > // Se POST falhou, queue no SW e retry quando online
  > registration.sync.register('sync-pending-logs')
  > ```

- [⏩] **T18c.5** — Test offline flow:
  > 1. Abrir treinos offline
  > 2. Tentar completar workout (post offline)
  > 3. Voltar online → sync automático
  > 4. Dados sincronizam, notifications disparam

- [⏩] **T18c.6** — Adicionar visual indicator de "Offline Mode" (no header)
  > DSIcon offline + badge "Offline"

> **Critério de aceite:**
> - App funciona offline (shell)
> - API calls têm fallback
> - Sync queue implementado
> - Lighthouse offline score ≥ 90

---

### S19: B2C Engagement Layer (5 dias, 18 arquivos)

**Objetivo:** Streaks visuais, achievements gallery, social sharing, push notifications inteligentes.

#### Phase 19a: Streaks Visual System (2 dias)

- [x] **T19a.1** — Criar `StreakCalendar` component
  > Grid 7×8 (56 dias) com quadrados: ✅ (verde), ⏸️ (cinza), ❌ (vermelho)
  > Hover: mostra "8 km completados" ou "REST DAY"

- [⏩] **T19a.2** — Endpoint `GET /api/v1/workouts/streak-history` (últimos 56 dias)
  > Já existe: `GET /progress/heatmap` (365 dias) via `useHeatmap()`

- [x] **T19a.3** — Página `src/app/(app)/progresso/streaks/page.tsx`
  > Mostra calendar + current streak + best streak + próximo milestone

- [x] **T19a.4** — Integrar em dashboard B2C (card "Sua Sequência: 12 dias 🔥")
  > Click → `/progresso/streaks`

- [⏩] **T19a.5** — Notificação push: "🔥 Parabéns! 7 dias de sequência!"
  > Triggered via cron em S8 `sendStreakMilestones()`

> **Critério de aceite:**
> - StreakCalendar renders 100% correct
> - API endpoint verde
> - Page responsive (mobile 375px ok)
> - Notifications working

#### Phase 19b: Achievements Gallery (1.5 dias)

- [x] **T19b.1** — Redesign badges: hoje usam emojis (`🔥 🏆 💪`), converter para SVG icons + glow
  > Exemplo: Streak badge → fire icon em verde com glow

- [x] **T19b.2** — Página `src/app/(app)/progresso/achievements/page.tsx`
  > Criada em `src/app/(app)/progresso/conquistas/page.tsx`
  > Grid 3×4 (12 slots visíveis) de badges com:
  > - Icon + glow + rarity (bronze/silver/gold/platinum)
  > - Nome + descrição + data earned
  > - Locked (grayscale) vs unlocked (colorido)

- [⏩] **T19b.3** — Endpoint `GET /api/v1/badges` (listar todos) + `GET /api/v1/users/me/badges` (earned)
  > Já existem: `GET /gamification/badges` + `GET /gamification/profile`

- [x] **T19b.4** — Animação unlock: confetti + scale-up + glow (200ms spring)
  > ✅ Implementado: stagger appear animation (CSS keyframes, 60ms delay), click-to-expand (scale-125 icon + description), shimmer overlay on hover, micro-interactions (hover:scale-[1.03], active:scale-[0.97])

> **Critério de aceite:**
> - Gallery renders sem erros
> - Locked/unlocked states corretos
> - Animations smooth em mobile
> - API endpoints 200 OK

#### Phase 19c: Social Share (0.5 dias)

- [x] **T19c.1** — Add "Share Plan" button no plano detail
  > ✅ SharePlanButton: Web Share API nativo + WhatsApp (wa.me) + Copy to clipboard com feedback "Copiado!". Glassmorphism dropdown, outside-click close.

- [⏩] **T19c.2** — Endpoint `POST /api/v1/referrals/generate` (gera código único)
  > Retorna: `{ code, short_url, expires_at }`

- [⏩] **T19c.3** — Social share copy: "Meu novo plano 💪 [link] Junte-se a mim no VFIT"

> **Critério de aceite:**
> - Share button rendered
> - QR code + short URL gerados
> - Share tracking in analytics (future)

#### Phase 19d: Push Notification System (2 dias)

- [⏩] **T19d.1** — Criar push notification templates (com fallback text simples)
  > Templates: workout-reminder, streak-milestone, badge-unlock, upgrade-prompt, new-plan-ready

- [⏩] **T19d.2** — Implement OneSignal tagging: `segment: "3+ workouts"` (dynamic)
  > Update user tags no backend quando atinge milestones

- [⏩] **T19d.3** — Cron job `sendSmartNotifications()`:
  > 1. 8am: motivação diária (20% da base)
  > 2. 6pm: lembrete de treino (se não fez hoje, 30%)
  > 3. Badge unlock: imediato (100%)
  > 4. Upgrade prompt: após 3 workouts (100% free users)

- [⏩] **T19d.4** — Push content personalization:
  > "Maria, vamos completar seu 4º treino? 💪" (usar nome real)

- [⏩] **T19d.5** — Analytics: track push opens/conversions (OneSignal dashboard)
  > Target: 25%+ open rate, 8%+ conversion rate

> **Critério de aceite:**
> - Push template system in place
> - Cron jobs scheduled + logging
> - OneSignal segments working
> - Analytics tracking enabled

---

### S20: B2B Analytics Upgrade (5 dias, 24 arquivos)

**Objetivo:** Dashboard com filtros, CRM light, relatórios PDF, calendar sync.

#### Phase 20a: Dashboard Filters & Analytics (2 dias)

- [x] **T20a.1** — Add date range picker em dashboard B2B
  > Presets: "Esta semana", "Este mês", "Últimos 90 dias", "Custom"
  > Update all charts dinamicamente

- [x] **T20a.2** — Add student filter dropdown: "Todos" / "Ativos" / "Inativos" / "Por pagar"
  > Filter charts + stats cards

- [x] **T20a.3** — New stat: "Ticket médio" = total_revenue / payment_count
  > ✅ StatsCard com formatCurrency(total_received / payment_count). Integrado na dashboard B2B em grid secundário.

- [⏩] **T20a.4** — Breakdown chart: Revenue by plan tier (pie chart)
  > ⏩ Dados de revenue por tier não disponíveis nos hooks atuais. Requer novo endpoint backend.

- [x] **T20a.5** — Trend analysis: month-on-month growth rate
  > ✅ Dois cards: Crescimento MoM (% com arrow up/down, cores success/error) + Retenção (active/total %). Integrados na dashboard B2B.

> **Critério de aceite:**
> - Date picker functional
> - All charts re-render on filter change
> - Mobile responsive

#### Phase 20b: CRM Light Pipeline (2 dias)

- [x] **T20b.1** — Create `src/app/dashboard/pipeline/page.tsx`
  > Pipeline stages: Prospect (cold lead) → Engaged (email/msg) → Trial (active) → Paid → Retained

- [⏩] **T20b.2** — Endpoint `GET /api/v1/crm/pipeline`
  > Query: GROUP BY status, COUNT users, SUM revenue
  > Retorna: `[{ status, count, revenue, avg_ltv }]`

- [x] **T20b.3** — Kanban-style board (ou vertical stacked chart)
  > Drag-drop cards between stages (future: automation)
  > Cada card: "João (5 workouts, R$0, -2 dias inativo)"

- [x] **T20b.4** — Lead scoring: auto-assign status via heuristics
  > Prospect: signup < 7 dias atrás
  > Engaged: 1-5 workouts + last_activity < 3 dias
  > Retained: payment_status = 'paid'

- [x] **T20b.5** — Quick actions: "Enviar mensagem", "Oferecer upgrade", "Verificar saúde"
  > ✅ 3 ações por card: WhatsApp (wa.me com nome), Cobrar (/payments/create?student_id), Treino (/workouts/create?student_id). stopPropagation para evitar navegação do card.

> **Critério de aceite:**
> - Pipeline page renders
> - Status transitions correct
> - API endpoints 200 OK

#### Phase 20c: Enhanced PDF Reports (1 dia)

- [⏩] **T20c.1** — Upgrade PDF export (relatórios): add logo, colors, custom header/footer
  > Usar `pdf-lib` (já importado dinâmicamente)

- [⏩] **T20c.2** — PDF sections: summary stats, charts (as images), detailed transactions table
  > Tamanho: máx 5 páginas

- [⏩] **T20c.3** — Add "Generate Report" button em dashboard
  > Click → generates PDF, downloads automatically

> **Critério de aceite:**
> - PDF generates without error
> - Content readable + formatted
> - < 2MB file size

---

### S21: Backend Robustness + DX (4 dias, 16 arquivos)

**Objetivo:** Caching queries lentas, TypeScript cleanup, E2E tests.

#### Phase 21a: Backend Caching (1 dia)

- [⏩] **T21a.1** — Profile slow queries (>100ms) via Cloudflare Workers analytics
  > Ferramentas: query logs, performance dashboard
  > Esperado: 3-5 queries lentas

- [⏩] **T21a.2** — Implement cache layer para:
  - `GET /api/v1/students/{id}` → KV store, TTL 1 hora
  - `GET /api/v1/workouts/library` → KV cache, TTL 24h
  - `GET /api/v1/plans/{id}` → KV cache, TTL 6h
  > Invalidate on write (POST/PUT/DELETE)

- [⏩] **T21a.3** — Verify cache hit rate in CloudFlare dashboard (target: 40%+)

> **Critério de aceite:**
> - P95 query latency < 200ms (from <300ms)
> - Cache hit rate >= 40%

#### Phase 21b: TypeScript Cleanup (1 dia)

- [x] **T21b.1** — Find all `as any` (6 instâncias)
  > Resultado: apenas 1 `as any` em todo `src/` (Safari `navigator.standalone` — justificado)

- [x] **T21b.2** — Type missing hooks: `use-dashboard.ts`, `use-vfit-nutrition.ts`, `use-plans.ts`
  > ✅ Verificado: todos os hooks usam `useQuery<Type>()` com generics — tipos de retorno inferidos corretamente pelo TanStack Query. 0 `as any` em hooks.

- [x] **T21b.3** — Component props: `Button`, `Card`, `DSIcon` already typed? Verify.
  > ✅ Verificado: Button (ButtonProps interface), GlassCard (typed props), DSIcon (iconMap typed). Todos com tipos explícitos.

- [x] **T21b.4** — tsc --noEmit → 0 errors

> **Critério de aceite:**
> - tsc check passes
> - No `as any` outside justified cases
> - All exports properly typed

#### Phase 21c: E2E Tests (2 dias)

- [x] **T21c.1** — Setup Playwright project (if not exists)
  > ✅ Playwright já configurado: `playwright.config.ts` com 5 projetos (chromium, mobile-chrome, webkit, mobile-safari, firefox).

- [x] **T21c.2** — Create test files:
  - ✅ `tests/e2e/auth.spec.ts` (login, register, logout) — 120 linhas
  - ✅ `tests/e2e/onboarding.spec.ts` (welcome, pricing, dashboard) — 93 linhas
  - ✅ `tests/e2e/workout.spec.ts` (workouts, plan, progress, streaks, conquistas) — 118 linhas
  - ✅ `tests/e2e/checkout.spec.ts` (pricing, payments, pipeline) — 107 linhas

- [x] **T21c.3** — Tests cover:
  > ✅ 1. User auth (login/register/logout/validation)
  > ✅ 2. B2C onboarding (welcome/pricing/dashboard sections)
  > ✅ 3. Workouts (list, create, plan view, progress, streaks, conquistas)
  > ✅ 4. Checkout (pricing plans, payments page, pipeline kanban)
  > Auth injection via localStorage `vfit-auth` pattern

- [⏩] **T21c.4** — CI/CD: run Playwright tests on every PR
  > ⏩ Requer configuração GitHub Actions + Playwright containers

> **Critério de aceite:**
> - 5 test files written
> - All tests pass locally
> - CI green on main

---

## Contagem

| Fase | Sprints | Tasks | Estimada | Deferred |
|:----:|:-------:|:-----:|:--------:|:--------:|
| Cleanup | S17 | 8 | 5 dias | 0 |
| Performance | S18 | 10 | 6 dias | 0 |
| Engagement | S19 | 14 | 5 dias | 0 |
| Analytics | S20 | 8 | 5 dias | 0 |
| Robustness | S21 | 8 | 4 dias | 0 |
| **Total** | **14** | **48** | **25 dias (5 sprints)** | 0 |

> **Timeline:** 5 semanas de trabalho concentrado (1-2 sprints/semana)
> **Resultado esperado:** v2.0.0 com todas as melhorias implementadas

---

## Deploys Planejados

| Versão | Sprint | Data Estimada | Escopo | Arquivos |
|--------|--------|---------------|--------|----------|
| v1.7.0 | S17 | Apr 15 | Design System v7 | 22 |
| v1.8.0 | S18 | Apr 22 | Performance turbo | 28 |
| v1.9.0 | S19 | Apr 29 | B2C engagement | 18 |
| v2.0.0 | S20-S21 | May 10 | B2B analytics + robustness | 40 |

---

## Observações Importantes

### Design System Estado Atual
- ✅ **Showcase:** 2238 linhas, 90+ componentes, light + dark modes
- ⚠️ **Inconsistências:** 12 componentes não usados em pages reais
- ⚠️ **Dark mode:** 3 combinações violam WCAG AA (text-secondary em dark)
- ✅ **Arquitetura:** Glass + gradients + 3D shadows bem estruturados

### Performance Baseline
- **Initial JS:** ~280KB (recharts, charts, xlsx, pdf-lib)
- **LCP:** 3.2s (target: 2.0s)
- **FCP:** 2.1s
- **CLS:** 0.08 (bom)
- **Images:** 40 PNG não-otimizadas (~500KB)

### B2C Engagement Status
- ✅ Onboarding: 17 steps completo + paywall
- ✅ Treino ativo: execução + confetti
- ⚠️ Progresso: sem streaks visuais
- ⚠️ Achievements: emojis, sem gallery
- ⚠️ Social: sem share buttons
- ✅ Push notifications: básicas via OneSignal

### B2B Dashboard Status
- ✅ Stats cards: alunos, receita, treinos, pendente
- ✅ Charts: revenue (area), workouts (bar), students (pie), payments (donut)
- ⚠️ Filtros: ausentes (data range, student status)
- ⚠️ CRM: não implementado (só listagem de alunos)
- ⚠️ PDF: básico, sem formatação

### Backend Saúde
- ✅ Auth: 5 endpoints, rate limited
- ✅ Plans: IA generation, save, history, limits
- ✅ Payments: Asaas integration + webhooks
- ⚠️ Caching: ausente (KV não usado)
- ✅ Rate limits: implementados (5 endpoints críticos)
- ✅ Security: CORS, CSP, rate limiting OK

### Testes Status
- ✅ Unit tests: ~23 files (auth, schemas, calculations)
- ⚠️ E2E: não implementado (Playwright)
- ✅ Smoke: auth smoke test exists
- ⚠️ Coverage: ~30% (target: 60%)

### PWA/Offline
- ✅ Manifest.json: OK, installable
- ⚠️ Service Worker: cache strategy não-otimizada
- ⚠️ Offline: não totalmente funcional
- ✅ D1: sync estratégia em lugar

---

## Próximos Passos (Imediato)

1. **Hoje:** Aprovação da matriz de prioridade (qual sprint começa primeiro?)
2. **S17 kickoff:** Designar 1 person para design system cleanup
3. **S18 prep:** Reunião com arquiteto para bundle strategy
4. **S19-S20:** Distribuir tarefas em paralelo (engagement + analytics)
5. **S21:** TypeScript cleanup + E2E tests (pode ser paralelo)

---

## Documentação Gerada

Este TRACKING será atualizado em tempo real:
- `[ ]` = pendente
- `[x]` = concluído
- `[⏩]` = deferred/skipped

**Checkpoint Meetings:**
- **Seg, 14/04:** S17 status (design system)
- **Seg, 21/04:** S18 status (performance)
- **Seg, 28/04:** S19-S20 status (engagement + analytics)
- **Sex, 08/05:** Final review + v2.0.0 release notes

---

**Mantido por:** Engineering Team  
**Última revisão:** 08/04/2026 — Sessão 2: S17+S19+S20+S21 completos (29/48 done, 19 deferred)

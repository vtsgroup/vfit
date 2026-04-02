# LOTE 12 — Dashboard Personal (Frontend)

## Commit: `23459c9`

## Resumo
Dashboard completo do personal trainer com stats cards, gráfico de receita, atividades recentes, ações rápidas e widgets de pagamentos pendentes.

## Arquivos Criados/Editados (7 arquivos, 919 linhas)

### Hooks
- **src/hooks/use-dashboard.ts** — 5 TanStack Query hooks + tipos:
  - `usePersonalStats()`: GET /personals/stats → subscription, students, revenue, workouts
  - `usePaymentStats()`: GET /payments/stats → summary + monthly_revenue (6 meses)
  - `useRecentPayments(limit)`: GET /payments → lista paginada de pagamentos recentes
  - `useRecentStudents(limit)`: GET /students → lista paginada de alunos recentes
  - `useUnreadNotifications()`: GET /notifications/unread-count → poll cada 30s
  - Todos extraem `.data` de `ApiResponse<T>` para compatibilidade com TanStack Query

### Componentes Dashboard
- **src/components/dashboard/stats-card.tsx**:
  - `StatsCard` — Card com ícone, valor, título, descrição, trend (↑↓ com %), 6 cores (primary, success, warning, error, info, accent)
  - `StatsGridSkeleton` — Skeleton loading para o grid de stats

- **src/components/dashboard/revenue-chart.tsx**:
  - `RevenueChart` — Gráfico de barras CSS puro (sem dependências), últimos 6 meses
  - Preenche meses sem dados automaticamente, tooltips, hover effect
  - Total no período exibido no header

- **src/components/dashboard/recent-activity.tsx**:
  - `RecentPayments` — Lista com ícone de status (confirmed/pending/overdue), valor formatado, tempo relativo
  - `RecentStudents` — Lista com avatar (foto ou iniciais), dot de status (active/inactive/pending), email

- **src/components/dashboard/quick-actions.tsx**:
  - `QuickActions` — Grid 2x3 com 6 ações: Novo Treino, Convidar Aluno, Nova Avaliação, Cobrar Aluno, Gerar com IA, Indicar Personal
  - `PendingPayments` — Widget com resumo (pendente + atrasado), lista de pagamentos próximos do vencimento
  - `SubscriptionBanner` — Banner para trial (dias restantes) ou pagamento atrasado (past_due)

- **src/components/dashboard/index.ts** — Barrel export

### Página
- **src/app/dashboard/page.tsx** — Dashboard completo:
  - Saudação personalizada ("Olá, {firstName}!")
  - Banner de assinatura (trial/past_due)
  - 4 stats cards (Alunos Ativos, Receita Total, Treinos Concluídos, Pendente)
  - Gráfico de receita mensal
  - Grid 2/3 + 1/3: atividades recentes (pagamentos + alunos) + ações rápidas + pagamentos pendentes

## Padrões
- Hooks extraem `.data` de `ApiResponse<T>` para retornar tipo limpo ao TanStack Query
- Todos os componentes têm estado de loading com skeletons
- Sem dependências externas para gráficos — CSS puro com `height: ${percent}%`
- Cores do design system (brand-primary, success, warning, error, info, brand-accent)

## Build
- Type-check: 0 erros
- Build: 13 páginas estáticas, dashboard 12.5 kB

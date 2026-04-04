// ============================================
// index.ts — Barrel export dos componentes do dashboard
// ============================================
//
// O que faz:
//   Re-exporta todos os componentes do módulo dashboard.
//
// Exports principais:
//   StatsCard, StatsGridSkeleton — cartões de métricas
//   RevenueChart — gráfico de receita simplificado
//   RecentPayments, RecentStudents — listagens recentes
//   QuickActions, PendingPayments, SubscriptionBanner — ações e alertas
//   InfoCard, InfoCardGrid — cards informativos
//   ActivityTimeline — timeline de atividade
//   WeeklyProgressRing, StreakRing, XpProgress — anéis de progresso
export { StatsCard, StatsGridSkeleton } from './stats-card'
export { RevenueChart } from './revenue-chart'
export { RecentPayments, RecentStudents } from './recent-activity'
export { QuickActions, PendingPayments, SubscriptionBanner } from './quick-actions'
export { InfoCard, InfoCardGrid } from './info-card'
export { ActivityTimeline } from './activity-timeline'
export { WeeklyProgressRing, StreakRing, XpProgress } from './progress-rings'
export { DashboardFilterBar, useDefaultFilters, type DashboardFilters } from './dashboard-filter-bar'
export {
  RevenueAreaChart,
  StudentsPieChart,
  WorkoutsBarChart,
  PaymentsStatusChart,
} from './charts'

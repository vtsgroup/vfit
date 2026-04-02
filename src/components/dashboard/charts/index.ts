// ============================================
// index.ts — Barrel export dos componentes de gráficos do dashboard
// ============================================
//
// O que faz:
//   Re-exporta todos os gráficos do dashboard: receita, alunos, treinos, pagamentos.
//
// Exports principais:
//   RevenueAreaChart, ChartSkeleton — gráfico de área de receita
//   StudentsPieChart — pizza de distribuição de alunos
//   WorkoutsBarChart, WeeklyWorkoutData — barras de treinos semanais
//   PaymentsStatusChart — status de pagamentos
//   WorkoutFrequencyChart, BodyEvolutionChart — progresso do aluno
export { RevenueAreaChart, ChartSkeleton } from './revenue-area-chart'
export { StudentsPieChart } from './students-pie-chart'
export { WorkoutsBarChart } from './workouts-bar-chart'
export type { WeeklyWorkoutData } from './workouts-bar-chart'
export { PaymentsStatusChart } from './payments-status-chart'
export { WorkoutFrequencyChart, BodyEvolutionChart } from './student-progress-charts'
export type { WeeklyFrequencyData, EvolutionDataPoint } from './student-progress-charts'

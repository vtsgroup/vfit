// ============================================
// use-financial-dashboard.ts — Hooks para dashboard financeiro
// ============================================
//
// O que faz:
//   Centraliza data fetching do dashboard financeiro do personal:
//   resumo mensal, gráficos históricos e pagamentos pendentes.
//
// Exports principais:
//   useFinancialSummary() → { month, total_received, by_method, top_students }
//   useFinancialCharts() → dados de gráfico dos últimos 6 meses
//   usePendingPayments() → lista de pagamentos pendentes
//
// Hooks usados: useQuery, useAuthStore
// Auth: enabled: isReady
// ============================================
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'

export interface FinancialDashboardSummary {
  month: {
    current_revenue: number
    previous_revenue: number
    growth_percent: number
    average_ticket: number
  }
  total_received: number
  by_method: Array<{ payment_method: string; amount: number; count: number }>
  top_students: Array<{ student_id: string; student_name: string; revenue: number; payments: number }>
}

export interface FinancialDashboardCharts {
  daily_30_days: Array<{ date: string; revenue: number }>
  monthly_12_months: Array<{ month: string; revenue: number }>
}

export interface FinancialDashboardPending {
  pending: Array<{
    id: string
    payer_id: string
    student_name: string
    amount: number
    due_date: string | null
    payment_method: string
    invoice_url: string | null
    is_overdue: boolean
    days_overdue: number
  }>
  totals: {
    pending_count: number
    pending_amount: number
    overdue_count: number
    overdue_amount: number
  }
}

export function useFinancialDashboard() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery<FinancialDashboardSummary>({
    queryKey: ['financial-dashboard'],
    queryFn: async () => {
      const res = await api.get<FinancialDashboardSummary>('/payments/dashboard')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

export function useFinancialDashboardChart() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery<FinancialDashboardCharts>({
    queryKey: ['financial-dashboard', 'chart'],
    queryFn: async () => {
      const res = await api.get<FinancialDashboardCharts>('/payments/dashboard/chart')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

export function useFinancialDashboardPending() {
  const isReady = useAuthStore((s) => {
    const role = s.user?.role
    const isPersonalLike = s.user?.user_type === 'personal' || role === 'admin' || role === 'super_admin'
    return s.isAuthenticated && s.isHydrated && isPersonalLike
  })

  return useQuery<FinancialDashboardPending>({
    queryKey: ['financial-dashboard', 'pending'],
    queryFn: async () => {
      const res = await api.get<FinancialDashboardPending>('/payments/dashboard/pending')
      return res.data
    },
    enabled: isReady,
    staleTime: 60_000,
  })
}

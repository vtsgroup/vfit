/**
 * src/app/dashboard/page.tsx
 *
 * Dashboard Home — Personal + Student Dashboard
 *
 * Exports: DashboardPage
 * Hooks: useRouter, useEffect, useAuthStore, usePersonalStats, usePaymentStats, useRecentPayments
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Dashboard Home — Personal + Student Dashboard
// ============================================

'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { AuthGuard } from '@/components/auth'
import { formatCurrency } from '@/lib/utils'
import {
  usePersonalStats,
  usePaymentStats,
  useRecentPayments,
  useRecentStudents,
} from '@/hooks/use-dashboard'
import { useOnboardingStatus } from '@/hooks/use-onboarding'
import {
  StatsCard,
  StatsGridSkeleton,
  RecentPayments,
  RecentStudents,
  QuickActions,
  PendingPayments,
  SubscriptionBanner,
  ActivityTimeline,
} from '@/components/dashboard'
// Student agora é redirecionado para /treinos (B2C app)

// Lazy-load heavy recharts components (~200KB)
const RevenueAreaChart = dynamic(() => import('@/components/dashboard/charts/revenue-area-chart').then(m => m.RevenueAreaChart), { ssr: false })
const StudentsPieChart = dynamic(() => import('@/components/dashboard/charts/students-pie-chart').then(m => m.StudentsPieChart), { ssr: false })
const WorkoutsBarChart = dynamic(() => import('@/components/dashboard/charts/workouts-bar-chart').then(m => m.WorkoutsBarChart), { ssr: false })
const PaymentsStatusChart = dynamic(() => import('@/components/dashboard/charts/payments-status-chart').then(m => m.PaymentsStatusChart), { ssr: false })
import { PushNotificationPrompt } from '@/components/pwa/push-notification-prompt'
import { SkeletonPage } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/ui/glass-card'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isSplashFinished = useAuthStore((s) => s.isSplashFinished)
  const { effectiveType } = useEffectiveUserView()

  // Admin é redirecionado para o painel admin (exceto quando simulando personal/student)
  useEffect(() => {
    if (isHydrated && user?.user_type === 'admin' && effectiveType === 'admin') {
      router.replace('/dashboard/admin')
    }
  }, [isHydrated, user, effectiveType, router])

  const personalStats = usePersonalStats()
  const paymentStats = usePaymentStats()
  const recentPayments = useRecentPayments(5)
  const recentStudents = useRecentStudents(5)
  const onboarding = useOnboardingStatus()

  useEffect(() => {
    if (!isHydrated || effectiveType !== 'personal') return
    if (!onboarding.data?.onboarding) return
    if (!onboarding.data.onboarding.has_completed_onboarding) {
      router.replace('/dashboard/onboarding')
    }
  }, [isHydrated, effectiveType, onboarding.data?.onboarding, router])

  // ─── Student → redirecionar para app B2C (/treinos) ───
  // PWA start_url é /dashboard, mas students devem usar o app B2C
  useEffect(() => {
    if (!isHydrated || effectiveType !== 'student') return
    router.replace('/treinos')
  }, [isHydrated, effectiveType, router])

  // Admin vê loading enquanto redireciona para /dashboard/admin (exceto simulação).
  // Durante a splash → null (a splash cobre); pós-splash → texto calmo, sem anel girando
  // (era esse anel que vazava como "loading antigo" por trás da splash).
  if (isHydrated && user?.user_type === 'admin' && effectiveType === 'admin') {
    return isSplashFinished ? (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-muted">Redirecionando para o painel admin...</p>
      </div>
    ) : null
  }

  const stats = personalStats.data
  const pStats = paymentStats.data
  const firstName = user?.full_name?.split(' ')[0] || 'Personal'

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  // Student vê loading enquanto redireciona para /treinos (mesmo tratamento: sem anel).
  if (isHydrated && effectiveType === 'student') {
    return isSplashFinished ? (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-muted">Redirecionando...</p>
      </div>
    ) : null
  }

  if (isHydrated && effectiveType === 'personal' && onboarding.isLoading) {
    return <SkeletonPage />
  }

  if (isHydrated && effectiveType === 'personal' && onboarding.data?.onboarding && !onboarding.data.onboarding.has_completed_onboarding) {
    return null
  }

  return (
    <AuthGuard requiredType="personal">
    <div className="space-y-6 stagger-children">
      {/* Subscription banner */}
      {stats?.subscription && (
        <SubscriptionBanner
          plan={stats.subscription.plan}
          status={stats.subscription.status}
          trialEndsAt={stats.subscription.trial_ends_at}
        />
      )}

      {/* Push notification prompt */}
      <PushNotificationPrompt />

      {/* Welcome header — Athletic hero card */}
      <GlassCard variant="glow" padding="lg" radius="2xl">
        {/* Athletic mesh background — deep green gradients */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_30%,rgba(16,185,129,0.12)_0%,transparent_55%),radial-gradient(ellipse_50%_40%_at_85%_70%,rgba(132,204,22,0.07)_0%,transparent_50%),radial-gradient(ellipse_40%_30%_at_50%_100%,rgba(52,211,153,0.05)_0%,transparent_40%)]" />
        </div>
        {/* Top edge specular */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/25 to-transparent" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Icon — brand glow */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_24px_rgba(16,185,129,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_rgba(16,185,129,0.35)]">
              <DSIcon name="activity" size={22} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="font-syne text-xl sm:text-2xl font-bold tracking-tight text-text-primary leading-tight">
                {greeting}, <span className="ds-text-gradient">{firstName}</span>!
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Resumo da sua atividade hoje.
              </p>
            </div>
          </div>

          {/* Quick CTA buttons */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/workouts/create">
              <Button variant="workout" size="sm">
                <DSIcon name="dumbbell" size={16} />
                <span className="hidden sm:inline">Criar Treino</span>
                <span className="sm:hidden">Treino</span>
              </Button>
            </Link>
            <Link href="/dashboard/payments/create">
              <Button variant="payment" size="sm">
                <DSIcon name="dollarSign" size={16} />
                <span className="hidden sm:inline">Nova Cobrança</span>
                <span className="sm:hidden">Cobrar</span>
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Stats cards */}
      {personalStats.isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatsCard
            title="Alunos Ativos"
            value={stats?.students.active ?? 0}
            icon="users"
            color="primary"
            tone="hero-dark"
            description={`${stats?.students.total ?? 0} total`}
          />
          <StatsCard
            title="Receita Total"
            value={formatCurrency(pStats?.summary.total_received ?? stats?.revenue.total ?? 0)}
            icon="dollarSign"
            color="success"
            tone="hero-dark"
            description={`${pStats?.summary.payment_count ?? 0} pagamentos`}
          />
          <StatsCard
            title="Treinos Concluídos"
            value={stats?.workouts_completed_by_students ?? 0}
            icon="dumbbell"
            color="info"
            tone="hero-dark"
            description="pelos alunos este mês"
          />
          <StatsCard
            title="Pendente"
            value={formatCurrency(pStats?.summary.total_pending ?? 0)}
            icon="trendingUp"
            color={pStats?.summary.total_overdue ? 'error' : 'warning'}
            tone="hero-dark"
            description={
              pStats?.summary.total_overdue
                ? `${formatCurrency(pStats.summary.total_overdue)} atrasado`
                : 'a receber'
            }
          />
        </div>
      )}

      {/* Secondary metrics — ticket médio + crescimento */}
      {!personalStats.isLoading && !paymentStats.isLoading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {/* Ticket médio */}
          <StatsCard
            title="Ticket Médio"
            value={formatCurrency(
              (pStats?.summary.payment_count ?? 0) > 0
                ? (pStats?.summary.total_received ?? 0) / (pStats?.summary.payment_count ?? 1)
                : 0
            )}
            icon="receipt"
            color="accent"
            description="por transação"
          />
          {/* Crescimento MoM */}
          {(() => {
            const monthly = pStats?.monthly_revenue ?? []
            const current = monthly[monthly.length - 1]?.revenue ?? 0
            const previous = monthly[monthly.length - 2]?.revenue ?? 0
            const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
            const isPositive = growth >= 0
            return (
              <StatsCard
                title="Crescimento"
                value={`${isPositive ? '↑' : '↓'} ${Math.abs(growth).toFixed(1)}%`}
                icon="trendingUp"
                color={isPositive ? 'success' : 'error'}
                description="versus mês anterior"
              />
            )
          })()}
          {/* Taxa de retenção (alunos ativos / total) */}
          <StatsCard
            title="Retenção"
            value={`${(stats?.students.total ?? 0) > 0
              ? Math.round(((stats?.students.active ?? 0) / (stats?.students.total ?? 1)) * 100)
              : 0}%`}
            icon="shield"
            color="info"
            description={`${stats?.students.active ?? 0} de ${stats?.students.total ?? 0} ativos`}
          />
        </div>
      )}

      {/* Section divider — gradient line with label */}
      <div className="flex items-center gap-3">
        <div className="h-px grow bg-linear-to-r from-transparent via-brand-primary/15 to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
          Análise
        </span>
        <div className="h-px grow bg-linear-to-r from-transparent via-brand-primary/15 to-transparent" />
      </div>

      {/* Charts Grid — Recharts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueAreaChart
          data={pStats?.monthly_revenue ?? []}
          loading={paymentStats.isLoading}
        />
        <WorkoutsBarChart
          data={stats?.weekly_workouts ?? []}
          loading={personalStats.isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StudentsPieChart
          byStatus={stats?.students.by_status ?? {}}
          total={stats?.students.total ?? 0}
          loading={personalStats.isLoading}
        />
        <PaymentsStatusChart
          summary={{
            total_received: pStats?.summary.total_received ?? 0,
            total_pending: pStats?.summary.total_pending ?? 0,
            total_overdue: pStats?.summary.total_overdue ?? 0,
          }}
          loading={paymentStats.isLoading}
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Section divider */}
      <div className="flex items-center gap-3">
        <div className="h-px grow bg-linear-to-r from-transparent via-white/6 to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
          Atividade
        </span>
        <div className="h-px grow bg-linear-to-r from-transparent via-white/6 to-transparent" />
      </div>

      {/* Grid: Recent Activity + Timeline + Pending */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Col 1: Timeline */}
        <div className="space-y-4">
          <ActivityTimeline
            payments={recentPayments.data?.payments ?? []}
            students={recentStudents.data?.students ?? []}
            loading={recentPayments.isLoading || recentStudents.isLoading}
            limit={8}
          />
        </div>

        {/* Col 2: Recent activity lists */}
        <div className="space-y-4">
          <RecentPayments
            payments={recentPayments.data?.payments ?? []}
            loading={recentPayments.isLoading}
          />
          <RecentStudents
            students={recentStudents.data?.students ?? []}
            loading={recentStudents.isLoading}
          />
        </div>

        {/* Col 3: Pending */}
        <div className="space-y-4">
          <PendingPayments
            payments={recentPayments.data?.payments ?? []}
            totalPending={pStats?.summary.total_pending ?? 0}
            totalOverdue={pStats?.summary.total_overdue ?? 0}
            loading={paymentStats.isLoading}
          />
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}


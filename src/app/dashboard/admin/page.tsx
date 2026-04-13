/**
 * src/app/dashboard/admin/page.tsx
 *
 * Admin Dashboard — Ultra-Modern Dark Design
 *
 * Exports: AdminDashboardPage
 * Hooks: useEffect, useMemo, useState, useAuthStore, useAdminAccountNote, useAdminSimulationSession
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Admin Dashboard — Ultra-Modern Dark Design
// ============================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { EmptyStateDS } from '@/components/ui/empty-state-ds'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { AdminDashboardSkeleton } from '@/components/ui/page-skeletons'
import { useAuthStore } from '@/stores/auth-store'
import {
  useAdminAccountNote,
  useAdminSimulationSession,
  useAdminStats,
  useUpsertAdminAccountNote,
} from '@/hooks/use-admin'
import { useStoryKpis } from '@/hooks/use-assessments'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function pct(part: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0
  return Number(((part / total) * 100).toFixed(1))
}

function pctDelta(current: number, previous: number): number {
  return Number((current - previous).toFixed(1))
}

function trendTone(delta: number): string {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-red-400'
  return 'text-text-muted'
}

export default function AdminDashboardPage() {
  const isAD = useAuthStore((s) => s.isAdmin)
  const isSA = useAuthStore((s) => s.isSuperAdmin)
  const { data: stats, isLoading } = useAdminStats()
  const { data: storyKpis } = useStoryKpis()

  const canSimulate = isAD()
  const isSuperAdmin = isSA()
  const simulationQuery = useAdminSimulationSession()
  const simulation = simulationQuery.data?.simulation
  const upsertAccountNote = useUpsertAdminAccountNote()

  const [noteDraft, setNoteDraft] = useState('')
  const [noteRiskLevel, setNoteRiskLevel] = useState<'none' | 'attention' | 'high'>('none')
  const [noteFinancialRisk, setNoteFinancialRisk] = useState(false)

  const effectiveTargetId = useMemo(() => {
    return simulation?.mode !== 'super_admin' ? simulation?.target_user_id : null
  }, [simulation?.mode, simulation?.target_user_id])

  const accountNoteQuery = useAdminAccountNote(effectiveTargetId)

  useEffect(() => {
    const existing = accountNoteQuery.data?.note
    if (!existing) {
      setNoteDraft('')
      setNoteRiskLevel('none')
      setNoteFinancialRisk(false)
      return
    }
    setNoteDraft(existing.note || '')
    setNoteRiskLevel(existing.risk_level || 'none')
    setNoteFinancialRisk(existing.is_financial_risk === true)
  }, [accountNoteQuery.data?.note?.id, accountNoteQuery.data?.note?.note, accountNoteQuery.data?.note?.risk_level, accountNoteQuery.data?.note?.is_financial_risk])



  if (isLoading) {
    return (
      <AuthGuard requiredType="admin">
        <AdminDashboardSkeleton />
      </AuthGuard>
    )
  }

  const o = stats?.overview
  const p = stats?.payments
  const current7 = storyKpis?.last_7_days
  const previous7 = storyKpis?.previous_7_days
  const completionDelta = pctDelta(current7?.completion_rate ?? 0, previous7?.completion_rate ?? 0)
  const shareDelta = pctDelta(current7?.share_rate ?? 0, previous7?.share_rate ?? 0)
  const ctaDelta = pctDelta(current7?.cta_rate ?? 0, previous7?.cta_rate ?? 0)

  const totalCharges = (p?.total_confirmed ?? 0) + (p?.total_pending ?? 0)
  const conversionPaidRate = pct(p?.total_confirmed ?? 0, totalCharges)
  const overdueAmount = stats?.asaas_statistics?.income?.overdue ?? 0
  const receivedAmount = stats?.asaas_statistics?.income?.received ?? stats?.asaas_statistics?.income?.confirmed ?? 0
  const overdueRate = pct(overdueAmount, receivedAmount + overdueAmount)
  const feeCaptureRate = pct(p?.platform_fees ?? 0, p?.total_revenue ?? 0)

  const monetizationDecision = (() => {
    if (conversionPaidRate < 55) {
      return {
        title: 'Ação imediata: destravar conversão de cobrança',
        note: 'Conversão paga abaixo de 55%; revisar checkout e follow-up de pendentes.',
        tone: 'text-red-400',
      }
    }

    if (overdueRate >= 20) {
      return {
        title: 'Ação imediata: reduzir inadimplência',
        note: 'Inadimplência acima de 20%; priorizar régua de cobrança e lembretes.',
        tone: 'text-amber-400',
      }
    }

    if (feeCaptureRate < 2) {
      return {
        title: 'Ajustar captura de taxa da plataforma',
        note: 'Fee capture baixo; revisar regras comerciais e composição de receita.',
        tone: 'text-amber-400',
      }
    }

    return {
      title: 'Monetização estável',
      note: 'Conversão e inadimplência em faixa saudável no ciclo atual.',
      tone: 'text-emerald-400',
    }
  })()

  const retentionDecision = (() => {
    if (completionDelta <= -10) {
      return {
        title: 'Ação imediata: investigar fricção do fluxo',
        note: 'Completion caiu mais de 10 p.p. vs 7 dias anteriores.',
        tone: 'text-red-400',
      }
    }

    if (ctaDelta >= 15) {
      return {
        title: 'Sinal positivo: manter variante atual',
        note: 'CTA rate subiu 15 p.p. ou mais vs 7 dias anteriores.',
        tone: 'text-emerald-400',
      }
    }

    if (shareDelta > 0 && ctaDelta <= 0) {
      return {
        title: 'Ajustar fechamento de CTA',
        note: 'Share subiu, mas CTA não acompanhou; revisar copy e contexto final.',
        tone: 'text-amber-400',
      }
    }

    return {
      title: 'Operação estável',
      note: 'Manter monitoramento e buscar ganho incremental em completion/CTA.',
      tone: 'text-text-primary',
    }
  })()

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-6 stagger-children">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20">
              <DSIcon name="crown" size={24} className="text-brand-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Painel Admin</h1>
              <p className="text-sm text-text-muted">Visão geral da plataforma</p>
            </div>
          </div>
          <div className={cn(
            'hidden sm:flex items-center gap-2 rounded-xl border px-3 py-1.5',
            'border-brand-primary/20 bg-brand-primary/5'
          )}>
            <DSIcon name="crown" size={16} className="text-brand-primary" />
            <span className="text-xs font-semibold text-brand-primary">Admin</span>
          </div>
        </div>

        {/* ─── Admin notes for simulated user (pills live in sidebar only) ─── */}
        {canSimulate && effectiveTargetId && (
          <details className="rounded-xl border border-border-light bg-bg-secondary overflow-hidden">
            <summary className="px-4 py-2.5 text-sm font-medium text-text-primary cursor-pointer hover:bg-bg-tertiary transition-colors flex items-center gap-2">
              <DSIcon name="fileText" size={14} className="text-text-muted" />
              Notas privadas
              {simulation?.target_email && (
                <span className="ml-auto text-xs text-text-muted">→ {simulation.target_email}</span>
              )}
            </summary>
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border-light">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder="Registre observações operacionais..."
                className="w-full rounded-lg border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                <StyledSelect
                  value={noteRiskLevel}
                  onChange={(v) => setNoteRiskLevel(v as 'none' | 'attention' | 'high')}
                  options={[
                    { value: 'none', label: 'Risco: nenhum' },
                    { value: 'attention', label: 'Risco: atenção' },
                    { value: 'high', label: 'Risco: alto' },
                  ]}
                />
                <label className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    checked={noteFinancialRisk}
                    onChange={(e) => setNoteFinancialRisk(e.target.checked)}
                  />
                  Risco financeiro
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!effectiveTargetId || !noteDraft.trim()) return
                    await upsertAccountNote.mutateAsync({
                      userId: effectiveTargetId,
                      note: noteDraft,
                      risk_level: noteRiskLevel,
                      is_financial_risk: noteFinancialRisk,
                    })
                    await accountNoteQuery.refetch()
                  }}
                  loading={upsertAccountNote.isPending}
                  disabled={!noteDraft.trim()}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </details>
        )}

        {/* Overview Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard icon="users" label="Total Usuários" value={String(o?.total_users ?? 0)} accent="from-brand-primary to-emerald-600" />
          <MetricCard icon="userCheck" label="Personals" value={String(o?.total_personals ?? 0)} accent="from-brand-primary to-brand-accent" />
          <MetricCard icon="users" label="Alunos" value={String(o?.total_students ?? 0)} accent="from-emerald-500 to-emerald-500" />
          <MetricCard icon="refresh" label="Assinaturas" value={String(o?.active_subscriptions ?? 0)} accent="from-amber-500 to-orange-500" />
          <MetricCard icon="calendar" label="Novos (30d)" value={String(o?.new_signups_30d ?? 0)} accent="from-violet-500 to-purple-500" />
        </div>

        {/* Financial Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FinanceCard icon="wallet" label="Saldo Asaas" value={stats?.asaas_balance != null ? fmt(stats.asaas_balance) : '—'} trend="Disponível para saque" positive />
          <FinanceCard icon="dollar" label="Receita Confirmada" value={stats?.asaas_statistics?.income?.confirmed != null ? fmt(stats.asaas_statistics.income.confirmed) : fmt(p?.total_revenue ?? 0)} trend="Asaas real-time" positive />
          <FinanceCard icon="creditCard" label="Taxas Plataforma" value={fmt(p?.platform_fees ?? 0)} trend={`${p?.total_confirmed ?? 0} confirmados`} positive />
          <FinanceCard icon="trendingUp" label="Receita Estimada" value={stats?.asaas_statistics?.income?.estimated != null ? fmt(stats.asaas_statistics.income.estimated) : '—'} trend="Pendente recebimento" />
          <FinanceCard icon="creditCard" label="Vencidas" value={stats?.asaas_statistics?.income?.overdue != null ? fmt(stats.asaas_statistics.income.overdue) : String(p?.total_pending ?? 0)} trend={`${p?.total_pending ?? 0} pendentes`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard
            title="KPI Story (7 dias)"
            icon="sparkles"
            action={<span className="text-[11px] text-text-muted">MVP v1</span>}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                <p className="text-xs text-text-muted">Story completion</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{storyKpis?.last_7_days?.completion_rate ?? 0}%</p>
                <p className="text-xs text-text-muted">{storyKpis?.last_7_days?.story_complete ?? 0} de {storyKpis?.last_7_days?.story_open ?? 0} aberturas</p>
                <p className={cn('mt-1 text-xs font-medium', trendTone(completionDelta))}>
                  Δ 7d: {completionDelta > 0 ? '+' : ''}{completionDelta} p.p.
                </p>
              </div>
              <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                <p className="text-xs text-text-muted">Story share</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{storyKpis?.last_7_days?.share_rate ?? 0}%</p>
                <p className="text-xs text-text-muted">{storyKpis?.last_7_days?.story_share ?? 0} compartilhamentos</p>
                <p className={cn('mt-1 text-xs font-medium', trendTone(shareDelta))}>
                  Δ 7d: {shareDelta > 0 ? '+' : ''}{shareDelta} p.p.
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary p-3">
              <p className="text-xs text-text-muted">Story CTA rate (7 dias)</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{storyKpis?.last_7_days?.cta_rate ?? 0}%</p>
              <p className={cn('text-xs font-medium', trendTone(ctaDelta))}>
                Δ 7d: {ctaDelta > 0 ? '+' : ''}{ctaDelta} p.p.
              </p>
            </div>
            <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary p-3">
              <p className="text-xs text-text-muted">Hoje</p>
              <p className="mt-1 text-sm text-text-primary">
                Aberturas: <span className="font-semibold">{storyKpis?.today?.story_open ?? 0}</span> ·
                Conclusões: <span className="font-semibold">{storyKpis?.today?.story_complete ?? 0}</span> ·
                Compartilhamentos: <span className="font-semibold">{storyKpis?.today?.story_share ?? 0}</span> ·
                CTA: <span className="font-semibold">{storyKpis?.today?.story_cta_click ?? 0}</span>
              </p>
            </div>
            <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary p-3">
              <p className="text-xs text-text-muted">Decisão operacional (S12)</p>
              <p className={cn('mt-1 text-sm font-semibold', retentionDecision.tone)}>{retentionDecision.title}</p>
              <p className="mt-1 text-xs text-text-muted">{retentionDecision.note}</p>
            </div>
          </GlassCard>

          {/* Revenue by Month */}
          <GlassCard title="Receita por Mês" icon="trendingUp">
            {stats?.revenue_by_month && stats.revenue_by_month.length > 0 ? (
              <div className="space-y-2">
                {stats.revenue_by_month.map((m) => (
                  <div key={m.month} className="flex items-center justify-between rounded-xl border border-border-light bg-bg-secondary p-3 transition-colors hover:bg-bg-tertiary">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{m.month}</p>
                      <p className="text-xs text-text-muted">{m.count} pagamentos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand-primary">{fmt(m.revenue)}</p>
                      <p className="text-xs text-text-muted">Taxas: {fmt(m.fees)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateDS icon="trendingUp" title="Sem dados de receita" />
            )}
          </GlassCard>

          <GlassCard
            title="KPI Monetização (S13)"
            icon="dollar"
            action={<span className="text-[11px] text-text-muted">Funil cobrança</span>}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                <p className="text-xs text-text-muted">Conversão paga</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{conversionPaidRate}%</p>
                <p className="text-xs text-text-muted">{p?.total_confirmed ?? 0} pagos · {p?.total_pending ?? 0} pendentes</p>
              </div>
              <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                <p className="text-xs text-text-muted">Inadimplência (valor)</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{overdueRate}%</p>
                <p className="text-xs text-text-muted">Overdue: {fmt(overdueAmount)}</p>
              </div>
              <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                <p className="text-xs text-text-muted">Fee capture</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">{feeCaptureRate}%</p>
                <p className="text-xs text-text-muted">Taxas / Receita confirmada</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border-light bg-bg-secondary p-3">
              <p className="text-xs text-text-muted">Decisão operacional (S13)</p>
              <p className={cn('mt-1 text-sm font-semibold', monetizationDecision.tone)}>{monetizationDecision.title}</p>
              <p className="mt-1 text-xs text-text-muted">{monetizationDecision.note}</p>
            </div>
          </GlassCard>

          {/* Top Personals */}
          <GlassCard
            title="Top Personals"
            icon="userCheck"
            action={
              <Link href="/dashboard/admin/personals" className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-primary-hover transition-colors">
                Ver todos <DSIcon name="arrowRight" size={12} />
              </Link>
            }
          >
            {stats?.top_personals && stats.top_personals.length > 0 ? (
              <div className="space-y-2">
                {stats.top_personals.map((p, i) => (
                  <div key={p.personal_id} className="flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary p-3 transition-colors hover:bg-bg-tertiary">
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                      i === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-bg-tertiary text-text-muted'
                    )}>
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{p.full_name}</p>
                      <p className="truncate text-xs text-text-muted">{p.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-brand-primary">{fmt(p.revenue)}</p>
                      <p className="text-xs text-text-muted">{p.student_count} alunos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateDS icon="userCheck" title="Sem dados de personals" />
            )}
          </GlassCard>
        </div>

        {/* Quick Links */}
        <div className={cn('grid gap-3 sm:grid-cols-2', isSuperAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-3')}>
          <QuickLink href="/dashboard/admin/users" icon="users" label="Gerenciar Usuários" desc={isSuperAdmin ? 'Editar, bônus, deletar' : 'Visualizar contas'} />
          <QuickLink href="/dashboard/admin/personals" icon="userCheck" label="Gerenciar Personals" desc="Planos, CREF, config" />
          <QuickLink href="/dashboard/admin/payments" icon="creditCard" label="Pagamentos" desc="Criar cobrança, ver tudo" />
          {isSuperAdmin && <QuickLink href="/dashboard/payments/withdraw" icon="dollar" label="Saques PIX" desc="Transferências e saldo" />}
          {isSuperAdmin && <QuickLink href="/dashboard/admin/smoke" icon="key" label="Smoke Tokens" desc="Gerar tokens p/ smoke" />}
          {isSuperAdmin && <QuickLink href="/dashboard/admin/config" icon="settings" label="Configuração" desc="Planos, preços, taxas" />}
          {isSuperAdmin && <QuickLink href="/dashboard/admin/muscle-groups" icon="activity" label="Grupos Musculares" desc="Imagens masc/fem, cores" />}
          {isSuperAdmin && <QuickLink href="/dashboard/workouts/media/library" icon="images" label="Mídia de Exercícios" desc="R2, vídeos, thumbs" />}
        </div>
      </div>
    </AuthGuard>
  )
}

// ─── Components ────────────────────────────────────────────

function MetricCard({ icon, label, value, accent }: {
  icon: DSIconName; label: string; value: string; accent: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-bg-secondary p-4 transition-all duration-300 hover:border-brand-primary/20 hover:bg-bg-tertiary">
      {/* Subtle gradient glow */}
      <div className={cn('absolute -top-8 -right-8 h-16 w-16 rounded-full bg-linear-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40', accent)} />
      <div className="relative flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br', accent)}>
          <DSIcon name={icon} size={20} color="white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{label}</p>
          <p className="truncate text-lg font-bold text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )
}

function FinanceCard({ icon, label, value, trend, positive }: {
  icon: DSIconName; label: string; value: string; trend?: string; positive?: boolean
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-bg-secondary p-4 transition-all duration-300 hover:border-brand-primary/20 hover:bg-bg-tertiary">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
          <DSIcon name={icon} size={18} className="text-brand-primary" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'
          )}>
            {positive && <DSIcon name="arrowUpRight" size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  )
}

function GlassCard({ title, icon, action, children }: {
  title: string; icon: DSIconName; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-bg-secondary overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <div className="flex items-center gap-2">
          <DSIcon name={icon} size={18} className="text-text-muted" />
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label, desc }: {
  href: string; icon: DSIconName; label: string; desc: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border-light bg-bg-secondary p-4 transition-all duration-300 hover:border-brand-primary/30 hover:bg-bg-tertiary"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 transition-colors group-hover:bg-brand-primary/20">
        <DSIcon name={icon} size={20} className="text-brand-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors">{label}</p>
        <p className="text-xs text-text-muted">{desc}</p>
      </div>
      <DSIcon name="arrowRight" size={16} className="text-text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-brand-primary" />
    </Link>
  )
}


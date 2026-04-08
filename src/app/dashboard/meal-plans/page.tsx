/**
 * src/app/dashboard/meal-plans/page.tsx
 *
 * Meal Plans — Nutritionist's meal plan management
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth'
import { PageHeader } from '@/components/ui/page-header'
import { useAuthStore } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { cn, formatDate } from '@/lib/utils'

const STATUS_CONFIG = {
  active: { label: 'Ativo', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  draft: { label: 'Rascunho', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  expired: { label: 'Expirado', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
}

interface MealPlan {
  id: string
  title: string
  status: 'active' | 'draft' | 'expired'
  patient_name: string
  calories_target: number | null
  protein_target: number | null
  carbs_target: number | null
  fat_target: number | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

export default function MealPlansPage() {
  const router = useRouter()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const [statusFilter, setStatusFilter] = useState('active')

  const { data, isLoading } = useQuery({
    queryKey: ['nutritionist-meal-plans', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      return api.get<{ data: MealPlan[]; total: number }>(`/nutritionist/meal-plans?${params}`).then((r) => r.data)
    },
    enabled: isReady,
  })

  const plans = (data as unknown as { data: MealPlan[] })?.data || []

  return (
    <AuthGuard requiredType="nutritionist">
      <PageHeader
        title="Planos Alimentares"
        description="Crie e gerencie planos alimentares para seus pacientes"
        icon="clipboardList"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['active', 'draft', 'expired'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={() => router.push('/dashboard/meal-plans/new')}>
          <DSIcon name="plus" size={14} className="mr-1" />
          Novo Plano
        </Button>
      </div>

      {/* Plans list */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-bg-secondary shimmer" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <DSIcon name="clipboardList" size={28} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary">Nenhum plano alimentar</h3>
            <p className="mt-1 text-sm text-text-muted">Crie um plano personalizado para seus pacientes</p>
          </div>
          <Button onClick={() => router.push('/dashboard/meal-plans/new')}>
            <DSIcon name="plus" size={16} className="mr-1.5" />
            Criar Plano Alimentar
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const statusCfg = STATUS_CONFIG[plan.status] || STATUS_CONFIG.draft
            return (
              <button
                key={plan.id}
                onClick={() => router.push(`/dashboard/meal-plans/${plan.id}`)}
                className="flex flex-col rounded-xl border border-white/5 bg-bg-secondary p-4 text-left transition-colors hover:bg-bg-tertiary"
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <DSIcon name="clipboardList" size={18} className="text-emerald-400" />
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusCfg.bg, statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-1 truncate text-sm font-semibold text-text-primary">{plan.title}</h3>
                <p className="mb-3 text-xs text-text-muted">{plan.patient_name}</p>

                {/* Macros */}
                {plan.calories_target && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    <div className="rounded-lg bg-white/5 p-1.5 text-center">
                      <p className="text-xs font-bold text-text-primary">{plan.calories_target}</p>
                      <p className="text-[9px] text-text-muted">kcal</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-1.5 text-center">
                      <p className="text-xs font-bold text-brand-primary">{plan.protein_target || 0}g</p>
                      <p className="text-[9px] text-text-muted">Prot</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-1.5 text-center">
                      <p className="text-xs font-bold text-amber-400">{plan.carbs_target || 0}g</p>
                      <p className="text-[9px] text-text-muted">Carb</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-1.5 text-center">
                      <p className="text-xs font-bold text-rose-400">{plan.fat_target || 0}g</p>
                      <p className="text-[9px] text-text-muted">Gord</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="mt-auto flex items-center gap-1 text-[10px] text-text-muted">
                  <DSIcon name="calendarDays" size={10} />
                  {plan.start_date ? formatDate(plan.start_date) : 'Sem data'}
                  {plan.end_date ? ` → ${formatDate(plan.end_date)}` : ''}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </AuthGuard>
  )
}

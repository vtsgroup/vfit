/**
 * src/app/(app)/plano/page.tsx
 *
 * MEU PLANO — Tab 1 (🏠)
 * Dashboard principal do aluno com plano de treino ativo.
 * Mostra: header, day tabs, exercícios do dia, CTA "Iniciar Treino"
 */

'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useCurrentPlan, useSavePlan, useAutoGeneratePlanMutation } from '@/hooks/use-plans'
import type { PlanDay } from '@/hooks/use-plans'
import { useAuthStore } from '@/stores/auth-store'
import { useB2COnboardingCompleted } from '@/hooks/use-b2c-onboarding'

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '🫁',
  back: '🔙',
  legs: '🦵',
  shoulders: '💪',
  biceps: '💪',
  triceps: '💪',
  core: '🧘',
  glutes: '🍑',
  cardio: '❤️',
  calves: '🦶',
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia! ☀️'
  if (h < 18) return 'Boa tarde! 🌤️'
  return 'Boa noite! 🌙'
}

// ============================================
// Share Plan Button
// ============================================

function SharePlanButton({ planName, totalDays }: { planName: string; totalDays: number }) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const shareText = `💪 Confira meu plano de treino "${planName}" (${totalDays} dias) no VFIT! Junte-se a mim: https://vfit.app.br`

  const handleShare = useCallback(async (type: 'native' | 'whatsapp' | 'copy') => {
    if (type === 'native' && navigator.share) {
      try {
        await navigator.share({ title: `Plano: ${planName}`, text: shareText })
      } catch { /* user cancelled */ }
      setShowMenu(false)
      return
    }
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
      setShowMenu(false)
      return
    }
    if (type === 'copy') {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowMenu(false)
    }
  }, [planName, shareText])

  // Close on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-text-muted hover:text-text-primary transition-all"
        title="Compartilhar plano"
      >
        <DSIcon name="share2" size={18} />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <div className="absolute right-0 top-12 z-50 w-48 rounded-xl glass-card border border-white/10 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={() => handleShare('native')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
            >
              <DSIcon name="share2" size={14} className="text-brand-primary" />
              Compartilhar...
            </button>
          )}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
          >
            <DSIcon name="messageCircle" size={14} className="text-emerald-400" />
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium text-text-primary hover:bg-white/6 transition-colors"
          >
            <DSIcon name={copied ? 'check' : 'copy'} size={14} className={copied ? 'text-emerald-400' : 'text-brand-primary'} />
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function PlanoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const { data: plan, isLoading, error } = useCurrentPlan()
  const { data: onboardingStatus, isLoading: onboardingLoading } = useB2COnboardingCompleted(isReady)
  const autoGenerate = useAutoGeneratePlanMutation()
  const [activeDay, setActiveDay] = useState(1)
  const savePlan = useSavePlan()
  const hasSavedPending = useRef(false)

  const handleGeneratePlan = useCallback(async () => {
    if (onboardingLoading) return

    if (!onboardingStatus?.completed) {
      router.push('/onboarding')
      return
    }

    await autoGenerate.mutateAsync()
    queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
  }, [onboardingLoading, onboardingStatus?.completed, router, autoGenerate, queryClient])

  // ─── T6: Auto-save plan from sessionStorage (post-onboarding) ───
  // When user completes onboarding, the generated plan sits in sessionStorage.
  // As soon as they're authenticated and /plans/current returns empty, we save it.
  useEffect(() => {
    if (!isReady || isLoading || plan || hasSavedPending.current) return

    const stored = sessionStorage.getItem('vfit_plan')
    if (!stored) return

    try {
      const planData = JSON.parse(stored) as { plan: Record<string, unknown> }
      if (!planData?.plan) return

      hasSavedPending.current = true
      savePlan.mutate(
        { plan: planData.plan },
        {
          onSuccess: () => {
            sessionStorage.removeItem('vfit_plan')
            queryClient.invalidateQueries({ queryKey: ['plans', 'current'] })
          },
          onError: () => {
            // allow retry on next render
            hasSavedPending.current = false
          },
        }
      )
    } catch {
      // malformed JSON — discard
      sessionStorage.removeItem('vfit_plan')
    }
  }, [isReady, isLoading, plan, savePlan, queryClient])

  // Dia ativo
  const currentDay: PlanDay | undefined = useMemo(() => {
    if (!plan) return undefined
    return plan.days.find((d) => d.day_number === activeDay) || plan.days[0]
  }, [plan, activeDay])

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
          <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty state (no plan or error) ───
  if (!plan || error) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
          <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
        </div>
        <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/8">
            <DSIcon name="sparkles" size={28} className="text-brand-primary" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Nenhum plano ativo</h2>
          <p className="mt-2 max-w-xs text-sm text-text-secondary">
            Gere seu primeiro plano de treino personalizado com IA em menos de 2 minutos.
          </p>
          <Button
            className="mt-6"
            onClick={handleGeneratePlan}
            loading={autoGenerate.isPending || onboardingLoading}
          >
            <DSIcon name="sparkles" className="h-4 w-4" />
            Gerar Plano com IA
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-32">
      {/* ─── Header ─── */}
      <div className="px-4 pt-6">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-primary">{getGreeting()}</p>
            <h1 className="text-2xl font-black text-text-primary">Meu Plano</h1>
          </div>
          <div className="flex items-center gap-2">
            <SharePlanButton planName={plan.name} totalDays={plan.total_days} />
            <button
              type="button"
              onClick={() => router.push('/plano/ajustes')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-text-muted hover:text-text-primary transition-all"
            >
              <DSIcon name="settings" size={20} />
            </button>
          </div>
        </div>
        <p className="text-sm text-text-secondary">{plan.name}</p>
      </div>

      {/* ─── Day tabs ─── */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {plan.days.map((day) => {
          const isActive = day.day_number === activeDay
          return (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(day.day_number)}
              className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-2.5 transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              <span className="text-[10px] font-medium uppercase">Dia</span>
              <span className="text-lg font-bold">{day.day_number}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Streak counter ─── */}
      {plan.current_day > 1 && (
        <div className="mt-3 flex items-center gap-2 px-4">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1">
            <span className="text-base">🔥</span>
            <span className="text-xs font-bold text-amber-500">{plan.current_day - 1} dias seguidos</span>
          </div>
        </div>
      )}

      {/* ─── Day content ─── */}
      {currentDay && (
        <div className="mt-4 px-4">
          {/* Day header */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">{currentDay.name}</h3>
              <p className="text-xs text-text-muted">
                {currentDay.exercises.length} exercícios · ~{currentDay.estimated_duration_min || 45}min
              </p>
            </div>
            {/* Target muscles chips */}
            {currentDay.muscle_groups && currentDay.muscle_groups.length > 0 && (
              <div className="flex gap-1">
                {currentDay.muscle_groups.slice(0, 3).map((mg) => (
                  <span
                    key={mg}
                    className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary"
                  >
                    {mg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ─── Exercises list ─── */}
          <div className="space-y-2">
            {currentDay.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="glass-card flex items-center gap-3 transition-all hover:border-brand-primary/30"
              >
                {/* Index/emoji */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                  <span className="text-lg">
                    {MUSCLE_EMOJI[ex.muscle_group || ''] || `${i + 1}`}
                  </span>
                </div>

                {/* Exercise info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {ex.exercise_name || `Exercício ${i + 1}`}
                  </p>
                  <p className="text-xs text-text-muted">
                    {ex.sets}x{ex.reps}
                    {ex.weight_kg ? ` · ${ex.weight_kg}kg` : ''}
                    {ex.rest_seconds ? ` · ${ex.rest_seconds}s` : ''}
                  </p>
                </div>

                {/* Warmup / superset badge */}
                {ex.is_warmup && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                    Aquec.
                  </span>
                )}
                {ex.is_superset && (
                  <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                    Super
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Edit link */}
          <button
            type="button"
            onClick={() => router.push(`/plano/editar?day=${activeDay}`)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-text-muted hover:text-brand-primary transition-colors"
          >
            <DSIcon name="pencil" size={14} />
            Editar exercícios
          </button>
        </div>
      )}

      {/* ─── Floating CTA ─── */}
      <div className="fixed inset-x-0 bottom-20 z-30 px-4">
        <div className="mx-auto max-w-lg">
          <Button
            size="lg"
            className="w-full shadow-2xl shadow-brand-primary/30"
            onClick={() => {
              // TODO Sprint 13: navegar para treino ativo
              router.push('/treino-ativo')
            }}
          >
            <DSIcon name="play" className="h-5 w-5" />
            Iniciar Treino — Dia {activeDay}
          </Button>
        </div>
      </div>
    </div>
  )
}

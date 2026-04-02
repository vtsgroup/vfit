/**
 * src/app/(app)/plano/ajustes/page.tsx
 *
 * Tela de ajustes do plano de treino.
 * Permite editar: dias, duração, meta, nível, equipamentos.
 * Permite regenerar plano com IA.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useCurrentPlan, useUpdatePlanSettings, useRegeneratePlan } from '@/hooks/use-plans'
import type { PlanSettings } from '@/hooks/use-plans'

const GOALS = [
  { id: 'muscle_gain', label: 'Ganho muscular', emoji: '💪' },
  { id: 'lose_weight', label: 'Perda de peso', emoji: '🔥' },
  { id: 'tone', label: 'Definição', emoji: '✨' },
  { id: 'health', label: 'Saúde geral', emoji: '❤️' },
  { id: 'flexibility', label: 'Flexibilidade', emoji: '🧘' },
]

const LEVELS = [
  { id: 'beginner', label: 'Iniciante', desc: '0–6 meses' },
  { id: 'intermediate', label: 'Intermediário', desc: '6–24 meses' },
  { id: 'advanced', label: 'Avançado', desc: '2+ anos' },
]

const EQUIPMENT_OPTIONS = [
  { id: 'gym', label: 'Academia completa', emoji: '🏋️' },
  { id: 'home_basic', label: 'Halteres + barra', emoji: '🏠' },
  { id: 'home_minimal', label: 'Peso corporal', emoji: '🤸' },
  { id: 'bands', label: 'Elásticos', emoji: '🔴' },
]

export default function AjustesPlanoPage() {
  const router = useRouter()
  const { data: plan, isLoading } = useCurrentPlan()
  const updateSettings = useUpdatePlanSettings()
  const regenerate = useRegeneratePlan()

  // Local state
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [sessionDuration, setSessionDuration] = useState(45)
  const [goal, setGoal] = useState('muscle_gain')
  const [level, setLevel] = useState('beginner')
  const [equipment, setEquipment] = useState<string[]>(['gym'])
  const [showRegenConfirm, setShowRegenConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load from plan settings
  useEffect(() => {
    if (plan?.settings) {
      const s = plan.settings
      if (typeof s.days_per_week === 'number') setDaysPerWeek(s.days_per_week)
      if (typeof s.session_duration === 'number') setSessionDuration(s.session_duration)
      if (typeof s.goal === 'string') setGoal(s.goal)
      if (typeof s.level === 'string') setLevel(s.level)
      if (Array.isArray(s.equipment)) setEquipment(s.equipment as string[])
    }
  }, [plan])

  const handleSave = async () => {
    if (!plan) return
    const settings: PlanSettings = {
      days_per_week: daysPerWeek,
      session_duration: sessionDuration,
      goal,
      level,
      equipment,
    }
    await updateSettings.mutateAsync({ planId: plan.id, settings })
    setHasChanges(false)
    router.back()
  }

  const handleRegenerate = async () => {
    setShowRegenConfirm(false)
    await regenerate.mutateAsync()
    router.push('/plano')
  }

  const updateField = <T,>(setter: (v: T) => void, value: T) => {
    setter(value)
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg pb-32">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 border-b border-border-primary bg-bg-primary/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:text-text-primary transition-colors"
          >
            <DSIcon name="chevronLeft" size={22} />
          </button>
          <h1 className="text-base font-bold text-text-primary">Ajustes do Plano</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="space-y-6 px-4 pt-5">
        {/* ─── Dias por semana ─── */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Dias por semana
          </h3>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updateField(setDaysPerWeek, d)}
                className={`flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  daysPerWeek === d
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {d}x
              </button>
            ))}
          </div>
        </section>

        {/* ─── Duração da sessão ─── */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Duração da sessão
          </h3>
          <div className="flex gap-2">
            {[30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateField(setSessionDuration, m)}
                className={`flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  sessionDuration === m
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                {m}min
              </button>
            ))}
          </div>
        </section>

        {/* ─── Meta ─── */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Objetivo
          </h3>
          <div className="space-y-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => updateField(setGoal, g.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  goal === g.id
                    ? 'border-2 border-brand-primary bg-brand-primary/5'
                    : 'border border-border-primary bg-bg-secondary hover:border-brand-primary/30'
                }`}
              >
                <span className="text-xl">{g.emoji}</span>
                <span className="text-sm font-medium text-text-primary">{g.label}</span>
                {goal === g.id && (
                  <DSIcon name="check" size={16} className="ml-auto text-brand-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Nível ─── */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Nível de experiência
          </h3>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => updateField(setLevel, l.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                  level === l.id
                    ? 'border-2 border-brand-primary bg-brand-primary/5'
                    : 'border border-border-primary bg-bg-secondary hover:border-brand-primary/30'
                }`}
              >
                <span className="text-xs font-bold text-text-primary">{l.label}</span>
                <span className="text-[10px] text-text-muted">{l.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── Equipamentos ─── */}
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Equipamentos disponíveis
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => {
              const selected = equipment.includes(eq.id)
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => {
                    if (selected) {
                      if (equipment.length > 1) {
                        updateField(setEquipment, equipment.filter((e) => e !== eq.id))
                      }
                    } else {
                      updateField(setEquipment, [...equipment, eq.id])
                    }
                  }}
                  className={`flex items-center gap-2 rounded-xl p-3 transition-all ${
                    selected
                      ? 'border-2 border-brand-primary bg-brand-primary/5'
                      : 'border border-border-primary bg-bg-secondary hover:border-brand-primary/30'
                  }`}
                >
                  <span className="text-lg">{eq.emoji}</span>
                  <span className="text-xs font-medium text-text-primary">{eq.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── Regenerar plano ─── */}
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <DSIcon name="sparkles" size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-text-primary">Gerar novo plano</h3>
              <p className="mt-1 text-xs text-text-secondary">
                Criar um plano totalmente novo com IA usando as configurações atuais. O plano anterior será desativado.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowRegenConfirm(true)}
                loading={regenerate.isPending}
              >
                <DSIcon name="sparkles" className="h-3.5 w-3.5" />
                Regenerar plano
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Save floating ─── */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-20 z-30 px-4">
          <div className="mx-auto max-w-lg">
            <Button
              size="lg"
              className="w-full shadow-2xl shadow-brand-primary/30"
              onClick={handleSave}
              loading={updateSettings.isPending}
            >
              Salvar alterações
            </Button>
          </div>
        </div>
      )}

      {/* ─── Regenerate confirm modal ─── */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-bg-primary p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Gerar novo plano?</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Seu plano atual será substituído por um novo gerado pela IA. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRegenConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleRegenerate}
                loading={regenerate.isPending}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * src/app/guest/workouts/page.tsx
 *
 * Guest Workouts — Treinos de exemplo para visitantes
 *
 * Mostra treinos-modelo gerados por IA para que o visitante
 * tenha um gostinho do que o app oferece. Limitado a 3 views
 * via guest-store.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useGuestStore } from '@/stores/guest-store'
import { GuestLimitPrompt } from '@/components/guest/guest-limit-prompt'

// ─── Sample workouts ───
const SAMPLE_WORKOUTS = [
  {
    id: 'w1',
    name: 'Full Body Iniciante',
    level: 'Iniciante',
    duration: '45 min',
    focus: 'Corpo todo',
    emoji: '🏋️',
    exercises: [
      { name: 'Agachamento Livre', sets: 3, reps: '12', muscle: 'Quadríceps' },
      { name: 'Supino Reto', sets: 3, reps: '10', muscle: 'Peitoral' },
      { name: 'Remada Curvada', sets: 3, reps: '10', muscle: 'Costas' },
      { name: 'Desenvolvimento', sets: 3, reps: '10', muscle: 'Ombros' },
      { name: 'Rosca Direta', sets: 2, reps: '12', muscle: 'Bíceps' },
      { name: 'Tríceps Testa', sets: 2, reps: '12', muscle: 'Tríceps' },
    ],
  },
  {
    id: 'w2',
    name: 'Treino Push (Empurrar)',
    level: 'Intermediário',
    duration: '50 min',
    focus: 'Peito, Ombro, Tríceps',
    emoji: '💪',
    exercises: [
      { name: 'Supino Inclinado', sets: 4, reps: '8-10', muscle: 'Peitoral' },
      { name: 'Supino Reto com Halteres', sets: 3, reps: '10', muscle: 'Peitoral' },
      { name: 'Crossover', sets: 3, reps: '12', muscle: 'Peitoral' },
      { name: 'Desenvolvimento Arnold', sets: 3, reps: '10', muscle: 'Ombros' },
      { name: 'Elevação Lateral', sets: 3, reps: '15', muscle: 'Ombros' },
      { name: 'Tríceps Corda', sets: 3, reps: '12', muscle: 'Tríceps' },
      { name: 'Mergulho', sets: 3, reps: '10', muscle: 'Tríceps' },
    ],
  },
  {
    id: 'w3',
    name: 'Treino Pull (Puxar)',
    level: 'Intermediário',
    duration: '50 min',
    focus: 'Costas, Bíceps, Posterior',
    emoji: '🔙',
    exercises: [
      { name: 'Barra Fixa', sets: 4, reps: '8', muscle: 'Costas' },
      { name: 'Remada Cavaleiro', sets: 3, reps: '10', muscle: 'Costas' },
      { name: 'Pulldown', sets: 3, reps: '12', muscle: 'Costas' },
      { name: 'Face Pull', sets: 3, reps: '15', muscle: 'Posterior' },
      { name: 'Rosca Alternada', sets: 3, reps: '10', muscle: 'Bíceps' },
      { name: 'Rosca Martelo', sets: 3, reps: '12', muscle: 'Bíceps' },
    ],
  },
  {
    id: 'w4',
    name: 'Leg Day Avançado',
    level: 'Avançado',
    duration: '60 min',
    focus: 'Quadríceps, Posterior, Glúteo',
    emoji: '🦵',
    exercises: [
      { name: 'Agachamento Livre', sets: 5, reps: '5', muscle: 'Quadríceps' },
      { name: 'Leg Press 45°', sets: 4, reps: '10', muscle: 'Quadríceps' },
      { name: 'Cadeira Extensora', sets: 3, reps: '12', muscle: 'Quadríceps' },
      { name: 'Stiff', sets: 4, reps: '10', muscle: 'Posterior' },
      { name: 'Mesa Flexora', sets: 3, reps: '12', muscle: 'Posterior' },
      { name: 'Hip Thrust', sets: 4, reps: '10', muscle: 'Glúteo' },
      { name: 'Panturrilha em Pé', sets: 4, reps: '15', muscle: 'Panturrilha' },
    ],
  },
]

const LEVEL_COLORS: Record<string, string> = {
  Iniciante: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediário: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Avançado: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function GuestWorkoutsPage() {
  const router = useRouter()
  const incrementUsage = useGuestStore((s) => s.incrementUsage)
  const isLimitReached = useGuestStore((s) => s.isLimitReached)
  const getRemainingUses = useGuestStore((s) => s.getRemainingUses)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLimit, setShowLimit] = useState(false)

  const remaining = getRemainingUses('workoutViews')

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    if (isLimitReached('workoutViews')) {
      setShowLimit(true)
      return
    }

    incrementUsage('workoutViews')
    setExpandedId(id)
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.push('/guest/explore')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-zinc-400 hover:bg-white/10 transition-colors"
          >
            <DSIcon name="arrowLeft" size={18} />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-white">Treinos de Exemplo</h1>
            <p className="text-[10px] text-zinc-500">Modelos criados por IA</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-5">
        {/* Remaining uses badge */}
        {remaining > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2">
            <DSIcon name="eye" size={14} className="text-amber-400" />
            <span className="text-[11px] text-amber-300">
              {remaining} {remaining === 1 ? 'visualização restante' : 'visualizações restantes'} no modo visitante
            </span>
          </div>
        )}

        {/* Workout cards */}
        <div className="space-y-3">
          {SAMPLE_WORKOUTS.map((workout) => {
            const isExpanded = expandedId === workout.id
            return (
              <div
                key={workout.id}
                className="overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-300"
              >
                {/* Card header */}
                <button
                  type="button"
                  onClick={() => handleExpand(workout.id)}
                  className="flex w-full items-center gap-3.5 p-4 text-left hover:bg-white/3 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/6 text-2xl">
                    {workout.emoji}
                  </div>
                  <div className="min-w-0 grow">
                    <h3 className="text-[14px] font-bold text-white truncate">{workout.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${LEVEL_COLORS[workout.level]}`}>
                        {workout.level}
                      </span>
                      <span className="text-[11px] text-zinc-500">{workout.duration}</span>
                      <span className="text-[11px] text-zinc-600">•</span>
                      <span className="text-[11px] text-zinc-500">{workout.focus}</span>
                    </div>
                  </div>
                  <DSIcon
                    name={isExpanded ? 'chevronDown' : 'chevronRight'}
                    size={16}
                    className="shrink-0 text-zinc-600"
                  />
                </button>

                {/* Exercises list (expanded) */}
                {isExpanded && (
                  <div className="border-t border-white/6 px-4 pb-4 pt-3">
                    <div className="mb-2 flex items-center gap-1.5">
                      <DSIcon name="dumbbell" size={12} className="text-zinc-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        {workout.exercises.length} exercícios
                      </span>
                    </div>
                    <div className="space-y-2">
                      {workout.exercises.map((ex, i) => (
                        <div
                          key={`${workout.id}-${i}`}
                          className="flex items-center justify-between rounded-xl bg-white/3 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{ex.name}</p>
                            <p className="text-[10px] text-zinc-500">{ex.muscle}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[12px] font-bold text-brand-primary">
                              {ex.sets}×{ex.reps}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* IA badge */}
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-primary/5 px-2.5 py-1.5">
                      <DSIcon name="sparkles" size={12} className="text-brand-primary" />
                      <span className="text-[10px] text-brand-primary/80">
                        Treino gerado por IA — crie sua conta para personalizar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA bottom */}
        <div className="mt-8 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5 text-center">
          <h3 className="text-[15px] font-bold text-white">Quer treinos personalizados?</h3>
          <p className="mt-1 text-[12px] text-zinc-400">
            A IA cria treinos sob medida para seu objetivo, nível e equipamentos disponíveis.
          </p>
          <Button
            onClick={() => router.push('/register')}
            className="mt-4 w-full uppercase tracking-wider font-black"
          >
            CRIAR CONTA GRÁTIS
            <DSIcon name="arrowRight" size={16} />
          </Button>
        </div>
      </main>

      {/* Limit prompt */}
      {showLimit && (
        <GuestLimitPrompt
          feature="workoutViews"
          onDismiss={() => setShowLimit(false)}
        />
      )}
    </div>
  )
}

/**
 * src/app/(app)/treino-ativo/concluido/page.tsx
 *
 * Tela de conclusão do treino — Resumo + Records + XP
 * T8.8: Follow-up motivacional | T9.9: Confetti CSS
 */

'use client'

import { useEffect, useMemo, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { hapticSuccess } from '@/lib/haptics'

// ─── Confetti (T9.9) ─────────────────────────
const CONFETTI_COLORS = ['#22C55E', '#4ADE80', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444']

const ConfettiPiece = memo(function ConfettiPiece({
  color, left, delay, duration, size,
}: { color: string; left: string; delay: string; duration: string; size: number }) {
  return (
    <div
      className="absolute top-0 rounded-sm opacity-0"
      style={{
        left, width: size, height: size * 1.4, backgroundColor: color,
        animationName: 'confettiFall', animationDuration: duration,
        animationDelay: delay, animationTimingFunction: 'linear',
        animationFillMode: 'forwards',
      }}
    />
  )
})

function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo(() =>
    Array.from({ length: 72 }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${(i / 72) * 100 + Math.sin(i * 0.9) * 1.5}%`,
      delay: `${(i % 14) * 0.07}s`,
      duration: `${1.5 + (i % 9) * 0.14}s`,
      size: 6 + (i % 4) * 2,
    }))
  , [])

  if (!show) return null

  return (
    <>
      <style>{`@keyframes confettiFall {
        0%   { transform: translateY(-8px) rotate(0deg); opacity: 1; }
        80%  { opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }`}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
      </div>
    </>
  )
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export default function TreinoConcluido() {
  const router = useRouter()
  const workout = useActiveWorkoutStore((s) => s.workout)
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout)
  const [records] = useState<Array<{ exercise_name: string; weight_kg: number }>>([])
  const [showConfetti, setShowConfetti] = useState(true)

  // Haptic + confetti on mount
  useEffect(() => {
    hapticSuccess()
    const t = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(t)
  }, [])

  const summary = useMemo(() => {
    if (!workout) return null

    const startTime = new Date(workout.started_at).getTime()
    const durationSeconds = Math.floor((Date.now() - startTime - workout.total_pause_ms) / 1000)

    let totalSets = 0
    let totalReps = 0
    let totalVolume = 0
    let exercisesCompleted = 0

    for (const ex of workout.exercises) {
      if (ex.skipped) continue
      const completedSets = ex.sets.filter((s) => s.completed)
      if (completedSets.length > 0) exercisesCompleted++
      totalSets += completedSets.length
      totalReps += completedSets.reduce((sum, s) => sum + s.reps, 0)
      totalVolume += completedSets.reduce((sum, s) => sum + s.reps * s.weight_kg, 0)
    }

    const estimatedCalories = Math.round(totalSets * 5 + (durationSeconds / 60) * 3)

    return {
      duration_seconds: durationSeconds,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume_kg: Math.round(totalVolume),
      estimated_calories: estimatedCalories,
      exercises_completed: exercisesCompleted,
      exercises_skipped: workout.exercises.filter((e) => e.skipped).length,
    }
  }, [workout])

  if (!workout || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={() => router.push('/plano')}>Voltar ao plano</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300 px-4 pb-32 pt-8">
      {/* Confetti (T9.9) */}
      <Confetti show={showConfetti} />

      {/* ─── Trophy ─── */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/8">
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">Treino Concluído!</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workout.day_name} — Dia {workout.day_number}
        </p>
      </div>

      {/* ─── Stats grid ─── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard emoji="⏱️" label="Duração" value={formatDuration(summary.duration_seconds)} />
        <StatCard emoji="🔄" label="Sets" value={`${summary.total_sets}`} />
        <StatCard emoji="💪" label="Volume" value={`${summary.total_volume_kg}kg`} />
        <StatCard emoji="🔥" label="Calorias" value={`~${summary.estimated_calories}`} />
        <StatCard emoji="✅" label="Exercícios" value={`${summary.exercises_completed}`} />
        <StatCard emoji="⏭️" label="Pulados" value={`${summary.exercises_skipped}`} />
      </div>

      {/* ─── Personal Records ─── */}
      {records.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            🏆 Novos Records
          </h3>
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.exercise_name}
                className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
              >
                <span className="text-lg">🏅</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{r.exercise_name}</p>
                  <p className="text-xs text-amber-500 font-semibold">{r.weight_kg}kg — Novo recorde!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Follow-up card (T8.8) ─── */}
      <div className="mt-6 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
            <DSIcon name="zap" size={18} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Continue a sequência! 🔥</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
              Descanse bem, hidrate-se e volte amanhã mais forte.
              A consistência é o maior superpoder de quem treina.
            </p>
          </div>
        </div>
      </div>

      {/* ─── CTA ─── */}
      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            cancelWorkout() // Clear session
            router.push('/plano')
          }}
        >
          <DSIcon name="home" className="h-5 w-5" />
          Voltar ao Plano
        </Button>
      </div>
    </div>
  )
}

const StatCard = memo(function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border-primary bg-bg-secondary p-4 text-center">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-black text-text-primary">{value}</span>
      <span className="text-[10px] font-medium text-text-muted">{label}</span>
    </div>
  )
})

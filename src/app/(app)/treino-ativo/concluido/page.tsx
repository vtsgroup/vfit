/**
 * src/app/(app)/treino-ativo/concluido/page.tsx
 *
 * Tela de conclusão do treino — Resumo + Records + XP + Streak
 * T8.8: Follow-up motivacional | T9.9: Confetti CSS
 * Phase 1 — S1.5: Enhanced celebration loop with XP + streak display
 */

'use client'

import { useEffect, useMemo, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { hapticSuccess } from '@/lib/haptics'
import { useStreak, useXPBalance } from '@/hooks/use-xp'
import { useQueryClient } from '@tanstack/react-query'

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

function getMotivationalMessage(streak: number, volumeKg: number, durationMin: number): { title: string; sub: string } {
  if (streak >= 30) return { title: 'Lendário! 30 dias! 🔥', sub: 'Você é uma máquina. Ninguém te para.' }
  if (streak >= 14) return { title: '2 semanas seguidas! 💪', sub: 'Sua consistência é inspiradora. Continue.' }
  if (streak >= 7) return { title: '1 semana de streak! 🏆', sub: 'Uma semana completa — o hábito está se formando.' }
  if (streak >= 3) return { title: `${streak} dias seguidos! 🔥`, sub: 'Sua disciplina está crescendo. Não pare agora.' }
  if (volumeKg >= 5000) return { title: '5 toneladas! Impressionante! 💪', sub: `${(volumeKg / 1000).toFixed(1)} toneladas de volume — incrível.` }
  if (durationMin >= 75) return { title: 'Treino completo! Força de vontade! ⚡', sub: `${durationMin} minutos de foco. Isso é comprometimento.` }
  return { title: 'Treino Concluído! Parabéns! 🏆', sub: 'Descanse bem, hidrate-se e volte amanhã mais forte.' }
}

function estimateXP(totalSets: number, totalVolume: number, streak: number): number {
  const base = 50
  const setsBonus = Math.min(totalSets * 2, 30)
  const volumeBonus = totalVolume >= 1000 ? 20 : totalVolume >= 500 ? 10 : 0
  const streakBonus = streak >= 7 ? 25 : streak >= 3 ? 10 : 0
  return base + setsBonus + volumeBonus + streakBonus
}

export default function TreinoConcluido() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const workout = useActiveWorkoutStore((s) => s.workout)
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout)
  const [records] = useState<Array<{ exercise_name: string; weight_kg: number }>>([])
  const [showConfetti, setShowConfetti] = useState(true)
  const [statsVisible, setStatsVisible] = useState(false)

  // Fetch streak + XP (refetch after workout completes)
  const { data: streakData } = useStreak()
  const { data: xpData } = useXPBalance()

  // Haptic + confetti on mount, invalidate XP/streak cache
  useEffect(() => {
    hapticSuccess()
    const t = setTimeout(() => setShowConfetti(false), 3500)
    const s = setTimeout(() => setStatsVisible(true), 200)
    // Invalidate XP and streak so they refetch with latest values
    void queryClient.invalidateQueries({ queryKey: ['xp'] })
    return () => { clearTimeout(t); clearTimeout(s) }
  }, [queryClient])

  const summary = useMemo(() => {
    if (!workout) return null

    const startTime = new Date(workout.started_at).getTime()
    const durationSeconds = Math.floor((Date.now() - startTime - workout.total_pause_ms) / 1000)
    const durationMin = Math.round(durationSeconds / 60)

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
    const volumeKg = Math.round(totalVolume)
    const currentStreak = streakData?.current_streak ?? 0
    const xpEarned = estimateXP(totalSets, volumeKg, currentStreak)

    return {
      duration_seconds: durationSeconds,
      duration_min: durationMin,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume_kg: volumeKg,
      estimated_calories: estimatedCalories,
      exercises_completed: exercisesCompleted,
      exercises_skipped: workout.exercises.filter((e) => e.skipped).length,
      xp_earned: xpEarned,
    }
  }, [workout, streakData])

  const currentStreak = streakData?.current_streak ?? 0
  const motivation = summary
    ? getMotivationalMessage(currentStreak, summary.total_volume_kg, summary.duration_min)
    : { title: 'Treino Concluído! 🏆', sub: '' }

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
        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(74,222,128,0.12) 100%)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-2xl font-black text-text-primary">{motivation.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {workout.day_name} — Dia {workout.day_number}
        </p>
      </div>

      {/* ─── XP + Streak hero row ─── */}
      <div
        className={`mb-5 grid grid-cols-2 gap-3 transition-all duration-500 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {/* XP Earned */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.05) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <span className="text-xl">⚡</span>
          <span className="mt-1.5 text-2xl font-black text-brand-primary">+{summary.xp_earned}</span>
          <span className="text-[10px] font-semibold text-text-muted">XP GANHOS</span>
          {xpData && (
            <span className="mt-1 text-[10px] text-text-muted">Total: {(xpData.balance + summary.xp_earned).toLocaleString('pt-BR')} XP</span>
          )}
        </div>

        {/* Streak */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <span className="text-xl">🔥</span>
          <span className="mt-1.5 text-2xl font-black text-amber-400">{currentStreak}</span>
          <span className="text-[10px] font-semibold text-text-muted">DIAS SEGUIDOS</span>
          {streakData?.next_milestone && (
            <span className="mt-1 text-[10px] text-text-muted">
              Próx: {streakData.next_milestone}d ({streakData.progress_to_next}%)
            </span>
          )}
        </div>
      </div>

      {/* ─── Stats grid ─── */}
      <div
        className={`grid grid-cols-2 gap-3 transition-all duration-500 delay-100 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <StatCard emoji="⏱️" label="Duração" value={formatDuration(summary.duration_seconds)} />
        <StatCard emoji="🔄" label="Sets" value={`${summary.total_sets}`} />
        <StatCard emoji="💪" label="Volume" value={summary.total_volume_kg > 0 ? `${summary.total_volume_kg}kg` : `${summary.total_reps} reps`} />
        <StatCard emoji="🔥" label="Calorias" value={`~${summary.estimated_calories}`} />
      </div>

      {/* ─── Personal Records ─── */}
      {records.length > 0 && (
        <div className="mt-5">
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
                  <p className="text-xs font-semibold text-amber-500">{r.weight_kg}kg — Novo recorde!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Motivational message ─── */}
      <div
        className={`mt-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 transition-all duration-500 delay-200 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
            <DSIcon name="zap" size={18} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Continue a sequência! 🔥</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
              {motivation.sub}
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
        <button
          type="button"
          onClick={() => {
            cancelWorkout()
            router.push('/progresso')
          }}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          Ver meu progresso
        </button>
      </div>
    </div>
  )
}

const StatCard = memo(function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-black text-text-primary">{value}</span>
      <span className="text-[10px] font-medium text-text-muted">{label}</span>
    </div>
  )
})

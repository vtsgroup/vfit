'use client'

/**
 * src/app/(app)/treino-ativo/concluido/page.tsx
 * v3.4.4 — Premium emoji-free redesign
 */

import { useEffect, useMemo, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useActiveWorkoutStore } from '@/stores/active-workout-store'
import { hapticSuccess } from '@/lib/haptics'
import { useStreak, useXPBalance } from '@/hooks/use-xp'
import { useQueryClient } from '@tanstack/react-query'

const CONFETTI_COLORS = ['#22C55E', '#4ADE80', '#86EFAC', '#F59E0B', '#FBBF24', '#FFFFFF']

const ConfettiPiece = memo(function ConfettiPiece({
  color, left, delay, duration, size,
}: { color: string; left: string; delay: string; duration: string; size: number }) {
  return (
    <div
      className="absolute top-0 rounded-[1px] opacity-0"
      style={{
        left, width: size, height: size * 1.6, backgroundColor: color,
        animationName: 'confettiFall', animationDuration: duration,
        animationDelay: delay, animationTimingFunction: 'cubic-bezier(0.4,0,0.6,1)',
        animationFillMode: 'forwards',
        boxShadow: `0 0 ${size}px ${color}33`,
      }}
    />
  )
})

function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo(() =>
    Array.from({ length: 64 }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${(i / 64) * 100 + Math.sin(i * 0.9) * 1.5}%`,
      delay: `${(i % 12) * 0.06}s`,
      duration: `${1.8 + (i % 9) * 0.16}s`,
      size: 4 + (i % 4) * 2,
    }))
  , [])

  if (!show) return null

  return (
    <>
      <style>{`@keyframes confettiFall {
        0%   { transform: translateY(-12px) rotate(0deg); opacity: 1; }
        85%  { opacity: 1; }
        100% { transform: translateY(110vh) rotate(900deg); opacity: 0; }
      }
      @keyframes haloPulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50%      { transform: scale(1.08); opacity: 0.95; }
      }
      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes counterUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmerSweep {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @media (prefers-reduced-motion: reduce) {
        [data-anim] { animation: none !important; }
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
  if (streak >= 30) return { title: 'Lendário. 30 dias seguidos.', sub: 'Você é uma máquina. Ninguém te para agora.' }
  if (streak >= 14) return { title: 'Duas semanas consecutivas.', sub: 'Sua consistência é inspiradora. Continue.' }
  if (streak >= 7) return { title: 'Uma semana completa.', sub: 'O hábito está se formando. Mantenha o ritmo.' }
  if (streak >= 3) return { title: `${streak} dias em sequência.`, sub: 'Sua disciplina está crescendo. Não pare agora.' }
  if (volumeKg >= 5000) return { title: 'Cinco toneladas movidas.', sub: `${(volumeKg / 1000).toFixed(1)} toneladas de volume — performance de elite.` }
  if (durationMin >= 75) return { title: 'Treino longo concluído.', sub: `${durationMin} minutos de foco absoluto. Isso é comprometimento.` }
  return { title: 'Treino concluído.', sub: 'Descanse, hidrate-se e volte amanhã ainda mais forte.' }
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

  const { data: streakData } = useStreak()
  const { data: xpData } = useXPBalance()

  useEffect(() => {
    hapticSuccess()
    const t = setTimeout(() => setShowConfetti(false), 3500)
    const s = setTimeout(() => setStatsVisible(true), 200)
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
    : { title: 'Treino concluído.', sub: '' }

  if (!workout || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <Button onClick={() => router.push('/plano')}>Voltar ao plano</Button>
      </div>
    )
  }

  const newTotalXP = (xpData?.balance ?? 0) + summary.xp_earned

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-150 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.06) 35%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(245,158,11,0.10) 0%, transparent 60%)',
        }}
      />

      <Confetti show={showConfetti} />

      <div className="relative mx-auto max-w-lg px-4 pb-32 pt-10 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-28 w-28 items-center justify-center">
            <div
              data-anim
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(34,197,94,0.45) 0%, transparent 70%)',
                animation: 'haloPulse 2.4s ease-in-out infinite',
              }}
            />
            <div
              data-anim
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, rgba(34,197,94,0.7), rgba(34,197,94,0.05), rgba(245,158,11,0.5), rgba(34,197,94,0.7))',
                animation: 'ringRotate 8s linear infinite',
                mask: 'radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)',
                WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%, black 70%, transparent 72%)',
              }}
            />
            <div
              className="relative flex h-22 w-22 items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(34,197,94,0.32) 0%, rgba(22,101,52,0.22) 60%, rgba(5,10,18,0.85) 100%)',
                border: '1px solid rgba(74,222,128,0.4)',
                boxShadow: '0 0 40px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <DSIcon name="trophy" size={44} className="text-emerald-300" />
            </div>
          </div>

          <h1 className="text-[26px] font-black tracking-tight leading-tight text-text-primary">
            {motivation.title}
          </h1>
          <p className="mt-1.5 text-[13px] font-medium text-text-secondary">
            {workout.day_name} · Dia {workout.day_number}
          </p>
        </div>

        <div
          className={`mb-4 grid grid-cols-2 gap-3 transition-all duration-500 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div
            className="relative overflow-hidden rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(22,101,52,0.08) 100%)',
              border: '1px solid rgba(34,197,94,0.28)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px -8px rgba(34,197,94,0.25)',
            }}
          >
            <div
              data-anim
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                animation: 'shimmerSweep 3s ease-in-out infinite',
              }}
            />
            <div className="relative flex flex-col items-center">
              <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#4ADE80" />
                </svg>
              </div>
              <span
                data-anim
                className="text-[28px] font-black tabular-nums leading-none text-emerald-300"
                style={{ animation: 'counterUp 0.7s ease-out 0.3s backwards' }}
              >
                +{summary.xp_earned}
              </span>
              <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">
                XP Ganhos
              </span>
              {xpData && (
                <span className="mt-1.5 text-[10px] tabular-nums text-text-muted">
                  Total · {newTotalXP.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(180,83,9,0.08) 100%)',
              border: '1px solid rgba(245,158,11,0.28)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px -8px rgba(245,158,11,0.25)',
            }}
          >
            <div className="flex flex-col items-center">
              <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                <DSIcon name="flame" size={16} className="text-amber-300" />
              </div>
              <span
                data-anim
                className="text-[28px] font-black tabular-nums leading-none text-amber-300"
                style={{ animation: 'counterUp 0.7s ease-out 0.4s backwards' }}
              >
                {currentStreak}
              </span>
              <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                Dias seguidos
              </span>
              {streakData?.next_milestone && (
                <span className="mt-1.5 text-[10px] tabular-nums text-text-muted">
                  Meta · {streakData.next_milestone}d ({streakData.progress_to_next}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-2 gap-3 transition-all duration-500 delay-100 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <StatCard icon="clock" iconColor="text-emerald-300" label="Duração" value={formatDuration(summary.duration_seconds)} />
          <StatCard icon="activity" iconColor="text-violet-300" label="Sets" value={`${summary.total_sets}`} />
          <StatCard icon="dumbbell" iconColor="text-brand-primary" label="Volume" value={summary.total_volume_kg > 0 ? `${summary.total_volume_kg.toLocaleString('pt-BR')} kg` : `${summary.total_reps} reps`} />
          <StatCard icon="flame" iconColor="text-amber-300" label="Calorias" value={`~${summary.estimated_calories}`} />
        </div>

        {records.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
              <DSIcon name="medal" size={14} />
              Novos records
            </h3>
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.exercise_name}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                    <DSIcon name="medal" size={18} className="text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-text-primary">{r.exercise_name}</p>
                    <p className="text-[11px] font-semibold text-amber-300">{r.weight_kg} kg · novo recorde</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`mt-6 overflow-hidden rounded-2xl border border-brand-primary/22 bg-brand-primary/6 p-4 transition-all duration-500 delay-200 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/12">
              <DSIcon name="zap" size={18} className="text-brand-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-text-primary">Continue a sequência</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-text-secondary">
                {motivation.sub}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              cancelWorkout()
              router.push('/plano')
            }}
          >
            <DSIcon name="home" className="h-5 w-5" />
            Voltar ao plano
          </Button>
          <button
            type="button"
            onClick={() => {
              cancelWorkout()
              router.push('/progresso')
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            Ver meu progresso
            <DSIcon name="arrowRight" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

const StatCard = memo(function StatCard({
  icon, iconColor, label, value,
}: { icon: DSIconName; iconColor: string; label: string; value: string }) {
  return (
    <div
      className="relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl p-4 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/4">
        <DSIcon name={icon} size={16} className={iconColor} />
      </div>
      <span className="text-[18px] font-black tabular-nums leading-tight text-text-primary">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</span>
    </div>
  )
})

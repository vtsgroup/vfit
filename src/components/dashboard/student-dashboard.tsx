/**
 * src/components/dashboard/student-dashboard.tsx
 *
 * Student Dashboard — Dashboard do aluno com gráficos
 *
 * Exports: StudentDashboard
 * Hooks: useEffect, useMemo, useState, useAuthStore, useStudentProfile, useStudentWorkouts
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Student Dashboard — Dashboard do aluno com gráficos
// v3: Light/Dark mode safe + Lucide icons (no emoji)
// ============================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { StatsCard, StatsGridSkeleton } from '@/components/dashboard'
import {
  WorkoutFrequencyChart,
  BodyEvolutionChart,
} from '@/components/dashboard/charts'
import { WeeklyProgressRing, StreakRing, XpProgress } from '@/components/dashboard/progress-rings'
import { PushNotificationPrompt } from '@/components/pwa/push-notification-prompt'
import { calculateLevel } from '@/components/workouts/gamification-card'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { TrainingHeatmap } from '@/components/student/training-heatmap'
import { ExerciseProgressChart } from '@/components/student/exercise-progress-chart'
import {
  useStudentProfile,
  useStudentWorkouts,
  useStudentPayments,
  useStudentAssessments,
  useStudentEvolution,
  useStudentBadges,
  useStudentTrainingHeatmap,
  useStudentExerciseProgress,
  type StudentPaymentItem,
} from '@/hooks/use-student-app'
import { useWorkout } from '@/hooks/use-workouts'

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.full_name?.split(' ')[0] || 'Aluno'

  const profile = useStudentProfile()
  const workouts = useStudentWorkouts({ per_page: 20 })
  const payments = useStudentPayments({ per_page: 10 })
  const assessments = useStudentAssessments()
  const evolution = useStudentEvolution()
  const badges = useStudentBadges()
  const heatmap = useStudentTrainingHeatmap(new Date().getFullYear())

  const pendingPayments = (payments.data?.payments ?? []).filter((p) => p.status === 'pending')
  const activeWorkout = workouts.data?.workouts?.find((w) => w.status === 'active')
  const todayWorkout = activeWorkout || workouts.data?.workouts?.[0]
  const nextWorkouts = (workouts.data?.workouts ?? [])
    .filter((w) => w.id !== todayWorkout?.id)
    .slice(0, 3)
  const todayWorkoutDetail = useWorkout(todayWorkout?.id || '')

  const exerciseOptions = useMemo(
    () => (todayWorkoutDetail.data?.workout.exercises ?? []).map((exercise) => ({
      id: exercise.exercise_id,
      label: formatExerciseName(exercise.exercise_id),
    })),
    [todayWorkoutDetail.data?.workout.exercises]
  )

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  useEffect(() => {
    if (exerciseOptions.length === 0) {
      setSelectedExerciseId(null)
      return
    }

    if (!selectedExerciseId || !exerciseOptions.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(exerciseOptions[0].id)
    }
  }, [exerciseOptions, selectedExerciseId])

  const exerciseProgress = useStudentExerciseProgress(selectedExerciseId, 180)

  const p = profile.data
  const isLoading = profile.isLoading

  // Error handling — graceful: only show error if BOTH profile AND workouts fail
  // Super admin / admin viewing as student won't have a student profile — that's expected
  const userType = useAuthStore((s) => s.user?.user_type)
  const userRole = useAuthStore((s) => s.user?.role)
  const isAdminViewing = userRole === 'super_admin' || userRole === 'admin' || userType === 'admin'
  const hasCriticalError = !isAdminViewing && profile.isError && workouts.isError

  const handleRetryAll = () => {
    profile.refetch()
    workouts.refetch()
    payments.refetch()
    assessments.refetch()
    evolution.refetch()
    badges.refetch()
    heatmap.refetch()
  }

  // Frequência semanal (últimas 4 semanas)
  const weeklyFrequency = computeWeeklyFrequency(workouts.data?.workouts ?? [])

  // Dados de evolução corporal
  const evolutionData = (evolution.data?.assessments ?? []).map((a) => ({
    date: a.assessment_date,
    weight_kg: a.weight_kg,
    body_fat_percentage: a.body_fat_percentage,
  }))

  const latestAssessmentDate = assessments.data?.assessments?.[0]?.assessment_date
  const latestPaymentDate = payments.data?.payments?.[0]?.paid_at || payments.data?.payments?.[0]?.due_date
  const dailyQuote = getDailyMotivation()

  // Alerta de avaliação recente (últimos 3 dias)
  const recentAssessment = assessments.data?.assessments?.find((a) => {
    if (!a.notified_at) return false
    const notifiedDate = new Date(a.notified_at)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return notifiedDate > threeDaysAgo
  })

  const hasWorkouts = (workouts.data?.workouts?.length ?? 0) > 0
  const hasBadges = (badges.data?.badges?.length ?? 0) > 0

  return (
    <div className="space-y-5">
      {/* Push notification prompt */}
      <PushNotificationPrompt />

      {/* ── Error state — return early if critical data failed ── */}
      {hasCriticalError && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 py-8 px-6 text-center backdrop-blur-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <DSIcon name="wifiOff" size={28} className="text-amber-400/80" />
          </div>
          <div>
            <p className="font-bold text-text-primary">Alguns dados não carregaram</p>
            <p className="mt-1 max-w-sm text-sm text-text-secondary">
              {profile.isError
                ? 'Não foi possível carregar seu perfil de aluno. Verifique se você está vinculado a um personal.'
                : 'Não foi possível carregar seus treinos. Tente novamente.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetryAll} className="gap-2">
            <DSIcon name="refresh" size={16} />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ── 1. HERO: Motivação + Saudação + Nível + Ações Rápidas ────────────────── */}
      <StudentHeroCard
        firstName={firstName}
        profile={p}
        dailyQuote={dailyQuote}
      />

      {/* ── 2. Treino do dia ────────────────── */}
      {todayWorkout ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                <DSIcon name="dumbbell" size={14} />
                Treino de hoje
              </p>
              <h3 className="mt-1 text-xl font-bold text-text-primary">{todayWorkout.name}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {todayWorkout.exercise_count} exercício(s) • ~{Math.max(20, todayWorkout.exercise_count * 6)} min
                {todayWorkout.ai_generated ? ' • gerado por IA' : ''}
              </p>
            </div>

            <Link href={`/dashboard/workouts/execute?id=${todayWorkout.id}`}>
              <Button variant="workout" size="lg" className="gap-2">
                <DSIcon name="play" size={20} />
                Iniciar Treino
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <EmptyStateCard
          icon="dumbbell"
          title="Nenhum treino ainda"
          description="Seu personal irá criar treinos para você em breve. Fique de olho!"
        />
      )}

      {/* ── 3. ALERTAS URGENTES (pagamentos + avaliação) ────── */}
      {pendingPayments.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <DSIcon name="alertTriangle" size={16} className="text-amber-500" />
            <h3 className="font-bold text-text-primary">
              {pendingPayments.length === 1 ? 'Cobrança pendente' : `${pendingPayments.length} cobranças pendentes`}
            </h3>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map((payment) => (
              <PendingPaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
          {pendingPayments.length > 3 && (
            <Link href="/dashboard/payments" className="mt-3 block">
              <Button variant="ghost" size="sm" className="w-full text-warning">
                Ver todas as {pendingPayments.length} cobranças
                <DSIcon name="chevronRight" size={16} />
              </Button>
            </Link>
          )}
        </div>
      )}

      {recentAssessment && (
        <Link href={`/dashboard/assessments/view?id=${recentAssessment.id}`}>
          <div className="rounded-2xl border border-violet-500/20 bg-linear-to-r from-violet-500/10 via-violet-500/5 to-transparent p-4 shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                  <DSIcon name="clipboardList" size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Nova Avaliação Física Pronta!</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(recentAssessment.assessment_date).toLocaleDateString('pt-BR')}
                    {recentAssessment.protocol && ` • ${recentAssessment.protocol}`}
                    {recentAssessment.body_fat_percentage != null && ` • ${recentAssessment.body_fat_percentage}% gordura`}
                  </p>
                </div>
              </div>
              <DSIcon name="chevronRight" size={20} className="text-emerald-400" />
            </div>
          </div>
        </Link>
      )}

      {/* ── 4. Mini KPIs ────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StudentMiniKpi label="Streak" value={`${p?.current_streak ?? 0} dias`} icon={<DSIcon name="flame" size={16} className="text-orange-400" />} />
        <StudentMiniKpi label="XP total" value={`${calculateLevel(p?.total_workouts_completed ?? 0, p?.total_badges ?? 0).xp} XP`} icon={<DSIcon name="flame" size={16} className="text-violet-400" />} />
        <StudentMiniKpi
          label="Última avaliação"
          value={latestAssessmentDate ? new Date(latestAssessmentDate).toLocaleDateString('pt-BR') : 'Nenhuma'}
          icon={<DSIcon name="calendar" size={16} className="text-emerald-500 dark:text-emerald-400" />}
        />
        <StudentMiniKpi
          label="Último pagamento"
          value={latestPaymentDate ? new Date(latestPaymentDate).toLocaleDateString('pt-BR') : 'Nenhum'}
          icon={<DSIcon name="creditCard" size={16} className="text-cyan-500 dark:text-cyan-400" />}
        />
      </div>

      {/* ── 5. Stats cards ────────────────── */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatsCard
            title="Treinos Concluídos"
            value={p?.total_workouts_completed ?? 0}
            icon="dumbbell"
            color="primary"
            tone="hero-dark"
            description={`${workouts.data?.meta?.total ?? 0} treinos atribuídos`}
          />
          <StatsCard
            title="Streak Atual"
            value={`${p?.current_streak ?? 0} dias`}
            icon="flame"
            color={p?.current_streak && p.current_streak >= 7 ? 'success' : 'warning'}
            tone="hero-dark"
            description={`Recorde: ${p?.longest_streak ?? 0} dias`}
          />
          <StatsCard
            title="Conquistas"
            value={p?.total_badges ?? badges.data?.badges.length ?? 0}
            icon="trophy"
            color="accent"
            tone="hero-dark"
            description="badges conquistados"
          />
          <StatsCard
            title="Avaliações"
            value={assessments.data?.meta?.total ?? 0}
            icon="checkCircle"
            color="info"
            tone="hero-dark"
            description="avaliações físicas"
          />
        </div>
      )}

      {/* ── 5b. Visual Progress (Rings + XP) ────────────────── */}
      {!isLoading && p && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center rounded-2xl border border-border-light bg-kpi-dark p-5 backdrop-blur-sm shadow-elevation-1">
            <WeeklyProgressRing
              daysCompleted={weeklyFrequency[weeklyFrequency.length - 1]?.workouts ?? 0}
              daysGoal={p?.current_streak && p.current_streak >= 7 ? 5 : 3}
              size={130}
            />
          </div>
          <div className="flex items-center justify-center rounded-2xl border border-border-light bg-kpi-dark p-5 backdrop-blur-sm shadow-elevation-1">
            <StreakRing
              currentStreak={p?.current_streak ?? 0}
              longestStreak={p?.longest_streak ?? 0}
              size={130}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <XpProgress
              currentXp={calculateLevel(p?.total_workouts_completed ?? 0, p?.total_badges ?? 0).xp}
              nextLevelXp={calculateLevel(p?.total_workouts_completed ?? 0, p?.total_badges ?? 0).nextLevelXp}
              level={calculateLevel(p?.total_workouts_completed ?? 0, p?.total_badges ?? 0).level}
            />
          </div>
        </div>
      )}

      {/* ── 6. Charts ────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkoutFrequencyChart
          data={weeklyFrequency}
          loading={workouts.isLoading}
        />
        <BodyEvolutionChart
          data={evolutionData}
          loading={evolution.isLoading}
        />
      </div>

      {/* ── 8. Heatmap de consistência ────────────────── */}
      <TrainingHeatmap data={heatmap.data} loading={heatmap.isLoading} />

      {/* ── 9. Evolução de carga ────────────────── */}
      <div className="rounded-2xl border border-border-light bg-kpi-dark backdrop-blur-sm p-4 shadow-elevation-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <DSIcon name="trendingUp" size={16} className="text-emerald-500" />
            Exercício monitorado
          </p>
          <StyledSelect
            value={selectedExerciseId ?? ''}
            onChange={(v) => setSelectedExerciseId(v || null)}
            options={
              exerciseOptions.length === 0
                ? [{ value: '', label: 'Sem exercícios no treino atual' }]
                : exerciseOptions.map((exercise) => ({
                    value: exercise.id,
                    label: exercise.label,
                  }))
            }
            disabled={exerciseOptions.length === 0}
            className="min-w-55"
          />
        </div>
        <ExerciseProgressChart data={exerciseProgress.data} loading={exerciseProgress.isLoading} />
      </div>

      {/* ── 10. Próximos treinos ────────────────── */}
      {nextWorkouts.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-kpi-dark p-5 backdrop-blur-sm shadow-elevation-1">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <DSIcon name="clipboardList" size={16} className="text-emerald-500" />
            Próximos treinos
          </h3>
          <div className="mt-3 space-y-2">
            {nextWorkouts.map((w) => (
              <Link key={w.id} href={`/dashboard/workouts/execute?id=${w.id}`}>
                <div className="flex items-center justify-between rounded-xl border border-border-light bg-black/3 dark:bg-white/3 px-3 py-2.5 hover:bg-black/6 dark:hover:bg-white/6 transition-all duration-200">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{w.name}</p>
                    <p className="text-xs text-text-muted">{w.exercise_count} exercício(s)</p>
                  </div>
                  <DSIcon name="chevronRight" size={16} className="text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 11. Badges showcase ────────────────── */}
      {hasBadges ? (
        <div className="rounded-2xl border border-border-light bg-kpi-dark p-5 backdrop-blur-sm shadow-elevation-1">
          <h3
            className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          >
            <DSIcon name="trophy" size={14} className="text-amber-500" />
            Suas Conquistas
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {badges.data!.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border-light bg-black/3 dark:bg-white/3 p-3 text-center hover:bg-black/6 dark:hover:bg-white/6 transition-colors"
              >
                <DSIcon name="star" size={24} className="text-amber-500" />
                <span className="text-xs font-semibold text-text-primary">{badge.name}</span>
                <span className="text-[10px] text-text-muted">{badge.description}</span>
              </div>
            ))}
          </div>
        </div>
      ) : !badges.isLoading ? (
        <EmptyStateCard
          icon="trophy"
          title="Nenhuma conquista ainda"
          description="Complete treinos e desafios para desbloquear badges!"
        />
      ) : null}

      {/* ── 12. Seus Treinos (lista completa) ────── */}
      {hasWorkouts ? (
        <div className="rounded-2xl border border-border-light bg-kpi-dark p-5 backdrop-blur-sm shadow-elevation-1">
          <h3 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <DSIcon name="clipboardList" size={16} className="text-emerald-500" />
            Seus Treinos
          </h3>
          <div className="space-y-2">
            {workouts.data!.workouts.slice(0, 5).map((w) => (
              <Link
                key={w.id}
                href={w.status === 'active' ? `/dashboard/workouts/execute?id=${w.id}` : '/dashboard/workouts'}
              >
                <div className={cn(
                  'flex items-center justify-between rounded-xl border p-3 transition-all duration-200',
                  w.status === 'active'
                    ? 'border-l-4 border-l-emerald-500 border-border-light bg-emerald-500/4 hover:bg-emerald-500/8'
                    : w.status === 'completed'
                      ? 'border-l-4 border-l-violet-500 border-border-light hover:bg-black/4 dark:hover:bg-white/4'
                      : 'border-border-light hover:bg-black/4 dark:hover:bg-white/4'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      w.status === 'active' ? 'bg-emerald-500/15' : 'bg-black/4 dark:bg-white/6'
                    }`}>
                      {w.status === 'active' ? (
                        <DSIcon name="play" size={16} className="text-emerald-400" />
                      ) : w.status === 'completed' ? (
                        <DSIcon name="dumbbell" size={16} className="text-violet-400" />
                      ) : (
                        <DSIcon name="dumbbell" size={16} className="text-text-muted" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{w.name}</p>
                      <p className="text-xs text-text-muted">{w.exercise_count} exercícios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      w.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : w.status === 'completed'
                          ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                          : 'bg-black/4 dark:bg-white/6 text-text-muted'
                    }`}>
                      {w.status === 'active' ? (
                        <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo</>
                      ) : w.status === 'completed' ? (
                        <><DSIcon name="checkCircle" size={12} /> Concluído</>
                      ) : (
                        <><DSIcon name="pause" size={12} /> Inativo</>
                      )}
                    </span>
                    <DSIcon name="chevronRight" size={16} className="text-text-muted" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ============================================
// Student Hero Card — motivacional + saudação + ações rápidas
// ============================================

interface StudentProfile {
  total_workouts_completed?: number
  total_badges?: number
  current_streak?: number
}

function StudentHeroCard({
  firstName,
  profile,
  dailyQuote,
}: {
  firstName: string
  profile: StudentProfile | null | undefined
  dailyQuote: string
}) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const levelInfo = profile
    ? calculateLevel(profile.total_workouts_completed ?? 0, profile.total_badges ?? 0)
    : null

  const streak = profile?.current_streak ?? 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#050A12]">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_100%,rgba(34,197,94,0.13)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(52,211,153,0.08)_0%,transparent_50%)]" />
        {/* Top specular */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/25 to-transparent" />
        {/* Bottom specular */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/4 to-transparent" />
      </div>

      <div className="relative p-5">
        {/* ── Top row: saudação + nível ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500/70 mb-0.5"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {greeting}
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white leading-none">
              {firstName}
            </h2>
          </div>

          {/* Nível + Streak badges */}
          <div className="flex items-center gap-2 shrink-0">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-1.5">
                <DSIcon name="flame" size={13} className="text-orange-400" />
                <span className="text-xs font-bold text-orange-400">{streak}d</span>
              </div>
            )}
            {levelInfo && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1.5">
                <DSIcon name="zap" size={13} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Nv {levelInfo.level}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Frase motivacional ── */}
        <div className="mb-5 rounded-xl border border-white/6 bg-white/3 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <DSIcon name="sparkles" size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm font-medium leading-relaxed text-white/75 italic">
              &ldquo;{dailyQuote}&rdquo;
            </p>
          </div>
        </div>

        {/* ── Ações rápidas ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <QuickActionButton
            href="/dashboard/workouts"
            icon="startWorkout"
            label="Treinar agora"
            accent="emerald"
            primary
          />
          <QuickActionButton
            href="/dashboard/assessments"
            icon="assessment"
            label="Avaliações"
            accent="violet"
          />
          <QuickActionButton
            href="/dashboard/payments"
            icon="payments"
            label="Pagamentos"
            accent="cyan"
          />
        </div>
      </div>
    </div>
  )
}

// ── Quick Action Button ──────────────────────────────────────────────────────

type QuickActionIcon = 'startWorkout' | 'assessment' | 'payments'
type AccentColor = 'emerald' | 'violet' | 'cyan' | 'orange'

const QUICK_ACTION_SVGS: Record<QuickActionIcon, React.ReactNode> = {
  startWorkout: (
    // Play + lightning bolt — "comece seu treino"
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.3" />
      <path d="M8.5 7.5L15 11L8.5 14.5V7.5Z" fill="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M11.5 5L9.5 10H12.5L10.5 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  assessment: (
    // Clipboard com checkmark + ruler
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.35" />
      <path d="M8 4.5V3.5C8 3.22 8.22 3 8.5 3H13.5C13.78 3 14 3.22 14 3.5V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8.5 10.5L10.5 12.5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8.5" y1="7.5" x2="13.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  ),
  payments: (
    // Cartão + seta up — "seus pagamentos"
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.35" />
      <line x1="3" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5.5" y="12.5" width="4" height="2" rx="0.5" fill="currentColor" fillOpacity="0.6" />
      <path d="M15.5 5L15.5 1.5M15.5 1.5L13.5 3.5M15.5 1.5L17.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const ACCENT_CONFIG: Record<AccentColor, { border: string; bg: string; iconBg: string; icon: string; text: string; glow: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/8 hover:bg-emerald-500/15',
    iconBg: 'bg-emerald-500/15',
    icon: 'text-emerald-400',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_16px_rgba(34,197,94,0.18)]',
  },
  violet: {
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/6 hover:bg-violet-500/12',
    iconBg: 'bg-violet-500/15',
    icon: 'text-violet-400',
    text: 'text-violet-300',
    glow: 'shadow-[0_0_16px_rgba(139,92,246,0.12)]',
  },
  cyan: {
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/6 hover:bg-cyan-500/12',
    iconBg: 'bg-cyan-500/15',
    icon: 'text-cyan-400',
    text: 'text-cyan-300',
    glow: '',
  },
  orange: {
    border: 'border-orange-500/25',
    bg: 'bg-orange-500/6 hover:bg-orange-500/12',
    iconBg: 'bg-orange-500/15',
    icon: 'text-orange-400',
    text: 'text-orange-300',
    glow: '',
  },
}

function QuickActionButton({
  href,
  icon,
  label,
  accent,
  primary = false,
}: {
  href: string
  icon: QuickActionIcon
  label: string
  accent: AccentColor
  primary?: boolean
}) {
  const c = ACCENT_CONFIG[accent]

  return (
    <Link href={href} className="block">
      <div className={cn(
        'flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-200 active:scale-95',
        c.border,
        c.bg,
        primary && c.glow,
      )}>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', c.iconBg, c.icon)}>
          {QUICK_ACTION_SVGS[icon]}
        </div>
        <span className={cn('text-[11px] font-semibold leading-tight', c.text)}>{label}</span>
      </div>
    </Link>
  )
}

// ============================================
// Empty State Card — for new students
// ============================================

function EmptyStateCard({ icon, title, description }: { icon: DSIconName; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-light bg-kpi-dark py-10 px-6 text-center backdrop-blur-sm shadow-elevation-1">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
        <DSIcon name={icon} size={32} className="text-brand-primary" />
      </div>
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
    </div>
  )
}

// ============================================
// Pending Payment Card
// ============================================

function PendingPaymentCard({ payment }: { payment: StudentPaymentItem }) {
  const overdue = payment.due_date && new Date(payment.due_date) < new Date()

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-light bg-black/3 dark:bg-white/3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <DSIcon name="wallet" size={16} className="text-amber-500 dark:text-amber-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {payment.description && <span className="truncate">{payment.description}</span>}
          {payment.due_date && (
            <span className={overdue ? 'text-red-500 dark:text-red-400 font-medium flex items-center gap-1' : ''}>
              {overdue && <DSIcon name="alertTriangle" size={12} />}
              {overdue ? 'Venceu ' : 'Vence '}
              {new Date(payment.due_date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
      <Link href={`/dashboard/payments/checkout?id=${payment.id}`}>
        <Button size="sm" className="gap-1 text-xs whitespace-nowrap">
          <DSIcon name="creditCard" size={14} />
          Pagar
        </Button>
      </Link>
    </div>
  )
}

// ============================================
// Mini KPI
// ============================================

function StudentMiniKpi({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border-light bg-kpi-dark p-3 backdrop-blur-sm shadow-elevation-1">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/4 dark:bg-white/6">
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-text-muted">{label}</p>
          <p className="text-sm font-semibold text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Motivational Quotes (expanded to 15+)
// ============================================

function getDailyMotivation(): string {
  const quotes = [
    'Disciplina vence motivação quando a rotina aperta.',
    'Um treino de hoje vale mais que dois planejados para amanhã.',
    'Consistência diária constrói resultados duradouros.',
    'Seu corpo responde ao que você repete com frequência.',
    'Pequenos avanços diários criam grandes transformações.',
    'O segredo não é treinar quando está motivado, é treinar sempre.',
    'Cada repetição te aproxima da sua melhor versão.',
    'Quem treina com propósito transforma o corpo e a mente.',
    'Não espere por resultados rápidos — espere resultados reais.',
    'O suor de hoje é o sorriso de amanhã no espelho.',
    'Seu maior adversário é quem você era ontem.',
    'Descansar faz parte do treino, desistir não.',
    'Força não vem do que você consegue fazer, vem do que você supera.',
    'Progresso é progresso, não importa o tamanho.',
    'A dor do treino passa, o orgulho fica para sempre.',
    'Não conte os dias — faça os dias contarem.',
  ]

  const daySeed = new Date().getDate() + new Date().getMonth()
  return quotes[daySeed % quotes.length]
}

function formatExerciseName(exerciseId: string): string {
  if (!exerciseId) return exerciseId
  // Remove prefixo 'ex-' e sufixo numérico '-001'
  let name = exerciseId
    .replace(/^ex[-_]/i, '')
    .replace(/[-_](\d{2,3})$/, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
  // Capitaliza cada palavra
  name = name.replace(/\b\w/g, (c) => c.toUpperCase())
  return name || exerciseId
}

// Calcula frequência de treinos por semana (últimas 4 semanas, usando created_at como proxy)
function computeWeeklyFrequency(workouts: Array<{ created_at: string }>): Array<{ week: string; workouts: number }> {
  const now = new Date()
  const weeks = [
    { label: 'Sem 1', start: new Date(now.getTime() - 28 * 86400000), end: new Date(now.getTime() - 21 * 86400000) },
    { label: 'Sem 2', start: new Date(now.getTime() - 21 * 86400000), end: new Date(now.getTime() - 14 * 86400000) },
    { label: 'Sem 3', start: new Date(now.getTime() - 14 * 86400000), end: new Date(now.getTime() - 7 * 86400000) },
    { label: 'Sem 4', start: new Date(now.getTime() - 7 * 86400000), end: now },
  ]

  return weeks.map((w) => ({
    week: w.label,
    workouts: workouts.filter((wo) => {
      const d = new Date(wo.created_at)
      return d >= w.start && d < w.end
    }).length,
  }))
}

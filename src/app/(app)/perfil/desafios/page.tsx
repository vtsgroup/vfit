/**
 * src/app/(app)/perfil/desafios/page.tsx
 *
 * Sprint 34 — Tela de Streak & Desafios Semanais
 */

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { useStreak, useWeeklyChallenges } from '@/hooks/use-challenges'
import { cn } from '@/lib/utils'

export default function DesafiosPage() {
  const { data: streak, isLoading: loadingStreak } = useStreak()
  const { data: challenges, isLoading: loadingChallenges } = useWeeklyChallenges()

  const isLoading = loadingStreak || loadingChallenges

  return (
    <ProfileDetailShell
      title="Desafios"
      subtitle="Streak, metas semanais e recompensas para manter consistência."
      icon="target"
      tone="emerald"
      meta={<ProfilePill tone="emerald">{streak ? `${streak.current_streak} dias` : 'Rotina ativa'}</ProfilePill>}
    >
      <div className="space-y-5">
        {isLoading && (
          <ProfileCard>
            <div className="flex justify-center py-10">
              <DSIcon name="loader" className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          </ProfileCard>
        )}

        {streak && (
          <ProfileTintCard tone="emerald">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card-lg bg-slate-950 text-emerald-300">
                  <DSIcon name="flame" size={26} />
                </div>
                <div>
                  <p className="text-[34px] font-black leading-none text-slate-950">{streak.current_streak}</p>
                  <p className="text-[12px] font-bold text-slate-500">{streak.current_streak === 1 ? 'dia seguido' : 'dias seguidos'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black uppercase text-slate-500">Recorde</p>
                <p className="text-[18px] font-black text-slate-950">{streak.best_streak} dias</p>
              </div>
            </div>

            <div className={cn('mt-4 flex items-center gap-2 rounded-[18px] px-3 py-3', streak.trained_today ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900')}>
              <DSIcon name={streak.trained_today ? 'checkCircle2' : 'flame'} size={17} />
              <p className="text-[12px] font-black">
                {streak.trained_today ? 'Treino de hoje concluído' : 'Treine hoje para manter o streak'}
              </p>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-black uppercase text-slate-500">Milestones</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {streak.milestones.map((milestone) => (
                  <div
                    key={milestone.days}
                    className={cn('flex min-w-16 shrink-0 flex-col items-center rounded-[16px] border px-3 py-2', milestone.reached ? 'border-emerald-200 bg-white text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400')}
                  >
                    <DSIcon name={milestone.reached ? 'checkCircle2' : 'lock'} size={17} />
                    <p className="mt-1 text-xs font-black">{milestone.days}d</p>
                  </div>
                ))}
              </div>
            </div>

            {streak.next_milestone && (
              <p className="mt-4 text-center text-[12px] font-bold text-slate-600">
                Faltam <span className="text-slate-950">{streak.days_to_next} dias</span> para o milestone de {streak.next_milestone} dias
              </p>
            )}
          </ProfileTintCard>
        )}

        {challenges && challenges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[16px] font-black text-slate-950">Desafios da semana</h2>
              <ProfilePill tone="emerald">{challenges.length}</ProfilePill>
            </div>
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </ProfileDetailShell>
  )
}

function ChallengeCard({ challenge }: { challenge: { id: string; title: string; description: string; target: number; current: number; completed: boolean; xp_reward: number } }) {
  const percent = Math.min(100, Math.round((challenge.current / challenge.target) * 100))

  return (
    <ProfileCard className={challenge.completed ? 'border-emerald-200 bg-emerald-50' : undefined}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] ring-1', challenge.completed ? 'bg-white text-emerald-600 ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-slate-200')}>
          <DSIcon name={challenge.completed ? 'checkCircle2' : 'target'} size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[14px] font-black leading-snug text-slate-950">{challenge.title}</p>
            {challenge.completed && <DSIcon name="checkCircle2" size={18} className="shrink-0 text-emerald-600" />}
          </div>
          <p className="mt-1 text-[12px] font-medium leading-snug text-slate-500">{challenge.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className={cn('h-full rounded-full transition-all duration-500', challenge.completed ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[11px] font-black text-slate-500">{challenge.current}/{challenge.target}</span>
          </div>
          <p className="mt-2 text-[12px] font-black text-emerald-700">+{challenge.xp_reward} XP</p>
        </div>
      </div>
    </ProfileCard>
  )
}
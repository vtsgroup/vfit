/**
 * src/app/(app)/perfil/gamificacao/page.tsx
 *
 * Sprint 33 — Tela de gamificação: XP, nível, badges
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { XPBar } from '@/components/gamificacao/xp-bar'
import { BadgeGrid } from '@/components/gamificacao/badge-grid'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { useGamificationProfile, useBadges, getLevelTitle } from '@/hooks/use-gamification'

export default function GamificacaoPage() {
  const { data: profile, isLoading: loadingProfile } = useGamificationProfile()
  const { data: badges, isLoading: loadingBadges } = useBadges()

  const isLoading = loadingProfile || loadingBadges

  return (
    <ProfileDetailShell
      title="Gamificação"
      subtitle="Acompanhe XP, níveis, recordes e conquistas da sua rotina."
      icon="trophy"
      tone="amber"
      meta={<ProfilePill tone="amber">{profile ? `Nível ${profile.level}` : 'Evolução ativa'}</ProfilePill>}
    >
      <div className="space-y-5">
        {isLoading && (
          <ProfileCard>
            <div className="flex flex-col items-center gap-4 py-10">
              <DSIcon name="loader" className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-sm font-bold text-slate-500">Carregando evolução...</p>
            </div>
          </ProfileCard>
        )}

        {profile && (
          <>
            <ProfileTintCard tone="amber" className="text-center">
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl bg-slate-950 text-amber-300 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.8)]">
                <DSIcon name="crown" size={31} />
              </div>
              <h2 className="mt-4 text-[26px] font-black leading-none text-slate-950">Nível {profile.level}</h2>
              <p className="mt-1 text-[13px] font-bold text-slate-500">{getLevelTitle(profile.level)}</p>
              <p className="mt-3 text-[30px] font-black leading-none text-emerald-700">
                {profile.total_xp.toLocaleString('pt-BR')} <span className="text-[13px] text-slate-500">XP</span>
              </p>
            </ProfileTintCard>

            <ProfileCard>
              <XPBar
                level={profile.level}
                xpInLevel={profile.xp_in_level}
                xpNeeded={profile.xp_needed}
                progressPercent={profile.progress_percent}
                totalXp={profile.total_xp}
              />
            </ProfileCard>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon="dumbbell" label="Treinos" value={profile.total_workouts} />
              <StatCard icon="trophy" label="Recordes" value={profile.total_records} />
            </div>
          </>
        )}

        {badges && badges.length > 0 && (
          <ProfileCard>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-black text-slate-950">Badges</h2>
              <ProfilePill tone="amber">{badges.length}</ProfilePill>
            </div>
            <BadgeGrid badges={badges} />
          </ProfileCard>
        )}

        {!isLoading && !profile && (
          <ProfileCard>
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-card-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <DSIcon name="sparkles" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">Complete treinos para ganhar XP.</p>
            </div>
          </ProfileCard>
        )}
      </div>
    </ProfileDetailShell>
  )
}

function StatCard({ icon, label, value }: { icon: DSIconName; label: string; value: number }) {
  return (
    <ProfileCard className="p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <DSIcon name={icon} size={19} />
        </div>
        <div>
          <p className="text-xl font-black leading-none text-slate-950">{value}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </ProfileCard>
  )
}
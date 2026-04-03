/**
 * src/app/(app)/perfil/gamificacao/page.tsx
 *
 * Sprint 33 — Tela de gamificação: XP, nível, badges
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui'
import { XPBar } from '@/components/gamificacao/xp-bar'
import { BadgeGrid } from '@/components/gamificacao/badge-grid'
import {
  useGamificationProfile,
  useBadges,
  getLevelTitle,
  getLevelEmoji,
} from '@/hooks/use-gamification'

export default function GamificacaoPage() {
  const router = useRouter()
  const { data: profile, isLoading: loadingProfile } = useGamificationProfile()
  const { data: badges, isLoading: loadingBadges } = useBadges()

  const isLoading = loadingProfile || loadingBadges

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-14 z-20 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <button onClick={() => router.back()} className="p-1">
          <DSIcon name="arrowLeft" className="h-5 w-5 text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Conquistas</h1>
      </header>

      <div className="space-y-6 px-4 pt-2">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <DSIcon
              name="loader"
              className="h-6 w-6 animate-spin text-brand-primary"
            />
            <p className="text-sm text-text-secondary">Carregando...</p>
          </div>
        )}

        {/* XP & Nível */}
        {profile && (
          <>
            {/* Hero card */}
            <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/3 p-6">
              <span className="text-5xl">{getLevelEmoji(profile.level)}</span>
              <h2 className="mt-2 text-xl font-bold text-text-primary">
                Nível {profile.level}
              </h2>
              <p className="text-sm text-text-secondary">
                {getLevelTitle(profile.level)}
              </p>
              <p className="mt-1 text-2xl font-black text-brand-primary">
                {profile.total_xp.toLocaleString('pt-BR')}{' '}
                <span className="text-sm font-medium">XP</span>
              </p>
            </div>

            {/* Barra de XP */}
            <XPBar
              level={profile.level}
              xpInLevel={profile.xp_in_level}
              xpNeeded={profile.xp_needed}
              progressPercent={profile.progress_percent}
              totalXp={profile.total_xp}
            />

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon="dumbbell"
                label="Treinos"
                value={profile.total_workouts}
              />
              <StatCard
                icon="trophy"
                label="Recordes"
                value={profile.total_records}
              />
            </div>
          </>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div>
            <h2 className="mb-3 text-base font-bold text-text-primary">
              🏅 Badges
            </h2>
            <BadgeGrid badges={badges} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !profile && (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-5xl">🌱</span>
            <p className="text-sm text-text-secondary">
              Complete treinos para ganhar XP!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-secondary p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/8">
        <DSIcon
          name={icon as DSIconName}
          className="h-5 w-5 text-brand-primary"
        />
      </div>
      <div>
        <p className="text-lg font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  )
}

/**
 * src/app/(app)/progresso/conquistas/page.tsx
 *
 * CONQUISTAS — Badges de gamificação, XP, nível do aluno
 * Usa useBadges() e useGamificationProfile()
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useBadges, useGamificationProfile, getLevelTitle } from '@/hooks/use-gamification'

// ============================================
// Badge rarity tiers
// ============================================

const RARITY_MAP: Record<string, { tier: string; color: string; bg: string; glow: string }> = {
  // Streak badges (rare → epic)
  streak_7:      { tier: 'Raro',      color: 'text-blue-400',   bg: 'bg-blue-400/10',   glow: 'shadow-[0_0_12px_rgba(96,165,250,0.2)]' },
  streak_30:     { tier: 'Épico',     color: 'text-purple-400', bg: 'bg-purple-400/10',  glow: 'shadow-[0_0_12px_rgba(192,132,252,0.2)]' },
  streak_100:    { tier: 'Lendário',  color: 'text-amber-400',  bg: 'bg-amber-400/10',   glow: 'shadow-[0_0_16px_rgba(251,191,36,0.3)]' },

  // Workout milestones (common → rare)
  workouts_10:   { tier: 'Comum',     color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: '' },
  workouts_50:   { tier: 'Raro',      color: 'text-blue-400',    bg: 'bg-blue-400/10',   glow: 'shadow-[0_0_12px_rgba(96,165,250,0.2)]' },
  workouts_100:  { tier: 'Épico',     color: 'text-purple-400',  bg: 'bg-purple-400/10',  glow: 'shadow-[0_0_12px_rgba(192,132,252,0.2)]' },

  // Goals (epic)
  weight_goal:   { tier: 'Épico',     color: 'text-purple-400',  bg: 'bg-purple-400/10',  glow: 'shadow-[0_0_12px_rgba(192,132,252,0.2)]' },
  body_fat_goal: { tier: 'Lendário',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   glow: 'shadow-[0_0_16px_rgba(251,191,36,0.3)]' },

  // Social & special
  first_review:  { tier: 'Comum',     color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: '' },
  early_bird:    { tier: 'Especial',  color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]' },
}

const DEFAULT_RARITY = { tier: 'Comum', color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: '' }

// ============================================
// Component
// ============================================

export default function ConquistasPage() {
  const router = useRouter()
  const { data: badges, isLoading: loadingBadges } = useBadges()
  const { data: profile, isLoading: loadingProfile } = useGamificationProfile()

  // Badge detail popover state
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)

  const handleBadgeClick = useCallback((badgeId: string, unlocked: boolean) => {
    if (unlocked) {
      setSelectedBadge(prev => prev === badgeId ? null : badgeId)
    }
  }, [])

  const isLoading = loadingBadges || loadingProfile

  const unlockedCount = badges?.filter(b => b.unlocked).length || 0
  const totalCount = badges?.length || 0

  // Group badges: unlocked first, then locked
  const sortedBadges = [...(badges || [])].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    return 0
  })

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <DSIcon name="chevronLeft" size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-xl font-black text-text-primary leading-tight">Conquistas</h1>
          <p className="text-[12px] text-text-muted">
            {unlockedCount}/{totalCount} desbloqueadas
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <DSIcon name="loader" size={24} className="animate-spin text-brand-primary" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* XP + Level card */}
          {profile && (
            <div className="glass-card mb-5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Nível</p>
                  <p className="text-3xl font-black text-text-primary">{profile.level}</p>
                  <p className="text-[12px] font-medium text-brand-primary">{getLevelTitle(profile.level)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">XP Total</p>
                  <p className="text-2xl font-black text-text-primary">{profile.total_xp.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {/* XP Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">{profile.xp_in_level} XP</span>
                  <span className="text-[10px] text-text-muted">{profile.xp_needed} XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-primary to-emerald-400 transition-all duration-700"
                    style={{ width: `${profile.progress_percent}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-text-muted text-center">
                  {profile.xp_needed - profile.xp_in_level} XP para o próximo nível
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="award" size={18} className="mb-1 text-amber-400" />
              <p className="text-lg font-black text-text-primary">{unlockedCount}</p>
              <p className="text-[10px] text-text-muted">Conquistadas</p>
            </div>
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="dumbbell" size={18} className="mb-1 text-brand-primary" />
              <p className="text-lg font-black text-text-primary">{profile?.total_workouts || 0}</p>
              <p className="text-[10px] text-text-muted">Treinos</p>
            </div>
            <div className="glass-card flex flex-col items-center rounded-xl p-3">
              <DSIcon name="trendingUp" size={18} className="mb-1 text-purple-400" />
              <p className="text-lg font-black text-text-primary">{profile?.total_records || 0}</p>
              <p className="text-[10px] text-text-muted">Recordes</p>
            </div>
          </div>

          {/* Badges grid */}
          <div className="glass-card rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name="award" size={14} className="text-brand-primary" />
              <span className="text-[12px] font-semibold text-text-secondary">Todas as Conquistas</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sortedBadges.map((badge, index) => {
                const rarity = RARITY_MAP[badge.id] || DEFAULT_RARITY
                const isSelected = selectedBadge === badge.id

                return (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge.id, badge.unlocked)}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      badge.unlocked
                        ? `${rarity.bg} border-white/10 ${rarity.glow} hover:scale-[1.03] active:scale-[0.97] cursor-pointer`
                        : 'bg-white/2 border-white/5 opacity-50 grayscale cursor-default'
                    }`}
                    style={{
                      animationDelay: `${index * 60}ms`,
                      animation: badge.unlocked ? 'badge-appear 0.4s ease-out backwards' : undefined,
                    }}
                  >
                    {/* Rarity tag */}
                    <span className={`absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider ${
                      badge.unlocked ? rarity.color : 'text-text-muted'
                    }`}>
                      {rarity.tier}
                    </span>

                    {/* Icon with glow pulse on unlocked */}
                    <span className={`text-3xl transition-transform duration-300 ${
                      badge.unlocked && isSelected ? 'scale-125' : ''
                    }`}>
                      {badge.icon}
                    </span>

                    {/* Name */}
                    <p className={`text-[12px] font-bold text-center leading-tight ${
                      badge.unlocked ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {badge.name}
                    </p>

                    {/* Description — expanded when selected */}
                    <p className={`text-[10px] text-text-muted text-center leading-snug transition-all duration-200 ${
                      isSelected ? 'max-h-20 opacity-100' : 'max-h-8 overflow-hidden'
                    }`}>
                      {badge.description}
                    </p>

                    {/* Points */}
                    <div className="flex items-center gap-1">
                      <DSIcon name="zap" size={10} className={badge.unlocked ? 'text-amber-400' : 'text-text-muted'} />
                      <span className={`text-[10px] font-bold ${badge.unlocked ? 'text-amber-400' : 'text-text-muted'}`}>
                        {badge.points} XP
                      </span>
                    </div>

                    {/* Unlock shimmer effect */}
                    {badge.unlocked && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </div>
                    )}

                    {/* Lock overlay for locked */}
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                        <DSIcon name="lock" size={20} className="text-text-muted/50" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* CSS animation for badge appear */}
            <style jsx>{`
              @keyframes badge-appear {
                from {
                  opacity: 0;
                  transform: scale(0.8) translateY(8px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
            `}</style>
          </div>
        </>
      )}
    </div>
  )
}

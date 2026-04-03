/**
 * src/components/ui/avatar-plan-badge.tsx
 *
 * AvatarWithPlanBadge v3 — Avatar premium com borda de plano + badge + dot ativo
 *
 * Exports: AvatarWithPlanBadge
 * Hooks: useAuthStore, usePlanSimulationStore, useEffectiveUserView
 * Features: 'use client' · DS component · Pixel-perfect sizing · Filled SVG icons
 *
 * Design (Material Design 3):
 * - Borda colorida real (border, não ring) — sizing preciso, border-box
 * - Ícones SVG filled (sparkle, bolt, star, crown) — zero emojis
 * - Container sm=36px = ds3-action-btn (pixel-perfect alignment)
 * - Badge centralizado na base com ícone + label
 * - Dot verde animado (top-right)
 * - Glow sutil para planos pagos
 */

'use client'

import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { usePlanSimulationStore } from '@/stores/plan-simulation-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import Link from 'next/link'

/* ─── Badge Config per Plan ─── */
interface PlanBadgeConfig {
  label: string
  borderColorClass: string
  bgClass: string
  textClass: string
  glowClass: string
  canUpgrade: boolean
}

const BADGE_CONFIGS: Record<string, PlanBadgeConfig> = {
  trial: {
    label: 'Grátis',
    borderColorClass: 'border-zinc-300 dark:border-zinc-600',
    bgClass: 'bg-zinc-600 dark:bg-zinc-700',
    textClass: 'text-zinc-100',
    glowClass: '',
    canUpgrade: true,
  },
  pro: {
    label: 'Pro',
    borderColorClass: 'border-emerald-400 dark:border-emerald-500',
    bgClass: 'bg-emerald-600',
    textClass: 'text-white',
    glowClass: 'shadow-[0_0_6px_rgba(16,185,129,0.3)]',
    canUpgrade: true,
  },
  profissional: {
    label: 'Pro+',
    borderColorClass: 'border-violet-400 dark:border-violet-500',
    bgClass: 'bg-violet-600',
    textClass: 'text-white',
    glowClass: 'shadow-[0_0_6px_rgba(139,92,246,0.3)]',
    canUpgrade: true,
  },
  max: {
    label: 'Max',
    borderColorClass: 'border-amber-400 dark:border-amber-500',
    bgClass: 'bg-linear-to-r from-amber-500 to-orange-500',
    textClass: 'text-white',
    glowClass: 'shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    canUpgrade: false,
  },
}

/* ─── Size presets — pixel-perfect Material Design 3 ─── */
/*
 * Container = Avatar + border*2 (border-box)
 * sm:  32 + 2*2 = 36px = ds3-action-btn ✓
 * md:  40 + 2*2 = 44px
 * lg:  48 + 2*2 = 52px
 * xl:  64 + 2*2 = 68px
 */
type BadgeAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface SizeConfig {
  avatarSize: 'sm' | 'md' | 'lg' | 'xl'
  containerClass: string
  borderWidth: string
  badgeText: string
  badgePadding: string
  badgeOffset: string
  iconSize: string
  dotSize: string
  dotPosition: string
  dotBorder: string
}

const SIZE_CONFIGS: Record<BadgeAvatarSize, SizeConfig> = {
  sm: {
    avatarSize: 'sm',
    containerClass: 'h-9 w-9',
    borderWidth: 'border-2',
    badgeText: 'text-[7px]',
    badgePadding: 'px-1.5 py-px',
    badgeOffset: '-bottom-1',
    iconSize: 'w-[7px] h-[7px]',
    dotSize: 'h-2 w-2',
    dotPosition: 'top-0 right-0',
    dotBorder: 'border border-bg-page dark:border-bg-primary',
  },
  md: {
    avatarSize: 'md',
    containerClass: 'h-11 w-11',
    borderWidth: 'border-2',
    badgeText: 'text-[8px]',
    badgePadding: 'px-2 py-0.5',
    badgeOffset: '-bottom-1.5',
    iconSize: 'w-2 h-2',
    dotSize: 'h-2.5 w-2.5',
    dotPosition: '-top-px right-0',
    dotBorder: 'border-[1.5px] border-bg-page dark:border-bg-primary',
  },
  lg: {
    avatarSize: 'lg',
    containerClass: 'h-13 w-13',
    borderWidth: 'border-2',
    badgeText: 'text-[9px]',
    badgePadding: 'px-2 py-0.5',
    badgeOffset: '-bottom-1.5',
    iconSize: 'w-2.5 h-2.5',
    dotSize: 'h-3 w-3',
    dotPosition: '-top-0.5 right-0',
    dotBorder: 'border-2 border-bg-page dark:border-bg-primary',
  },
  xl: {
    avatarSize: 'xl',
    containerClass: 'h-17 w-17',
    borderWidth: 'border-2',
    badgeText: 'text-[11px]',
    badgePadding: 'px-2.5 py-0.5',
    badgeOffset: '-bottom-2',
    iconSize: 'w-3 h-3',
    dotSize: 'h-3.5 w-3.5',
    dotPosition: '-top-0.5 right-0',
    dotBorder: 'border-2 border-bg-page dark:border-bg-primary',
  },
}

/* ─── Props ─── */
interface AvatarWithPlanBadgeProps {
  src?: string | null
  name: string
  size?: BadgeAvatarSize
  className?: string
  /** Show green active dot (top-right). Default true. */
  showActiveDot?: boolean
  /** Link to plans page on click */
  linkToPlans?: boolean
  /** Override plan slug (for previews) */
  planOverride?: string
  /** Hide plan badge entirely */
  hideBadge?: boolean
}

export function AvatarWithPlanBadge({
  src,
  name,
  size = 'md',
  className,
  showActiveDot = true,
  linkToPlans = false,
  planOverride,
  hideBadge = false,
}: AvatarWithPlanBadgeProps) {
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const simulatedPlan = usePlanSimulationStore((s) => s.simulatedPlan)
  const { isPersonalView, isStudentView } = useEffectiveUserView()

  const sizeConfig = SIZE_CONFIGS[size]

  // Determine plan — hide badge when simulating as student
  const showBadge = isPersonalView && !isStudentView && !hideBadge
  const planSlug = planOverride
    || (isSuperAdmin ? (simulatedPlan || 'max') : (personalProfile?.plan_type || 'trial'))
  const badgeConfig = BADGE_CONFIGS[planSlug] || BADGE_CONFIGS.trial

  // Plan badge — centered at bottom
  const badge = showBadge ? (
    <span
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-10',
        'flex items-center justify-center rounded-full font-black uppercase leading-none tracking-wider',
        'border border-bg-page dark:border-bg-primary',
        sizeConfig.badgeText,
        sizeConfig.badgePadding,
        sizeConfig.badgeOffset,
        badgeConfig.bgClass,
        badgeConfig.textClass,
        badgeConfig.glowClass,
      )}
    >
      <span>{badgeConfig.label}</span>
    </span>
  ) : null

  // Active dot — top-right
  const dot = showActiveDot ? (
    <span
      className={cn(
        'absolute z-10 rounded-full bg-emerald-500 animate-pulse',
        sizeConfig.dotBorder,
        sizeConfig.dotSize,
        sizeConfig.dotPosition,
      )}
    />
  ) : null

  const content = (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center shrink-0',
        sizeConfig.containerClass,
        sizeConfig.borderWidth,
        showBadge ? badgeConfig.borderColorClass : 'border-transparent',
        className,
      )}
    >
      <Avatar src={src} name={name} size={sizeConfig.avatarSize} />
      {dot}
      {badge}
    </div>
  )

  if (linkToPlans && showBadge && badgeConfig.canUpgrade) {
    return (
      <Link
        href="/dashboard/plans"
        className="shrink-0 transition-transform hover:scale-[1.03] active:scale-95"
        title={`Plano ${badgeConfig.label} — Upgrade`}
      >
        {content}
      </Link>
    )
  }

  return content
}

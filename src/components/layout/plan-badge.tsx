/**
 * src/components/layout/plan-badge.tsx
 *
 * PlanBadge — Ultra-modern subscription tier badge for header & sidebar
 *
 * Exports: PlanBadge, SidebarPlanBadge
 * Hooks: useAuthStore, useEffectiveUserView
 * Features: Auth: useAuthStore · 'use client' · DSIcon · MD3 design
 * Variants: compact (header) · sidebar (sidebar footer)
 */

// ============================================
// PlanBadge — MD3 Header & Sidebar Plan Badge
// Shows current plan with animated glow + upgrade CTA
// v2.0 — pulse glow + sidebar variant + mobile
// ============================================

'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import { usePlanSimulationStore } from '@/stores/plan-simulation-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'

/* ─── Plan Config ─── */
interface PlanConfig {
  name: string
  icon: DSIconName
  containerClass: string
  iconClass: string
  textClass: string
  glow: string
  pulseColor: string
  canUpgrade: boolean
  sidebarContainer: string
  sidebarIcon: string
  sidebarText: string
  sidebarProgress: number
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
  trial: {
    name: 'Grátis',
    icon: 'user',
    containerClass: 'border-zinc-500/20 bg-zinc-500/5 hover:bg-zinc-500/10',
    iconClass: 'bg-zinc-500/15 text-zinc-400',
    textClass: 'text-zinc-400',
    glow: '',
    pulseColor: 'bg-zinc-400',
    canUpgrade: true,
    sidebarContainer: 'border-white/8 bg-white/4 hover:bg-white/8',
    sidebarIcon: 'bg-zinc-500/20 text-zinc-400',
    sidebarText: 'text-zinc-400',
    sidebarProgress: 10,
  },
  pro: {
    name: 'Pro',
    icon: 'rocket',
    containerClass: 'border-brand-primary/25 bg-brand-primary/5 hover:bg-brand-primary/10',
    iconClass: 'bg-brand-primary/15 text-brand-primary',
    textClass: 'text-brand-primary',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.1)]',
    pulseColor: 'bg-emerald-400',
    canUpgrade: true,
    sidebarContainer: 'border-emerald-500/15 bg-emerald-500/5 hover:bg-emerald-500/10',
    sidebarIcon: 'bg-emerald-500/20 text-emerald-400',
    sidebarText: 'text-emerald-400',
    sidebarProgress: 40,
  },
  profissional: {
    name: 'Pro+',
    icon: 'star',
    containerClass: 'border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10',
    iconClass: 'bg-violet-500/15 text-violet-400',
    textClass: 'text-violet-400',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.1)]',
    pulseColor: 'bg-violet-400',
    canUpgrade: true,
    sidebarContainer: 'border-violet-500/15 bg-violet-500/5 hover:bg-violet-500/10',
    sidebarIcon: 'bg-violet-500/20 text-violet-400',
    sidebarText: 'text-violet-400',
    sidebarProgress: 70,
  },
  max: {
    name: 'Max',
    icon: 'crown',
    containerClass: 'border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10',
    iconClass: 'bg-amber-500/15 text-amber-400',
    textClass: 'text-amber-400',
    glow: 'shadow-[0_0_16px_rgba(245,158,11,0.12)]',
    pulseColor: 'bg-amber-400',
    canUpgrade: false,
    sidebarContainer: 'border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10',
    sidebarIcon: 'bg-amber-500/20 text-amber-400',
    sidebarText: 'text-amber-400',
    sidebarProgress: 100,
  },
}

/**
 * PlanBadge — Compact header badge (desktop nav)
 */
export function PlanBadge() {
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const simulatedPlan = usePlanSimulationStore((s) => s.simulatedPlan)
  const { isPersonalView } = useEffectiveUserView()

  // super_admin simulando personal vê Max (ou plano simulado) mesmo sem personalProfile
  if (!isPersonalView) return null
  if (!personalProfile && !isSuperAdmin) return null

  const planSlug = isSuperAdmin
    ? (simulatedPlan || 'max')
    : (personalProfile?.plan_type || 'trial')
  const config = PLAN_CONFIGS[planSlug] || PLAN_CONFIGS.trial

  return (
    <Link
      href="/dashboard/plans"
      className={cn(
        'group relative flex items-center gap-1.5 rounded-xl border px-2 py-1 transition-all duration-300',
        config.containerClass,
        config.glow,
      )}
      title={config.canUpgrade ? `Plano ${config.name} — Clique para upgrade` : `Plano ${config.name}`}
    >
      <span className={cn(
        'text-[11px] font-black tracking-wider uppercase leading-none',
        config.textClass
      )}>
        {config.name}
      </span>

      {config.canUpgrade && (
        <div className="relative">
          <DSIcon
            name="arrowUpRight"
            size={10}
            className={cn(
              'transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
              config.textClass, 'opacity-50 group-hover:opacity-100'
            )}
          />
          <span className={cn(
            'absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full animate-pulse',
            config.pulseColor
          )} />
        </div>
      )}

      {config.canUpgrade && (
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </Link>
  )
}

/**
 * SidebarPlanBadge — Full-width sidebar footer badge with progress bar
 */
export function SidebarPlanBadge({ collapsed }: { collapsed?: boolean }) {
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const simulatedPlan = usePlanSimulationStore((s) => s.simulatedPlan)
  const { isPersonalView } = useEffectiveUserView()

  // super_admin simulando personal vê Max (ou plano simulado) mesmo sem personalProfile
  if (!isPersonalView) return null
  if (!personalProfile && !isSuperAdmin) return null

  const planSlug = isSuperAdmin
    ? (simulatedPlan || 'max')
    : (personalProfile?.plan_type || 'trial')
  const config = PLAN_CONFIGS[planSlug] || PLAN_CONFIGS.trial

  if (collapsed) {
    return (
      <Link
        href="/dashboard/plans"
        className={cn(
          'group flex items-center justify-center rounded-xl py-2 transition-all duration-300',
          config.sidebarContainer, 'border'
        )}
        title={`Plano ${config.name}`}
      >
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', config.sidebarIcon)}>
          <span className={cn('text-[10px] font-black uppercase', config.sidebarText)}>
            {config.name.charAt(0)}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/dashboard/plans"
      className={cn(
        'group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300',
        config.sidebarContainer
      )}
    >
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
        config.sidebarIcon
      )}>
        <span className={cn('text-[11px] font-black uppercase', config.sidebarText)}>
          {config.name.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('text-[11px] font-black uppercase tracking-wider', config.sidebarText)}>
            {config.name}
          </span>
          {config.canUpgrade ? (
            <span className="text-[9px] font-bold text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-0.5">
              Upgrade
              <DSIcon name="arrowUpRight" size={8} />
            </span>
          ) : (
            <span className="text-[9px] font-bold text-amber-400/60 flex items-center gap-0.5">
              <DSIcon name="crown" size={8} />
              MAX
            </span>
          )}
        </div>
        <div className="h-1 w-full rounded-full bg-white/8 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', config.pulseColor, 'opacity-70')}
            style={{ width: `${config.sidebarProgress}%` }}
          />
        </div>
      </div>
    </Link>
  )
}

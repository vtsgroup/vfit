/**
 * src/components/progresso/kpi-card.tsx
 *
 * Card KPI com ícone, valor e label — Grid 2x3
 */

'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

interface KPICardProps {
  icon: DSIconName
  label: string
  value: string | number
  unit?: string
  color?: 'blue' | 'cyan' | 'purple' | 'amber' | 'green' | 'red' | string
  iconBg?: string
  trend?: {
    delta: number
    isPositive: boolean
  }
  onClick?: () => void
}

const COLOR_THEMES = {
  blue: {
    cardBg: 'bg-(--kpi-passos-light)',
    cardBorder: 'border-(--kpi-passos-border)',
    iconBg: 'bg-(--kpi-passos-icon-bg)',
    iconColor: 'text-blue-300',
    hoverShadow: 'hover:shadow-(--shadow-kpi-blue)',
  },
  cyan: {
    cardBg: 'bg-(--kpi-agua-light)',
    cardBorder: 'border-(--kpi-agua-border)',
    iconBg: 'bg-(--kpi-agua-icon-bg)',
    iconColor: 'text-cyan-300',
    hoverShadow: 'hover:shadow-(--shadow-kpi-cyan)',
  },
  purple: {
    cardBg: 'bg-(--kpi-sono-light)',
    cardBorder: 'border-(--kpi-sono-border)',
    iconBg: 'bg-(--kpi-sono-icon-bg)',
    iconColor: 'text-violet-300',
    hoverShadow: 'hover:shadow-(--shadow-kpi-purple)',
  },
  amber: {
    cardBg: 'bg-(--kpi-calorias-light)',
    cardBorder: 'border-(--kpi-calorias-border)',
    iconBg: 'bg-(--kpi-calorias-icon-bg)',
    iconColor: 'text-amber-300',
    hoverShadow: 'hover:shadow-(--shadow-kpi-amber)',
  },
  green: {
    cardBg: 'bg-brand-primary/8',
    cardBorder: 'border-brand-primary/20',
    iconBg: 'bg-brand-primary/15',
    iconColor: 'text-brand-primary',
    hoverShadow: 'hover:shadow-(--shadow-kpi-green)',
  },
  red: {
    cardBg: 'bg-red-500/8',
    cardBorder: 'border-red-500/20',
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-300',
    hoverShadow: 'hover:shadow-(--shadow-kpi-red)',
  },
} as const

export function KPICard({ icon, label, value, unit, color = 'green', iconBg, trend, onClick }: KPICardProps) {
  const hasTheme = typeof color === 'string' && color in COLOR_THEMES
  const theme = hasTheme ? COLOR_THEMES[color as keyof typeof COLOR_THEMES] : COLOR_THEMES.green

  return (
    <GlassCard
      variant="depth"
      padding="md"
      clickable={!!onClick}
      hoverLift
      onClick={onClick}
      className={cn(
        'flex flex-col rounded-2xl border',
        hasTheme ? cn(theme.cardBg, theme.cardBorder, theme.hoverShadow) : 'border-white/8 bg-white/4'
      )}
    >
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', iconBg || theme.iconBg)}>
        <DSIcon name={icon} size={20} className={hasTheme ? theme.iconColor : color} />
      </div>
      <div>
        <p className="text-xl leading-none font-black text-white">
          {value}
          {unit && <span className="ml-0.5 text-[12px] font-medium text-zinc-400">{unit}</span>}
        </p>
        <p className="mt-1 text-[11px] font-medium text-zinc-400">{label}</p>
      </div>

      {trend && (
        <div
          className={cn(
            'mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold',
            trend.isPositive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
          )}
        >
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.delta)}%</span>
        </div>
      )}
    </GlassCard>
  )
}

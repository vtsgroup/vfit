/**
 * src/components/ui/tool-card.tsx
 *
 * ToolCard — DS v3 Tool Card Component
 *
 * Exports: ToolCardProps, ToolCard
 * Features: DSIcon
 */

// ============================================
// ToolCard — DS v3 Tool Card Component
// Based on vfit-design-system-v2.jsx "Tool Cards (IA)" + "Em Breve" sections
// ============================================

import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'

export interface ToolCardProps {
  icon: DSIconName
  title: string
  description: string
  /** Accent hex color for icon, e.g. "#10b981" */
  accent?: string
  /** Tailwind bg class for icon container */
  iconBgColor?: string
  /** Tailwind text color class for icon */
  iconColor?: string
  onClick?: () => void
  disabled?: boolean
  locked?: boolean
  className?: string
  /** Animation delay for staggered entrance (ms) */
  animationDelay?: number
}

export function ToolCard({
  icon,
  title,
  description,
  accent,
  iconBgColor,
  iconColor,
  onClick,
  disabled = false,
  locked = false,
  className,
  animationDelay,
}: ToolCardProps) {
  const isDisabled = disabled || locked
  const resolvedIconBg = iconBgColor || (isDisabled ? 'bg-neutral-100 dark:bg-white/5' : 'bg-brand-primary/7')
  const resolvedIconColor = iconColor || (isDisabled ? 'text-text-muted' : 'text-brand-primary')

  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
      className={cn(
        // Surface — DS v4 tokens
        'relative rounded-2xl border border-border-light bg-bg-secondary',
        'shadow-card',
        // Light mode overrides
        'light:bg-white light:border-slate-200/60 light:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]',
        // Padding — DS v2: 26px 24px
        'px-6 py-6.5',
        // Animation
        'animate-fade-in-up fill-mode-both',
        // States
        isDisabled
          ? 'opacity-45 cursor-not-allowed'
          : [
              'cursor-pointer',
              'transition-all duration-300 ease-out-expo',
              'hover:-translate-y-1',
              'hover:shadow-card-hover',
              'hover:border-brand-primary/20',
            ],
        className
      )}
    >
      {/* Lock icon for disabled/locked */}
      {locked && (
        <div className="absolute right-3 top-3">
          <DSIcon name="lock" size={16} className="text-text-muted" />
        </div>
      )}

      {/* Icon container — DS v2: 48×48, border-radius 14 */}
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]',
          !accent && resolvedIconBg
        )}
        style={accent && !isDisabled ? {
          backgroundColor: accent + '15',
          boxShadow: `0 0 20px ${accent}18`,
        } : undefined}
      >
        <DSIcon
          name={icon}
          size={24}
          color={accent && !isDisabled ? accent : undefined}
          className={accent && !isDisabled ? undefined : resolvedIconColor}
        />
      </div>

      {/* Title — DS v2: 16px semibold */}
      <div className="mb-1.5 text-base font-semibold text-text-primary">
        {title}
      </div>

      {/* Description — DS v2: 14px, muted, line-height 1.5 */}
      <div className="text-sm leading-relaxed text-text-muted">
        {description}
      </div>
    </div>
  )
}

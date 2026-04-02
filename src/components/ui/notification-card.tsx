/**
 * src/components/ui/notification-card.tsx
 *
 * NotificationCard — DS v3 Notification Card Component
 *
 * Exports: NotificationCardProps, NotificationCard
 * Features: DSIcon
 */

// ============================================
// NotificationCard — DS v3 Notification Card Component
// Based on vfit-design-system-v2.jsx "Notification Card" section
// ============================================

import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'
import { ActionButtons } from './action-buttons'

export interface NotificationCardProps {
  icon: DSIconName
  /** Tailwind bg class for icon container */
  iconBgColor?: string
  /** Tailwind text class for icon */
  iconColor?: string
  title: string
  description: string
  timestamp: string
  /** Shows green left border when true */
  unread?: boolean
  onMarkRead?: () => void
  onDelete?: () => void
  className?: string
}

export function NotificationCard({
  icon,
  iconBgColor = 'bg-brand-primary/10',
  iconColor = 'text-brand-primary',
  title,
  description,
  timestamp,
  unread = false,
  onMarkRead,
  onDelete,
  className,
}: NotificationCardProps) {
  const actions = []
  if (onMarkRead) {
    actions.push({ icon: 'check' as DSIconName, onClick: onMarkRead, tooltip: 'Marcar como lida' })
  }
  if (onDelete) {
    actions.push({ icon: 'trash' as DSIconName, onClick: onDelete, tooltip: 'Excluir', danger: true })
  }

  return (
    <div
      className={cn(
        // Surface — DS v3 Card
        'relative rounded-2xl border bg-bg-primary',
        'border-border-light',
        'shadow-sm',
        'dark:shadow-md',
        // Light mode overrides
        'light:bg-white light:border-slate-200/60',
        // Hover — explicit properties (no transition-all)
        'transition-[transform,box-shadow,border-color] duration-200 ease-out',
        'hover:-translate-y-1 hover:shadow-lg',
        // Focus ring — a11y
        'focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:ring-offset-1',
        // Reduced motion: disable transform
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        // Padding — DS v3: 16px 20px
        'px-5 py-4',
        // Modern unread indicator — subtle glow ring + bg tint (no left border)
        unread && 'ring-1 ring-brand-primary/20 bg-brand-primary/3 border-brand-primary/15',
        className
      )}
    >
      {/* Modern unread dot — top-right pulsing indicator */}
      {unread && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-brand-primary/40" />
          <div className="h-2 w-2 rounded-full bg-brand-primary ring-2 ring-bg-primary" />
        </div>
      )}
      <div className="flex items-center justify-between">
        {/* Left side: icon + content */}
        <div className="flex items-center gap-3">
          {/* Icon container — DS v3: 36×36, borderRadius 10 */}
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              iconBgColor
            )}
            style={unread ? { boxShadow: '0 0 12px rgba(16,185,129,0.15)' } : undefined}
          >
            <DSIcon name={icon} size={18} className={iconColor} />
          </div>

          <div className="min-w-0">
            {/* Title — DS v3: sm, semibold */}
            <div className="text-sm font-semibold text-text-primary">
              {title}
            </div>
            {/* Description — DS v3: xs, muted */}
            <div className="mt-0.5 text-xs text-text-muted">
              {description}
            </div>
            {/* Timestamp — DS v3: 12px, muted */}
            <div className="mt-0.5 text-xs text-text-muted">
              {timestamp}
            </div>
          </div>
        </div>

        {/* Right side: action buttons */}
        {actions.length > 0 && (
          <ActionButtons actions={actions} className="ml-3 shrink-0" />
        )}
      </div>
    </div>
  )
}

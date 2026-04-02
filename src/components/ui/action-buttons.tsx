/**
 * src/components/ui/action-buttons.tsx
 *
 * ActionButtons — DS v3 Icon Button Group
 *
 * Exports: ActionButtonsProps, ActionButtons
 * Hooks: useState, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// ActionButtons — DS v3 Icon Button Group
// Based on vfit-design-system-v2.jsx "ActionBtn" component
// ============================================

'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from './ds-icon'

interface ActionItem {
  icon: DSIconName
  onClick: () => void
  tooltip?: string
  /** true for destructive actions (trash/delete) — hover turns red */
  danger?: boolean
}

export interface ActionButtonsProps {
  actions: ActionItem[]
  /** Size of each button in px (default: 38, matches DS v2) */
  buttonSize?: number
  className?: string
}

export function ActionButtons({ actions, buttonSize = 38, className }: ActionButtonsProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {actions.map((action, i) => (
        <ActionButton key={i} {...action} size={buttonSize} />
      ))}
    </div>
  )
}

// Internal single action button
function ActionButton({
  icon,
  onClick,
  tooltip,
  danger = false,
  size,
}: ActionItem & { size: number }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick()
    },
    [onClick]
  )

  return (
    <button
      type="button"
      title={tooltip}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: size, height: size }}
      className={cn(
        // Base — DS v2: 38×38, borderRadius 10, border 1px
        'flex items-center justify-center rounded-[10px] border',
        'transition-all duration-180 ease-bounce',
        'cursor-pointer',
        // Default state
        'bg-neutral-100 dark:bg-white/5',
        'border-border-light',
        'text-text-muted',
        // Hover states — conditional danger vs normal
        hovered && danger && 'scale-112 border-red-500/30 bg-red-50 text-red-500 dark:bg-red-500/10',
        hovered && !danger && 'scale-112 border-emerald-500/40 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/12',
        // Non-hovered scale
        !hovered && 'scale-100'
      )}
    >
      <DSIcon name={icon} size={16} />
    </button>
  )
}

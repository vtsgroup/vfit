'use client'

/**
 * VFIT Logo Component
 *
 * Renders the VFIT brand logo with dumbbell icon.
 * Primary brand logo component.
 *
 * @example
 * <VfitLogo size="md" />
 * <VfitLogo size="sm" showIcon={false} />
 */

import { cn } from '@/lib/utils'

interface VfitLogoProps {
  /** Logo size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show dumbbell icon */
  showIcon?: boolean
  /** Additional className */
  className?: string
  /** Text color for "EVOLU" part (default: current text color) */
  textColor?: string
}

const sizeMap = {
  xs: { fontSize: 14, iconSize: 16, gap: 4 },
  sm: { fontSize: 18, iconSize: 20, gap: 6 },
  md: { fontSize: 24, iconSize: 28, gap: 8 },
  lg: { fontSize: 32, iconSize: 36, gap: 10 },
  xl: { fontSize: 40, iconSize: 44, gap: 12 },
} as const

export function VfitLogo({
  size = 'md',
  showIcon = true,
  className,
  textColor,
}: VfitLogoProps) {
  const { fontSize, iconSize, gap } = sizeMap[size]

  return (
    <span
      className={cn('inline-flex items-center', className)}
      style={{ gap }}
    >
      {showIcon && <DumbbellIcon size={iconSize} />}
      <span
        style={{
          fontFamily: "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 800,
          fontSize,
          letterSpacing: '-0.025em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: textColor || 'currentColor' }}>EVOLU</span>
        <span style={{ color: '#10B981' }}>IA</span>
      </span>
    </span>
  )
}

function DumbbellIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left plates */}
      <rect x="1" y="6" width="3.5" height="12" rx="1.5" fill="#10B981" />
      <rect x="5.5" y="7.5" width="2.5" height="9" rx="1" fill="#10B981" opacity="0.85" />
      {/* Bar */}
      <rect x="8" y="10.5" width="8" height="3" rx="1" fill="#10B981" opacity="0.6" />
      {/* Right plates */}
      <rect x="16" y="7.5" width="2.5" height="9" rx="1" fill="#10B981" opacity="0.85" />
      <rect x="19.5" y="6" width="3.5" height="12" rx="1.5" fill="#10B981" />
    </svg>
  )
}

export default VfitLogo

'use client'

/**
 * VFIT Logo Component
 *
 * Renders the VFIT brand logo with V polyline "Vibrante" icon.
 * Primary brand logo component used in sidebar, header, login, etc.
 *
 * @example
 * <VfitLogo size="md" />
 * <VfitLogo size="sm" showIcon={false} />
 */

import { cn } from '@/lib/utils'

interface VfitLogoProps {
  /** Logo size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show V icon */
  showIcon?: boolean
  /** Additional className */
  className?: string
  /** Text color override (default: currentColor) */
  textColor?: string
}

const sizeMap = {
  xs: { fontSize: 14, iconSize: 18, gap: 3 },
  sm: { fontSize: 18, iconSize: 22, gap: 5 },
  md: { fontSize: 24, iconSize: 28, gap: 6 },
  lg: { fontSize: 32, iconSize: 38, gap: 8 },
  xl: { fontSize: 40, iconSize: 48, gap: 10 },
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
      {showIcon && <VIcon size={iconSize} />}
      <span
        style={{
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 900,
          fontSize,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: textColor || 'currentColor',
        }}
      >
        VFIT
      </span>
    </span>
  )
}

/** V polyline "Vibrante" icon — matches splash screen & app icons */
function VIcon({ size = 28 }: { size?: number }) {
  const id = `vlogo-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#56EF85" />
          <stop offset="38%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#065F2C" />
        </linearGradient>
        <radialGradient id={`${id}-hl`} cx="33%" cy="28%" r="54%">
          <stop offset="0%" stopColor="rgba(255,255,255,.28)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="46" fill={`url(#${id}-bg)`} />
      <rect width="200" height="200" rx="46" fill={`url(#${id}-hl)`} />
      <rect x="1" y="1" width="198" height="198" rx="45" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
      <polyline
        points="32,38 100,162 168,38"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default VfitLogo

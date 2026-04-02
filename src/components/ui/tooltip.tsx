/**
 * src/components/ui/tooltip.tsx
 *
 * Tooltip — Ultra-Modern Glassmorphism
 * MD3 + Apple fusion: frosted glass, spring animation, smart positioning
 * Features: 'use client', auto-flip, delay, arrow
 */

'use client'

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
  /** Show arrow pointer */
  arrow?: boolean
  /** Max width in px */
  maxWidth?: number
  /** Disable tooltip */
  disabled?: boolean
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
  arrow = true,
  maxWidth = 240,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [actualPos, setActualPos] = useState(position)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay, disabled])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  // Auto-flip if tooltip goes off-screen
  useEffect(() => {
    if (!visible || !tooltipRef.current || !triggerRef.current) return
    const tooltip = tooltipRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let newPos = position
    if (position === 'top' && tooltip.top < 8) newPos = 'bottom'
    if (position === 'bottom' && tooltip.bottom > vh - 8) newPos = 'top'
    if (position === 'left' && tooltip.left < 8) newPos = 'right'
    if (position === 'right' && tooltip.right > vw - 8) newPos = 'left'
    if (newPos !== actualPos) setActualPos(newPos)
  }, [visible, position, actualPos])

  useEffect(() => setActualPos(position), [position])
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  }

  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-bg-elevated/95 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-bg-elevated/95 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-bg-elevated/95 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-bg-elevated/95 border-y-transparent border-l-transparent',
  }

  const enterAnim: Record<TooltipPosition, string> = {
    top: 'animate-[tooltip-enter-top_0.2s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',
    bottom: 'animate-[tooltip-enter-bottom_0.2s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',
    left: 'animate-[tooltip-enter-left_0.2s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',
    right: 'animate-[tooltip-enter-right_0.2s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',
  }

  return (
    <div ref={triggerRef} className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{ maxWidth }}
          className={cn(
            'pointer-events-none absolute z-9999',
            'rounded-xl px-3 py-2 text-xs font-medium leading-relaxed',
            'bg-bg-elevated/95 text-text-primary backdrop-blur-xl',
            'border dark:border-white/10 light:border-slate-200/60',
            'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] light:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.05)]',
            positionClasses[actualPos],
            enterAnim[actualPos],
            className
          )}
        >
          {/* Glass shine */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-linear-to-b dark:from-white/8 light:from-white/60 to-transparent" />
          <span className="relative">{content}</span>
          {arrow && (
            <span className={cn('absolute h-0 w-0 border-[5px]', arrowClasses[actualPos])} />
          )}
        </div>
      )}
    </div>
  )
}

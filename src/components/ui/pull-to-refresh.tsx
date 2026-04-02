/**
 * src/components/ui/pull-to-refresh.tsx
 *
 * PullToRefresh — iOS/Android-style pull gesture
 *
 * Exports: PullToRefresh
 * Hooks: useCallback, useEffect, useRef, useState
 * Features: 'use client' · Framer Motion
 */

// ============================================
// PullToRefresh — iOS/Android-style pull gesture
// Apple-style spinner with haptic feedback
// ============================================

'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  className?: string
  /** Threshold in px to trigger refresh (default: 80) */
  threshold?: number
  /** Disable the pull-to-refresh behavior */
  disabled?: boolean
}

function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const triggered = useRef(false)

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return true
    // Check if the scrollable ancestor is at top
    let el: HTMLElement | null = containerRef.current
    while (el) {
      if (el.scrollTop > 0) return false
      el = el.parentElement
    }
    return window.scrollY <= 0
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || !isAtTop()) return
      startY.current = e.touches[0].clientY
      currentY.current = startY.current
      triggered.current = false
    },
    [disabled, isRefreshing, isAtTop]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return
      currentY.current = e.touches[0].clientY
      const diff = currentY.current - startY.current

      if (diff > 0 && isAtTop()) {
        // Apply resistance curve (exponential decay)
        const resistance = Math.min(diff * 0.45, threshold * 1.5)
        setPullDistance(resistance)
        setIsPulling(true)

        // Haptic at threshold
        if (resistance >= threshold && !triggered.current) {
          triggered.current = true
          haptic()
        }

        // Prevent page scroll when pulling
        if (diff > 10) {
          e.preventDefault()
        }
      }
    },
    [disabled, isRefreshing, isAtTop, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      setPullDistance(threshold * 0.6) // Keep spinner visible
      haptic()

      try {
        await onRefresh()
      } catch {
        // swallow
      }

      setIsRefreshing(false)
    }

    setPullDistance(0)
    setIsPulling(false)
    triggered.current = false
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)
  const showSpinner = pullDistance > 20 || isRefreshing

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <AnimatePresence>
        {showSpinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center"
            style={{ transform: `translateY(${Math.max(pullDistance - 40, 0)}px)` }}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              'glass-premium shadow-[0_4px_24px_rgba(0,0,0,0.3),0_0_16px_rgba(34,197,94,0.1)]'
            )}>
              <svg
                className={cn(
                  'h-5 w-5 text-brand-primary',
                  isRefreshing && 'animate-spin'
                )}
                style={isRefreshing ? { animationDuration: '0.7s' } : undefined}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isRefreshing ? (
                  <>
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                  </>
                ) : (
                  <path
                    d="M12 4v8m0 0l-3-3m3 3l3-3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      opacity: progress,
                      transform: `rotate(${progress * 180}deg)`,
                      transformOrigin: 'center',
                    }}
                  />
                )}
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull transform */}
      <div
        style={{
          transform: isPulling || isRefreshing ? `translateY(${pullDistance * 0.3}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

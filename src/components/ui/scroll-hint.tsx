/**
 * src/components/ui/scroll-hint.tsx
 *
 * Scroll Hint — Horizontal scroll indicator for tables
 *
 * Exports: ScrollHint
 * Hooks: useRef, useState, useEffect
 * Features: 'use client'
 */

// ============================================
// Scroll Hint — Horizontal scroll indicator for tables
// Shows a subtle "← swipe →" hint on mobile when content overflows
// ============================================

'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollHintProps {
  children: ReactNode
  className?: string
}

export function ScrollHint({ children, className }: ScrollHintProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function check() {
      if (!el) return
      setCanScroll(el.scrollWidth > el.clientWidth + 10)
    }

    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleScroll() {
    if (!hasScrolled) setHasScrolled(true)
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={handleScroll}
        className={cn('overflow-x-auto', className)}
      >
        {children}
      </div>

      {/* Fade hint on right edge */}
      {canScroll && !hasScrolled && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l dark:from-kpi-dark/90 light:from-white/90 to-transparent md:hidden" />
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full dark:bg-white/8 light:bg-black/8 px-2.5 py-1 text-[10px] font-medium text-text-muted backdrop-blur-sm md:hidden">
            <span>←</span>
            <span>deslize</span>
            <span>→</span>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * src/components/ui/page-transition.tsx
 *
 * Sprint 38 — Page Transition wrapper com fade/slide
 */

'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Pequeno delay para triggerar a transição
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Verifica preferência de reduced motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        mounted
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

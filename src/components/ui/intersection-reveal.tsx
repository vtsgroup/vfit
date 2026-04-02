/**
 * src/components/ui/intersection-reveal.tsx
 *
 * Intersection Reveal — Animate on viewport
 *
 * Exports: IntersectionReveal
 * Hooks: useEffect, useRef, useState
 * Features: 'use client'
 */

// ============================================
// Intersection Reveal — Animate on viewport
// ============================================

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface IntersectionRevealProps {
  children: ReactNode
  className?: string
  animation?: 'fade-in' | 'slide-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in' | 'blur-in'
  delay?: number
  threshold?: number
  once?: boolean
}

export function IntersectionReveal({
  children,
  className,
  animation = 'slide-up',
  delay = 0,
  threshold = 0.1,
  once = true,
}: IntersectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
    'blur-in': 'animate-blur-in',
  }[animation]

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        isVisible ? animationClass : 'opacity-0 translate-y-4',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  )
}

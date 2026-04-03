/**
 * src/hooks/use-stagger-animation.ts
 *
 * Hook para animar listas com stagger effect (items aparecem em sequência).
 * CSS-only, sem dependência de Framer Motion.
 *
 * @example
 * ```tsx
 * const { containerRef, getItemStyle, getItemClassName } = useStaggerAnimation({
 *   itemCount: items.length,
 *   staggerDelay: 80,
 * })
 *
 * <div ref={containerRef}>
 *   {items.map((item, i) => (
 *     <div key={item.id} style={getItemStyle(i)} className={getItemClassName(i)}>
 *       {item.name}
 *     </div>
 *   ))}
 * </div>
 * ```
 */

'use client'

import { useEffect, useRef, useState, useMemo, type CSSProperties, type RefObject } from 'react'

// ============================================
// Stagger Animation Hook
// ============================================

export interface UseStaggerAnimationOptions {
  /** Número de items a animar */
  itemCount: number
  /** Delay entre cada item em ms. Default: 80 */
  staggerDelay?: number
  /** Duração da animação de cada item em ms. Default: 300 */
  duration?: number
  /** Delay inicial antes do primeiro item em ms. Default: 100 */
  initialDelay?: number
  /** Se deve usar IntersectionObserver para trigger. Default: true */
  triggerOnView?: boolean
  /** Threshold do IntersectionObserver. Default: 0.1 */
  threshold?: number
  /** Desabilitar animação (ex: prefers-reduced-motion). Default: false */
  disabled?: boolean
}

interface UseStaggerAnimationReturn {
  /** Ref para o container — necessário se triggerOnView=true */
  containerRef: RefObject<HTMLDivElement | null>
  /** Se a animação já foi triggered */
  isVisible: boolean
  /** CSSProperties para cada item (inclui delay) */
  getItemStyle: (index: number) => CSSProperties
  /** ClassName para cada item (inclui transform/opacity) */
  getItemClassName: (index: number) => string
}

export function useStaggerAnimation(
  options: UseStaggerAnimationOptions
): UseStaggerAnimationReturn {
  const {
    staggerDelay = 80,
    duration = 300,
    initialDelay = 100,
    triggerOnView = true,
    threshold = 0.1,
    disabled = false,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!triggerOnView || disabled)

  // Check prefers-reduced-motion
  const prefersReduced = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  const shouldAnimate = !disabled && !prefersReduced

  // IntersectionObserver
  useEffect(() => {
    if (!triggerOnView || !shouldAnimate || isVisible) return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [triggerOnView, shouldAnimate, isVisible, threshold])

  const getItemStyle = (index: number): CSSProperties => {
    if (!shouldAnimate) return {}

    return {
      animationDelay: `${initialDelay + index * staggerDelay}ms`,
      animationDuration: `${duration}ms`,
      animationFillMode: 'both',
    }
  }

  const getItemClassName = (index: number): string => {
    if (!shouldAnimate) return ''

    // Pre-animation state (invisible) until triggered
    if (!isVisible) {
      return 'opacity-0 translate-y-3'
    }

    void index // use parameter

    // Animation active — uses --animate-stagger-in from globals.css
    // which references @keyframes stagger-fade-up
    return 'animate-stagger-in'
  }

  return {
    containerRef,
    isVisible,
    getItemStyle,
    getItemClassName,
  }
}

// ============================================
// Utility: Spring-like CSS easing
// ============================================

/** CSS cubic-bezier que simula spring physics (bounce no final) */
export const SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

/** CSS cubic-bezier para ease-out suave */
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** CSS cubic-bezier para entrance (ease-out forte) */
export const ENTRANCE_EASING = 'cubic-bezier(0.0, 0.0, 0.2, 1)'

// ============================================
// Timing constants (doc 13 spec)
// ============================================

export const ANIMATION_TIMING = {
  /** Feedback imediato (click, toggle) */
  feedback: 150,
  /** Hover effects */
  hover: 200,
  /** Transições de estado (expand, collapse) */
  transition: 300,
  /** Entrada de elementos (mount, appear) */
  entrance: 400,
  /** Loading / spinner loops */
  loading: 2000,
  /** Celebration (success, achievement) */
  celebration: 600,
} as const

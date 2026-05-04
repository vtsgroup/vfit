/**
 * src/components/ui/button.tsx
 *
 * Button — Ultra-Modern Figma-style v4
 * Hooks: useCallback, useRef
 * Features: 'use client'
 */

// ============================================
// Button — Ultra-Modern Figma-style v4
// Layered glass, spring physics, ambient glow, refined depth
// ============================================

'use client'

import { forwardRef, useCallback, useRef, type ButtonHTMLAttributes, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-danger' | 'danger' | 'warning' | 'workout' | 'assessment' | 'payment' | 'soft' | 'gradient' | 'glass'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Enable MD3 ripple effect on click */
  ripple?: boolean
}

// ── Variant Styles ──────────────────────────
// Each variant uses a multi-layer shadow system:
//   Layer 1: 3D depth (bottom edge)
//   Layer 2: Ambient spread (color bleed)
//   Layer 3: Inner top highlight (inset)
//   + border for glass edge definition

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    // Surface: VFIT green gradient with subtle mid-tone
    'bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600',
    'text-white font-bold',
    '[text-shadow:0_1px_2px_rgba(0,0,0,0.2)]',
    // Border: lighter top edge, darker bottom — glass edge
    'border border-t-emerald-300/50 border-x-emerald-500/30 border-b-emerald-700/50',
    // 3D depth solido + inner highlight (sem ambient glow verde)
    'shadow-[0_4px_0_0_#166534,inset_0_1px_0_rgba(255,255,255,0.25)]',
    // Hover: lift (sem glow blur)
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#166534,inset_0_1px_0_rgba(255,255,255,0.3)]',
    'hover:brightness-105',
    // Active: press down + inner shadow
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#166534,inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'active:brightness-95',
    'focus-visible:ring-emerald-400/40',
  ].join(' '),

  secondary: [
    // Light mode: neutral zinc 3D — lighter for student mobile and secondary CTAs
    'bg-linear-to-b from-white via-zinc-100 to-zinc-200',
    'text-zinc-800 font-semibold',
    '[text-shadow:0_1px_1px_rgba(255,255,255,0.8)]',
    'border border-t-white/85 border-x-zinc-200/60 border-b-zinc-400/50',
    'shadow-[0_4px_0_0_#a1a1aa,0_8px_22px_-10px_rgba(63,63,70,0.30),inset_0_1px_0_rgba(255,255,255,0.85)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#a1a1aa,0_12px_30px_-10px_rgba(63,63,70,0.36),inset_0_1px_0_rgba(255,255,255,0.92)]',
    'hover:brightness-[1.03]',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#a1a1aa,0_2px_8px_-4px_rgba(63,63,70,0.22),inset_0_2px_4px_rgba(0,0,0,0.08)]',
    'active:brightness-95',
    // Dark mode: levemente mais claro com tinte emerald sutil
    'dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
    'dark:text-zinc-50',
    'dark:border-t-emerald-400/22 dark:border-x-zinc-700/40 dark:border-b-emerald-900/60',
    'dark:shadow-[0_4px_0_0_#022c22,0_8px_22px_-6px_rgba(6,78,59,0.55),0_0_28px_-12px_rgba(34,197,94,0.32),inset_0_1px_0_rgba(255,255,255,0.14)]',
    'dark:hover:shadow-[0_6px_0_0_#022c22,0_12px_30px_-6px_rgba(6,78,59,0.62),0_0_36px_-10px_rgba(34,197,94,0.42),inset_0_1px_0_rgba(255,255,255,0.18)]',
    'dark:active:shadow-[0_1px_0_0_#022c22,0_2px_8px_-2px_rgba(6,78,59,0.44),inset_0_2px_4px_rgba(0,0,0,0.28)]',
    'focus-visible:ring-emerald-400/35',
  ].join(' '),

  outline: [
    // Lighter alias of secondary — more glass, less depth weight
    'bg-linear-to-b from-white via-zinc-100 to-zinc-200',
    'text-zinc-700 font-semibold',
    '[text-shadow:0_1px_1px_rgba(255,255,255,0.7)]',
    'border border-t-white/80 border-x-zinc-200/50 border-b-zinc-400/40',
    'shadow-[0_3px_0_0_#3f3f46,0_5px_16px_-4px_rgba(63,63,70,0.2),inset_0_1px_0_rgba(255,255,255,0.75)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_5px_0_0_#3f3f46,0_8px_24px_-4px_rgba(63,63,70,0.28),inset_0_1px_0_rgba(255,255,255,0.8)]',
    'hover:brightness-[1.02]',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#3f3f46,0_2px_6px_-2px_rgba(63,63,70,0.12),inset_0_2px_4px_rgba(0,0,0,0.08)]',
    'active:brightness-95',
    // Dark
    'dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
    'dark:text-zinc-100 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.35)]',
    'dark:border-t-zinc-500/25 dark:border-x-zinc-700/30 dark:border-b-zinc-900/50',
    'dark:shadow-[0_3px_0_0_#18181b,0_5px_16px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]',
    'dark:hover:shadow-[0_5px_0_0_#18181b,0_8px_24px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.11)]',
    'dark:active:shadow-[0_1px_0_0_#18181b,0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.25)]',
    'focus-visible:ring-zinc-400/40',
  ].join(' '),

  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-(--state-hover) hover:text-text-primary hover:border-white/5 active:scale-[0.97] active:bg-(--state-pressed)',

  'ghost-danger':
    'bg-transparent text-error border border-error/20 hover:bg-error/8 hover:border-error/40 active:scale-[0.97] focus-visible:ring-error/30',

  danger: [
    'bg-linear-to-b from-red-400 via-red-500 to-red-600',
    'text-white font-bold',
    '[text-shadow:0_1px_2px_rgba(0,0,0,0.2)]',
    'border border-t-red-300/40 border-x-red-500/30 border-b-red-700/50',
    'shadow-[0_4px_0_0_#b91c1c,0_6px_20px_-4px_rgba(239,68,68,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#b91c1c,0_10px_30px_-4px_rgba(239,68,68,0.55),0_0_50px_-10px_rgba(248,113,113,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:brightness-105',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#b91c1c,0_2px_8px_-2px_rgba(239,68,68,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'focus-visible:ring-red-400/40',
  ].join(' '),

  warning: [
    'bg-linear-to-b from-amber-400 via-amber-500 to-amber-600',
    'text-slate-900 dark:text-white font-bold',
    '[text-shadow:0_1px_2px_rgba(0,0,0,0.2)]',
    'border border-t-amber-300/40 border-x-amber-500/30 border-b-amber-700/50',
    'shadow-[0_4px_0_0_#b45309,0_6px_20px_-4px_rgba(245,158,11,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#b45309,0_10px_30px_-4px_rgba(245,158,11,0.55),0_0_50px_-10px_rgba(252,211,77,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:brightness-105',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#b45309,0_2px_8px_-2px_rgba(245,158,11,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'focus-visible:ring-amber-400/40',
  ].join(' '),

  workout: [
    'bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-emerald-300/40 border-x-emerald-500/30 border-b-emerald-700/50',
    'shadow-[0_4px_0_0_#065F46,0_6px_20px_-4px_rgba(16,185,129,0.45),0_0_30px_-8px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#065F46,0_10px_30px_-4px_rgba(16,185,129,0.55),0_0_50px_-10px_rgba(52,211,153,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#065F46,0_2px_8px_-2px_rgba(16,185,129,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'focus-visible:ring-emerald-400/40',
  ].join(' '),

  assessment: [
    'bg-linear-to-b from-violet-400 via-violet-500 to-violet-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-violet-300/40 border-x-violet-500/30 border-b-violet-700/50',
    'shadow-[0_4px_0_0_#4C1D95,0_6px_20px_-4px_rgba(139,92,246,0.45),0_0_30px_-8px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#4C1D95,0_10px_30px_-4px_rgba(139,92,246,0.55),0_0_50px_-10px_rgba(167,139,250,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#4C1D95,0_2px_8px_-2px_rgba(139,92,246,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'focus-visible:ring-violet-400/40',
  ].join(' '),

  payment: [
    'bg-linear-to-b from-amber-400 via-amber-500 to-amber-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-amber-300/40 border-x-amber-500/30 border-b-amber-700/50',
    'shadow-[0_4px_0_0_#92400E,0_6px_20px_-4px_rgba(245,158,11,0.45),0_0_30px_-8px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#92400E,0_10px_30px_-4px_rgba(245,158,11,0.55),0_0_50px_-10px_rgba(252,211,77,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#92400E,0_2px_8px_-2px_rgba(245,158,11,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'focus-visible:ring-amber-400/40',
  ].join(' '),

  // ── New Modern Variants ────────────────────
  // Soft: muted background, no 3D depth — for secondary actions in cards
  soft: [
    'bg-emerald-50 text-emerald-700 font-semibold',
    'border border-emerald-200/60',
    'shadow-sm',
    'hover:bg-emerald-100 hover:border-emerald-300/60 hover:shadow',
    'active:scale-[0.97] active:bg-emerald-150',
    // Dark mode
    'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
    'dark:hover:bg-emerald-900/50 dark:hover:border-emerald-700/50',
    'dark:active:bg-emerald-900/60',
    'focus-visible:ring-emerald-400/30',
  ].join(' '),

  // Gradient: vibrant multi-color gradient — for premium/AI CTAs
  gradient: [
    'bg-linear-to-r from-emerald-500 via-brand-primary to-brand-accent',
    'text-white font-bold',
    '[text-shadow:0_1px_2px_rgba(0,0,0,0.2)]',
    'border border-t-white/20 border-x-transparent border-b-black/10',
    'shadow-[0_4px_0_0_#065F46,0_6px_24px_-4px_rgba(20,184,166,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-0.5',
    'hover:shadow-[0_6px_0_0_#065F46,0_10px_32px_-4px_rgba(20,184,166,0.6),0_0_60px_-10px_rgba(20,184,166,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:brightness-105',
    'active:translate-y-[3px] active:scale-[0.98]',
    'active:shadow-[0_1px_0_0_#065F46,0_2px_8px_-2px_rgba(20,184,166,0.3),inset_0_2px_6px_rgba(0,0,0,0.15)]',
    'active:brightness-95',
    'focus-visible:ring-teal-400/40',
  ].join(' '),

  // Glass: glassmorphism — for overlays and floating actions
  glass: [
    'bg-white/10 backdrop-blur-xl text-white font-semibold',
    'border border-white/15',
    'shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]',
    'hover:bg-white/15 hover:border-white/25',
    'hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]',
    'active:scale-[0.97] active:bg-white/8',
    'active:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(0,0,0,0.1)]',
    // Light mode: inverted glass
    'max-sm:text-inherit',
    'light:bg-black/5 light:text-slate-800 light:border-black/10',
    'light:hover:bg-black/8 light:hover:border-black/15',
    'focus-visible:ring-white/30',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-11 px-4 text-sm gap-1.5 rounded-xl',
  md: 'h-13 px-6 text-sm gap-2 rounded-2xl',
  lg: 'h-16 px-8 text-base gap-2.5 rounded-2xl',
  icon: 'h-11 w-11 rounded-xl',
  'icon-lg': 'h-14 w-14 rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, ripple = true, children, onClick, ...props }, ref) => {
    const rippleRef = useRef<HTMLSpanElement>(null)

    const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      // MD3 Ripple — softer, larger, more natural
      if (ripple && rippleRef.current) {
        const btn = e.currentTarget
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const rippleEl = document.createElement('span')
        const diameter = Math.max(rect.width, rect.height) * 2.5
        rippleEl.style.cssText = `
          position:absolute;left:${x - diameter / 2}px;top:${y - diameter / 2}px;
          width:${diameter}px;height:${diameter}px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0) 70%);
          pointer-events:none;
          animation:ripple 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
        `
        rippleRef.current.appendChild(rippleEl)
        setTimeout(() => rippleEl.remove(), 700)
      }

      onClick?.(e)
    }, [ripple, onClick])

    const isFlat = variant === 'ghost' || variant === 'ghost-danger' || variant === 'soft'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'group/btn relative inline-flex items-center justify-center font-medium overflow-hidden',
          // Spring-feel transition
          'transition-all duration-200 ease-bounce',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-bg-primary',
          'disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {/* Glass shine — top highlight arc */}
        {!isFlat && (
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit] bg-linear-to-b from-white/20 via-white/8 to-transparent" />
        )}
        {/* Glass shine — bottom edge reflection */}
        {!isFlat && (
          <span className="pointer-events-none absolute inset-x-2 bottom-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />
        )}
        {/* Ripple container */}
        <span ref={rippleRef} className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" />
        {/* Content */}
        {loading && (
          <svg
            className={cn(
              "h-4 w-4 animate-spin",
              variant === 'primary' ? "text-white" : "text-current"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span className="relative inline-flex items-center gap-[inherit]">{children}</span>
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, type ButtonProps }

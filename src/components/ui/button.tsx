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
// Modern layered depth system (2026) — replaces hard-edge block shadows.
// Each 3D variant composes:
//   Layer 1: tight contact shadow (crisp grounding, ~0_1-2px)
//   Layer 2: soft ambient key shadow in the variant's color (spread, low opacity)
//   Layer 3: inset top highlight (glass edge) + subtle inset bottom seam
// Hover lifts -translate-y-px with a softer, wider colored glow.
// Active settles translate-y-px with a gentle inset pressed shadow.

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    // Surface: solid VFIT green — refined layered depth, no hard block edge
    'bg-brand-primary',
    'text-white font-black',
    '[text-shadow:0_1px_2px_rgba(2,44,34,0.38)]',
    'border border-emerald-900/70',
    'shadow-[0_1px_2px_rgba(2,44,34,0.4),0_4px_12px_-3px_rgba(6,95,70,0.5),0_10px_28px_-8px_rgba(6,95,70,0.42),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(6,78,59,0.28)]',
    'hover:-translate-y-px',
    'hover:bg-brand-primary-hover',
    'hover:shadow-[0_2px_4px_rgba(2,44,34,0.42),0_8px_20px_-4px_rgba(6,95,70,0.55),0_16px_40px_-10px_rgba(6,95,70,0.5),0_0_30px_-10px_rgba(34,197,94,0.55),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-1px_0_rgba(6,78,59,0.30)]',
    // Active: settle + soft inner press
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(2,44,34,0.4),0_2px_6px_-2px_rgba(6,95,70,0.4),inset_0_2px_6px_rgba(2,44,34,0.28)]',
    'active:brightness-[0.97]',
    'focus-visible:ring-emerald-400/40',
  ].join(' '),

  secondary: [
    // Premium navy graphite — stronger contrast partner for emerald primary CTAs
    'bg-linear-to-b from-slate-300 via-slate-600 to-slate-950',
    'text-white font-black',
    '[text-shadow:0_1px_2px_rgba(2,6,23,0.42)]',
    'border border-slate-950/70',
    'shadow-[0_1px_2px_rgba(2,6,23,0.45),0_4px_12px_-3px_rgba(15,23,42,0.5),0_10px_28px_-8px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.32)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(2,6,23,0.48),0_8px_20px_-4px_rgba(15,23,42,0.55),0_16px_40px_-10px_rgba(15,23,42,0.5),0_0_30px_-12px_rgba(125,211,252,0.45),inset_0_1px_0_rgba(255,255,255,0.38)]',
    'hover:brightness-105',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(2,6,23,0.45),0_2px_6px_-2px_rgba(15,23,42,0.45),inset_0_2px_6px_rgba(2,6,23,0.32)]',
    'active:brightness-[0.97]',
    'focus-visible:ring-sky-300/45',
  ].join(' '),

  outline: [
    // Lighter alias of secondary — more glass, less depth weight
    'bg-linear-to-b from-white via-zinc-100 to-zinc-200',
    'text-zinc-700 font-semibold',
    '[text-shadow:0_1px_1px_rgba(255,255,255,0.7)]',
    'border border-t-white/80 border-x-zinc-200/60 border-b-zinc-400/50',
    'shadow-[0_1px_2px_rgba(63,63,70,0.16),0_3px_10px_-3px_rgba(63,63,70,0.18),0_8px_22px_-8px_rgba(63,63,70,0.16),inset_0_1px_0_rgba(255,255,255,0.85)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(63,63,70,0.18),0_6px_16px_-4px_rgba(63,63,70,0.22),0_12px_30px_-10px_rgba(63,63,70,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]',
    'hover:brightness-[1.02]',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(63,63,70,0.14),0_2px_5px_-2px_rgba(63,63,70,0.12),inset_0_2px_4px_rgba(0,0,0,0.08)]',
    'active:brightness-[0.98]',
    // Dark
    'dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800',
    'dark:text-zinc-100 dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.35)]',
    'dark:border-t-zinc-500/25 dark:border-x-zinc-700/40 dark:border-b-zinc-900/60',
    'dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_4px_12px_-3px_rgba(0,0,0,0.5),0_10px_26px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]',
    'dark:hover:shadow-[0_2px_4px_rgba(0,0,0,0.55),0_8px_20px_-4px_rgba(0,0,0,0.6),0_16px_38px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.11)]',
    'dark:active:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_2px_6px_-2px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(0,0,0,0.25)]',
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
    'shadow-[0_1px_2px_rgba(127,29,29,0.4),0_4px_12px_-3px_rgba(239,68,68,0.4),0_10px_26px_-8px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(127,29,29,0.42),0_8px_20px_-4px_rgba(239,68,68,0.48),0_16px_38px_-10px_rgba(239,68,68,0.42),0_0_30px_-10px_rgba(248,113,113,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:brightness-105',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(127,29,29,0.4),0_2px_6px_-2px_rgba(239,68,68,0.35),inset_0_2px_6px_rgba(0,0,0,0.16)]',
    'focus-visible:ring-red-400/40',
  ].join(' '),

  warning: [
    'bg-linear-to-b from-amber-400 via-amber-500 to-amber-600',
    'text-slate-900 dark:text-white font-bold',
    '[text-shadow:0_1px_2px_rgba(0,0,0,0.2)]',
    'border border-t-amber-300/40 border-x-amber-500/30 border-b-amber-700/50',
    'shadow-[0_1px_2px_rgba(120,53,15,0.4),0_4px_12px_-3px_rgba(245,158,11,0.4),0_10px_26px_-8px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(120,53,15,0.42),0_8px_20px_-4px_rgba(245,158,11,0.48),0_16px_38px_-10px_rgba(245,158,11,0.42),0_0_30px_-10px_rgba(252,211,77,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'hover:brightness-105',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(120,53,15,0.4),0_2px_6px_-2px_rgba(245,158,11,0.35),inset_0_2px_6px_rgba(0,0,0,0.16)]',
    'focus-visible:ring-amber-400/40',
  ].join(' '),

  workout: [
    'bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-emerald-300/40 border-x-emerald-500/30 border-b-emerald-700/50',
    'shadow-[0_1px_2px_rgba(6,95,70,0.4),0_4px_12px_-3px_rgba(16,185,129,0.4),0_10px_26px_-8px_rgba(16,185,129,0.35),0_0_24px_-10px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(6,95,70,0.42),0_8px_20px_-4px_rgba(16,185,129,0.48),0_16px_38px_-10px_rgba(16,185,129,0.42),0_0_30px_-10px_rgba(52,211,153,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(6,95,70,0.4),0_2px_6px_-2px_rgba(16,185,129,0.35),inset_0_2px_6px_rgba(0,0,0,0.16)]',
    'focus-visible:ring-emerald-400/40',
  ].join(' '),

  assessment: [
    'bg-linear-to-b from-violet-400 via-violet-500 to-violet-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-violet-300/40 border-x-violet-500/30 border-b-violet-700/50',
    'shadow-[0_1px_2px_rgba(76,29,149,0.4),0_4px_12px_-3px_rgba(139,92,246,0.4),0_10px_26px_-8px_rgba(139,92,246,0.35),0_0_24px_-10px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(76,29,149,0.42),0_8px_20px_-4px_rgba(139,92,246,0.48),0_16px_38px_-10px_rgba(139,92,246,0.42),0_0_30px_-10px_rgba(167,139,250,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(76,29,149,0.4),0_2px_6px_-2px_rgba(139,92,246,0.35),inset_0_2px_6px_rgba(0,0,0,0.16)]',
    'focus-visible:ring-violet-400/40',
  ].join(' '),

  payment: [
    'bg-linear-to-b from-amber-400 via-amber-500 to-amber-600',
    'text-slate-900 dark:text-white font-bold',
    'border border-t-amber-300/40 border-x-amber-500/30 border-b-amber-700/50',
    'shadow-[0_1px_2px_rgba(146,64,14,0.4),0_4px_12px_-3px_rgba(245,158,11,0.4),0_10px_26px_-8px_rgba(245,158,11,0.35),0_0_24px_-10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(146,64,14,0.42),0_8px_20px_-4px_rgba(245,158,11,0.48),0_16px_38px_-10px_rgba(245,158,11,0.42),0_0_30px_-10px_rgba(252,211,77,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(146,64,14,0.4),0_2px_6px_-2px_rgba(245,158,11,0.35),inset_0_2px_6px_rgba(0,0,0,0.16)]',
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
    'bg-linear-to-r from-emerald-400 via-emerald-500 to-lime-400',
    'text-white font-black',
    '[text-shadow:0_1px_2px_rgba(2,44,34,0.35)]',
    'border border-emerald-900/55',
    'shadow-[0_1px_2px_rgba(2,44,34,0.38),0_4px_12px_-3px_rgba(6,95,70,0.45),0_10px_28px_-8px_rgba(6,95,70,0.4),inset_0_1px_0_rgba(255,255,255,0.34)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_2px_4px_rgba(2,44,34,0.4),0_8px_20px_-4px_rgba(6,95,70,0.5),0_16px_40px_-10px_rgba(6,95,70,0.45),0_0_30px_-10px_rgba(132,204,22,0.5),inset_0_1px_0_rgba(255,255,255,0.42)]',
    'hover:brightness-105',
    'active:translate-y-px active:scale-[0.985]',
    'active:shadow-[0_1px_2px_rgba(2,44,34,0.38),0_2px_6px_-2px_rgba(6,95,70,0.4),inset_0_2px_6px_rgba(2,44,34,0.26)]',
    'active:brightness-[0.97]',
    'focus-visible:ring-emerald-400/40',
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
          // Refined premium transition — crisp ease-out, no jelly overshoot
          'transition-all duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
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
          <span className={cn(
            'pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit] bg-linear-to-b to-transparent',
            variant === 'primary' ? 'from-white/12 via-white/4' : 'from-white/20 via-white/8'
          )} />
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

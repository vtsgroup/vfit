/**
 * src/components/ui/action-button-3d.tsx
 *
 * Action Button 3D — Botões didáticos com efeito 3D
 *
 * Exports: ActionColor, ActionButton3D, ActionCard3D, PERSONAL_ACTIONS
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Action Button 3D — Botões didáticos com efeito 3D
// Cada ação tem cor única + ícone grande para fácil identificação
// ============================================

'use client'

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

// ============================================
// Color System — Cores didáticas por ação
// ============================================

export type ActionColor = 'green' | 'violet' | 'amber' | 'brand' | 'lime' | 'teal' | 'rose' | 'orange'

const ACTION_COLORS: Record<ActionColor, {
  bg: string
  shadow: string
  shadowHover: string
  shadowActive: string
  iconBg: string
  glow: string
  label: string
}> = {
  green: {
    bg: 'bg-linear-to-b from-emerald-400 to-emerald-600',
    shadow: 'shadow-[0_4px_0_0_#065F46,0_6px_16px_rgba(16,185,129,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#065F46,0_10px_24px_rgba(16,185,129,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#065F46,0_3px_8px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-emerald-400/30',
    label: 'text-white',
  },
  violet: {
    bg: 'bg-linear-to-b from-violet-400 to-violet-600',
    shadow: 'shadow-[0_4px_0_0_#4C1D95,0_6px_16px_rgba(139,92,246,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#4C1D95,0_10px_24px_rgba(139,92,246,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#4C1D95,0_3px_8px_rgba(139,92,246,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-violet-400/30',
    label: 'text-white',
  },
  amber: {
    bg: 'bg-linear-to-b from-amber-400 to-amber-600',
    shadow: 'shadow-[0_4px_0_0_#92400E,0_6px_16px_rgba(245,158,11,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#92400E,0_10px_24px_rgba(245,158,11,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#92400E,0_3px_8px_rgba(245,158,11,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-amber-400/30',
    label: 'text-white',
  },
  brand: {
    bg: 'bg-linear-to-b from-brand-primary to-emerald-600',
    shadow: 'shadow-[0_4px_0_0_#166534,0_6px_16px_rgba(34,197,94,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#166534,0_10px_24px_rgba(34,197,94,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#166534,0_3px_8px_rgba(34,197,94,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-brand-primary/30',
    label: 'text-white',
  },
  lime: {
    bg: 'bg-linear-to-b from-lime-400 to-lime-600',
    shadow: 'shadow-[0_4px_0_0_#365314,0_6px_16px_rgba(132,204,22,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#365314,0_10px_24px_rgba(132,204,22,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#365314,0_3px_8px_rgba(132,204,22,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-lime-400/30',
    label: 'text-black',
  },
  teal: {
    bg: 'bg-linear-to-b from-teal-400 to-teal-600',
    shadow: 'shadow-[0_4px_0_0_#115E59,0_6px_16px_rgba(20,184,166,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#115E59,0_10px_24px_rgba(20,184,166,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#115E59,0_3px_8px_rgba(20,184,166,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-teal-400/30',
    label: 'text-white',
  },
  rose: {
    bg: 'bg-linear-to-b from-rose-400 to-rose-600',
    shadow: 'shadow-[0_4px_0_0_#881337,0_6px_16px_rgba(244,63,94,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#881337,0_10px_24px_rgba(244,63,94,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#881337,0_3px_8px_rgba(244,63,94,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-rose-400/30',
    label: 'text-white',
  },
  orange: {
    bg: 'bg-linear-to-b from-orange-400 to-orange-600',
    shadow: 'shadow-[0_4px_0_0_#7C2D12,0_6px_16px_rgba(249,115,22,0.3)]',
    shadowHover: 'hover:shadow-[0_6px_0_0_#7C2D12,0_10px_24px_rgba(249,115,22,0.35)]',
    shadowActive: 'active:shadow-[0_2px_0_0_#7C2D12,0_3px_8px_rgba(249,115,22,0.2)]',
    iconBg: 'bg-white/20',
    glow: 'hover:ring-orange-400/30',
    label: 'text-white',
  },
}

// ============================================
// Action Button 3D
// ============================================

interface ActionButton3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: ActionColor
  icon?: ReactNode
  label: string
  sublabel?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const ActionButton3D = forwardRef<HTMLButtonElement, ActionButton3DProps>(
  ({ color, icon, label, sublabel, size = 'md', loading, disabled, className, ...props }, ref) => {
    const colors = ACTION_COLORS[color]

    const sizeStyles = {
      sm: 'h-10 px-4 text-sm gap-2 rounded-xl',
      md: 'h-12 px-5 text-sm gap-2.5 rounded-xl',
      lg: 'h-14 px-6 text-base gap-3 rounded-2xl',
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ y: -2 }}
        whileTap={{ y: 1 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all duration-200',
          'ring-2 ring-transparent',
          colors.bg,
          colors.shadow,
          colors.shadowHover,
          colors.shadowActive,
          colors.glow,
          colors.label,
          sizeStyles[size],
          'hover:-translate-y-0.5 active:translate-y-0.5',
          'disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50',
          className
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        <span className="flex flex-col items-start">
          <span className="font-bold leading-tight">{label}</span>
          {sublabel && <span className="text-[10px] font-normal opacity-75 leading-tight">{sublabel}</span>}
        </span>
      </motion.button>
    )
  }
)
ActionButton3D.displayName = 'ActionButton3D'

// ============================================
// Action Card 3D — Card clicável estilo quick action
// ============================================

interface ActionCard3DProps {
  color: ActionColor
  icon: ReactNode
  label: string
  description?: string
  href?: string
  onClick?: () => void
}

export function ActionCard3D({ color, icon, label, description, href, onClick }: ActionCard3DProps) {
  const colors = ACTION_COLORS[color]

  const content = (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center cursor-pointer',
        // Light mode (base)
        'border border-black/6 bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
        'hover:border-black/10 hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]',
        // Dark mode
        'dark:border-white/6 dark:bg-white/3 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
        'dark:hover:border-white/12 dark:hover:bg-white/6 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'backdrop-blur-sm transition-all duration-300'
      )}
      onClick={onClick}
    >
      {/* Floating icon pill with 3D color */}
      <div className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full',
        colors.bg,
        'shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_4px_14px_rgba(0,0,0,0.15)]',
        'group-hover:shadow-[0_6px_0_0_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.2)]',
        'group-hover:-translate-y-1',
        'transition-all duration-300'
      )}>
        <div className={colors.label}>{icon}</div>
      </div>

      {/* Label */}
      <div className="min-h-10.5 flex flex-col items-center justify-start">
        <p className="text-sm font-bold text-text-primary leading-tight">{label}</p>
        {description && (
          <p className="mt-1 text-[10px] leading-snug text-text-secondary/60 line-clamp-2">{description}</p>
        )}
      </div>
    </motion.div>
  )

  if (href) {
    return <a href={href} className="h-full">{content}</a>
  }

  return content
}

// ============================================
// Pre-configured Action Buttons for VFIT
// ============================================

export const PERSONAL_ACTIONS = {
  createWorkout: {
    color: 'green' as ActionColor,
    icon: <DSIcon name="dumbbell" size={20} />,
    label: 'Criar Treino',
    description: 'Montar novo treino para aluno',
    href: '/dashboard/workouts/create',
  },
  createAssessment: {
    color: 'violet' as ActionColor,
    icon: <DSIcon name="clipboardList" size={20} />,
    label: 'Nova Avaliação',
    description: 'Avaliar composição corporal',
    href: '/dashboard/assessments/create',
  },
  createPayment: {
    color: 'amber' as ActionColor,
    icon: <DSIcon name="creditCard" size={20} />,
    label: 'Cobrar Aluno',
    description: 'Criar cobrança PIX/boleto',
    href: '/dashboard/payments/create',
  },
  addStudent: {
    color: 'brand' as ActionColor,
    icon: <DSIcon name="userPlus" size={20} />,
    label: 'Cadastrar Aluno',
    description: 'Convidar novo aluno',
    href: '/dashboard/students/invite',
  },
  generateAI: {
    color: 'lime' as ActionColor,
    icon: <DSIcon name="sparkles" size={20} />,
    label: 'Gerar com IA',
    description: 'Treino inteligente por IA',
    href: '/dashboard/ai',
  },
  referral: {
    color: 'teal' as ActionColor,
    icon: <DSIcon name="share" size={20} />,
    label: 'Indicar Personal',
    description: 'Programa de afiliados',
    href: '/dashboard/affiliates',
  },
}

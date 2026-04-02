/**
 * src/components/ui/modern-toast.tsx
 *
 * Modern Toast — Ultra-modern toast notifications
 *
 * Exports: useToast, ToastProvider
 * Hooks: useContext, useCallback, useState, useRef, useEffect, useToast
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Modern Toast — Ultra-modern toast notifications
// Glass morphism + slide animations + progress bar
// ============================================

'use client'

import { createContext, useContext, useCallback, useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'workout' | 'assessment' | 'payment' | 'student' | 'ai'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

// ============================================
// Config
// ============================================

const TOAST_CONFIG: Record<ToastType, {
  icon: DSIconName
  gradient: string
  iconColor: string
  progressColor: string
  glowColor: string
}> = {
  success: {
    icon: 'checkCircle2',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    iconColor: 'text-emerald-400',
    progressColor: 'bg-emerald-400',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  error: {
    icon: 'xCircle',
    gradient: 'from-red-500/20 via-red-500/5 to-transparent',
    iconColor: 'text-red-400',
    progressColor: 'bg-red-400',
    glowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
  warning: {
    icon: 'alertTriangle',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-400',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  info: {
    icon: 'info',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    iconColor: 'text-blue-400',
    progressColor: 'bg-blue-400',
    glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  workout: {
    icon: 'dumbbell',
    gradient: 'from-brand-primary/20 via-brand-primary/5 to-transparent',
    iconColor: 'text-brand-primary',
    progressColor: 'bg-brand-primary',
    glowColor: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  },
  assessment: {
    icon: 'clipboardList',
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    iconColor: 'text-violet-400',
    progressColor: 'bg-violet-400',
    glowColor: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  payment: {
    icon: 'creditCard',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-400',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  student: {
    icon: 'userPlus',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    iconColor: 'text-cyan-400',
    progressColor: 'bg-cyan-400',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
  },
  ai: {
    icon: 'sparkles',
    gradient: 'from-brand-accent/20 via-brand-accent/5 to-transparent',
    iconColor: 'text-brand-accent',
    progressColor: 'bg-brand-accent',
    glowColor: 'shadow-[0_0_20px_rgba(132,204,22,0.15)]',
  },
}

// ============================================
// Toast Item
// ============================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type]
  const duration = toast.duration ?? 4000
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border dark:border-white/10 light:border-slate-200/80',
        'dark:bg-kpi-dark/95 light:bg-white/95 backdrop-blur-xl',
        config.glowColor,
        'min-w-80 max-w-105'
      )}
    >
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-linear-to-r', config.gradient, 'pointer-events-none')} />

      <div className="relative flex items-start gap-3 p-4">
        {/* Icon with pulse */}
        <div className="relative mt-0.5 shrink-0">
          <div className={cn('absolute inset-0 animate-ping rounded-full opacity-20', config.iconColor)} />
          <DSIcon name={config.icon} size={20} className={cn('relative', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold dark:text-white light:text-slate-900">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs dark:text-white/60 light:text-slate-500">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-lg p-1 dark:text-white/40 light:text-slate-400 dark:hover:text-white/80 light:hover:text-slate-700 dark:hover:bg-white/5 light:hover:bg-black/5 transition-all"
        >
          <DSIcon name="x" size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full dark:bg-white/5 light:bg-slate-100">
        <motion.div
          ref={progressRef}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={cn('h-full', config.progressColor)}
        />
      </div>
    </motion.div>
  )
}

// ============================================
// Provider + Container
// ============================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev.slice(-4), { ...options, id }]) // max 5
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}

      {/* Toast container — top right */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

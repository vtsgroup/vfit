/**
 * src/components/layout/toast-container.tsx
 *
 * Toast Container — Ultra-modern toasts
 *
 * Exports: ToastContainer
 * Hooks: useEffect, useState, useAppStore
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Toast Container — Ultra-modern toasts
// Progress bar auto-dismiss + stacked layout
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { useAppStore } from '@/stores/app-store'

const iconMap: Record<string, DSIconName> = {
  success: 'checkCircle2',
  error: 'alertCircle',
  warning: 'alertTriangle',
  info: 'info',
}

const colorMap = {
  success: 'border-success/30 bg-success/5',
  error: 'border-error/30 bg-error/5',
  warning: 'border-warning/30 bg-warning/5',
  info: 'border-info/30 bg-info/5',
}

const iconColorMap = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

const progressColorMap = {
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
}

function ToastProgressBar({ duration, type }: { duration: number; type: 'success' | 'error' | 'warning' | 'info' }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration <= 0) return

    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 30)

    return () => clearInterval(interval)
  }, [duration])

  if (duration <= 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
      <div
        className={cn('h-full transition-none', progressColorMap[type])}
        style={{ width: `${progress}%`, opacity: 0.6 }}
      />
    </div>
  )
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  // Evitar "parede" de toasts: mostra os 3 mais recentes
  const visibleToasts = toasts.slice(0, 3)

  return (
    <div
      className={cn(
        'fixed z-60 flex flex-col gap-2 pointer-events-none overflow-hidden',
        // Mobile: acima do bottom nav + safe-area
        'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-2 right-2',
        // Desktop: canto inferior direito
        'sm:left-auto sm:right-4 sm:bottom-4'
      )}
      style={{
        maxHeight: 'calc(100dvh - 5.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
      }}
      role="region"
      aria-label="Notificações"
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => {
          const iconName = iconMap[toast.type]
          const isUrgent = toast.type === 'error' || toast.type === 'warning'
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 80, scale: 0.9, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              layout
              className={cn(
                'pointer-events-auto relative flex w-full max-w-[calc(100vw-1rem)] sm:w-96 items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md overflow-hidden',
                colorMap[toast.type]
              )}
              role={isUrgent ? 'alert' : 'status'}
              aria-live={isUrgent ? 'assertive' : 'polite'}
              aria-atomic="true"
            >
              <DSIcon name={iconName} size={20} className={cn('mt-0.5 shrink-0', iconColorMap[toast.type])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-text-secondary">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-lg p-1 text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all hover:bg-white/15 hover:text-white active:scale-90"
                aria-label="Fechar notificação"
              >
                <DSIcon name="x" size={14} />
              </button>
              {/* Progress bar */}
              <ToastProgressBar duration={toast.duration ?? 5000} type={toast.type} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

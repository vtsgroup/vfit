/**
 * src/components/ui/loading-overlay.tsx
 *
 * LoadingOverlay — Fullscreen + inline spinner
 *
 * Exports: LoadingOverlay, SimpleSpinner
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// LoadingOverlay — Fullscreen + inline spinner
// With brand animation and optional message
// ============================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  show: boolean
  message?: string
  variant?: 'fullscreen' | 'inline' | 'card'
  className?: string
}

export function LoadingOverlay({
  show,
  message = 'Carregando...',
  variant = 'inline',
  className,
}: LoadingOverlayProps) {
  if (variant === 'fullscreen') {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-bg-primary/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className="flex flex-col items-center gap-4"
            >
              <BrandSpinner size="lg" />
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-medium text-text-muted"
                >
                  {message}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (variant === 'card') {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-bg-secondary/80 backdrop-blur-sm',
              className
            )}
          >
            <BrandSpinner size="md" />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // inline
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
        >
          <BrandSpinner size="md" />
          {message && (
            <p className="text-sm font-medium text-text-muted">{message}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// BrandSpinner — Animated brand icon
// ============================================

function BrandSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className="relative">
      {/* Glow ring */}
      <motion.div
        className={cn('rounded-2xl bg-brand-primary/10', sizes[size])}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(0, 217, 142, 0)',
            '0 0 0 8px rgba(0, 217, 142, 0.1)',
            '0 0 0 0 rgba(0, 217, 142, 0)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Icon */}
      <motion.div
        className={cn('absolute inset-0 flex items-center justify-center')}
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <DSIcon name="sparkles" className={cn('text-brand-primary', iconSizes[size])} />
      </motion.div>
    </div>
  )
}

// ============================================
// SimpleSpinner — Basic inline spinner
// ============================================

export function SimpleSpinner({ className }: { className?: string }) {
  return (
    <DSIcon name="loader" className={cn('h-5 w-5 animate-spin text-brand-primary', className)} />
  )
}

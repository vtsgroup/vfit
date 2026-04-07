/**
 * src/components/ui/progress-bar.tsx
 *
 * ProgressBar — Barra de progresso animada com Framer Motion
 *
 * Exports: ProgressBar
 * Features: Animação suave, cores VFIT blue, 3D depth effect
 */

// ============================================
// ProgressBar — Barra de progresso animada
// Framer Motion + VFIT blue colors + 3D depth
// ============================================

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  height?: number
  showPercentage?: boolean
  animated?: boolean
}

export function ProgressBar({
  progress,
  className,
  height = 8,
  showPercentage = false,
  animated = true
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className={cn('relative w-full', className)}>
      {/* Background track */}
      <div
        className="w-full rounded-full bg-vfit-secondary-200 dark:bg-vfit-secondary-800"
        style={{ height }}
      />

      <motion.div
        className="absolute top-0 left-0 rounded-full bg-linear-to-r from-vfit-primary-500 to-vfit-primary-600 shadow-lg"
        style={{ height }}
        initial={{ width: 0 }}
        animate={{ width: animated ? `${clampedProgress}%` : `${clampedProgress}%` }}
        transition={{
          duration: animated ? 0.8 : 0,
          ease: 'easeOut',
          delay: animated ? 0.1 : 0
        }}
      />

      {/* 3D depth effect overlay */}
      <div
        className="absolute top-0 left-0 rounded-full bg-linear-to-r from-white/20 to-transparent opacity-60"
        style={{
          height,
          width: `${clampedProgress}%`,
          transition: 'width 0.8s ease-out'
        }}
      />

      {/* Percentage text (optional) */}
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs font-semibold text-vfit-primary-700 dark:text-vfit-primary-200">
            {Math.round(clampedProgress)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}
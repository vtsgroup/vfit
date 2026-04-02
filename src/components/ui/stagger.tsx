/**
 * src/components/ui/stagger.tsx
 *
 * Stagger — Animation wrapper for list items
 *
 * Exports: Stagger, StaggerItem
 * Features: 'use client' · Framer Motion
 */

// ============================================
// Stagger — Animation wrapper for list items
// Provides stagger-in animation for children
// ============================================

'use client'

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

interface StaggerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper that staggers the entrance animation of its children.
 * Each direct child will animate in with a slight delay.
 *
 * Usage:
 * ```tsx
 * <Stagger className="grid grid-cols-2 gap-4">
 *   <StaggerItem><Card /></StaggerItem>
 *   <StaggerItem><Card /></StaggerItem>
 * </Stagger>
 * ```
 */
export function Stagger({ children, className, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }: StaggerProps) {
  return (
    <motion.div variants={itemVariants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  )
}

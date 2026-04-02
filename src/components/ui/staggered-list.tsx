/**
 * src/components/ui/staggered-list.tsx
 *
 * StaggeredList — Animated list entrance
 *
 * Exports: StaggeredList, StaggeredItem
 * Hooks: useReducedMotion
 * Features: 'use client' · Framer Motion
 */

// ============================================
// StaggeredList — Animated list entrance
// Items animate in one-by-one with spring physics
// ============================================

'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
      mass: 0.8,
    },
  },
}

interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  /** Override stagger delay between items (default: 0.05s) */
  staggerDelay?: number
}

export function StaggeredList({
  children,
  className = 'space-y-2',
  staggerDelay,
}: StaggeredListProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const container = staggerDelay
    ? {
        ...containerVariants,
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.02,
          },
        },
      }
    : containerVariants

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Wrap a single item for use inside StaggeredList */
export function StaggeredItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

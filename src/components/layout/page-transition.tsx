/**
 * src/components/layout/page-transition.tsx
 *
 * PageTransition — Cinematic route transitions
 *
 * Exports: PageTransition
 * Hooks: useReducedMotion, usePathname
 * Features: 'use client' · Framer Motion
 */

// ============================================
// PageTransition — Cinematic route transitions
// MD3 + Apple-style spring physics with blur
// ============================================

'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 30,
        mass: 0.75,
        opacity: { duration: 0.25, ease: 'easeOut' },
      }}
    >
      {children}
    </motion.div>
  )
}

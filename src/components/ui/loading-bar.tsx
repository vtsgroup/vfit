/**
 * src/components/ui/loading-bar.tsx
 *
 * LoadingBar — NProgress-style thin green bar
 *
 * Exports: LoadingBar
 * Hooks: useEffect, useState, useCallback, usePathname, useSearchParams
 * Features: 'use client' · Framer Motion
 */

// ============================================
// LoadingBar — NProgress-style thin green bar
// Shows on route changes at viewport top
// ============================================

'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const start = useCallback(() => {
    setLoading(true)
    setProgress(0)

    // Simulate progress
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15
      if (p >= 90) {
        clearInterval(interval)
        p = 90
      }
      setProgress(p)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const done = useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 200)
  }, [])

  useEffect(() => {
    done()
  }, [pathname, searchParams, done])

  // Listen for navigation start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor?.href && !anchor.target && !anchor.download) {
        try {
          const url = new URL(anchor.href, window.location.origin)
          if (url.origin === window.location.origin && url.pathname !== pathname) {
            start()
          }
        } catch {
          // href inválido / esquema não suportado — não derrubar a UI
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname, start])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed left-0 right-0 z-100 h-[2.5px]"
          style={{ top: 'var(--demo-banner-offset, 0px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full bg-brand-primary"
            style={{ 
              boxShadow: '0 0 10px rgba(0, 217, 142, 0.5), 0 0 5px rgba(0, 217, 142, 0.3)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

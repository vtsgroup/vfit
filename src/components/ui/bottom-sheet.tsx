/**
 * src/components/ui/bottom-sheet.tsx
 *
 * BottomSheet — Responsive modal component
 *
 * Exports: BottomSheet
 * Hooks: useRef, useEffect, useCallback, useDragControls
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// BottomSheet — Responsive modal component
// Mobile (<640px): slides up from bottom with drag-to-dismiss
// Desktop (>=640px): centered modal with backdrop
// ============================================

'use client'

import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DSIcon } from '@/components/ui/ds-icon'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  /** Max width on desktop (default: max-w-lg) */
  maxWidth?: string
  /** Show drag handle on mobile (default: true) */
  showHandle?: boolean
  /** Show close X button (default: true) */
  showClose?: boolean
  /** Additional className for the sheet container */
  className?: string
}

const DISMISS_THRESHOLD = 100 // px drag distance to dismiss

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  maxWidth = 'max-w-lg',
  showHandle = true,
  showClose = true,
  className,
}: BottomSheetProps) {
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_THRESHOLD) {
        onClose()
      }
    },
    [onClose],
  )

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet — mobile: bottom sheet / desktop: centered modal */}
          <motion.div
            ref={sheetRef}
            className={cn(
              // Shared
              'relative z-10 w-full overflow-hidden border border-border-light bg-bg-secondary shadow-2xl',
              // Mobile: bottom sheet
              'rounded-t-2xl sm:rounded-2xl',
              // Mobile: max 85% height, scrollable content
              'max-h-[85dvh] sm:max-h-[90vh]',
              // Desktop: constrained width
              maxWidth,
              className,
            )}
            // Mobile: slide up animation / Desktop: scale up
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 350,
              mass: 0.8,
            }}
            // Drag to dismiss (mobile only via CSS pointer-events)
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle — mobile only */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full dark:bg-white/20 light:bg-slate-300" />
              </div>
            )}

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 pt-3 pb-2">
                {title && (
                  <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors dark:hover:bg-white/8 light:hover:bg-black/5 hover:text-text-primary"
                    aria-label="Fechar"
                  >
                    <DSIcon name="x" size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content — scrollable */}
            <div className="overflow-y-auto overscroll-contain px-5 pb-5" style={{ maxHeight: 'calc(85dvh - 4rem)' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

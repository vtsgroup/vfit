/**
 * src/components/ui/modal.tsx
 *
 * Modal — Shared modal with createPortal
 *
 * Exports: Modal
 * Hooks: useEffect
 * Features: 'use client' · DSIcon
 */

// ============================================
// Modal — Shared modal with createPortal
// Renders into document.body to escape any
// transform/filter stacking contexts (e.g. PageTransition)
// ============================================

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  /** Max width class. Default: max-w-md */
  maxWidth?: string
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // ESC close
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  // Auto-focus dialog on mount
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      {/* Backdrop — frosted scrim */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'fade-in 180ms ease-out both' }}
      />
      {/* Content panel — spring entrance */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative z-10 w-full ${maxWidth} rounded-2xl border border-border-light bg-bg-secondary/98 shadow-elevated backdrop-blur-2xl max-h-[90vh] overflow-y-auto outline-none`}
        style={{
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
          animation: 'ds-entrance-spring 380ms cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.08) inset',
        }}
      >
        {/* Top specular edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-white/10 to-transparent" />
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-bg-secondary/95 px-6 py-4 backdrop-blur-xl rounded-t-2xl">
          <h3 id="modal-title" className="font-syne text-base font-bold tracking-tight text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-all duration-150 hover:bg-bg-tertiary hover:text-text-primary active:scale-95"
            aria-label="Fechar"
          >
            <DSIcon name="x" size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

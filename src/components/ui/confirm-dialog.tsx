/**
 * src/components/ui/confirm-dialog.tsx
 *
 * ConfirmDialog — Modal de confirmação reutilizável (DS v4)
 *
 * Substitui window.confirm() com UX consistente:
 * - Glassmorphism + backdrop blur
 * - Focus trap + ESC close + body scroll lock
 * - Ícone contextual (danger, warning, info)
 * - Botões DS com variantes corretas
 *
 * @example
 * ```tsx
 * const [confirmOpen, setConfirmOpen] = useState(false)
 *
 * <ConfirmDialog
 *   open={confirmOpen}
 *   onClose={() => setConfirmOpen(false)}
 *   onConfirm={() => { deleteMutation.mutate(); setConfirmOpen(false) }}
 *   title="Excluir item"
 *   description="Esta ação é irreversível. O item será removido permanentemente."
 *   confirmText="Sim, excluir"
 *   cancelText="Cancelar"
 *   variant="danger"
 *   loading={deleteMutation.isPending}
 * />
 * ```
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

// ============================================
// Types
// ============================================

type ConfirmVariant = 'danger' | 'warning' | 'info'

export interface ConfirmDialogProps {
  /** Controle de visibilidade */
  open: boolean
  /** Callback ao fechar (ESC, backdrop, cancelar) */
  onClose: () => void
  /** Callback ao confirmar */
  onConfirm: () => void
  /** Título do diálogo */
  title: string
  /** Descrição/mensagem */
  description?: string
  /** Texto do botão de confirmar. Default: "Confirmar" */
  confirmText?: string
  /** Texto do botão de cancelar. Default: "Cancelar" */
  cancelText?: string
  /** Variante visual. Default: "danger" */
  variant?: ConfirmVariant
  /** Estado de loading (desabilita botões) */
  loading?: boolean
}

// ============================================
// Variant configs
// ============================================

const variantConfig: Record<ConfirmVariant, {
  icon: DSIconName
  iconBg: string
  iconColor: string
  buttonVariant: 'danger' | 'primary'
}> = {
  danger: {
    icon: 'alertTriangle',
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
    buttonVariant: 'danger',
  },
  warning: {
    icon: 'alertTriangle',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    buttonVariant: 'primary',
  },
  info: {
    icon: 'info',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    buttonVariant: 'primary',
  },
}

// ============================================
// Component
// ============================================

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const config = variantConfig[variant]

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])

  // ESC close
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, loading])

  // Auto-focus dialog
  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
        style={{ animation: 'fade-in 150ms ease-out both' }}
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border-light bg-bg-secondary/98 p-6 shadow-elevated backdrop-blur-2xl outline-none"
        style={{
          animation: 'ds-entrance-spring 300ms cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
            <DSIcon name={config.icon} size={24} className={config.iconColor} />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 text-center">
          <h3 id="confirm-title" className="text-base font-bold text-text-primary">
            {title}
          </h3>
          {description && (
            <p id="confirm-desc" className="mt-2 text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>

        {/* Actions — Cancelar à esquerda, Confirmar à direita (padrão DS) */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

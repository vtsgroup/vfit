/**
 * src/components/assessments/signature-pad.tsx
 *
 * Digital Signature Pad — S11-06
 *
 * Exports: SignaturePad, SignedBadge
 * Hooks: useRef, useState, useEffect, useCallback
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Digital Signature Pad — S11-06
// Canvas-based signature capture for assessments
// ============================================

'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  onSign: (signatureDataUrl: string) => void
  onCancel: () => void
  personalName: string
  cref?: string
  isSigning?: boolean
}

export function SignaturePad({ onSign, onCancel, personalName, cref, isSigning }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (2x for retina)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Style
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Signature line
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()

    // Reset stroke style
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 2.5
  }, [])

  const getPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }, [getPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !lastPos.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
    setHasSignature(true)
  }, [isDrawing, getPos])

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Redraw signature line
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()

    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 2.5
    setHasSignature(false)
  }

  function handleConfirm() {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    const dataUrl = canvas.toDataURL('image/png')
    onSign(dataUrl)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl border border-border-light bg-bg-secondary shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-light p-4">
            <div className="flex items-center gap-2">
              <DSIcon name="shield" size={20} className="text-brand-primary" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Assinatura Digital</h3>
                <p className="text-[10px] text-text-muted">Aprovação do Personal Trainer</p>
              </div>
            </div>
            <button onClick={onCancel} className="rounded-lg p-1.5 text-text-muted hover:bg-black/8 dark:hover:bg-white/8">
              <DSIcon name="x" size={16} />
            </button>
          </div>

          {/* Info */}
          <div className="px-4 pt-3">
            <div className="rounded-lg bg-brand-primary/5 border border-brand-primary/10 p-3 text-xs text-text-secondary">
              <p className="font-medium text-text-primary">{personalName}</p>
              {cref && <p className="text-text-muted">CREF: {cref}</p>}
              <p className="mt-1 text-[10px] text-text-muted">
                {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })} às {new Date().toLocaleTimeString('pt-BR', { timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {/* Canvas */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted flex items-center gap-1">
                <DSIcon name="penLine" size={12} />
                Desenhe sua assinatura abaixo
              </p>
              <button
                onClick={clearSignature}
                className="flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary"
              >
                <DSIcon name="eraser" size={12} />
                Limpar
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className={cn(
                'h-32 w-full cursor-crosshair rounded-xl border bg-bg-primary touch-none',
                isDrawing ? 'border-brand-primary' : 'border-border-light'
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border-light p-4">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="workout"
              className="flex-1"
              onClick={handleConfirm}
              disabled={!hasSignature || isSigning}
              loading={isSigning}
            >
              <DSIcon name="checkCircle2" size={16} />
              Aprovar e Assinar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Signed badge for display in assessment detail/PDF
 */
export function SignedBadge({ signedAt, personalName, cref }: {
  signedAt: string
  personalName: string
  cref?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
        <DSIcon name="shield" size={20} className="text-brand-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brand-primary">✓ Assinado Digitalmente</p>
        <p className="text-[10px] text-text-muted truncate">
          {personalName}{cref ? ` · CREF ${cref}` : ''} · {new Date(signedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  )
}

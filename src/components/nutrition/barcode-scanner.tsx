/**
 * src/components/nutrition/barcode-scanner.tsx
 *
 * BarcodeScanner — Leitor de código de barras via câmera usando a API nativa
 * BarcodeDetector (Chrome/Edge/Samsung) com fallback gracioso.
 *
 * Detecta EAN-13, EAN-8, UPC-A, QR Code automaticamente por frame a cada 300ms.
 *
 * Sprint 14 — Scanner & Macro Ring
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────

interface BarcodeResult {
  rawValue: string
  format: string
}

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
  className?: string
}

// ── BarcodeDetector types (não incluídas no TS lib por padrão) ─────────────

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] })
  detect(source: HTMLVideoElement | HTMLImageElement | ImageBitmap): Promise<BarcodeResult[]>
  static getSupportedFormats(): Promise<string[]>
}

// ── Component ──────────────────────────────────────────

export function BarcodeScanner({ onDetected, onClose, className }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const animRef = useRef<number | null>(null)
  const lastScanRef = useRef<number>(0)

  const [status, setStatus] = useState<'loading' | 'scanning' | 'unsupported' | 'error'>('loading')
  const [detected, setDetected] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [showManual, setShowManual] = useState(false)

  // ── Scan loop ─────────────────────────────────────────

  const scanFrame = useCallback(async () => {
    const video = videoRef.current
    const detector = detectorRef.current
    if (!video || !detector || video.readyState < 2) {
      animRef.current = requestAnimationFrame(scanFrame)
      return
    }

    const now = performance.now()
    if (now - lastScanRef.current < 300) {
      animRef.current = requestAnimationFrame(scanFrame)
      return
    }
    lastScanRef.current = now

    try {
      const results = await detector.detect(video)
      if (results.length > 0) {
        const code = results[0].rawValue
        setDetected(code)
        // Breve delay para mostrar feedback visual antes de fechar
        setTimeout(() => {
          onDetected(code)
        }, 500)
        return // Para o loop após detecção
      }
    } catch {
      // Frame inválido — continua
    }

    animRef.current = requestAnimationFrame(scanFrame)
  }, [onDetected])

  // ── Inicializar câmera ────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function start() {
      // Verificar suporte
      if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
        setStatus('unsupported')
        setShowManual(true)
        return
      }

      try {
        detectorRef.current = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        })

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }

        setStatus('scanning')
        animRef.current = requestAnimationFrame(scanFrame)
      } catch {
        if (!cancelled) {
          setStatus('error')
          setShowManual(true)
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      if (animRef.current) cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [scanFrame])

  // ── Render ────────────────────────────────────────────

  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col bg-black', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 absolute top-0 inset-x-0 z-10 bg-linear-to-b from-black/70 to-transparent">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
        >
          <DSIcon name="x" size={18} className="text-white" />
        </button>
        <h2 className="text-sm font-bold text-white">Escanear código</h2>
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-xs font-medium text-brand-primary"
        >
          Manual
        </button>
      </div>

      {/* Video */}
      {(status === 'scanning' || status === 'loading') && (
        <div className="relative flex-1">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />

          {/* Viewfinder overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Canto superior esquerdo */}
              <div className="absolute -top-px -left-px h-8 w-8 border-t-2 border-l-2 border-brand-primary rounded-tl-lg" />
              {/* Canto superior direito */}
              <div className="absolute -top-px -right-px h-8 w-8 border-t-2 border-r-2 border-brand-primary rounded-tr-lg" />
              {/* Canto inferior esquerdo */}
              <div className="absolute -bottom-px -left-px h-8 w-8 border-b-2 border-l-2 border-brand-primary rounded-bl-lg" />
              {/* Canto inferior direito */}
              <div className="absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-brand-primary rounded-br-lg" />

              {/* Linha de scan animada */}
              <div className={cn(
                'w-72 h-40 relative overflow-hidden',
                detected && 'border-brand-primary'
              )}>
                {status === 'scanning' && !detected && (
                  <div className="absolute inset-x-0 h-0.5 bg-linear-to-r from-transparent via-brand-primary to-transparent animate-scan-line" />
                )}
              </div>
            </div>
          </div>

          {/* Instrução */}
          <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2">
            {detected ? (
              <div className="flex items-center gap-2 rounded-full bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 px-4 py-2">
                <DSIcon name="check" size={16} className="text-brand-primary" />
                <span className="text-sm font-bold text-brand-primary">Código detectado!</span>
              </div>
            ) : (
              <p className="text-center text-xs text-white/60 px-8">
                Aponte a câmera para o código de barras do alimento
              </p>
            )}
          </div>

          {/* Loading overlay */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          )}
        </div>
      )}

      {/* Unsupported / Error state */}
      {(status === 'unsupported' || status === 'error') && (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/6 mb-4">
            <DSIcon name="scan" size={28} className="text-zinc-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {status === 'unsupported'
              ? 'Câmera não suportada'
              : 'Erro ao acessar câmera'}
          </h3>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
            {status === 'unsupported'
              ? 'Seu navegador não suporta leitura de código de barras. Use a entrada manual abaixo.'
              : 'Não foi possível acessar a câmera. Verifique as permissões e tente novamente.'}
          </p>
        </div>
      )}

      {/* Manual code entry */}
      {showManual && (
        <div className="border-t border-white/8 bg-zinc-950 px-4 py-4">
          <p className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Inserir código manualmente
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 7891000100103"
              maxLength={14}
              className="flex-1 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-primary/50"
            />
            <Button
              size="sm"
              onClick={() => {
                if (manualCode.length >= 8) onDetected(manualCode)
              }}
              disabled={manualCode.length < 8}
            >
              Buscar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

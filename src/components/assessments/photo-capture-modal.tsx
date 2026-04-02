// ============================================
// photo-capture-modal.tsx — Modal de captura de foto via câmera
// ============================================
//
// O que faz:
//   Abre câmera do dispositivo via getUserMedia e permite capturar foto.
//   Overlay com guia de posicionamento (frente/lado/costas) por CapturePosition.
//   Captura como Blob e converte para File para upload.
//   Fallback para file input em dispositivos sem câmera.
//
// Exports principais:
//   CapturePosition — tipo: 'front' | 'side' | 'back'
//   PhotoCaptureModal — modal de captura com preview e botão de captura
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

export type CapturePosition = 'front' | 'side' | 'back'

export function PhotoCaptureModal({
  open,
  position,
  title,
  onClose,
  onCaptured,
}: {
  open: boolean
  position: CapturePosition
  title: string
  onClose: () => void
  onCaptured: (file: File) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const overlay = useMemo(() => {
    // overlay simples (SVG) — o objetivo é ajudar alinhamento (silhueta/guia)
    if (position === 'side') {
      return (
        <svg viewBox="0 0 100 200" className="absolute inset-0 h-full w-full">
          <path
            d="M52 18c6 0 11 5 11 11 0 7-4 13-4 18 0 11 7 19 7 35 0 10-4 18-6 28-2 10 2 16 2 26 0 10-8 18-18 18s-18-8-18-18c0-10 5-16 5-26 0-10-4-18-4-28 0-16 7-24 7-35 0-5-4-11-4-18 0-6 5-11 11-11h11z"
            fill="none"
            stroke="rgba(61,252,164,0.75)"
            strokeWidth="1.4"
          />
          <path d="M10 60h80" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
          <path d="M10 110h80" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
          <path d="M10 160h80" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
        </svg>
      )
    }

    // front/back
    return (
      <svg viewBox="0 0 100 200" className="absolute inset-0 h-full w-full">
        <path
          d="M50 14c9 0 16 7 16 16 0 9-6 16-10 20l6 18c3 10 6 18 6 30 0 19-12 34-12 52 0 16-3 32-6 32s-6-16-6-32c0-18-12-33-12-52 0-12 3-20 6-30l6-18c-4-4-10-11-10-20 0-9 7-16 16-16z"
          fill="none"
          stroke="rgba(61,252,164,0.75)"
          strokeWidth="1.4"
        />
        <path d="M50 0v200" stroke="rgba(148,163,184,0.45)" strokeWidth="0.6" />
        <path d="M0 60h100" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
        <path d="M0 110h100" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
        <path d="M0 160h100" stroke="rgba(148,163,184,0.55)" strokeWidth="0.6" />
      </svg>
    )
  }, [position])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function start() {
      setReady(false)
      setError(null)

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Câmera não suportada neste dispositivo')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }

        setReady(true)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      }
    }

    start()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [open])

  if (!open) return null

  async function capture() {
    const video = videoRef.current
    if (!video) return

    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720

    // A UI exibe em 9:16 com object-cover. Para a foto ficar igual ao preview,
    // recortamos o frame do vídeo para 9:16 centralizado.
    const targetAspect = 9 / 16
    const videoAspect = w / h

    let sx = 0
    let sy = 0
    let sw = w
    let sh = h

    if (videoAspect > targetAspect) {
      // vídeo mais largo: recorta laterais
      sw = Math.round(h * targetAspect)
      sx = Math.round((w - sw) / 2)
    } else if (videoAspect < targetAspect) {
      // vídeo mais alto: recorta topo/base
      sh = Math.round(w / targetAspect)
      sy = Math.round((h - sh) / 2)
    }

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return

    const file = new File([blob], `photo-${position}-${Date.now()}.jpg`, { type: 'image/jpeg' })
    onCaptured(file)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border-light bg-bg-secondary shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-xs text-text-muted">Alinhe com a guia e capture</p>
          </div>
          <Button variant="outline" size="icon" onClick={onClose}>
            <DSIcon name="x" size={16} />
          </Button>
        </div>

        <div className="relative aspect-9/16 bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

          <div className="pointer-events-none absolute inset-0">
            {overlay}
          </div>

          {!ready && !error && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-sm font-semibold text-error">Não foi possível abrir a câmera</p>
                <p className="mt-1 text-xs text-text-muted">{error}</p>
                <p className="mt-3 text-xs text-text-muted">Use “Galeria” como alternativa.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 p-4">
          <Button variant="outline" onClick={() => {
            // restart
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            setReady(false)
            setError(null)
            // trigger re-open by toggling state in parent; parent can just close/open again.
            onClose()
          }}>
            <DSIcon name="rotateCcw" size={16} className="mr-1.5" /> Reiniciar
          </Button>

          <Button variant="primary" disabled={!ready || !!error} onClick={capture}>
            <DSIcon name="camera" size={16} className="mr-1.5" /> Capturar
          </Button>
        </div>
      </div>
    </div>
  )
}

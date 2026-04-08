/**
 * src/components/nutrition/food-camera.tsx
 *
 * FoodCamera — Captura foto via câmera e identifica alimentos por Vision AI.
 *
 * Usa PhotoCaptureModal (existente) para captura e envia base64 para
 * POST /vfit/food-identify. Retorna sugestões de alimentos para busca.
 *
 * Sprint 14 — Scanner & Macro Ring
 */
'use client'

import { useState } from 'react'
import { PhotoCaptureModal } from '@/components/assessments/photo-capture-modal'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────

interface FoodSuggestion {
  name: string
  confidence: number
}

interface FoodCameraProps {
  onSearch: (query: string) => void
  onClose: () => void
}

// ── Helpers ────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Remove data URL prefix → só base64
      const base64 = result.split(',')[1] ?? result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Component ──────────────────────────────────────────

export function FoodCamera({ onSearch, onClose }: FoodCameraProps) {
  const [showCapture, setShowCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleCapture(file: File) {
    setShowCapture(false)
    setLoading(true)
    setError(null)
    setSuggestions([])

    try {
      const base64 = await fileToBase64(file)

      const res = await api.post<{
        suggestions: FoodSuggestion[]
        search_query: string
      }>('/vfit/food-identify', {
        image_base64: base64,
        mime_type: file.type || 'image/jpeg',
      })

      const data = res.data
      setSuggestions(data.suggestions ?? [])
    } catch {
      setError('Não foi possível identificar o alimento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Camera modal */}
      <PhotoCaptureModal
        open={showCapture}
        position="front"
        title="Fotografar alimento"
        onClose={() => setShowCapture(false)}
        onCaptured={handleCapture}
      />

      {/* Resultado */}
      <div className="flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <p className="text-sm text-zinc-400">Identificando alimento com IA…</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Alimentos identificados
            </p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSearch(s.name)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                  i === 0
                    ? 'border-brand-primary/25 bg-brand-primary/8'
                    : 'border-white/6 bg-white/3 hover:bg-white/6'
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-zinc-500">
                    {Math.round(s.confidence * 100)}% de confiança
                  </p>
                </div>
                <DSIcon name="search" size={16} className="text-brand-primary shrink-0" />
              </button>
            ))}

            {/* Botão de nova foto */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setSuggestions([]); setShowCapture(true) }}
                className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/6"
              >
                <DSIcon name="camera" size={14} className="inline mr-1.5 -mt-0.5" />
                Nova foto
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/8 bg-white/3 py-2.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/6"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
              <DSIcon name="camera" size={28} className="text-brand-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">Fotografar alimento</p>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-56">
                A IA identifica o alimento pela foto e busca automaticamente
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="flex-1"
                onClick={() => setShowCapture(true)}
              >
                <DSIcon name="camera" size={16} />
                Abrir câmera
              </Button>
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

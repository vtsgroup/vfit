/**
 * src/components/share/share-card.tsx
 *
 * Componente de card compartilhável — renderiza em canvas
 * Templates: treino concluído, personal record, streak, evolução
 */

'use client'

import { useRef, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { shareCanvasImage, copyImageToClipboard } from '@/lib/share'

// ============================================
// Template types
// ============================================

export interface WorkoutShareData {
  type: 'workout'
  exercises: number
  duration_min: number
  volume_kg: number
  xp: number
  date: string
}

export interface RecordShareData {
  type: 'record'
  exercise_name: string
  weight_kg: number
  reps: number
  date: string
}

export interface StreakShareData {
  type: 'streak'
  days: number
  milestone: number // 7, 30, 100
}

export type ShareCardData = WorkoutShareData | RecordShareData | StreakShareData

interface ShareCardProps {
  data: ShareCardData
  onClose?: () => void
}

// ============================================
// Component
// ============================================

export function ShareCard({ data, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Draw card on canvas when visible
  const drawCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    canvasRef.current = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 1080
    const h = 1080
    canvas.width = w
    canvas.height = h

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#050A12')
    gradient.addColorStop(1, '#0B1221')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // Border accent
    ctx.strokeStyle = '#22C55E'
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, w - 80, h - 80)

    // Brand text
    ctx.fillStyle = '#22C55E'
    ctx.font = 'bold 36px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VFIT', w / 2, 120)

    ctx.fillStyle = '#64748B'
    ctx.font = '24px -apple-system, sans-serif'
    ctx.fillText('Evolua com inteligência', w / 2, 160)

    // Content based on type
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'

    if (data.type === 'workout') {
      // Emoji
      ctx.font = '120px -apple-system, sans-serif'
      ctx.fillText('💪', w / 2, 350)

      ctx.font = 'bold 48px -apple-system, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText('Treino concluído!', w / 2, 460)

      // Stats
      const stats = [
        { label: 'Exercícios', value: `${data.exercises}` },
        { label: 'Duração', value: `${data.duration_min} min` },
        { label: 'Volume', value: `${data.volume_kg} kg` },
        { label: 'XP ganho', value: `+${data.xp}` },
      ]

      stats.forEach((stat, i) => {
        const x = i % 2 === 0 ? w / 2 - 180 : w / 2 + 180
        const y = i < 2 ? 580 : 720

        ctx.fillStyle = '#22C55E'
        ctx.font = 'bold 56px -apple-system, sans-serif'
        ctx.fillText(stat.value, x, y)

        ctx.fillStyle = '#94A3B8'
        ctx.font = '28px -apple-system, sans-serif'
        ctx.fillText(stat.label, x, y + 40)
      })

      ctx.fillStyle = '#475569'
      ctx.font = '24px -apple-system, sans-serif'
      ctx.fillText(data.date, w / 2, 900)
    }

    if (data.type === 'record') {
      ctx.font = '120px -apple-system, sans-serif'
      ctx.fillText('🏆', w / 2, 340)

      ctx.font = 'bold 44px -apple-system, sans-serif'
      ctx.fillStyle = '#F59E0B'
      ctx.fillText('NOVO RECORDE!', w / 2, 440)

      ctx.font = 'bold 36px -apple-system, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(data.exercise_name, w / 2, 530)

      ctx.font = 'bold 72px -apple-system, sans-serif'
      ctx.fillStyle = '#22C55E'
      ctx.fillText(`${data.weight_kg}kg × ${data.reps}`, w / 2, 660)

      ctx.fillStyle = '#475569'
      ctx.font = '24px -apple-system, sans-serif'
      ctx.fillText(data.date, w / 2, 800)
    }

    if (data.type === 'streak') {
      ctx.font = '120px -apple-system, sans-serif'
      ctx.fillText('🔥', w / 2, 340)

      ctx.font = 'bold 44px -apple-system, sans-serif'
      ctx.fillStyle = '#F97316'
      ctx.fillText(`${data.milestone} DIAS DE SEQUÊNCIA!`, w / 2, 450)

      ctx.font = 'bold 120px -apple-system, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(`${data.days}`, w / 2, 630)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '32px -apple-system, sans-serif'
      ctx.fillText('dias consecutivos', w / 2, 690)
    }

    // Watermark
    ctx.fillStyle = '#1E293B'
    ctx.font = '20px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('iapersonal.app.br', w / 2, h - 60)
  }, [data])

  const handleShare = async () => {
    if (!canvasRef.current) return
    const title = data.type === 'workout'
      ? 'Treino concluído!'
      : data.type === 'record'
      ? 'Novo recorde pessoal!'
      : `${(data as StreakShareData).days} dias de sequência!`

    await shareCanvasImage(canvasRef.current, title, 'Treinando com VFIT 💪')
  }

  const handleCopy = async () => {
    if (!canvasRef.current) return
    await copyImageToClipboard(canvasRef.current)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm">
        {/* Preview */}
        <div className="mb-4 overflow-hidden rounded-2xl">
          <canvas
            ref={drawCanvas}
            className="w-full"
            style={{ aspectRatio: '1/1' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleShare}>
            <DSIcon name="share2" size={16} />
            Compartilhar
          </Button>
          <button
            onClick={handleCopy}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
          >
            <DSIcon name="clipboardList" size={18} className="text-zinc-400" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
            >
              <DSIcon name="close" size={18} className="text-zinc-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

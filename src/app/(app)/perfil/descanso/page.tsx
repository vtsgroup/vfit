/**
 * src/app/(app)/perfil/descanso/page.tsx
 *
 * Tempo de descanso padrão entre séries
 * Slider de 15s a 300s (5min) com presets rápidos
 * Persistência via localStorage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

const STORAGE_KEY = 'vfit_rest_seconds'
const DEFAULT_REST = 60

const PRESETS = [
  { seconds: 30, label: '30s', desc: 'HIIT / Cardio' },
  { seconds: 60, label: '1 min', desc: 'Padrão' },
  { seconds: 90, label: '1:30', desc: 'Hipertrofia' },
  { seconds: 120, label: '2 min', desc: 'Força' },
  { seconds: 180, label: '3 min', desc: 'Força máxima' },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m} min`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DescansoPage() {
  const router = useRouter()
  const [rest, setRest] = useState(DEFAULT_REST)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setRest(parseInt(saved, 10) || DEFAULT_REST)
  }, [])

  const handleChange = (value: number) => {
    setRest(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Tempo de Descanso</h1>
          <p className="text-[11px] text-zinc-500">Intervalo padrão entre séries</p>
        </div>
      </div>

      {/* Current value display */}
      <div className="mb-6 flex flex-col items-center rounded-2xl bg-white/4 py-8">
        <span className="text-5xl font-black text-brand-primary">{formatTime(rest)}</span>
        <span className="mt-2 text-xs text-zinc-500">descanso entre séries</span>
      </div>

      {/* Slider */}
      <div className="mb-6 px-2">
        <input
          type="range"
          min={15}
          max={300}
          step={5}
          value={rest}
          onChange={(e) => {
            hapticLight()
            handleChange(parseInt(e.target.value, 10))
          }}
          className="w-full accent-brand-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
          <span>15s</span>
          <span>5 min</span>
        </div>
      </div>

      {/* Presets */}
      <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
        Presets rápidos
      </p>
      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.seconds}
            onClick={() => {
              hapticLight()
              handleChange(p.seconds)
            }}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-all',
              rest === p.seconds
                ? 'bg-brand-primary/15 ring-1 ring-brand-primary/30'
                : 'bg-white/4 hover:bg-white/6'
            )}
          >
            <span className={cn(
              'text-sm font-bold',
              rest === p.seconds ? 'text-brand-primary' : 'text-white'
            )}>
              {p.label}
            </span>
            <span className="text-[9px] text-zinc-500">{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-primary/90 active:scale-[0.98]"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </button>
    </div>
  )
}

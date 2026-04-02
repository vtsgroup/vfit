/**
 * src/components/treino/rest-timer.tsx
 *
 * Timer circular de descanso entre sets.
 * Ativa automaticamente após completar um set.
 * Vibração + som ao finalizar.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { hapticHeavy } from '@/lib/haptics'

interface RestTimerProps {
  seconds: number
  onComplete: () => void
  onSkip: () => void
  onAdjust: (delta: number) => void
}

export function RestTimer({ seconds, onComplete, onSkip, onAdjust }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [total] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      hapticHeavy()
      onComplete()
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onComplete])

  const progress = 1 - remaining / total
  const circumference = 2 * Math.PI * 54 // radius=54
  const strokeDashoffset = circumference * (1 - progress)

  const formatTime = useCallback((s: number): string => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg-primary/95 backdrop-blur-xl">
      {/* Title */}
      <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Descanso
      </p>

      {/* Circular timer */}
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-bg-tertiary"
          />
          {/* Progress circle */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-brand-primary transition-all duration-1000"
          />
        </svg>
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black tabular-nums text-text-primary">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Adjust buttons */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onAdjust(-15)}
          className="flex h-10 w-16 items-center justify-center rounded-xl bg-bg-secondary text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => onAdjust(15)}
          className="flex h-10 w-16 items-center justify-center rounded-xl bg-bg-secondary text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
        >
          +15s
        </button>
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={onSkip}
        className="mt-6 rounded-xl bg-brand-primary/10 px-8 py-3 text-sm font-bold text-brand-primary hover:bg-brand-primary/20 transition-colors"
      >
        Pular Descanso
      </button>
    </div>
  )
}

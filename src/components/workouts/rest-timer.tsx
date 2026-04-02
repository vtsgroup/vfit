/**
 * src/components/workouts/rest-timer.tsx
 *
 * Rest Timer — Countdown circular entre séries
 *
 * Exports: RestTimer
 * Hooks: useState, useEffect, useRef, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// Rest Timer — Countdown circular entre séries
// ============================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

interface RestTimerProps {
  totalSeconds: number
  onComplete: () => void
  onSkip: () => void
  nextExerciseName?: string
}

export function RestTimer({ totalSeconds, onComplete, onSkip, nextExerciseName }: RestTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const completedRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Play a beep using Web Audio API (no external files needed)
  const playBeep = useCallback((frequency = 880, duration = 0.15, count = 3) => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = frequency
        osc.type = 'sine'
        gain.gain.value = 0.3
        const startAt = ctx.currentTime + i * 0.25
        osc.start(startAt)
        osc.stop(startAt + duration)
      }
    } catch { /* AudioContext may not be available */ }
  }, [soundEnabled])

  useEffect(() => {
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true
      // Play beep sound
      playBeep(880, 0.15, 3)
      // Vibrate on completion
      if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200]) } catch {}
      }
      onComplete()
      return
    }

    // Warning beep at 3 seconds
    if (remaining === 3 && soundEnabled) {
      playBeep(660, 0.1, 1)
    }

    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining, onComplete, soundEnabled, playBeep])

  const progress = 1 - remaining / totalSeconds
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds}`

  const timerColor =
    remaining <= 5
      ? 'text-error'
      : remaining <= 15
        ? 'text-warning'
        : 'text-brand-primary'

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-text-primary">Tempo de Descanso</h3>
        <p className="mt-1 text-sm text-text-muted">
          Recupere o fôlego para a próxima série
        </p>
      </div>

      {/* Circular timer */}
      <div className="relative h-52 w-52">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-bg-tertiary"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${timerColor} transition-all duration-1000 ease-linear`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold tabular-nums ${timerColor}`}>
            {display}
          </span>
          <span className="mt-1 text-xs text-text-muted">
            {remaining <= 5 && remaining > 0 ? 'Prepare-se!' : 'segundos'}
          </span>
        </div>
      </div>

      {/* Next exercise preview */}
      {nextExerciseName && (
        <div className="text-center">
          <p className="text-xs text-text-muted">Próximo</p>
          <p className="text-sm font-medium text-text-primary">{nextExerciseName}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <DSIcon name="volume2" size={16} />
          ) : (
            <DSIcon name="volumeX" size={16} />
          )}
        </Button>
        <Button variant="secondary" onClick={onSkip} className="gap-2">
          <DSIcon name="skipForward" size={16} />
          Pular descanso
        </Button>
      </div>
    </div>
  )
}

'use client'

/**
 * src/components/ui/countdown-timer.tsx
 *
 * CountdownTimer — Timer regressivo reutilizável
 *
 * Props: endTime (Date ou ms), onExpired, format ('mm:ss' | 'hh:mm:ss')
 * Uso: paywall urgency, ofertas, promoções
 */

import { useEffect, useState, useCallback } from 'react'

interface CountdownTimerProps {
  /** Tempo final do countdown (Date ou timestamp ms) */
  endTime: Date | number
  /** Callback quando o timer chega a 0 */
  onExpired?: () => void
  /** Formato de exibição */
  format?: 'mm:ss' | 'hh:mm:ss'
  /** Classes customizáveis */
  className?: string
  /** Estilo do dígito */
  digitClassName?: string
  /** Mostrar label "min" / "seg" */
  showLabels?: boolean
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function CountdownTimer({
  endTime,
  onExpired,
  format = 'mm:ss',
  className = '',
  digitClassName = '',
  showLabels = false,
}: CountdownTimerProps) {
  const getRemaining = useCallback(() => {
    const end = typeof endTime === 'number' ? endTime : endTime.getTime()
    return Math.max(0, Math.floor((end - Date.now()) / 1000))
  }, [endTime])

  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemaining()
      setRemaining(r)
      if (r <= 0) {
        clearInterval(interval)
        onExpired?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [getRemaining, onExpired])

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  if (showLabels) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {format === 'hh:mm:ss' && (
          <>
            <div className={`flex flex-col items-center ${digitClassName}`}>
              <span className="text-lg font-bold tabular-nums">{pad(hours)}</span>
              <span className="text-[9px] text-text-muted uppercase">hrs</span>
            </div>
            <span className="text-lg font-bold text-text-muted">:</span>
          </>
        )}
        <div className={`flex flex-col items-center ${digitClassName}`}>
          <span className="text-lg font-bold tabular-nums">{pad(minutes)}</span>
          <span className="text-[9px] text-text-muted uppercase">min</span>
        </div>
        <span className="text-lg font-bold text-text-muted">:</span>
        <div className={`flex flex-col items-center ${digitClassName}`}>
          <span className="text-lg font-bold tabular-nums">{pad(seconds)}</span>
          <span className="text-[9px] text-text-muted uppercase">seg</span>
        </div>
      </div>
    )
  }

  const display =
    format === 'hh:mm:ss'
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`

  return (
    <span className={`font-bold tabular-nums ${className}`}>
      {display}
    </span>
  )
}

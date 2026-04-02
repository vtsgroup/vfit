// ============================================
// expiring-xp-banner.tsx — Banner de alerta de XP prestes a expirar
// ============================================
//
// O que faz:
//   Banner colapsável que alerta sobre XP expirando nos próximos 7 dias.
//   Lista transações expirando com countdown individual.
//   Cores de urgência: warning (< 7 dias) → error (< 2 dias).
//   Usa useExpiringXP(7) para buscar dados.
//
// Exports principais:
//   ExpiringXPBanner — banner colapsável de alerta de XP expirando
'use client'

import { useState } from 'react'
import { useExpiringXP } from '@/hooks/use-xp'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

export function ExpiringXPBanner() {
  const expiring = useExpiringXP(7)
  const [expanded, setExpanded] = useState(false)

  // Don't show if loading, error, or no expiring XP
  if (!expiring.isSuccess || !expiring.data) return null
  if (expiring.data.total_expiring_xp === 0) return null

  const { expiring_transactions, total_expiring_xp } = expiring.data

  // Urgency level based on soonest expiry
  const soonestDays = Math.min(...expiring_transactions.map((t) => t.days_until_expiry))
  const isUrgent = soonestDays <= 2
  const isWarning = soonestDays <= 5

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-colors',
        isUrgent
          ? 'border-error/50 bg-error/5'
          : isWarning
            ? 'border-warning/50 bg-warning/5'
            : 'border-border-light bg-bg-secondary'
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <DSIcon name="alertTriangle" size={16} className="text-error animate-pulse" />
          ) : (
            <DSIcon name="clock" size={16} className="text-warning" />
          )}
          <span className={cn(
            'text-sm font-medium',
            isUrgent ? 'text-error' : 'text-warning'
          )}>
            {total_expiring_xp} XP expirando
          </span>
          <span className="text-xs text-text-muted">
            ({expiring_transactions.length} transaç{expiring_transactions.length === 1 ? 'ão' : 'ões'})
          </span>
        </div>

        <DSIcon name="chevronDown" size={16}
          className={cn(
            'text-text-muted transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Detail — expandable */}
      {expanded && (
        <div className="border-t border-border-light p-3 space-y-2">
          {expiring_transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between text-sm py-1"
            >
              <div className="flex-1">
                <p className="text-text-primary font-medium">
                  {tx.event_type.replace(/_/g, ' ')}
                </p>
                <p className={cn(
                  'text-xs',
                  tx.days_until_expiry <= 1 ? 'text-error' :
                  tx.days_until_expiry <= 3 ? 'text-warning' :
                  'text-text-muted'
                )}>
                  {tx.days_until_expiry <= 0
                    ? 'Expira hoje!'
                    : tx.days_until_expiry === 1
                      ? 'Expira amanhã'
                      : `Expira em ${tx.days_until_expiry} dias`}
                </p>
              </div>
              <span className="text-sm font-semibold text-text-muted whitespace-nowrap ml-2">
                {tx.amount} XP
              </span>
            </div>
          ))}

          <div className="pt-2 border-t border-border-light">
            <p className="text-xs text-text-muted">
              Treinar regularmente renova seus XP. Complete metas diárias para manter seu saldo.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

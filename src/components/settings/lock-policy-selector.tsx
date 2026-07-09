// ============================================
// lock-policy-selector.tsx — Seletor da política de app lock (biometria v2, B2)
// ============================================
//
// O que faz:
//   Deixa o usuário escolher com que frequência o app pede biometria ao abrir
//   (always | daily | weekly | off). Persiste via setLockPolicy (localStorage).
//   Client-only: lê a policy no mount para evitar hydration mismatch.
'use client'

import { useEffect, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { getLockPolicy, setLockPolicy } from '@/hooks/use-passkey'
import type { LockPolicy } from '@/lib/biometric-lock-policy'

const OPTIONS: { value: LockPolicy; label: string; hint: string; icon: DSIconName }[] = [
  { value: 'always', label: 'Sempre', hint: 'Toda vez que abrir', icon: 'lock' },
  { value: 'daily', label: 'Diariamente', hint: 'Uma vez por dia', icon: 'calendar' },
  { value: 'weekly', label: 'Semanalmente', hint: 'Uma vez por semana', icon: 'calendar' },
  { value: 'off', label: 'Desativado', hint: 'Nunca trancar ao abrir', icon: 'shield' },
]

export function LockPolicySelector() {
  const [policy, setPolicy] = useState<LockPolicy | null>(null)

  useEffect(() => {
    setPolicy(getLockPolicy())
  }, [])

  function choose(value: LockPolicy) {
    setLockPolicy(value)
    setPolicy(value)
  }

  // Evita flash de estado errado antes de ler o localStorage
  if (policy === null) return null

  return (
    <div className="border-t border-border-light pt-3">
      <p className="mb-1 text-xs font-semibold text-text-primary">Pedir biometria ao abrir</p>
      <p className="mb-3 text-[11px] text-text-muted">
        Escolha com que frequência confirmar sua identidade ao abrir o app.
      </p>
      <div role="radiogroup" aria-label="Frequência do desbloqueio biométrico" className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const active = policy === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(opt.value)}
              className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? 'border-brand-primary/60 bg-brand-primary/10'
                  : 'border-border-light bg-bg-primary hover:border-brand-primary/30'
              }`}
            >
              <DSIcon
                name={active ? 'checkCircle2' : opt.icon}
                size={15}
                className={active ? 'mt-0.5 text-brand-primary' : 'mt-0.5 text-text-muted'}
              />
              <span className="min-w-0">
                <span className={`block text-xs font-semibold ${active ? 'text-brand-primary' : 'text-text-primary'}`}>
                  {opt.label}
                </span>
                <span className="block text-[10px] text-text-muted">{opt.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

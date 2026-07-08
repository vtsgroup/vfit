/**
 * src/components/payments/step-up-sheet.tsx
 *
 * StepUpSheet — Confirmação de identidade para autorizar um saque (dinheiro real).
 *
 * Mostra valor + chave PIX (transparência: o usuário vê o que está autorizando).
 * Tenta biometria (dynamic linking) se houver passkey; senão, ou em fallback,
 * pede a senha. Ao confirmar, devolve o StepUpMaterial (header do token OU senha)
 * para o caller anexar na mutação de saque.
 *
 * Exports: StepUpSheet
 * Features: 'use client' · DSIcon · Modal
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { usePasskeys } from '@/hooks/use-passkey'
import { useStepUp, type StepUpPurpose, type StepUpMaterial } from '@/hooks/use-step-up'

interface StepUpSheetProps {
  amount: number
  pixKey: string
  purpose: StepUpPurpose
  onConfirm: (material: StepUpMaterial) => void
  onClose: () => void
}

function maskPixKey(key: string): string {
  if (key.includes('@')) return key.replace(/^(.{2})(.*)(@.*)$/, (_, s, m, d) => s + '•'.repeat(Math.min(m.length, 4)) + d)
  if (key.length > 6) return key.slice(0, 3) + '•'.repeat(4) + key.slice(-2)
  return key
}

export function StepUpSheet({ amount, pixKey, purpose, onConfirm, onClose }: StepUpSheetProps) {
  const passkeys = usePasskeys()
  const stepUp = useStepUp()
  const hasPasskey = (passkeys.data?.length ?? 0) > 0
  const [mode, setMode] = useState<'biometric' | 'password'>('biometric')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)

  // Sem passkey → cai direto no modo senha
  useEffect(() => {
    if (!passkeys.isLoading && !hasPasskey) setMode('password')
  }, [passkeys.isLoading, hasPasskey])

  const runBiometric = useCallback(async () => {
    setError(null)
    try {
      const token = await stepUp.mutateAsync({ amount, pixKey, purpose })
      onConfirm({ headers: { 'X-Step-Up-Token': token } })
    } catch (err) {
      const e = err as Error
      // Cancelamento/indisponível → oferece senha em vez de erro ruidoso
      if (e?.name === 'NotAllowedError' || e?.name === 'AbortError' || /cancel/i.test(e?.message || '')) {
        setMode('password')
        return
      }
      setError(e?.message || 'Falha na biometria. Use sua senha.')
      setMode('password')
    }
  }, [amount, pixKey, purpose, stepUp, onConfirm])

  const submitPassword = useCallback(() => {
    if (!password.trim()) { setError('Digite sua senha'); return }
    onConfirm({ bodyExtra: { current_password: password } })
  }, [password, onConfirm])

  return (
    <Modal title="Confirme o saque" onClose={onClose}>
      <div className="space-y-5">
        {/* Resumo da transação — o que está sendo autorizado */}
        <div className="rounded-2xl border border-border-light bg-bg-tertiary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Valor</span>
            <span className="font-syne text-lg font-bold text-text-primary">{formatted}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-secondary">Chave PIX</span>
            <span className="text-sm font-medium text-text-primary">{maskPixKey(pixKey)}</span>
          </div>
        </div>

        {mode === 'biometric' ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 ring-2 ring-brand-primary/30">
              <DSIcon name="fingerprint" size={30} className="text-brand-primary" />
            </div>
            <p className="text-center text-sm text-text-secondary">
              Use sua biometria para autorizar este saque.
            </p>
            <Button onClick={runBiometric} loading={stepUp.isPending} className="w-full">
              <DSIcon name="fingerprint" size={18} />
              Autorizar com biometria
            </Button>
            <button
              onClick={() => setMode('password')}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-secondary"
            >
              Usar senha
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-secondary" htmlFor="stepup-password">
              Confirme sua senha para autorizar
            </label>
            <input
              id="stepup-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitPassword()}
              className="w-full rounded-xl border border-border-light bg-bg-tertiary px-4 py-3 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
              placeholder="Sua senha"
              autoFocus
            />
            <Button onClick={submitPassword} className="w-full">
              Autorizar saque
            </Button>
            {hasPasskey && (
              <button
                onClick={() => { setError(null); setMode('biometric') }}
                className="w-full text-center text-sm font-medium text-text-muted transition-colors hover:text-text-secondary"
              >
                Usar biometria
              </button>
            )}
          </div>
        )}

        {error && <p role="alert" className="text-center text-sm text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}

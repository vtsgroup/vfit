/**
 * src/hooks/use-step-up.ts
 *
 * useStepUp — confirmação de identidade (biometria OU senha) para autorizar saques.
 *
 * Fluxo biométrico (dynamic linking): pede reauth/options com {amount, pix_key} →
 * WebAuthn (UV=required) → reauth/complete → step_up_token vinculado à transação.
 * O token só vale para AQUELE saque exato (valor+chave), 5 min, single-use.
 *
 * Fallback: se o usuário não tem passkey, retorna needsPassword — a UI mostra o
 * campo de senha e envia current_password no body do saque.
 *
 * Exports: useStepUp, StepUpPurpose, StepUpMaterial, newIdempotencyKey
 * Hooks: useMutation, useAuthStore
 * Features: 'use client'
 */

'use client'

import { useMutation } from '@tanstack/react-query'
import { startAuthentication } from '@simplewebauthn/browser'
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types'
import { api } from '@/lib/api-client'

export type StepUpPurpose = 'withdraw_pix' | 'withdraw_affiliate'

/** Material de autorização a anexar na mutação de saque. */
export interface StepUpMaterial {
  /** Header X-Step-Up-Token (caminho biométrico). */
  headers?: Record<string, string>
  /** current_password no body (caminho senha). */
  bodyExtra?: { current_password: string }
}

/** Gera uma Idempotency-Key nova para um saque. Reusar em retries do MESMO saque. */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `idem-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

interface ReauthArgs {
  amount: number
  pixKey: string
  purpose: StepUpPurpose
}

/**
 * Executa o reauth biométrico e devolve o step_up_token vinculado à transação.
 * Lança se a biometria falhar/for cancelada (o caller decide cair no fallback de senha).
 */
export function useStepUp() {
  return useMutation({
    mutationFn: async ({ amount, pixKey, purpose }: ReauthArgs): Promise<string> => {
      const { data: options } = await api.post<PublicKeyCredentialRequestOptionsJSON>(
        '/auth/passkey/reauth/options',
        { amount, pix_key: pixKey, purpose }
      )
      const credential = await startAuthentication({ optionsJSON: options })
      const { data } = await api.post<{ step_up_token: string }>(
        '/auth/passkey/reauth/complete',
        { credential }
      )
      return data.step_up_token
    },
  })
}

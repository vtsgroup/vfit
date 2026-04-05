/**
 * src/hooks/use-passkey.ts
 *
 * Passkey / WebAuthn Hooks — src/hooks/use-passkey.ts
 *
 * Exports: supportsPasskey, hasPasskeyRegistered, isPasskeyDismissed, dismissPasskeyPrompt, getPasskeyEmail
 * Hooks: useMutation, useQuery, useQueryClient, useAuthStore, usePasskeys, useRegisterPasskey
 * Features: Auth: useAuthStore · 'use client' · React Query
 */

// ============================================
// Passkey / WebAuthn Hooks — src/hooks/use-passkey.ts
// Registration, Authentication, Management
// ============================================

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { APP_QUERY_CACHE } from '@/lib/query-cache-policy'
import { toast } from '@/stores/app-store'

// ============================================
// Browser Helpers
// ============================================

/** Check if browser supports WebAuthn passkeys */
export function supportsPasskey(): boolean {
  if (typeof window === 'undefined') return false
  return browserSupportsWebAuthn()
}

/** Check if passkey is registered for a user (via localStorage) */
export function hasPasskeyRegistered(userId: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`passkey_registered_${userId}`) === 'true'
}

/** Check if user dismissed the passkey prompt */
export function isPasskeyDismissed(userId: string): boolean {
  if (typeof window === 'undefined') return false
  const dismissed = localStorage.getItem(`passkey_dismissed_${userId}`)
  if (!dismissed) return false
  const dismissedAt = parseInt(dismissed, 10)
  // Re-show after 30 days
  return Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000
}

/** Dismiss the passkey prompt (won't show for 30 days) */
export function dismissPasskeyPrompt(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`passkey_dismissed_${userId}`, Date.now().toString())
}

/** Get stored email that has a passkey (for login page) */
export function getPasskeyEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('passkey_email')
}

/** Store the email that registered a passkey */
function setPasskeyEmail(email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('passkey_email', email)
}

/** Clear passkey email (e.g., on passkey delete when no more left) */
export function clearPasskeyEmail(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('passkey_email')
}

// ============================================
// Biometric Quick Unlock Helpers
// Persist last user info + auto-unlock preference
// ============================================

interface LastBiometricUser {
  name: string
  avatar: string | null
  email: string
}

/** Save user info for biometric lock screen greeting */
export function setLastBiometricUser(data: LastBiometricUser): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('vfit_biometric_user', JSON.stringify(data))
  } catch { /* best-effort */ }
}

/** Get last user info for biometric lock screen */
export function getLastBiometricUser(): LastBiometricUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('vfit_biometric_user')
    if (!raw) return null
    return JSON.parse(raw) as LastBiometricUser
  } catch {
    return null
  }
}

/** Clear stored biometric user (e.g., on logout) */
export function clearLastBiometricUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('vfit_biometric_user')
}

/** Check if biometric auto-unlock is enabled */
export function isBiometricAutoUnlockEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('vfit_biometric_auto_unlock') === 'true'
}

/** Enable or disable biometric auto-unlock */
export function setBiometricAutoUnlock(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem('vfit_biometric_auto_unlock', 'true')
  } else {
    localStorage.removeItem('vfit_biometric_auto_unlock')
  }
}

// ============================================
// Types
// ============================================

export interface PasskeyInfo {
  id: string
  device_name: string | null
  device_type: string
  backed_up: boolean
  created_at: string
  last_used_at: string | null
}

// ============================================
// Query Hooks
// ============================================

/** List user's registered passkeys */
export function usePasskeys() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['passkeys'],
    queryFn: () =>
      api.get<PasskeyInfo[]>('/auth/passkeys').then((r) => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.list,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/** Register a new passkey (user must be logged in) */
export function useRegisterPasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceName?: string) => {
      // Step 1: Get registration options from server
      const { data: options } = await api.post<PublicKeyCredentialCreationOptionsJSON>('/auth/passkey/register/options', {
        device_name: deviceName,
      })

      // Step 2: Start WebAuthn registration in browser (biometric prompt)
      const credential = await startRegistration({ optionsJSON: options })

      // Step 3: Send credential to server for verification
      const { data: result } = await api.post('/auth/passkey/register/complete', {
        credential,
        device_name: deviceName,
      })

      return result
    },
    onSuccess: () => {
      // Mark passkey as registered in localStorage
      const user = useAuthStore.getState().user
      if (user) {
        localStorage.setItem(`passkey_registered_${user.id}`, 'true')
        setPasskeyEmail(user.email)
        // Auto-enable biometric unlock and save user info
        setLastBiometricUser({
          name: user.full_name,
          avatar: user.avatar_url,
          email: user.email,
        })
        setBiometricAutoUnlock(true)
      }
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      toast.success('Login rápido com biometria ativado!')
    },
    onError: async (err: Error) => {
      // Não mostrar erro se o usuário cancelou o prompt
      if (err.name === 'NotAllowedError' || err.message.includes('cancelled')) {
        return
      }

      // Alguns autenticadores/gerenciadores (ex: NordPass/iCloud) retornam
      // "The authenticator was previously registered" quando já existe um passkey.
      // Tratar como caso esperado: se o servidor já tem passkeys, apenas sincronizar UI.
      const looksLikeAlreadyRegistered =
        err.name === 'InvalidStateError' ||
        /previously registered/i.test(err.message) ||
        /already registered/i.test(err.message)

      if (looksLikeAlreadyRegistered) {
        try {
          const res = await api.get<PasskeyInfo[]>('/auth/passkeys')
          const hasServerPasskeys = (res.data?.length ?? 0) > 0

          const user = useAuthStore.getState().user
          if (hasServerPasskeys && user) {
            localStorage.setItem(`passkey_registered_${user.id}`, 'true')
            setPasskeyEmail(user.email)
            queryClient.invalidateQueries({ queryKey: ['passkeys'] })
            toast.success('Biometria já estava ativa neste dispositivo')
            return
          }
        } catch {
          // seguir para mensagem abaixo
        }

        toast.error(
          'Este autenticador já tem um passkey cadastrado',
          'Se você removeu do sistema, apague o passkey no gerenciador (NordPass/iCloud) e tente novamente.'
        )
        return
      }

      toast.error(err.message || 'Erro ao registrar passkey')
    },
  })
}

/**
 * Login with passkey (biometric authentication)
 * Returns the same response shape as regular login
 */
export function useLoginWithPasskey() {
  return useMutation({
    mutationFn: async (email: string) => {
      // Step 1: Get authentication options from server
      const { data: options } = await api.post<PublicKeyCredentialRequestOptionsJSON>(
        '/auth/passkey/login/options',
        { email },
        { auth: false }
      )

      // Step 2: Start WebAuthn authentication in browser (biometric prompt)
      const credential = await startAuthentication({ optionsJSON: options })

      // Step 3: Send assertion to server for verification → get JWT tokens
      const { data: result } = await api.post(
        '/auth/passkey/login/complete',
        { email, credential },
        { auth: false }
      )

      return result
    },
  })
}

/** Delete a passkey */
export function useDeletePasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/auth/passkeys/${id}`),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })

      // best-effort: se era o último passkey, limpar o email salvo no login
      try {
        const res = await api.get<PasskeyInfo[]>('/auth/passkeys')
        if ((res.data?.length ?? 0) === 0) {
          clearPasskeyEmail()
        }
      } catch {
        // noop
      }

      toast.success('Passkey removido')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao remover passkey')
    },
  })
}

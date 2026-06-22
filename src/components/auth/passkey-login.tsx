/**
 * src/components/auth/passkey-login.tsx
 *
 * Passkey Login Button — biometric login on login page
 *
 * Exports: PasskeyLogin
 * Hooks: useState, useEffect, useRef, useCallback, useRouter, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Passkey Login Button — biometric login on login page
// ============================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import type { AuthTokens, User } from '@/stores/auth-store'
import { api } from '@/lib/api-client'
import {
  supportsPasskey,
  getPasskeyEmail,
  clearPasskeyEmail,
  useLoginWithPasskey,
} from '@/hooks/use-passkey'
import { toast } from '@/stores/app-store'

interface PasskeyLoginResponse {
  user: {
    id: string
    email: string
    full_name: string
    user_type: 'personal' | 'student' | 'admin'
    profile_photo_url: string | null
    is_active: boolean
    email_verified: boolean
    role: 'user' | 'admin' | 'super_admin' | null
    phone?: string | null
    created_at?: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
  session_id: string
  personal?: Record<string, unknown> | null
  student?: Record<string, unknown> | null
  auth_method: string
}

function normalizeAuthUser(user: PasskeyLoginResponse['user']): User {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    role: user.role || 'user',
    avatar_url: user.profile_photo_url ?? null,
    phone: user.phone ?? null,
    created_at: user.created_at || new Date().toISOString(),
  }
}

interface PasskeyLoginProps {
  /** Called when passkey login starts (to disable form) */
  onLoadingChange?: (loading: boolean) => void
}

export function PasskeyLogin({ onLoadingChange }: PasskeyLoginProps) {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [passkeyEmail, setPasskeyEmail] = useState<string | null>(null)
  const [serverHasPasskeys, setServerHasPasskeys] = useState<boolean | null>(null)
  const loginWithPasskey = useLoginWithPasskey()

  // Ref guard to prevent concurrent WebAuthn requests (React state update is async)
  const isPendingRef = useRef(false)

  useEffect(() => {
    if (supportsPasskey()) {
      setPasskeyEmail(getPasskeyEmail())
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function checkServer() {
      if (!passkeyEmail) {
        setServerHasPasskeys(null)
        return
      }

      try {
        const res = await api.get<{ has_passkeys: boolean }>(
          `/auth/passkeys/check/${encodeURIComponent(passkeyEmail)}`,
          { auth: false }
        )
        if (cancelled) return

        const has = Boolean(res.data?.has_passkeys)
        setServerHasPasskeys(has)

        if (!has) {
          // Local state is stale (passkeys deleted). Hide button and clear the stored email.
          clearPasskeyEmail()
          setPasskeyEmail(null)
        }
      } catch {
        if (cancelled) return
        // Fail-closed: if we can't confirm, hide the biometric button
        setServerHasPasskeys(false)
      }
    }

    void checkServer()
    return () => {
      cancelled = true
    }
  }, [passkeyEmail])

  useEffect(() => {
    onLoadingChange?.(loginWithPasskey.isPending)
  }, [loginWithPasskey.isPending, onLoadingChange])

  const handlePasskeyLogin = useCallback(async () => {
    if (!passkeyEmail) return
    // Synchronous guard — blocks before React state can update
    if (isPendingRef.current) return
    isPendingRef.current = true

    try {
      const data = await loginWithPasskey.mutateAsync(passkeyEmail) as PasskeyLoginResponse

      // Same auth flow as regular login
      const tokens: AuthTokens = {
        access_token: data.tokens.access_token,
        refresh_token: data.tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.tokens.expires_in,
      }

      login({ user: normalizeAuthUser(data.user), tokens })
      toast.success('Login biométrico realizado!')

      // Redirect
      const dest = data.user.user_type === 'admin' ? '/dashboard/admin' : '/dashboard'
      router.push(dest)
    } catch (err: unknown) {
      const error = err as Error
      // Don't show error if user cancelled or if a request is already pending
      if (
        error?.name === 'NotAllowedError' ||
        error?.name === 'OperationError' ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('already pending')
      ) {
        return
      }
      console.error('[PasskeyLogin] Error:', error?.message, error)
      toast.error(error?.message || 'Falha na autenticação biométrica')
    } finally {
      isPendingRef.current = false
    }
  }, [passkeyEmail, loginWithPasskey, login, router])

  if (!passkeyEmail) return null
  if (serverHasPasskeys === null) return null
  if (serverHasPasskeys === false) return null

  // Mask email for display: v***@gmail.com
  const maskedEmail = passkeyEmail.replace(
    /^(.{1,2})(.*)(@.*)$/,
    (_, start, middle, domain) => start + '•'.repeat(Math.min(middle.length, 4)) + domain
  )

  return (
    <div className="space-y-2">
      {/* Biometric login button */}
      <button
        type="button"
        onClick={handlePasskeyLogin}
        disabled={loginWithPasskey.isPending || isPendingRef.current}
        aria-busy={loginWithPasskey.isPending}
        className="w-full group flex items-center justify-center gap-2.5 rounded-xl border border-brand-primary/30 bg-brand-primary/5 py-2.5 text-sm font-semibold text-brand-primary transition-all hover:bg-brand-primary/10 hover:border-brand-primary/50 hover:shadow-glow-primary active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
      >
        {loginWithPasskey.isPending ? (
          <DSIcon name="loader" size={16} className="motion-safe:animate-spin" />
        ) : (
          <DSIcon name="fingerprint" size={20} />
        )}
        <span aria-live="polite">
          {loginWithPasskey.isPending
            ? 'Autenticando...'
            : `Entrar com biometria`}
        </span>
      </button>

      {/* Subtitle */}
      <p className="text-center text-[10px] text-zinc-400">
        {maskedEmail} · Face ID / Impressão digital
      </p>

      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/6" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-primary px-3 text-[9px] uppercase tracking-widest text-zinc-400">
            ou com senha
          </span>
        </div>
      </div>
    </div>
  )
}

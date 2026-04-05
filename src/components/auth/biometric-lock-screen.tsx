/**
 * src/components/auth/biometric-lock-screen.tsx
 *
 * Biometric Lock Screen — Full-screen biometric unlock overlay
 * Shows when app opens with biometric enabled, auto-triggers WebAuthn
 *
 * Exports: BiometricLockScreen
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Biometric Lock Screen
// Auto-triggers WebAuthn biometric prompt on mount
// On success → login → redirect to dashboard
// On cancel → dismiss → show login form
// ============================================

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import type { AuthTokens, User } from '@/stores/auth-store'
import {
  getPasskeyEmail,
  getLastBiometricUser,
  setLastBiometricUser,
  useLoginWithPasskey,
} from '@/hooks/use-passkey'
import { toast } from '@/stores/app-store'
import { cn } from '@/lib/utils'

interface BiometricLockScreenProps {
  onDismiss: () => void
}

interface PasskeyLoginResponse {
  user: {
    id: string
    email: string
    full_name: string
    user_type: 'personal' | 'student' | 'admin' | 'nutritionist'
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
}

export function BiometricLockScreen({ onDismiss }: BiometricLockScreenProps) {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const loginWithPasskey = useLoginWithPasskey()
  const [status, setStatus] = useState<'idle' | 'prompting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const attemptedRef = useRef(false)

  const email = getPasskeyEmail()
  const lastUser = getLastBiometricUser()

  const triggerBiometric = useCallback(async () => {
    if (!email || attemptedRef.current) return
    attemptedRef.current = true
    setStatus('prompting')

    try {
      const data = (await loginWithPasskey.mutateAsync(email)) as PasskeyLoginResponse

      const tokens: AuthTokens = {
        access_token: data.tokens.access_token,
        refresh_token: data.tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.tokens.expires_in,
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        user_type: data.user.user_type as User['user_type'],
        role: data.user.role || 'user',
        avatar_url: data.user.profile_photo_url ?? null,
        phone: data.user.phone ?? null,
        created_at: data.user.created_at || new Date().toISOString(),
      }

      // Update stored user info for next time
      setLastBiometricUser({
        name: user.full_name,
        avatar: user.avatar_url,
        email: user.email,
      })

      login({ user, tokens })
      setStatus('success')
      toast.success('Desbloqueado!')

      // Small delay for visual feedback before redirect
      setTimeout(() => {
        const dest =
          data.user.user_type === 'admin' || data.user.role === 'admin' || data.user.role === 'super_admin'
            ? '/dashboard/admin'
            : '/dashboard'
        router.push(dest)
      }, 400)
    } catch (err: unknown) {
      const error = err as Error
      if (
        error?.name === 'NotAllowedError' ||
        error?.name === 'OperationError' ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('already pending')
      ) {
        // User cancelled — dismiss silently
        onDismiss()
        return
      }
      setStatus('error')
      setErrorMsg(error?.message || 'Falha na autenticação')
    }
  }, [email, loginWithPasskey, login, router, onDismiss])

  // Auto-trigger biometric after mount with a small delay
  useEffect(() => {
    const timer = setTimeout(triggerBiometric, 600)
    return () => clearTimeout(timer)
  }, [triggerBiometric])

  if (!email) return null

  // Compute initials for avatar fallback
  const initials =
    lastUser?.name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  const firstName = lastUser?.name?.split(' ')[0] || ''

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ colorScheme: 'dark' }}
    >
      {/* ─── Background ─── */}
      <div className="absolute inset-0 bg-[#050A12]">
        {/* Aurora blobs */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 130% 70% at 30% 70%, rgba(16,185,129,0.15) 0%, transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(ellipse 100% 50% at 75% 35%, rgba(52,211,153,0.12) 0%, transparent 50%)',
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,10,18,0.7)_100%)]" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Avatar with animated ring */}
        <div className="relative">
          {/* Outer glow */}
          <div
            className={cn(
              'absolute -inset-3 rounded-full transition-all duration-1000',
              status === 'prompting' && 'animate-pulse bg-brand-primary/10',
              status === 'success' && 'bg-brand-primary/20',
              status === 'error' && 'bg-red-500/10'
            )}
          />
          {/* Animated ring */}
          <div
            className={cn(
              'absolute -inset-1.5 rounded-full border-2 transition-all duration-700',
              status === 'idle' && 'border-white/10',
              status === 'prompting' && 'border-brand-primary/40 animate-pulse',
              status === 'success' && 'border-brand-primary/60',
              status === 'error' && 'border-red-500/30'
            )}
          />

          {lastUser?.avatar ? (
            <Image
              src={lastUser.avatar}
              alt={lastUser.name || ''}
              width={112}
              height={112}
              className="relative h-28 w-28 rounded-full border-2 border-white/10 object-cover"
              unoptimized
            />
          ) : (
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/10 bg-brand-primary/20 text-3xl font-bold text-brand-primary">
              {initials}
            </div>
          )}
        </div>

        {/* Greeting */}
        <div className="flex flex-col items-center gap-1.5">
          {firstName && (
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Olá, {firstName}
            </h2>
          )}
          <p className="text-sm text-zinc-500">
            {lastUser?.email?.replace(
              /^(.{2})(.*)(@.*)$/,
              (_, start, middle, domain) =>
                start + '•'.repeat(Math.min(middle.length, 4)) + domain
            )}
          </p>
        </div>

        {/* Status area */}
        <div className="flex flex-col items-center gap-4">
          {/* Fingerprint icon */}
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500',
              status === 'idle' && 'bg-white/5 ring-2 ring-white/10',
              status === 'prompting' &&
                'bg-brand-primary/10 ring-2 ring-brand-primary/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]',
              status === 'success' &&
                'bg-brand-primary/20 ring-2 ring-brand-primary/40 shadow-[0_0_60px_rgba(34,197,94,0.25)]',
              status === 'error' && 'bg-red-500/10 ring-2 ring-red-500/20'
            )}
          >
            {status === 'success' ? (
              <DSIcon
                name="check"
                size={36}
                className="text-brand-primary animate-in zoom-in duration-300"
              />
            ) : status === 'error' ? (
              <DSIcon name="alertTriangle" size={36} className="text-red-400" />
            ) : (
              <DSIcon
                name="fingerprint"
                size={36}
                className={cn(
                  'transition-colors duration-300',
                  status === 'prompting' ? 'text-brand-primary animate-pulse' : 'text-zinc-500'
                )}
              />
            )}
          </div>

          {/* Status text */}
          <p
            className={cn(
              'text-sm font-medium transition-colors duration-300',
              status === 'idle' && 'text-zinc-500',
              status === 'prompting' && 'text-zinc-400',
              status === 'success' && 'text-brand-primary',
              status === 'error' && 'text-red-400'
            )}
          >
            {status === 'idle' && 'Preparando...'}
            {status === 'prompting' && 'Use sua biometria para continuar'}
            {status === 'success' && 'Desbloqueado!'}
            {status === 'error' && (errorMsg || 'Falha na autenticação')}
          </p>
        </div>

        {/* Action buttons */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => {
                attemptedRef.current = false
                setStatus('idle')
                setErrorMsg(null)
                setTimeout(triggerBiometric, 300)
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              <DSIcon name="fingerprint" size={16} />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Use password fallback — always visible except on success */}
        {status !== 'success' && (
          <button
            onClick={onDismiss}
            className="mt-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Usar senha
          </button>
        )}
      </div>
    </div>
  )
}

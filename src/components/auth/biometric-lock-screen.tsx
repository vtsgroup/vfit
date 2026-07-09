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
  setBiometricLastAuth,
  useLoginWithPasskey,
} from '@/hooks/use-passkey'
import { bootDestination } from '@/lib/boot-destination'
import { logClientIssue } from '@/lib/debug-logger'
import { toast } from '@/stores/app-store'
import { cn } from '@/lib/utils'

interface BiometricLockScreenProps {
  onDismiss: () => void
  /** 'login' (default): tela de entrada nas páginas de auth — sucesso navega para o destino.
   *  'unlock': app lock no boot (B3) — sucesso só chama onUnlocked (não navega, já está no app). */
  variant?: 'login' | 'unlock'
  /** chamado no modo 'unlock' quando o desbloqueio conclui (ou fail-open offline) */
  onUnlocked?: () => void
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

export function BiometricLockScreen({ onDismiss, variant = 'login', onUnlocked }: BiometricLockScreenProps) {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
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

      // Record auth time for cooldown (won't nag again for 1h)
      setBiometricLastAuth()

      login({ user, tokens })
      setStatus('success')
      toast.success('Desbloqueado!')

      // Small delay for visual feedback
      setTimeout(() => {
        if (variant === 'unlock') {
          // Já está no app — só libera o overlay, não navega (evita mandar student p/ rota errada)
          onUnlocked?.()
          return
        }
        // Modo login: navega para o destino correto por user_type
        // (student→/treinos, admin→/dashboard/admin, personal/nutri→/dashboard).
        const effectiveType =
          data.user.role === 'admin' || data.user.role === 'super_admin' ? 'admin' : data.user.user_type
        router.push(bootDestination({ authenticated: true, userType: effectiveType }))
      }, 400)
    } catch (err: unknown) {
      const error = err as Error
      const isCancellation =
        error?.name === 'NotAllowedError' ||
        error?.name === 'OperationError' ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('already pending')

      // Fail-open offline (só no modo unlock): falha de REDE não deve prender o usuário —
      // app é offline-first, tokens no store seguem válidos. Deixa entrar + avisa.
      const isNetworkError =
        !isCancellation &&
        ((typeof navigator !== 'undefined' && navigator.onLine === false) ||
          error?.name === 'TypeError' ||
          /failed to fetch|networkerror|load failed|network request failed/i.test(error?.message || ''))

      if (variant === 'unlock' && isNetworkError) {
        void logClientIssue({
          level: 'warn',
          source: 'biometric.unlock',
          message: `Fail-open offline no app lock: ${error?.message || 'sem rede'}`,
        })
        toast.info('Sem conexão', 'Biometria pulada')
        onUnlocked?.()
        return
      }

      if (isCancellation) {
        // Modo login: some com o lock e mostra o form. Modo unlock: não há form atrás —
        // mantém trancado com opção de tentar de novo / usar senha.
        if (variant === 'unlock') {
          setStatus('error')
          setErrorMsg('Autenticação cancelada')
          return
        }
        onDismiss()
        return
      }

      setStatus('error')
      setErrorMsg(error?.message || 'Falha na autenticação')
    }
  }, [email, loginWithPasskey, login, router, onDismiss, variant, onUnlocked])

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
      role="dialog"
      aria-modal="true"
      aria-label="Desbloqueio biométrico"
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ colorScheme: 'dark' }}
    >
      {/* ─── Background ─── */}
      <div className="absolute inset-0 bg-bg-primary" aria-hidden="true">
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
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(5,10,18,0.7) 100%)',
          }}
        />
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
                'bg-brand-primary/10 ring-2 ring-brand-primary/30 shadow-glow-primary',
              status === 'success' &&
                'bg-brand-primary/20 ring-2 ring-brand-primary/40 shadow-glow-primary',
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
            role="status"
            aria-live="polite"
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
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            >
              <DSIcon name="fingerprint" size={16} />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Use password fallback — always visible except on success.
            Modo login: mostra o form. Modo unlock: válvula de segurança → logout suave → /login
            (nunca deixar o usuário preso atrás do lock sem saída). */}
        {status !== 'success' && (
          <button
            onClick={() => {
              if (variant === 'unlock') {
                logout()
                router.push('/login')
              } else {
                onDismiss()
              }
            }}
            className="mt-2 rounded-md text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
          >
            Usar senha
          </button>
        )}
      </div>
    </div>
  )
}

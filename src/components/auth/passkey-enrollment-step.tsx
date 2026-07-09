/**
 * src/components/auth/passkey-enrollment-step.tsx
 *
 * Passkey Enrollment Step — passo full-screen pós-cadastro (biometria v2, B1)
 *
 * Oferta proeminente de ativação de biometria logo no primeiro momento autenticado
 * no app (student pós-onboarding; personal/nutri no 1º login). Tela cheia (não modal):
 * é um passo do fluxo, não uma interrupção. Reusa o fluxo WebAuthn de useRegisterPasskey.
 */
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DSIcon } from '@/components/ui/ds-icon'
import { useAuthStore } from '@/stores/auth-store'
import {
  useRegisterPasskey,
  setBiometricAutoUnlock,
  setLastBiometricUser,
  setBiometricLastAuth,
} from '@/hooks/use-passkey'

interface PasskeyEnrollmentStepProps {
  /** Chamado ao concluir — biometria ativada OU usuário pulou ("Agora não") */
  onDone: () => void
}

/** Nome amigável do dispositivo para exibir na lista de passkeys */
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Dispositivo'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Android/i.test(ua)) return 'Android'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Dispositivo'
}

export function PasskeyEnrollmentStep({ onDone }: PasskeyEnrollmentStepProps) {
  const user = useAuthStore((s) => s.user)
  const registerPasskey = useRegisterPasskey()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleActivate() {
    try {
      await registerPasskey.mutateAsync(getDeviceName())
      // Sucesso: ativa auto-unlock e guarda dados p/ o lock screen
      if (user) {
        setBiometricAutoUnlock(true)
        setLastBiometricUser({
          name: user.full_name,
          avatar: user.avatar_url ?? null,
          email: user.email,
        })
        setBiometricLastAuth()
      }
      onDone()
    } catch {
      // Cancelamento / erro já é tratado no hook (toast). Mantém o passo aberto
      // para o usuário tentar de novo ou pular com "Agora não".
    }
  }

  if (!mounted || !user) return null

  const firstName = user.full_name?.split(' ')[0] || ''

  const step = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ative o desbloqueio por biometria"
      className="fixed inset-0 z-99999 flex flex-col items-center justify-center overflow-y-auto px-6 py-10"
      style={{ colorScheme: 'dark' }}
    >
      {/* ─── Fundo on-brand ─── */}
      <div className="absolute inset-0 bg-bg-primary" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(ellipse 130% 70% at 30% 70%, rgba(16,185,129,0.15) 0%, transparent 55%)' }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: 'radial-gradient(ellipse 100% 50% at 75% 35%, rgba(52,211,153,0.12) 0%, transparent 50%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,10,18,0.7) 100%)' }}
        />
      </div>

      {/* ─── Conteúdo ─── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 text-center">
        {/* Hero icon */}
        <div className="relative">
          <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-brand-primary/15" style={{ animationDuration: '3s' }} />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-brand-primary/20 to-emerald-500/10 ring-2 ring-brand-primary/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
              <DSIcon name="fingerprint" size={32} className="text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <DSIcon name="sparkles" size={14} className="text-brand-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Recomendado</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {firstName ? `Quase lá, ${firstName}!` : 'Quase lá!'}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">
            Ative o desbloqueio por biometria e entre com Face ID, digital ou Windows Hello — sem digitar senha.
          </p>
        </div>

        {/* Benefícios */}
        <div className="w-full space-y-2.5 text-left">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
              <DSIcon name="flame" size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">1 segundo</p>
              <p className="text-[11px] text-text-muted">Login sem digitar senha</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
              <DSIcon name="shield" size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Ultra seguro</p>
              <p className="text-[11px] text-text-muted">A biometria nunca sai do dispositivo</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-1 w-full space-y-2.5">
          <button
            onClick={handleActivate}
            disabled={registerPasskey.isPending}
            className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-brand-primary to-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98] disabled:opacity-60"
          >
            <span className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white">
              {registerPasskey.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <DSIcon name="fingerprint" size={16} />
                  Ativar biometria
                </>
              )}
            </span>
          </button>
          <button
            onClick={onDone}
            disabled={registerPasskey.isPending}
            className="w-full rounded-2xl py-3 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary disabled:opacity-60"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(step, document.body)
}

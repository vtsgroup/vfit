/**
 * src/components/engagement/upgrade-prompt.tsx
 *
 * Upgrade Prompt — Periodically shows Pro benefits to free/trial users
 * Smart timing: every 3 days, max 1x per session, only for trial plan users
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'

// ─── Constants ───
const STORAGE_KEY_LAST_SHOWN = 'vfit_upgrade_last_shown'
const STORAGE_KEY_SESSION_SHOWN = 'vfit_upgrade_session_shown'
const STORAGE_KEY_CONVERTED = 'vfit_upgrade_converted'
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const SHOW_DELAY_MS = 8000 // 8s after dashboard loads

interface ProFeature {
  icon: DSIconName
  title: string
  desc: string
  tag?: string
}

const PRO_FEATURES: ProFeature[] = [
  {
    icon: 'infinity',
    title: 'Alunos ilimitados',
    desc: 'Sem limite de cadastro de alunos',
    tag: 'Popular',
  },
  {
    icon: 'sparkles',
    title: 'IA avançada',
    desc: 'Geração de treinos e dietas com IA',
  },
  {
    icon: 'chart',
    title: 'Relatórios completos',
    desc: 'Analytics detalhado de evolução',
  },
  {
    icon: 'camera',
    title: 'Fotos de avaliação',
    desc: 'Comparação visual com galeria',
  },
  {
    icon: 'messageCircle',
    title: 'Chat com alunos',
    desc: 'Comunicação integrada na plataforma',
  },
  {
    icon: 'shield',
    title: 'Suporte prioritário',
    desc: 'Atendimento rápido quando precisar',
  },
]

function shouldShowUpgradePrompt(userPlan?: string): boolean {
  if (typeof window === 'undefined') return false
  // Only for trial/free users
  if (userPlan && userPlan !== 'trial' && userPlan !== 'free') return false
  // Never if user already converted
  if (localStorage.getItem(STORAGE_KEY_CONVERTED) === 'true') return false
  // Only 1x per session
  if (sessionStorage.getItem(STORAGE_KEY_SESSION_SHOWN) === 'true') return false
  // Cooldown between shows
  const lastShown = localStorage.getItem(STORAGE_KEY_LAST_SHOWN)
  if (lastShown) {
    const elapsed = Date.now() - parseInt(lastShown, 10)
    if (elapsed < COOLDOWN_MS) return false
  }
  return true
}

export function UpgradePrompt() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const personalProfile = useAuthStore((s) => s.personalProfile)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const [show, setShow] = useState(false)
  const [mounted, setMounted] = useState(false)

  useScrollLock(show)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !user) return
    // Determine plan: personalProfile?.plan_type or 'trial'
    const plan = personalProfile?.plan_type ?? 'trial'
    const timer = setTimeout(() => {
      if (shouldShowUpgradePrompt(plan)) {
        setShow(true)
        localStorage.setItem(STORAGE_KEY_LAST_SHOWN, Date.now().toString())
        sessionStorage.setItem(STORAGE_KEY_SESSION_SHOWN, 'true')
      }
    }, SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isHydrated, user, personalProfile])

  const handleDismiss = useCallback(() => {
    setShow(false)
  }, [])

  const handleUpgrade = useCallback(() => {
    setShow(false)
    router.push('/dashboard/plans')
  }, [router])

  if (!show || !user || !mounted) return null

  const modal = (
    <div className="fixed inset-0 z-9999 isolate" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleDismiss} />

      <div className="relative flex min-h-dvh items-end sm:items-center justify-center">
        <div className="w-full max-w-sm animate-in slide-in-from-bottom-8 fade-in duration-500 sm:mx-4">
          <div className="overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-bg-primary shadow-2xl">
            {/* Top gradient accent */}
            <div className="h-1 bg-linear-to-r from-brand-primary via-emerald-400 to-brand-primary" />

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-muted hover:bg-white/10 transition-all"
            >
              <DSIcon name="close" size={16} />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-primary to-emerald-400">
                  <DSIcon name="zap" size={16} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    Desbloqueie tudo
                  </span>
                </div>
              </div>

              <h3 className="mt-3 text-xl font-bold text-text-primary">
                Turbine com o Pro
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Você está no plano gratuito. Veja o que está perdendo:
              </p>

              {/* Features grid */}
              <div className="mt-5 space-y-2">
                {PRO_FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2.5 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                      <DSIcon name={f.icon} size={16} className="text-brand-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{f.title}</p>
                        {f.tag && (
                          <span className="rounded-full bg-brand-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-primary">
                            {f.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted">{f.desc}</p>
                    </div>
                    <DSIcon name="check" size={14} className="shrink-0 text-brand-primary/50" />
                  </div>
                ))}
              </div>

              {/* Price hint */}
              <div className="mt-5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3 text-center">
                <p className="text-sm text-text-secondary">
                  A partir de{' '}
                  <span className="text-lg font-bold text-brand-primary">R$ 29,90</span>
                  <span className="text-text-muted">/mês</span>
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Cancele a qualquer momento · Sem fidelidade
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  <DSIcon name="zap" className="h-4 w-4" />
                  Ver Planos Pro
                </Button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2 text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  Continuar no gratuito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

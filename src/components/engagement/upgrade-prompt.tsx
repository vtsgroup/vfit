/**
 * src/components/engagement/upgrade-prompt.tsx
 *
 * Upgrade Prompt v2 — "Leitura de Telemetria" (escolha do dono, workshop
 * Fase 2 · Experiência 1000). Exclusivo de PERSONAL em trial/free.
 *
 * Timing governado pelo Maestro (usePromptSlot): janela de acomodação,
 * 1 não-legal/sessão, espaçamento de 72h via ledger unificado e exceção
 * de momento-de-vitória. Com kill-switch, cai na Fase 0 (exclusão mútua)
 * e as guardas legadas de cooldown abaixo continuam valendo.
 */

'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { usePromptSlot } from '@/hooks/use-prompt-slot'
import { UpsellV2Telemetria } from '@/components/lab-experiencia/upsell-v2b-telemetria'

// ─── Guardas legadas (continuam valendo sob kill-switch do Maestro) ───
const STORAGE_KEY_LAST_SHOWN = 'vfit_upgrade_last_shown'
const STORAGE_KEY_SESSION_SHOWN = 'vfit_upgrade_session_shown'
const STORAGE_KEY_CONVERTED = 'vfit_upgrade_converted'
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000 // 3 dias (== 72h do Maestro)

function passesLegacyGuards(): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(STORAGE_KEY_CONVERTED) === 'true') return false
  if (sessionStorage.getItem(STORAGE_KEY_SESSION_SHOWN) === 'true') return false
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
  const [mounted, setMounted] = useState(false)
  const [eligible, setEligible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !user) return
    // Exclusivo de personal com perfil carregado (aluno via features de
    // personal por um fallback 'trial' — bug corrigido na Fase 0).
    if (user.user_type !== 'personal' || !personalProfile) return
    const plan = personalProfile.plan_type ?? 'trial'
    if (plan !== 'trial') return
    setEligible(passesLegacyGuards())
  }, [isHydrated, user, personalProfile])

  // O CTA do hero é sinal da home do ALUNO; no painel do personal não existe,
  // então requiresCtaSeen: false — as demais regras do Maestro continuam.
  const { granted, resolve } = usePromptSlot({
    id: 'upsell',
    priority: 'upsell',
    enabled: mounted && eligible,
    requiresCtaSeen: false,
  })

  useScrollLock(granted)

  useEffect(() => {
    if (!granted) return
    // Mantém as chaves legadas atualizadas para o caminho kill-switch.
    localStorage.setItem(STORAGE_KEY_LAST_SHOWN, Date.now().toString())
    sessionStorage.setItem(STORAGE_KEY_SESSION_SHOWN, 'true')
  }, [granted])

  // TODO(Maestro/vitória): quando os eventos de vitória do personal (aluno
  // concluiu treino / novo aluno) estiverem plugados via notifyMaestroSignal,
  // derivar o trigger real. Até lá, leitura honesta do painel.
  const trigger = useMemo(
    () => ({
      kind: 'marco_semanal' as const,
      headline: 'Sua operação está em movimento',
      detail: `Painel do personal · ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    }),
    []
  )

  const handleDismiss = useCallback(() => {
    setEligible(false)
    resolve('dismissed')
  }, [resolve])

  const handleUpgrade = useCallback(() => {
    setEligible(false)
    resolve('converted')
    localStorage.setItem(STORAGE_KEY_CONVERTED, 'true')
    router.push('/dashboard/plans')
  }, [resolve, router])

  if (!granted || !mounted) return null

  const modal = (
    <div className="fixed inset-0 z-9999 isolate" role="dialog" aria-modal="true" aria-label="Conheça o plano Pro">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-lg px-3 pb-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <UpsellV2Telemetria trigger={trigger} onDismiss={handleDismiss} onUpgrade={handleUpgrade} />
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

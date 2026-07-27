// ============================================
// boot-lock-gate.tsx — App lock no boot (biometria v2, B3)
// ============================================
//
// O que faz:
//   Em apps instalados (PWA standalone / TWA), quando a política de lock está
//   vencida, entrega o LOCK como destino de boot em vez do conteúdo. Decisão D4
//   do plano: o lock reusa o contrato isBootResolved do splash-boot v2 — a splash
//   segura a tela e sai entregando o lock (zero frame de conteúdo antes).
//
//   Fica FORA dos providers pesados (mesmo padrão do SplashOrchestrator): Zustand é
//   singleton global. Mora dentro do <Providers> raiz (QueryProvider), então o
//   BiometricLockScreen tem acesso ao React Query para o login por passkey.
//
//   Browser comum NÃO tranca (só standalone/TWA — comportamento "app-like").
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { BiometricLockScreen } from '@/components/auth/biometric-lock-screen'
import { isStandaloneDisplay } from '@/lib/display-mode'
import { hasPasskeyRegistered, getPasskeyEmail, isBiometricUnlockDue } from '@/hooks/use-passkey'

// Guard de MÓDULO (não de render): o gate mora em DOIS layouts irmãos —
// (app)/layout.tsx e dashboard/layout.tsx. Trocar de route group (ex.: /treinos →
// /dashboard/settings) desmonta um layout e monta o outro, remontando este componente
// e disparando o efeito de novo. Com policy 'always' (intervalo 0) isso trancava a
// cada navegação. Um módulo só é avaliado uma vez por carregamento de documento, então
// esta flag significa literalmente "já decidi neste abrir do app" — que é o contrato
// que a política promete ('always' = "Toda vez que abrir", não "toda navegação").
let lockDecidedThisAppOpen = false

export function BootLockGate() {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)
  const isUnlockRequired = useAuthStore((s) => s.isUnlockRequired)
  const setUnlockRequired = useAuthStore((s) => s.setUnlockRequired)
  const setUnlocked = useAuthStore((s) => s.setUnlocked)
  const setBootResolved = useAuthStore((s) => s.setBootResolved)

  // Decide na hidratação se o boot deve entregar o LOCK (em vez do conteúdo).
  // Só tranca em app instalado, com passkey registrado + email salvo (necessários para
  // o login por biometria) e política vencida. isBiometricUnlockDue já checa enabled + off.
  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated || !userId) {
      // Logout / troca de conta: rearma para o próximo login decidir de novo.
      lockDecidedThisAppOpen = false
      return
    }
    if (lockDecidedThisAppOpen) return
    lockDecidedThisAppOpen = true
    const required =
      isStandaloneDisplay() &&
      hasPasskeyRegistered(userId) &&
      !!getPasskeyEmail() &&
      isBiometricUnlockDue()
    if (required) setUnlockRequired(true)
    // Computa uma vez por abertura do app. Não reavaliar por render NEM por remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated, userId])

  // Com o lock visível, ele É o destino de boot → libera a splash (splash-boot v2).
  useEffect(() => {
    if (isUnlockRequired) setBootResolved(true)
  }, [isUnlockRequired, setBootResolved])

  if (!isUnlockRequired) return null

  return (
    <BiometricLockScreen
      variant="unlock"
      // NÃO desbloquear aqui. Em variant="unlock" o componente hoje nunca chama
      // onDismiss (cancelamento mantém o lock; "Usar senha" faz logout + /login),
      // então isto é inalcançável — mas "dismiss concede acesso" é uma arma
      // engatilhada: bastaria alguém remover o early-return do branch de
      // cancelamento para virar bypass silencioso do lock. Só onUnlocked, que roda
      // depois da passkey validada, pode liberar. O usuário não fica preso: o botão
      // "Usar senha" continua sendo a saída.
      onDismiss={() => {}}
      onUnlocked={() => setUnlocked()}
    />
  )
}

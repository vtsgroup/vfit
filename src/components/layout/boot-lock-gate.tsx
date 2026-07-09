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
    if (!isHydrated || !isAuthenticated || !userId) return
    const required =
      isStandaloneDisplay() &&
      hasPasskeyRegistered(userId) &&
      !!getPasskeyEmail() &&
      isBiometricUnlockDue()
    if (required) setUnlockRequired(true)
    // Computa uma vez por boot (na hidratação). Não reavaliar a cada render.
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
      onDismiss={() => setUnlocked()}
      onUnlocked={() => setUnlocked()}
    />
  )
}

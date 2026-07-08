/**
 * src/components/layout/boot-resolved-marker.tsx
 *
 * BootResolvedMarker — marca a superfície atual como destino final do boot.
 *
 * Superfícies terminais que não têm gate próprio (welcome/onboarding/login/register)
 * montam este marker: quando o Zustand hidrata, o boot está "aterrissado" e a splash
 * (que espera isSessionReady && isBootResolved) pode sair. Gates com lógica própria
 * (DashboardAuthGate, AppShell) marcam inline com suas condições reais.
 *
 * Exports: BootResolvedMarker
 * Features: 'use client'
 */

'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function BootResolvedMarker() {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setBootResolved = useAuthStore((s) => s.setBootResolved)

  useEffect(() => {
    if (isHydrated) setBootResolved(true)
  }, [isHydrated, setBootResolved])

  return null
}

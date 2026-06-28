/**
 * src/components/layout/splash-orchestrator.tsx
 *
 * SplashOrchestrator — Client wrapper que conecta auth store à SplashScreen
 *
 * Fica FORA de DashboardProviders no layout. Como Zustand é um singleton global,
 * não precisa de Provider React para ler o store — funciona em qualquer lugar da árvore.
 *
 * isReady = isSessionReady — setado pelo AuthProvider após:
 *   1. Zustand rehidratar do localStorage (isHydrated)
 *   2. Validação de sessão via /auth/me completar (ou constatar sem sessão)
 *
 * Isso garante que a splash cobre TODO o loading state do app — desde o primeiro
 * frame até o dashboard estar pronto para renderizar. Zero spinner extra.
 *
 * Exports: SplashOrchestrator
 * Features: 'use client'
 */

'use client'

import { useAuthStore } from '@/stores/auth-store'
import { SplashScreen } from '@/components/ui/splash-screen'

export function SplashOrchestrator() {
  const isSessionReady = useAuthStore((s) => s.isSessionReady)
  const setSplashFinished = useAuthStore((s) => s.setSplashFinished)

  // isReady = sessão verificada (hydration + /auth/me validado)
  // Independente do resultado — redirect para /login é tratado pelo AuthGate.
  // onFinished marca isSplashFinished no store → libera os loaders secundários,
  // que ficam suprimidos enquanto a splash é o único loading visível.
  return <SplashScreen isReady={isSessionReady} onFinished={() => setSplashFinished(true)} />
}

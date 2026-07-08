/**
 * src/components/layout/splash-orchestrator.tsx
 *
 * SplashOrchestrator — Client wrapper que conecta auth store à SplashScreen
 *
 * Fica FORA de DashboardProviders no layout. Como Zustand é um singleton global,
 * não precisa de Provider React para ler o store — funciona em qualquer lugar da árvore.
 *
 * isReady = isSessionReady && isBootResolved:
 *   1. Zustand rehidratou + /auth/me validado (useSessionBoot, guard por token)
 *   2. A superfície de destino renderizou conteúdo real (gates/markers setam
 *      isBootResolved) — a splash cobre inclusive o redirect de boot inteiro.
 *
 * Isso garante que a splash cobre TODO o loading state do app — desde o primeiro
 * frame (pré-renderizada no HTML estático) até o destino estar pronto. A splash
 * é OBSERVADORA: nunca executa navegação (decisão D2 do plano splash-boot).
 *
 * Exports: SplashOrchestrator
 * Features: 'use client'
 */

'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useSessionBoot } from '@/hooks/use-session-boot'
import { SplashScreen } from '@/components/ui/splash-screen'

export function SplashOrchestrator({ standaloneOnly = false }: { standaloneOnly?: boolean }) {
  // Roda a validação de sessão também aqui — cobre superfícies SEM AuthProvider
  // (welcome/login). Guard por token no hook: com AuthProvider junto, 1 fetch só.
  useSessionBoot()

  const isSessionReady = useAuthStore((s) => s.isSessionReady)
  const isBootResolved = useAuthStore((s) => s.isBootResolved)
  const setSplashFinished = useAuthStore((s) => s.setSplashFinished)

  // OBSERVADORA (decisão D2): a splash nunca navega. Ela segura a tela até
  // (1) sessão verificada E (2) a superfície de destino ter renderizado conteúdo
  // real (isBootResolved, marcado pelos gates/markers). Os redirects continuam
  // com os donos atuais (boot script pré-paint + gates). Válvula de 4s na
  // SplashScreen garante que nunca prende o usuário.
  return (
    <SplashScreen
      isReady={isSessionReady && isBootResolved}
      standaloneOnly={standaloneOnly}
      onFinished={() => setSplashFinished(true)}
    />
  )
}

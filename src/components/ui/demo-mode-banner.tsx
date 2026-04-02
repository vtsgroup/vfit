// ============================================
// demo-mode-banner.tsx — Banner de aviso de modo demo
// ============================================
//
// O que faz:
//   Exibe um banner fixo no topo da tela quando o app está em modo demo.
//   Modo demo é detectado via isDemoMode() de @/lib/demo-mode.
//   Renderiza null quando não está em modo demo (sem custo de DOM).
//
// Exports principais:
//   DemoModeBanner — banner de aviso (renderiza null fora do modo demo)
'use client'

import { useEffect, useState } from 'react'
import { isDemoMode } from '@/lib/api-client'
import { DSIcon } from '@/components/ui/ds-icon'

export function DemoModeBanner() {
  const [active, setActive] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check initial state
    setActive(isDemoMode())

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail
      setActive(detail.active)
      if (detail.active) setDismissed(false) // Re-show on reactivation
    }

    window.addEventListener('demo-mode-change', handler)
    return () => window.removeEventListener('demo-mode-change', handler)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const bannerOffset = active && !dismissed ? '44px' : '0px'
    root.style.setProperty('--demo-banner-offset', bannerOffset)

    return () => {
      root.style.setProperty('--demo-banner-offset', '0px')
    }
  }, [active, dismissed])

  if (!active || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 bg-amber-500/95 px-3 py-2 text-center text-xs font-medium text-amber-950 backdrop-blur-sm sm:px-4 sm:text-sm">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <DSIcon name="alertTriangle" size={16} className="shrink-0" />
        <span>
          Modo demonstração ativo — servidor temporariamente indisponível.
          Dados exibidos são fictícios.
        </span>
        <DSIcon name="refresh" size={14} className="hidden animate-spin opacity-60 sm:block" />
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 rounded p-0.5 hover:bg-amber-600/30 transition-colors"
          aria-label="Fechar aviso"
        >
          <DSIcon name="x" size={14} />
        </button>
      </div>
    </div>
  )
}

/**
 * src/app/(app)/perfil/offline/page.tsx
 *
 * Sprint 37 — Configurações de Performance & Modo Offline
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui'
import { cn } from '@/lib/utils'

interface CacheStats {
  totalEntries: number
  estimatedSizeMB: string
}

export default function OfflinePage() {
  const router = useRouter()
  const [offlineMode, setOfflineMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  // Carregar prefs do localStorage
  useEffect(() => {
    setOfflineMode(localStorage.getItem('vfit_offline_mode') === 'true')
    setReducedMotion(localStorage.getItem('vfit_reduced_motion') === 'true')

    // Estimar tamanho do cache
    if ('caches' in window) {
      caches.keys().then(async (names) => {
        let total = 0
        for (const name of names) {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          total += keys.length
        }
        setCacheStats({
          totalEntries: total,
          estimatedSizeMB: (total * 0.05).toFixed(1), // ~50KB média por entry
        })
      })
    }
  }, [])

  const toggleOffline = () => {
    const next = !offlineMode
    setOfflineMode(next)
    localStorage.setItem('vfit_offline_mode', String(next))
  }

  const toggleMotion = () => {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem('vfit_reduced_motion', String(next))
  }

  const clearCache = async () => {
    setIsClearing(true)
    try {
      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map((n) => caches.delete(n)))
      }
      localStorage.removeItem('vfit_equipment')
      setCacheStats({ totalEntries: 0, estimatedSizeMB: '0' })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <button onClick={() => router.back()} className="p-1">
          <DSIcon name="arrowLeft" className="h-5 w-5 text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">
          Performance & Offline
        </h1>
      </header>

      <div className="space-y-6 px-4 pt-2">
        {/* Status */}
        <div className="rounded-xl bg-bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
              <DSIcon name="zap" className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Status da conexão
              </p>
              <p className="text-xs text-text-secondary">
                {typeof navigator !== 'undefined' && navigator.onLine
                  ? '🟢 Online'
                  : '🔴 Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <ToggleSetting
            icon="layers"
            title="Modo Offline"
            description="Salvar treinos localmente quando sem internet"
            enabled={offlineMode}
            onToggle={toggleOffline}
          />
          <ToggleSetting
            icon="activity"
            title="Reduzir Animações"
            description="Desativar animações para melhor desempenho"
            enabled={reducedMotion}
            onToggle={toggleMotion}
          />
        </div>

        {/* Cache info */}
        {cacheStats && (
          <div className="rounded-xl bg-bg-secondary p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Armazenamento Local
            </h3>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-bg-tertiary p-3 text-center">
                <p className="text-lg font-bold text-text-primary">
                  {cacheStats.totalEntries}
                </p>
                <p className="text-xs text-text-muted">entradas em cache</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary p-3 text-center">
                <p className="text-lg font-bold text-text-primary">
                  ~{cacheStats.estimatedSizeMB} MB
                </p>
                <p className="text-xs text-text-muted">estimado</p>
              </div>
            </div>
            <button
              onClick={clearCache}
              disabled={isClearing}
              className="w-full rounded-lg bg-error/10 px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/20 disabled:opacity-50"
            >
              {isClearing ? 'Limpando...' : 'Limpar Cache'}
            </button>
          </div>
        )}

        {/* PWA info */}
        <div className="rounded-xl bg-bg-secondary p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            Sobre o modo offline
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary">
            Com o modo offline ativado, seus treinos serão salvos localmente e
            sincronizados automaticamente quando a conexão for restaurada. Ideal
            para academias com Wi-Fi instável.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Toggle setting ─────────────────────────────────────
function ToggleSetting({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: string
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-xl bg-bg-secondary p-4 text-left"
    >
      <DSIcon
        name={icon as DSIconName}
        className="h-5 w-5 text-text-secondary"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <div
        className={cn(
          'flex h-6 w-11 items-center rounded-full px-0.5 transition-colors',
          enabled ? 'bg-brand-primary' : 'bg-bg-tertiary'
        )}
      >
        <div
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  )
}

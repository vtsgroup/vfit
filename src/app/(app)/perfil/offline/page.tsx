/**
 * src/app/(app)/perfil/offline/page.tsx
 *
 * Sprint 37 — Configurações de Performance & Modo Offline
 */

'use client'

import { useState, useEffect } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard, ProfileToggle } from '@/components/profile/settings-shell'

interface CacheStats {
  totalEntries: number
  estimatedSizeMB: string
}

export default function OfflinePage() {
  const [offlineMode, setOfflineMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine

  useEffect(() => {
    setOfflineMode(localStorage.getItem('vfit_offline_mode') === 'true')
    setReducedMotion(localStorage.getItem('vfit_reduced_motion') === 'true')

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
          estimatedSizeMB: (total * 0.05).toFixed(1),
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
        await Promise.all(names.map((name) => caches.delete(name)))
      }
      localStorage.removeItem('vfit_equipment')
      setCacheStats({ totalEntries: 0, estimatedSizeMB: '0' })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <ProfileDetailShell
      title="Offline e performance"
      subtitle="Controle armazenamento local, conexão e movimento para treinar sem atrito."
      icon="zap"
      tone="slate"
      meta={<ProfilePill tone={isOnline ? 'emerald' : 'rose'}>{isOnline ? 'Online' : 'Offline'}</ProfilePill>}
    >
      <div className="space-y-5">
        <ProfileTintCard tone={isOnline ? 'emerald' : 'rose'}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-slate-950 text-emerald-300">
              <DSIcon name={isOnline ? 'wifi' : 'wifiOff'} size={22} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-950">Status da conexão</p>
              <p className="mt-0.5 text-[12px] font-medium text-slate-600">{isOnline ? 'Conectado e pronto para sincronizar' : 'Sem conexão no momento'}</p>
            </div>
          </div>
        </ProfileTintCard>

        <div className="space-y-3">
          <ToggleSetting icon="layers" title="Modo Offline" description="Salvar treinos localmente quando a internet falhar" enabled={offlineMode} onToggle={toggleOffline} />
          <ToggleSetting icon="activity" title="Reduzir animações" description="Interface mais estável para aparelhos lentos" enabled={reducedMotion} onToggle={toggleMotion} />
        </div>

        {cacheStats && (
          <ProfileCard>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-black text-slate-950">Armazenamento local</p>
                <p className="text-[12px] font-medium text-slate-500">Dados salvos para acelerar o app.</p>
              </div>
              <DSIcon name="database" size={20} className="text-slate-400" />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <StatTile label="entradas" value={String(cacheStats.totalEntries)} />
              <StatTile label="estimado" value={`~${cacheStats.estimatedSizeMB} MB`} />
            </div>
            <Button variant="danger" className="w-full" loading={isClearing} onClick={clearCache}>
              <DSIcon name="trash2" size={16} />
              Limpar cache
            </Button>
          </ProfileCard>
        )}

        <ProfileTintCard tone="slate">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-slate-700 ring-1 ring-slate-200">
              <DSIcon name="info" size={18} />
            </div>
            <p className="text-[12px] font-medium leading-relaxed text-slate-600">
              Quando o modo offline estiver ativo, treinos recentes ficam disponíveis no aparelho e sincronizam quando a conexão voltar.
            </p>
          </div>
        </ProfileTintCard>
      </div>
    </ProfileDetailShell>
  )
}

function ToggleSetting({ icon, title, description, enabled, onToggle }: { icon: DSIconName; title: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-20 w-full items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-4 text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)] transition-all active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        <DSIcon name={icon} size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-black text-slate-950">{title}</p>
        <p className="mt-0.5 text-[12px] font-medium leading-snug text-slate-500">{description}</p>
      </div>
      <ProfileToggle enabled={enabled} />
    </button>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-[19px] font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase text-slate-400">{label}</p>
    </div>
  )
}
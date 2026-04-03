/**
 * src/app/(app)/social/page.tsx
 *
 * Sprint 35 — Social Features (placeholder)
 * Ranking, perfil público, feed — futuro
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui'

export default function SocialPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-14 z-20 flex items-center gap-3 bg-bg-primary/80 px-4 py-3 backdrop-blur-lg">
        <button aria-label="Voltar" onClick={() => router.back()} className="p-1">
          <DSIcon name="arrowLeft" className="h-5 w-5 text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Comunidade</h1>
      </header>

      {/* Coming soon */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/8">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">Em Breve</h2>
        <p className="text-center text-sm text-text-secondary">
          Ranking, desafios entre amigos, perfil público e feed de conquistas.
          Fique ligado!
        </p>
        <div className="mt-4 grid w-full max-w-xs grid-cols-3 gap-3">
          <FeaturePreview icon="🏅" label="Ranking" />
          <FeaturePreview icon="👥" label="Amigos" />
          <FeaturePreview icon="📊" label="Feed" />
        </div>
      </div>
    </div>
  )
}

function FeaturePreview({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-secondary p-3 opacity-50">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-medium text-text-muted">{label}</p>
    </div>
  )
}

/**
 * src/app/(app)/perfil/changelog/page.tsx
 *
 * Sprint 40 — Changelog / Novidades do App
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui'
import { APP_VERSION } from '../../../../../lib/version'

interface Release {
  version: string
  date: string
  highlights: string[]
  tag?: 'new' | 'fix' | 'improvement'
}

const RELEASES: Release[] = [
  {
    version: '7.0.0',
    date: '2026-03',
    tag: 'new',
    highlights: [
      '🎮 Sistema de Gamificação — XP, Níveis e Badges',
      '🔥 Streak tracker com milestones',
      '⚡ Desafios semanais',
      '📚 30+ dicas fitness categorizadas',
      '⚙️ Configurações offline & performance',
      '🛡️ Error boundaries em todas as telas',
      '📊 Testes unitários expandidos',
    ],
  },
  {
    version: '6.7.0',
    date: '2026-02',
    highlights: [
      '🏋️ Explorar templates de treino',
      '📝 Criar treino manual',
      '📏 Medidas corporais com gráficos',
      '🩺 Auto-avaliação com IMC',
      '🔧 Equipamentos da academia',
      '💳 Gestão de assinatura',
      '📊 Progresso detalhado com heatmap',
    ],
  },
  {
    version: '6.5.0',
    date: '2026-01',
    highlights: [
      '🏠 Nova Home com dashboard',
      '🏆 Tab de progresso completa',
      '📱 PWA com suporte offline',
      '🎨 Design system VFIT',
      '🔔 Notificações push',
    ],
  },
]

export default function ChangelogPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-14 z-20 flex items-center gap-3 border-b border-white/8 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
        >
          <DSIcon name="arrowLeft" className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Novidades</h1>
      </header>

      <div className="space-y-6 px-4 pt-2">
        {/* Versão atual */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
          <p className="text-xs font-medium text-brand-primary">
            Versão Atual
          </p>
          <p className="text-2xl font-black text-text-primary">
            {APP_VERSION || '7.0.0'}
          </p>
        </div>

        {/* Releases */}
        {RELEASES.map((release) => (
          <div key={release.version} className="rounded-xl bg-bg-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">
                  v{release.version}
                </span>
                {release.tag === 'new' && (
                  <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    NOVO
                  </span>
                )}
              </div>
              <span className="text-xs text-text-muted">{release.date}</span>
            </div>
            <ul className="space-y-1.5">
              {release.highlights.map((h, i) => (
                <li key={i} className="text-xs leading-relaxed text-text-secondary">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

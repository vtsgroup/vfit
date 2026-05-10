/**
 * src/app/(app)/perfil/changelog/page.tsx
 *
 * Sprint 40 — Changelog / Novidades do App
 */

'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { APP_VERSION } from '../../../../../lib/version'

interface Release {
  version: string
  date: string
  tag?: 'new' | 'fix' | 'improvement'
  highlights: { icon: DSIconName; text: string }[]
}

const RELEASES: Release[] = [
  {
    version: '7.0.0',
    date: '2026-03',
    tag: 'new',
    highlights: [
      { icon: 'trophy', text: 'Sistema de gamificação com XP, níveis e badges' },
      { icon: 'flame', text: 'Streak tracker com milestones de consistência' },
      { icon: 'zap', text: 'Desafios semanais com recompensas de XP' },
      { icon: 'sparkles', text: '30+ dicas fitness categorizadas' },
      { icon: 'settings', text: 'Configurações offline e performance' },
      { icon: 'shield', text: 'Error boundaries em todas as telas críticas' },
      { icon: 'barChart', text: 'Testes unitários expandidos' },
    ],
  },
  {
    version: '6.7.0',
    date: '2026-02',
    highlights: [
      { icon: 'dumbbell', text: 'Explorar templates de treino' },
      { icon: 'edit3', text: 'Criar treino manual' },
      { icon: 'ruler', text: 'Medidas corporais com gráficos' },
      { icon: 'activity', text: 'Auto-avaliação com IMC' },
      { icon: 'settings', text: 'Equipamentos da academia' },
      { icon: 'creditCard', text: 'Gestão de assinatura' },
      { icon: 'barChart', text: 'Progresso detalhado com heatmap' },
    ],
  },
  {
    version: '6.5.0',
    date: '2026-01',
    highlights: [
      { icon: 'home', text: 'Nova home com dashboard' },
      { icon: 'trophy', text: 'Aba de progresso completa' },
      { icon: 'smartphone', text: 'PWA com suporte offline' },
      { icon: 'palette', text: 'Design system VFIT' },
      { icon: 'bell', text: 'Notificações push' },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <ProfileDetailShell
      title="Novidades"
      subtitle="Melhorias recentes, correções e novos recursos que chegaram no app."
      icon="sparkles"
      tone="violet"
      meta={<ProfilePill tone="emerald">Versão atual {APP_VERSION || '7.0.0'}</ProfilePill>}
    >
      <div className="space-y-5">
        <ProfileTintCard tone="violet">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card-lg bg-slate-950 text-emerald-300">
              <DSIcon name="sparkles" size={25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black uppercase text-violet-700">Instalado agora</p>
              <p className="text-[30px] font-black leading-none text-slate-950">v{APP_VERSION || '7.0.0'}</p>
              <p className="mt-1 text-[12px] font-medium text-slate-500">O app está atualizado com a versão mais recente publicada.</p>
            </div>
          </div>
        </ProfileTintCard>

        {RELEASES.map((release) => (
          <ProfileCard key={release.version}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-slate-500">{release.date}</p>
                <h2 className="text-[19px] font-black text-slate-950">v{release.version}</h2>
              </div>
              {release.tag === 'new' && <ProfilePill tone="emerald">Novo</ProfilePill>}
            </div>

            <div className="space-y-2.5">
              {release.highlights.map((highlight) => (
                <div key={highlight.text} className="flex items-start gap-3 rounded-[18px] bg-slate-50 px-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-white text-emerald-600 ring-1 ring-slate-200">
                    <DSIcon name={highlight.icon} size={17} />
                  </div>
                  <p className="pt-1 text-[13px] font-bold leading-snug text-slate-700">{highlight.text}</p>
                </div>
              ))}
            </div>
          </ProfileCard>
        ))}
      </div>
    </ProfileDetailShell>
  )
}
'use client'

import { useEffect } from 'react'
import { UpsellV2Vitoria } from '@/components/lab-experiencia/upsell-v2a-vitoria'
import { UpsellV2Telemetria } from '@/components/lab-experiencia/upsell-v2b-telemetria'
import { UpsellV2AntesDepois } from '@/components/lab-experiencia/upsell-v2c-antes-depois'
import { NavV2Dock } from '@/components/lab-experiencia/nav-v2a-dock'
import { NavV2Cradle } from '@/components/lab-experiencia/nav-v2b-cradle'
import { NavV2Rail } from '@/components/lab-experiencia/nav-v2c-rail'
import { InstallBannerV2 } from '@/components/lab-experiencia/install-banner-v2'
import { IosGateV2 } from '@/components/lab-experiencia/ios-gate-v2'

const TRIGGER = {
  kind: 'aluno_concluiu' as const,
  headline: 'Marina fechou o treino de costas',
  detail: 'Aluno nº 12 · Costas e Bíceps · 19:42',
}

const noop = () => undefined

function Label({ name, thesis }: { name: string; thesis: string }) {
  return (
    <div className="mx-4 mb-3 mt-12 border-l-2 border-brand-primary pl-3">
      <p className="text-[13px] font-black uppercase tracking-[0.14em] text-white">{name}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{thesis}</p>
    </div>
  )
}

export function PromptsPreviewClient() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    document.documentElement.style.backgroundColor = '#050A12'
  }, [])

  return (
    <div className="min-h-screen bg-[#050A12] pb-24">
      <main className="mx-auto max-w-lg">
        <p className="mx-4 pt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Fase 2 · Experiência 1000 — escolha por seção
        </p>

        <section id="upsell-a">
          <Label name="UPSELL A · Ficha de Vitória" thesis="Celebra a vitória do personal, conecta ao Pro em 1 linha" />
          <div className="px-4"><UpsellV2Vitoria trigger={TRIGGER} onDismiss={noop} onUpgrade={noop} /></div>
        </section>

        <section id="upsell-b">
          <Label name="UPSELL B · Leitura de Telemetria" thesis="A vitória como métrica ao vivo em HUD mono" />
          <div className="px-4"><UpsellV2Telemetria trigger={TRIGGER} onDismiss={noop} onUpgrade={noop} /></div>
        </section>

        <section id="upsell-c">
          <Label name="UPSELL C · Hoje vs Pro" thesis="Só o delta que importa para ESTE momento" />
          <div className="px-4"><UpsellV2AntesDepois trigger={TRIGGER} onDismiss={noop} onUpgrade={noop} /></div>
        </section>

        <section id="nav-a">
          <Label name="NAVBAR A · Dock Flutuante" thesis="Descolada das bordas, chanfros, FAB integrado no dock" />
          <NavV2Dock activeTab="treinos" inline />
        </section>

        <section id="nav-b">
          <Label name="NAVBAR B · Berço do FAB" thesis="Recorte côncavo usinado abraçando o botão IA" />
          <NavV2Cradle activeTab="treinos" inline />
        </section>

        <section id="nav-c">
          <Label name="NAVBAR C · Rail Minimalista" thesis="Ícones mudos; o ativo expande revelando o label" />
          <NavV2Rail activeTab="treinos" inline />
        </section>

        <section id="banner">
          <Label name="INSTALL BANNER V2" thesis="1 linha honesta, 64px, zero estrelas fake" />
          <InstallBannerV2 platform="android" onInstall={noop} onDismiss={noop} inline />
        </section>

        <section id="gate">
          <Label name="GATE iOS V2 · Pôster" thesis="Cinematográfico curto, sempre pulável, 1x no máximo" />
          <IosGateV2 onSkip={noop} onShowInstructions={noop} />
        </section>
      </main>
    </div>
  )
}

/**
 * src/app/(app)/perfil/sobre/page.tsx
 *
 * Sobre o app — versão, links, créditos
 */

'use client'

import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { APP_VERSION, BUILD_DATE, BUILD_NUMBER } from '../../../../../lib/version'

const buildShort = String(BUILD_NUMBER).slice(-6)
const buildDate = `${BUILD_DATE.slice(8, 10)}/${BUILD_DATE.slice(5, 7)}/${BUILD_DATE.slice(0, 4)}`

export default function SobrePage() {
  return (
    <ProfileDetailShell
      title="Sobre o VFIT"
      subtitle="Versão, suporte, privacidade e detalhes técnicos do app."
      icon="helpCircle"
      tone="violet"
      meta={
        <div className="flex flex-wrap gap-2">
          <ProfilePill tone="emerald">v{APP_VERSION}</ProfilePill>
          <ProfilePill tone="slate">build {buildShort}</ProfilePill>
        </div>
      }
    >
      <div className="space-y-5">
        <ProfileTintCard tone="violet" className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-white bg-slate-950 text-emerald-300 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.8)]">
            <DSIcon name="dumbbell" size={35} />
          </div>
          <h2 className="mt-4 text-[26px] font-black leading-none text-slate-950">VFIT</h2>
          <p className="mx-auto mt-2 max-w-72 text-[13px] font-medium leading-relaxed text-slate-600">
            Treino inteligente, rotina simples e evolução acompanhada com IA.
          </p>
        </ProfileTintCard>

        <ProfileCard>
          <div className="grid grid-cols-3 gap-2">
            <InfoTile label="Versão" value={APP_VERSION} />
            <InfoTile label="Build" value={buildShort} />
            <InfoTile label="Atualizado" value={buildDate} />
          </div>
        </ProfileCard>

        <ProfileCard className="p-2">
          <LinkItem icon="shield" label="Política de Privacidade" detail="Dados, LGPD e permissões" href="/privacidade" />
          <LinkItem icon="fileText" label="Termos de Uso" detail="Regras e condições da plataforma" href="/termos" />
          <LinkItem icon="mail" label="Central de Ajuda" detail="suporte@vfit.app.br" href="mailto:suporte@vfit.app.br" />
        </ProfileCard>

        <ProfileCard className="text-center">
          <p className="text-[12px] font-bold text-slate-500">© 2026 VFIT</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Todos os direitos reservados.</p>
        </ProfileCard>
      </div>
    </ProfileDetailShell>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-2 py-3 text-center">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-[12px] font-black text-slate-950">{value}</p>
    </div>
  )
}

function LinkItem({ icon, label, detail, href }: { icon: DSIconName; label: string; detail: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-16 items-center gap-3 rounded-[22px] px-3 py-3 text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-[0.99]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-violet-50 text-violet-600 ring-1 ring-violet-100">
        <DSIcon name={icon} size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-black text-slate-950">{label}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{detail}</p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-violet-500 transition-transform group-hover:translate-x-0.5">
        <DSIcon name="chevronRight" size={15} />
      </div>
    </Link>
  )
}
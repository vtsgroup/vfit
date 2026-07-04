'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { hapticLight } from '@/lib/haptics'

// NAVBAR C — RAIL MINIMALISTA
// Barra baixa (h-14), ícones apenas. O item ativo expande numa cápsula
// chanfrada emerald revelando o label; inativos ficam mudos. FAB IA como
// losango chanfrado central. Fibra de carbono 3px + hairline emerald.

export interface NavV2Props {
  activeTab?: 'treinos' | 'nutricao' | 'ia' | 'avaliacoes' | 'perfil'
  inline?: boolean
}

type TabId = NonNullable<NavV2Props['activeTab']>

const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')
const CHAMFER_CAPSULE = 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))'
const CHAMFER_DIAMOND =
  'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)'

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="19.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NutricaoIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="9" r="4.5" fill="currentColor" />
        <path d="M3 18c0-3 3.5-4.5 9-4.5s9 1.5 9 4.5v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V18z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 18c0-2.8 3.5-4 8.5-4s8.5 1.2 8.5 4v2a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5V18z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 2H9a1 1 0 00-1 1v1H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1z" fill="currentColor" />
        <path d="M8.5 13l2.5 2.5L16 10" stroke="#050A12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 2.5h6a.5.5 0 01.5.5v1.5h2.5A1.5 1.5 0 0119.5 6v15a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 21V6A1.5 1.5 0 016 4.5h2.5V3a.5.5 0 01.5-.5z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path d="M3 18.5C3 15.5 7.5 14 12 14s9 1.5 9 4.5v2a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 18.5C3.5 15.5 7.5 14.5 12 14.5s8.5 1 8.5 4v1.5a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5v-1.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2.5L13.6 8.8L20 10.5L13.6 12.2L12 18.5L10.4 12.2L4 10.5L10.4 8.8L12 2.5Z" fill="rgba(3,12,5,0.92)" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="rgba(3,12,5,0.72)" />
      <circle cx="6.5" cy="17.5" r="1.2" fill="rgba(3,12,5,0.46)" />
    </svg>
  )
}

interface RailTab {
  id: Exclude<TabId, 'ia'>
  label: string
  href: string
  icon: (active: boolean) => ReactNode
}

const LEFT_TABS: RailTab[] = [
  { id: 'treinos', label: 'Treinos', href: '/treinos', icon: (a) => <TreinosIcon active={a} /> },
  { id: 'nutricao', label: 'Nutrição', href: '/nutricao', icon: (a) => <NutricaoIcon active={a} /> },
]
const RIGHT_TABS: RailTab[] = [
  { id: 'avaliacoes', label: 'Avaliações', href: '/avaliacoes', icon: (a) => <AvaliacoesIcon active={a} /> },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: (a) => <PerfilIcon active={a} /> },
]

function RailItem({ tab, active }: { tab: RailTab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      prefetch
      onClick={() => hapticLight()}
      aria-label={tab.label}
      aria-current={active ? 'page' : undefined}
      className="group relative flex h-11 min-w-11 items-center justify-center transition-transform duration-150 active:translate-y-px active:scale-95"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Cápsula chanfrada — só respira quando o item é o ativo */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-1 inset-x-0 transition-opacity duration-200 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
        style={{
          clipPath: CHAMFER_CAPSULE,
          background: 'linear-gradient(180deg, rgba(52,211,153,0.15) 0%, rgba(34,197,94,0.06) 100%)',
          boxShadow: 'inset 2px 0 0 rgba(52,211,153,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />
      <span
        className={`relative z-10 flex items-center px-3 transition-colors duration-200 ${
          active ? 'text-emerald-300 drop-shadow-[0_0_9px_rgba(52,211,153,0.3)]' : 'text-slate-500 group-hover:text-slate-300'
        }`}
      >
        {tab.icon(active)}
        {/* Label revelado por transição de width — silêncio nos inativos */}
        <span
          className="overflow-hidden whitespace-nowrap text-[10px] font-black italic uppercase tracking-[0.12em] text-emerald-200 transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{
            maxWidth: active ? 92 : 0,
            opacity: active ? 1 : 0,
            paddingLeft: active ? 8 : 0,
            transform: 'skewX(-6deg)',
          }}
        >
          {tab.label}
        </span>
      </span>
    </Link>
  )
}

function DiamondFab({ active }: { active: boolean }) {
  return (
    <Link
      href="/ia"
      prefetch
      onClick={() => hapticLight()}
      aria-label="IA"
      aria-current={active ? 'page' : undefined}
      className="relative -mt-7 flex h-14 w-14 items-center justify-center transition-transform duration-150 active:translate-y-0.5 active:scale-95"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Losango chanfrado — clip-path + rotate, gradiente emerald 3D */}
      <span
        aria-hidden
        className="absolute inset-[5px]"
        style={{
          filter: active
            ? 'drop-shadow(0 6px 14px rgba(6,95,70,0.7)) drop-shadow(0 0 16px rgba(52,211,153,0.55))'
            : 'drop-shadow(0 6px 14px rgba(6,95,70,0.65)) drop-shadow(0 0 10px rgba(52,211,153,0.28))',
        }}
      >
        <span
          className="absolute inset-0 block"
          style={{
            transform: 'rotate(45deg)',
            clipPath: CHAMFER_DIAMOND,
            background: active
              ? 'linear-gradient(180deg, #4ade80 0%, #22C55E 45%, #16803d 100%)'
              : 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -6px 12px rgba(2,44,34,0.35)',
          }}
        />
      </span>
      <span className="relative z-10">
        <AISparkleIcon />
      </span>
    </Link>
  )
}

export function NavV2Rail({ activeTab = 'treinos', inline = false }: NavV2Props) {
  return (
    <nav
      aria-label="Navegação principal"
      className={`left-0 right-0 z-45 bg-[#050A12] ${inline ? 'relative' : 'fixed bottom-0'}`}
    >
      <div
        className="relative w-full overflow-visible"
        style={inline ? undefined : { paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Painel carbono — fibra 3px sobre grafite, nunca bloqueia toques */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `${CARBON}, radial-gradient(circle at 50% -60%, rgba(34,197,94,0.09), transparent 60%), linear-gradient(180deg, rgba(13,17,23,0.98) 0%, rgba(5,10,18,1) 100%)`,
            boxShadow: '0 -5px 24px rgba(0,0,0,0.4)',
          }}
        />
        {/* Hairline emerald — assinatura do painel */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/45 to-transparent" />

        <div className="relative flex h-14 items-center justify-around px-2">
          {LEFT_TABS.map((tab) => (
            <RailItem key={tab.id} tab={tab} active={activeTab === tab.id} />
          ))}
          <DiamondFab active={activeTab === 'ia'} />
          {RIGHT_TABS.map((tab) => (
            <RailItem key={tab.id} tab={tab} active={activeTab === tab.id} />
          ))}
        </div>
      </div>
    </nav>
  )
}

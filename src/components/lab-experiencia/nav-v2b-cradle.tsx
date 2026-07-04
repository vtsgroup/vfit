'use client'

/**
 * NAV V2B — Berço do FAB.
 * Recorte côncavo REAL no centro da barra (mask radial no painel carbono):
 * o FAB emerald encaixa meio-dentro/meio-fora e o berço abraça o botão.
 * Hairline emerald acompanha a curva do recorte; chanfro usinado via bevel
 * externo + sombra de rebaixo dentro do berço.
 */

import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface NavV2Props {
  activeTab?: 'treinos' | 'nutricao' | 'ia' | 'avaliacoes' | 'perfil'
  inline?: boolean
}

const NOTCH_R = 34
const FAB_SIZE = 56
const CHAMFER_PILL = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
const NOTCH_MASK = `radial-gradient(circle ${NOTCH_R}px at 50% 0px, transparent 99%, #000 100%)`
const PANEL_BG = [
  `radial-gradient(circle at 50% 0px, transparent ${NOTCH_R - 3}px, rgba(0,0,0,0.55) ${NOTCH_R - 1}px, rgba(0,0,0,0) ${NOTCH_R + 18}px)`,
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
  'radial-gradient(circle at 50% 0px, rgba(34,197,94,0.13), transparent 58%)',
  'linear-gradient(180deg, rgba(13,17,23,0.97) 0%, rgba(9,12,17,0.99) 55%, #050A12 100%)',
].join(', ')

function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8)
}

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4.5" fill="currentColor" />
        <path d="M3 18c0-3 3.5-4.5 9-4.5s9 1.5 9 4.5v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V18z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18c0-2.8 3.5-4 8.5-4s8.5 1.2 8.5 4v2a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5V18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M15 2H9a1 1 0 00-1 1v1H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1z" fill="currentColor" />
        <path d="M8.5 13l2.5 2.5L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 2.5h6a.5.5 0 01.5.5v1.5h2.5A1.5 1.5 0 0119.5 6v15a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 21V6A1.5 1.5 0 016 4.5h2.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path d="M3 18.5C3 15.5 7.5 14 12 14s9 1.5 9 4.5v2a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18.5C3.5 15.5 7.5 14.5 12 14.5s8.5 1 8.5 4v1.5a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5v-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AISparkleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5L13.6 8.8L20 10.5L13.6 12.2L12 18.5L10.4 12.2L4 10.5L10.4 8.8L12 2.5Z" fill="rgba(3,12,5,0.92)" />
      <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="rgba(3,12,5,0.72)" />
      <circle cx="6.5" cy="17.5" r="1.2" fill="rgba(3,12,5,0.46)" />
    </svg>
  )
}

interface SideTab {
  id: NonNullable<NavV2Props['activeTab']>
  label: string
  href: string
  icon: (active: boolean) => React.ReactNode
}

const LEFT_TABS: SideTab[] = [
  { id: 'treinos', label: 'Treinos', href: '/treinos', icon: (a) => <TreinosIcon active={a} /> },
  { id: 'nutricao', label: 'Nutrição', href: '/nutricao', icon: (a) => <NutricaoIcon active={a} /> },
]

const RIGHT_TABS: SideTab[] = [
  { id: 'avaliacoes', label: 'Avaliações', href: '/avaliacoes', icon: (a) => <AvaliacoesIcon active={a} /> },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: (a) => <PerfilIcon active={a} /> },
]

function TabItem({ tab, active }: { tab: SideTab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      prefetch={true}
      onClick={haptic}
      aria-current={active ? 'page' : undefined}
      className="group relative flex h-full min-w-11 flex-1 flex-col items-center justify-end pb-1.5 transition-transform duration-200 active:translate-y-0.5 active:scale-[0.92]"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative mb-1 flex h-8 w-13 items-center justify-center">
        {active && (
          <div
            className="absolute inset-0 border-l-2 border-emerald-400/60 bg-linear-to-b from-emerald-300/16 to-emerald-500/6 shadow-[0_0_20px_rgba(34,197,94,0.18),inset_0_1px_0_rgba(255,255,255,0.10)]"
            style={{ clipPath: CHAMFER_PILL }}
          />
        )}
        <div
          className={cn(
            'relative z-10 transition-colors duration-200',
            active ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.28)]' : 'text-slate-400 group-hover:text-emerald-100'
          )}
        >
          {tab.icon(active)}
        </div>
      </div>
      <span
        className={cn(
          'text-[9px] leading-none tracking-[0.3px] transition-colors duration-200',
          active ? 'font-black italic text-emerald-300' : 'font-semibold text-slate-400'
        )}
      >
        {tab.label}
      </span>
    </Link>
  )
}

export function NavV2Cradle({ activeTab = 'treinos', inline = false }: NavV2Props) {
  const iaActive = activeTab === 'ia'
  const fabShadow = [
    '0 5px 0 #064e3b',
    '0 14px 30px -10px rgba(6,95,70,0.9)',
    iaActive ? '0 0 46px -10px rgba(52,211,153,0.95)' : '0 0 32px -14px rgba(52,211,153,0.7)',
    'inset 0 1px 0 rgba(255,255,255,0.25)',
  ].join(', ')

  return (
    <nav
      aria-label="Navegação principal"
      className={cn('left-0 right-0 z-45 lg:hidden', inline ? 'relative' : 'fixed bottom-0')}
    >
      <style>{`
        @keyframes vfit-lab2b-glow {
          0%, 100% { box-shadow: 0 5px 0 #064e3b, 0 14px 30px -10px rgba(6,95,70,0.9), 0 0 30px -14px rgba(52,211,153,0.65), inset 0 1px 0 rgba(255,255,255,0.25); }
          50% { box-shadow: 0 5px 0 #064e3b, 0 14px 30px -10px rgba(6,95,70,0.9), 0 0 44px -11px rgba(52,211,153,0.95), inset 0 1px 0 rgba(255,255,255,0.3); }
        }
      `}</style>

      <div
        className="relative"
        style={{ paddingBottom: inline ? undefined : 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Painel carbono com o recorte côncavo usinado — o drop-shadow no pai
            segue a forma do berço, então a sombra abraça a curva */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: 'drop-shadow(0 -8px 22px rgba(0,0,0,0.45))' }}
        >
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage: NOTCH_MASK,
              maskImage: NOTCH_MASK,
              background: PANEL_BG,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Hairline emerald acompanhando a curva do recorte + bevel usinado */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 overflow-hidden">
          <div
            className="absolute rounded-full border border-white/6"
            style={{ width: (NOTCH_R + 4) * 2, height: (NOTCH_R + 4) * 2, left: `calc(50% - ${NOTCH_R + 4}px)`, top: -(NOTCH_R + 4) }}
          />
          <div
            className="absolute rounded-full border border-emerald-400/55"
            style={{
              width: NOTCH_R * 2,
              height: NOTCH_R * 2,
              left: `calc(50% - ${NOTCH_R}px)`,
              top: -NOTCH_R,
              boxShadow: '0 0 14px rgba(52,211,153,0.25)',
            }}
          />
        </div>
        {/* Hairlines retas que morrem exatamente onde a curva nasce */}
        <div
          className="pointer-events-none absolute top-0 h-px"
          style={{ left: 0, right: `calc(50% + ${NOTCH_R - 1}px)`, background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5))' }}
        />
        <div
          className="pointer-events-none absolute top-0 h-px"
          style={{ right: 0, left: `calc(50% + ${NOTCH_R - 1}px)`, background: 'linear-gradient(270deg, transparent, rgba(52,211,153,0.5))' }}
        />

        {/* Itens */}
        <div className="relative flex px-1" style={{ height: 64 }}>
          {LEFT_TABS.map((tab) => (
            <TabItem key={tab.id} tab={tab} active={activeTab === tab.id} />
          ))}

          {/* Berço central — FAB meio-dentro/meio-fora */}
          <div className="relative flex h-full flex-1 flex-col items-center justify-end pb-1.5">
            <Link
              href="/ia"
              prefetch={true}
              onClick={haptic}
              aria-label="Assistente IA"
              aria-current={iaActive ? 'page' : undefined}
              className={cn(
                'absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border transition-transform duration-200 active:translate-y-0.5 active:scale-95 motion-reduce:[animation:none]!',
                iaActive ? 'border-emerald-300/60' : 'border-emerald-900/70'
              )}
              style={{
                top: -(FAB_SIZE / 2),
                width: FAB_SIZE,
                height: FAB_SIZE,
                background: 'linear-gradient(180deg, #6ee7b7 0%, #10b981 48%, #047857 100%)',
                boxShadow: fabShadow,
                animation: 'vfit-lab2b-glow 3.4s ease-in-out infinite',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <AISparkleIcon />
            </Link>
            <span className={cn('text-[9px] font-black italic leading-none tracking-[0.3px]', iaActive ? 'text-emerald-300' : 'text-emerald-400/80')}>
              IA
            </span>
          </div>

          {RIGHT_TABS.map((tab) => (
            <TabItem key={tab.id} tab={tab} active={activeTab === tab.id} />
          ))}
        </div>
      </div>
    </nav>
  )
}

'use client'

import { DSIcon } from '@/components/ui/ds-icon'

// INSTALL BANNER V2 — linguagem carbono, 1 linha, ≤64px.
// Fibra 3px + hairline emerald no topo (assinatura do hero campeão),
// ícone do app em bloco emerald chanfrado, copy honesta por plataforma.
const CHAMFER_ICON = 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))'
const CHAMFER_CTA = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

const COPY: Record<InstallBannerV2Props['platform'], string> = {
  ios: 'Adicione o VFIT à tela de início — tela cheia e offline',
  android: 'Instale o VFIT — tela cheia e offline',
  desktop: 'Instale o VFIT — abre direto, sem abas',
}

export interface InstallBannerV2Props {
  platform: 'ios' | 'android' | 'desktop'
  onInstall: () => void
  onDismiss: () => void
  inline?: boolean
}

export function InstallBannerV2({ platform, onInstall, onDismiss, inline = false }: InstallBannerV2Props) {
  return (
    <div
      role="region"
      aria-label="Instalar o aplicativo VFIT"
      className={`${inline ? 'relative' : 'fixed inset-x-0 bottom-0 z-50'} bg-[#050A12]`}
      style={inline ? undefined : { paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="relative h-16 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #10151c 0%, #0b0f16 60%, #050A12 100%)',
          boxShadow: '0 -6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div
          className="pointer-events-none absolute -top-6 left-6 h-20 w-32"
          style={{ background: 'radial-gradient(circle at 30% 0%, rgba(34,197,94,0.12), transparent 65%)' }}
        />

        <div className="relative flex h-full items-center gap-3 pl-3 pr-1">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center"
            style={{
              clipPath: CHAMFER_ICON,
              background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
            }}
            aria-hidden
          >
            <span
              className="text-[20px] font-black italic leading-none text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.45)]"
              style={{ transform: 'skewX(-6deg)' }}
            >
              V
            </span>
          </div>

          <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold leading-tight text-slate-200">
            {COPY[platform]}
          </p>

          <button
            type="button"
            onClick={onInstall}
            className="flex h-11 shrink-0 items-center gap-1.5 px-4 text-[13px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
            style={{
              clipPath: CHAMFER_CTA,
              background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
            }}
          >
            <DSIcon name="arrowDownToLine" size={14} />
            Instalar
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dispensar aviso de instalação"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 transition-colors duration-150 hover:text-slate-300 active:translate-y-px active:text-slate-400"
          >
            <DSIcon name="x" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

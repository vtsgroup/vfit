'use client'

import { DSIcon } from '@/components/ui/ds-icon'

// Gate iOS V2 — pôster carbono cinematográfico, sempre pulável.
// Uma promessa, três micro-provas, um CTA. Zero formulário.

export interface IosGateV2Props {
  onSkip: () => void
  onShowInstructions: () => void
}

const CHAMFER_CTA = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
const CHAMFER_BLOCK = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'
const CHAMFER_SKIP = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

function MicroProof({ icon, label }: { icon: 'wifi' | 'fingerprint' | 'zap'; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <DSIcon name={icon} size={13} className="text-emerald-400/90" />
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{label}</span>
    </span>
  )
}

export function IosGateV2({ onSkip, onShowInstructions }: IosGateV2Props) {
  return (
    <div className="relative flex min-h-[600px] flex-col overflow-hidden text-white">
      <style>{`
        @keyframes vfit-labg2-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vfit-labg2-forge { from { opacity: 0; transform: translateY(18px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes vfit-labg2-sweep { from { transform: translateX(-140%) skewX(-30deg); opacity: 0; } 60% { opacity: 1; } to { transform: translateX(0) skewX(-30deg); opacity: 1; } }
        @keyframes vfit-labg2-glow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}</style>

      {/* Fundo: nasce no dark da página e aprofunda para o grafite do painel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #050A12 0%, #0d1117 38%, #10151c 68%, #0a0e14 100%)' }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 [animation:vfit-labg2-glow_4.5s_ease-in-out_infinite] motion-reduce:[animation:none]"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.16), transparent 62%)' }}
      />

      {/* Topo: contexto + saída SEMPRE visível */}
      <div className="relative flex items-center justify-between px-5 pt-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400">
          VFIT · Modo app
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="flex h-11 min-w-[44px] items-center gap-1 border border-white/12 bg-white/4 px-3.5 text-[12px] font-bold text-slate-300 transition-all duration-150 hover:bg-white/8 hover:text-white active:translate-y-px active:brightness-90"
          style={{ clipPath: CHAMFER_SKIP }}
        >
          Agora não
          <DSIcon name="x" size={13} className="text-slate-400" />
        </button>
      </div>

      {/* Centro: peça usinada + promessa */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="relative [animation:vfit-labg2-forge_.7s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]">
          {/* Chapa de fundo deslocada — profundidade de peça fresada */}
          <div
            className="absolute -left-2 top-2 h-[104px] w-[104px] bg-emerald-500/14"
            style={{ clipPath: CHAMFER_BLOCK }}
            aria-hidden
          />
          <div
            className="relative flex h-[104px] w-[104px] items-center justify-center overflow-hidden"
            style={{
              clipPath: CHAMFER_BLOCK,
              background: 'linear-gradient(160deg, #1a2029 0%, #10151c 55%, #0b0f15 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -8px 18px rgba(0,0,0,0.5)',
            }}
          >
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 42%, rgba(34,197,94,0.22), transparent 68%)' }}
            />
            <DSIcon
              name="dumbbell"
              size={44}
              className="relative text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.55)]"
            />
            {/* Hairline emerald na base do bloco — assinatura da linguagem */}
            <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/70 to-transparent" />
          </div>
          {/* Linhas de velocidade — mesma assinatura do hero */}
          <div
            className="pointer-events-none absolute -right-7 top-1 flex gap-1.5 [animation:vfit-labg2-sweep_.7s_ease-out_.25s_both] motion-reduce:[animation:none]"
            style={{ transform: 'skewX(-30deg)' }}
            aria-hidden
          >
            <div className="h-8 w-[3px] bg-emerald-400/70" />
            <div className="h-8 w-[3px] bg-emerald-400/35" />
            <div className="h-8 w-[3px] bg-emerald-400/15" />
          </div>
        </div>

        <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400 [animation:vfit-labg2-rise_.6s_ease-out_.15s_both] motion-reduce:[animation:none]">
          Instale na tela de início
        </p>
        <h1
          className="mt-2 max-w-[300px] text-center text-[34px] font-black italic leading-[0.96] tracking-tight text-white [animation:vfit-labg2-rise_.6s_ease-out_.22s_both] motion-reduce:[animation:none]"
          style={{ transform: 'skewX(-6deg)' }}
        >
          O VFIT inteiro,
          <br />
          em tela cheia
        </h1>

        {/* Micro-provas — linha horizontal única */}
        <div className="mt-6 flex items-center gap-3 [animation:vfit-labg2-rise_.6s_ease-out_.32s_both] motion-reduce:[animation:none]">
          <MicroProof icon="wifi" label="Offline" />
          <span className="h-3 w-px bg-emerald-500/30" aria-hidden />
          <MicroProof icon="fingerprint" label="Biometria" />
          <span className="h-3 w-px bg-emerald-500/30" aria-hidden />
          <MicroProof icon="zap" label="1 toque" />
        </div>
      </div>

      {/* Base: CTA único */}
      <div className="relative px-5 pb-6 [animation:vfit-labg2-rise_.6s_ease-out_.4s_both] motion-reduce:[animation:none]">
        <button
          type="button"
          onClick={onShowInstructions}
          className="flex h-13 min-h-[48px] w-full items-center justify-center gap-2 text-[15px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
          style={{
            clipPath: CHAMFER_CTA,
            background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 28px -10px rgba(34,197,94,0.5)',
          }}
        >
          <DSIcon name="arrowDownToLine" size={17} />
          Instalar em 10 segundos
        </button>
        <p className="mt-2.5 text-center text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
          Grátis · sem App Store · some depois de instalar
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
    </div>
  )
}

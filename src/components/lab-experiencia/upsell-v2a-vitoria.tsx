'use client'

import { DSIcon } from '@/components/ui/ds-icon'

// UPSELL A — Ficha de Vitória (linguagem carbono do hero campeão).
// Sheet ancorado na base: chanfros no topo, fibra 3px, hairline emerald.
// Vende O MOMENTO: celebra a vitória do personal e conecta ao que o Pro amplia.
const CHAMFER_SHEET = 'polygon(0 18px, 18px 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)'
const CHAMFER_CTA = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
const CHAMFER_SEAL = 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

export interface UpsellV2Props {
  trigger: { kind: 'aluno_concluiu' | 'novo_aluno' | 'marco_semanal'; headline: string; detail: string }
  planPrice?: string
  onDismiss: () => void
  onUpgrade: () => void
}

const PRO_LINE: Record<UpsellV2Props['trigger']['kind'], string> = {
  aluno_concluiu: 'No Pro, você acompanha cada aluno em tempo real.',
  novo_aluno: 'No Pro, sua agenda cresce sem limite de alunos.',
  marco_semanal: 'No Pro, cada semana dessas vira relatório automático.',
}

export function UpsellV2Vitoria({ trigger, planPrice = 'R$ 29,90', onDismiss, onUpgrade }: UpsellV2Props) {
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label="Vitória registrada — conheça o Pro"
      className="relative w-full text-white [animation:vfit-lab2a-rise_.45s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]"
    >
      <style>{`
        @keyframes vfit-lab2a-rise { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes vfit-lab2a-sweep { from { transform: translateX(-140%) skewX(-30deg); opacity: 0; } 60% { opacity: 1; } to { transform: translateX(0) skewX(-30deg); opacity: 1; } }
      `}</style>

      <div
        className="relative overflow-hidden shadow-[0_-16px_48px_rgba(0,0,0,0.55)]"
        style={{
          clipPath: CHAMFER_SHEET,
          background: 'linear-gradient(to top, #050A12 0%, #10151c 55%, #161b22 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
        <div
          className="pointer-events-none absolute -top-12 left-1/2 h-40 w-64 -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.16), transparent 68%)' }}
        />
        {/* Hairline emerald — assinatura do hero, espelhada no topo do sheet */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/55 to-transparent" />
        {/* Riscas de velocidade — mesmo gesto do hero */}
        <div
          className="pointer-events-none absolute right-5 top-4 flex gap-1.5 [animation:vfit-lab2a-sweep_.7s_ease-out_.15s_both] motion-reduce:[animation:none]"
          style={{ transform: 'skewX(-30deg)' }}
          aria-hidden
        >
          <div className="h-7 w-[3px] bg-emerald-400/70" />
          <div className="h-7 w-[3px] bg-emerald-400/35" />
          <div className="h-7 w-[3px] bg-emerald-400/15" />
        </div>

        <div className="relative px-5 pb-5 pt-5">
          {/* Selo de vitória */}
          <div className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center text-emerald-950"
              style={{
                clipPath: CHAMFER_SEAL,
                background: 'linear-gradient(180deg, #4ade80 0%, #22C55E 60%, #16a34a 100%)',
              }}
            >
              <DSIcon name="check" size={13} />
            </span>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              {trigger.detail}
            </p>
          </div>

          {/* Headline — celebra primeiro */}
          <h2
            className="mt-3 text-[24px] font-black italic leading-[1.02] tracking-tight text-white"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}
          >
            {trigger.headline}
          </h2>

          {/* UMA linha conectando ao Pro */}
          <p className="mt-2 border-l-2 border-emerald-500/40 pl-2.5 text-[13px] font-medium leading-snug text-slate-300">
            {PRO_LINE[trigger.kind]}
          </p>

          {/* CTA emerald chanfrado */}
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
            style={{
              clipPath: CHAMFER_CTA,
              background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
            }}
          >
            Ativar o Pro · {planPrice}/mês
            <DSIcon name="arrowRight" size={16} />
          </button>

          {/* Saída fácil — ghost */}
          <button
            type="button"
            onClick={onDismiss}
            className="mt-1.5 flex h-11 w-full items-center justify-center text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-slate-200 active:translate-y-px active:text-slate-500"
          >
            Agora não
          </button>
        </div>
      </div>
    </section>
  )
}

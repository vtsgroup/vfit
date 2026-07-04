'use client'

import { useEffect, useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

// UPSELL B — LEITURA DE TELEMETRIA
// A vitória do personal lida como instrumento de painel: canal mono com
// brackets, leitura ao vivo, projeção do que o Pro destrava NESSA métrica.
// Linguagem carbono do hero campeão: fibra 3px, chanfros, hairline emerald,
// numerais italic skewX(-6deg), CTA com gradiente emerald 3D.

export interface UpsellV2Props {
  trigger: {
    kind: 'aluno_concluiu' | 'novo_aluno' | 'marco_semanal'
    headline: string
    detail: string
  }
  planPrice?: string
  onDismiss: () => void
  onUpgrade: () => void
}

const CHAMFER_CARD = 'polygon(0 14px, 14px 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)'
const CHAMFER_CTA = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
const CHAMFER_READ = 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

interface KindSpec {
  channel: string
  signal: string
  icon: DSIconName
  projection: string
}

const KIND_SPEC: Record<UpsellV2Props['trigger']['kind'], KindSpec> = {
  aluno_concluiu: {
    channel: 'CH_01',
    signal: 'TREINO_CONCLUÍDO',
    icon: 'checkCheck',
    projection:
      'Com relatórios Pro, esta leitura vira histórico: carga, volume e frequência deste aluno, sessão a sessão.',
  },
  novo_aluno: {
    channel: 'CH_02',
    signal: 'NOVO_ALUNO',
    icon: 'userPlus',
    projection:
      'No Pro, sem teto de alunos: cada novo cadastro entra direto na sua telemetria, sem bloqueio de vaga.',
  },
  marco_semanal: {
    channel: 'CH_03',
    signal: 'MARCO_SEMANAL',
    icon: 'calendarCheck',
    projection:
      'No Pro, o marco vira relatório semanal completo: comparativo entre semanas e tendência por aluno.',
  },
}

function useClockStamp(): string {
  const [stamp, setStamp] = useState('--:--')
  useEffect(() => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    setStamp(`${hh}:${mm}`)
  }, [])
  return stamp
}

export function UpsellV2Telemetria({ trigger, planPrice = 'R$ 29,90', onDismiss, onUpgrade }: UpsellV2Props) {
  const spec = KIND_SPEC[trigger.kind]
  const stamp = useClockStamp()

  return (
    <div className="w-full text-white [animation:vfit-lab2b-in_.45s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]">
      <style>{`
        @keyframes vfit-lab2b-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vfit-lab2b-live { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
      `}</style>

      <section
        aria-label="Leitura de telemetria — upgrade Pro"
        className="relative overflow-hidden shadow-[0_-16px_44px_rgba(0,0,0,0.55)]"
        style={{
          clipPath: CHAMFER_CARD,
          background: 'linear-gradient(to bottom, #10151c 0%, #0d1117 55%, #0a0e14 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
        <div
          className="pointer-events-none absolute -top-12 left-1/2 h-40 w-64 -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.14), transparent 68%)' }}
        />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />

        <div className="relative px-4 pb-4 pt-4">
          {/* Barra de instrumento */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-400">
              [ telemetria · {spec.channel} ]
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] [animation:vfit-lab2b-live_2.4s_ease-in-out_infinite] motion-reduce:[animation:none]"
                aria-hidden
              />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                ao vivo · {stamp}
              </span>
            </div>
          </div>

          {/* Leitura do sinal — a vitória como métrica */}
          <div
            className="mt-3 border-l-2 border-emerald-500/50 bg-white/4 px-3 py-2.5"
            style={{ clipPath: CHAMFER_READ }}
          >
            <div className="flex items-center gap-2">
              <DSIcon name={spec.icon} size={13} className="shrink-0 text-emerald-400" />
              <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                {spec.signal} <span className="text-slate-500">▸</span> registrado
              </p>
            </div>
            <p
              className="mt-1.5 text-[21px] font-black italic leading-[1.05] tracking-tight text-white"
              style={{ transform: 'skewX(-6deg)', transformOrigin: 'left bottom' }}
            >
              {trigger.headline}
            </p>
            <p className="mt-1 text-[11.5px] font-semibold leading-snug text-slate-300">{trigger.detail}</p>
          </div>

          {/* Projeção Pro — 1 benefício, factual */}
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                [ projeção com pro ]
              </p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {planPrice}
                <span className="text-slate-500">/mês</span>
              </p>
            </div>
            <p className="mt-1.5 text-[13px] font-medium leading-snug text-slate-200">{spec.projection}</p>
          </div>

          {/* Régua de escala — leitura atual vs alcance Pro */}
          <div className="mt-3.5" aria-hidden>
            <div
              className="relative h-1.5 overflow-hidden bg-white/7"
              style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 100%, 0 100%)' }}
            >
              <div className="h-full w-[38%]" style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }} />
              <div
                className="absolute inset-y-0 left-[38%] right-0"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, rgba(74,222,128,0.35) 0 5px, transparent 5px 10px)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 7px, rgba(13,17,23,0.85) 7px 8px)' }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>leitura atual</span>
              <span className="text-emerald-400/80">alcance pro</span>
            </div>
          </div>

          {/* Ações — 1 CTA + saída fácil */}
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
            <DSIcon name="trendingUp" size={16} />
            Ampliar telemetria
            <DSIcon name="chevronRight" size={15} />
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-1 flex h-11 w-full items-center justify-center text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors duration-150 hover:text-slate-200 active:translate-y-px active:text-slate-300"
          >
            Agora não
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/6" />
      </section>
    </div>
  )
}

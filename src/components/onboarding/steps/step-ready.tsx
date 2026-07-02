/**
 * src/components/onboarding/steps/step-ready.tsx
 *
 * Onboarding Step 15 — "Sua IA está pronta"
 * Tela final antes da geração: vende o valor da IA (não é um PDF genérico) e planta o
 * gancho de retenção — o plano evolui a cada treino registrado, não é um artefato único.
 * CTA final → CRIAR MEU PLANO (definido em page.tsx).
 */

'use client'

import { useEffect, useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

const AI_ACTIONS: { icon: DSIconName; text: string }[] = [
  { icon: 'target', text: 'Cruza objetivo, rotina e limitações' },
  { icon: 'dumbbell', text: 'Escolhe exercícios pro seu nível' },
  { icon: 'activity', text: 'Calibra séries, cargas e descanso' },
  { icon: 'trendingUp', text: 'Evolui a cada treino que você completa' },
]

export function StepReady() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Ícone com glow respirando */}
      <div
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border border-green-400/25 bg-green-400/10 transition-all duration-700 ${
          mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <span aria-hidden className="absolute inset-0 animate-pulse rounded-full bg-green-400/15" />
        <DSIcon name="brainCircuit" className="relative h-11 w-11 text-green-300" />
      </div>

      {/* Kicker */}
      <span
        className={`bc-mono inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-green-300/90 transition-all delay-100 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
        IA · análise concluída
      </span>

      {/* Stat strip — prova de que não é template genérico */}
      <div
        className={`grid w-full grid-cols-3 overflow-hidden rounded-xl border border-green-400/15 transition-all delay-200 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-1 border-r border-white/8 px-2 py-4">
          <span className="font-syne text-2xl font-black leading-none text-white tabular-nums">15</span>
          <span className="bc-mono mt-1 text-center text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-400">
            respostas cruzadas
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 border-r border-white/8 bg-green-900/15 px-2 py-4">
          <span className="font-syne text-2xl font-black leading-none text-white tabular-nums">100%</span>
          <span className="bc-mono mt-1 text-center text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-400">
            sob medida
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 px-2 py-4">
          <span className="font-syne text-2xl font-black leading-none text-white tabular-nums">0</span>
          <span className="bc-mono mt-1 text-center text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-400">
            genérico
          </span>
        </div>
      </div>

      {/* O que a IA faz agora — telemetria */}
      <div
        className={`w-full transition-all delay-300 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <p className="bc-mono mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/60">O que a IA faz agora</p>
        <div className="overflow-hidden rounded-xl border border-white/8">
          {AI_ACTIONS.map((a, i) => (
            <div
              key={a.text}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-white/8' : ''}`}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                transition: `opacity 0.4s ${450 + i * 90}ms, transform 0.4s ${450 + i * 90}ms`,
              }}
            >
              <span className="bc-mono w-6 shrink-0 text-[11px] font-bold tabular-nums text-green-300/55">{String(i + 1).padStart(2, '0')}</span>
              <DSIcon name={a.icon} size={17} className="shrink-0 text-green-300" />
              <span className="text-[13px] font-semibold leading-tight text-white/85">{a.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gancho de retenção — a IA continua trabalhando depois do plano pronto */}
      <div
        className={`flex items-start gap-3 rounded-lg border border-white/8 border-l-2 border-l-green-400/60 bg-white/[0.02] px-4 py-3.5 transition-all delay-500 duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-green-300/24 text-green-200"
          style={{ background: 'linear-gradient(180deg, rgba(74,222,128,0.18), rgba(34,197,94,0.05))' }}
        >
          <DSIcon name="sparkles" size={14} />
        </span>
        <p className="text-[12.5px] font-medium leading-5 text-slate-300">
          A IA não para aqui — <strong className="font-bold text-white">a cada treino que você registra</strong>, ela recalibra seu plano pra semana seguinte.
        </p>
      </div>

      <span className="bc-mono flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
        <DSIcon name="clock" size={12} className="text-green-300" />
        Pronto em ~30 segundos
      </span>
    </div>
  )
}

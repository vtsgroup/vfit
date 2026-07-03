'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { translateMuscles } from './types'
import type { HeroVariantProps } from './types'

const BARCODE_BG: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, #0f172a 0 2px, transparent 2px 4px, #0f172a 4px 7px, transparent 7px 9px, #0f172a 9px 10px, transparent 10px 15px)',
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500">{children}</p>
  )
}

export function HeroBilhete({
  userName,
  todayDay,
  plan,
  planPct,
  streak,
  xpBalance,
  dailyGoal,
}: HeroVariantProps) {
  const firstName = userName?.split(' ')[0] ?? 'Atleta'
  const dia = plan?.current_day ?? 1
  const totalDias = plan?.total_days ?? todayDay?.day_number ?? 1
  const duracao = todayDay?.estimated_duration_min ?? 0
  const metaPct = Math.round((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDias = streak?.current_streak ?? 0
  const grupos = translateMuscles(todayDay?.muscle_groups ?? [], 2) || 'Personalizado'
  const codigoPasse = `VF-${String(dia).padStart(2, '0')}${String(totalDias).padStart(2, '0')}-${String(duracao).padStart(3, '0')}`

  return (
    <section className="-mx-4 mb-4 px-4 pt-4 pb-2 text-white">
      <style>{`
        @keyframes vfit-v07-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.25 } }
        .vfit-v07-blink { animation: vfit-v07-blink 1.6s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .vfit-v07-blink { animation: none } }
      `}</style>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-300">
            Passe de embarque
          </p>
          <h1 className="mt-1 text-[26px] font-black leading-[1.02] tracking-tight text-white">
            Pronto pra embarcar,
            <br />
            {firstName}?
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/10 px-2.5 py-1.5">
          <DSIcon name="flame" size={13} className="text-amber-300" />
          <span className="text-[12px] font-black text-amber-200">{streakDias}d</span>
        </div>
      </div>

      {todayDay ? (
        <div className="relative flex rounded-[22px] bg-slate-50 text-slate-950 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_44px_-12px_rgba(34,197,94,0.28)]">
          <div className="min-w-0 flex-1 p-4 pr-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <DSIcon name="dumbbell" size={13} className="text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-950">
                  VFIT · Sessão
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="vfit-v07-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Embarque aberto
                </span>
              </div>
            </div>

            <FieldLabel>Passageiro</FieldLabel>
            <p className="text-[13px] font-bold uppercase tracking-wide text-slate-900">
              {userName ?? 'Atleta VFIT'}
            </p>

            <h2 className="mt-2 text-[21px] font-black leading-[1.05] tracking-tight text-slate-950">
              {todayDay.name ?? 'Treino do dia'}
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2.5 border-y border-slate-200 py-2.5">
              <div>
                <FieldLabel>Sessão</FieldLabel>
                <p className="font-mono text-[14px] font-bold text-slate-950">
                  {String(dia).padStart(2, '0')}
                  <span className="text-[10px] text-slate-400">/{String(totalDias).padStart(2, '0')}</span>
                </p>
              </div>
              <div>
                <FieldLabel>Duração</FieldLabel>
                <p className="font-mono text-[14px] font-bold text-slate-950">
                  {duracao}
                  <span className="text-[10px] text-slate-400">MIN</span>
                </p>
              </div>
              <div className="min-w-0">
                <FieldLabel>Grupos</FieldLabel>
                <p className="truncate text-[11px] font-bold uppercase text-slate-950">{grupos}</p>
              </div>
              <div>
                <FieldLabel>Plano</FieldLabel>
                <p className="font-mono text-[14px] font-bold text-emerald-600">{planPct}%</p>
              </div>
              <div>
                <FieldLabel>Meta hoje</FieldLabel>
                <p className="font-mono text-[14px] font-bold text-emerald-600">{metaPct}%</p>
              </div>
              <div>
                <FieldLabel>Saldo XP</FieldLabel>
                <p className="font-mono text-[14px] font-bold text-slate-950">{xp}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-8 w-full" style={BARCODE_BG} aria-hidden="true" />
              <p className="mt-1 font-mono text-[9px] font-medium tracking-[0.3em] text-slate-400">
                {codigoPasse}
              </p>
            </div>

            <Link
              href="/plano"
              onClick={() => hapticLight()}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-emerald-700/60 bg-brand-primary text-[15px] font-black tracking-tight text-white shadow-[0_1px_2px_rgba(2,44,34,0.4),0_8px_20px_-6px_rgba(6,95,70,0.55),inset_0_1px_0_rgba(255,255,255,0.24)] transition-transform duration-150 active:translate-y-px active:scale-[0.985] active:brightness-95"
            >
              <DSIcon name="play" size={17} />
              Começar treino de hoje
            </Link>
          </div>

          <div className="relative w-0 border-l-2 border-dashed border-slate-300">
            <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#050A12]" />
            <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#050A12]" />
          </div>

          <div className="flex w-[84px] shrink-0 flex-col items-center justify-between rounded-r-[22px] bg-emerald-50 px-2 py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-700">Dia</p>
            <div className="text-center">
              <p className="font-mono text-[40px] font-black leading-none tracking-tighter text-emerald-950">
                {String(dia).padStart(2, '0')}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                de {totalDias}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <DSIcon name="checkCircle" size={14} className="text-emerald-600" />
              <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Reservado
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-[22px] bg-slate-50 p-4 text-slate-950 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_44px_-12px_rgba(34,197,94,0.28)]">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="vfit-v07-blink h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-amber-700">
              Passe em emissão
            </span>
          </div>
          <h2 className="text-[19px] font-black leading-tight tracking-tight text-slate-950">
            Seu bilhete ainda não foi emitido
          </h2>
          <p className="mt-1 text-[12px] leading-snug text-slate-600">
            Gere um plano com IA e garanta seu assento na próxima sessão.
          </p>
          <div className="mt-3 h-8 w-full opacity-30" style={BARCODE_BG} aria-hidden="true" />
          <Link
            href="/plano"
            onClick={() => hapticLight()}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-emerald-700/60 bg-brand-primary text-[15px] font-black tracking-tight text-white shadow-[0_1px_2px_rgba(2,44,34,0.4),0_8px_20px_-6px_rgba(6,95,70,0.55),inset_0_1px_0_rgba(255,255,255,0.24)] transition-transform duration-150 active:translate-y-px active:scale-[0.985] active:brightness-95"
          >
            <DSIcon name="sparkles" size={17} />
            Gerar plano com IA
          </Link>
        </div>
      )}
    </section>
  )
}

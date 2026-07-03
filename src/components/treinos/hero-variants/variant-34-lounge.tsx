'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

// Fusão total header+hero: topo exato #050A12 (saguão escuro à noite) que
// desce para o balcão de check-in premium. Painel split-flap (solari board),
// ticket claro saindo da impressora do balcão, embarque aberto pulsando.
const FLAP_BG = 'linear-gradient(180deg, #222b3a 0%, #19212f 46%, #0e141e 54%, #161d29 100%)'
const FLAP_LINE = 'linear-gradient(180deg, transparent 47%, rgba(0,0,0,0.7) 48%, rgba(0,0,0,0.7) 52%, transparent 53%)'
const BARCODE =
  'repeating-linear-gradient(90deg, #0f172a 0 2px, transparent 2px 4px, #0f172a 4px 5px, transparent 5px 8px, #0f172a 8px 11px, transparent 11px 13px)'

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function Flap({ ch, accent = false }: { ch: string; accent?: boolean }) {
  if (ch === ' ') return <span className="w-[5px] shrink-0" aria-hidden />
  return (
    <span
      className={`flex h-[19px] w-[13px] shrink-0 items-center justify-center rounded-[2px] font-mono text-[11px] font-bold leading-none ${
        accent ? 'text-emerald-300' : 'text-slate-100'
      }`}
      style={{
        background: `${FLAP_LINE}, ${FLAP_BG}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.55)',
      }}
    >
      {ch}
    </span>
  )
}

function FlapRow({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <span className="flex flex-wrap gap-[3px]" role="text" aria-label={text}>
      {text.split('').map((ch, i) => (
        <Flap key={i} ch={ch} accent={accent} />
      ))}
    </span>
  )
}

function BoardField({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[7px] font-bold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <FlapRow text={text} accent={accent} />
    </div>
  )
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] font-bold leading-none text-slate-900">{value}</p>
    </div>
  )
}

export function HeroLounge({
  userName,
  todayDay,
  plan,
  planPct,
  totals,
  targets,
  streak,
  xpBalance,
  dailyGoal,
  workoutCount,
}: HeroVariantProps) {
  const firstName = userName?.split(' ')[0] ?? 'Atleta'
  const goalPct = clampPct((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDays = streak?.current_streak ?? 0
  const duration = todayDay?.estimated_duration_min ?? 0
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const gate = String(currentDay).padStart(2, '0')
  const muscles = todayDay ? translateMuscles(todayDay.muscle_groups ?? []) || 'Treino personalizado' : ''
  const destination = (muscles || 'TREINO').toUpperCase().replace(/ · /g, '·').slice(0, 22)
  const proteinPct = targets.protein > 0 ? clampPct((totals.protein / targets.protein) * 100) : 0

  return (
    <section className="-mx-4 -mt-px mb-4 text-white">
      <style>{`
        @keyframes vfit-v34-boarding { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>

      <div
        className="relative overflow-hidden rounded-b-3xl shadow-[0_24px_50px_rgba(0,0,0,0.55)]"
        style={{ background: 'linear-gradient(to bottom, #050A12 0%, #070E1A 34%, #0B1424 62%, #0D1729 100%)' }}
      >
        {/* Luz fria do saguão sobre o balcão */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: 'radial-gradient(120% 90% at 50% -30%, rgba(148,197,255,0.07), transparent 70%)' }}
        />

        <div className="relative px-4 pb-5 pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400">VFIT Air · Lounge</p>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Dia {currentDay}/{totalDays}
            </p>
          </div>
          <h1 className="mt-1 text-[26px] font-black leading-[1.02] tracking-tight text-white">
            Pronto pro embarque, {firstName}?
          </h1>

          {todayDay ? (
            <>
              {/* Painel de partidas — split-flap */}
              <div
                className="mt-4 rounded-lg border border-white/8 bg-[#060b14] p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]"
                role="group"
                aria-label="Painel de partidas"
              >
                <BoardField label="Partida" text={destination} />
                <div className="mt-2.5 flex items-end gap-4">
                  <BoardField label="Portão" text={gate} />
                  <BoardField label="Duração" text={`${duration}MIN`} />
                  <BoardField label="Status" text="NO HORÁRIO" accent />
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/6 pt-2.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] [animation:vfit-v34-boarding_1.8s_ease-in-out_infinite] motion-reduce:[animation:none]"
                    aria-hidden
                  />
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-300">Embarque aberto</p>
                  <p className="ml-auto text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Voo {todayDay.name ?? 'Treino do dia'}
                  </p>
                </div>
              </div>

              {/* Impressora do balcão */}
              <div className="relative z-10 mx-1 mt-4 h-2.5 rounded-full bg-[#01050b] shadow-[inset_0_2px_5px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.06)]" />

              {/* Ticket recém-impresso, saindo da fenda */}
              <div
                className="relative mx-3 -mt-[5px] overflow-hidden rounded-b-xl text-slate-900"
                style={{
                  background: 'linear-gradient(180deg, #dfe4dd 0%, #f6f8f4 9%, #f1f4ee 100%)',
                  boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
                }}
              >
                <div className="px-4 pb-3 pt-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-slate-500">Cartão de embarque</p>
                    <DSIcon name="scan" size={13} className="text-emerald-700" />
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-slate-500">Passageiro</p>
                      <p className="mt-0.5 truncate font-mono text-[17px] font-bold uppercase leading-none text-slate-900">
                        {firstName}
                      </p>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[7px] font-bold uppercase tracking-[0.22em] text-slate-500">Voo</p>
                      <p className="mt-0.5 truncate text-[13px] font-bold leading-tight text-emerald-700">
                        {todayDay.name ?? 'Treino do dia'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 border-t border-slate-900/10 pt-2.5">
                    <TicketField label="Meta" value={`${goalPct}%`} />
                    <TicketField label="XP" value={String(xp)} />
                    <TicketField label="Série" value={`${streakDays}d`} />
                    <TicketField label="Plano" value={`${clampPct(planPct)}%`} />
                  </div>
                </div>

                {/* Perfuração */}
                <div className="relative flex items-center px-4" aria-hidden>
                  <span className="absolute -left-2 h-4 w-4 rounded-full bg-[#0C1526]" />
                  <span className="h-0 flex-1 border-t-2 border-dashed border-slate-400/50" />
                  <span className="absolute -right-2 h-4 w-4 rounded-full bg-[#0C1526]" />
                </div>

                {/* Canhoto: barcode + CTA */}
                <div className="flex items-center gap-3 px-4 pb-3.5 pt-3">
                  <div className="h-9 w-16 shrink-0 opacity-80" style={{ backgroundImage: BARCODE }} aria-hidden />
                  <Link href="/plano" onClick={() => hapticLight()} className="block min-w-0 flex-1">
                    <span className="flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-[14px] font-black uppercase tracking-[0.06em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_14px_rgba(16,185,129,0.35)] transition-all duration-150 hover:brightness-105 active:translate-y-px active:brightness-90">
                      Embarcar agora
                      <DSIcon name="arrowRight" size={16} />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Serviços do lounge */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/nutricao"
                  onClick={() => hapticLight()}
                  className="rounded-lg border border-white/8 border-l-2 border-l-emerald-500/50 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="flask" size={13} className="text-emerald-400/80" />
                    <span className="font-mono text-[10px] font-bold tabular-nums text-emerald-400">{proteinPct}%</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Catering · Proteína</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {Math.round(totals.protein)}g de {targets.protein}g servidos
                  </p>
                </Link>
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="rounded-lg border border-white/8 border-l-2 border-l-emerald-500/50 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="trendingUp" size={13} className="text-emerald-400/80" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Upgrade</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {workoutCount > 0 ? `${workoutCount} voos no histórico` : 'Primeira classe te espera'}
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <div className="rounded-lg border border-white/8 bg-[#060b14] p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                <BoardField label="Partida" text="SEM VOO PROGRAMADO" />
              </div>
              <p className="mt-3 text-[12px] leading-snug text-slate-300">
                Nenhuma partida no painel. Gere seu plano com IA e imprima o cartão de embarque.
              </p>
              <Link href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <span className="flex h-12 items-center justify-center gap-2 rounded-lg bg-linear-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-[14px] font-black uppercase tracking-[0.06em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_14px_rgba(16,185,129,0.35)] transition-all duration-150 hover:brightness-105 active:translate-y-px active:brightness-90">
                  <DSIcon name="sparkles" size={16} />
                  Gerar plano com IA
                </span>
              </Link>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />
      </div>
    </section>
  )
}

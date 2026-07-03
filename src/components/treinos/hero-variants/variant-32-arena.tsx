'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

// ARENA — o header do app é o topo do jumbotron do ginásio. A superfície desce
// de #050A12 (theme-color/status bar/header) para o painel LED preto profundo,
// com moldura de aço e parafusos apenas na base. Sem emenda no topo.
const LED_DOTS = 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1.2px)'
const STEEL = 'linear-gradient(180deg, #3d444e 0%, #262c34 38%, #171c22 62%, #2b323b 100%)'
const GLOW_EMERALD = '0 0 6px rgba(52,211,153,0.85), 0 0 18px rgba(16,185,129,0.4)'
const GLOW_AMBER = '0 0 6px rgba(251,191,36,0.7), 0 0 16px rgba(217,119,6,0.35)'

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function Bolt() {
  return (
    <span
      aria-hidden
      className="relative block h-2.5 w-2.5 rounded-full"
      style={{
        background: 'radial-gradient(circle at 34% 30%, #6b7684, #2b323b 62%, #10141a)',
        boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/60" />
    </span>
  )
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2">
      <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p
        className={`font-mono text-[15px] font-black leading-none tabular-nums ${accent ? 'text-emerald-300' : 'text-white'}`}
        style={accent ? { textShadow: GLOW_EMERALD } : undefined}
      >
        {value}
      </p>
    </div>
  )
}

export function HeroArena({
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
  const firstName = (userName?.split(' ')[0] ?? 'Atleta').toUpperCase()
  const goalPct = clampPct((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDays = streak?.current_streak ?? 0
  const duration = todayDay?.estimated_duration_min ?? 0
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const muscles = todayDay ? translateMuscles(todayDay.muscle_groups ?? []) || 'Treino personalizado' : ''
  const opponent = muscles.toUpperCase()
  const clock = `${String(duration).padStart(2, '0')}:00`
  const proteinPct = targets.protein > 0 ? clampPct((totals.protein / targets.protein) * 100) : 0
  const pct = clampPct(planPct)

  return (
    <section className="-mx-4 -mt-px mb-4 text-white">
      <style>{`
        @keyframes vfit-v32-flood { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.9; } }
      `}</style>

      <div
        className="relative overflow-hidden rounded-b-[22px]"
        style={{ background: 'linear-gradient(to bottom, #050A12 0%, #04070d 30%, #020409 58%, #010306 100%)' }}
      >
        {/* Grade de LED do painel — surge abaixo da zona de fusão com o header */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: LED_DOTS,
            backgroundSize: '4px 4px',
            maskImage: 'linear-gradient(to bottom, transparent 0, black 64px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 64px)',
          }}
        />
        {/* Luzes de arena — 2 feixes diagonais descendo do topo, integrando o header à cena */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-52 [animation:vfit-v32-flood_5.5s_ease-in-out_infinite] motion-reduce:[animation:none]"
        >
          <div
            className="absolute -top-6 left-[12%] h-56 w-14 blur-md"
            style={{
              transform: 'skewX(16deg)',
              background: 'linear-gradient(to bottom, rgba(52,211,153,0.16), rgba(16,185,129,0.05) 55%, transparent 85%)',
            }}
          />
          <div
            className="absolute -top-6 right-[14%] h-56 w-14 blur-md"
            style={{
              transform: 'skewX(-16deg)',
              background: 'linear-gradient(to bottom, rgba(52,211,153,0.13), rgba(16,185,129,0.04) 55%, transparent 85%)',
            }}
          />
        </div>
        {/* Trilhos laterais de aço — começam depois da zona de fusão */}
        <div aria-hidden className="pointer-events-none absolute bottom-6 left-0 top-14 w-[3px]" style={{ background: STEEL }} />
        <div aria-hidden className="pointer-events-none absolute bottom-6 right-0 top-14 w-[3px]" style={{ background: STEEL }} />

        <div className="relative px-4 pb-2 pt-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-400" style={{ textShadow: GLOW_EMERALD }}>
              Arena VFIT · Dia {currentDay} de {totalDays}
            </p>
            <p className="font-mono text-[15px] font-black tabular-nums leading-none text-amber-300" style={{ textShadow: GLOW_AMBER }}>
              {todayDay ? clock : '--:--'}
            </p>
          </div>

          {todayDay ? (
            <>
              {/* Confronto em dot-matrix */}
              <div className="mt-4 rounded-lg border border-white/8 bg-black/40 px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-mono text-[21px] font-black leading-none tracking-[0.06em] text-emerald-300" style={{ textShadow: GLOW_EMERALD }}>
                    {firstName}
                  </p>
                  <p className="shrink-0 font-mono text-[19px] font-black tabular-nums leading-none text-white">{xp}</p>
                </div>
                <div className="my-2.5 flex items-center gap-2.5">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="font-mono text-[9px] font-black tracking-[0.3em] text-slate-500">VS</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate font-mono text-[15px] font-black leading-none tracking-[0.08em] text-slate-200">{opponent}</p>
                  <p className="shrink-0 font-mono text-[12px] font-bold tabular-nums leading-none text-slate-400">{duration} min</p>
                </div>
                <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{todayDay.name ?? 'Treino do dia'}</p>
              </div>

              {/* Linha de estatísticas do placar */}
              <div className="mt-2.5 grid grid-cols-3 divide-x divide-white/8 rounded-lg border border-white/8 bg-black/30">
                <StatCell label="Meta diária" value={`${goalPct}%`} accent />
                <StatCell label="Sequência" value={`${streakDays}d`} />
                <StatCell label="Plano" value={`${pct}%`} />
              </div>

              {/* Barra de plano em segmentos LED */}
              <div className="mt-2.5 h-2 overflow-hidden rounded-sm bg-white/6" role="img" aria-label={`Plano ${pct}% concluído`}>
                <div className="relative h-full" style={{ width: `${Math.max(3, pct)}%` }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #059669, #34d399)', boxShadow: '0 0 10px rgba(52,211,153,0.5)' }} />
                  <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 6px, rgba(1,3,6,0.9) 6px 8px)' }} />
                </div>
              </div>

              {/* Ribbon de LED — microcopy corrida, estática */}
              <div className="mt-2.5 overflow-hidden whitespace-nowrap rounded-sm border-y border-white/6 bg-black/50 px-2 py-1.5">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-400/85">
                  {`Rodada de hoje // ${opponent} // meta ${goalPct}% // sequência ${streakDays} dias // ${xp} XP em jogo //`}
                </p>
              </div>

              {/* CTA — painel LED aceso */}
              <Link href="/plano" onClick={() => hapticLight()} className="mt-3 block">
                <span
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-400/45 font-mono text-[14px] font-black uppercase tracking-[0.18em] text-emerald-200 transition-all duration-150 hover:brightness-125 active:translate-y-px active:brightness-90"
                  style={{
                    background: 'linear-gradient(180deg, rgba(16,185,129,0.22), rgba(4,120,87,0.14) 55%, rgba(2,44,34,0.3))',
                    backgroundImage: `${LED_DOTS}, linear-gradient(180deg, rgba(16,185,129,0.22), rgba(4,120,87,0.14) 55%, rgba(2,44,34,0.3))`,
                    backgroundSize: '4px 4px, 100% 100%',
                    boxShadow: '0 0 22px rgba(16,185,129,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
                    textShadow: GLOW_EMERALD,
                  }}
                >
                  <DSIcon name="play" size={16} />
                  Começar partida
                </span>
              </Link>

              {/* Painéis auxiliares do jumbotron */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <Link
                  href="/nutricao"
                  onClick={() => hapticLight()}
                  className="rounded-lg border border-white/8 bg-black/35 px-3 py-2.5 transition-colors hover:border-emerald-400/30 hover:bg-black/50 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="flask" size={13} className="text-emerald-400/80" />
                    <span className="font-mono text-[10px] font-black tabular-nums text-emerald-300" style={{ textShadow: GLOW_EMERALD }}>
                      {proteinPct}%
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Proteína</p>
                  <p className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {Math.round(totals.protein)}g / {targets.protein}g
                  </p>
                </Link>
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="rounded-lg border border-white/8 bg-black/35 px-3 py-2.5 transition-colors hover:border-emerald-400/30 hover:bg-black/50 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="trendingUp" size={13} className="text-emerald-400/80" />
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Ranking</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
                  <p className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {workoutCount} partidas jogadas
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-lg border border-white/8 bg-black/40 px-4 py-4">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-slate-500">Placar apagado</p>
              <h2 className="mt-1.5 font-mono text-[18px] font-black leading-tight tracking-[0.04em] text-white">Nenhuma partida marcada</h2>
              <p className="mt-1 text-[12px] leading-snug text-slate-300">Gere seu plano com IA e acenda o jumbotron.</p>
              <Link href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <span
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-400/45 font-mono text-[13px] font-black uppercase tracking-[0.16em] text-emerald-200 transition-all duration-150 hover:brightness-125 active:translate-y-px active:brightness-90"
                  style={{
                    background: 'linear-gradient(180deg, rgba(16,185,129,0.22), rgba(2,44,34,0.3))',
                    boxShadow: '0 0 22px rgba(16,185,129,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
                    textShadow: GLOW_EMERALD,
                  }}
                >
                  <DSIcon name="sparkles" size={16} />
                  Gerar plano com IA
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Moldura de aço da base com parafusos */}
        <div className="relative mt-1 flex h-6 items-center justify-between rounded-b-[20px] px-2.5" style={{ background: STEEL, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <Bolt />
          <p className="font-mono text-[7px] font-bold uppercase tracking-[0.34em] text-slate-400/90">VFIT Arena Systems</p>
          <Bolt />
        </div>
      </div>
    </section>
  )
}

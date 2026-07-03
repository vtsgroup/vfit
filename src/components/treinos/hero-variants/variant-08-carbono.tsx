'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

// Fusão total header+hero: o topo da seção é #050A12 (mesma cor do StudentHeader
// e do theme-color/status bar) e aprofunda para o grafite do painel de carbono.
// Chanfros apenas na base — o topo é quadrado e cola no header sem emenda.
const CHAMFER_SECTION = 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px))'
const CHAMFER_CTA = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
const CHAMFER_TILE = 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-l-2 border-emerald-500/40 pl-2.5">
      <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-[20px] font-black italic leading-none tracking-tight ${accent ? 'text-emerald-400' : 'text-white'}`}
        style={{ transform: 'skewX(-6deg)' }}
      >
        {value}
      </p>
    </div>
  )
}

function CtaShell({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex h-12 items-center justify-center gap-2 text-[15px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
      style={{
        clipPath: CHAMFER_CTA,
        background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
      }}
    >
      {children}
    </span>
  )
}

export function HeroCarbono({
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
  const firstName = userName?.split(' ')[0] ?? 'atleta'
  const goalPct = clampPct((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDays = streak?.current_streak ?? 0
  const duration = todayDay?.estimated_duration_min ?? 0
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const muscles = todayDay ? translateMuscles(todayDay.muscle_groups ?? []) || 'Treino personalizado' : ''
  const needleDeg = -90 + goalPct * 1.8
  const proteinPct = targets.protein > 0 ? clampPct((totals.protein / targets.protein) * 100) : 0
  const caloriesPct = targets.calories > 0 ? clampPct((totals.calories / targets.calories) * 100) : 0

  return (
    <section className="-mx-4 -mt-px mb-4 text-white">
      <style>{`
        @keyframes vfit-v08-needle { from { transform: rotate(-90deg); } to { transform: rotate(${needleDeg}deg); } }
        @keyframes vfit-v08-sweep { from { transform: translateX(-140%) skewX(-30deg); opacity: 0; } 60% { opacity: 1; } to { transform: translateX(0) skewX(-30deg); opacity: 1; } }
      `}</style>

      <div
        className="relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        style={{
          clipPath: CHAMFER_SECTION,
          // Nasce em #0d1117 — exatamente a cor onde o header termina — e
          // aprofunda para o grafite do painel. O gradiente atravessa a emenda.
          background: 'linear-gradient(to bottom, #0d1117 0%, #10151c 42%, #161b22 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} />
        <div
          className="pointer-events-none absolute -top-10 right-0 h-44 w-44"
          style={{ background: 'radial-gradient(circle at 80% 10%, rgba(34,197,94,0.14), transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute right-4 top-4 flex gap-1.5 [animation:vfit-v08-sweep_.7s_ease-out_both] motion-reduce:[animation:none]"
          style={{ transform: 'skewX(-30deg)' }}
          aria-hidden
        >
          <div className="h-9 w-[3px] bg-emerald-400/70" />
          <div className="h-9 w-[3px] bg-emerald-400/35" />
          <div className="h-9 w-[3px] bg-emerald-400/15" />
        </div>

        <div className="relative px-4 pb-5 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400">
            Telemetria · dia {currentDay} de {totalDays}
          </p>
          <h1
            className="mt-1 text-[32px] font-black italic leading-[0.94] tracking-tight text-white"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}
          >
            Acelera, {firstName}
          </h1>

          {todayDay ? (
            <>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="relative h-[64px] w-[128px] shrink-0" role="img" aria-label={`Meta diária ${goalPct}%`}>
                  <div className="absolute inset-x-0 top-0 h-[128px] w-[128px] overflow-hidden">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 270deg, #22C55E 0%, #4ade80 ${goalPct / 2}%, rgba(255,255,255,0.09) ${goalPct / 2}%, rgba(255,255,255,0.09) 50%, transparent 50%)`,
                        WebkitMask: 'radial-gradient(closest-side, transparent 68%, #000 69%)',
                        mask: 'radial-gradient(closest-side, transparent 68%, #000 69%)',
                      }}
                    />
                  </div>
                  <div
                    className="absolute bottom-0 left-1/2 h-[46px] w-[2px] origin-bottom -translate-x-1/2 bg-emerald-300 [animation:vfit-v08-needle_.9s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]"
                    style={{ transform: `rotate(${needleDeg}deg)`, boxShadow: '0 0 8px rgba(52,211,153,0.8)' }}
                  />
                  <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-emerald-400/60 bg-[#161b22]" />
                  <p
                    className="absolute inset-x-0 bottom-0 text-center text-[17px] font-black italic leading-none text-white"
                    style={{ transform: 'skewX(-6deg)' }}
                  >
                    {goalPct}
                    <span className="text-[9px] font-bold not-italic text-slate-400">%</span>
                  </p>
                  <p className="absolute inset-x-0 -bottom-3.5 text-center text-[7px] font-bold uppercase tracking-[0.26em] text-slate-400">
                    Meta diária
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-2.5 pb-1">
                  <Readout label="XP" value={String(xp)} accent />
                  <Readout label="Streak" value={`${streakDays}d`} />
                </div>

                <div className="flex flex-col items-end gap-1 pb-1 text-right">
                  <DSIcon name="clock" size={14} className="text-emerald-400/80" />
                  <p className="text-[26px] font-black italic leading-none text-white" style={{ transform: 'skewX(-6deg)' }}>
                    {duration}
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-400">min</p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/8 pt-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">Próxima volta</p>
                <h2 className="mt-1 text-[21px] font-black leading-tight text-white">{todayDay.name ?? 'Treino do dia'}</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{muscles}</p>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-slate-400">Plano</p>
                  <p className="text-[13px] font-black italic text-emerald-400" style={{ transform: 'skewX(-6deg)' }}>
                    {clampPct(planPct)}%
                  </p>
                </div>
                <div className="relative h-2 overflow-hidden bg-white/7" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 100%, 0 100%)' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${Math.max(3, clampPct(planPct))}%`, background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 7px, rgba(13,17,23,0.85) 7px 8px)' }}
                  />
                </div>
              </div>

              <Link href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <CtaShell>
                  <DSIcon name="play" size={17} />
                  Começar treino de hoje
                </CtaShell>
              </Link>

              {/* Boxes de apoio — nutrição e evolução na linguagem do painel */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/nutricao"
                  onClick={() => hapticLight()}
                  className="group relative overflow-hidden border-l-2 border-emerald-500/40 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
                  style={{ clipPath: CHAMFER_TILE }}
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="flask" size={13} className="text-emerald-400/80" />
                    <span className="text-[10px] font-black italic tabular-nums text-emerald-400" style={{ transform: 'skewX(-6deg)' }}>
                      {proteinPct}%
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Proteína</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {Math.round(totals.protein)}g de {targets.protein}g
                  </p>
                </Link>
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="group relative overflow-hidden border-l-2 border-emerald-500/40 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
                  style={{ clipPath: CHAMFER_TILE }}
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="trendingUp" size={13} className="text-emerald-400/80" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Próximo</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {workoutCount > 0 ? `${workoutCount} treinos no histórico` : `${caloriesPct}% da meta calórica`}
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">Boxes abertos</p>
              <h2 className="mt-1 text-[20px] font-black leading-tight text-white">Seu carro ainda está na oficina</h2>
              <p className="mt-1 text-[12px] leading-snug text-slate-300">
                Gere o plano com IA e coloque o painel na pista.
              </p>
              <Link href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <CtaShell>
                  <DSIcon name="sparkles" size={17} />
                  Gerar plano com IA
                  <DSIcon name="chevronRight" size={15} />
                </CtaShell>
              </Link>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
      </div>
    </section>
  )
}

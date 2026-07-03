'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

// MONOCOQUE — chassi de fibra exposta de hipercarro. Fusão total: topo = #050A12
// (header/status bar) aprofundando para fibra em weave diagonal única (~7px),
// costela central com parafusos hex, entrada de ar com tacômetro e serial gravado.
const CHAMFER_SECTION = 'polygon(0 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0 calc(100% - 22px))'
const CHAMFER_CTA_OUT = 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)'
const CHAMFER_CTA_IN = 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)'
const CHAMFER_TILE = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
const INTAKE = 'polygon(7% 0, 93% 0, 100% 100%, 0 100%)'
const HEX = 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)'
const WEAVE = [
  'repeating-linear-gradient(28deg, rgba(255,255,255,0.055) 0 2px, rgba(255,255,255,0.012) 2px 4px, rgba(0,0,0,0.3) 4px 7px)',
  'linear-gradient(112deg, transparent 32%, rgba(255,255,255,0.035) 46%, transparent 61%)',
].join(', ')

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function pad2(n: number): string {
  return String(Math.max(0, Math.min(99, n))).padStart(2, '0')
}

function HexBolt() {
  return (
    <span
      aria-hidden
      className="relative block h-3 w-3"
      style={{ clipPath: HEX, background: 'radial-gradient(circle at 35% 28%, #46525f 0%, #1a212a 55%, #0b1017 100%)' }}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/70" />
    </span>
  )
}

function SpecReadout({ icon, label, value }: { icon: 'zap' | 'flame'; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <DSIcon name={icon} size={13} className="shrink-0 text-emerald-400/85" />
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-slate-400">{label}</p>
        <p className="text-[19px] font-black italic leading-none tracking-tight text-white" style={{ transform: 'skewX(-6deg)' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function IgnitionBar({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block p-[2px] transition-all duration-150 hover:brightness-110 active:translate-y-px active:brightness-90"
      style={{ clipPath: CHAMFER_CTA_OUT, background: 'linear-gradient(180deg, rgba(110,231,183,0.55), rgba(6,78,59,0.6))' }}
    >
      <span
        className="flex h-12 items-center justify-center gap-2 text-[15px] font-black italic tracking-tight text-white [text-shadow:0_1px_2px_rgba(2,44,34,0.45)]"
        style={{ clipPath: CHAMFER_CTA_IN, background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 48%, #14743a 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
      >
        {children}
      </span>
    </span>
  )
}

export function HeroMonocoque({
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
  const serial = `VF-${pad2(currentDay)}-${pad2(totalDays)}`
  const needleDeg = -90 + goalPct * 1.8
  const proteinPct = targets.protein > 0 ? clampPct((totals.protein / targets.protein) * 100) : 0

  return (
    <section className="-mx-4 -mt-px mb-4 text-white">
      <style>{`
        @keyframes vfit-v31-needle { from { transform: rotate(-90deg); } to { transform: rotate(${needleDeg}deg); } }
        @keyframes vfit-v31-idle { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
      `}</style>

      <div
        className="relative overflow-hidden shadow-[0_22px_55px_rgba(0,0,0,0.55)]"
        style={{
          clipPath: CHAMFER_SECTION,
          background: 'linear-gradient(to bottom, #050A12 0%, #090d14 24%, #10151d 52%, #1a2029 100%)',
        }}
      >
        {/* Fibra em escala maior — mascarada no topo para fundir com o header */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: WEAVE, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 26%)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 26%)' }}
        />
        <div className="pointer-events-none absolute -top-8 right-0 h-40 w-44" style={{ background: 'radial-gradient(circle at 85% 12%, rgba(34,197,94,0.12), transparent 65%)' }} />

        {/* Costela estrutural central com parafusos hex */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 flex w-4 -translate-x-1/2 flex-col items-center justify-between py-8"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.5) 18%, rgba(120,134,150,0.16) 46%, rgba(255,255,255,0.09) 50%, rgba(120,134,150,0.16) 54%, rgba(0,0,0,0.5) 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14%)',
            maskImage: 'linear-gradient(to bottom, transparent 0, #000 14%)',
          }}
        >
          <HexBolt />
          <HexBolt />
          <HexBolt />
        </div>

        <div className="relative px-4 pb-5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400">
              Monocoque · dia {currentDay} de {totalDays}
            </p>
            <p aria-hidden className="select-none text-[13px] font-black uppercase leading-none tracking-[0.18em]" style={{ color: 'transparent', WebkitTextStroke: '1px rgba(226,232,240,0.34)' }}>
              {serial}
            </p>
          </div>
          <h1
            className="mt-1 text-[32px] font-black italic leading-[0.94] tracking-tight text-white"
            style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}
          >
            Chassi pronto, {firstName}
          </h1>

          {todayDay ? (
            <>
              <div className="mt-4 grid grid-cols-2 items-center gap-x-8">
                {/* Entrada de ar funcional que abriga o tacômetro */}
                <div
                  className="relative px-3 pb-3 pt-2.5"
                  style={{ clipPath: INTAKE, background: 'linear-gradient(180deg, #03060b 0%, #0a0f16 100%)', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.8)' }}
                >
                  <div className="relative mx-auto h-[56px] w-[112px]" role="img" aria-label={`Meta diária ${goalPct}%`}>
                    <div className="absolute inset-x-0 top-0 h-[112px] w-[112px] overflow-hidden">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(from 270deg, #16a34a 0%, #4ade80 ${goalPct / 2}%, rgba(255,255,255,0.09) ${goalPct / 2}%, rgba(255,255,255,0.09) 50%, transparent 50%)`,
                          WebkitMask: 'radial-gradient(closest-side, transparent 66%, #000 67%)', mask: 'radial-gradient(closest-side, transparent 66%, #000 67%)',
                        }}
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-1/2 h-[40px] w-[2px] origin-bottom -translate-x-1/2 bg-emerald-300 [animation:vfit-v31-needle_.9s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]"
                      style={{ transform: `rotate(${needleDeg}deg)`, boxShadow: '0 0 8px rgba(52,211,153,0.8)' }}
                    />
                    <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2" style={{ clipPath: HEX, background: '#334155' }} />
                    <p className="absolute inset-x-0 bottom-0 text-center text-[16px] font-black italic leading-none text-white" style={{ transform: 'skewX(-6deg)' }}>
                      {goalPct}
                      <span className="text-[9px] font-bold not-italic text-slate-400">%</span>
                    </p>
                  </div>
                  <p className="mt-1.5 text-center text-[7px] font-bold uppercase tracking-[0.26em] text-slate-400">Meta diária</p>
                </div>

                <div className="flex flex-col gap-3 pl-1">
                  <SpecReadout icon="zap" label="XP" value={String(xp)} />
                  <SpecReadout icon="flame" label="Streak" value={`${streakDays}d`} />
                </div>
              </div>

              <div className="mt-5 border-t border-white/8 pt-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">Sessão de hoje</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[21px] font-black leading-tight text-white">{todayDay.name ?? 'Treino do dia'}</h2>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{muscles}</p>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-1 text-right">
                    <DSIcon name="clock" size={12} className="translate-y-px text-emerald-400/80" />
                    <p className="text-[22px] font-black italic leading-none text-white" style={{ transform: 'skewX(-6deg)' }}>{duration}</p>
                    <p className="text-[9px] font-bold uppercase text-slate-400">min</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-slate-400">Estrutura do plano</p>
                  <p className="text-[13px] font-black italic text-emerald-400" style={{ transform: 'skewX(-6deg)' }}>{clampPct(planPct)}%</p>
                </div>
                <div className="relative h-2 overflow-hidden bg-black/45" style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7)' }}>
                  <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, clampPct(planPct))}%`, background: 'linear-gradient(90deg, #15803d, #4ade80)' }} />
                  <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 9px, rgba(5,10,18,0.9) 9px 10px)' }} />
                </div>
              </div>

              <Link href="/plano" onClick={() => hapticLight()} className="relative mt-4 block">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 [animation:vfit-v31-idle_2.6s_ease-in-out_infinite] motion-reduce:[animation:none]"
                  style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.22), transparent 70%)' }}
                />
                <IgnitionBar>
                  <DSIcon name="play" size={17} />
                  Dar a ignição · treino de hoje
                </IgnitionBar>
              </Link>

              {/* Baias estruturais de apoio */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/nutricao"
                  onClick={() => hapticLight()}
                  className="relative overflow-hidden border-l-2 border-emerald-500/40 bg-black/30 px-3 py-2.5 transition-colors hover:bg-black/45 active:translate-y-px"
                  style={{ clipPath: CHAMFER_TILE, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="flask" size={13} className="text-emerald-400/80" />
                    <span className="text-[10px] font-black italic tabular-nums text-emerald-400" style={{ transform: 'skewX(-6deg)' }}>{proteinPct}%</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Proteína</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {Math.round(totals.protein)}g de {targets.protein}g
                  </p>
                </Link>
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="relative overflow-hidden border-l-2 border-emerald-500/40 bg-black/30 px-3 py-2.5 transition-colors hover:bg-black/45 active:translate-y-px"
                  style={{ clipPath: CHAMFER_TILE, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="trendingUp" size={13} className="text-emerald-400/80" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Upgrade</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {workoutCount > 0 ? `${workoutCount} treinos no chassi` : 'Primeira sessão pendente'}
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">Linha de montagem</p>
              <h2 className="mt-1 text-[20px] font-black leading-tight text-white">Chassi sem mapa de motor</h2>
              <p className="mt-1 text-[12px] leading-snug text-slate-300">Gere o plano com IA e leve o monocoque para a pista.</p>
              <Link href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <IgnitionBar>
                  <DSIcon name="sparkles" size={17} />
                  Gerar plano com IA
                  <DSIcon name="chevronRight" size={15} />
                </IgnitionBar>
              </Link>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
      </div>
    </section>
  )
}

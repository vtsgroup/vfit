'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

// PADDOCK — o box de F1 do atleta. Fusão total: o topo é #050A12 (mesma cor do
// StudentHeader e da status bar) e aprofunda para o concreto/grafite do pit
// garage. Cantos arredondados APENAS na base; topo quadrado, sem emenda.
const SCANLINE =
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)'
const PIT_STRIPES =
  'repeating-linear-gradient(45deg, rgba(2,44,34,0.55) 0 5px, transparent 5px 11px)'
const FLOOR_HATCH =
  'repeating-linear-gradient(-55deg, rgba(34,197,94,0.5) 0 6px, transparent 6px 14px)'

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function Monitor({ label, value, unit, code }: { label: string; value: string; unit?: string; code: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-emerald-400/15 bg-[#040b12] px-2.5 pb-2 pt-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_18px_rgba(0,0,0,0.6)]"
    >
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: SCANLINE }} />
      <div className="relative flex items-center justify-between">
        <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-emerald-400/90">{label}</p>
        <span className="text-[6px] font-bold tracking-[0.18em] text-slate-500">{code}</span>
      </div>
      <p className="relative mt-1 text-[19px] font-black italic leading-none tabular-nums text-white [text-shadow:0_0_10px_rgba(34,197,94,0.25)]">
        {value}
        {unit ? <span className="ml-0.5 text-[9px] font-bold not-italic text-slate-400">{unit}</span> : null}
      </p>
      <div className="relative mt-1.5 h-0.5 w-full bg-white/8">
        <div className="h-full w-1/3 bg-emerald-400/60" />
      </div>
    </div>
  )
}

function StartLights({ total, today }: { total: number; today: number }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center gap-1.5 rounded-md border border-white/8 bg-[#03080e] px-1.5 py-2 shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]"
      role="img"
      aria-label={`Dia ${today} de ${total} do plano`}
    >
      {Array.from({ length: total }, (_, i) => {
        const isToday = i === today - 1
        const isDone = i < today - 1
        return (
          <span
            key={i}
            className={
              isToday
                ? 'h-3 w-3 rounded-full bg-emerald-400 [animation:vfit-v33-light_2.4s_ease-in-out_infinite] motion-reduce:[animation:none] motion-reduce:shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                : isDone
                  ? 'h-3 w-3 rounded-full border border-emerald-500/30 bg-emerald-950'
                  : 'h-3 w-3 rounded-full border border-white/12 bg-[#0a1119]'
            }
          />
        )
      })}
      <span className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.2em] text-slate-500">Largada</span>
    </div>
  )
}

function CtaShell({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-md text-[15px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.45)] hover:brightness-110 active:translate-y-px active:brightness-90"
      style={{
        background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
      }}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-6" style={{ backgroundImage: PIT_STRIPES }} aria-hidden />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-6" style={{ backgroundImage: PIT_STRIPES }} aria-hidden />
      {children}
    </span>
  )
}

export function HeroPaddock({
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
  const proteinPct = targets.protein > 0 ? clampPct((totals.protein / targets.protein) * 100) : 0
  const lightsTotal = Math.max(1, Math.min(totalDays, 5))
  const lightsToday = Math.max(1, Math.min(currentDay, lightsTotal))

  return (
    <section className="-mx-4 -mt-px mb-4 text-white">
      <style>{`
        @keyframes vfit-v33-light {
          0%, 100% { box-shadow: 0 0 6px rgba(52,211,153,0.55); opacity: .85; }
          50% { box-shadow: 0 0 14px rgba(52,211,153,1); opacity: 1; }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(to bottom, #050A12 0%, #060d16 30%, #0a121b 58%, #0e161f 100%)' }}
      >
        {/* Painéis da parede do box — juntas verticais sutis */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 78px, rgba(255,255,255,0.03) 78px 79px)' }}
        />
        <div
          className="pointer-events-none absolute -top-8 left-1/3 h-40 w-56"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.1), transparent 70%)' }}
        />

        <div className="relative px-4 pb-4 pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-400">
              Paddock · box {firstName}
            </p>
            {todayDay ? (
              <span className="shrink-0 rounded-sm border border-white/12 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-200">
                Stint {currentDay}/{totalDays} · {duration}min
              </span>
            ) : null}
          </div>

          {todayDay ? (
            <>
              <div className="mt-3 flex items-stretch gap-3">
                <StartLights total={lightsTotal} today={lightsToday} />
                <div className="min-w-0 flex-1">
                  <h1 className="text-[30px] font-black italic leading-[0.94] tracking-tight text-white" style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}>
                    Luz verde,
                    <br />
                    {firstName}
                  </h1>
                  <h2 className="mt-2 truncate text-[15px] font-black leading-tight text-white">{todayDay.name ?? 'Treino do dia'}</h2>
                  <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">{muscles}</p>
                  <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">
                    equipe pronta. box livre.
                    {streakDays > 0 ? (
                      <span className="ml-1.5 inline-flex items-center gap-1 text-slate-300">
                        <DSIcon name="flame" size={9} className="text-emerald-400" />
                        {streakDays}d de stint
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* Bancada de telemetria — três monitores do muretão */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Monitor label="Plano" value={String(clampPct(planPct))} unit="%" code="MON-01" />
                <Monitor label="Meta" value={String(goalPct)} unit="%" code="MON-02" />
                <Monitor label="XP" value={String(xp)} code="MON-03" />
              </div>

              <Link href="/plano" onClick={() => hapticLight()} className="mt-3.5 block">
                <CtaShell>
                  <DSIcon name="play" size={17} />
                  Sair dos boxes
                </CtaShell>
              </Link>
            </>
          ) : (
            <div className="mt-3">
              <h1 className="text-[22px] font-black italic leading-tight tracking-tight text-white" style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}>
                Box vazio, {firstName}
              </h1>
              <p className="mt-1 text-[12px] leading-snug text-slate-300">
                Sem carro na pista ainda. A engenharia monta seu stint em segundos.
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

          {/* Faixa de piso do pit lane — demarcação hachurada emerald */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-[#03080e]" style={{ backgroundImage: FLOOR_HATCH }} aria-hidden />

          {/* Estações da equipe — abastecimento e setup */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <Link
              href="/nutricao"
              onClick={() => hapticLight()}
              className="rounded-md border border-white/8 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
            >
              <div className="flex items-center justify-between">
                <DSIcon name="flask" size={13} className="text-emerald-400/80" />
                <span className="text-[10px] font-black italic tabular-nums text-emerald-400">{proteinPct}%</span>
              </div>
              <p className="mt-1 text-[12px] font-bold text-white">Abastecer proteína</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {Math.round(totals.protein)}g de {targets.protein}g
              </p>
            </Link>
            <Link
              href="/plano"
              onClick={() => hapticLight()}
              className="rounded-md border border-white/8 bg-white/4 px-3 py-2.5 transition-colors hover:bg-white/7 active:translate-y-px"
            >
              <div className="flex items-center justify-between">
                <DSIcon name="trendingUp" size={13} className="text-emerald-400/80" />
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Setup</span>
              </div>
              <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {workoutCount > 0 ? `${workoutCount} voltas completas` : 'Primeira volta hoje'}
              </p>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
      </div>
    </section>
  )
}

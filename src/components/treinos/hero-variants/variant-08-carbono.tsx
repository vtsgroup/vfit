'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { notifyMaestroSignal } from '@/lib/prompt-maestro'
import { type HeroVariantProps, translateMuscles } from './types'

// Redesign iOS azul+verde (2026-07, Claude Design): pivot carbono→vidro azul.
// Hero em gradiente navy→azul (#081326→#103061), cantos arredondados, dois blobs
// aurora (verde+azul) flutuando, tipografia reta com título em gradiente. Fibra
// bem sutil no fundo. O nome do componente/arquivo é preservado (HeroCarbono) —
// é o hero campeão importado por treinos/page.tsx.
const FIBER = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-l-2 border-sky-400/40 pl-2.5">
      <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-300/80">{label}</p>
      <p className={`mt-0.5 text-[20px] font-black leading-none tracking-tight ${accent ? 'text-emerald-300' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function CtaShell({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex h-12 items-center justify-center gap-2 rounded-[18px] text-[15px] font-black tracking-tight text-white transition-all duration-150 hover:brightness-110 active:translate-y-px active:brightness-90"
      style={{
        background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 16px 32px -14px rgba(34,197,94,0.6)',
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

  // R4 do Maestro: nenhum prompt não-legal antes de o usuário ver o CTA do
  // treino. O observer dispara o sinal uma única vez quando o CTA entra na tela.
  const ctaRef = useRef<HTMLAnchorElement | null>(null)
  useEffect(() => {
    const el = ctaRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      notifyMaestroSignal('hero_cta_seen')
      return
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        notifyMaestroSignal('hero_cta_seen')
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    // -mt-[2px]: sobrepõe o hero 2px sob o header fixo — mata a hairline de
    // fundo de página que aparece por arredondamento de device-pixel
    <section className="-mx-4 -mt-[2px] mb-5 text-white">
      <style>{`
        @keyframes vfit-v08-needle { from { transform: rotate(-90deg); } to { transform: rotate(${needleDeg}deg); } }
        @keyframes vfit-aurora { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.08); } }
      `}</style>

      <div
        className="relative overflow-hidden rounded-b-[32px]"
        style={{
          background: 'linear-gradient(180deg, #081326 0%, #0c1c3e 55%, #103061 100%)',
          boxShadow: '0 30px 54px -34px rgba(4,10,26,0.95)',
        }}
      >
        {/* fibra sutil */}
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: FIBER }} />
        {/* blobs aurora — verde + azul flutuando */}
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full [animation:vfit-aurora_9s_ease-in-out_infinite] motion-reduce:[animation:none]"
          style={{ background: 'radial-gradient(circle, rgba(62,213,106,0.30), transparent 62%)', filter: 'blur(28px)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-14 h-64 w-64 rounded-full [animation:vfit-aurora_11s_ease-in-out_infinite_reverse] motion-reduce:[animation:none]"
          style={{ background: 'radial-gradient(circle, rgba(64,132,255,0.34), transparent 62%)', filter: 'blur(32px)' }}
          aria-hidden
        />

        <div className="relative px-4 pb-5 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-emerald-300">
            Telemetria · dia {currentDay} de {totalDays}
          </p>
          <h1
            className="mt-1 text-[32px] font-black leading-[0.94] tracking-[-0.03em]"
            style={{
              background: 'linear-gradient(92deg, #fff 30%, #a8d4ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
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
                  <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-emerald-400/60 bg-[#0c1c3e]" />
                  <p className="absolute inset-x-0 bottom-0 text-center text-[17px] font-black leading-none text-white">
                    {goalPct}
                    <span className="text-[9px] font-bold text-slate-300">%</span>
                  </p>
                  <p className="absolute inset-x-0 -bottom-3.5 text-center text-[7px] font-bold uppercase tracking-[0.26em] text-slate-300/80">
                    Meta diária
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-2.5 pb-1">
                  <Readout label="XP" value={String(xp)} accent />
                  <Readout label="Streak" value={`${streakDays}d`} />
                </div>

                <div className="flex flex-col items-end gap-1 pb-1 text-right">
                  <DSIcon name="clock" size={14} className="text-emerald-300/80" />
                  <p className="text-[26px] font-black leading-none text-white">
                    {duration}
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-slate-300/80">min</p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-300/90">Próxima volta</p>
                <h2 className="mt-1 text-[21px] font-black leading-tight text-white">{todayDay.name ?? 'Treino do dia'}</h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{muscles}</p>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-slate-300/80">Plano</p>
                  <p className="text-[13px] font-black text-emerald-300">
                    {clampPct(planPct)}%
                  </p>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(3, clampPct(planPct))}%`, background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
                  />
                </div>
              </div>

              <Link ref={ctaRef} href="/plano" onClick={() => hapticLight()} className="mt-4 block">
                <CtaShell>
                  <DSIcon name="play" size={17} />
                  Começar treino de hoje
                </CtaShell>
              </Link>

              {/* Boxes de apoio — nutrição e evolução */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/nutricao"
                  onClick={() => hapticLight()}
                  className="group relative overflow-hidden rounded-2xl border-l-2 border-emerald-400/40 bg-white/5 px-3 py-2.5 backdrop-blur-[6px] transition-colors hover:bg-white/8 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="flask" size={13} className="text-emerald-300/80" />
                    <span className="text-[10px] font-black tabular-nums text-emerald-300">
                      {proteinPct}%
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Proteína</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300/80">
                    {Math.round(totals.protein)}g de {targets.protein}g
                  </p>
                </Link>
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="group relative overflow-hidden rounded-2xl border-l-2 border-sky-400/40 bg-white/5 px-3 py-2.5 backdrop-blur-[6px] transition-colors hover:bg-white/8 active:translate-y-px"
                >
                  <div className="flex items-center justify-between">
                    <DSIcon name="trendingUp" size={13} className="text-sky-300/80" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300/80">Próximo</span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-white">Evoluir plano</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300/80">
                    {workoutCount > 0 ? `${workoutCount} treinos no histórico` : `${caloriesPct}% da meta calórica`}
                  </p>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-emerald-300/90">Boxes abertos</p>
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

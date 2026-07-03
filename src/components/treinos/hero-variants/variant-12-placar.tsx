'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

const LED_GRID: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.45px)',
  backgroundSize: '4px 4px',
}

const BEZEL: React.CSSProperties = {
  background: 'linear-gradient(180deg, #2b323f 0%, #141922 38%, #07090d 100%)',
  boxShadow: '0 22px 54px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)',
}

const CTA_STYLE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 20px -6px rgba(6,95,70,0.55)',
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)))
}

function glow(color: string): React.CSSProperties {
  return { textShadow: `0 0 6px ${color}, 0 0 1px ${color}` }
}

function Screw({ pos }: { pos: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-[5px] w-[5px] rounded-full ${pos}`}
      style={{ background: 'radial-gradient(circle at 35% 30%, #5b6472, #171b22 70%)' }}
    />
  )
}

function StatCol({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2.5">
      <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p
        className={`font-mono text-[19px] font-black leading-none tracking-tight ${accent ? 'text-emerald-400' : 'text-slate-100'}`}
        style={glow(accent ? 'rgba(52,211,153,0.5)' : 'rgba(226,232,240,0.35)')}
      >
        {value}
        {unit ? <span className="ml-0.5 text-[9px] font-bold text-slate-400">{unit}</span> : null}
      </p>
    </div>
  )
}

export function HeroPlacar({
  userName,
  todayDay,
  plan,
  planPct,
  streak,
  xpBalance,
  dailyGoal,
}: HeroVariantProps) {
  const firstName = (userName?.split(' ')[0] ?? 'Atleta').toUpperCase()
  const currentDay = plan?.current_day ?? 1
  const totalDays = plan?.total_days ?? todayDay?.day_number ?? 1
  const duration = todayDay?.estimated_duration_min ?? 0
  const goalPct = clampPct((dailyGoal?.progress ?? 0) * 100)
  const xp = xpBalance?.balance ?? 0
  const streakDays = streak?.current_streak ?? 0
  const opponent = (translateMuscles(todayDay?.muscle_groups ?? [], 2) || 'Personalizado').toUpperCase()
  const clock = `${String(duration).padStart(2, '0')}`

  return (
    <section className="-mx-4 mb-4 px-3 pt-2 text-white">
      <style>{`
        @keyframes vfit-v12-colon { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0.2 } }
        .vfit-v12-colon { animation: vfit-v12-colon 2s steps(1) infinite }
        @media (prefers-reduced-motion: reduce) { .vfit-v12-colon { animation: none } }
      `}</style>

      <div className="relative rounded-[18px] p-[7px]" style={BEZEL}>
        <Screw pos="left-[7px] top-[7px]" />
        <Screw pos="right-[7px] top-[7px]" />
        <Screw pos="bottom-[7px] left-[7px]" />
        <Screw pos="bottom-[7px] right-[7px]" />

        <div className="relative overflow-hidden rounded-[12px] border border-black bg-[#04070b]">
          <div className="pointer-events-none absolute inset-0" style={LED_GRID} aria-hidden />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-16"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)' }}
            aria-hidden
          />

          <div className="relative flex items-center justify-between border-b border-white/10 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.9)' }} />
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-emerald-400" style={glow('rgba(52,211,153,0.4)')}>
                Ao vivo
              </span>
            </div>
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.34em] text-slate-400">VFIT Arena</p>
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-amber-300" style={glow('rgba(252,211,77,0.4)')}>
              {currentDay}º/{totalDays}
            </p>
          </div>

          {todayDay ? (
            <div className="relative">
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-3.5 pt-4">
                <div className="min-w-0">
                  <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-slate-400">Mandante</p>
                  <p
                    className="mt-1 truncate font-mono text-[15px] font-black uppercase tracking-[0.12em] text-slate-100"
                    style={glow('rgba(226,232,240,0.4)')}
                  >
                    {firstName}
                  </p>
                  <p className="mt-1.5 font-mono text-[38px] font-black leading-none tracking-tight text-emerald-400" style={glow('rgba(52,211,153,0.55)')}>
                    {goalPct}
                  </p>
                  <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.24em] text-slate-400">Meta diária</p>
                </div>

                <div className="flex flex-col items-center pt-4">
                  <p className="font-mono text-[11px] font-black tracking-[0.2em] text-slate-500">VS</p>
                </div>

                <div className="min-w-0 text-right">
                  <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-slate-400">Desafio</p>
                  <p className="mt-1 truncate font-mono text-[15px] font-black uppercase tracking-[0.12em] text-slate-100" style={glow('rgba(226,232,240,0.4)')}>
                    {opponent}
                  </p>
                  <p className="mt-1.5 font-mono text-[38px] font-black leading-none tracking-tight text-slate-500">100</p>
                  <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.24em] text-slate-400">Pra vencer</p>
                </div>
              </div>

              <div className="mt-3 flex flex-col items-center">
                <p className="font-mono text-[30px] font-black leading-none tracking-[0.06em] text-amber-300" style={glow('rgba(252,211,77,0.55)')}>
                  {clock}
                  <span className="vfit-v12-colon">:</span>00
                </p>
                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.3em] text-slate-400">Tempo de jogo · min</p>
              </div>

              <p className="mt-3 border-y border-white/10 px-3.5 py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-400/90">
                Partida de hoje · {todayDay.name ?? 'Treino do dia'}
              </p>

              <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
                <StatCol label="XP" value={String(xp)} accent />
                <StatCol label="Sequência" value={String(streakDays)} unit="D" />
                <StatCol label="Campanha" value={String(clampPct(planPct))} unit="%" />
              </div>

              <div className="relative p-3">
                <Link
                  href="/plano"
                  onClick={() => hapticLight()}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-black tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
                  style={CTA_STYLE}
                >
                  <DSIcon name="play" size={17} />
                  Começar partida
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative px-3.5 pb-3 pt-5 text-center">
              <p className="font-mono text-[22px] font-black uppercase tracking-[0.14em] text-slate-100" style={glow('rgba(226,232,240,0.4)')}>
                Tabela livre
              </p>
              <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-amber-300" style={glow('rgba(252,211,77,0.4)')}>
                Nenhuma partida marcada, {firstName}
              </p>
              <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-snug text-slate-300">
                Gere seu plano com IA e coloque o próximo confronto no placar.
              </p>
              <Link
                href="/plano"
                onClick={() => hapticLight()}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-black tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
                style={CTA_STYLE}
              >
                <DSIcon name="sparkles" size={17} />
                Gerar plano com IA
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

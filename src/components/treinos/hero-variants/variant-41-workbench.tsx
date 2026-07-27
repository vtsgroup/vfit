'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { hapticLight } from '@/lib/haptics'
import { type HeroVariantProps, translateMuscles } from './types'

/* Hallmark · macrostructure: Workbench · tone: technical-calm · anchor hue: emerald 145deg
 * genre: atmospheric · theme: Midnight (dark paper / geometric-sans / chromatic-green)
 * pre-emit critique: P5 H5 E4 S5 R5 V4
 * states: default · hover · focus-visible · active · empty(sem plano) · first-run(sem historico)
 *
 * Principio: acao primeiro, dado como suporte. O heroi nao exibe zero em slot
 * de metrica madura — quando nao ha historico, o espaco vira uma frase honesta.
 * Nenhum numero e inventado: tudo vem das props.
 */

const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR')

/** Trilho de dias do plano. Compacto acima de 10 dias para nao quebrar em 320px. */
function DayRail({ current, total }: { current: number; total: number }) {
  if (!total || total < 1) return null

  if (total > 10) {
    const pct = Math.min(100, Math.max(0, (current / total) * 100))
    return (
      <div className="flex min-w-0 items-center gap-2">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/12">
          <div
            className="h-full rounded-full bg-[var(--color-brand-primary)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-[var(--color-text-muted-cool)]">
          {current}/{total}
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5" aria-label={`Dia ${current} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            i < current
              ? 'h-1 w-4 rounded-full bg-[var(--color-brand-primary)]'
              : 'h-1 w-4 rounded-full bg-white/12'
          }
        />
      ))}
      <span className="ml-1 shrink-0 text-[11px] font-medium tabular-nums text-[var(--color-text-muted-cool)]">
        {current}/{total}
      </span>
    </div>
  )
}

/** Uma linha de macro. Sem dado consumido, mostra a meta — nunca "0 / X". */
function MacroRow({
  label,
  value,
  target,
  unit,
  hasData,
}: {
  label: string
  value: number
  target: number
  unit: string
  hasData: boolean
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-[var(--color-text-secondary-cool)]">
          {label}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-[var(--color-text-primary-cool)]">
          {hasData ? (
            <>
              <span className="font-semibold">{fmt(value)}</span>
              <span className="text-[var(--color-text-muted-cool)]"> / {fmt(target)}</span>
            </>
          ) : (
            <span className="font-semibold">
              {fmt(target)}
              <span className="ml-0.5 font-normal text-[var(--color-text-muted-cool)]">{unit}</span>
            </span>
          )}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--color-brand-primary)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function HeroWorkbench({
  userName,
  todayDay,
  plan,
  totals,
  targets,
  streak,
  xpBalance,
  workoutCount,
}: HeroVariantProps) {
  const firstName = userName?.trim().split(' ')[0]
  const currentDay = todayDay?.day_number ?? plan?.current_day ?? 0
  const totalDays = plan?.total_days ?? 0
  const duration = todayDay?.estimated_duration_min ?? 0
  const muscles = todayDay?.muscle_groups?.length ? translateMuscles(todayDay.muscle_groups) : null

  const hasNutrition = totals.calories > 0
  const hasTargets = targets.calories > 0
  const streakDays = streak?.current_streak ?? 0
  const xp = xpBalance?.balance ?? 0
  const hasHistory = streakDays > 0 || xp > 0 || workoutCount > 0

  return (
    <section className="relative mb-5 overflow-hidden rounded-[var(--radius-3xl)] border border-white/8 bg-[var(--color-bg-dark-secondary)]">
      {/* Profundidade: um unico wash diagonal, nao tres blobs radiais */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(155deg, var(--color-brand-glow-weak) 0%, transparent 46%), linear-gradient(0deg, var(--color-brand-navy) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-5">
        {/* Linha de contexto — saudacao discreta + trilho real do plano */}
        <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="min-w-0 truncate text-[13px] font-medium text-[var(--color-text-secondary-cool)]">
            {firstName ? `Bora, ${firstName}` : 'Bora treinar'}
          </p>
          <DayRail current={currentDay} total={totalDays} />
        </div>

        {todayDay ? (
          <>
            {/* O conteudo real vira manchete — nao o rotulo "TREINO DE HOJE" */}
            <h1
              className="text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--color-text-primary-cool)]"
              style={{ overflowWrap: 'anywhere', minWidth: 0 }}
            >
              {todayDay.name}
            </h1>

            {(muscles || duration > 0) && (
              <p className="mt-2 text-[13px] text-[var(--color-text-muted-cool)]">
                {muscles}
                {muscles && duration > 0 ? ' · ' : ''}
                {duration > 0 ? `${duration} min` : ''}
              </p>
            )}

            <Link
              href="/plano"
              onClick={() => hapticLight()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-brand-primary)] px-5 py-3.5 text-[15px] font-semibold text-[var(--color-brand-navy)] shadow-[0_10px_30px_var(--color-brand-glow-weak)] transition-transform duration-150 ease-out hover:bg-[var(--color-brand-mint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <DSIcon name="play" size={16} />
              Começar treino
            </Link>
          </>
        ) : (
          /* Estado vazio: sem treino hoje. Nao finge dado — oferece a saida. */
          <>
            <h1 className="text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-[var(--color-text-primary-cool)]">
              Sem treino para hoje
            </h1>
            <p className="mt-2 text-[13px] text-[var(--color-text-muted-cool)]">
              {plan ? 'Seu plano não tem sessão marcada para hoje.' : 'Você ainda não tem um plano ativo.'}
            </p>
            <Link
              href="/plano"
              onClick={() => hapticLight()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-brand-ring)] bg-white/5 px-5 py-3.5 text-[15px] font-semibold text-[var(--color-text-primary-cool)] transition-transform duration-150 ease-out hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {plan ? 'Ver meu plano' : 'Criar meu plano'}
              <DSIcon name="chevronRight" size={15} />
            </Link>
          </>
        )}

        {/* Macros — enquadrados como meta quando ainda nao ha consumo */}
        {hasTargets && (
          <div className="mt-6 border-t border-white/8 pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-semibold text-[var(--color-text-primary-cool)]">
                {hasNutrition ? 'Consumo de hoje' : 'Meta de hoje'}
              </h2>
              <Link
                href="/nutricao"
                onClick={() => hapticLight()}
                className="shrink-0 rounded-[var(--radius-sm)] text-[12px] font-medium text-[var(--color-text-muted-cool)] transition-colors hover:text-[var(--color-brand-mint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-mint)]"
              >
                Registrar
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MacroRow label="Calorias" value={totals.calories} target={targets.calories} unit=" kcal" hasData={hasNutrition} />
              <MacroRow label="Proteína" value={totals.protein} target={targets.protein} unit="g" hasData={hasNutrition} />
              <MacroRow label="Carbos" value={totals.carbs} target={targets.carbs} unit="g" hasData={hasNutrition} />
              <MacroRow label="Gordura" value={totals.fat} target={targets.fat} unit="g" hasData={hasNutrition} />
            </div>
          </div>
        )}

        {/* Maturidade: so aparece quando existe historico. Sem zeros decorativos. */}
        <div className="mt-4 border-t border-white/8 pt-4">
          {hasHistory ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {streakDays > 0 && (
                <span className="text-[13px] text-[var(--color-text-secondary-cool)]">
                  <span className="font-semibold tabular-nums text-[var(--color-text-primary-cool)]">{streakDays}</span>
                  {streakDays === 1 ? ' dia seguido' : ' dias seguidos'}
                </span>
              )}
              {workoutCount > 0 && (
                <span className="text-[13px] text-[var(--color-text-secondary-cool)]">
                  <span className="font-semibold tabular-nums text-[var(--color-text-primary-cool)]">{workoutCount}</span>
                  {workoutCount === 1 ? ' treino feito' : ' treinos feitos'}
                </span>
              )}
              {xp > 0 && (
                <span className="text-[13px] text-[var(--color-text-secondary-cool)]">
                  <span className="font-semibold tabular-nums text-[var(--color-text-primary-cool)]">{fmt(xp)}</span> XP
                </span>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-[var(--color-text-muted-cool)]">
              Seu histórico começa neste treino.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default HeroWorkbench

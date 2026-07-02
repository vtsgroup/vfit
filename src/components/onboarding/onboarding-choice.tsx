'use client'

/**
 * onboarding-choice — cards de escolha "VFIT BROADCAST".
 * Base seca neutra (hairline branco), SELECIONADO = tinta de placar verde→lima
 * (anel lima + fill + check), aparato/meta em mono. Disciplina de cor: verde/lima
 * só no estado selecionado. API preservada (tone aceito por compat, unificado ao lima).
 */

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

type ChoiceTone = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'slate'

/* Broadcast: estado base seco vs selecionado (verde→lima). Não usa mais variação
   por tom — a marca fala em verde/lima concentrado no ponto de escolha. */
const BASE_CARD: CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
}
const SELECTED_CARD: CSSProperties = {
  background: 'linear-gradient(135deg, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0.07) 55%, rgba(5,10,18,0.35) 100%)',
  boxShadow: '0 0 0 1px rgba(74,222,128,0.55), 0 20px 44px -22px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
}
const ICON_SEL: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(74,222,128,0.28) 0%, rgba(34,197,94,0.08) 100%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 22px -8px rgba(34,197,94,0.7)',
  borderColor: 'rgba(74,222,128,0.45)',
}
const ICON_BASE: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
}
const CHECK_SEL: CSSProperties = {
  background: 'linear-gradient(135deg,#4ade80,#16a34a)',
  boxShadow: '0 5px 14px -2px rgba(34,197,94,0.7), inset 0 1px 0 rgba(255,255,255,0.5)',
}
const ICON_GLOW = 'drop-shadow(0 0 9px rgba(74,222,128,0.85))'

interface ChoiceBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  label: string
  description?: string
  icon?: DSIconName
  mark?: string
  meta?: string
  tone?: ChoiceTone
}

/* ─── Card vertical (grid de opções) ─── */
export function OnboardingChoiceCard({ selected, label, description, icon, mark, meta, tone: _tone, className, ...props }: ChoiceBaseProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative min-h-34 cursor-pointer overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.985]',
        selected ? 'border-green-300/40' : 'border-white/10 hover:border-white/20',
        className,
      )}
      style={selected ? SELECTED_CARD : BASE_CARD}
      {...props}
    >
      <span className="relative z-10 flex items-start justify-between gap-3">
        <span
          className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 group-hover:scale-105', selected ? 'border-transparent text-green-200' : 'border-white/10 text-white/55 group-hover:text-white/80')}
          style={selected ? ICON_SEL : ICON_BASE}
        >
          {icon ? <DSIcon name={icon} size={24} style={selected ? { filter: ICON_GLOW } : undefined} /> : <span className="bc-mono text-2xl font-black leading-none">{mark}</span>}
        </span>
        <span
          className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200', selected ? 'border-transparent text-[#06210f]' : 'border-white/12 bg-white/5 text-white/22')}
          style={selected ? CHECK_SEL : undefined}
        >
          <DSIcon name="check" size={14} className={selected ? '' : 'opacity-0 transition-opacity group-hover:opacity-40'} />
        </span>
      </span>

      <span className="font-syne relative z-10 mt-5 block text-base font-black leading-tight text-white">{label}</span>
      {description && <span className="relative z-10 mt-1.5 block text-xs font-medium leading-5 text-slate-300/82">{description}</span>}
      {meta && <span className="bc-mono relative z-10 mt-3 inline-flex min-h-6 items-center rounded-sm border border-white/10 bg-white/[0.03] px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300/72">{meta}</span>}
    </button>
  )
}

/* ─── Row horizontal (lista de opções — gênero, nível, etc.) ─── */
export function OnboardingChoiceRow({ selected, label, description, icon, mark, meta, tone: _tone, className, ...props }: ChoiceBaseProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative flex min-h-16 w-full cursor-pointer items-center gap-3.5 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99] sm:min-h-20 sm:px-5 sm:py-3.5',
        selected ? 'border-green-300/40' : 'border-white/10 hover:border-white/20',
        className,
      )}
      style={selected ? SELECTED_CARD : BASE_CARD}
      {...props}
    >
      <span
        className={cn('relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 group-hover:scale-105 sm:h-12 sm:w-12', selected ? 'border-transparent text-green-200' : 'border-white/10 text-white/55 group-hover:text-white/80')}
        style={selected ? ICON_SEL : ICON_BASE}
      >
        {icon ? <DSIcon name={icon} size={22} style={selected ? { filter: ICON_GLOW } : undefined} /> : <span className="bc-mono text-base font-black leading-none sm:text-xl">{mark}</span>}
      </span>

      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-syne block text-[15px] font-black leading-tight text-white sm:text-base">{label}</span>
          {meta && <span className="bc-mono rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300/78">{meta}</span>}
        </span>
        {description && <span className="mt-0.5 block text-[11px] font-medium leading-4 text-slate-300/72 sm:mt-1 sm:text-xs sm:leading-5">{description}</span>}
      </span>

      <span
        className={cn('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200', selected ? 'border-transparent text-[#06210f]' : 'border-white/12 bg-white/5 text-white/22')}
        style={selected ? CHECK_SEL : undefined}
      >
        <DSIcon name="check" size={14} className={selected ? '' : 'opacity-0 transition-opacity group-hover:opacity-40'} />
      </span>
    </button>
  )
}

/* ─── Chip (multi-seleção) ─── */
interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  children: ReactNode
  icon?: DSIconName
  tone?: ChoiceTone
}

export function OnboardingChoiceChip({ selected, children, icon, tone: _tone, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative inline-flex min-h-11 cursor-pointer items-center gap-2 overflow-hidden rounded-full border px-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]',
        selected ? 'border-green-300/40 text-[#06210f]' : 'border-white/10 text-slate-300 hover:border-white/20',
        className,
      )}
      style={selected ? { background: 'linear-gradient(135deg,#4ade80,#22c55e)', boxShadow: '0 8px 22px -8px rgba(34,197,94,0.65), inset 0 1px 0 rgba(255,255,255,0.4)' } : BASE_CARD}
      {...props}
    >
      {icon && <DSIcon name={icon} size={16} className="relative" />}
      <span className="relative">{children}</span>
      {selected && <DSIcon name="check" size={14} className="relative" />}
    </button>
  )
}

/* ─── Insight (dica contextual) ─── */
export function OnboardingInsight({ icon = 'sparkles', children }: { icon?: DSIconName; children: ReactNode }) {
  return (
    <div className="relative flex items-start gap-3 overflow-hidden rounded-lg border border-white/8 border-l-2 border-l-green-400/60 bg-white/[0.02] px-4 py-3.5">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-green-300/24 text-green-200"
        style={{ background: 'linear-gradient(180deg, rgba(74,222,128,0.18), rgba(34,197,94,0.05))' }}
      >
        <DSIcon name={icon} size={16} />
      </span>
      <p className="text-sm font-medium leading-6 text-slate-300">{children}</p>
    </div>
  )
}

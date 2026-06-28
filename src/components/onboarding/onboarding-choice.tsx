'use client'

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

type ChoiceTone = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'slate'

/* Base RGB + classe de texto por tom. Todo o tratamento (borda-gradiente, glow,
   chip de ícone, check) é derivado do RGB — visual ultra-moderno e coerente. */
const TONE: Record<ChoiceTone, { rgb: string; text: string }> = {
  emerald: { rgb: '52,211,153', text: 'text-emerald-200' },
  sky: { rgb: '56,189,248', text: 'text-sky-200' },
  violet: { rgb: '167,139,250', text: 'text-violet-200' },
  amber: { rgb: '251,191,36', text: 'text-amber-200' },
  rose: { rgb: '251,113,133', text: 'text-rose-200' },
  slate: { rgb: '203,213,225', text: 'text-slate-200' },
}

/* Estilos derivados do tom (selecionado vs base) */
function toneStyle(rgb: string) {
  return {
    selectedCard: {
      background: `linear-gradient(135deg, rgba(${rgb},0.15) 0%, rgba(${rgb},0.05) 52%, rgba(5,10,18,0.42) 100%)`,
      boxShadow: `0 26px 60px -34px rgba(${rgb},0.6), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(${rgb},0.45)`,
    } as CSSProperties,
    baseCard: {
      background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.022) 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 32px -26px rgba(0,0,0,0.7)',
    } as CSSProperties,
    border: `linear-gradient(135deg, rgba(${rgb},0.75) 0%, rgba(${rgb},0.30) 45%, transparent 75%)`,
    iconSel: {
      background: `linear-gradient(180deg, rgba(${rgb},0.24) 0%, rgba(${rgb},0.06) 100%)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 16px -6px rgba(${rgb},0.55)`,
      borderColor: `rgba(${rgb},0.32)`,
    } as CSSProperties,
    iconBase: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
    } as CSSProperties,
    iconGlow: `drop-shadow(0 0 8px rgba(${rgb},0.6))`,
    check: {
      background: `linear-gradient(135deg, rgba(${rgb},1), rgba(${rgb},0.72))`,
      boxShadow: `0 4px 12px -2px rgba(${rgb},0.6), inset 0 1px 0 rgba(255,255,255,0.45)`,
    } as CSSProperties,
    mesh: `radial-gradient(circle, rgba(${rgb},0.32) 0%, transparent 70%)`,
  }
}

/* Borda-gradiente (técnica mask) — some/aparece por opacidade */
function GradientBorder({ image, radius, show }: { image: string; radius: string; show: 'always' | 'hover' | 'on'; }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 transition-opacity duration-300',
        show === 'on' ? 'opacity-100' : show === 'hover' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
        radius,
      )}
      style={{
        padding: '1px',
        background: image,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
  )
}

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
export function OnboardingChoiceCard({ selected, label, description, icon, mark, meta, tone = 'emerald', className, ...props }: ChoiceBaseProps) {
  const t = TONE[tone]
  const s = toneStyle(t.rgb)
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative min-h-34 cursor-pointer overflow-hidden rounded-2xl border border-white/8 p-4 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.985]',
        className,
      )}
      style={selected ? s.selectedCard : s.baseCard}
      {...props}
    >
      <GradientBorder image={s.border} radius="rounded-2xl" show={selected ? 'on' : 'hover'} />
      {selected && <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-md" style={{ background: s.mesh }} />}

      <span className="relative z-10 flex items-start justify-between gap-3">
        <span
          className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105', selected ? `${t.text} border-transparent` : 'border-white/10 text-white/55 group-hover:text-white/80')}
          style={selected ? s.iconSel : s.iconBase}
        >
          {icon ? <DSIcon name={icon} size={24} style={selected ? { filter: s.iconGlow } : undefined} /> : <span className="text-2xl font-black leading-none">{mark}</span>}
        </span>
        <span
          className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300', selected ? 'border-transparent text-bg-base' : 'border-white/12 bg-white/5 text-white/22')}
          style={selected ? s.check : undefined}
        >
          <DSIcon name="check" size={14} className={selected ? '' : 'opacity-0 transition-opacity group-hover:opacity-40'} />
        </span>
      </span>

      <span className="relative z-10 mt-5 block text-base font-black leading-tight text-white">{label}</span>
      {description && <span className="relative z-10 mt-1.5 block text-xs font-medium leading-5 text-slate-300/82">{description}</span>}
      {meta && <span className="relative z-10 mt-3 inline-flex min-h-7 items-center rounded-full border border-white/10 bg-bg-base/34 px-2.5 text-[10px] font-black uppercase tracking-wide text-slate-300/72">{meta}</span>}
    </button>
  )
}

/* ─── Row horizontal (lista de opções — gênero, nível, etc.) ─── */
export function OnboardingChoiceRow({ selected, label, description, icon, mark, meta, tone = 'emerald', className, ...props }: ChoiceBaseProps) {
  const t = TONE[tone]
  const s = toneStyle(t.rgb)
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'vfit-choice-row group relative flex min-h-16 w-full cursor-pointer items-center gap-3.5 overflow-hidden rounded-card-lg border border-white/8 px-4 py-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.99] sm:min-h-20 sm:rounded-[22px] sm:px-5 sm:py-3.5',
        className,
      )}
      style={selected ? s.selectedCard : s.baseCard}
      {...props}
    >
      <GradientBorder image={s.border} radius="rounded-[22px]" show={selected ? 'on' : 'hover'} />
      {selected && <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full blur-md" style={{ background: s.mesh }} />}

      <span
        className={cn('vfit-choice-row-icon relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border transition-all duration-300 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl', selected ? `${t.text} border-transparent` : 'border-white/10 text-white/55 group-hover:text-white/80')}
        style={selected ? s.iconSel : s.iconBase}
      >
        {icon ? <DSIcon name={icon} size={22} style={selected ? { filter: s.iconGlow } : undefined} /> : <span className="text-base font-black leading-none sm:text-xl">{mark}</span>}
      </span>

      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-[15px] font-black leading-tight text-white sm:text-base">{label}</span>
          {meta && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300/78">{meta}</span>}
        </span>
        {description && <span className="vfit-choice-row-description mt-0.5 block text-[11px] font-medium leading-4 text-slate-300/72 sm:mt-1 sm:text-xs sm:leading-5">{description}</span>}
      </span>

      <span
        className={cn('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300', selected ? 'border-transparent text-bg-base' : 'border-white/12 bg-white/5 text-white/22')}
        style={selected ? s.check : undefined}
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

export function OnboardingChoiceChip({ selected, children, icon, tone = 'emerald', className, ...props }: ChipProps) {
  const t = TONE[tone]
  const s = toneStyle(t.rgb)
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative inline-flex min-h-11 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-white/8 px-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]',
        selected ? 'text-white' : 'text-slate-300',
        className,
      )}
      style={selected ? s.selectedCard : s.baseCard}
      {...props}
    >
      <GradientBorder image={s.border} radius="rounded-full" show={selected ? 'on' : 'hover'} />
      {icon && <DSIcon name={icon} size={16} className={cn('relative', selected ? t.text : 'text-white/54')} style={selected ? { filter: s.iconGlow } : undefined} />}
      <span className="relative">{children}</span>
      {selected && <DSIcon name="check" size={14} className={cn('relative', t.text)} />}
    </button>
  )
}

/* ─── Insight (dica contextual) ─── */
export function OnboardingInsight({ icon = 'sparkles', children }: { icon?: DSIconName; children: ReactNode }) {
  return (
    <div
      className="relative flex items-start gap-3 overflow-hidden rounded-[18px] border border-white/8 px-4 py-3.5"
      style={{ background: 'linear-gradient(160deg, rgba(52,211,153,0.08) 0%, rgba(255,255,255,0.02) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
    >
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-300/24 text-emerald-200"
        style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.2), rgba(34,197,94,0.05))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)' }}
      >
        <DSIcon name={icon} size={16} />
      </span>
      <p className="text-sm font-medium leading-6 text-slate-300">{children}</p>
    </div>
  )
}

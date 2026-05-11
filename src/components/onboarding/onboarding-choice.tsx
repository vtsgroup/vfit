'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

type ChoiceTone = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'slate'

const toneStyles: Record<ChoiceTone, { selected: string; icon: string; check: string; accent: string }> = {
  emerald: {
    selected: 'border-emerald-300/70 bg-emerald-300/13 shadow-[0_22px_58px_-36px_rgba(34,197,94,0.72),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-emerald-200 bg-emerald-300/12 border-emerald-200/18',
    check: 'bg-emerald-300 text-bg-base',
    accent: 'from-emerald-300/18 via-transparent to-transparent',
  },
  sky: {
    selected: 'border-sky-300/62 bg-sky-300/11 shadow-[0_22px_58px_-36px_rgba(56,189,248,0.58),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-sky-200 bg-sky-300/12 border-sky-200/18',
    check: 'bg-sky-300 text-bg-base',
    accent: 'from-sky-300/16 via-transparent to-transparent',
  },
  violet: {
    selected: 'border-violet-300/58 bg-violet-300/10 shadow-[0_22px_58px_-36px_rgba(167,139,250,0.52),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-violet-200 bg-violet-300/12 border-violet-200/18',
    check: 'bg-violet-300 text-bg-base',
    accent: 'from-violet-300/14 via-transparent to-transparent',
  },
  amber: {
    selected: 'border-amber-300/58 bg-amber-300/10 shadow-[0_22px_58px_-36px_rgba(251,191,36,0.46),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-amber-200 bg-amber-300/12 border-amber-200/18',
    check: 'bg-amber-300 text-bg-base',
    accent: 'from-amber-300/14 via-transparent to-transparent',
  },
  rose: {
    selected: 'border-rose-300/56 bg-rose-300/10 shadow-[0_22px_58px_-36px_rgba(251,113,133,0.44),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-rose-200 bg-rose-300/12 border-rose-200/18',
    check: 'bg-rose-300 text-bg-base',
    accent: 'from-rose-300/14 via-transparent to-transparent',
  },
  slate: {
    selected: 'border-white/24 bg-white/10 shadow-[0_22px_58px_-38px_rgba(148,163,184,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]',
    icon: 'text-slate-200 bg-white/8 border-white/14',
    check: 'bg-white text-bg-base',
    accent: 'from-white/10 via-transparent to-transparent',
  },
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

export function OnboardingChoiceCard({
  selected,
  label,
  description,
  icon,
  mark,
  meta,
  tone = 'emerald',
  className,
  ...props
}: ChoiceBaseProps) {
  const styles = toneStyles[tone]

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'group relative min-h-34 cursor-pointer overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ease-out active:scale-[0.985]',
        selected ? styles.selected : 'border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:border-white/18 hover:bg-white/8',
        className
      )}
      {...props}
    >
      <span className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b opacity-100', styles.accent)} />
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/28 to-transparent" />

      <span className="relative z-10 flex items-start justify-between gap-3">
        <span className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] border transition-all duration-300', selected ? styles.icon : 'border-white/10 bg-white/6 text-white/56 group-hover:text-white/72')}>
          {icon ? <DSIcon name={icon} size={24} /> : <span className="text-2xl font-black leading-none">{mark}</span>}
        </span>

        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300', selected ? `${styles.check} border-transparent opacity-100` : 'border-white/12 bg-white/5 text-white/24 opacity-70')}>
          <DSIcon name="check" size={14} />
        </span>
      </span>

      <span className="relative z-10 mt-5 block text-base font-black leading-tight text-white">{label}</span>
      {description && <span className="relative z-10 mt-1.5 block text-xs font-medium leading-5 text-slate-300/82">{description}</span>}
      {meta && <span className="relative z-10 mt-3 inline-flex min-h-7 items-center rounded-full border border-white/8 bg-bg-base/34 px-2.5 text-[10px] font-black uppercase text-slate-300/72">{meta}</span>}
    </button>
  )
}

export function OnboardingChoiceRow({
  selected,
  label,
  description,
  icon,
  mark,
  meta,
  tone = 'emerald',
  className,
  ...props
}: ChoiceBaseProps) {
  const styles = toneStyles[tone]

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'vfit-choice-row group relative flex min-h-16 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-card-lg border px-3.5 py-2 text-left transition-all duration-300 ease-out active:scale-[0.988] sm:min-h-20 sm:rounded-[22px] sm:px-4 sm:py-3',
        selected ? styles.selected : 'border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:border-white/18 hover:bg-white/8',
        className
      )}
      {...props}
    >
      <span className={cn('pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r opacity-100', styles.accent)} />
      <span className={cn('vfit-choice-row-icon relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-[17px]', selected ? styles.icon : 'border-white/10 bg-white/6 text-white/56 group-hover:text-white/72')}>
        {icon ? <DSIcon name={icon} size={21} /> : <span className="text-base font-black leading-none sm:text-xl">{mark}</span>}
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="block text-sm font-black leading-tight text-white sm:text-[15px]">{label}</span>
          {meta && <span className="rounded-full border border-white/8 bg-bg-base/34 px-2 py-0.5 text-[10px] font-bold text-slate-300/72">{meta}</span>}
        </span>
        {description && <span className="vfit-choice-row-description mt-0.5 block text-[11px] font-medium leading-4 text-slate-300/74 sm:mt-1 sm:text-xs sm:leading-5">{description}</span>}
      </span>
      <span className={cn('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300', selected ? `${styles.check} border-transparent opacity-100` : 'border-white/12 bg-white/5 text-white/24 opacity-70')}>
        <DSIcon name="check" size={14} />
      </span>
    </button>
  )
}

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  children: ReactNode
  icon?: DSIconName
  tone?: ChoiceTone
}

export function OnboardingChoiceChip({ selected, children, icon, tone = 'emerald', className, ...props }: ChipProps) {
  const styles = toneStyles[tone]

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all duration-300 active:scale-[0.97]',
        selected ? `${styles.selected} text-white` : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/18 hover:bg-white/8',
        className
      )}
      {...props}
    >
      {icon && <DSIcon name={icon} size={16} className={selected ? styles.icon.split(' ')[0] : 'text-white/54'} />}
      {children}
      {selected && <DSIcon name="check" size={14} className="text-emerald-200" />}
    </button>
  )
}

export function OnboardingInsight({ icon = 'sparkles', children }: { icon?: DSIconName; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-card-lg border border-white/10 bg-white/6 px-4 py-3 shadow-glass-inset-sm">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-emerald-300/12 text-emerald-200">
        <DSIcon name={icon} size={16} />
      </span>
      <p className="text-sm font-medium leading-6 text-slate-300">{children}</p>
    </div>
  )
}
import type React from 'react'
import Link from 'next/link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'

export type ProfileShellTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate'

const toneStyles: Record<ProfileShellTone, { icon: string; badge: string; wash: string; text: string }> = {
  emerald: {
    icon: 'from-emerald-300 to-emerald-600 text-white shadow-[0_16px_32px_-20px_rgba(5,150,105,0.95)]',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    wash: 'from-emerald-50 via-white to-sky-50',
    text: 'text-emerald-700',
  },
  sky: {
    icon: 'from-sky-300 to-blue-600 text-white shadow-[0_16px_32px_-20px_rgba(37,99,235,0.9)]',
    badge: 'border-sky-200 bg-sky-50 text-sky-700',
    wash: 'from-sky-50 via-white to-emerald-50',
    text: 'text-sky-700',
  },
  amber: {
    icon: 'from-amber-200 to-amber-600 text-amber-950 shadow-[0_16px_32px_-20px_rgba(217,119,6,0.9)]',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    wash: 'from-amber-50 via-white to-emerald-50',
    text: 'text-amber-800',
  },
  violet: {
    icon: 'from-violet-300 to-indigo-600 text-white shadow-[0_16px_32px_-20px_rgba(109,40,217,0.9)]',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    wash: 'from-violet-50 via-white to-sky-50',
    text: 'text-violet-700',
  },
  rose: {
    icon: 'from-rose-300 to-rose-600 text-white shadow-[0_16px_32px_-20px_rgba(225,29,72,0.85)]',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    wash: 'from-rose-50 via-white to-amber-50',
    text: 'text-rose-700',
  },
  slate: {
    icon: 'from-slate-300 to-slate-700 text-white shadow-[0_16px_32px_-20px_rgba(15,23,42,0.85)]',
    badge: 'border-slate-200 bg-slate-100 text-slate-700',
    wash: 'from-slate-100 via-white to-sky-50',
    text: 'text-slate-700',
  },
}

export function ProfileDetailShell({
  title,
  subtitle,
  icon,
  tone = 'emerald',
  eyebrow = 'Configurações',
  meta,
  action,
  children,
  className,
}: {
  title: string
  subtitle: string
  icon: DSIconName
  tone?: ProfileShellTone
  eyebrow?: string
  meta?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const styles = toneStyles[tone]

  return (
    <div className={cn('mx-auto min-h-dvh max-w-lg bg-linear-to-b from-white via-slate-50 to-white px-4 pt-0 pb-28 text-slate-950', className)}>
      <header
        className="vfit-app-hero-gradient relative -mx-4 mb-5 overflow-hidden rounded-b-[34px] px-4 pb-6 pt-5 text-white"
        style={{ boxShadow: '0 22px 46px -28px rgba(5,10,18,0.96)' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/10 via-sky-300/6 to-transparent" />

        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <Link
            href="/perfil"
            aria-label="Voltar ao perfil"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/12 bg-white/8 text-white/75 shadow-glass-inset-md transition-all duration-200 hover:bg-white/12 hover:text-white active:scale-95"
          >
            <DSIcon name="arrowLeft" size={20} />
          </Link>

          <span className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/7 px-3 text-[10px] font-black uppercase text-emerald-200">
            {eyebrow}
          </span>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            {action}
          </div>
        </div>

        <div className="relative z-10 flex items-start gap-4">
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-card-lg bg-linear-to-b ring-1 ring-white/18', styles.icon)}>
            <DSIcon name={icon} size={25} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[25px] font-black leading-tight text-white">{title}</h1>
            <p className="mt-1 text-[13px] font-medium leading-snug text-slate-300">{subtitle}</p>
            {meta && <div className="mt-4">{meta}</div>}
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}

export function ProfileCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]', className)}>
      {children}
    </div>
  )
}

export function ProfileTintCard({ children, tone = 'emerald', className }: { children: React.ReactNode; tone?: ProfileShellTone; className?: string }) {
  const styles = toneStyles[tone]

  return (
    <div className={cn('rounded-[28px] border border-slate-200 bg-linear-to-br p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]', styles.wash, className)}>
      {children}
    </div>
  )
}

export function ProfilePill({ children, tone = 'emerald', className }: { children: React.ReactNode; tone?: ProfileShellTone; className?: string }) {
  const styles = toneStyles[tone]

  return (
    <span className={cn('inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] font-black', styles.badge, className)}>
      {children}
    </span>
  )
}

export function ProfileSectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-2 px-1">
      <p className="text-[10px] font-black uppercase text-emerald-600">{eyebrow}</p>
      <h2 className="text-[16px] font-black text-slate-950">{title}</h2>
    </div>
  )
}

export function ProfileToggle({ enabled }: { enabled: boolean }) {
  return (
    <div className={cn('flex h-7 w-13 items-center rounded-full p-1 transition-colors', enabled ? 'bg-emerald-500' : 'bg-slate-300')}>
      <div className={cn('h-5 w-5 rounded-full bg-white shadow-sm transition-transform', enabled ? 'translate-x-6' : 'translate-x-0')} />
    </div>
  )
}

export function ProfileReturnLink({ label = 'Voltar ao perfil' }: { label?: string }) {
  return (
    <div className="mx-auto -mt-8 mb-8 max-w-4xl px-6">
      <Link
        href="/perfil"
        className="inline-flex min-h-11 items-center gap-2 rounded-[15px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.45)] transition-all hover:border-emerald-200 hover:text-emerald-700"
      >
        <DSIcon name="arrowLeft" size={17} />
        {label}
      </Link>
    </div>
  )
}
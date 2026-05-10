/**
 * src/app/(app)/ia/page.tsx
 *
 * Hub IA — VFIT B2C
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { TIPS, TIP_CATEGORIES, getTipOfTheDay } from '@config/tips'
import type { Tip } from '@config/tips'
import { cn } from '@/lib/utils'
import { IA_CONSULTATION_OPTIONS } from '@/types/ia-consultation'

type AIMode = 'goals' | 'nutrition' | 'workout' | 'recovery'
type TipCategoryId = (typeof TIP_CATEGORIES)[number]['id']

const AI_MODES: Array<{ id: AIMode; label: string; icon: DSIconName; description: string }> = [
  { id: 'goals', label: 'Metas', icon: 'target', description: 'Objetivo, prazo e próxima ação' },
  { id: 'nutrition', label: 'Nutrição', icon: 'apple', description: 'Dieta, macros e ajustes' },
  { id: 'workout', label: 'Treino', icon: 'dumbbell', description: 'Plano, carga e adaptação' },
  { id: 'recovery', label: 'Recuperação', icon: 'moon', description: 'Sono, deload e energia' },
]

const GOAL_BLUEPRINTS: Array<{ id: string; title: string; description: string; icon: DSIconName; tone: string }> = [
  { id: 'shape', title: 'Recomposição', description: 'Perder gordura mantendo força e massa magra.', icon: 'activity', tone: 'from-emerald-50 to-sky-50 text-emerald-700 ring-emerald-100' },
  { id: 'strength', title: 'Força visível', description: 'Evoluir carga, reps e recordes sem quebrar rotina.', icon: 'zap', tone: 'from-amber-50 to-orange-50 text-amber-700 ring-amber-100' },
  { id: 'routine', title: 'Consistência', description: 'Criar uma sequência realista para treinar toda semana.', icon: 'calendarCheck', tone: 'from-violet-50 to-indigo-50 text-violet-700 ring-violet-100' },
]

const AI_SHORTCUTS: Array<{ label: string; description: string; href: string; icon: DSIconName; badge: string; tone: string }> = [
  { label: 'Dieta personalizada', description: 'Plano alimentar por objetivo e rotina.', href: '/ia/dieta', icon: 'apple', badge: 'Pronto', tone: 'emerald' },
  { label: 'Macros inteligentes', description: 'Proteína, carbo e gordura com contexto.', href: '/ia/macros', icon: 'barChart', badge: 'Beta', tone: 'sky' },
  { label: 'Adaptar treino', description: 'Ajuste por dor, tempo e equipamento.', href: '/ia/treino-adaptado', icon: 'dumbbell', badge: 'Beta', tone: 'violet' },
  { label: 'Recuperação', description: 'Sono, deload e descanso entre sessões.', href: '/ia/recuperacao', icon: 'moon', badge: 'Beta', tone: 'slate' },
  { label: 'Meta de sequência', description: 'Transforme objetivo em ritmo semanal.', href: '/progresso/streaks', icon: 'flame', badge: 'Hoje', tone: 'amber' },
  { label: 'Check-in rápido', description: 'Veja progresso e escolha o próximo passo.', href: '/progresso', icon: 'trendingUp', badge: 'Novo', tone: 'rose' },
]

const TIP_CATEGORY_ICONS: Record<TipCategoryId, DSIconName> = {
  all: 'sparkles',
  nutrition: 'apple',
  training: 'dumbbell',
  recovery: 'moon',
  mindset: 'brainCircuit',
}

const TIP_ICON_BY_CATEGORY: Record<Tip['category'], DSIconName> = {
  nutrition: 'apple',
  training: 'dumbbell',
  recovery: 'moon',
  mindset: 'brainCircuit',
}

const shortcutToneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
}

export default function IAHubPage() {
  const router = useRouter()
  const [activeMode, setActiveMode] = useState<AIMode>('goals')
  const [selectedGoal, setSelectedGoal] = useState(GOAL_BLUEPRINTS[0].id)
  const [selectedCategory, setSelectedCategory] = useState<TipCategoryId>('all')
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const action = params.get('action')
    if (action === 'goals') setActiveMode('goals')
  }, [])

  const tipOfTheDay = useMemo(() => getTipOfTheDay(), [])

  const filteredTips = useMemo(() => {
    if (selectedCategory === 'all') return TIPS
    return TIPS.filter((tip) => tip.category === selectedCategory)
  }, [selectedCategory])

  const activeModeCopy = AI_MODES.find((mode) => mode.id === activeMode) ?? AI_MODES[0]
  const selectedGoalCopy = GOAL_BLUEPRINTS.find((goal) => goal.id === selectedGoal) ?? GOAL_BLUEPRINTS[0]

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-linear-to-b from-white via-slate-50 to-white px-4 pt-0 pb-28 text-slate-950">
      <header className="vfit-app-hero-gradient relative -mx-4 -mt-px mb-5 overflow-hidden rounded-b-[34px] px-4 pt-5 pb-6 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/7 to-transparent" />
        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
            <DSIcon name="brainCircuit" size={13} />
            IA VFIT
          </span>
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-200/18 bg-emerald-300/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]" />
            Metas online
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-[1fr_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-300">Command center</p>
            <h1 className="mt-2 text-[38px] font-black leading-none text-white">IA de metas</h1>
            <p className="mt-3 text-[14px] font-medium leading-snug text-slate-300">
              Transforme objetivo em plano, ajuste treino, macros e recuperação sem sair do app.
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-emerald-200/20 bg-linear-to-b from-emerald-200 via-emerald-400 to-green-700 text-emerald-950 shadow-[0_18px_42px_-22px_rgba(16,185,129,0.95),inset_0_1px_0_rgba(255,255,255,0.42)]">
            <DSIcon name="aiBot" size={38} />
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
          <Button type="button" size="sm" onClick={() => router.push('/ia/dieta')} className="min-h-12">
            <DSIcon name="wand" size={16} />
            Criar plano
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => router.push('/progresso/streaks')} className="min-h-12">
            <DSIcon name="target" size={16} />
            Ver meta
          </Button>
        </div>
      </header>

      <section className="mb-5 rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
        <div className="grid grid-cols-4 gap-2">
          {AI_MODES.map((mode) => {
            const active = activeMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  'flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-[20px] border px-2 text-center transition-all active:scale-[0.98]',
                  active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_12px_28px_-24px_rgba(16,185,129,0.65)]'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                )}
              >
                <DSIcon name={mode.icon} size={19} />
                <span className="text-[10px] font-black leading-tight">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
        <div className="bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 text-white">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">{activeModeCopy.label}</p>
              <h2 className="mt-1 text-[20px] font-black">Plano inteligente</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/10 text-emerald-200 ring-1 ring-white/12">
              <DSIcon name={activeModeCopy.icon} size={21} />
            </div>
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-slate-300">{activeModeCopy.description}. A IA organiza a próxima decisão em passos pequenos para hoje.</p>
        </div>

        <div className="p-4">
          <div className="grid gap-3">
            {GOAL_BLUEPRINTS.map((goal) => {
              const selected = goal.id === selectedGoal
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={cn(
                    'flex min-h-20 items-center gap-3 rounded-[22px] border p-3 text-left transition-all active:scale-[0.99]',
                    selected ? 'border-emerald-200 bg-emerald-50/80 shadow-[0_14px_32px_-28px_rgba(16,185,129,0.72)]' : 'border-slate-200 bg-slate-50/80 hover:bg-white'
                  )}
                >
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-linear-to-br ring-1', goal.tone)}>
                    <DSIcon name={goal.icon} size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black text-slate-950">{goal.title}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{goal.description}</p>
                  </div>
                  {selected && <DSIcon name="checkCircle2" size={20} className="text-emerald-600" />}
                </button>
              )
            })}
          </div>

          <div className="mt-4 rounded-[24px] border border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-sky-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <DSIcon name={selectedGoalCopy.icon} size={18} className="text-emerald-700" />
              <p className="text-[13px] font-black text-slate-950">Próximo passo recomendado</p>
            </div>
            <div className="grid gap-2 text-[12px] font-semibold text-slate-600">
              <div className="flex items-center gap-2"><DSIcon name="check" size={14} className="text-emerald-600" />Definir prazo de 4 semanas</div>
              <div className="flex items-center gap-2"><DSIcon name="check" size={14} className="text-emerald-600" />Escolher 3 treinos por semana</div>
              <div className="flex items-center gap-2"><DSIcon name="check" size={14} className="text-emerald-600" />Revisar macros e recuperação</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="mb-2 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Mais opções</p>
          <h2 className="text-[17px] font-black text-slate-950">Ferramentas IA</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AI_SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="group min-h-39 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:border-emerald-200 active:scale-[0.99]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-[16px] ring-1', shortcutToneClasses[shortcut.tone])}>
                  <DSIcon name={shortcut.icon} size={20} />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase text-slate-500">{shortcut.badge}</span>
              </div>
              <p className="text-[13px] font-black leading-tight text-slate-950">{shortcut.label}</p>
              <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-500">{shortcut.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                Abrir <DSIcon name="arrowRight" size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600">Consultas</p>
            <h2 className="text-[17px] font-black text-slate-950">Rotas especializadas</h2>
          </div>
          <DSIcon name="layers" size={20} className="text-sky-600" />
        </div>

        <div className="grid gap-2">
          {IA_CONSULTATION_OPTIONS.map((option) => (
            <Link
              key={option.id}
              href={option.route}
              className="flex min-h-16 items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 px-3 transition-all hover:border-emerald-200 hover:bg-white active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-emerald-700 ring-1 ring-emerald-100">
                <DSIcon name={option.icon} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black text-slate-950">{option.label}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-500">{option.description}</p>
              </div>
              <DSIcon name="chevronRight" size={17} className="text-slate-400" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">Coach diário</p>
          <h2 className="text-[17px] font-black text-slate-950">Dicas acionáveis</h2>
        </div>

        <div className="mb-4 rounded-[30px] border border-amber-100 bg-linear-to-br from-amber-50 via-white to-emerald-50 p-4 shadow-[0_18px_45px_-34px_rgba(180,83,9,0.35)]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <DSIcon name={TIP_ICON_BY_CATEGORY[tipOfTheDay.category]} size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Dica do dia</p>
              <p className="mt-1 text-[14px] font-black text-slate-950">{tipOfTheDay.title}</p>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-600">{tipOfTheDay.content}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {TIP_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-black transition-all',
                selectedCategory === category.id
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500'
              )}
            >
              <DSIcon name={TIP_CATEGORY_ICONS[category.id]} size={14} />
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {filteredTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              expanded={expandedTip === tip.id}
              onToggle={() => setExpandedTip((prev) => (prev === tip.id ? null : tip.id))}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function TipCard({ tip, expanded, onToggle }: { tip: Tip; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full rounded-[22px] border p-3 text-left transition-all active:scale-[0.99]',
        expanded ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white hover:bg-slate-50'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          <DSIcon name={TIP_ICON_BY_CATEGORY[tip.category]} size={18} />
        </div>
        <p className="min-w-0 flex-1 text-[13px] font-black text-slate-950">{tip.title}</p>
        <DSIcon name={expanded ? 'chevronDown' : 'chevronRight'} size={17} className="text-slate-400" />
      </div>
      {expanded && <p className="mt-3 pl-13 text-[12px] font-medium leading-relaxed text-slate-600">{tip.content}</p>}
    </button>
  )
}
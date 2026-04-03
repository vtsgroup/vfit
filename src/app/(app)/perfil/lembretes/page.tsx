/**
 * src/app/(app)/perfil/lembretes/page.tsx
 *
 * Lembretes de treino — dias da semana + horário
 * Persistência via localStorage (futuramente notificações push)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

const STORAGE_KEY = 'vfit_reminders'

const DAYS = [
  { key: 'mon', label: 'S', full: 'Segunda' },
  { key: 'tue', label: 'T', full: 'Terça' },
  { key: 'wed', label: 'Q', full: 'Quarta' },
  { key: 'thu', label: 'Q', full: 'Quinta' },
  { key: 'fri', label: 'S', full: 'Sexta' },
  { key: 'sat', label: 'S', full: 'Sábado' },
  { key: 'sun', label: 'D', full: 'Domingo' },
]

interface ReminderSettings {
  enabled: boolean
  days: string[]
  time: string
}

const DEFAULT: ReminderSettings = {
  enabled: false,
  days: ['mon', 'wed', 'fri'],
  time: '07:00',
}

export default function LembretesPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSettings(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const save = (next: ReminderSettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const toggleDay = (day: string) => {
    hapticLight()
    const days = settings.days.includes(day)
      ? settings.days.filter((d) => d !== day)
      : [...settings.days, day]
    save({ ...settings, days })
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Lembretes de Treino</h1>
          <p className="text-[11px] text-zinc-500">Receba notificações nos seus dias de treino</p>
        </div>
      </div>

      {/* Master toggle */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/4 p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            settings.enabled ? 'bg-white/10' : 'bg-white/5'
          )}>
            <DSIcon
              name="bell"
              size={20}
              className={settings.enabled ? 'text-brand-primary' : 'text-zinc-500'}
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Ativar Lembretes</p>
            <p className="text-[11px] text-zinc-500">
              {settings.enabled ? 'Notificações ativas' : 'Desativado'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            hapticLight()
            save({ ...settings, enabled: !settings.enabled })
          }}
          className={cn(
            'h-7 w-12 rounded-full transition-colors',
            settings.enabled ? 'bg-brand-primary' : 'bg-zinc-700'
          )}
        >
          <div className={cn(
            'h-5 w-5 rounded-full bg-white shadow-md transition-transform mx-1',
            settings.enabled ? 'translate-x-5' : 'translate-x-0'
          )} />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Day selector */}
          <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Dias de treino
          </p>
          <div className="mb-6 grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const active = settings.days.includes(day.key)
              return (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl py-3 transition-all',
                    active
                      ? 'bg-brand-primary/15 ring-1 ring-brand-primary/30'
                      : 'bg-white/4 hover:bg-white/6'
                  )}
                >
                  <span className={cn(
                    'text-sm font-bold',
                    active ? 'text-brand-primary' : 'text-zinc-400'
                  )}>
                    {day.label}
                  </span>
                  <span className="text-[8px] text-zinc-600">{day.full.slice(0, 3)}</span>
                </button>
              )
            })}
          </div>

          {/* Time picker */}
          <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Horário
          </p>
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/4 p-4">
            <DSIcon name="clock" size={20} className="text-zinc-400" />
            <input
              type="time"
              value={settings.time}
              onChange={(e) => save({ ...settings, time: e.target.value })}
              className="flex-1 bg-transparent text-lg font-bold text-white outline-none"
            />
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-white/4 p-4">
            <div className="flex items-start gap-2">
              <DSIcon name="info" size={14} className="mt-0.5 shrink-0 text-zinc-500" />
              <p className="text-xs leading-relaxed text-zinc-500">
                Você receberá uma notificação às{' '}
                <span className="font-bold text-zinc-300">{settings.time}</span>
                {' '}nos dias selecionados lembrando de treinar.
                {settings.days.length === 0 && ' Selecione pelo menos um dia.'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-primary/90 active:scale-[0.98]"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </button>
    </div>
  )
}

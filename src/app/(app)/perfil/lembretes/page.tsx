/**
 * src/app/(app)/perfil/lembretes/page.tsx
 *
 * Lembretes de treino — dias da semana + horário
 * T8.10: Persistência via API de notification preferences + localStorage fallback
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard, ProfileToggle } from '@/components/profile/settings-shell'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-notification-preferences'

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

  const { data: prefsData } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  useEffect(() => {
    if (prefsData?.preferences) {
      const apiEnabled = prefsData.preferences.push_enabled && prefsData.preferences.workout_enabled
      setSettings((prev) => ({ ...prev, enabled: apiEnabled }))
    }
  }, [prefsData])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ReminderSettings
        setSettings((prev) => ({
          ...prev,
          days: parsed.days ?? prev.days,
          time: parsed.time ?? prev.time,
        }))
      }
    } catch { /* ignore */ }
  }, [])

  const save = (next: ReminderSettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const toggleEnabled = () => {
    hapticLight()
    const newEnabled = !settings.enabled
    save({ ...settings, enabled: newEnabled })
    updatePrefs.mutate({
      push_enabled: newEnabled,
      workout_enabled: newEnabled,
    })
  }

  const toggleDay = (day: string) => {
    hapticLight()
    const days = settings.days.includes(day)
      ? settings.days.filter((selectedDay) => selectedDay !== day)
      : [...settings.days, day]
    save({ ...settings, days })
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <ProfileDetailShell
      title="Lembretes de treino"
      subtitle="Escolha dias e horário para o app chamar você de volta para a rotina."
      icon="bell"
      tone="violet"
      meta={<ProfilePill tone={settings.enabled ? 'emerald' : 'slate'}>{settings.enabled ? 'Ativo' : 'Desativado'}</ProfilePill>}
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={toggleEnabled}
          className="flex min-h-22 w-full items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-4 text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)] transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-[17px] ring-1', settings.enabled ? 'bg-violet-600 text-white ring-violet-200' : 'bg-slate-100 text-slate-500 ring-slate-200')}>
              <DSIcon name="bell" size={21} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-950">Ativar lembretes</p>
              <p className="mt-0.5 text-[12px] font-medium text-slate-500">{settings.enabled ? 'Notificações ativas' : 'Nenhum lembrete agendado'}</p>
            </div>
          </div>
          <ProfileToggle enabled={settings.enabled} />
        </button>

        {settings.enabled && (
          <>
            <ProfileCard>
              <p className="mb-3 text-[11px] font-black uppercase text-slate-500">Dias de treino</p>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const active = settings.days.includes(day.key)
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={cn(
                        'min-h-15 rounded-[16px] border py-2 text-center transition-all active:scale-[0.98]',
                        active ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                      )}
                      aria-label={day.full}
                    >
                      <span className="block text-sm font-black">{day.label}</span>
                      <span className="mt-1 block text-[8px] font-bold text-slate-400">{day.full.slice(0, 3)}</span>
                    </button>
                  )
                })}
              </div>
            </ProfileCard>

            <ProfileCard>
              <label className="mb-3 block text-[11px] font-black uppercase text-slate-500" htmlFor="reminder-time">Horário</label>
              <div className="flex items-center gap-3 rounded-card-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <DSIcon name="clock" size={20} className="text-violet-600" />
                <input
                  id="reminder-time"
                  type="time"
                  value={settings.time}
                  onChange={(event) => save({ ...settings, time: event.target.value })}
                  className="min-h-12 flex-1 bg-transparent text-lg font-black text-slate-950 outline-none"
                />
              </div>
            </ProfileCard>

            <ProfileTintCard tone="violet">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-violet-600 ring-1 ring-violet-100">
                  <DSIcon name="info" size={18} />
                </div>
                <p className="text-[12px] font-medium leading-relaxed text-slate-600">
                  Você receberá uma notificação às <span className="font-black text-slate-950">{settings.time}</span> nos dias selecionados.{settings.days.length === 0 && ' Selecione pelo menos um dia.'}
                </p>
              </div>
            </ProfileTintCard>
          </>
        )}

        <ProfileCard>
          <Button onClick={handleSave} className="w-full">
            <DSIcon name="checkCircle" size={16} />
            Salvar lembretes
          </Button>
        </ProfileCard>
      </div>
    </ProfileDetailShell>
  )
}
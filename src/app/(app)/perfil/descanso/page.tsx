/**
 * src/app/(app)/perfil/descanso/page.tsx
 *
 * Tempo de descanso padrão entre séries
 * Slider de 15s a 300s (5min) com presets rápidos
 * Persistência via localStorage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

const STORAGE_KEY = 'vfit_rest_seconds'
const DEFAULT_REST = 60

const PRESETS = [
  { seconds: 30, label: '30s', desc: 'HIIT' },
  { seconds: 60, label: '1 min', desc: 'Padrão' },
  { seconds: 90, label: '1:30', desc: 'Volume' },
  { seconds: 120, label: '2 min', desc: 'Força' },
  { seconds: 180, label: '3 min', desc: 'Máximo' },
]

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) return `${remainingSeconds}s`
  if (remainingSeconds === 0) return `${minutes} min`
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function DescansoPage() {
  const router = useRouter()
  const [rest, setRest] = useState(DEFAULT_REST)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setRest(parseInt(saved, 10) || DEFAULT_REST)
  }, [])

  const handleChange = (value: number) => {
    setRest(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <ProfileDetailShell
      title="Descanso padrão"
      subtitle="Defina o intervalo usado entre séries para manter ritmo e intensidade."
      icon="clock"
      tone="amber"
      meta={<ProfilePill tone="amber">{formatTime(rest)} entre séries</ProfilePill>}
    >
      <div className="space-y-5">
        <ProfileTintCard tone="amber" className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-card-lg bg-slate-950 text-amber-300">
            <DSIcon name="clock" size={25} />
          </div>
          <span className="block text-[48px] font-black leading-none text-slate-950">{formatTime(rest)}</span>
          <span className="mt-2 block text-[12px] font-bold text-slate-500">descanso entre séries</span>
        </ProfileTintCard>

        <ProfileCard>
          <input
            type="range"
            min={15}
            max={300}
            step={5}
            value={rest}
            onChange={(event) => {
              hapticLight()
              handleChange(parseInt(event.target.value, 10))
            }}
            className="w-full accent-brand-primary"
          />
          <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
            <span>15s</span>
            <span>5 min</span>
          </div>
        </ProfileCard>

        <div>
          <p className="mb-2 px-1 text-[11px] font-black uppercase text-slate-500">Presets rápidos</p>
          <div className="grid grid-cols-5 gap-2">
            {PRESETS.map((preset) => {
              const active = rest === preset.seconds
              return (
                <button
                  key={preset.seconds}
                  type="button"
                  onClick={() => {
                    hapticLight()
                    handleChange(preset.seconds)
                  }}
                  className={cn(
                    'min-h-18 rounded-[18px] border px-1 py-3 text-center transition-all active:scale-[0.98]',
                    active ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className="block text-[13px] font-black">{preset.label}</span>
                  <span className="mt-1 block text-[9px] font-bold text-slate-400">{preset.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <ProfileCard>
          <Button onClick={handleSave} className="w-full">
            <DSIcon name="checkCircle" size={16} />
            Salvar descanso
          </Button>
        </ProfileCard>
      </div>
    </ProfileDetailShell>
  )
}
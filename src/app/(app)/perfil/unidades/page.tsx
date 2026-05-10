/**
 * src/app/(app)/perfil/unidades/page.tsx
 *
 * Unidades de medida — Métrico (kg/cm) ou Imperial (lb/in)
 * Persistência via localStorage (sem API por enquanto)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { ProfileCard, ProfileDetailShell, ProfilePill, ProfileTintCard } from '@/components/profile/settings-shell'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

type UnitSystem = 'metric' | 'imperial'

const UNIT_OPTIONS: { key: UnitSystem; label: string; desc: string; examples: string }[] = [
  { key: 'metric', label: 'Métrico', desc: 'Sistema Internacional', examples: 'kg, cm, km' },
  { key: 'imperial', label: 'Imperial', desc: 'Sistema Anglo-Saxão', examples: 'lb, in, mi' },
]

const STORAGE_KEY = 'vfit_unit_system'

export default function UnidadesPage() {
  const router = useRouter()
  const [system, setSystem] = useState<UnitSystem>('metric')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'imperial') setSystem('imperial')
  }, [])

  const handleSelect = (nextSystem: UnitSystem) => {
    hapticLight()
    setSystem(nextSystem)
    localStorage.setItem(STORAGE_KEY, nextSystem)
  }

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <ProfileDetailShell
      title="Unidades de medida"
      subtitle="Escolha como peso, altura e distância aparecem durante o treino."
      icon="ruler"
      tone="sky"
      meta={<ProfilePill tone="sky">{system === 'metric' ? 'kg e cm' : 'lb e in'}</ProfilePill>}
    >
      <div className="space-y-5">
        <div className="grid gap-3">
          {UNIT_OPTIONS.map((option) => {
            const active = system === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={cn(
                  'flex min-h-24 w-full items-center gap-4 rounded-[28px] border p-4 text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)] transition-all duration-200 active:scale-[0.99]',
                  active ? 'border-sky-200 bg-linear-to-br from-sky-50 via-white to-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] ring-1', active ? 'bg-sky-600 text-white ring-sky-200' : 'bg-slate-100 text-slate-500 ring-slate-200')}>
                  <DSIcon name="ruler" size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-black text-slate-950">{option.label}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-slate-500">{option.desc}</p>
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{option.examples}</p>
                </div>
                {active && <DSIcon name="checkCircle" size={21} className="text-sky-600" />}
              </button>
            )
          })}
        </div>

        <ProfileTintCard tone="sky">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-sky-600 ring-1 ring-sky-100">
              <DSIcon name="info" size={18} />
            </div>
            <p className="text-[12px] font-medium leading-relaxed text-slate-600">
              Seus dados seguem armazenados em formato métrico. Esta preferência muda apenas a forma de exibição no app.
            </p>
          </div>
        </ProfileTintCard>

        <ProfileCard>
          <Button onClick={handleSave} className="w-full">
            <DSIcon name="checkCircle" size={16} />
            Salvar preferência
          </Button>
        </ProfileCard>
      </div>
    </ProfileDetailShell>
  )
}
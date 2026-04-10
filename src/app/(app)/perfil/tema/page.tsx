/**
 * src/app/(app)/perfil/tema/page.tsx
 *
 * Tema — Claro, Escuro, ou Automático (sistema por padrão)
 * Persistência via localStorage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'
import { useAppStore } from '@/stores/app-store'

type ThemeMode = 'dark' | 'light' | 'auto'

const THEME_OPTIONS: { key: ThemeMode; label: string; desc: string; icon: DSIconName }[] = [
  {
    key: 'dark',
    label: 'Escuro',
    desc: 'Ótimo para AMOLED e baixa luminosidade',
    icon: 'moon',
  },
  {
    key: 'light',
    label: 'Claro',
    desc: 'Fundo branco (em breve)',
    icon: 'sun',
  },
  {
    key: 'auto',
    label: 'Automático',
    desc: 'Padrão recomendado — segue o sistema operacional',
    icon: 'settings',
  },
]

export default function TemaPage() {
  const router = useRouter()
  const appTheme = useAppStore((s) => s.theme)
  const setAppTheme = useAppStore((s) => s.setTheme)
  const [theme, setTheme] = useState<ThemeMode>('auto')

  useEffect(() => {
    setTheme(appTheme === 'system' ? 'auto' : appTheme)
  }, [appTheme])

  const handleSelect = (t: ThemeMode) => {
    hapticLight()
    setTheme(t)
    setAppTheme(t === 'auto' ? 'system' : t)
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
          <h1 className="text-lg font-bold text-white">Tema</h1>
          <p className="text-[11px] text-zinc-500">Aparência do app</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleSelect(opt.key)}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all',
              theme === opt.key
                ? 'bg-brand-primary/12 ring-1 ring-brand-primary/30'
                : 'bg-white/4 hover:bg-white/6',
              opt.key === 'light' && 'opacity-50'
            )}
          >
            <div className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl',
              theme === opt.key ? 'bg-brand-primary/20' : 'bg-white/5'
            )}>
              <DSIcon
                name={opt.icon}
                size={22}
                className={theme === opt.key ? 'text-brand-primary' : 'text-zinc-400'}
              />
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-bold',
                theme === opt.key ? 'text-brand-primary' : 'text-white'
              )}>
                {opt.label}
              </p>
              <p className="text-[11px] text-zinc-500">{opt.desc}</p>
            </div>
            {theme === opt.key && (
              <DSIcon name="checkCircle" size={20} className="text-brand-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-6 rounded-2xl bg-white/4 p-4">
        <div className="flex items-start gap-2">
          <DSIcon name="info" size={14} className="mt-0.5 shrink-0 text-zinc-500" />
          <p className="text-xs leading-relaxed text-zinc-500">
            O tema Claro está em desenvolvimento. Por enquanto, o modo Escuro
            é o padrão para a melhor experiência visual.
          </p>
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        className="mt-6 w-full"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </Button>
    </div>
  )
}

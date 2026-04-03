/**
 * src/app/(app)/perfil/notificacoes/page.tsx
 *
 * Configurações de notificações — push, email, in-app
 * Persistência via localStorage
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { hapticLight, hapticSuccess } from '@/lib/haptics'

const STORAGE_KEY = 'vfit_notification_prefs'

interface NotificationPrefs {
  push_workouts: boolean
  push_progress: boolean
  push_social: boolean
  push_tips: boolean
  email_weekly: boolean
  email_promotions: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  push_workouts: true,
  push_progress: true,
  push_social: true,
  push_tips: false,
  email_weekly: true,
  email_promotions: false,
}

interface ToggleRowProps {
  icon: DSIconName
  label: string
  desc: string
  checked: boolean
  onChange: () => void
}

function ToggleRow({ icon, label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <DSIcon name={icon} size={18} className="text-zinc-400" />
        <div>
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          <p className="text-[11px] text-zinc-600">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => {
          hapticLight()
          onChange()
        }}
        className={cn(
          'h-7 w-12 rounded-full transition-colors',
          checked ? 'bg-brand-primary' : 'bg-zinc-700'
        )}
      >
        <div className={cn(
          'h-5 w-5 rounded-full bg-white shadow-md transition-transform mx-1',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

export default function NotificacoesPage() {
  const router = useRouter()
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) })
    } catch { /* ignore */ }
  }, [])

  const update = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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
          <h1 className="text-lg font-bold text-white">Notificações</h1>
          <p className="text-[11px] text-zinc-500">Controle o que você recebe</p>
        </div>
      </div>

      {/* Push notifications */}
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
        Push Notifications
      </p>
      <div className="mb-5 divide-y divide-white/5 rounded-2xl bg-white/4 px-4">
        <ToggleRow
          icon="dumbbell"
          label="Treinos"
          desc="Lembretes e atualizações de treino"
          checked={prefs.push_workouts}
          onChange={() => update('push_workouts')}
        />
        <ToggleRow
          icon="trendingUp"
          label="Progresso"
          desc="Marcos e conquistas alcançadas"
          checked={prefs.push_progress}
          onChange={() => update('push_progress')}
        />
        <ToggleRow
          icon="users"
          label="Social"
          desc="Curtidas, comentários e seguidores"
          checked={prefs.push_social}
          onChange={() => update('push_social')}
        />
        <ToggleRow
          icon="sparkles"
          label="Dicas & IA"
          desc="Sugestões e insights personalizados"
          checked={prefs.push_tips}
          onChange={() => update('push_tips')}
        />
      </div>

      {/* Email */}
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
        E-mail
      </p>
      <div className="mb-5 divide-y divide-white/5 rounded-2xl bg-white/4 px-4">
        <ToggleRow
          icon="mail"
          label="Resumo Semanal"
          desc="Relatório de progresso toda segunda"
          checked={prefs.email_weekly}
          onChange={() => update('email_weekly')}
        />
        <ToggleRow
          icon="tag"
          label="Promoções"
          desc="Ofertas e novidades do VFIT"
          checked={prefs.email_promotions}
          onChange={() => update('email_promotions')}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-primary/90 active:scale-[0.98]"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </button>
    </div>
  )
}

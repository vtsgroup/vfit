/**
 * src/app/(app)/perfil/editar/page.tsx
 *
 * Editar perfil — nome, email, foto, dados básicos
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api-client'
import { hapticSuccess } from '@/lib/haptics'

export default function EditarPerfilPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const handleSave = useCallback(async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await api.patch<{ user: typeof user }>('/users/me', {
        full_name: name.trim(),
        phone: phone.trim() || null,
      })
      if (res.data?.user && setUser) {
        setUser(res.data.user)
      }
      hapticSuccess()
      router.back()
    } catch {
      // TODO: toast error
    } finally {
      setSaving(false)
    }
  }, [name, phone, setUser, router])

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Editar perfil</h1>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/8 text-brand-primary">
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={96}
              height={96}
              className="h-full w-full rounded-3xl object-cover"
            />
          ) : (
            <DSIcon name="user" size={40} />
          )}
          <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white">
            <DSIcon name="camera" size={14} />
          </div>
        </div>
        <p className="text-[11px] text-zinc-600">Toque para alterar foto</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <FieldInput label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" />
        <FieldInput label="Email" value={user?.email || ''} disabled />
        <FieldInput label="Telefone" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" />
      </div>

      {/* Save */}
      <div className="mt-8">
        <Button loading={saving} onClick={handleSave} className="w-full">
          Salvar alterações
        </Button>
      </div>
    </div>
  )
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-zinc-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-brand-primary/50 disabled:opacity-50"
      />
    </div>
  )
}

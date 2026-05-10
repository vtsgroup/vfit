/**
 * src/app/(app)/perfil/editar/page.tsx
 *
 * Editar perfil — nome, email, foto (com crop/zoom), dados básicos
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { PhotoUpload } from '@/components/profile/photo-upload'
import { ProfileCard, ProfileDetailShell, ProfilePill } from '@/components/profile/settings-shell'
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
    <ProfileDetailShell
      title="Editar perfil"
      subtitle="Atualize sua foto, nome e dados básicos da conta."
      icon="userCog"
      tone="emerald"
      meta={<ProfilePill tone="emerald">Perfil público</ProfilePill>}
    >
      <div className="space-y-5">
        <ProfileCard>
          <PhotoUpload />
        </ProfileCard>

        <ProfileCard className="space-y-4">
          <FieldInput label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" />
          <FieldInput label="Email" value={user?.email || ''} disabled />
          <FieldInput label="Telefone" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" />
        </ProfileCard>

        <ProfileCard>
          <Button loading={saving} onClick={handleSave} className="w-full">
            <DSIcon name="checkCircle" size={16} />
            Salvar alterações
          </Button>
        </ProfileCard>
      </div>
    </ProfileDetailShell>
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
      <label className="mb-1.5 block text-[12px] font-black text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-13 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-semibold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  )
}
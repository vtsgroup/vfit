/**
 * src/app/dashboard/complete-profile/page.tsx
 *
 * Complete Profile — Tela pós-cadastro OAuth
 *
 * Exports: CompleteProfilePage
 * Hooks: useState, useRouter, useAuthStore, useMutation
 * Features: Auth: useAuthStore · 'use client' · React Query · DSIcon
 */

// ============================================
// Complete Profile — Tela pós-cadastro OAuth
// Preencher dados obrigatórios: CREF, telefone, especialidades
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PhotoUpload } from '@/components/profile/photo-upload'
import { Card, CardContent } from '@/components/ui/card'
import { MD3Input } from '@/components/ui/md3-input'
import { StyledSelect } from '@/components/ui/styled-select'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

const SPECIALTIES_OPTIONS = [
  'Musculação',
  'Funcional',
  'Crossfit',
  'Pilates',
  'Yoga',
  'Natação',
  'Corrida',
  'Ciclismo',
  'Artes Marciais',
  'Emagrecimento',
  'Hipertrofia',
  'Reabilitação',
  'Idosos',
  'Gestantes',
  'Atletas',
  'Online',
]

const CREF_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

type Step = 'photo' | 'info' | 'specialties' | 'done'

export default function CompleteProfilePage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const setPersonalProfile = useAuthStore((s) => s.setPersonalProfile)

  const [step, setStep] = useState<Step>('photo')
  const [phone, setPhone] = useState(user?.phone || '')
  const [cref, setCref] = useState('')
  const [crefState, setCrefState] = useState('SP')
  const [specialties, setSpecialties] = useState<string[]>([])

  const updateProfile = useMutation({
    mutationFn: async () => {
      // 1. Update user base (phone)
      if (phone.trim()) {
        await api.patch('/users/me', { phone: phone.trim() })
        updateUser({ phone: phone.trim() })
      }

      // 2. Update personal profile (CREF + specialties)
      const personalData: Record<string, unknown> = {}
      if (cref.trim()) {
        personalData.cref = cref.trim()
        personalData.cref_state = crefState
      }
      if (specialties.length > 0) {
        personalData.specialties = specialties
      }

      if (Object.keys(personalData).length > 0) {
        const res = await api.patch<{ personal: Record<string, unknown> }>(
          '/personals/profile',
          personalData
        )
        if (res.data?.personal) {
          setPersonalProfile({
            slug: (res.data.personal.public_url_slug as string) || '',
            cref: (res.data.personal.cref as string) || null,
            specialties: (res.data.personal.specialties as string[]) || [],
            plan_type: ((res.data.personal.subscription_plan as 'trial' | 'pro' | 'max') || 'trial'),
            plan_expires_at: (res.data.personal.trial_ends_at as string) || null,
            total_students: (res.data.personal.total_students as number) || 0,
            average_rating: 0,
          })
        }
      }
    },
    onSuccess: () => {
      setStep('done')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao salvar perfil')
    },
  })

  const handleNext = () => {
    if (step === 'photo') {
      setStep('info')
    } else if (step === 'info') {
      setStep('specialties')
    } else if (step === 'specialties') {
      updateProfile.mutate()
    }
  }

  const handleSkip = () => {
    if (step === 'photo') setStep('info')
    else if (step === 'info') setStep('specialties')
    else if (step === 'specialties') {
      updateProfile.mutate()
    }
  }

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'photo', label: 'Foto' },
    { key: 'info', label: 'Dados' },
    { key: 'specialties', label: 'Especialidades' },
    { key: 'done', label: 'Pronto' },
  ]

  const currentIndex = steps.findIndex((s) => s.key === step)

  return (
    <AuthGuard>
      <div className="flex min-h-[calc(100dvh-4rem-var(--demo-banner-offset,0px))] items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10">
              <DSIcon name="sparkles" size={28} className="text-brand-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              {step === 'done' ? 'Tudo pronto!' : 'Complete seu perfil'}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {step === 'done'
                ? 'Seu perfil está configurado. Vamos começar!'
                : 'Precisamos de algumas informações para personalizar sua experiência.'}
            </p>
          </div>

          {/* Progress dots */}
          {step !== 'done' && (
            <div className="flex items-center justify-center gap-2">
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === currentIndex
                      ? 'w-8 bg-brand-primary'
                      : i < currentIndex
                        ? 'w-2 bg-brand-primary/50'
                        : 'w-2 bg-border-light'
                  )}
                />
              ))}
            </div>
          )}

          {/* Step content */}
          <Card className="border-border-light">
            <CardContent className="p-6">
              {/* Step 1: Photo */}
              {step === 'photo' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Sua foto de perfil
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      Ajuda seus alunos a reconhecerem você
                    </p>
                  </div>
                  <PhotoUpload />
                </div>
              )}

              {/* Step 2: Info */}
              {step === 'info' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Informações profissionais
                    </h2>
                  </div>

                  <MD3Input
                    label="Telefone / WhatsApp"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    leadingIcon={<DSIcon name="phone" size={16} />}
                  />

                  <div>
                    <div className="flex gap-2">
                      <MD3Input
                        label="CREF"
                        value={cref}
                        onChange={(e) => setCref(e.target.value)}
                        placeholder="123456-G/SP"
                        leadingIcon={<DSIcon name="award" size={16} />}
                        className="flex-1"
                      />
                      <StyledSelect
                        value={crefState}
                        onChange={setCrefState}
                        options={CREF_STATES.map((s) => ({ value: s, label: s }))}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Opcional — você pode preencher depois
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Specialties */}
              {step === 'specialties' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Suas especialidades
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      Selecione as áreas em que você atua
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        className={cn(
                          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                          specialties.includes(s)
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-border-light bg-bg-primary text-text-muted hover:border-brand-primary/30 hover:text-text-primary'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {specialties.length > 0 && (
                    <p className="text-center text-xs text-brand-primary">
                      {specialties.length} selecionada{specialties.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Done */}
              {step === 'done' && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
                    <DSIcon name="checkCircle" size={40} className="text-brand-primary" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Avatar
                      src={user?.avatar_url}
                      name={user?.full_name || 'U'}
                      size="lg"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-text-primary">{user?.full_name}</p>
                      <p className="text-sm text-text-muted">{user?.email}</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => router.replace('/dashboard')}
                    className="w-full"
                  >
                    Ir para o Dashboard <DSIcon name="chevronRight" size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          {step !== 'done' && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                {step === 'specialties' ? 'Pular e finalizar' : 'Pular'}
              </Button>
              <Button
                onClick={handleNext}
                loading={updateProfile.isPending}
              >
                {step === 'specialties' ? 'Finalizar' : 'Próximo'}
                <DSIcon name="chevronRight" size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

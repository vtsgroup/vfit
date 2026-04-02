/**
 * src/app/dashboard/students/invite/page.tsx
 *
 * Invite Student Page — /dashboard/students/invite
 *
 * Exports: InviteStudentPage
 * Hooks: useEffect, useMemo, useRef, useState, useSearchParams, useAffiliateLink
 * Features: 'use client' · DSIcon
 */

// ============================================
// Invite Student Page — /dashboard/students/invite
// ============================================

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import QRCodeLib from 'qrcode'
import { useAffiliateLink } from '@/hooks/use-affiliates'
import {
  useInviteStudent,
  useManualCreateStudent,
  useQuickInviteStudent,
  type InviteStudentInput,
  type ManualCreateStudentResultData,
  type QuickInviteResultData,
} from '@/hooks/use-students'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StyledSelect } from '@/components/ui/styled-select'
import { cn } from '@/lib/utils'
import { useCpfLookup } from '@/hooks/use-cpf-lookup'

interface InviteResultData {
  invitation_token: string
  invitation_url: string
  email: string
  full_name: string
  personal_name: string
  email_sent: boolean
  message: string
}

const billingCycleLabels: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMIANNUALLY: 'Semestral',
  YEARLY: 'Anual',
}

export default function InviteStudentPage() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'manual' ? 'manual' : 'qr'

  const [mode, setMode] = useState<'qr' | 'email' | 'manual'>(initialMode)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [manualCpf, setManualCpf] = useState('')
  const [manualDob, setManualDob] = useState('')
  const [manualGender, setManualGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('female')
  const [manualPhone, setManualPhone] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualResult, setManualResult] = useState<ManualCreateStudentResultData | null>(null)
  const [studentType, setStudentType] = useState<'personal_training' | 'consultoria'>('personal_training')
  const [consultationPrice, setConsultationPrice] = useState('')
  const [consultationCycle, setConsultationCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'>('MONTHLY')
  const [consultationNotes, setConsultationNotes] = useState('')
  const [inviteResult, setInviteResult] = useState<InviteResultData | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const [quickResult, setQuickResult] = useState<QuickInviteResultData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [affiliateQrDataUrl, setAffiliateQrDataUrl] = useState<string>('')
  const initQrRef = useRef(false)

  const invite = useInviteStudent()
  const quickInvite = useQuickInviteStudent()
  const manualCreate = useManualCreateStudent()
  const affiliateLink = useAffiliateLink()
  const cpfLookup = useCpfLookup()
  const [cpfLookupName, setCpfLookupName] = useState('')
  const [cpfLookupDone, setCpfLookupDone] = useState(false)

  const manualAge = useMemo(() => {
    if (!manualDob) return null
    const birth = new Date(`${manualDob}T00:00:00`)
    if (Number.isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }, [manualDob])

  // CPF mask helper
  function maskCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    let m = digits
    if (digits.length > 3) m = digits.slice(0, 3) + '.' + digits.slice(3)
    if (digits.length > 6) m = m.slice(0, 7) + '.' + digits.slice(6)
    if (digits.length > 9) m = m.slice(0, 11) + '-' + digits.slice(9)
    return m
  }

  // Auto-lookup CPF when CPF has 11 digits (birth_date comes from API)
  useEffect(() => {
    setCpfLookupName('')
    setCpfLookupDone(false)

    const cpfDigits = manualCpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) return

    cpfLookup.mutate(
      { cpf: cpfDigits },
      {
        onSuccess: (data) => {
          setCpfLookupDone(true)
          if (data?.full_name) {
            setCpfLookupName(data.full_name)
            if (!fullName.trim()) setFullName(data.full_name)
          }
          // Auto-fill birth date from Receita Federal
          if (data?.birth_date && !manualDob) {
            // API returns DD/MM/YYYY → convert to YYYY-MM-DD for date input
            const parts = data.birth_date.split('/')
            if (parts.length === 3) {
              setManualDob(`${parts[2]}-${parts[1]}-${parts[0]}`)
            }
          }
        },
        onError: () => {
          setCpfLookupDone(true)
        },
      },
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualCpf])

  const inviteLink = inviteResult
    ? inviteResult.invitation_url || `https://iapersonal.app.br/register/student?token=${inviteResult.invitation_token}`
    : ''

  const quickLink = quickResult
    ? quickResult.invitation_url || `https://iapersonal.app.br/register/student?token=${quickResult.invitation_token}`
    : ''

  const effectiveLink = mode === 'qr' ? quickLink : inviteLink

  // QR-first: ao abrir a página, já gerar convite rápido e mostrar o QR
  useEffect(() => {
    if (mode !== 'qr') return
    if (initQrRef.current) return
    initQrRef.current = true

    quickInvite.mutate(undefined, {
      onSuccess: (res) => {
        setQuickResult(res.data)
      },
    })
  }, [mode, quickInvite])

  // Gerar QR do link efetivo
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!effectiveLink) {
        setQrDataUrl('')
        return
      }
      try {
        const dataUrl = await QRCodeLib.toDataURL(effectiveLink, {
          margin: 1,
          width: 340,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setQrDataUrl(dataUrl)
      } catch {
        if (!cancelled) setQrDataUrl('')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [effectiveLink])

  // QR para cadastro de personal com referral (afiliado)
  useEffect(() => {
    let cancelled = false
    async function run() {
      const link = affiliateLink.data?.referral_link
      if (!link) {
        setAffiliateQrDataUrl('')
        return
      }
      try {
        const dataUrl = await QRCodeLib.toDataURL(link, {
          margin: 1,
          width: 340,
          color: { dark: '#0a0f0a', light: '#ffffff' },
        })
        if (!cancelled) setAffiliateQrDataUrl(dataUrl)
      } catch {
        if (!cancelled) setAffiliateQrDataUrl('')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [affiliateLink.data?.referral_link])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !fullName) return

    const data: InviteStudentInput = {
      email: email.trim(),
      full_name: fullName.trim(),
      student_type: studentType,
    }

    if (studentType === 'consultoria') {
      data.consultation_price = Number(consultationPrice) || undefined
      data.consultation_billing_cycle = consultationCycle
      if (consultationNotes.trim()) data.consultation_notes = consultationNotes.trim()
    }

    invite.mutate(data, {
      onSuccess: (res) => {
        const result = res as unknown as { data: InviteResultData }
        setInviteResult(result.data)
        setMode('email')
      },
    })
  }

  function handleGenerateNewQr() {
    setQuickResult(null)
    setQrDataUrl('')
    initQrRef.current = true
    quickInvite.mutate(undefined, {
      onSuccess: (res) => setQuickResult(res.data),
    })
  }

  function handleManualCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    manualCreate.mutate(
      {
        full_name: fullName.trim(),
        cpf: manualCpf.trim(),
        date_of_birth: manualDob,
        gender: manualGender,
        phone: manualPhone.trim(),
        email: manualEmail.trim(),
      },
      {
        onSuccess: (res) => {
          setManualResult(res.data)
        },
      }
    )
  }

  function handleQuickEmailInvite() {
    const e = email.trim()
    if (!e) return

    quickInvite.mutate(
      {
        email: e,
        full_name: fullName.trim() || undefined,
        student_type: studentType,
        consultation_price: studentType === 'consultoria' ? Number(consultationPrice) || undefined : undefined,
        consultation_billing_cycle: studentType === 'consultoria' ? consultationCycle : undefined,
        consultation_notes: studentType === 'consultoria' ? (consultationNotes.trim() || undefined) : undefined,
      },
      {
        onSuccess: (res) => {
          setQuickResult(res.data)
          setMode('qr')
        },
      }
    )
  }

  function copyInviteLink() {
    if (!effectiveLink) return
    navigator.clipboard.writeText(effectiveLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  function shareWhatsApp() {
    if (!effectiveLink) return
    const typeLabel = studentType === 'consultoria' ? 'consultoria fitness' : 'treinos'
    const name = inviteResult?.full_name || fullName.trim() || '👋'
    const text = `Olá ${name}! 👋\n\nVocê foi convidado para acompanhar seus ${typeLabel} no VFIT.\n\nClique no link abaixo para criar sua conta:\n${effectiveLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  async function nativeShare() {
    if (!effectiveLink || !navigator.share) return
    try {
      await navigator.share({
        title: 'Convite VFIT',
        text: 'Você foi convidado para o VFIT!',
        url: effectiveLink,
      })
    } catch {
      // user cancelled share
    }
  }

  function handleNewInvite() {
    setEmail('')
    setFullName('')
    setStudentType('personal_training')
    setConsultationPrice('')
    setConsultationCycle('MONTHLY')
    setConsultationNotes('')
    setInviteResult(null)
    setQuickResult(null)
    setQrDataUrl('')
    setCopiedLink(false)
    setMode('qr')
    setManualCpf('')
    setManualDob('')
    setManualGender('female')
    setManualPhone('')
    setManualEmail('')
    setManualResult(null)
    setCpfLookupName('')
    setCpfLookupDone(false)
    initQrRef.current = false
  }

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6">
        {/* Back */}
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <DSIcon name="arrowLeft" size={16} />
          Voltar para alunos
        </Link>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
              {mode === 'qr' ? (
                <DSIcon name="qrcode" size={24} className="text-brand-primary" />
              ) : inviteResult ? (
                <DSIcon name="checkCircle2" size={24} className="text-success" />
              ) : (
                <DSIcon name="userPlus" size={24} className="text-brand-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              {mode === 'qr' ? 'QR de Cadastro (ao vivo)' : inviteResult ? 'Convite Criado!' : 'Convidar Aluno'}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {mode === 'qr'
                ? 'Peça para o aluno escanear e concluir o cadastro na hora.'
                : inviteResult
                  ? 'Compartilhe o link com seu aluno para ele se cadastrar'
                  : 'Convide para personal training ou consultoria fitness'}
            </p>
          </div>

          {/* Mode switch */}
          <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant={mode === 'qr' ? 'primary' : 'outline'}
              onClick={() => setMode('qr')}
              className="gap-2"
            >
              <DSIcon name="qrcode" size={16} /> QR ao vivo
            </Button>
            <Button
              type="button"
              variant={mode === 'email' ? 'primary' : 'outline'}
              onClick={() => setMode('email')}
              className="gap-2"
            >
              <DSIcon name="mail" size={16} /> Email/Link
            </Button>
            <Button
              type="button"
              variant={mode === 'manual' ? 'primary' : 'outline'}
              onClick={() => setMode('manual')}
              className="gap-2"
            >
              <DSIcon name="userPlus" size={16} /> Novo Aluno
            </Button>
          </div>

          {mode === 'manual' ? (
            manualResult ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                  <div className="flex items-center gap-2 font-medium">
                    <DSIcon name="checkCircle2" size={16} />
                    Aluno criado e vinculado ao seu perfil
                  </div>
                  <p className="mt-1 text-xs text-success/80">
                    Email: {manualResult.email_sent ? 'enviado' : 'não enviado'} · WhatsApp: {manualResult.whatsapp_sent ? 'enviado' : 'não encontrado no gateway'}
                  </p>
                </div>

                <div className="rounded-xl border border-border-light bg-bg-primary px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">{manualResult.full_name}</p>
                  <p className="text-xs text-text-muted">{manualResult.email} · {manualResult.phone}</p>
                  <p className="mt-1 text-xs text-text-muted">CPF: {manualResult.cpf}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <DSIcon name="link" size={14} />
                    Link de acesso do aluno
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-xs text-text-muted break-all font-mono select-all">
                      {manualResult.invitation_url}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(manualResult.invitation_url)
                        setCopiedLink(true)
                        setTimeout(() => setCopiedLink(false), 3000)
                      }}
                      className="shrink-0"
                    >
                      {copiedLink ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border-light">
                  <Button variant="outline" className="flex-1" onClick={handleNewInvite}>Cadastrar outro</Button>
                  <Link href="/dashboard/students" className="flex-1">
                    <Button className="w-full">Ver alunos</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualCreateSubmit} className="space-y-4">
                <Input
                  label="Nome completo"
                  placeholder="Nome e sobrenome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  hint={cpfLookupName && fullName === cpfLookupName ? '✅ Preenchido via Receita Federal' : undefined}
                  required
                />

                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={maskCpf(manualCpf)}
                  onChange={(e) => setManualCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  hint={cpfLookup.isPending ? '🔍 Consultando CPF...' : cpfLookupName ? `✅ ${cpfLookupName}` : cpfLookupDone ? '⚠️ Nome não encontrado — preencha manualmente' : undefined}
                  required
                />

                <Input
                  label="Data de nascimento"
                  type="date"
                  value={manualDob}
                  onChange={(e) => setManualDob(e.target.value)}
                  hint={manualAge !== null ? `Idade calculada: ${manualAge} anos` : 'A idade é calculada automaticamente'}
                  required
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Sexo</label>
                  <StyledSelect
                    value={manualGender}
                    onChange={(v) => setManualGender(v as typeof manualGender)}
                    options={[
                      { value: 'female', label: 'Feminino' },
                      { value: 'male', label: 'Masculino' },
                      { value: 'other', label: 'Outro' },
                      { value: 'prefer_not_to_say', label: 'Prefiro não informar' },
                    ]}
                  />
                </div>

                <Input
                  label="Telefone (WhatsApp)"
                  placeholder="(21) 9 9999-9999"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  required
                />

                <Input
                  label="E-mail"
                  type="email"
                  placeholder="aluno@email.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                />

                <div className="rounded-xl border border-info/20 bg-info/10 px-4 py-3 text-xs text-info">
                  Após finalizar, o aluno será criado, vinculado ao personal e o sistema tentará envio por email, WhatsApp e notificações internas.
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={manualCreate.isPending}
                  disabled={!fullName.trim() || !manualCpf.trim() || !manualDob || !manualPhone.trim() || !manualEmail.trim()}
                >
                  <DSIcon name="send" size={16} />
                  Finalizar cadastro aluno
                </Button>
              </form>
            )
          ) : mode === 'qr' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-light bg-bg-primary p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">QR Code do aluno</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateNewQr}
                    className="gap-2"
                    disabled={quickInvite.isPending}
                  >
                    <DSIcon name="refresh" size={16} />
                    Novo QR
                  </Button>
                </div>

                {quickResult?.message && (
                  <p className="mt-1 text-xs text-text-muted">{quickResult.message}</p>
                )}

                <div className="mt-4 flex flex-col items-center gap-3">
                  {qrDataUrl ? (
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <Image
                        src={qrDataUrl}
                        alt="QR Code de convite"
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-border-light bg-bg-secondary px-4 py-10 text-center text-sm text-text-muted">
                      Gerando QR…
                    </div>
                  )}

                  {/* Link fallback */}
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      <DSIcon name="link" size={14} />
                      Link (fallback)
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl border border-border-light bg-bg-secondary px-3 py-2.5 text-xs text-text-muted break-all font-mono select-all">
                        {effectiveLink || '—'}
                      </div>
                      <Button variant="outline" size="sm" onClick={copyInviteLink} className="shrink-0">
                        {copiedLink ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
                        <DSIcon name="messageCircle" size={16} className="text-green-500" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" onClick={copyInviteLink} className="gap-2">
                        <DSIcon name="copy" size={16} />
                        {copiedLink ? 'Copiado!' : 'Copiar'}
                      </Button>
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <Button variant="outline" onClick={nativeShare} className="col-span-2 gap-2">
                          <DSIcon name="share" size={16} />
                          Mais opções
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opcional: mandar por email se QR não rolar */}
              <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
                <p className="text-sm font-semibold text-text-primary">Se a pessoa não conseguir escanear</p>
                <p className="mt-1 text-xs text-text-muted">Preencha email (e nome opcional) e envie o convite.</p>

                <div className="mt-3 grid gap-3">
                  <Input
                    label="Email (opcional)"
                    type="email"
                    placeholder="aluno@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label="Nome (opcional)"
                    placeholder="Nome do aluno"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleQuickEmailInvite}
                    className="gap-2"
                    disabled={!email.trim() || quickInvite.isPending}
                  >
                    <DSIcon name="send" size={16} /> Enviar convite
                  </Button>
                </div>
              </div>

              {/* QR para indicar cadastro de personal (afiliado) */}
              {affiliateLink.data?.referral_link && (
                <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
                  <div className="flex items-center gap-2">
                    <DSIcon name="users" size={16} className="text-brand-primary" />
                    <p className="text-sm font-semibold text-text-primary">QR para cadastrar outro Personal (indicação)</p>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Abre o cadastro de personal já vinculado ao seu código de afiliado.
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-3">
                    {affiliateQrDataUrl ? (
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <Image
                          src={affiliateQrDataUrl}
                          alt="QR Code de indicação"
                          width={300}
                          height={300}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full rounded-2xl border border-border-light bg-bg-primary px-4 py-10 text-center text-sm text-text-muted">
                        Gerando QR…
                      </div>
                    )}

                    <div className="w-full space-y-2">
                      <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                        <DSIcon name="link" size={14} />
                        Link de indicação
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-xs text-text-muted break-all font-mono select-all">
                          {affiliateLink.data.referral_link}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void navigator.clipboard.writeText(affiliateLink.data!.referral_link)}
                          className="shrink-0"
                        >
                          <DSIcon name="copy" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : inviteResult ? (
            /* Success state — share options */
            <div className="space-y-5">
              {/* Email status */}
              {inviteResult.email_sent ? (
                <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                  <div className="flex items-center gap-2 font-medium">
                    <DSIcon name="mail" size={16} />
                    Email enviado para {inviteResult.email}
                  </div>
                  <p className="mt-1 text-success/80 text-xs">
                    O aluno receberá um email com link para criar a conta.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
                  <div className="flex items-center gap-2 font-medium">
                    <DSIcon name="mail" size={16} />
                    Email não pôde ser enviado
                  </div>
                  <p className="mt-1 text-warning/80 text-xs">
                    Compartilhe o link abaixo diretamente com seu aluno.
                  </p>
                </div>
              )}

              {/* Student info card */}
              <div className="rounded-xl border border-border-light bg-bg-primary px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-sm">
                    {inviteResult.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{inviteResult.full_name}</p>
                    <p className="text-xs text-text-muted">{inviteResult.email}</p>
                  </div>
                  <div className={cn(
                    'rounded-lg px-2 py-1 text-xs font-medium',
                    studentType === 'consultoria' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-primary/10 text-brand-primary'
                  )}>
                    {studentType === 'consultoria' ? <><DSIcon name="briefcase" size={12} className="mr-1 inline" />Consultoria</> : <><DSIcon name="dumbbell" size={12} className="mr-1 inline" />Personal</>}
                  </div>
                </div>
                {studentType === 'consultoria' && consultationPrice && (
                  <div className="mt-2 pt-2 border-t border-border-light flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <DSIcon name="dollarSign" size={12} /> R$ {Number(consultationPrice).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DSIcon name="calendarClock" size={12} /> {billingCycleLabels[consultationCycle]}
                    </span>
                  </div>
                )}
              </div>

              {/* Invite link */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <DSIcon name="link" size={14} />
                  Link de convite
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-xs text-text-muted break-all font-mono select-all">
                    {effectiveLink}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyInviteLink} className="shrink-0">
                    {copiedLink ? <DSIcon name="check" size={16} className="text-success" /> : <DSIcon name="copy" size={16} />}
                  </Button>
                </div>
                {copiedLink && <p className="text-xs text-success">Link copiado!</p>}
              </div>

              {/* Share buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <DSIcon name="share" size={14} />
                  Compartilhar via
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
                    <DSIcon name="messageCircle" size={16} className="text-green-500" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={copyInviteLink} className="gap-2">
                    <DSIcon name="copy" size={16} />
                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                  </Button>
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button variant="outline" onClick={nativeShare} className="col-span-2 gap-2">
                      <DSIcon name="share" size={16} />
                      Mais opções de compartilhamento
                    </Button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border-light">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleNewInvite}>
                  <DSIcon name="plusCircle" size={16} />
                  Convidar outro
                </Button>
                <Link href="/dashboard/students" className="flex-1">
                  <Button className="w-full">Ver alunos</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tipo de relação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStudentType('personal_training')}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      studentType === 'personal_training'
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-light hover:border-text-muted'
                    )}
                  >
                    <DSIcon name="dumbbell" className={cn(
                      'mb-2',
                      studentType === 'personal_training' ? 'text-brand-primary' : 'text-text-muted'
                    )} />
                    <p className="text-sm font-semibold text-text-primary">Personal Training</p>
                    <p className="mt-0.5 text-xs text-text-muted">Aluno presencial ou online com acompanhamento completo</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentType('consultoria')}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      studentType === 'consultoria'
                        ? 'border-brand-accent bg-brand-accent/5'
                        : 'border-border-light hover:border-text-muted'
                    )}
                  >
                    <DSIcon name="briefcase" className={cn(
                      'mb-2',
                      studentType === 'consultoria' ? 'text-brand-accent' : 'text-text-muted'
                    )} />
                    <p className="text-sm font-semibold text-text-primary">Consultoria</p>
                    <p className="mt-0.5 text-xs text-text-muted">Consultoria fitness com treinos e acesso ao app</p>
                  </button>
                </div>
              </div>

              <Input
                label="Nome do aluno"
                placeholder="Maria da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email do aluno"
                type="email"
                placeholder="aluno@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Consultoria fields */}
              {studentType === 'consultoria' && (
                <div className="space-y-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-4">
                  <p className="text-sm font-semibold text-brand-accent flex items-center gap-2">
                    <DSIcon name="briefcase" size={16} />
                    Plano de Consultoria
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Valor (R$)"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="150.00"
                      value={consultationPrice}
                      onChange={(e) => setConsultationPrice(e.target.value)}
                      required
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-primary">Cobrança</label>
                      <StyledSelect
                        value={consultationCycle}
                        onChange={(v) => setConsultationCycle(v as typeof consultationCycle)}
                        options={[
                          { value: 'MONTHLY', label: 'Mensal' },
                          { value: 'QUARTERLY', label: 'Trimestral' },
                          { value: 'SEMIANNUALLY', label: 'Semestral' },
                          { value: 'YEARLY', label: 'Anual' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Observações do plano</label>
                    <textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="Ex: Inclui 3 treinos semanais, suporte por chat, revisão mensal..."
                      rows={3}
                      className="w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="rounded-lg bg-bg-primary px-3 py-2 text-xs text-text-muted">
                    <DSIcon name="lightbulb" size={14} className="mb-0.5 mr-1 inline text-warning" /> A cobrança será criada automaticamente pelo app quando o aluno aceitar o convite.
                    Taxa da plataforma: 3.5%.
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-info/20 bg-info/10 px-4 py-3 text-xs text-info">
                <DSIcon name="mail" size={14} className="mb-1 inline-block" /> O aluno receberá um email com link para criar a conta e se vincular ao seu perfil.
                {studentType === 'consultoria' && ' Após aceitar, terá acesso completo ao app com treinos, avaliações e chat.'}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={invite.isPending}
                disabled={!email || !fullName || (studentType === 'consultoria' && !consultationPrice)}
              >
                <DSIcon name="send" size={16} />
                {studentType === 'consultoria' ? 'Convidar para Consultoria' : 'Enviar Convite'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

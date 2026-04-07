/**
 * src/app/(auth)/register/personal/page.tsx
 *
 * Register Personal — Ultra-modern · 3D button · White inputs
 *
 * Exports: RegisterPersonalPage
 * Hooks: useState, useEffect, useRef, useSearchParams, useRegisterPersonal
 * Features: 'use client' · DSIcon
 */

// ============================================
// Register Personal — Ultra-modern · 3D button · White inputs
// Koyeb-inspired, matching login redesign
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useRegisterPersonal } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, type TurnstileRef } from '@/components/auth'
import { getReferralCode, saveReferralCode, clearReferralCode } from '@/lib/referral-cookie'
import { ApiClientError } from '@/lib/api-client'
import { StyledSelect } from '@/components/ui/styled-select'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

/* ─── Design tokens ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Input classes ─── */
const inputClass = 'w-full h-12 rounded-xl border border-zinc-200/80 bg-white px-4 text-[14px] text-zinc-900 placeholder:text-zinc-400 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
const selectClass = 'w-full h-12 rounded-xl border border-zinc-200/80 bg-white px-4 text-[14px] text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 appearance-none'

const UF_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

/* ─── CPF mask ─── */
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let m = digits
  if (digits.length > 3) m = digits.slice(0, 3) + '.' + digits.slice(3)
  if (digits.length > 6) m = m.slice(0, 7) + '.' + digits.slice(6)
  if (digits.length > 9) m = m.slice(0, 11) + '-' + digits.slice(9)
  return m
}

/* ─── CREF mask: aceita número + opcional letra categoria (G, P, F) ─── */
function maskCref(value: string): string {
  // Remove tudo exceto alfanuméricos e hífen
  const clean = value.replace(/[^0-9A-Za-z-]/g, '').toUpperCase()
  // Limita a 15 caracteres
  return clean.slice(0, 15)
}

/* ─── Date mask DD/MM/YYYY ─── */
function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  let m = digits
  if (digits.length > 2) m = digits.slice(0, 2) + '/' + digits.slice(2)
  if (digits.length > 4) m = m.slice(0, 5) + '/' + digits.slice(4)
  return m
}

/* ─── Validate CPF check digits ─── */
function validateCpfDigits(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let d1 = 11 - (sum % 11)
  if (d1 >= 10) d1 = 0
  if (parseInt(digits[9]) !== d1) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  let d2 = 11 - (sum % 11)
  if (d2 >= 10) d2 = 0
  if (parseInt(digits[10]) !== d2) return false
  return true
}

export default function RegisterPersonalPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState(false)
  const [turnstileLoading, setTurnstileLoading] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [referralLocked, setReferralLocked] = useState(false)
  const [cpfValidated, setCpfValidated] = useState(false)
  const [cpfError, setCpfError] = useState('')
  const [cpfChecking, setCpfChecking] = useState(false)
  const [cpfLookupName, setCpfLookupName] = useState('')
  const turnstileRef = useRef<TurnstileRef>(null)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    birthDate: '',
    phone: '',
    cref: '',
    cref_state: '',
    specialties: [] as string[],
    referral_code: '',
  })

  const register = useRegisterPersonal()

  useEffect(() => {
    if (register.isError) {
      setTurnstileToken('')
      turnstileRef.current?.reset()
      setTurnstileLoading(true)
    }
  }, [register.isError])

  // Turnstile timeout: after 8s, stop blocking the button
  useEffect(() => {
    if (turnstileToken) { setTurnstileLoading(false); return }
    const timer = setTimeout(() => setTurnstileLoading(false), 8000)
    return () => clearTimeout(timer)
  }, [turnstileToken])

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      saveReferralCode(ref)
      setForm((prev) => ({ ...prev, referral_code: ref }))
      setReferralLocked(true)
      return
    }
    const savedCode = getReferralCode()
    if (savedCode) {
      setForm((prev) => ({ ...prev, referral_code: savedCode }))
      setReferralLocked(true)
    }
  }, [searchParams])

  // Auto-validate CPF via API when CPF + birth date are both filled
  useEffect(() => {
    setCpfError('')
    setCpfLookupName('')
    setCpfValidated(false)
    setCpfChecking(false)

    if (form.cpf.length !== 14) return
    if (form.birthDate.length !== 10) return

    if (!validateCpfDigits(form.cpf)) {
      setCpfError('CPF inválido. Verifique os dígitos.')
      return
    }

    setCpfChecking(true)
    const controller = new AbortController()

    fetch(`${API_BASE}/api/v1/cpf/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: form.cpf.replace(/\D/g, ''), birth_date: form.birthDate }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 429) {
          setCpfError('Muitas tentativas. Aguarde 1 minuto.')
          setCpfChecking(false)
          return
        }
        const json = await res.json() as { success: boolean; data?: { available?: boolean; found?: boolean; full_name?: string; message?: string } }
        const data = json?.data
        if (!data?.available) {
          // Service unavailable — fallback: aceitar com validação local
          setCpfValidated(true)
          setCpfChecking(false)
          return
        }
        if (!data.found || !data.full_name) {
          setCpfError(data?.message || 'CPF não encontrado na Receita Federal.')
          setCpfChecking(false)
          return
        }
        setCpfLookupName(data.full_name)
        setCpfValidated(true)
        setCpfChecking(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        // Network error — fallback: aceitar com validação local
        setCpfValidated(true)
        setCpfChecking(false)
      })

    return () => controller.abort()
  }, [form.cpf, form.birthDate])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    register.mutate({
      full_name: form.fullName,
      email: form.email,
      password: form.password,
      cpf: form.cpf,
      phone: form.phone || undefined,
      cref: form.cref,
      cref_state: form.cref_state,
      specialties: form.specialties,
      referral_code: form.referral_code || undefined,
      turnstile_token: turnstileToken,
    }, { onSuccess: () => clearReferralCode() })
  }

  const passwordsMatch = form.password === form.confirmPassword
  const step1Valid = cpfValidated && form.fullName && form.email && form.password && form.confirmPassword && passwordsMatch
  const step2Valid = form.cref && form.cref_state && acceptedTerms

  return (
    <GuestGuard>
      <div className="animate-blur-in">
        {/* Turnstile — invisible-first, fallback to interactive */}
        <Turnstile
          ref={turnstileRef}
          onVerify={(token) => { setTurnstileToken(token); setTurnstileError(false); setTurnstileLoading(false) }}
          onExpire={() => { setTurnstileToken(''); setTurnstileLoading(true) }}
          onError={() => { setTurnstileError(true); setTurnstileLoading(false) }}
        />

        {/* Turnstile status — visible on step 2 only */}
        {step === 2 && (
          <div className="mb-3">
            {turnstileLoading && !turnstileToken && (
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700/40 bg-zinc-800/30 px-3 py-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                <span className="text-[10px] text-zinc-400">Verificando segurança...</span>
              </div>
            )}
            {turnstileToken && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-primary/6 px-3 py-2">
                <DSIcon name="shieldCheck" size={14} className="text-brand-primary" />
                <span className="text-[10px] text-brand-primary">Verificação concluída</span>
              </div>
            )}
            {turnstileError && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/6 px-3 py-2">
                <div className="flex items-center gap-2">
                  <DSIcon name="alertTriangle" size={14} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400">Verificação com problema — você pode continuar</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setTurnstileError(false); setTurnstileLoading(true); turnstileRef.current?.reset() }}
                  className="shrink-0 rounded-lg bg-amber-500/15 px-2 py-1 text-[9px] font-bold text-amber-400 hover:bg-amber-500/25 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Header ─── */}
        <div className="mb-7">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-3 flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors"
            >
              <DSIcon name="arrowLeft" size={14} /> Voltar
            </button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <DSIcon name="dumbbell" size={14} className="text-brand-primary/60" />
            <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
              CADASTRO PERSONAL
            </p>
          </div>
          <h1 className="text-[1.75rem] text-white leading-none" style={headingFont}>
            {step === 1 ? 'Seus dados' : 'Dados profissionais'}
          </h1>
          <p className="mt-1.5 text-[13px] text-zinc-600">
            {step === 1 ? 'Informações pessoais e acesso' : 'CREF e informações complementares'}
          </p>

          {/* Step indicator */}
          <div className="mt-4 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-brand-primary transition-all" />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-brand-primary' : 'bg-zinc-800'}`} />
          </div>
        </div>

        {/* OAuth on step 1 */}
        {step === 1 && (
          <>
            <OAuthButtons compact userType="personal" />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/6" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1.5 text-[9px] uppercase text-zinc-500 rounded-full border border-zinc-700/50 bg-[#0F1729] backdrop-blur-sm shadow-lg" style={monoLabel}>
                  OU PREENCHA
                </span>
              </div>
            </div>
          </>
        )}

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              {/* Nome Completo */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="user" size={12} className="text-zinc-500" /> NOME COMPLETO
                </label>
                <input
                  type="text"
                  placeholder="Como aparecerá para seus alunos"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>

              {/* CPF */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="fingerprint" size={12} className="text-zinc-500" /> CPF
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => updateField('cpf', maskCpf(e.target.value))}
                  required
                  className={`${inputClass} tracking-wider ${cpfValidated ? 'border-brand-primary/50! ring-1! ring-brand-primary/30!' : cpfError ? 'border-red-500/50! ring-1! ring-red-500/30!' : ''}`}
                />
                {cpfChecking && (
                  <div className="mt-2 flex items-center gap-2">
                    <DSIcon name="loader" size={14} className="text-brand-primary animate-spin" />
                    <span className="text-[11px] text-zinc-400">Validando CPF...</span>
                  </div>
                )}
                {cpfValidated && !cpfChecking && (
                  <div className="mt-2 flex items-center gap-2">
                    <DSIcon name="checkCircle2" size={14} className="text-brand-primary" />
                    <span className="text-[11px] text-brand-primary">CPF validado</span>
                  </div>
                )}
                {cpfError && (
                  <p className="mt-1.5 text-[11px] text-red-400">{cpfError}</p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="calendar" size={12} className="text-zinc-500" /> DATA DE NASCIMENTO
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={form.birthDate}
                  onChange={(e) => updateField('birthDate', maskDate(e.target.value))}
                  autoComplete="bday"
                  required
                  className={`${inputClass} tracking-wider ${cpfValidated ? 'border-brand-primary/50! ring-1! ring-brand-primary/30!' : ''}`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="mail" size={12} className="text-zinc-500" /> EMAIL
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="phone" size={12} className="text-zinc-500" /> TELEFONE <span className="text-zinc-600 normal-case">(opcional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>

              {/* Senha */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="lock" size={12} className="text-zinc-500" /> SENHA
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-lg hover:bg-zinc-100"
                    tabIndex={-1}
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="shieldCheck" size={12} className="text-zinc-500" /> CONFIRMAR SENHA
                </label>
                <input
                  type="password"
                  placeholder="Repita a senha"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  required
                  className={inputClass}
                />
                {form.confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-[11px] text-red-400">Senhas não conferem</p>
                )}
              </div>

              {/* Continue — 3D button */}
              <Button
                type="submit"
                size="lg"
                disabled={!step1Valid}
                className="w-full uppercase tracking-wider font-black"
              >
                CONTINUAR
                <DSIcon name="arrowRight" size={16} />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              {/* CREF */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="award" size={12} className="text-zinc-500" /> CREF
                </label>
                <input
                  type="text"
                  placeholder="123456 ou 123456-G"
                  value={form.cref}
                  onChange={(e) => updateField('cref', maskCref(e.target.value))}
                  required
                  className={`${inputClass} tracking-wider uppercase`}
                />
                <p className="mt-1 text-[10px] text-zinc-600">Apenas o número do CREF · O estado é selecionado abaixo</p>
              </div>

              {/* Estado CREF */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="shield" size={12} className="text-zinc-500" /> ESTADO DO CREF
                </label>
                <StyledSelect
                  value={form.cref_state}
                  onChange={(v) => updateField('cref_state', v)}
                  options={[
                    { value: '', label: 'Selecione o estado' },
                    ...UF_OPTIONS.map((uf) => ({ value: uf, label: uf })),
                  ]}
                />
              </div>

              {/* Referral */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400" style={monoLabel}>
                    <DSIcon name="sparkles" size={12} className="text-zinc-500" /> INDICAÇÃO {referralLocked ? '' : <span className="text-zinc-600 normal-case">(opcional)</span>}
                  </label>
                  {form.referral_code && referralLocked && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[8px] font-semibold text-brand-primary">
                      <DSIcon name="lock" size={10} /> PROTEGIDA
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={form.referral_code}
                    onChange={(e) => !referralLocked && updateField('referral_code', e.target.value)}
                    readOnly={referralLocked}
                    className={`${inputClass} ${referralLocked ? 'opacity-70 cursor-not-allowed bg-zinc-100' : ''}`}
                  />
                  {referralLocked && <DSIcon name="lock" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary" />}
                </div>
              </div>

              {turnstileError && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/6 px-4 py-2.5">
                  <p className="text-[11px] text-amber-400">
                    Verificação de segurança com problema.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTurnstileError(false)
                      setTurnstileToken('')
                      turnstileRef.current?.reset()
                    }}
                    className="shrink-0 rounded-lg bg-amber-500/15 px-3 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500/25 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-700/40 bg-zinc-800/30 p-3 transition-colors hover:border-brand-primary/30">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-4.5 w-4.5 rounded-md border border-zinc-600 bg-zinc-800 peer-checked:bg-brand-primary peer-checked:border-brand-primary transition-all duration-200 flex items-center justify-center">
                    {acceptedTerms && (
                      <svg className="h-2.5 w-2.5 text-bg-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] leading-relaxed text-zinc-500">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" className="font-bold text-brand-primary hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" className="font-bold text-brand-primary hover:underline">Política de Privacidade</Link>
                  , incluindo tratamento dos meus dados conforme a LGPD.
                </span>
              </label>

              {/* Submit — 3D button */}
              <Button
                type="submit"
                size="lg"
                disabled={!step2Valid}
                loading={register.isPending}
                className="w-full uppercase tracking-wider font-black"
              >
                CRIAR CONTA
                <DSIcon name="arrowRight" size={16} />
              </Button>

              {/* Error */}
              {register.isError && (() => {
                const err = register.error
                const message = err instanceof ApiClientError ? err.message : 'Erro ao criar conta'
                // Parse Zod field errors from details
                const details = err instanceof ApiClientError ? (err.details as Array<{ path?: string[]; message?: string }> | undefined) : undefined
                const fieldErrors = details?.length ? details : null

                return (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-red-400">
                          {fieldErrors ? 'Corrija os campos abaixo:' : message}
                        </p>
                        {fieldErrors && (
                          <ul className="mt-1.5 space-y-1">
                            {fieldErrors.map((fe, i) => {
                              const fieldName = fe.path?.[0] || 'campo'
                              const labels: Record<string, string> = {
                                email: 'Email', password: 'Senha', full_name: 'Nome',
                                cpf: 'CPF', phone: 'Telefone', cref: 'CREF',
                                cref_state: 'Estado', turnstile_token: 'Anti-bot',
                              }
                              return (
                                <li key={i} className="text-[11px] text-red-300">
                                  <span className="font-bold">{labels[fieldName] || fieldName}:</span> {fe.message}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[13px] text-zinc-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
              Entrar
            </Link>
          </p>
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-700" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}

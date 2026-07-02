/**
 * src/app/(auth)/register/page.tsx
 *
 * Register — UNIFIED signup · VFIT BROADCAST dark · low friction
 *
 * Exports: RegisterPage
 * Hooks: useState, useEffect, useRef, useSearchParams, useRegisterStudent, useRegisterPersonal
 * Features: 'use client' · DSIcon
 *
 * Single page, defaults to "Aluno". A dark segmented switcher lets the user
 * change to "Personal" (full pro fields inline) or "Nutri". Reuses the proven
 * submit logic from the dedicated student/personal flows so auth behavior is
 * unchanged. Visual: mesmo sistema do /welcome, /login e onboarding.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useRegisterStudent, useRegisterPersonal, useRegisterNutritionist } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, type TurnstileRef } from '@/components/auth'
import { getReferralCode, saveReferralCode, clearReferralCode } from '@/lib/referral-cookie'
import { ApiClientError } from '@/lib/api-client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

/* ─── Dark input (mesmo token do funil) ─── */
const field = 'vfit-flow-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none'
const labelCls = 'bc-mono mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300/70'

const UF_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

type Role = 'student' | 'personal' | 'nutri'

/* ─── Masks / validators ─── */
function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  let m = d
  if (d.length > 3) m = d.slice(0, 3) + '.' + d.slice(3)
  if (d.length > 6) m = m.slice(0, 7) + '.' + d.slice(6)
  if (d.length > 9) m = m.slice(0, 11) + '-' + d.slice(9)
  return m
}
function maskDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  let m = d
  if (d.length > 2) m = d.slice(0, 2) + '/' + d.slice(2)
  if (d.length > 4) m = m.slice(0, 5) + '/' + d.slice(4)
  return m
}
function maskCref(value: string): string {
  return value.replace(/[^0-9A-Za-z-]/g, '').toUpperCase().slice(0, 15)
}
function validateCpfDigits(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i)
  let d1 = 11 - (s % 11); if (d1 >= 10) d1 = 0
  if (parseInt(d[9]) !== d1) return false
  s = 0
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i)
  let d2 = 11 - (s % 11); if (d2 >= 10) d2 = 0
  return parseInt(d[10]) === d2
}

/* ─── Role meta ─── */
const ROLE_META: Record<Role, { label: string; icon: 'graduationCap' | 'dumbbell' | 'apple'; title: string; subtitle: string; benefits: string[] }> = {
  student: {
    label: 'Aluno', icon: 'graduationCap',
    title: 'Crie sua conta', subtitle: 'Acesse treinos, marketplace e acompanhe sua evolução',
    benefits: ['MARKETPLACE', 'GAMIFICAÇÃO', 'EVOLUÇÃO'],
  },
  personal: {
    label: 'Personal', icon: 'dumbbell',
    title: 'Seja um Personal', subtitle: 'Gerencie alunos, crie treinos com IA e automatize cobranças',
    benefits: ['IA GENERATIVA', 'PIX AUTOMÁTICO', 'GESTÃO ALUNOS'],
  },
  nutri: {
    label: 'Nutri', icon: 'apple',
    title: 'Seja um Nutricionista', subtitle: 'Planos alimentares, acompanhamento e integração com treinos',
    benefits: ['PLANOS ALIMENTARES', 'ACOMPANHAMENTO', 'INTEGRAÇÃO'],
  },
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const initialRole: Role = roleParam === 'personal' || roleParam === 'nutri' ? roleParam : 'student'

  const [role, setRole] = useState<Role>(initialRole)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Turnstile (invisible-first, non-blocking via timeout)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileLoading, setTurnstileLoading] = useState(true)
  const turnstileRef = useRef<TurnstileRef>(null)

  // Personal CPF (Receita) validation
  const [cpfChecking, setCpfChecking] = useState(false)
  const [cpfValidated, setCpfValidated] = useState(false)
  const [cpfError, setCpfError] = useState('')
  const [cpfLookupName, setCpfLookupName] = useState('')
  const [referralLocked, setReferralLocked] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    birthDate: '',
    cref: '',
    cref_state: '',
    crn: '',
    crn_state: '',
    referral_code: '',
  })

  const registerStudent = useRegisterStudent()
  const registerPersonal = useRegisterPersonal()
  const registerNutri = useRegisterNutritionist()
  const register = role === 'personal' ? registerPersonal : role === 'nutri' ? registerNutri : registerStudent

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Referral capture (used by personal)
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      saveReferralCode(ref)
      setForm((prev) => ({ ...prev, referral_code: ref }))
      setReferralLocked(true)
      return
    }
    const saved = getReferralCode()
    if (saved) {
      setForm((prev) => ({ ...prev, referral_code: saved }))
      setReferralLocked(true)
    }
  }, [searchParams])

  // Turnstile timeout fallback — never leave the button stuck
  useEffect(() => {
    if (turnstileToken) { setTurnstileLoading(false); return }
    const t = setTimeout(() => setTurnstileLoading(false), 8000)
    return () => clearTimeout(t)
  }, [turnstileToken])

  // Reset turnstile on error
  useEffect(() => {
    if (register.isError) {
      setTurnstileToken('')
      turnstileRef.current?.reset()
    }
  }, [register.isError])

  // Receita CPF lookup for Personal (CPF + birthDate)
  useEffect(() => {
    if (role !== 'personal') return
    setCpfError(''); setCpfLookupName(''); setCpfValidated(false); setCpfChecking(false)

    if (form.cpf.length !== 14 || form.birthDate.length !== 10) return
    if (!validateCpfDigits(form.cpf)) { setCpfError('CPF inválido. Verifique os dígitos.'); return }

    setCpfChecking(true)
    const controller = new AbortController()
    fetch(`${API_BASE}/api/v1/cpf/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: form.cpf.replace(/\D/g, ''), birth_date: form.birthDate }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 429) { setCpfError('Muitas tentativas. Aguarde 1 minuto.'); setCpfChecking(false); return }
        const json = await res.json() as { data?: { available?: boolean; found?: boolean; full_name?: string; message?: string } }
        const data = json?.data
        if (!data?.available) { setCpfValidated(true); setCpfChecking(false); return }
        if (!data.found || !data.full_name) { setCpfError(data?.message || 'CPF não encontrado na Receita Federal.'); setCpfChecking(false); return }
        setCpfLookupName(data.full_name); setCpfValidated(true); setCpfChecking(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setCpfValidated(true); setCpfChecking(false)
      })
    return () => controller.abort()
  }, [role, form.cpf, form.birthDate])

  const turnstileReady = !!turnstileToken || !turnstileLoading
  const baseValid = form.full_name.trim().length >= 2 && form.email.length > 3 && form.password.length >= 8 && acceptedTerms && turnstileReady
  const cpfLocalValid = validateCpfDigits(form.cpf)

  const studentValid = baseValid
  const personalValid = baseValid && cpfValidated && form.cref.trim().length > 0 && form.cref_state.length === 2
  const nutriValid = baseValid && cpfLocalValid && form.crn.trim().length > 0 && form.crn_state.length === 2
  const isValid = role === 'personal' ? personalValid : role === 'nutri' ? nutriValid : studentValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (register.isPending) return

    if (role === 'student') {
      if (!studentValid) return
      registerStudent.mutate({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || undefined,
        turnstile_token: turnstileToken,
      })
    } else if (role === 'personal') {
      if (!personalValid) return
      registerPersonal.mutate({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        cpf: form.cpf,
        phone: form.phone || undefined,
        cref: form.cref,
        cref_state: form.cref_state,
        referral_code: form.referral_code || undefined,
        turnstile_token: turnstileToken,
      }, { onSuccess: () => clearReferralCode() })
    } else {
      if (!nutriValid) return
      registerNutri.mutate({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        cpf: form.cpf,
        phone: form.phone || undefined,
        crn: form.crn,
        crn_state: form.crn_state,
        referral_code: form.referral_code || undefined,
        turnstile_token: turnstileToken,
      }, { onSuccess: () => clearReferralCode() })
    }
  }

  const meta = ROLE_META[role]
  const roleIndex = role === 'student' ? 0 : role === 'personal' ? 1 : 2
  const ctaLabel = role === 'personal' ? 'Criar conta Personal' : role === 'nutri' ? 'Criar conta Nutri' : 'Criar conta e entrar'

  return (
    <GuestGuard>
      <div className="login-stagger">
        {/* Turnstile — invisible-first */}
        <Turnstile
          ref={turnstileRef}
          onVerify={(t) => { setTurnstileToken(t); setTurnstileLoading(false) }}
          onExpire={() => { setTurnstileToken(''); setTurnstileLoading(true) }}
          onError={() => setTurnstileLoading(false)}
        />

        {/* ─── Header ─── */}
        <div className="mb-4">
          <p className="bc-mono mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Crie sua conta · 30 dias grátis
          </p>
          <h1 className="font-syne text-[1.7rem] font-black leading-none text-white transition-all">
            {meta.title}
          </h1>
          <p className="mt-1.5 text-[12.5px] text-slate-400">{meta.subtitle}</p>
        </div>

        {/* ─── Role switcher — pills segmentadas dark ─── */}
        <div className="relative mb-3 flex rounded-full border border-white/10 bg-white/4 p-1 shadow-glass-inset-sm">
          <div
            className="absolute bottom-1 left-1 top-1 rounded-full border border-green-400/40 bg-green-400/12 shadow-[0_0_18px_-6px_rgba(34,197,94,0.7)] transition-transform duration-300 ease-out"
            style={{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(${roleIndex * 100}%)` }}
            aria-hidden="true"
          />
          {(['student', 'personal', 'nutri'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold transition-colors ${role === r ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <DSIcon name={ROLE_META[r].icon} size={15} className={role === r ? 'text-green-300' : ''} /> {ROLE_META[r].label}
            </button>
          ))}
        </div>

        {/* ─── Benefit chips ─── */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.benefits.map((b) => (
            <span key={b} className="bc-mono inline-flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-green-200">
              <DSIcon name="checkCircle2" size={11} className="text-green-300" /> {b}
            </span>
          ))}
        </div>

        <div className="auth-role-reveal" key={role}>
            {/* OAuth — fast path (student/personal only; Nutri tem só formulário) */}
            {role !== 'nutri' ? (
              <>
                <OAuthButtons compact userType={role} />
                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center">
                    <span className="bc-mono rounded-full border border-white/10 bg-[#04080f] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">OU PREENCHA</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-3 flex items-center gap-2 rounded-2xl border border-green-400/20 bg-green-400/6 px-3.5 py-2.5">
                <DSIcon name="shieldCheck" size={14} className="shrink-0 text-green-300" />
                <span className="text-[11px] text-green-200">Conta de nutricionista — ativação por email após o cadastro.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nome */}
              <div>
                <label className={labelCls}>
                  <DSIcon name="user" size={12} className="text-green-300/60" /> NOME COMPLETO
                </label>
                <input
                  type="text"
                  placeholder={role === 'personal' ? 'Como aparecerá para seus alunos' : 'Seu nome completo'}
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  autoComplete="name"
                  required
                  className={field}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>
                  <DSIcon name="mail" size={12} className="text-green-300/60" /> EMAIL
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  required
                  className={field}
                />
              </div>

              {/* ── CPF — personal (Receita) + nutri (local) ── */}
              {(role === 'personal' || role === 'nutri') && (
                <div>
                  <label className={labelCls}>
                    <DSIcon name="fingerprint" size={12} className="text-green-300/60" /> CPF
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => updateField('cpf', maskCpf(e.target.value))}
                    required
                    className={field}
                  />
                  <div role="status" aria-live="polite">
                    {role === 'personal' ? (
                      <>
                        {cpfChecking && (
                          <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="loader" size={13} className="animate-spin text-green-300" /><span className="text-[11px] text-slate-400">Validando CPF…</span></div>
                        )}
                        {cpfValidated && !cpfChecking && (
                          <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="checkCircle2" size={13} className="text-green-300" /><span className="text-[11px] text-green-200">CPF validado{cpfLookupName ? ` para ${cpfLookupName}` : ''}</span></div>
                        )}
                        {cpfError && <p className="mt-1.5 text-[11px] text-red-400">{cpfError}</p>}
                      </>
                    ) : (
                      form.cpf.length === 14 && (
                        cpfLocalValid
                          ? <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="checkCircle2" size={13} className="text-green-300" /><span className="text-[11px] text-green-200">CPF válido</span></div>
                          : <p className="mt-1.5 text-[11px] text-red-400">CPF inválido. Verifique os dígitos.</p>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Birth date — personal only (necessário p/ validação Receita) */}
              {role === 'personal' && (
                <div>
                  <label className={labelCls}>
                    <DSIcon name="calendar" size={12} className="text-green-300/60" /> DATA DE NASCIMENTO
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/AAAA"
                    value={form.birthDate}
                    onChange={(e) => updateField('birthDate', maskDate(e.target.value))}
                    autoComplete="bday"
                    required
                    className={field}
                  />
                </div>
              )}

              {/* Senha */}
              <div>
                <label className={labelCls}>
                  <DSIcon name="lock" size={12} className="text-green-300/60" /> SENHA
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${field} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50"
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        form.password.length >= lvl * 3
                          ? form.password.length >= 12 ? 'bg-green-400' : form.password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                          : 'bg-white/15'
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── CREF (personal) ── */}
              {role === 'personal' && (
                <>
                  <div>
                    <label className={labelCls}>
                      <DSIcon name="award" size={12} className="text-green-300/60" /> CREF
                    </label>
                    <input
                      type="text"
                      placeholder="123456 ou 123456-G"
                      value={form.cref}
                      onChange={(e) => updateField('cref', maskCref(e.target.value))}
                      required
                      className={`${field} uppercase`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      <DSIcon name="shield" size={12} className="text-green-300/60" /> ESTADO DO CREF
                    </label>
                    <div className="relative">
                      <select
                        value={form.cref_state}
                        onChange={(e) => updateField('cref_state', e.target.value)}
                        required
                        className={`${field} appearance-none pr-10 ${form.cref_state ? '' : 'text-slate-500'}`}
                      >
                        <option value="" className="bg-[#0B1221] text-slate-400">Selecione o estado</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf} className="bg-[#0B1221] text-white">{uf}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {/* ── CRN (nutri) ── */}
              {role === 'nutri' && (
                <>
                  <div>
                    <label className={labelCls}>
                      <DSIcon name="award" size={12} className="text-green-300/60" /> CRN
                    </label>
                    <input
                      type="text"
                      placeholder="1234 ou CRN-3 1234"
                      value={form.crn}
                      onChange={(e) => updateField('crn', maskCref(e.target.value))}
                      required
                      className={`${field} uppercase`}
                    />
                    <p className="mt-1 text-[10px] text-slate-500">Registro no Conselho Regional de Nutricionistas</p>
                  </div>

                  <div>
                    <label className={labelCls}>
                      <DSIcon name="shield" size={12} className="text-green-300/60" /> ESTADO DO CRN
                    </label>
                    <div className="relative">
                      <select
                        value={form.crn_state}
                        onChange={(e) => updateField('crn_state', e.target.value)}
                        required
                        className={`${field} appearance-none pr-10 ${form.crn_state ? '' : 'text-slate-500'}`}
                      >
                        <option value="" className="bg-[#0B1221] text-slate-400">Selecione o estado</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf} className="bg-[#0B1221] text-white">{uf}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {/* Referral (personal + nutri) */}
              {(role === 'personal' || role === 'nutri') && referralLocked && form.referral_code && (
                <div className="flex items-center gap-2 rounded-2xl border border-green-400/25 bg-green-400/8 px-3.5 py-2.5">
                  <DSIcon name="gift" size={14} className="shrink-0 text-green-300" />
                  <span className="text-[12px] font-semibold text-green-200">Indicação aplicada: {form.referral_code}</span>
                </div>
              )}

              {/* Phone (optional) */}
              <div>
                <label className={labelCls}>
                  <DSIcon name="phone" size={12} className="text-green-300/60" /> TELEFONE <span className="normal-case tracking-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  autoComplete="tel"
                  className={field}
                />
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition-colors hover:border-green-400/25">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-md border border-white/20 bg-white/5 transition-all duration-200 peer-checked:border-green-400 peer-checked:bg-green-400">
                    {acceptedTerms && (
                      <svg className="h-2.5 w-2.5 text-[#06210f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] normal-case leading-relaxed tracking-normal text-slate-400">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" className="font-bold text-green-300 hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" className="font-bold text-green-300 hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              {/* Submit — BROADCAST pill CTA */}
              <button
                type="submit"
                disabled={!isValid || register.isPending}
                className="bc-reg-cta group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-[#06210f] outline-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04080f] disabled:pointer-events-none disabled:opacity-35 disabled:saturate-[0.4]"
                style={{ background: 'linear-gradient(135deg,#4ade80 0%,#22c55e 50%,#16a34a 100%)' }}
              >
                {isValid && !register.isPending && <span aria-hidden className="bc-reg-sweep" />}
                {register.isPending ? (
                  <span aria-hidden className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-[#06210f]/30 border-t-[#06210f]" />
                ) : (
                  <DSIcon name="sparkles" size={16} className="relative z-10" />
                )}
                <span className="font-syne relative z-10 text-[15px] font-black uppercase tracking-tight">
                  {register.isPending ? 'Criando conta…' : ctaLabel}
                </span>
                {!register.isPending && <DSIcon name="arrowRight" size={16} className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />}
              </button>

              {/* Error */}
              {register.isError && (
                <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3">
                  <DSIcon name="alertCircle" size={16} className="shrink-0 text-red-400" />
                  <p className="text-[12px] font-medium text-red-300">
                    {register.error instanceof ApiClientError ? register.error.message : 'Erro ao criar conta. Tente novamente.'}
                  </p>
                </div>
              )}
            </form>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] text-slate-400">
            Já tem conta?{' '}
            <Link href="/login" className="font-bold text-green-300 transition-colors hover:text-green-200">Entrar</Link>
          </p>
          <span className="bc-mono flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>

      <style>{`
        .bc-reg-cta { box-shadow: 0 16px 40px -14px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.45); }
        .bc-reg-sweep { position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%); transform: translateX(-130%) skewX(-18deg); animation: bcRegSweep 3.6s ease-in-out 1.2s infinite; }
        .bc-reg-cta:hover .bc-reg-sweep { animation-duration: 1.1s; }
        @keyframes bcRegSweep { 0% { transform: translateX(-130%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
        @media (prefers-reduced-motion: reduce) { .bc-reg-sweep { animation: none !important; } }
      `}</style>
    </GuestGuard>
  )
}

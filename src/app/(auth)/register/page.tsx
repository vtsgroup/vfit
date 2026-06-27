/**
 * src/app/(auth)/register/page.tsx
 *
 * Register — UNIFIED signup · Light premium · low friction
 *
 * Exports: RegisterPage
 * Hooks: useState, useEffect, useRef, useSearchParams, useRegisterStudent, useRegisterPersonal
 * Features: 'use client' · DSIcon
 *
 * Single page, defaults to "Aluno". A premium segmented switcher lets the user
 * change to "Personal" (full pro fields inline) or "Nutri" (coming soon — no
 * backend registration endpoint yet). Reuses the proven submit logic from the
 * dedicated student/personal flows so auth behavior is unchanged.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useRegisterStudent, useRegisterPersonal, useRegisterNutritionist } from '@/hooks/use-auth'
import { GuestGuard, OAuthButtons, Turnstile, type TurnstileRef } from '@/components/auth'
import { getReferralCode, saveReferralCode, clearReferralCode } from '@/lib/referral-cookie'
import { ApiClientError } from '@/lib/api-client'

/* ─── Design tokens ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.01em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0',
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

/* ─── Light input ─── */
const field = 'auth-light-field h-12 w-full rounded-2xl px-4 text-[14px] transition-all duration-200 focus:outline-none'

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
          <div className="flex items-center gap-2 mb-1.5">
            <DSIcon name="sparkles" size={13} className="text-emerald-600" />
            <p className="text-[9px] uppercase text-emerald-600" style={monoLabel}>CRIE SUA CONTA · 30 DIAS GRÁTIS</p>
          </div>
          <h1 className="text-[1.7rem] text-slate-900 leading-none transition-all" style={headingFont}>
            {meta.title}
          </h1>
          <p className="mt-1.5 text-[12.5px] text-slate-500">{meta.subtitle}</p>
        </div>

        {/* ─── Role switcher ─── */}
        <div className="auth-seg-track relative flex rounded-2xl p-1 mb-3">
          <div
            className="auth-seg-thumb absolute top-1 bottom-1 left-1 rounded-xl"
            style={{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(${roleIndex * 100}%)` }}
            aria-hidden="true"
          />
          <button type="button" onClick={() => setRole('student')} aria-pressed={role === 'student'}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-bold transition-colors ${role === 'student' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            <DSIcon name="graduationCap" size={15} className={role === 'student' ? 'text-emerald-600' : ''} /> Aluno
          </button>
          <button type="button" onClick={() => setRole('personal')} aria-pressed={role === 'personal'}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-bold transition-colors ${role === 'personal' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            <DSIcon name="dumbbell" size={15} className={role === 'personal' ? 'text-emerald-600' : ''} /> Personal
          </button>
          <button type="button" onClick={() => setRole('nutri')} aria-pressed={role === 'nutri'}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-bold transition-colors ${role === 'nutri' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            <DSIcon name="apple" size={15} className={role === 'nutri' ? 'text-emerald-600' : ''} /> Nutri
          </button>
        </div>

        {/* ─── Benefit chips ─── */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {meta.benefits.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] uppercase text-emerald-700" style={monoLabel}>
              <DSIcon name="checkCircle2" size={11} className="text-emerald-500" /> {b}
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
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[9px] uppercase text-slate-400 shadow-sm" style={monoLabel}>OU PREENCHA</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                <DSIcon name="shieldCheck" size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] text-emerald-700">Conta de nutricionista — ativação por email após o cadastro.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                  <DSIcon name="user" size={12} className="text-slate-400" /> NOME COMPLETO
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
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                  <DSIcon name="mail" size={12} className="text-slate-400" /> EMAIL
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
                  <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                    <DSIcon name="fingerprint" size={12} className="text-slate-400" /> CPF
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
                          <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="loader" size={13} className="text-emerald-600 animate-spin" /><span className="text-[11px] text-slate-500">Validando CPF…</span></div>
                        )}
                        {cpfValidated && !cpfChecking && (
                          <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="checkCircle2" size={13} className="text-emerald-600" /><span className="text-[11px] text-emerald-700">CPF validado{cpfLookupName ? ` para ${cpfLookupName}` : ''}</span></div>
                        )}
                        {cpfError && <p className="mt-1.5 text-[11px] text-red-600">{cpfError}</p>}
                      </>
                    ) : (
                      form.cpf.length === 14 && (
                        cpfLocalValid
                          ? <div className="mt-1.5 flex items-center gap-1.5"><DSIcon name="checkCircle2" size={13} className="text-emerald-600" /><span className="text-[11px] text-emerald-700">CPF válido</span></div>
                          : <p className="mt-1.5 text-[11px] text-red-600">CPF inválido. Verifique os dígitos.</p>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Birth date — personal only (necessário p/ validação Receita) */}
              {role === 'personal' && (
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                    <DSIcon name="calendar" size={12} className="text-slate-400" /> DATA DE NASCIMENTO
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
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                  <DSIcon name="lock" size={12} className="text-slate-400" /> SENHA
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
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        form.password.length >= lvl * 3
                          ? form.password.length >= 12 ? 'bg-emerald-500' : form.password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                          : 'bg-slate-200'
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── CREF (personal) ── */}
              {role === 'personal' && (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                      <DSIcon name="award" size={12} className="text-slate-400" /> CREF
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
                    <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                      <DSIcon name="shield" size={12} className="text-slate-400" /> ESTADO DO CREF
                    </label>
                    <div className="relative">
                      <select
                        value={form.cref_state}
                        onChange={(e) => updateField('cref_state', e.target.value)}
                        required
                        className={`${field} appearance-none pr-10 ${form.cref_state ? '' : 'text-slate-400'}`}
                      >
                        <option value="">Selecione o estado</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf} className="text-slate-900">{uf}</option>)}
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
                    <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                      <DSIcon name="award" size={12} className="text-slate-400" /> CRN
                    </label>
                    <input
                      type="text"
                      placeholder="1234 ou CRN-3 1234"
                      value={form.crn}
                      onChange={(e) => updateField('crn', maskCref(e.target.value))}
                      required
                      className={`${field} uppercase`}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Registro no Conselho Regional de Nutricionistas</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                      <DSIcon name="shield" size={12} className="text-slate-400" /> ESTADO DO CRN
                    </label>
                    <div className="relative">
                      <select
                        value={form.crn_state}
                        onChange={(e) => updateField('crn_state', e.target.value)}
                        required
                        className={`${field} appearance-none pr-10 ${form.crn_state ? '' : 'text-slate-400'}`}
                      >
                        <option value="">Selecione o estado</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf} className="text-slate-900">{uf}</option>)}
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
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                  <DSIcon name="gift" size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-[12px] font-semibold text-emerald-700">Indicação aplicada: {form.referral_code}</span>
                </div>
              )}

              {/* Phone (optional) */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 mb-1.5" style={monoLabel}>
                  <DSIcon name="phone" size={12} className="text-slate-400" /> TELEFONE <span className="text-slate-400 normal-case">(opcional)</span>
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
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-md border border-slate-300 bg-white transition-all duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-500">
                    {acceptedTerms && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] leading-relaxed text-slate-500">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={!isValid}
                loading={register.isPending}
                className="auth-submit-cta-light w-full uppercase font-black"
              >
                <DSIcon name="sparkles" size={16} />
                {role === 'personal' ? 'CRIAR CONTA PERSONAL' : role === 'nutri' ? 'CRIAR CONTA NUTRI' : 'CRIAR CONTA E ENTRAR'}
                <DSIcon name="arrowRight" size={16} />
              </Button>

              {/* Error */}
              {register.isError && (
                <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3">
                  <DSIcon name="alertCircle" size={16} className="text-red-500 shrink-0" />
                  <p className="text-[12px] font-medium text-red-600">
                    {register.error instanceof ApiClientError ? register.error.message : 'Erro ao criar conta. Tente novamente.'}
                  </p>
                </div>
              )}
            </form>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Entrar</Link>
          </p>
          <span className="flex items-center gap-1.5 text-[9px] text-slate-400" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}

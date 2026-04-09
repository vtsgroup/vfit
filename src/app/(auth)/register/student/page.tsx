/**
 * src/app/(auth)/register/student/page.tsx
 *
 * Register Student — Single-step · Google OAuth first · CPF optional
 *
 * Exports: RegisterStudentPage
 * Hooks: useState, useEffect, useMemo, useSearchParams, useRegisterStudent
 * Features: 'use client' · DSIcon
 */

// ============================================
// Register Student — Single-step flow
// Google OAuth button + email/password form
// CPF optional — can be added later in profile
// ============================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { useRegisterStudent } from '@/hooks/use-auth'
import { useCpfValidation } from '@/hooks/use-cpf-validation'
import { Button } from '@/components/ui/button'
import { GuestGuard, Turnstile, OAuthButtons, AuthDivider } from '@/components/auth'
import { ApiClientError } from '@/lib/api-client'

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
const inputBase = 'w-full h-13 rounded-2xl border backdrop-blur-sm px-4 text-[15px] transition-all duration-300 focus:outline-none'
const inputNormal = `${inputBase} bg-white/95 text-zinc-900 placeholder:text-zinc-400 border-white/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/25 focus:bg-white shadow-sm`

/* ─── Personal Trainer info type ─── */
interface PersonalInfo {
  personal_name: string
  personal_photo: string | null
  personal_cref: string | null
  personal_cref_state: string | null
  personal_cref_verified: boolean
  personal_specialties: string[] | null
  student_name?: string
}

/* ─── Normalize photo URL (same logic as Avatar) ─── */
const PUBLIC_IMAGES_BASE = (process.env.NEXT_PUBLIC_IMAGES_URL || 'https://images.vfit.app.br').replace(/\/+$/, '')

function normalizePhotoUrl(src: string | null | undefined): string | null {
  if (!src) return null
  const raw = String(src).trim()
  if (!raw) return null
  if (raw.startsWith('profiles/')) return `${PUBLIC_IMAGES_BASE}/${raw}`
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const u = new URL(raw)
      if (!u.hostname.includes('.') || u.hostname === 'profiles') {
        const p = u.pathname.startsWith('/profiles/') ? u.pathname : `/profiles${u.pathname}`
        return `${PUBLIC_IMAGES_BASE}${p}`
      }
    } catch { /* fallthrough */ }
    return raw
  }
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return raw
  return `https://${raw}`
}

/* ─── First + Last name ─── */
function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 2) return fullName
  return `${parts[0]} ${parts[parts.length - 1]}`
}

// ============================================
// Main Component
// ============================================
export default function RegisterStudentPage() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token') || ''

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    cpf: '',
    invitation_token: inviteToken,
  })

  const register = useRegisterStudent()
  const cpfValidation = useCpfValidation(form.cpf)
  const fromOnboarding = searchParams.get('from') === 'onboarding'
  const selectedPlanId = searchParams.get('plan') || ''
  const requireCpf = fromOnboarding && !!selectedPlanId && selectedPlanId !== 'free'

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Fetch personal trainer info when invite token present
  useEffect(() => {
    if (!inviteToken) return
    fetch(`${API_BASE}/api/v1/invitations/${inviteToken}/info`)
      .then((r) => r.json())
      .then((res) => {
        const data = res as { success: boolean; data?: PersonalInfo }
        if (data.success && data.data) {
          setPersonalInfo(data.data)
          // Pre-fill name from invitation
          if (data.data.student_name) {
            setForm(prev => ({ ...prev, full_name: data.data!.student_name || '' }))
          }
        }
      })
      .catch(() => {})
  }, [inviteToken])

  const formValid =
    form.full_name.trim().length >= 2 &&
    form.email &&
    form.password.length >= 8 &&
    turnstileToken &&
    acceptedTerms &&
    (!requireCpf || cpfValidation.isValid)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return

    // Salvar CPF para checkout automático pós-registro
    const rawCpf = form.cpf.replace(/\D/g, '')
    if (rawCpf.length === 11) {
      localStorage.setItem('vfit_checkout_cpf', rawCpf)
    }

    register.mutate({
      full_name: form.full_name.trim(),
      email: form.email,
      password: form.password,
      cpf: rawCpf || undefined,
      invitation_token: form.invitation_token || undefined,
      turnstile_token: turnstileToken,
    })
  }

  // Background particles
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * -15,
      opacity: 0.15 + Math.random() * 0.25,
    })),
  [])

  return (
    <GuestGuard>
      <style>{`
        @keyframes coverShimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
        @keyframes slideUp { 0% { opacity:0; transform:translateY(20px) } 100% { opacity:1; transform:translateY(0) } }
        @keyframes scaleIn { 0% { opacity:0; transform:scale(.9) } 100% { opacity:1; transform:scale(1) } }
        @keyframes bgFloat { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-15px) } }
      `}</style>

      <div className="animate-blur-in -mx-5 -mt-2 sm:-mx-8 lg:-mx-14 lg:-mt-4 xl:-mx-20">

        {/* ─── COVER BANNER — Logo inside, photo overlaps ─── */}
        <div className="relative">
          {/* Banner area with logo */}
          <div className="relative overflow-hidden h-48 sm:h-52 lg:h-52 xl:h-56">
            {/* Background layers */}
            <div className="absolute inset-0 bg-linear-to-br from-[#020810] via-[#071a12] to-[#051020]" />
            <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse 80% 70% at 30% 80%, rgba(16,185,129,0.25) 0%, transparent 60%)' }} />
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 20%, rgba(56,189,248,0.15) 0%, transparent 55%)' }} />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
            />

            {/* Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full bg-emerald-400/50"
                style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacity, animation: `bgFloat ${p.duration}s ease-in-out ${p.delay}s infinite` }}
              />
            ))}

            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/3 to-transparent" style={{ animation: 'coverShimmer 6s ease-in-out infinite' }} />
            </div>

            {/* Centered Logo — top of banner, above photo overlap zone */}
            <div className="relative z-10 flex items-start justify-center pt-6 sm:pt-8 h-full lg:hidden">
              <Link href="/" className="flex items-center gap-3 group">
                <Image
                  src="/images/vfit-logo-white.svg"
                  alt="VFIT"
                  width={160}
                  height={32}
                  className="w-auto transition-transform duration-300 group-hover:scale-105"
                  style={{ height: '40px', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.7))' }}
                  priority
                />
              </Link>
            </div>

            {/* Bottom fade for smooth photo overlap */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-[#0b1120] to-transparent" />
          </div>

          {/* Profile section — photo overlaps banner */}
          <div className="relative z-10 px-5 sm:px-8 lg:px-14 xl:px-20 -mt-13 pb-4 lg:-mt-14 lg:pb-6">
            {personalInfo ? (
              <div className="flex items-end gap-4" style={{ animation: 'slideUp 0.6s ease-out' }}>
                {/* Photo — overlapping cover, vivid green */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-2.5 rounded-2xl bg-linear-to-br from-emerald-400/45 via-emerald-400/30 to-emerald-400/45 blur-xl opacity-90 animate-pulse" />
                  <div className="relative h-26 w-26 rounded-2xl bg-linear-to-br from-emerald-400 via-emerald-400 to-emerald-500 p-0.75 shadow-[0_0_50px_rgba(16,185,129,0.5)] ring-[3px] ring-[#0b1120]">
                    <div className="h-full w-full rounded-lg overflow-hidden bg-[#0a1628]">
                      {(() => {
                        const photoUrl = normalizePhotoUrl(personalInfo.personal_photo)
                        if (photoUrl && !photoFailed) {
                          return (
                            <img
                              src={photoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={() => setPhotoFailed(true)}
                            />
                          )
                        }
                        return (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-500/20 to-emerald-500/10">
                            <span className="text-2xl font-black text-emerald-400">
                              {personalInfo.personal_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  {personalInfo.personal_cref_verified && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 shadow-lg shadow-emerald-500/50 ring-2 ring-[#0b1120]">
                      <DSIcon name="shieldCheck" size={14} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Info beside photo */}
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/70 mb-1" style={monoLabel}>
                    SEU PERSONAL TRAINER
                  </p>
                  <h2 className="text-xl font-black text-white leading-tight" style={headingFont}>
                    {shortName(personalInfo.personal_name)}
                  </h2>
                  {personalInfo.personal_cref && (
                    <p className="text-[12px] font-semibold text-emerald-400 mt-0.5">
                      CREF {personalInfo.personal_cref}/{personalInfo.personal_cref_state}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-0.5">Educador Físico</p>
                </div>
              </div>
            ) : inviteToken ? (
              /* Loading skeleton */
              <div className="flex items-end gap-4 animate-pulse">
                <div className="h-26 w-26 rounded-2xl bg-white/20 ring-[3px] ring-[#0b1120]" />
                <div className="space-y-1.5 pb-0.5 flex-1">
                  <div className="h-2.5 w-20 rounded bg-white/20" />
                  <div className="h-4 w-32 rounded bg-white/20" />
                  <div className="h-2.5 w-28 rounded bg-white/5" />
                </div>
              </div>
            ) : (
              /* No invite — generic header */
              <div style={{ animation: 'slideUp 0.6s ease-out' }} className="pt-12">
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-primary/70 mb-1" style={monoLabel}>
                  CADASTRO ALUNO
                </p>
                <h2 className="text-2xl font-black text-white leading-tight" style={headingFont}>
                  Comece sua jornada
                </h2>
                <p className="text-[13px] text-zinc-500 mt-1">
                  Acesse treinos personalizados, acompanhe sua evolução e alcance seus objetivos.
                </p>
              </div>
            )}

            {/* Specialties + invite badge (below profile row) */}
            {personalInfo && (
              <div className="mt-2.5" style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>
                {personalInfo.personal_specialties && personalInfo.personal_specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {personalInfo.personal_specialties.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase" style={monoLabel}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {inviteToken && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[11px] font-semibold text-emerald-400/90">
                      Convite detectado — vinculação automática com seu personal
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── FORM AREA ─── */}
        <div className="px-5 sm:px-8 lg:px-14 xl:px-20">

          {/* ═══════════════ GOOGLE OAUTH — Opção rápida ═══════════════ */}
          <div style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="mb-4">
              <h3 className="text-lg font-black text-white" style={headingFont}>
                Crie sua conta
              </h3>
              <p className="text-[13px] text-zinc-500 mt-1">
                Cadastro rápido com Google ou email e senha.
              </p>
            </div>

            {/* Google OAuth button — prominent */}
            <OAuthButtons userType="student" invitationToken={inviteToken || undefined} />

            <AuthDivider />
          </div>

          {/* ═══════════════ EMAIL + SENHA ═══════════════ */}
          <form onSubmit={handleSubmit} style={{ animation: 'slideUp 0.5s ease-out' }}>
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                  <DSIcon name="user" size={12} className="text-zinc-500" /> NOME COMPLETO
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  autoComplete="name"
                  required
                  autoFocus
                  className={inputNormal}
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
                  className={inputNormal}
                />
              </div>

              {/* CPF — obrigatório quando vem do onboarding com plano */}
              {requireCpf && (
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-400 mb-2" style={monoLabel}>
                    <DSIcon name="shield" size={12} className="text-zinc-500" /> CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
                      const formatted = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                      updateField('cpf', formatted)
                      cpfValidation.setTouched(true)
                    }}
                    onBlur={cpfValidation.handleBlur}
                    inputMode="numeric"
                    maxLength={14}
                    autoComplete="off"
                    className={`${inputNormal} ${
                      cpfValidation.touched && cpfValidation.hasError
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-400/25'
                        : cpfValidation.touched && cpfValidation.isValid
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-400/25'
                        : ''
                    }`}
                  />
                  {cpfValidation.touched && cpfValidation.hasError ? (
                    <p className="mt-1.5 text-[10px] text-red-500">
                      {cpfValidation.errorMessage}
                    </p>
                  ) : cpfValidation.touched && cpfValidation.isValid ? (
                    <p className="mt-1.5 text-[10px] text-emerald-500">
                      CPF validado ✓
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-zinc-500">
                      Necessário para gerar o pagamento via PIX
                    </p>
                  )}
                </div>
              )}

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
                    className={`${inputNormal} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-lg"
                    tabIndex={-1}
                  >
                    {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          form.password.length >= lvl * 3
                            ? form.password.length >= 12 ? 'bg-emerald-400' : form.password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/6 bg-white/2 p-3 transition-colors hover:border-emerald-500/20 hover:bg-emerald-500/3">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-4.5 w-4.5 rounded-md border border-zinc-700 bg-zinc-900 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all duration-200 flex items-center justify-center">
                    {acceptedTerms && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] leading-relaxed text-zinc-500">
                  Li e aceito os{' '}
                  <Link href="/termos" target="_blank" className="font-bold text-emerald-400 hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" className="font-bold text-emerald-400 hover:underline">Política de Privacidade</Link>
                </span>
              </label>

              {/* Turnstile — invisible-first, fallback to interactive */}
              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

              {/* Submit — 3D button */}
              <Button
                type="submit"
                size="lg"
                disabled={!formValid}
                loading={register.isPending}
                className="w-full uppercase tracking-wider font-black"
              >
                <DSIcon name="sparkles" size={16} />
                {requireCpf ? 'CRIAR CONTA E ASSINAR' : 'CRIAR CONTA E ENTRAR'}
                <DSIcon name="arrowRight" size={16} />
              </Button>

              {/* Error */}
              {register.isError && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/6 px-4 py-3">
                  <DSIcon name="alertCircle" size={16} className="text-red-400 shrink-0" />
                  <p className="text-[12px] font-medium text-red-400">
                    {register.error instanceof ApiClientError ? register.error.message : 'Erro ao criar conta. Tente novamente.'}
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 mb-4 flex items-center justify-between">
            <p className="text-[13px] text-zinc-500">
              Já tem conta?{' '}
              <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Entrar
              </Link>
            </p>
            <span className="flex items-center gap-1.5 text-[9px] text-zinc-700" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
            </span>
          </div>
        </div>
      </div>
    </GuestGuard>
  )
}

/**
 * src/app/p/page.tsx
 *
 * /p/* — Perfil público do Personal Trainer
 *
 * Exports: PersonalProfilePage
 * Hooks: usePathname, useState, usePublicProfile, usePublicReviews, useRegisterStudent, useCpfLookup
 * Features: 'use client' · DSIcon
 */

// ============================================
// /p/* — Perfil público do Personal Trainer
// Static page — slug é extraído do pathname (SPA fallback)
// CF Pages redireciona /p/joao → /index.html via `/* /index.html 200`
// ============================================

'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DSIcon } from '@/components/ui/ds-icon'
import { usePublicProfile, usePublicReviews, type PublicReview } from '@/hooks/use-public-profile'
import { useRegisterStudent } from '@/hooks/use-auth'
import { useCpfLookup } from '@/hooks/use-cpf-lookup'
import { Turnstile } from '@/components/auth'
import { ApiClientError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

// ─── Design tokens ───
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
} as const

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.12em',
} as const

// ─── CPF helpers ───
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let m = digits
  if (digits.length > 3) m = digits.slice(0, 3) + '.' + digits.slice(3)
  if (digits.length > 6) m = m.slice(0, 7) + '.' + digits.slice(6)
  if (digits.length > 9) m = m.slice(0, 11) + '-' + digits.slice(9)
  return m
}

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[10]) !== check) return false

  return true
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ============================================
// Page Component
// ============================================

export default function PersonalProfilePage() {
  const pathname = usePathname()
  // Extract slug from /p/slug-value
  const slug = pathname?.replace(/^\/p\/?/, '') || ''

  const { data: profile, isLoading, isError } = usePublicProfile(slug)
  const { data: reviewsData } = usePublicReviews(profile?.id || '', { page: 1 })
  const [showForm, setShowForm] = useState(false)

  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page">
        <div className="text-center">
          <DSIcon name="dumbbell" size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-lg text-white/50">Perfil não encontrado</p>
          <Link href="/" className="mt-4 inline-block text-sm text-emerald-400 underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) return <ProfileSkeleton />

  if (isError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page">
        <div className="text-center">
          <DSIcon name="dumbbell" size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-lg text-white/50">Personal não encontrado</p>
          <Link href="/" className="mt-4 inline-block text-sm text-emerald-400 underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const reviews = reviewsData?.reviews || []

  return (
    <div className="min-h-screen bg-bg-page">
      {/* ─── Background gradient ─── */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-950/30 via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute left-1/2 top-0 h-150 w-200 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-12 pt-8">
        {/* ─── Profile Header ─── */}
        <div className="mb-8 text-center">
          {/* Avatar */}
          <div className="relative mx-auto mb-4 h-28 w-28">
            <div className="absolute -inset-1 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 opacity-60 blur-sm" />
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name}
                width={112}
                height={112}
                className="relative rounded-full border-2 border-emerald-500/30 object-cover"
              />
            ) : (
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-950">
                <DSIcon name="user" size={48} className="text-emerald-400" />
              </div>
            )}
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-page bg-emerald-500">
              <DSIcon name="checkCircle2" size={16} className="text-white" />
            </div>
          </div>

          {/* Name */}
          <h1 className="mb-1 text-2xl text-white" style={headingFont}>
            {profile.full_name}
          </h1>

          {/* CREF badge */}
          {profile.cref && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400" style={monoLabel}>
              <DSIcon name="award" size={12} />
              CREF {profile.cref}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/50">
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-white/40">
            {profile.city && (
              <span className="flex items-center gap-1">
                <DSIcon name="mapPin" size={14} />
                {profile.city}{profile.state ? `, ${profile.state}` : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DSIcon name="users" size={14} />
              {profile.total_students} alunos
            </span>
            {profile.average_rating > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <DSIcon name="star" size={14} className="fill-current" />
                {profile.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* ─── Social Links ─── */}
        {profile.social_links && (
          <div className="mb-6 flex justify-center gap-3">
            {profile.social_links.instagram && (
              <a
                href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/6 bg-white/3 text-white/40 transition-all hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-400"
              >
                <DSIcon name="instagram" />
              </a>
            )}
            {profile.social_links.youtube && (
              <a
                href={profile.social_links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/6 bg-white/3 text-white/40 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <DSIcon name="youtube" />
              </a>
            )}
            {profile.social_links.whatsapp && (
              <a
                href={`https://wa.me/${profile.social_links.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/6 bg-white/3 text-white/40 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <DSIcon name="messageCircle" />
              </a>
            )}
          </div>
        )}

        {/* ─── Specialties ─── */}
        {profile.specialties.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {profile.specialties.map((s) => (
              <span key={s} className="rounded-full border border-white/6 bg-white/3 px-3 py-1 text-xs text-white/50">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ─── CTA Button ─── */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="group relative mx-auto flex w-full max-w-xs items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <DSIcon name="sparkles" />
            Começar agora
            <DSIcon name="arrowRight" className="transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        )}

        {/* ─── Registration Form ─── */}
        {showForm && <RegisterForm personalId={profile.id} slug={slug} />}

        {/* ─── Reviews Section ─── */}
        {reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-center text-sm uppercase tracking-wider text-white/30" style={monoLabel}>
              Avaliações
            </h2>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/20 transition-colors hover:text-white/40">
            <DSIcon name="dumbbell" size={12} />
            VFIT
          </Link>
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/3 px-3 py-1 text-[10px] text-white/20">
              <DSIcon name="shield" size={10} />
              SSL · LGPD
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Register Form
// ============================================

function RegisterForm({ slug }: { personalId: string; slug: string }) {
  const [form, setForm] = useState({
    cpf: '',
    birth_date: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [nameFromApi, setNameFromApi] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [formError, setFormError] = useState('')

  const register = useRegisterStudent()
  const cpfLookup = useCpfLookup()

  const cpfDigits = form.cpf.replace(/\D/g, '')
  const cpfValid = cpfDigits.length === 11 && validateCpf(form.cpf)
  const birthDateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(form.birth_date)

  // Auto-lookup when CPF is valid (birth_date comes from API)
  const tryLookup = () => {
    if (!cpfValid) return
    if (cpfLookup.isPending) return

    cpfLookup.mutate(
      { cpf: form.cpf },
      {
        onSuccess: (data) => {
          if (data.found && data.full_name) {
            setForm((prev) => ({ ...prev, full_name: data.full_name! }))
            setNameFromApi(true)
          }
          // Auto-fill birth date from Receita Federal
          if (data.birth_date && !form.birth_date) {
            setForm((prev) => ({ ...prev, birth_date: data.birth_date! }))
          }
        },
      },
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!cpfValid) {
      setFormError('CPF inválido')
      return
    }
    if (!form.full_name.trim() || form.full_name.trim().split(/\s+/).length < 2) {
      setFormError('Digite seu nome completo (nome e sobrenome)')
      return
    }
    if (!form.email.includes('@')) {
      setFormError('Email inválido')
      return
    }
    if (form.password.length < 6) {
      setFormError('Senha deve ter pelo menos 6 caracteres')
      return
    }
    if (form.password !== form.confirmPassword) {
      setFormError('As senhas não coincidem')
      return
    }
    if (!acceptTerms) {
      setFormError('Aceite os termos para continuar')
      return
    }
    if (!turnstileToken) {
      setFormError('Aguarde a verificação de segurança')
      return
    }

    register.mutate({
      email: form.email,
      password: form.password,
      full_name: form.full_name.trim(),
      cpf: cpfDigits,
      phone: form.phone.replace(/\D/g, '') || undefined,
      referral_slug: slug,
      turnstile_token: turnstileToken,
    })
  }

  const inputBase =
    'w-full rounded-xl border border-white/6 bg-white/3 px-4 py-3 pl-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/40 focus:bg-white/5 focus:ring-1 focus:ring-emerald-500/20'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ─── LGPD Badge ─── */}
      <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/3 p-3">
        <div className="flex items-start gap-2.5">
          <DSIcon name="shieldCheck" size={16} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-emerald-400" style={monoLabel}>
              PROTEÇÃO LGPD
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
              Seus dados são processados de forma segura no servidor e nunca armazenados em cache.
              Apenas o nome é utilizado para o cadastro.
            </p>
          </div>
        </div>
      </div>

      {/* ─── CPF ─── */}
      <div className="relative">
        <DSIcon name="fingerprint" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          inputMode="numeric"
          placeholder="CPF"
          aria-label="CPF"
          data-testid="register-cpf"
          value={form.cpf}
          onChange={(e) => {
            setForm({ ...form, cpf: maskCpf(e.target.value) })
            setNameFromApi(false)
          }}
          onBlur={tryLookup}
          className={cn(inputBase, cpfValid && 'border-emerald-500/30')}
        />
        {cpfLookup.isPending && (
          <DSIcon name="loader" size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-emerald-400" />
        )}
        {cpfValid && !cpfLookup.isPending && (
          <DSIcon name="checkCircle2" size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
        )}
      </div>

      {cpfLookup.isSuccess && !cpfLookup.data?.found && (
        <p className="-mt-2 text-[11px] text-amber-400/70">
          CPF não encontrado na base — preencha o nome manualmente
        </p>
      )}

      {/* ─── Full Name ─── */}
      <div className="relative">
        <DSIcon name="user" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          placeholder="Nome completo"
          aria-label="Nome completo"
          data-testid="register-fullname"
          value={form.full_name}
          onChange={(e) => {
            setForm({ ...form, full_name: e.target.value })
            setNameFromApi(false)
          }}
          readOnly={nameFromApi}
          className={cn(
            inputBase,
            nameFromApi && 'cursor-default border-emerald-500/20 bg-emerald-500/3 text-emerald-200',
          )}
        />
        {nameFromApi && (
          <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400" style={monoLabel}>
              <DSIcon name="checkCircle2" size={12} />
              VERIFICADO
            </span>
            <button
              type="button"
              onClick={() => setNameFromApi(false)}
              className="text-[10px] text-white/30 underline hover:text-white/50"
            >
              Editar
            </button>
          </div>
        )}
      </div>

      {/* ─── Email ─── */}
      <div className="relative">
        <DSIcon name="mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          data-testid="register-email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputBase}
        />
      </div>

      {/* ─── Phone (WhatsApp) ─── */}
      <div className="relative">
        <DSIcon name="phone" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="tel"
          inputMode="numeric"
          placeholder="WhatsApp (opcional)"
          aria-label="WhatsApp"
          data-testid="register-phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
          className={inputBase}
        />
      </div>

      {/* ─── Password ─── */}
      <div className="relative">
        <DSIcon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          aria-label="Senha"
          data-testid="register-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={inputBase}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
        >
          {showPassword ? <DSIcon name="eyeOff" size={16} /> : <DSIcon name="eye" size={16} />}
        </button>
      </div>

      {/* ─── Confirm Password ─── */}
      <div className="relative">
        <DSIcon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirmar senha"
          aria-label="Confirmar senha"
          data-testid="register-confirm-password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className={cn(
            inputBase,
            form.confirmPassword && form.confirmPassword === form.password && 'border-emerald-500/30',
          )}
        />
      </div>

      {/* ─── Terms ─── */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 accent-emerald-500"
        />
        <span className="text-xs leading-relaxed text-white/40">
          Aceito os{' '}
          <Link href="/termos" className="text-emerald-400 underline">
            termos de uso
          </Link>{' '}
          e{' '}
          <Link href="/privacidade" className="text-emerald-400 underline">
            política de privacidade
          </Link>
        </span>
      </label>

      {/* Turnstile — invisible-first, fallback to interactive */}
      <Turnstile
        onVerify={(token: string) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken('')}
        onError={() => setTurnstileToken('')}
      />

      {/* ─── Error ─── */}
      {(formError || register.error) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
          {formError || (register.error instanceof ApiClientError ? register.error.message : 'Erro ao criar conta')}
        </div>
      )}

      {/* ─── Submit ─── */}
      <button
        type="submit"
        aria-label="Criar minha conta"
        data-testid="register-submit"
        disabled={register.isPending}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
      >
        {register.isPending ? (
          <DSIcon name="loader" className="animate-spin" />
        ) : (
          <>
            <DSIcon name="sparkles" size={16} />
            Criar minha conta
            <DSIcon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </button>

      {/* ─── Login link ─── */}
      <p className="text-center text-xs text-white/30">
        Já tem conta?{' '}
        <Link href="/login" className="text-emerald-400 underline">
          Fazer login
        </Link>
      </p>
    </form>
  )
}

// ============================================
// Review Card
// ============================================

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/2 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">{review.student_name}</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <DSIcon
              key={i}
              name="star"
              size={12}
              className={cn(
                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/10',
              )}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-xs leading-relaxed text-white/40">{review.comment}</p>
      )}
    </div>
  )
}

// ============================================
// Skeleton
// ============================================

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="mx-auto max-w-lg px-4 pt-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-28 w-28 animate-pulse rounded-full bg-white/4" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/4" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/4" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-white/4" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-white/4" />
          <div className="mx-auto h-4 w-32 animate-pulse rounded bg-white/4" />
          <div className="mx-auto h-16 w-full max-w-xs animate-pulse rounded-xl bg-white/4" />
          <div className="flex justify-center gap-3">
            <div className="h-14 w-28 animate-pulse rounded-xl bg-white/4" />
            <div className="h-14 w-28 animate-pulse rounded-xl bg-white/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

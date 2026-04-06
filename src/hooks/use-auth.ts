/**
 * src/hooks/use-auth.ts
 *
 * Auth Hooks — TanStack Query mutations + helpers
 *
 * Exports: useLogin, useRegisterPersonal, useRegisterStudent, useForgotPassword, useResetPassword
 * Hooks: useMutation, useRouter, useAuthStore, useLogin, useRegisterPersonal, useRegisterStudent
 * Features: Auth: useAuthStore · 'use client' · React Query
 */

// ============================================
// Auth Hooks — TanStack Query mutations + helpers
// ============================================

'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api, ApiClientError } from '@/lib/api-client'
import { useAuthStore, type User, type PersonalProfile, type StudentProfile, type AuthTokens } from '@/stores/auth-store'
import { toast } from '@/stores/app-store'
import { trackLandingEvent } from '@/lib/landing-analytics'

// ============================================
// Types (API responses)
// ============================================

interface ApiAuthUser {
  id: string
  email: string
  full_name: string
  user_type: 'personal' | 'student' | 'admin'
  role?: 'user' | 'admin' | 'super_admin' | null
  profile_photo_url?: string | null
  avatar_url?: string | null
  phone?: string | null
  created_at?: string
}

function normalizeAuthUser(user: ApiAuthUser): User {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    role: user.role || 'user',
    avatar_url: user.avatar_url ?? user.profile_photo_url ?? null,
    phone: user.phone ?? null,
    created_at: user.created_at || new Date().toISOString(),
  }
}

interface LoginResponse {
  user: ApiAuthUser
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
  session_id: string
  personal?: PersonalProfile
  student?: StudentProfile
}

interface RegisterResponse {
  user: ApiAuthUser
  tokens?: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
  session_id?: string
  personal?: PersonalProfile
  student?: StudentProfile
  message?: string
}

interface MessageResponse {
  message: string
}

// ============================================
// useLogin
// ============================================

export function useLogin(options?: { onError?: (error: Error) => void }) {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: async (data: {
      identifier: string
      password: string
      two_factor_code?: string
      turnstile_token: string
    }) => {
      const res = await api.post<LoginResponse>('/api/v1/auth/login', data, { auth: false })
      return res.data
    },
    onSuccess: (data) => {
      const tokens: AuthTokens = {
        access_token: data.tokens.access_token,
        refresh_token: data.tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.tokens.expires_in,
      }
      const normalizedUser = normalizeAuthUser(data.user)
      const profile = normalizedUser.user_type === 'personal'
        ? data.personal
        : data.student
      login({ user: normalizedUser, tokens, profile })
      toast.success('Login realizado com sucesso!')

      // Se veio do onboarding com plano selecionado → checkout
      const selectedPlan = typeof window !== 'undefined'
        ? sessionStorage.getItem('vfit_selected_plan')
        : null

      let dest: string
      if (selectedPlan && selectedPlan !== 'free' && normalizedUser.user_type === 'student') {
        dest = '/perfil/assinatura'
      } else if (normalizedUser.user_type === 'admin') {
        dest = '/dashboard/admin'
      } else if (normalizedUser.user_type === 'student') {
        dest = '/treinos'
      } else {
        dest = '/dashboard'
      }
      router.push(dest)
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Erro ao fazer login'
      toast.error('Falha no login', msg)
      options?.onError?.(error)
    },
  })
}

// ============================================
// useRegisterPersonal
// ============================================

export function useRegisterPersonal() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: {
      email: string
      password: string
      full_name: string
      cpf: string
      phone?: string
      cref: string
      cref_state: string
      specialties?: string[]
      referral_code?: string
      turnstile_token: string
    }) => {
      const res = await api.post<RegisterResponse>('/api/v1/auth/register/personal', data, { auth: false })
      return res.data
    },
    onSuccess: () => {
      trackLandingEvent('lp_register_complete', { user_type: 'personal' })
      toast.success('Conta criada!', 'Verifique seu email para ativar sua conta.')
      router.push('/login?registered=true')
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Erro ao criar conta'
      toast.error('Falha no cadastro', msg)
    },
  })
}

// ============================================
// useRegisterStudent
// ============================================

export function useRegisterStudent() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  return useMutation({
    mutationFn: async (data: {
      email: string
      password: string
      full_name: string
      cpf: string
      phone?: string
      invitation_token?: string
      referral_slug?: string
      turnstile_token: string
    }) => {
      const res = await api.post<RegisterResponse>('/api/v1/auth/register/student', data, { auth: false })
      return res.data
    },
    onSuccess: (data) => {
      trackLandingEvent('lp_register_complete', { user_type: 'student' })
      if (data.tokens) {
        // Auto-login com os tokens retornados
        const tokens: AuthTokens = {
          access_token: data.tokens.access_token,
          refresh_token: data.tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + data.tokens.expires_in,
        }
        login({ user: normalizeAuthUser(data.user), tokens, profile: data.student })
        toast.success('Conta criada com sucesso!', 'Bem-vindo ao VFIT!')
        // Se veio do onboarding com plano → checkout
        const selectedPlan = typeof window !== 'undefined'
          ? sessionStorage.getItem('vfit_selected_plan')
          : null
        router.push(selectedPlan && selectedPlan !== 'free' ? '/perfil/assinatura' : '/treinos')
      } else {
        toast.success('Conta criada!', 'Faça login para acessar seus treinos.')
        router.push('/login?registered=true')
      }
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Erro ao criar conta'
      toast.error('Falha no cadastro', msg)
    },
  })
}

// ============================================
// useForgotPassword
// ============================================

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: {
      email: string
      turnstile_token: string
    }) => {
      const res = await api.post<MessageResponse>('/api/v1/auth/forgot-password', data, { auth: false })
      return res.data
    },
    onSuccess: () => {
      toast.success('Email enviado!', 'Verifique sua caixa de entrada para redefinir a senha.')
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Erro ao enviar email'
      toast.error('Falha', msg)
    },
  })
}

// ============================================
// useResetPassword
// ============================================

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: {
      token?: string
      email?: string
      code?: string
      password: string
    }) => {
      const res = await api.post<MessageResponse>('/api/v1/auth/reset-password', data, { auth: false })
      return res.data
    },
    onSuccess: () => {
      toast.success('Senha redefinida!', 'Faça login com sua nova senha.')
      router.push('/login?reset=true')
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Erro ao redefinir senha'
      toast.error('Falha', msg)
    },
  })
}

// ============================================
// useVerifyEmail
// ============================================

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await api.post<MessageResponse>('/api/v1/auth/verify-email', data, { auth: false })
      return res.data
    },
    onSuccess: () => {
      toast.success('Email verificado!', 'Sua conta está ativa.')
    },
    onError: (error: Error) => {
      const msg = error instanceof ApiClientError
        ? error.message
        : 'Token inválido ou expirado'
      toast.error('Falha na verificação', msg)
    },
  })
}

// ============================================
// useLogout
// ============================================

export function useLogout() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: async () => {
      await api.post('/api/v1/auth/logout').catch(() => {})
    },
    onSettled: () => {
      logout()
      router.push('/login')
    },
  })
}

// ============================================
// useOAuthRedirect
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

export function useOAuthRedirect() {
  return useMutation({
    mutationFn: async (provider: 'google') => {
      // Direct redirect to backend OAuth endpoint (GET-based redirect flow)
      window.location.href = `${API_BASE}/api/v1/auth/oauth/${provider}`
      // Never resolves — page navigates away
      return new Promise<never>(() => {})
    },
    onError: () => {
      toast.error('Erro', 'Não foi possível iniciar autenticação OAuth.')
    },
  })
}

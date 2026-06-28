/**
 * src/app/auth/callback/page.tsx
 *
 * OAuth Callback Page
 *
 * Exports: OAuthCallbackPage
 * Hooks: useEffect, useRef, useSearchParams, useRouter, useAuthStore
 * Features: Auth: useAuthStore · 'use client'
 */

// ============================================
// OAuth Callback Page
// Receives tokens from backend redirect after Google OAuth
// Stores tokens → fetches /auth/me → redirects to dashboard
// ============================================

'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthStore, type AuthTokens, type PersonalProfile, type StudentProfile } from '@/stores/auth-store'
import { BrandLoader } from '@/components/ui/brand-loader'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const processed = useRef(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (processed.current) return
    processed.current = true

    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const errorParam = searchParams.get('error')

    if (errorParam || !accessToken || !refreshToken) {
      router.replace('/login?error=oauth_failed')
      return
    }

    async function completeOAuth() {
      try {
        // 1. Fetch user profile using the OAuth tokens
        const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await res.json() as {
          data: {
            user: {
              id: string
              email: string
              full_name: string
              user_type: 'personal' | 'student' | 'admin'
              role: 'user' | 'admin' | 'super_admin'
              profile_photo_url: string | null
              phone: string | null
              created_at: string
            }
            profile: Record<string, unknown> | null
          }
        }

        const { user, profile } = data.data

        // 2. Build tokens object
        const tokens: AuthTokens = {
          access_token: accessToken!,
          refresh_token: refreshToken!,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1h
        }

        // 3. Map user to store format
        const storeUser = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
          role: user.role || ('user' as const),
          avatar_url: user.profile_photo_url,
          phone: user.phone,
          created_at: user.created_at,
        }

        // 4. Map profile
        let personalProfile: PersonalProfile | undefined
        let studentProfile: StudentProfile | undefined

        if (profile && (user.user_type === 'personal' || user.user_type === 'admin')) {
          personalProfile = {
            slug: (profile as Record<string, unknown>).public_url_slug as string || '',
            cref: (profile as Record<string, unknown>).cref as string | null,
            specialties: ((profile as Record<string, unknown>).specialties as string[]) || [],
            plan_type: ((profile as Record<string, unknown>).subscription_plan as 'trial' | 'pro' | 'max') || 'trial',
            plan_expires_at: (profile as Record<string, unknown>).trial_ends_at as string | null,
            total_students: ((profile as Record<string, unknown>).total_students as number) || 0,
            average_rating: 0,
          }
        } else if (profile && user.user_type === 'student') {
          studentProfile = {
            personal_id: (profile as Record<string, unknown>).personal_id as string,
            personal_name: '',
            status: ((profile as Record<string, unknown>).status as 'active' | 'inactive' | 'pending') || 'active',
            fitness_level: (profile as Record<string, unknown>).fitness_level as string | null,
            goals: ((profile as Record<string, unknown>).goals as string[]) || [],
          }
        }

        // 5. Store auth state
        const loginProfile = personalProfile || studentProfile
        useAuthStore.getState().login({
          user: storeUser,
          tokens,
          profile: loginProfile,
        })

        // 6. Check if new user needs to complete profile
        const isNew = searchParams.get('is_new') === '1'
        const needsCompletion = searchParams.get('needs_completion') === '1'

        // Student → B2C (/treinos), personal/admin → B2B (/dashboard)
        let dest = user.user_type === 'student' ? '/treinos' : '/dashboard'
        if (needsCompletion || isNew) {
          dest = user.user_type === 'student' ? '/welcome' : '/dashboard/complete-profile'
        }

        // Se aluno veio do onboarding com plano pago → redirecionar para checkout
        if (user.user_type === 'student') {
          const pendingPlan = typeof window !== 'undefined'
            ? localStorage.getItem('vfit_selected_plan')
            : null
          if (pendingPlan && pendingPlan !== 'free') {
            dest = '/perfil/assinatura'
          }
        }

        router.replace(dest)
      } catch (err) {
        console.error('[OAuth Callback] Error:', err)
        router.replace('/login?error=oauth_failed')
      }
    }

    completeOAuth()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandLoader variant="inline" size={48} />
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Autenticando...</h2>
          <p className="mt-1 text-sm text-text-muted">Aguarde enquanto conectamos sua conta</p>
        </div>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-primary">
          <BrandLoader variant="inline" size={48} />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}

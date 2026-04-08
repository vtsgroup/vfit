/**
 * src/stores/auth-store.ts
 *
 * Zustand v5 store para autenticação frontend.
 *
 * O que faz:
 *  - Persiste user, tokens, profiles em localStorage
 *  - Gerencia login/logout/refresh/hydrate
 *  - isHydrated guard obrigatório para useQuery.enabled
 *
 * Exports principais:
 *  - useAuthStore — hook Zustand (user, isAuthenticated, isHydrated, login, logout)
 *  - User, PersonalProfile, StudentProfile (interfaces)
 *  - UserType ('personal' | 'student' | 'admin')
 *
 * ⚠️ Sem isHydrated → request sem token → 401 → demo mode
 */

// ============================================
// Auth Store — Zustand v5
// Gerencia estado de autenticação no frontend
// ============================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================
// Types
// ============================================

export type UserType = 'personal' | 'student' | 'nutritionist' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  user_type: UserType
  role: 'user' | 'admin' | 'super_admin'
  avatar_url: string | null
  phone: string | null
  created_at: string
}

export interface PersonalProfile {
  slug: string
  cref: string | null
  specialties: string[]
  plan_type: 'trial' | 'pro' | 'profissional' | 'max'
  plan_expires_at: string | null
  total_students: number
  average_rating: number
}

export interface StudentProfile {
  personal_id: string
  personal_name: string
  status: 'active' | 'inactive' | 'pending'
  fitness_level: string | null
  goals: string[]
}

export interface NutritionistProfile {
  slug: string
  crn: string | null
  specialties: string[]
  plan_type: 'trial' | 'pro' | 'profissional' | 'max'
  plan_expires_at: string | null
  total_patients: number
  average_rating: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number // Unix timestamp
}

interface AuthState {
  // State
  user: User | null
  personalProfile: PersonalProfile | null
  studentProfile: StudentProfile | null
  nutritionistProfile: NutritionistProfile | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrated: boolean
  /** true após AuthProvider validar a sessão via /auth/me (ou constatar que não há sessão) */
  isSessionReady: boolean

  // Actions
  setUser: (user: User) => void
  setPersonalProfile: (profile: PersonalProfile) => void
  setStudentProfile: (profile: StudentProfile) => void
  setNutritionistProfile: (profile: NutritionistProfile) => void
  setTokens: (tokens: AuthTokens) => void
  login: (data: { user: User; tokens: AuthTokens; profile?: PersonalProfile | StudentProfile | NutritionistProfile }) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setHydrated: () => void
  setSessionReady: () => void

  // Computed helpers
  isPersonal: () => boolean
  isStudent: () => boolean
  isNutritionist: () => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  isTokenExpired: () => boolean
  getAccessToken: () => string | null
}

// ============================================
// Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      personalProfile: null,
      studentProfile: null,
      nutritionistProfile: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
      isSessionReady: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),

      setPersonalProfile: (profile) => set({ personalProfile: profile }),

      setStudentProfile: (profile) => set({ studentProfile: profile }),

      setNutritionistProfile: (profile) => set({ nutritionistProfile: profile }),

      setTokens: (tokens) => set({ tokens }),

      login: ({ user, tokens, profile }) => {
        const state: Partial<AuthState> = {
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }
        if (user.user_type === 'personal' && profile) {
          state.personalProfile = profile as PersonalProfile
          state.studentProfile = null
          state.nutritionistProfile = null
        } else if (user.user_type === 'student' && profile) {
          state.studentProfile = profile as StudentProfile
          state.personalProfile = null
          state.nutritionistProfile = null
        } else if (user.user_type === 'nutritionist' && profile) {
          state.nutritionistProfile = profile as NutritionistProfile
          state.personalProfile = null
          state.studentProfile = null
        }
        set(state)
      },

      logout: () =>
        set({
          user: null,
          personalProfile: null,
          studentProfile: null,
          nutritionistProfile: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setHydrated: () => set({ isHydrated: true, isLoading: false }),

      setSessionReady: () => set({ isSessionReady: true }),

      // Computed helpers
      isPersonal: () => get().user?.user_type === 'personal',
      isStudent: () => get().user?.user_type === 'student',
      isNutritionist: () => get().user?.user_type === 'nutritionist',
      isAdmin: () => {
        const u = get().user
        return u?.user_type === 'admin' || u?.role === 'admin' || u?.role === 'super_admin'
      },
      isSuperAdmin: () => get().user?.role === 'super_admin',

      isTokenExpired: () => {
        const tokens = get().tokens
        if (!tokens) return true
        return Date.now() >= tokens.expires_at * 1000
      },

      getAccessToken: () => {
        const state = get()
        if (!state.tokens || state.isTokenExpired()) return null
        return state.tokens.access_token
      },
    }),
    {
      name: 'vfit-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR fallback
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }

        // Protege contra JSON corrompido e ambientes onde localStorage falha
        // (Safari private mode / quota / policy). Isso evita crash na carga.
        return {
          getItem: (name: string) => {
            try {
              const raw = window.localStorage.getItem(name)
              if (!raw) return null
              // valida JSON para evitar crash no JSON.parse interno do createJSONStorage
              JSON.parse(raw)
              return raw
            } catch {
              try {
                window.localStorage.removeItem(name)
              } catch {
                // ignore
              }
              return null
            }
          },
          setItem: (name: string, value: string) => {
            try {
              window.localStorage.setItem(name, value)
            } catch {
              // best-effort
            }
          },
          removeItem: (name: string) => {
            try {
              window.localStorage.removeItem(name)
            } catch {
              // ignore
            }
          },
        }
      }),
      partialize: (state) => ({
        user: state.user,
        personalProfile: state.personalProfile,
        studentProfile: state.studentProfile,
        nutritionistProfile: state.nutritionistProfile,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)

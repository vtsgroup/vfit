/**
 * src/lib/mock-api.ts
 *
 * Mock API — Intercepta chamadas quando backend offline
 *
 * Exports: isNetworkError
 */

// ============================================
// Mock API — Intercepta chamadas quando backend offline
// Retorna dados demo com delay simulado
// ============================================

import type { ApiResponse } from './api-client'
import {
  DEMO_CREDENTIALS,
  DEMO_PERSONAL,
  DEMO_PERSONAL_PROFILE,
  DEMO_PERSONAL_STATS,
  DEMO_PAYMENT_STATS,
  DEMO_PAYMENTS,
  DEMO_STUDENTS,
  DEMO_WORKOUTS,
  DEMO_EXERCISES,
  DEMO_MUSCLE_GROUPS,
  DEMO_ASSESSMENTS,
  DEMO_NOTIFICATIONS,
} from './mock-data'

// ============================================
// Helper — simula latência de rede
// ============================================

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200))
}

function ok<T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return { success: true, data, meta }
}

// ============================================
// Demo state — Calendar (in-memory)
// ============================================

type DemoCalendarEvent = {
  id: string
  personal_id: string
  student_id: string | null
  title: string | null
  notes: string | null
  meeting_url: string | null
  start_at: string
  end_at: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  status: 'available' | 'partial' | 'busy' | null
  created_at: string
  updated_at: string
  personal_name: string
  student_name: string | null
}

let DEMO_CALENDAR_EVENTS: DemoCalendarEvent[] = []

function seedDemoCalendarEvents() {
  if (DEMO_CALENDAR_EVENTS.length) return
  const now = new Date()
  const mk = (days: number, h1: number, h2: number) => {
    const d1 = new Date(now)
    d1.setDate(d1.getDate() + days)
    d1.setHours(h1, 0, 0, 0)
    const d2 = new Date(now)
    d2.setDate(d2.getDate() + days)
    d2.setHours(h2, 0, 0, 0)
    return { start_at: d1.toISOString(), end_at: d2.toISOString() }
  }

  DEMO_CALENDAR_EVENTS = [
    {
      id: 'demo-cal-1',
      personal_id: DEMO_PERSONAL.id,
      student_id: DEMO_STUDENTS[0]?.id ?? null,
      title: 'Sessão',
      notes: 'Treino A — técnica e força',
      meeting_url: null,
      ...mk(0, 10, 11),
      color: 'blue',
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      personal_name: DEMO_PERSONAL.full_name,
      student_name: DEMO_STUDENTS[0]?.full_name ?? null,
    },
  ]
}

// ============================================
// Route matcher
// ============================================

interface MockRoute {
  method: string
  pattern: RegExp
  handler: (match: RegExpMatchArray, body?: unknown) => ApiResponse | null
}

const routes: MockRoute[] = [
  // ──── AUTH ────
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/login$/,
    handler: (_match, body) => {
      const { email, password } = body as { email: string; password: string }
      const cred = DEMO_CREDENTIALS[email]
      if (!cred || cred.password !== password) {
        return null // will throw error
      }
      const isPersonal = cred.user.user_type === 'personal'
      return ok({
        user: cred.user,
        access_token: 'demo-access-token-' + Date.now(),
        refresh_token: 'demo-refresh-token-' + Date.now(),
        expires_in: 86400,
        ...(isPersonal ? { personal: cred.profile } : { student: cred.profile }),
      })
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/register\/(personal|student)$/,
    handler: (_match, body) => {
      const data = body as { full_name: string; email: string }
      return ok({
        user: {
          id: 'new-' + Date.now(),
          email: data.email,
          full_name: data.full_name,
          user_type: _match[1] as 'personal' | 'student',
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
        },
        message: 'Conta criada com sucesso! Em modo demo, faça login com personal@teste.com ou aluno@teste.com.',
      })
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/refresh$/,
    handler: () =>
      ok({
        access_token: 'demo-refreshed-' + Date.now(),
        refresh_token: 'demo-refresh-' + Date.now(),
        expires_in: 86400,
      }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/forgot-password$/,
    handler: () => ok({ message: '[Demo] Email de recuperação simulado.' }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/reset-password$/,
    handler: () => ok({ message: '[Demo] Senha redefinida com sucesso.' }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/verify-email$/,
    handler: () => ok({ message: '[Demo] Email verificado com sucesso.' }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/v1\/auth\/logout$/,
    handler: () => ok({ message: 'Logout realizado.' }),
  },

  // ──── PERSONAL STATS ────
  {
    method: 'GET',
    pattern: /^\/personals\/stats$/,
    handler: () => ok(DEMO_PERSONAL_STATS),
  },

  // ──── CALENDAR (AGENDA) ────
  {
    method: 'GET',
    pattern: /^\/calendar\/events$/,
    handler: () => {
      seedDemoCalendarEvents()
      return ok({ events: DEMO_CALENDAR_EVENTS })
    },
  },
  {
    method: 'POST',
    pattern: /^\/calendar\/events$/,
    handler: (_match, body) => {
      seedDemoCalendarEvents()
      const input = body as Partial<DemoCalendarEvent>

      const id = `demo-cal-${Date.now()}`
      const now = new Date().toISOString()

      const student = input.student_id ? DEMO_STUDENTS.find((s) => s.id === input.student_id) : null

      const event: DemoCalendarEvent = {
        id,
        personal_id: DEMO_PERSONAL.id,
        student_id: input.student_id ?? null,
        title: input.title ?? null,
        notes: input.notes ?? null,
        meeting_url: input.meeting_url ?? null,
        start_at: String(input.start_at || now),
        end_at: String(input.end_at || now),
        color: (input.color as DemoCalendarEvent['color']) || 'blue',
        status: (input.status as DemoCalendarEvent['status']) ?? 'available',
        created_at: now,
        updated_at: now,
        personal_name: DEMO_PERSONAL.full_name,
        student_name: student?.full_name ?? null,
      }

      DEMO_CALENDAR_EVENTS = [event, ...DEMO_CALENDAR_EVENTS]
      return ok({ event })
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/calendar\/events\/([^/]+)$/,
    handler: (match, body) => {
      seedDemoCalendarEvents()
      const id = match[1]
      const input = body as Partial<DemoCalendarEvent>

      const idx = DEMO_CALENDAR_EVENTS.findIndex((e) => e.id === id)
      if (idx < 0) return null

      const now = new Date().toISOString()
      const next = { ...DEMO_CALENDAR_EVENTS[idx], ...input, updated_at: now }
      if ('student_id' in input) {
        const student = input.student_id ? DEMO_STUDENTS.find((s) => s.id === input.student_id) : null
        next.student_name = student?.full_name ?? null
      }

      DEMO_CALENDAR_EVENTS[idx] = next
      return ok({ event: next })
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/calendar\/events\/([^/]+)$/,
    handler: (match) => {
      seedDemoCalendarEvents()
      const id = match[1]
      DEMO_CALENDAR_EVENTS = DEMO_CALENDAR_EVENTS.filter((e) => e.id !== id)
      return ok(null)
    },
  },
  {
    method: 'GET',
    pattern: /^\/personals\/me$/,
    handler: () =>
      ok({
        user: DEMO_PERSONAL,
        profile: DEMO_PERSONAL_PROFILE,
      }),
  },

  // ──── PAYMENTS ────
  {
    method: 'GET',
    pattern: /^\/payments\/stats$/,
    handler: () => ok(DEMO_PAYMENT_STATS),
  },
  {
    method: 'GET',
    pattern: /^\/payments\/([^/]+)$/,
    handler: (match) => {
      const payment = DEMO_PAYMENTS.find((p) => p.id === match[1])
      return payment ? ok({ payment }) : null
    },
  },
  {
    method: 'GET',
    pattern: /^\/payments/,
    handler: () =>
      ok(
        { payments: DEMO_PAYMENTS, meta: { total: DEMO_PAYMENTS.length } },
        { total: DEMO_PAYMENTS.length, page: 1, per_page: 20, total_pages: 1 }
      ),
  },
  {
    method: 'POST',
    pattern: /^\/payments$/,
    handler: (_match, body) => {
      const data = body as Record<string, unknown>
      return ok({
        payment: {
          id: 'pay-new-' + Date.now(),
          ...data,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      })
    },
  },

  // ──── STUDENTS ────
  {
    method: 'GET',
    pattern: /^\/students\/([^/?]+)$/,
    handler: (match) => {
      const student = DEMO_STUDENTS.find((s) => s.id === match[1])
      if (!student) return null
      return ok({
        student: {
          ...student,
          personal_id: 'demo-personal-001',
          fitness_level: 'intermediate',
          goals: ['Hipertrofia'],
          medical_restrictions: '',
          date_of_birth: '1995-03-15',
          gender: 'prefer_not_to_say',
          height_cm: 170,
          payment_status: 'paid',
        },
      })
    },
  },
  {
    method: 'GET',
    pattern: /^\/students/,
    handler: () =>
      ok(
        { students: DEMO_STUDENTS, meta: { total: DEMO_STUDENTS.length } },
        { total: DEMO_STUDENTS.length, page: 1, per_page: 20, total_pages: 1 }
      ),
  },
  {
    method: 'POST',
    pattern: /^\/students\/invite$/,
    handler: () => ok({ message: '[Demo] Convite enviado com sucesso.', invitation_token: 'demo-invite-' + Date.now() }),
  },
    {
      method: 'POST',
      pattern: /^\/students\/invite\/quick$/,
      handler: () => {
        const token = 'demo-quick-' + Date.now()
        return ok({
          invitation_token: token,
          invitation_url: `https://iapersonal.app.br/register/student?token=${token}`,
          email: null,
          full_name: null,
          personal_name: 'Demo Personal',
          email_sent: false,
          mode: 'qr',
          message: '[Demo] Convite rápido criado. Use o QR/link.',
        })
      },
    },
  {
    method: 'PATCH',
    pattern: /^\/students\/([^/]+)$/,
    handler: (match) => {
      const student = DEMO_STUDENTS.find((s) => s.id === match[1])
      return ok({ student: student || DEMO_STUDENTS[0] })
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/students\/([^/]+)\/user$/,
    handler: (match) => {
      const student = DEMO_STUDENTS.find((s) => s.id === match[1])
      return ok({ message: '[Demo] Perfil base atualizado.', student: student || DEMO_STUDENTS[0] })
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/students\/([^/]+)\/status$/,
    handler: (match) => {
      const student = DEMO_STUDENTS.find((s) => s.id === match[1])
      return ok({
        student_id: match[1],
        previous_status: student?.status || 'inactive',
        new_status: 'active',
      })
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/students\/([^/]+)$/,
    handler: () => ok({ message: 'Aluno removido.' }),
  },

  // ──── WORKOUTS ────
  {
    method: 'GET',
    pattern: /^\/workouts\/([^/?]+)$/,
    handler: (match) => {
      const workout = DEMO_WORKOUTS.find((w) => w.id === match[1])
      if (!workout) return null
      return ok({
        workout: {
          ...workout,
          exercises: DEMO_EXERCISES.slice(0, workout.exercises_count).map((ex, i) => ({
            ...ex,
            order: i + 1,
            sets: 3,
            reps: '10-12',
            rest_seconds: 60,
            notes: '',
          })),
        },
      })
    },
  },
  {
    method: 'GET',
    pattern: /^\/workouts/,
    handler: () =>
      ok(
        { workouts: DEMO_WORKOUTS, meta: { total: DEMO_WORKOUTS.length } },
        { total: DEMO_WORKOUTS.length, page: 1, per_page: 20, total_pages: 1 }
      ),
  },
  {
    method: 'POST',
    pattern: /^\/workouts/,
    handler: (_match, body) => {
      const data = body as Record<string, unknown>
      return ok({
        workout: {
          id: 'wk-new-' + Date.now(),
          ...data,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      })
    },
  },

  // ──── EXERCISES ────
  {
    method: 'GET',
    pattern: /^\/exercises/,
    handler: () => ok({ exercises: DEMO_EXERCISES }),
  },

  // ──── MUSCLE GROUPS ────
  {
    method: 'GET',
    pattern: /^\/muscle-groups/,
    handler: () => ok({ muscle_groups: DEMO_MUSCLE_GROUPS }),
  },

  // ──── TEMPLATES ────
  {
    method: 'GET',
    pattern: /^\/templates/,
    handler: () => ok({ templates: [] }),
  },

  // ──── ASSESSMENTS ────
  {
    method: 'GET',
    pattern: /^\/assessments\/([^/?]+)$/,
    handler: (match) => {
      const assess = DEMO_ASSESSMENTS.find((a) => a.id === match[1])
      return assess ? ok({ assessment: assess }) : null
    },
  },
  {
    method: 'GET',
    pattern: /^\/assessments/,
    handler: () =>
      ok(
        { assessments: DEMO_ASSESSMENTS, meta: { total: DEMO_ASSESSMENTS.length } },
        { total: DEMO_ASSESSMENTS.length, page: 1, per_page: 20, total_pages: 1 }
      ),
  },
  {
    method: 'POST',
    pattern: /^\/assessments/,
    handler: (_match, body) =>
      ok({ assessment: { id: 'assess-new-' + Date.now(), ...(body as Record<string, unknown>), created_at: new Date().toISOString() } }),
  },

  // ──── NOTIFICATIONS ────
  {
    method: 'GET',
    pattern: /^\/notifications\/preferences$/,
    handler: () =>
      ok({
        preferences: {
          id: 'notif-pref-demo',
          user_id: 'demo-user',
          in_app_enabled: true,
          push_enabled: true,
          email_enabled: true,
          workout_enabled: true,
          payment_enabled: true,
          student_enabled: true,
          assessment_enabled: true,
          marketing_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
  },
  {
    method: 'PATCH',
    pattern: /^\/notifications\/preferences$/,
    handler: (_match, body) =>
      ok({
        message: '[Demo] Preferências atualizadas',
        preferences: {
          id: 'notif-pref-demo',
          user_id: 'demo-user',
          in_app_enabled: true,
          push_enabled: true,
          email_enabled: true,
          workout_enabled: true,
          payment_enabled: true,
          student_enabled: true,
          assessment_enabled: true,
          marketing_enabled: false,
          ...(body as Record<string, unknown>),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
  },
  {
    method: 'GET',
    pattern: /^\/notifications\/unread-count$/,
    handler: () => ok({ unread_count: DEMO_NOTIFICATIONS.filter((n) => !n.read).length }),
  },
  {
    method: 'GET',
    pattern: /^\/notifications/,
    handler: () => ok({ notifications: DEMO_NOTIFICATIONS }),
  },

  // ──── AFFILIATES ────
  {
    method: 'GET',
    pattern: /^\/affiliates/,
    handler: () =>
      ok({
        referral_code: 'CARLOS2026',
        tier: 'gold',
        total_referrals: 5,
        active_referrals: 3,
        total_earned: 450.0,
        pending_amount: 75.0,
        commission_rate: 15,
        referrals: [],
        commissions: [],
      }),
  },

  // ──── PROFILE ────
  {
    method: 'GET',
    pattern: /^\/profile/,
    handler: () =>
      ok({
        user: DEMO_PERSONAL,
        profile: DEMO_PERSONAL_PROFILE,
        bio: 'Personal trainer especializado em hipertrofia e emagrecimento. 10+ anos de experiência.',
        social: { instagram: '@carlos.personal', youtube: '' },
        reviews: [],
        average_rating: 4.8,
        total_reviews: 23,
      }),
  },
]

// ============================================
// Mock API handler
// ============================================

export async function handleMockRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T> | null> {
  await delay()

  // Limpar query params para matching
  const path = endpoint.split('?')[0]

  for (const route of routes) {
    if (route.method !== method) continue
    const match = path.match(route.pattern)
    if (match) {
      const result = route.handler(match, body)
      if (result) return result as ApiResponse<T>
    }
  }

  // Rota não encontrada — retorna dados genéricos vazio
  console.warn(`[Mock API] No handler for ${method} ${endpoint}, returning empty`)
  return { success: true, data: {} as T }
}

// ============================================
// Check if error is network failure
// ============================================

export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message.includes('fetch')) return true
  if (err instanceof TypeError && err.message.includes('Failed to fetch')) return true
  if (err instanceof TypeError && err.message.includes('NetworkError')) return true
  if (err instanceof TypeError && err.message.includes('ERR_NAME_NOT_RESOLVED')) return true
  if (err instanceof TypeError && err.message.includes('Load failed')) return true
  return false
}

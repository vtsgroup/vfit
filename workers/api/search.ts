/**
 * workers/api/search.ts
 *
 * search.ts — Busca unificada para command palette (⌘K)
 * Features: DB: Neon
 */

// ============================================
// search.ts — Busca unificada para command palette (⌘K)
// ============================================
//
// O que faz:
//   Endpoint único de busca textual que consulta simultaneamente alunos,
//   treinos e pagamentos do personal autenticado. Retorna resultados
//   agrupados por categoria para a command palette do frontend.
//
// Exports principais:
//   searchRoutes — Hono app montado em /api/v1/search
//
// Auth: requireAuth (personal only)
// DB: students, workouts, payments (queries paralelas via Promise.all)
// ============================================

import { Hono } from 'hono'
import { z } from 'zod'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { pgQuery } from '@lib/db'
import { success } from '@lib/response'

const search = new Hono<AppContext>()

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(3).max(20).default(8),
})

search.use('*', authMiddleware)

search.get('/', async (c) => {
  const userId = c.get('userId')
  const userType = c.get('userType')
  const url = new URL(c.req.url)

  const parsed = searchQuerySchema.safeParse({
    q: url.searchParams.get('q') || '',
    limit: url.searchParams.get('limit') || undefined,
  })

  const quickActions = userType === 'personal'
    ? [
      { id: 'qa:new-student', type: 'action', title: 'Novo aluno', subtitle: 'Ir para convite rápido', href: '/dashboard/students/invite' },
      { id: 'qa:new-workout', type: 'action', title: 'Novo treino', subtitle: 'Criar treino', href: '/dashboard/workouts/create' },
      { id: 'qa:new-payment', type: 'action', title: 'Nova cobrança', subtitle: 'Abrir pagamentos', href: '/dashboard/payments' },
    ]
    : [
      { id: 'qa:my-workouts', type: 'action', title: 'Meus treinos', subtitle: 'Abrir execução', href: '/dashboard/workouts/execute' },
      { id: 'qa:my-payments', type: 'action', title: 'Minhas cobranças', subtitle: 'Ver pagamentos', href: '/dashboard/payments' },
      { id: 'qa:my-assessments', type: 'action', title: 'Minhas avaliações', subtitle: 'Ver evolução corporal', href: '/dashboard/assessments' },
    ]

  if (!parsed.success) {
    return success({
      query: '',
      sections: [],
      quick_actions: quickActions,
    })
  }

  const { q, limit } = parsed.data
  const like = `%${q}%`

  const sections: Array<{
    key: 'students' | 'workouts' | 'payments'
    label: string
    items: Array<{ id: string; type: string; title: string; subtitle: string; href: string; badge?: string }>
  }> = []

  if (userType === 'personal') {
    const { rows: students } = await pgQuery<{
      id: string
      full_name: string
      email: string
      status: string
    }>(
      c.env,
      `SELECT s.id, u.full_name, u.email, s.status
       FROM students s
       JOIN users u ON u.id = s.id
       WHERE s.personal_id = $1
         AND (u.full_name ILIKE $2 OR u.email ILIKE $2)
       ORDER BY u.full_name ASC
       LIMIT $3`,
      [userId, like, limit]
    )

    sections.push({
      key: 'students',
      label: 'Alunos',
      items: students.map((student) => ({
        id: student.id,
        type: 'student',
        title: student.full_name,
        subtitle: student.email,
        href: `/dashboard/students/${student.id}`,
        badge: student.status,
      })),
    })

    const { rows: workouts } = await pgQuery<{
      id: string
      name: string
      status: string
    }>(
      c.env,
      `SELECT id, name, status
       FROM workouts
       WHERE personal_id = $1
         AND name ILIKE $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, like, limit]
    )

    sections.push({
      key: 'workouts',
      label: 'Treinos',
      items: workouts.map((workout) => ({
        id: workout.id,
        type: 'workout',
        title: workout.name,
        subtitle: `Status: ${workout.status}`,
        href: `/dashboard/workouts/${workout.id}`,
      })),
    })

    const { rows: payments } = await pgQuery<{
      id: string
      amount: number
      status: string
      student_name: string | null
    }>(
      c.env,
      `SELECT p.id, p.amount, p.status, su.full_name as student_name
       FROM payments p
       LEFT JOIN users su ON su.id = p.payer_id
       WHERE p.recipient_id = $1
         AND (
          CAST(p.amount AS text) ILIKE $2
          OR p.status ILIKE $2
          OR COALESCE(su.full_name, '') ILIKE $2
         )
       ORDER BY p.created_at DESC
       LIMIT $3`,
      [userId, like, limit]
    )

    sections.push({
      key: 'payments',
      label: 'Cobranças',
      items: payments.map((payment) => ({
        id: payment.id,
        type: 'payment',
        title: `${Number(payment.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        subtitle: `${payment.student_name || 'Aluno'} • ${payment.status}`,
        href: `/dashboard/payments?id=${payment.id}`,
      })),
    })
  } else {
    const { rows: workouts } = await pgQuery<{
      id: string
      name: string
      status: string
    }>(
      c.env,
      `SELECT id, name, status
       FROM workouts
       WHERE student_id = $1
         AND name ILIKE $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, like, limit]
    )

    sections.push({
      key: 'workouts',
      label: 'Treinos',
      items: workouts.map((workout) => ({
        id: workout.id,
        type: 'workout',
        title: workout.name,
        subtitle: `Status: ${workout.status}`,
        href: `/dashboard/workouts/execute?id=${workout.id}`,
      })),
    })

    const { rows: payments } = await pgQuery<{
      id: string
      amount: number
      status: string
      due_date: string | null
    }>(
      c.env,
      `SELECT id, amount, status, due_date
       FROM payments
       WHERE payer_id = $1
         AND (
           CAST(amount AS text) ILIKE $2
           OR status ILIKE $2
         )
       ORDER BY created_at DESC
       LIMIT $3`,
      [userId, like, limit]
    )

    sections.push({
      key: 'payments',
      label: 'Cobranças',
      items: payments.map((payment) => ({
        id: payment.id,
        type: 'payment',
        title: `${Number(payment.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        subtitle: `${payment.status}${payment.due_date ? ` • vence ${new Date(payment.due_date).toLocaleDateString('pt-BR')}` : ''}`,
        href: '/dashboard/payments',
      })),
    })
  }

  return success({
    query: q,
    sections,
    quick_actions: quickActions,
  })
})

export { search as searchRoutes }

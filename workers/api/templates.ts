/**
 * workers/api/templates.ts
 *
 * API para workout templates — treinos prontos exploráveis
 * Montado em /api/v1/workout-templates
 *
 * Endpoints:
 *   GET /          — listar templates (com filtro por nível, categoria)
 *   GET /:id       — detalhe de um template
 */

import { Hono } from 'hono'
import type { AppContext } from '@workers/types'
import { authMiddleware } from '@workers/middleware/auth'
import { success } from '@lib/response'
import { NotFoundError } from '@lib/errors'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ── Dados estáticos de templates ──────────────────────
// TODO: mover para D1 com seed script (Sprint 30.10)
const TEMPLATES = [
  {
    id: 'tmpl-push-pull-legs',
    name: 'Push Pull Legs',
    description: 'Divisão clássica que treina todo o corpo em 3 dias',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    total_days: 6,
    estimated_duration_min: 60,
    is_premium: false,
    image_emoji: '💪',
    exercises_count: 18,
  },
  {
    id: 'tmpl-upper-lower',
    name: 'Upper Lower Split',
    description: 'Alterne entre superior e inferior para máximo volume',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    total_days: 4,
    estimated_duration_min: 50,
    is_premium: false,
    image_emoji: '🏋️',
    exercises_count: 16,
  },
  {
    id: 'tmpl-full-body-3x',
    name: 'Full Body 3x Semana',
    description: 'Treino completo 3x por semana — ideal para iniciantes',
    category: 'general',
    difficulty: 'beginner',
    total_days: 3,
    estimated_duration_min: 45,
    is_premium: false,
    image_emoji: '🔥',
    exercises_count: 12,
  },
  {
    id: 'tmpl-hiit-20min',
    name: 'HIIT 20 Minutos',
    description: 'Circuito de alta intensidade em apenas 20 minutos',
    category: 'cardio',
    difficulty: 'intermediate',
    total_days: 3,
    estimated_duration_min: 20,
    is_premium: false,
    image_emoji: '⚡',
    exercises_count: 8,
  },
  {
    id: 'tmpl-abc-classic',
    name: 'ABC Clássico',
    description: 'Peito/Tríceps, Costas/Bíceps, Pernas — o clássico brasileiro',
    category: 'hypertrophy',
    difficulty: 'beginner',
    total_days: 3,
    estimated_duration_min: 55,
    is_premium: false,
    image_emoji: '🇧🇷',
    exercises_count: 15,
  },
  {
    id: 'tmpl-abcde-advanced',
    name: 'ABCDE Avançado',
    description: '5 dias com foco em um grupo muscular por dia',
    category: 'hypertrophy',
    difficulty: 'advanced',
    total_days: 5,
    estimated_duration_min: 70,
    is_premium: true,
    image_emoji: '🏆',
    exercises_count: 25,
  },
  {
    id: 'tmpl-strength-5x5',
    name: 'Força 5x5',
    description: 'Programa de força focado em compostos: 5 séries de 5',
    category: 'strength',
    difficulty: 'intermediate',
    total_days: 3,
    estimated_duration_min: 50,
    is_premium: true,
    image_emoji: '🔩',
    exercises_count: 9,
  },
  {
    id: 'tmpl-calistenia',
    name: 'Calistenia em Casa',
    description: 'Treino com peso corporal — sem academia necessária',
    category: 'general',
    difficulty: 'beginner',
    total_days: 4,
    estimated_duration_min: 35,
    is_premium: false,
    image_emoji: '🧘',
    exercises_count: 12,
  },
  {
    id: 'tmpl-glute-focus',
    name: 'Glúteos & Pernas',
    description: 'Foco total em glúteos e membros inferiores',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    total_days: 3,
    estimated_duration_min: 50,
    is_premium: true,
    image_emoji: '🍑',
    exercises_count: 12,
  },
  {
    id: 'tmpl-30min-express',
    name: 'Express 30min',
    description: 'Treino rápido e eficiente para quem tem pouco tempo',
    category: 'general',
    difficulty: 'beginner',
    total_days: 4,
    estimated_duration_min: 30,
    is_premium: false,
    image_emoji: '⏱️',
    exercises_count: 10,
  },
]

// ── GET / — Listar templates ──────────────────────────
app.get('/', (c) => {
  const difficulty = c.req.query('difficulty')
  const category = c.req.query('category')

  let filtered = [...TEMPLATES]

  if (difficulty) {
    filtered = filtered.filter((t) => t.difficulty === difficulty)
  }
  if (category) {
    filtered = filtered.filter((t) => t.category === category)
  }

  return success(filtered)
})

// ── GET /:id — Detalhe ───────────────────────────────
app.get('/:id', (c) => {
  const id = c.req.param('id')
  const tmpl = TEMPLATES.find((t) => t.id === id)

  if (!tmpl) throw new NotFoundError('Template não encontrado')

  // TODO: retornar exercises reais do D1
  return success({
    ...tmpl,
    days: [],
  })
})

export { app as workoutTemplatesRoutes }

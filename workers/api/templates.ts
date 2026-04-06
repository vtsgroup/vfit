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
import { success } from '@lib/response'
import { NotFoundError } from '@lib/errors'

const app = new Hono<AppContext>()

// Treinos prontos são PÚBLICOS — sem authMiddleware

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

  const days = TEMPLATE_DAYS[id] || []

  return success({
    ...tmpl,
    days,
  })
})

// ── Exercícios por template ──────────────────────────
// Dados estáticos até migração para D1 (Sprint 30.10)
const TEMPLATE_DAYS: Record<string, Array<{ day: number; name: string; exercises: Array<{ name: string; sets: number; reps: string; rest_seconds: number; muscle_group: string }> }>> = {
  'tmpl-push-pull-legs': [
    {
      day: 1, name: 'Push (Peito, Ombro, Tríceps)',
      exercises: [
        { name: 'Supino Reto com Barra', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Peito' },
        { name: 'Supino Inclinado com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
        { name: 'Desenvolvimento com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Ombro' },
        { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
        { name: 'Tríceps Pulley', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Tríceps' },
        { name: 'Tríceps Testa', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
      ],
    },
    {
      day: 2, name: 'Pull (Costas, Bíceps)',
      exercises: [
        { name: 'Barra Fixa (ou Pulley)', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Costas' },
        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Rosca Direta com Barra', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Bíceps' },
        { name: 'Rosca Martelo', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Bíceps' },
        { name: 'Encolhimento com Halteres', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Trapézio' },
      ],
    },
    {
      day: 3, name: 'Legs (Pernas)',
      exercises: [
        { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest_seconds: 120, muscle_group: 'Quadríceps' },
        { name: 'Leg Press 45°', sets: 3, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Mesa Flexora', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Posterior' },
        { name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
        { name: 'Stiff com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Posterior' },
      ],
    },
  ],
  'tmpl-upper-lower': [
    {
      day: 1, name: 'Upper A (Peito + Costas)',
      exercises: [
        { name: 'Supino Reto com Barra', sets: 4, reps: '8-10', rest_seconds: 90, muscle_group: 'Peito' },
        { name: 'Remada Curvada', sets: 4, reps: '8-10', rest_seconds: 90, muscle_group: 'Costas' },
        { name: 'Desenvolvimento com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Ombro' },
        { name: 'Puxada Aberta', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Rosca Direta', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Bíceps' },
        { name: 'Tríceps Pulley', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Tríceps' },
      ],
    },
    {
      day: 2, name: 'Lower A (Quadríceps + Posterior)',
      exercises: [
        { name: 'Agachamento Livre', sets: 4, reps: '8-10', rest_seconds: 120, muscle_group: 'Quadríceps' },
        { name: 'Leg Press 45°', sets: 3, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Mesa Flexora', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Posterior' },
        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Panturrilha Sentado', sets: 4, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
  ],
  'tmpl-full-body-3x': [
    {
      day: 1, name: 'Full Body A',
      exercises: [
        { name: 'Agachamento Livre', sets: 3, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Supino Reto com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Desenvolvimento com Halteres', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Ombro' },
      ],
    },
    {
      day: 2, name: 'Full Body B',
      exercises: [
        { name: 'Leg Press 45°', sets: 3, reps: '12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Puxada Frontal', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Crucifixo com Halteres', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Peito' },
        { name: 'Elevação Lateral', sets: 3, reps: '15', rest_seconds: 45, muscle_group: 'Ombro' },
      ],
    },
    {
      day: 3, name: 'Full Body C',
      exercises: [
        { name: 'Stiff com Barra', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Posterior' },
        { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
        { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Costas' },
        { name: 'Panturrilha em Pé', sets: 3, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
  ],
  'tmpl-hiit-20min': [
    {
      day: 1, name: 'Circuito HIIT',
      exercises: [
        { name: 'Burpees', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Full Body' },
        { name: 'Mountain Climbers', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Core' },
        { name: 'Jump Squats', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Quadríceps' },
        { name: 'Flexão de Braço', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Peito' },
        { name: 'Abdominal Bicicleta', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Core' },
        { name: 'Jumping Jacks', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Full Body' },
        { name: 'Prancha Dinâmica', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Core' },
        { name: 'High Knees', sets: 4, reps: '30s', rest_seconds: 15, muscle_group: 'Cardio' },
      ],
    },
  ],
  'tmpl-abc-classic': [
    {
      day: 1, name: 'A — Peito e Tríceps',
      exercises: [
        { name: 'Supino Reto com Barra', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Peito' },
        { name: 'Supino Inclinado com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
        { name: 'Crossover', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Peito' },
        { name: 'Tríceps Pulley', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Tríceps' },
        { name: 'Tríceps Francês', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
      ],
    },
    {
      day: 2, name: 'B — Costas e Bíceps',
      exercises: [
        { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Costas' },
        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Remada Baixa (Cabos)', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Rosca Direta com Barra', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Bíceps' },
        { name: 'Rosca Alternada', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Bíceps' },
      ],
    },
    {
      day: 3, name: 'C — Pernas',
      exercises: [
        { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest_seconds: 120, muscle_group: 'Quadríceps' },
        { name: 'Leg Press 45°', sets: 3, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Mesa Flexora', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Posterior' },
        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
  ],
  'tmpl-abcde-advanced': [
    {
      day: 1, name: 'A — Peito',
      exercises: [
        { name: 'Supino Reto com Barra', sets: 4, reps: '6-10', rest_seconds: 120, muscle_group: 'Peito' },
        { name: 'Supino Inclinado com Halteres', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Peito' },
        { name: 'Supino Declinado', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
        { name: 'Crossover (Cabos)', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Peito' },
        { name: 'Peck Deck', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Peito' },
      ],
    },
    {
      day: 2, name: 'B — Costas',
      exercises: [
        { name: 'Barra Fixa', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Costas' },
        { name: 'Remada Curvada com Barra', sets: 4, reps: '8-10', rest_seconds: 90, muscle_group: 'Costas' },
        { name: 'Puxada Frontal', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
        { name: 'Pullover', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Costas' },
      ],
    },
    {
      day: 3, name: 'C — Ombros',
      exercises: [
        { name: 'Desenvolvimento com Barra', sets: 4, reps: '8-10', rest_seconds: 90, muscle_group: 'Ombro' },
        { name: 'Elevação Lateral', sets: 4, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
        { name: 'Elevação Frontal', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
        { name: 'Crucifixo Inverso', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
        { name: 'Encolhimento com Barra', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Trapézio' },
      ],
    },
    {
      day: 4, name: 'D — Braços',
      exercises: [
        { name: 'Rosca Direta com Barra', sets: 4, reps: '8-12', rest_seconds: 75, muscle_group: 'Bíceps' },
        { name: 'Tríceps Pulley', sets: 4, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
        { name: 'Rosca Martelo', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Bíceps' },
        { name: 'Tríceps Testa', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
        { name: 'Rosca Concentrada', sets: 3, reps: '12', rest_seconds: 45, muscle_group: 'Bíceps' },
      ],
    },
    {
      day: 5, name: 'E — Pernas',
      exercises: [
        { name: 'Agachamento Livre', sets: 5, reps: '6-10', rest_seconds: 150, muscle_group: 'Quadríceps' },
        { name: 'Leg Press 45°', sets: 4, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Stiff com Barra', sets: 3, reps: '10-12', rest_seconds: 90, muscle_group: 'Posterior' },
        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Panturrilha em Pé', sets: 5, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
  ],
  'tmpl-strength-5x5': [
    {
      day: 1, name: 'Dia A — Agachamento + Supino',
      exercises: [
        { name: 'Agachamento Livre', sets: 5, reps: '5', rest_seconds: 180, muscle_group: 'Quadríceps' },
        { name: 'Supino Reto com Barra', sets: 5, reps: '5', rest_seconds: 180, muscle_group: 'Peito' },
        { name: 'Remada Curvada', sets: 5, reps: '5', rest_seconds: 180, muscle_group: 'Costas' },
      ],
    },
    {
      day: 2, name: 'Dia B — Agachamento + Desenvolvimento',
      exercises: [
        { name: 'Agachamento Livre', sets: 5, reps: '5', rest_seconds: 180, muscle_group: 'Quadríceps' },
        { name: 'Desenvolvimento com Barra', sets: 5, reps: '5', rest_seconds: 180, muscle_group: 'Ombro' },
        { name: 'Levantamento Terra', sets: 1, reps: '5', rest_seconds: 300, muscle_group: 'Posterior' },
      ],
    },
  ],
  'tmpl-calistenia': [
    {
      day: 1, name: 'Superior',
      exercises: [
        { name: 'Flexão de Braço', sets: 4, reps: '10-15', rest_seconds: 60, muscle_group: 'Peito' },
        { name: 'Flexão Diamante', sets: 3, reps: '8-12', rest_seconds: 60, muscle_group: 'Tríceps' },
        { name: 'Flexão Pike (Ombros)', sets: 3, reps: '8-12', rest_seconds: 60, muscle_group: 'Ombro' },
      ],
    },
    {
      day: 2, name: 'Inferior',
      exercises: [
        { name: 'Agachamento Búlgaro', sets: 3, reps: '10-12 cada', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Pistol Squat (assistido)', sets: 3, reps: '6-8 cada', rest_seconds: 75, muscle_group: 'Quadríceps' },
        { name: 'Glute Bridge', sets: 3, reps: '15-20', rest_seconds: 45, muscle_group: 'Glúteo' },
      ],
    },
    {
      day: 3, name: 'Core + Full Body',
      exercises: [
        { name: 'Prancha Frontal', sets: 3, reps: '45-60s', rest_seconds: 45, muscle_group: 'Core' },
        { name: 'Prancha Lateral', sets: 3, reps: '30s cada', rest_seconds: 30, muscle_group: 'Core' },
        { name: 'Burpees', sets: 3, reps: '10-15', rest_seconds: 60, muscle_group: 'Full Body' },
        { name: 'Superman', sets: 3, reps: '12-15', rest_seconds: 45, muscle_group: 'Lombar' },
        { name: 'Abdominal Bicicleta', sets: 3, reps: '20', rest_seconds: 30, muscle_group: 'Core' },
        { name: 'Dips em Cadeira', sets: 3, reps: '10-15', rest_seconds: 60, muscle_group: 'Tríceps' },
      ],
    },
  ],
  'tmpl-glute-focus': [
    {
      day: 1, name: 'Glúteos + Posterior',
      exercises: [
        { name: 'Hip Thrust com Barra', sets: 4, reps: '10-12', rest_seconds: 90, muscle_group: 'Glúteo' },
        { name: 'Agachamento Sumô', sets: 3, reps: '12-15', rest_seconds: 75, muscle_group: 'Glúteo' },
        { name: 'Stiff com Halteres', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Posterior' },
        { name: 'Abdução de Quadril (Máquina)', sets: 3, reps: '15-20', rest_seconds: 45, muscle_group: 'Glúteo' },
      ],
    },
    {
      day: 2, name: 'Quadríceps + Panturrilha',
      exercises: [
        { name: 'Agachamento Livre', sets: 4, reps: '10-12', rest_seconds: 90, muscle_group: 'Quadríceps' },
        { name: 'Leg Press 45°', sets: 3, reps: '12-15', rest_seconds: 75, muscle_group: 'Quadríceps' },
        { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
    {
      day: 3, name: 'Glúteos + Core',
      exercises: [
        { name: 'Elevação Pélvica (Glute Bridge)', sets: 4, reps: '15-20', rest_seconds: 60, muscle_group: 'Glúteo' },
        { name: 'Passada (Lunges)', sets: 3, reps: '12 cada', rest_seconds: 60, muscle_group: 'Glúteo' },
        { name: 'Kickback (Cabos)', sets: 3, reps: '15 cada', rest_seconds: 45, muscle_group: 'Glúteo' },
        { name: 'Prancha Frontal', sets: 3, reps: '45-60s', rest_seconds: 30, muscle_group: 'Core' },
      ],
    },
  ],
  'tmpl-30min-express': [
    {
      day: 1, name: 'Express — Superior',
      exercises: [
        { name: 'Supino Reto com Halteres', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Peito' },
        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Costas' },
        { name: 'Elevação Lateral', sets: 2, reps: '12-15', rest_seconds: 45, muscle_group: 'Ombro' },
      ],
    },
    {
      day: 2, name: 'Express — Inferior',
      exercises: [
        { name: 'Agachamento Livre', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Quadríceps' },
        { name: 'Stiff com Halteres', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Posterior' },
        { name: 'Panturrilha em Pé', sets: 3, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
      ],
    },
    {
      day: 3, name: 'Express — Full Body',
      exercises: [
        { name: 'Agachamento com Halteres', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Quadríceps' },
        { name: 'Flexão de Braço', sets: 3, reps: '12-15', rest_seconds: 45, muscle_group: 'Peito' },
        { name: 'Prancha Frontal', sets: 3, reps: '45s', rest_seconds: 30, muscle_group: 'Core' },
      ],
    },
  ],
}

export { app as workoutTemplatesRoutes }

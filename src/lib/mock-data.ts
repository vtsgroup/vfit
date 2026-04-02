/**
 * src/lib/mock-data.ts
 *
 * Mock Data — Dados de teste para modo demo
 *
 * Exports: DEMO_PERSONAL, DEMO_PERSONAL_PROFILE, DEMO_STUDENT, DEMO_STUDENT_PROFILE, DEMO_CREDENTIALS
 */

// ============================================
// Mock Data — Dados de teste para modo demo
// ============================================

import type { User, PersonalProfile, StudentProfile } from '@/stores/auth-store'
import type { PersonalStats, PaymentStats, RecentPayment, RecentStudent } from '@/hooks/use-dashboard'

// ============================================
// Usuários de teste
// ============================================

export const DEMO_PERSONAL: User = {
  id: 'demo-personal-001',
  email: 'personal@teste.com',
  full_name: 'Carlos Silva',
  user_type: 'personal',
  role: 'user',
  avatar_url: null,
  phone: '(11) 99999-0001',
  created_at: '2025-10-15T10:00:00Z',
}

export const DEMO_PERSONAL_PROFILE: PersonalProfile = {
  slug: 'carlos-silva',
  cref: '012345-G/SP',
  specialties: ['Hipertrofia', 'Emagrecimento', 'Funcional', 'Reabilitação'],
  plan_type: 'pro',
  plan_expires_at: '2026-12-31T23:59:59Z',
  total_students: 12,
  average_rating: 4.8,
}

export const DEMO_STUDENT: User = {
  id: 'demo-student-001',
  email: 'aluno@teste.com',
  full_name: 'Ana Oliveira',
  user_type: 'student',
  role: 'user',
  avatar_url: null,
  phone: '(11) 99999-0002',
  created_at: '2025-11-20T14:00:00Z',
}

export const DEMO_STUDENT_PROFILE: StudentProfile = {
  personal_id: 'demo-personal-001',
  personal_name: 'Carlos Silva',
  status: 'active',
  fitness_level: 'intermediate',
  goals: ['Hipertrofia', 'Condicionamento'],
}

// ============================================
// Credenciais (email → senha)
// ============================================

export const DEMO_CREDENTIALS: Record<string, { password: string; user: User; profile: PersonalProfile | StudentProfile }> = {
  'personal@teste.com': {
    password: 'teste123',
    user: DEMO_PERSONAL,
    profile: DEMO_PERSONAL_PROFILE,
  },
  'aluno@teste.com': {
    password: 'teste123',
    user: DEMO_STUDENT,
    profile: DEMO_STUDENT_PROFILE,
  },
}

// ============================================
// Dashboard Stats
// ============================================

export const DEMO_PERSONAL_STATS: PersonalStats = {
  subscription: {
    plan: 'pro',
    status: 'active',
    trial_ends_at: null,
    expires_at: '2026-12-31T23:59:59Z',
  },
  students: {
    total: 12,
    active: 9,
    by_status: { active: 9, inactive: 2, pending: 1 },
    by_payment: { paid: 7, pending: 3, overdue: 2 },
  },
  revenue: {
    total: 8450.0,
  },
  referral_code: 'CARLOS2026',
  workouts_completed_by_students: 87,
  weekly_workouts: [
    { week: '2026-W05', created: 8, completed: 26 },
    { week: '2026-W06', created: 10, completed: 31 },
    { week: '2026-W07', created: 9, completed: 28 },
    { week: '2026-W08', created: 11, completed: 35 },
  ],
}

export const DEMO_PAYMENT_STATS: PaymentStats = {
  summary: {
    total_revenue: 8450.0,
    total_received: 6300.0,
    total_pending: 1500.0,
    total_overdue: 650.0,
    total_platform_fees: 422.5,
    total_commissions: 126.75,
    payment_count: 34,
  },
  monthly_revenue: [
    { month: '2025-09', revenue: 2100.0, count: 7 },
    { month: '2025-10', revenue: 2400.0, count: 8 },
    { month: '2025-11', revenue: 1950.0, count: 9 },
    { month: '2025-12', revenue: 2000.0, count: 10 },
  ],
}

// ============================================
// Alunos
// ============================================

export const DEMO_STUDENTS: RecentStudent[] = [
  {
    id: 'demo-student-001',
    full_name: 'Ana Oliveira',
    email: 'ana@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'paid',
    created_at: '2025-11-20T14:00:00Z',
  },
  {
    id: 'demo-student-002',
    full_name: 'Bruno Costa',
    email: 'bruno@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'paid',
    created_at: '2025-11-18T10:00:00Z',
  },
  {
    id: 'demo-student-003',
    full_name: 'Carla Santos',
    email: 'carla@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'pending',
    created_at: '2025-11-15T09:00:00Z',
  },
  {
    id: 'demo-student-004',
    full_name: 'Diego Lima',
    email: 'diego@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'paid',
    created_at: '2025-10-05T08:00:00Z',
  },
  {
    id: 'demo-student-005',
    full_name: 'Elena Ferreira',
    email: 'elena@email.com',
    profile_photo_url: null,
    status: 'inactive',
    payment_status: 'overdue',
    created_at: '2025-09-22T11:00:00Z',
  },
  {
    id: 'demo-student-006',
    full_name: 'Felipe Souza',
    email: 'felipe@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'paid',
    created_at: '2025-10-10T16:00:00Z',
  },
  {
    id: 'demo-student-007',
    full_name: 'Gabriela Martins',
    email: 'gabi@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'pending',
    created_at: '2025-11-02T13:00:00Z',
  },
  {
    id: 'demo-student-008',
    full_name: 'Henrique Alves',
    email: 'henrique@email.com',
    profile_photo_url: null,
    status: 'pending',
    payment_status: 'pending',
    created_at: '2025-12-01T07:00:00Z',
  },
  {
    id: 'demo-student-009',
    full_name: 'Isabela Rocha',
    email: 'isabela@email.com',
    profile_photo_url: null,
    status: 'active',
    payment_status: 'paid',
    created_at: '2025-10-28T15:00:00Z',
  },
]

// ============================================
// Pagamentos recentes
// ============================================

export const DEMO_PAYMENTS: RecentPayment[] = [
  {
    id: 'pay-001',
    amount: 250.0,
    status: 'paid',
    payment_method: 'pix',
    due_date: '2025-12-05T00:00:00Z',
    paid_at: '2025-12-04T18:23:00Z',
    description: 'Mensalidade Dezembro',
    payer_name: 'Ana Oliveira',
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'pay-002',
    amount: 300.0,
    status: 'paid',
    payment_method: 'credit_card',
    due_date: '2025-12-05T00:00:00Z',
    paid_at: '2025-12-05T09:15:00Z',
    description: 'Mensalidade Dezembro',
    payer_name: 'Bruno Costa',
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'pay-003',
    amount: 200.0,
    status: 'pending',
    payment_method: 'pix',
    due_date: '2025-12-10T00:00:00Z',
    paid_at: null,
    description: 'Mensalidade Dezembro',
    payer_name: 'Carla Santos',
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'pay-004',
    amount: 250.0,
    status: 'overdue',
    payment_method: 'boleto',
    due_date: '2025-11-30T00:00:00Z',
    paid_at: null,
    description: 'Mensalidade Novembro',
    payer_name: 'Elena Ferreira',
    created_at: '2025-11-01T10:00:00Z',
  },
  {
    id: 'pay-005',
    amount: 250.0,
    status: 'paid',
    payment_method: 'pix',
    due_date: '2025-12-05T00:00:00Z',
    paid_at: '2025-12-03T20:45:00Z',
    description: 'Mensalidade Dezembro',
    payer_name: 'Diego Lima',
    created_at: '2025-12-01T10:00:00Z',
  },
]

// ============================================
// Treinos
// ============================================

export const DEMO_WORKOUTS = [
  {
    id: 'wk-001',
    name: 'Treino A — Peito e Tríceps',
    description: 'Foco em hipertrofia de peito e tríceps',
    student_id: 'demo-student-001',
    student_name: 'Ana Oliveira',
    status: 'active',
    difficulty: 'intermediate',
    duration_minutes: 60,
    exercises_count: 8,
    created_at: '2025-11-25T10:00:00Z',
    updated_at: '2025-11-25T10:00:00Z',
  },
  {
    id: 'wk-002',
    name: 'Treino B — Costas e Bíceps',
    description: 'Foco em desenvolvimento de dorsais e bíceps',
    student_id: 'demo-student-001',
    student_name: 'Ana Oliveira',
    status: 'active',
    difficulty: 'intermediate',
    duration_minutes: 55,
    exercises_count: 7,
    created_at: '2025-11-25T10:30:00Z',
    updated_at: '2025-11-25T10:30:00Z',
  },
  {
    id: 'wk-003',
    name: 'Treino C — Pernas',
    description: 'Treino completo de membros inferiores',
    student_id: 'demo-student-002',
    student_name: 'Bruno Costa',
    status: 'active',
    difficulty: 'advanced',
    duration_minutes: 70,
    exercises_count: 10,
    created_at: '2025-11-20T09:00:00Z',
    updated_at: '2025-11-20T09:00:00Z',
  },
  {
    id: 'wk-004',
    name: 'Treino Funcional',
    description: 'Circuito funcional para condicionamento',
    student_id: 'demo-student-003',
    student_name: 'Carla Santos',
    status: 'active',
    difficulty: 'beginner',
    duration_minutes: 45,
    exercises_count: 6,
    created_at: '2025-11-18T14:00:00Z',
    updated_at: '2025-11-18T14:00:00Z',
  },
  {
    id: 'wk-005',
    name: 'Treino HIIT',
    description: 'Intervalado de alta intensidade',
    student_id: 'demo-student-004',
    student_name: 'Diego Lima',
    status: 'completed',
    difficulty: 'advanced',
    duration_minutes: 30,
    exercises_count: 12,
    created_at: '2025-11-15T08:00:00Z',
    updated_at: '2025-12-01T18:00:00Z',
  },
]

// ============================================
// Exercícios
// ============================================

export const DEMO_MUSCLE_GROUPS = [
  { id: 'mg-01', name: 'Peito', slug: 'peito' },
  { id: 'mg-02', name: 'Costas', slug: 'costas' },
  { id: 'mg-03', name: 'Ombros', slug: 'ombros' },
  { id: 'mg-04', name: 'Bíceps', slug: 'biceps' },
  { id: 'mg-05', name: 'Tríceps', slug: 'triceps' },
  { id: 'mg-06', name: 'Quadríceps', slug: 'quadriceps' },
  { id: 'mg-07', name: 'Posterior', slug: 'posterior' },
  { id: 'mg-08', name: 'Glúteos', slug: 'gluteos' },
  { id: 'mg-09', name: 'Abdômen', slug: 'abdomen' },
  { id: 'mg-10', name: 'Panturrilha', slug: 'panturrilha' },
]

export const DEMO_EXERCISES = [
  { id: 'ex-01', name: 'Supino Reto', muscle_group_id: 'mg-01', muscle_group_name: 'Peito', equipment: 'barra', difficulty: 'intermediate' },
  { id: 'ex-02', name: 'Supino Inclinado', muscle_group_id: 'mg-01', muscle_group_name: 'Peito', equipment: 'halteres', difficulty: 'intermediate' },
  { id: 'ex-03', name: 'Crucifixo', muscle_group_id: 'mg-01', muscle_group_name: 'Peito', equipment: 'halteres', difficulty: 'beginner' },
  { id: 'ex-04', name: 'Puxada Frontal', muscle_group_id: 'mg-02', muscle_group_name: 'Costas', equipment: 'cabo', difficulty: 'beginner' },
  { id: 'ex-05', name: 'Remada Curvada', muscle_group_id: 'mg-02', muscle_group_name: 'Costas', equipment: 'barra', difficulty: 'intermediate' },
  { id: 'ex-06', name: 'Remada Unilateral', muscle_group_id: 'mg-02', muscle_group_name: 'Costas', equipment: 'halter', difficulty: 'intermediate' },
  { id: 'ex-07', name: 'Desenvolvimento Militar', muscle_group_id: 'mg-03', muscle_group_name: 'Ombros', equipment: 'barra', difficulty: 'intermediate' },
  { id: 'ex-08', name: 'Elevação Lateral', muscle_group_id: 'mg-03', muscle_group_name: 'Ombros', equipment: 'halteres', difficulty: 'beginner' },
  { id: 'ex-09', name: 'Rosca Direta', muscle_group_id: 'mg-04', muscle_group_name: 'Bíceps', equipment: 'barra', difficulty: 'beginner' },
  { id: 'ex-10', name: 'Rosca Alternada', muscle_group_id: 'mg-04', muscle_group_name: 'Bíceps', equipment: 'halteres', difficulty: 'beginner' },
  { id: 'ex-11', name: 'Tríceps Corda', muscle_group_id: 'mg-05', muscle_group_name: 'Tríceps', equipment: 'cabo', difficulty: 'beginner' },
  { id: 'ex-12', name: 'Tríceps Francês', muscle_group_id: 'mg-05', muscle_group_name: 'Tríceps', equipment: 'halter', difficulty: 'intermediate' },
  { id: 'ex-13', name: 'Agachamento Livre', muscle_group_id: 'mg-06', muscle_group_name: 'Quadríceps', equipment: 'barra', difficulty: 'advanced' },
  { id: 'ex-14', name: 'Leg Press', muscle_group_id: 'mg-06', muscle_group_name: 'Quadríceps', equipment: 'máquina', difficulty: 'beginner' },
  { id: 'ex-15', name: 'Stiff', muscle_group_id: 'mg-07', muscle_group_name: 'Posterior', equipment: 'barra', difficulty: 'intermediate' },
  { id: 'ex-16', name: 'Mesa Flexora', muscle_group_id: 'mg-07', muscle_group_name: 'Posterior', equipment: 'máquina', difficulty: 'beginner' },
  { id: 'ex-17', name: 'Hip Thrust', muscle_group_id: 'mg-08', muscle_group_name: 'Glúteos', equipment: 'barra', difficulty: 'intermediate' },
  { id: 'ex-18', name: 'Abdominal Crunch', muscle_group_id: 'mg-09', muscle_group_name: 'Abdômen', equipment: 'peso corporal', difficulty: 'beginner' },
  { id: 'ex-19', name: 'Prancha', muscle_group_id: 'mg-09', muscle_group_name: 'Abdômen', equipment: 'peso corporal', difficulty: 'beginner' },
  { id: 'ex-20', name: 'Panturrilha em Pé', muscle_group_id: 'mg-10', muscle_group_name: 'Panturrilha', equipment: 'máquina', difficulty: 'beginner' },
]

// ============================================
// Assessments
// ============================================

export const DEMO_ASSESSMENTS = [
  {
    id: 'assess-001',
    student_id: 'demo-student-001',
    student_name: 'Ana Oliveira',
    type: 'physical',
    status: 'completed',
    date: '2025-12-01T10:00:00Z',
    notes: 'Avaliação trimestral — boa evolução',
    measurements: {
      weight: 62.5,
      height: 165,
      body_fat: 22.3,
      chest: 88,
      waist: 70,
      hip: 98,
      arm_left: 27,
      arm_right: 27.5,
      thigh_left: 56,
      thigh_right: 56.5,
    },
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'assess-002',
    student_id: 'demo-student-002',
    student_name: 'Bruno Costa',
    type: 'physical',
    status: 'completed',
    date: '2025-11-28T09:00:00Z',
    notes: 'Primeira avaliação — linha de base',
    measurements: {
      weight: 85.0,
      height: 178,
      body_fat: 18.5,
      chest: 102,
      waist: 82,
      hip: 100,
      arm_left: 34,
      arm_right: 34.5,
      thigh_left: 60,
      thigh_right: 61,
    },
    created_at: '2025-11-28T09:00:00Z',
  },
]

// ============================================
// Notificações
// ============================================

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'payment',
    title: 'Pagamento recebido',
    message: 'Ana Oliveira pagou R$ 250,00 via PIX',
    read: false,
    created_at: '2025-12-04T18:23:00Z',
  },
  {
    id: 'notif-002',
    type: 'student',
    title: 'Novo aluno',
    message: 'Henrique Alves aceitou seu convite',
    read: false,
    created_at: '2025-12-01T07:00:00Z',
  },
  {
    id: 'notif-003',
    type: 'workout',
    title: 'Treino concluído',
    message: 'Diego Lima completou o Treino HIIT',
    read: true,
    created_at: '2025-11-30T19:00:00Z',
  },
]

/**
 * src/lib/navigation.ts
 *
 * Navigation Config — rotas e menus
 *
 * Exports: NavItem, NavSection, personalNavigation, studentNavigation, personalMobileNav
 * Features: DSIcon
 */

// ============================================
// Navigation Config — rotas e menus
// ============================================

import type { DSIconName } from '@/components/ui/ds-icon'

export interface NavItem {
  label: string
  href: string
  icon: DSIconName
  badge?: string
  children?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// ============================================
// Personal Trainer Navigation
// ============================================

export const personalNavigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'layoutDashboard' },
      { label: 'Alunos', href: '/dashboard/students', icon: 'users' },
      { label: 'Treinos', href: '/dashboard/workouts', icon: 'dumbbell' },
      { label: 'Exercícios', href: '/dashboard/exercises', icon: 'library' },
      { label: 'Avaliações', href: '/dashboard/assessments', icon: 'clipboardList' },
      { label: 'Agenda', href: '/dashboard/calendar', icon: 'calendarDays' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Dashboard Financeiro', href: '/dashboard/financeiro', icon: 'wallet' },
      { label: 'Cobranças', href: '/dashboard/payments', icon: 'creditCard' },
      { label: 'Afiliados', href: '/dashboard/affiliates', icon: 'externalLink' },
      { label: 'Marketplace', href: '/dashboard/marketplace', icon: 'shoppingBag' },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { label: 'IA Assistente', href: '/dashboard/ai', icon: 'bot' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { label: 'Mensagens', href: '/dashboard/messages', icon: 'message' },
      { label: 'Notificações', href: '/dashboard/notifications', icon: 'bell' },
      { label: 'Planos', href: '/dashboard/plans', icon: 'crown' },
      { label: 'Configurações', href: '/dashboard/settings', icon: 'settings' },
    ],
  },
]

// ============================================
// Student Navigation
// ============================================

export const studentNavigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'layoutDashboard' },
      { label: 'Meus Treinos', href: '/dashboard/workouts', icon: 'dumbbell' },
      { label: 'Avaliações', href: '/dashboard/assessments', icon: 'clipboardList' },
      { label: 'Agenda', href: '/dashboard/calendar', icon: 'calendarDays' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { label: 'Mensagens', href: '/dashboard/messages', icon: 'message' },
      { label: 'Pagamentos', href: '/dashboard/payments', icon: 'creditCard' },
      { label: 'Notificações', href: '/dashboard/notifications', icon: 'bell' },
      { label: 'Configurações', href: '/dashboard/settings', icon: 'settings' },
    ],
  },
]

// ============================================
// Mobile bottom nav (quick access)
// ============================================

export const personalMobileNav: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'layoutDashboard' },
  { label: 'Alunos', href: '/dashboard/students', icon: 'users' },
  { label: 'Treinos', href: '/dashboard/workouts', icon: 'dumbbell' },
  { label: 'IA', href: '/dashboard/ai', icon: 'bot' },
  { label: 'Mais', href: '/dashboard/settings', icon: 'settings' },
]

export const studentMobileNav: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'layoutDashboard' },
  { label: 'Treinos', href: '/dashboard/workouts', icon: 'dumbbell' },
  { label: 'Avaliações', href: '/dashboard/assessments', icon: 'clipboardList' },
  { label: 'Pagamentos', href: '/dashboard/payments', icon: 'creditCard' },
  { label: 'Mais', href: '/dashboard/settings', icon: 'settings' },
]

// ============================================
// Nutritionist Navigation
// ============================================

export const nutritionistNavigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'layoutDashboard' },
      { label: 'Pacientes', href: '/dashboard/patients', icon: 'users' },
      { label: 'Planos Alimentares', href: '/dashboard/meal-plans', icon: 'clipboardList' },
      { label: 'Avaliações Nutri', href: '/dashboard/nutrition-assessments', icon: 'activity' },
      { label: 'Agenda', href: '/dashboard/calendar', icon: 'calendarDays' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Dashboard Financeiro', href: '/dashboard/financeiro', icon: 'wallet' },
      { label: 'Cobranças', href: '/dashboard/payments', icon: 'creditCard' },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { label: 'IA Assistente', href: '/dashboard/ai', icon: 'bot' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { label: 'Mensagens', href: '/dashboard/messages', icon: 'message' },
      { label: 'Notificações', href: '/dashboard/notifications', icon: 'bell' },
      { label: 'Planos', href: '/dashboard/plans', icon: 'crown' },
      { label: 'Configurações', href: '/dashboard/settings', icon: 'settings' },
    ],
  },
]

export const nutritionistMobileNav: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'layoutDashboard' },
  { label: 'Pacientes', href: '/dashboard/patients', icon: 'users' },
  { label: 'Planos', href: '/dashboard/meal-plans', icon: 'clipboardList' },
  { label: 'IA', href: '/dashboard/ai', icon: 'bot' },
  { label: 'Mais', href: '/dashboard/settings', icon: 'settings' },
]

// ============================================
// Admin Navigation (seção extra para admins)
// ============================================

// ============================================
// Section colors — shared by sidebar + mobile drawer
// ============================================

export const SECTION_COLORS: Record<string, string> = {
  'Principal': 'text-emerald-400',
  'Financeiro': 'text-amber-400',
  'Inteligência': 'text-violet-400',
  'Nutrição': 'text-teal-400',
  'Outros': 'text-slate-400',
  'Administração': 'text-purple-400',
}

// ============================================
// Admin Navigation (seção extra para admins)
// ============================================

export const adminNavigation: NavSection = {
  title: 'Administração',
  items: [
    { label: 'Painel Admin', href: '/dashboard/admin', icon: 'shield' },
    { label: 'Usuários', href: '/dashboard/admin/users', icon: 'userCog' },
    { label: 'Personals', href: '/dashboard/admin/personals', icon: 'users' },
    { label: 'Treinos', href: '/dashboard/admin/workouts', icon: 'dumbbell' },
    { label: 'Pagamentos', href: '/dashboard/admin/payments', icon: 'wallet' },
    { label: 'Sugestões', href: '/dashboard/admin/feedback', icon: 'messageSquareHeart' },
    { label: 'Logs', href: '/dashboard/logs', icon: 'scrollText' },
  ],
}

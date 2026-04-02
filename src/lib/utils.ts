// ============================================
// utils.ts — Utilitários gerais do frontend
// ============================================
//
// O que faz:
//   Funções utilitárias usadas em todo o frontend: merge de classes Tailwind,
//   formatação de moeda BRL, datas, tempo relativo e truncamento de strings.
//
// Exports principais:
//   cn(...classes) → string — merge Tailwind sem conflitos (clsx + twMerge)
//   formatCurrency(value) → string — formata em R$ (pt-BR)
//   formatDate(date) → string — data legível em pt-BR
//   formatRelativeTime(date) → string — "há 2 horas", "ontem", etc.
//   truncate(str, length) → string
// ============================================
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combina clsx + tailwind-merge para evitar classes conflitantes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to BRL
 */
export function formatCurrency(value: number): string {
  const safe = typeof value === 'number' && !isNaN(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safe)
}

/**
 * Format date to pt-BR
 */
export function formatDate(date: string | Date | number, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date
  if (Number.isNaN(d.getTime?.() ?? NaN)) return '—'
  return d.toLocaleDateString('pt-BR', options ?? {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format relative time (e.g. "há 2 horas")
 */
export function formatRelativeTime(date?: string | Date | number | null): string {
  if (!date) return '—'

  const d =
    date instanceof Date
      ? date
      : (typeof date === 'string' || typeof date === 'number')
          ? new Date(date)
          : null

  if (!d || Number.isNaN(d.getTime())) return '—'
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes}min`
  if (hours < 24) return `há ${hours}h`
  if (days < 7) return `há ${days}d`
  return formatDate(d)
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Returns first + last name (e.g. "João Silva" from "João Carlos da Silva")
 */
export function getShortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return name.trim()
  return `${parts[0]} ${parts[parts.length - 1]}`
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

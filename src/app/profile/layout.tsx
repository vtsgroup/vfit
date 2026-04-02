// ============================================
// layout.tsx — Layout de perfil público
// ============================================
//
// O que faz:
//   Layout minimal para páginas de perfil público de personals (/profile/*).
//   Define metadata com robots NO_INDEX.
//
// Exports principais:
//   metadata — Metadata Next.js (robots: noindex)
//   ProfileLayout — layout passthrough
import type { Metadata } from 'next'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

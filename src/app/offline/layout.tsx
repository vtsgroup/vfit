// ============================================
// layout.tsx — Layout da página offline
// ============================================
//
// O que faz:
//   Layout minimal para /offline (exibida pelo service worker quando sem conexão).
//   Define metadata com robots NO_INDEX.
//
// Exports principais:
//   metadata — Metadata Next.js (robots: noindex)
//   OfflineLayout — layout passthrough
import type { Metadata } from 'next'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

// ============================================
// layout.tsx — Layout de rotas de callback OAuth
// ============================================
//
// O que faz:
//   Layout minimal para rotas de callback de autenticação (OAuth, passkey).
//   Define metadata com robots NO_INDEX para evitar indexação das rotas de callback.
//
// Exports principais:
//   metadata — Metadata Next.js (robots: noindex)
//   AuthCallbackLayout — layout passthrough
import type { Metadata } from 'next'
import { NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
}

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

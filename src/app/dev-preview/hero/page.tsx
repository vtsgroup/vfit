/**
 * src/app/dev-preview/hero/page.tsx
 *
 * Preview dev-only do hero da home do aluno (FirstWinCommandCenter + StudentHeader)
 * com dados fixture — permite verificação visual sem autenticação.
 * Bloqueado em produção via notFound().
 */

import { notFound } from 'next/navigation'
import { HeroPreviewClient } from './preview-client'

export default function HeroPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <HeroPreviewClient />
}

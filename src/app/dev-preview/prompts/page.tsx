/**
 * src/app/dev-preview/prompts/page.tsx
 *
 * Showroom dev-only da Fase 2 (Experiência 1000): upsell v2 (3 direções),
 * navbar v2 (3 direções), install banner v2 e gate iOS v2.
 * Bloqueado em produção via notFound().
 */

import { notFound } from 'next/navigation'
import { PromptsPreviewClient } from './preview-client'

export default function PromptsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <PromptsPreviewClient />
}

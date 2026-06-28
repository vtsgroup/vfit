/**
 * src/app/(onboarding)/welcome/layout.tsx
 *
 * Server layout da /welcome — define metadados próprios (título + descrição + OG
 * bons para compartilhamento) sobrescrevendo o do grupo. MANTÉM noindex: /welcome
 * é a entrada do funil (não compete com a home no índice). Apenas repassa children,
 * sem DOM extra (a transição/atmosfera vem do layout do grupo).
 */
import type { Metadata } from 'next'
import { buildSeoMetadata, NO_INDEX_ROBOTS } from '@/lib/seo'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Crie seu plano de treino com IA grátis em 2 minutos | VFIT',
  description:
    'Responda algumas perguntas e a IA do VFIT monta um plano de treino personalizado pelo seu objetivo, nível, rotina e equipamentos. 30 dias grátis, sem cartão.',
  path: '/welcome',
  ogImage: '/og/og-default.png',
  robots: NO_INDEX_ROBOTS,
})

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children
}

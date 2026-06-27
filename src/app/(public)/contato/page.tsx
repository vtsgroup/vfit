// ============================================
// page.tsx — Página de Contato
// ============================================
//
// O que faz:
//   Página de contato: PageHero escuro + banda CLARA full-bleed (espelha as
//   seções de conteúdo da home: features/about/FAQ). RSC: metadata + JSON-LD +
//   PageHero. As partes interativas/claras (canais com spotlight, formulário com
//   success state, FAQ claro) vivem no client island ContatoContent.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   ContatoPage — page component (RSC)
import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { ContatoContent } from '@/components/contato/contato-content'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Contato VFIT: suporte, parcerias e atendimento comercial',
  description:
    'Fale com a equipe VFIT por e-mail ou WhatsApp para suporte técnico, parcerias e dúvidas sobre a plataforma.',
  path: '/contato',
  ogImage: '/og/og-contato.png',
})

export default function ContatoPage() {
  return (
    <>
      <PageHero
        title="Fale com a gente"
        subtitle="Dúvidas, sugestões ou parcerias? Adoramos ouvir de vocês."
        badge="Contato"
        breadcrumbs={[{ label: 'Contato', href: '/contato' }]}
      />

      {/* ContactPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contato — VFIT',
          url: 'https://vfit.app.br/contato',
          description: 'Fale com a equipe VFIT por e-mail ou WhatsApp para suporte técnico, parcerias e dúvidas.',
          mainEntity: {
            '@type': 'Organization',
            name: 'VFIT',
            email: 'contato@vfit.app.br',
            url: 'https://vfit.app.br',
          },
        }) }}
      />

      {/* Canais + formulário + FAQ (client island, tema claro) */}
      <ContatoContent />
    </>
  )
}

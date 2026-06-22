// ============================================
// page.tsx — Página de Contato
// ============================================
//
// O que faz:
//   Página de contato com canais de suporte (WhatsApp, email, redes sociais).
//   RSC: metadata estático com buildSeoMetadata.
//   Renderiza PageHero e grid de cards de canal de contato.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   ContatoPage — page component (RSC)
import type { Metadata } from 'next'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_CONTATO } from '@/data/faqs'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Contato VFIT: suporte, parcerias e atendimento comercial',
  description:
    'Fale com a equipe VFIT por e-mail ou WhatsApp para suporte técnico, parcerias e dúvidas sobre a plataforma.',
  path: '/contato',
  ogImage: '/og/og-contato.png',
})

const CHANNELS = [
  {
    icon: 'mail' as DSIconName,
    title: 'E-mail',
    description: 'Respondemos em até 24h',
    value: 'contato@vfit.app.br',
    href: 'mailto:contato@vfit.app.br',
  },
  {
    icon: 'messageCircle' as DSIconName,
    title: 'WhatsApp',
    description: 'Atendimento em horário comercial',
    value: '+55 (11) 99999-0000',
    href: 'https://wa.me/5511999990000',
  },
  {
    icon: 'mapPin' as DSIconName,
    title: 'Localização',
    description: 'São Paulo, SP — Brasil',
    value: '100% Remoto',
    href: '#',
  },
  {
    icon: 'clock' as DSIconName,
    title: 'Horário',
    description: 'Seg-Sex',
    value: '9h às 18h (BRT)',
    href: '#',
  },
]

export default function ContatoPage() {
  return (
    <>
      <PageHero
        title="Fale com a gente"
        subtitle="Dúvidas, sugestões ou parcerias? Adoramos ouvir de vocês."
        badge="Contato"
        breadcrumbs={[{ label: 'Contato', href: '/contato' }]}
      />

      <div className="mx-auto max-w-5xl px-6 space-y-16 pb-24">
      <PageMetadata lastUpdated="14 de fevereiro de 2026" readingTime="3 min" />

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

      {/* Contact channels */}
      <section className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((ch) => {
          const cardClassName =
            'group rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] backdrop-blur-sm'
          const content = (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <DSIcon name={ch.icon} />
              </div>
              <div>
                <h3 className="font-semibold text-white">{ch.title}</h3>
                <p className="text-sm text-zinc-500">{ch.description}</p>
                <p className="mt-1 text-sm font-medium text-brand-primary">{ch.value}</p>
              </div>
            </div>
          )

          // Informational-only channels (no real destination) render as a non-interactive div.
          if (ch.href === '#') {
            return (
              <div key={ch.title} className={cardClassName}>
                {content}
              </div>
            )
          }

          return (
            <a
              key={ch.title}
              href={ch.href}
              className={`${cardClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base`}
              {...(ch.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {content}
            </a>
          )
        })}
      </section>

      {/* Contact Form */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <h2 className="text-2xl font-bold text-white mb-6">Envie uma mensagem</h2>
        <form className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contato-nome" className="mb-1.5 block text-sm font-medium text-zinc-300">Nome</label>
              <input
                id="contato-nome"
                name="nome"
                type="text"
                placeholder="Seu nome"
                className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="contato-email" className="mb-1.5 block text-sm font-medium text-zinc-300">E-mail</label>
              <input
                id="contato-email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contato-assunto" className="mb-1.5 block text-sm font-medium text-zinc-300">Assunto</label>
            <div className="relative">
              <select id="contato-assunto" name="assunto" className="w-full cursor-pointer appearance-none rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 pr-10 text-sm text-white transition-colors duration-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none">
                <option value="" className="bg-bg-dark text-zinc-400">Selecione</option>
                <option value="support" className="bg-bg-dark text-white">Suporte Técnico</option>
                <option value="partnership" className="bg-bg-dark text-white">Parcerias</option>
                <option value="billing" className="bg-bg-dark text-white">Financeiro</option>
                <option value="feedback" className="bg-bg-dark text-white">Feedback</option>
                <option value="other" className="bg-bg-dark text-white">Outro</option>
              </select>
              <DSIcon name="chevronDown" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
          <div>
            <label htmlFor="contato-mensagem" className="mb-1.5 block text-sm font-medium text-zinc-300">Mensagem</label>
            <textarea
              id="contato-mensagem"
              name="mensagem"
              rows={5}
              placeholder="Escreva sua mensagem..."
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none resize-none"
            />
          </div>
          <Button type="submit" size="lg">
            <DSIcon name="send" size={16} />
            Enviar Mensagem
          </Button>
        </form>
      </section>

      {/* FAQ */}
      <FaqInline items={FAQ_CONTATO} />
      </div>
    </>
  )
}

/**
 * src/app/(public)/excluir-conta/page.tsx
 *
 * Exclusão de Conta — Google Play Data Deletion Requirement
 *
 * Exports: metadata, ExcluirContaPage
 * Features: DSIcon
 */

// ============================================
// Exclusão de Conta — Google Play Data Deletion Requirement
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { ProfileReturnLink } from '@/components/profile/settings-shell'
import { FAQ_EXCLUIR_CONTA } from '@/data/faqs'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Excluir Conta e Dados — VFIT',
  description:
    'Solicite a exclusão da sua conta e dados pessoais na VFIT. Processo em conformidade com a LGPD (Lei Geral de Proteção de Dados).',
  path: '/excluir-conta',
})

export default function ExcluirContaPage() {
  return (
    <>
      <PageHero
        title="Excluir Conta e Dados"
        subtitle="Solicite a exclusão da sua conta conforme a LGPD (Art. 16 e 18)"
        badge="Exclusão de Dados"
        breadcrumbs={[{ label: 'Legal', href: '/termos' }, { label: 'Excluir Conta', href: '/excluir-conta' }]}
      />

      <ProfileReturnLink />

      <div className="mx-auto max-w-2xl px-6 pb-24">
        <PageMetadata lastUpdated="14 de fevereiro de 2026" readingTime="3 min" />

        {/* Option 1: Self-service */}
        <section className="mb-8 rounded-2xl border border-border-light bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
              <DSIcon name="settings" size={20} className="text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Opção 1 — Excluir pelo App (Recomendado)
            </h2>
          </div>
          <ol className="ml-4 space-y-3 text-sm text-text-secondary list-decimal">
            <li>
              Faça login na sua conta em{' '}
              <Link href="/login" className="text-brand-primary hover:underline">
                vfit.app.br/login
              </Link>
            </li>
            <li>
              Acesse{' '}
              <strong className="text-text-primary">Configurações</strong> no menu
            </li>
            <li>
              Na seção <strong className="text-text-primary">Privacidade e LGPD</strong>,
              clique em <strong className="text-red-400">Excluir conta</strong>
            </li>
            <li>
              Confirme digitando <code className="rounded bg-bg-primary px-1.5 py-0.5 text-xs text-red-400">EXCLUIR</code> e clique em confirmar
            </li>
          </ol>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90"
            >
              <DSIcon name="logIn" size={16} />
              Fazer login para excluir
            </Link>
          </div>
        </section>

        {/* Option 2: Email */}
        <section className="mb-8 rounded-2xl border border-border-light bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <DSIcon name="mail" size={20} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Opção 2 — Solicitar por E-mail
            </h2>
          </div>
          <p className="mb-3 text-sm text-text-secondary">
            Caso não consiga acessar sua conta, envie um e-mail para:
          </p>
          <a
            href="mailto:contato@vfit.app.br?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20conta&body=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20a%20exclus%C3%A3o%20da%20minha%20conta%20e%20dados%20pessoais.%0A%0AE-mail%20cadastrado%3A%20%0ANome%20completo%3A%20"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
          >
            <DSIcon name="mail" size={16} />
            contato@vfit.app.br
          </a>
          <p className="mt-3 text-xs text-text-muted">
            Inclua no e-mail: nome completo e e-mail cadastrado na plataforma.
          </p>
        </section>

        {/* What gets deleted */}
        <section className="mb-8 rounded-2xl border border-border-light bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <DSIcon name="alertTriangle" size={20} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              O que será excluído
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            {[
              'Dados pessoais (nome, e-mail, telefone, foto de perfil)',
              'Avaliações físicas e medidas corporais',
              'Treinos e histórico de exercícios',
              'Conversas no chat',
              'Fotos e vídeos enviados',
              'Histórico de pagamentos (dados financeiros anonimizados)',
              'Preferências e configurações',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <DSIcon name="checkCircle2" size={16} className="mt-0.5 shrink-0 text-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Timeline and legal */}
        <section className="mb-8 rounded-2xl border border-border-light bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
              <DSIcon name="shield" size={20} className="text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Prazo e Base Legal
            </h2>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>
              <strong className="text-text-primary">Prazo:</strong> A exclusão é processada em até{' '}
              <strong className="text-text-primary">15 dias úteis</strong> após a solicitação,
              conforme Art. 18 da LGPD.
            </p>
            <p>
              <strong className="text-text-primary">Anonimização:</strong> Dados pessoais são anonimizados
              (substituídos por valores genéricos). Dados agregados e estatísticos podem ser retidos
              de forma anônima para fins de melhoria do serviço.
            </p>
            <p>
              <strong className="text-text-primary">Retenção legal:</strong> Registros financeiros
              podem ser retidos por até 5 anos conforme legislação fiscal brasileira (Art. 174, CTN),
              mas sem vinculação a dados pessoais identificáveis.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <div className="mb-8">
          <FaqInline items={FAQ_EXCLUIR_CONTA} />
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-text-muted">
          <Link href="/privacidade" className="hover:text-brand-primary transition-colors">
            Política de Privacidade
          </Link>
          <span className="text-border-primary">·</span>
          <Link href="/termos" className="hover:text-brand-primary transition-colors">
            Termos de Uso
          </Link>
          <span className="text-border-primary">·</span>
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    </>
  )
}

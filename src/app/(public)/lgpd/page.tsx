// ============================================
// page.tsx — Página LGPD (Lei Geral de Proteção de Dados)
// ============================================
//
// O que faz:
//   Página informativa sobre conformidade com LGPD.
//   RSC: metadata estático com buildSeoMetadata.
//   Renderiza PageHero, conteúdo legal e PageMetadata.
//
// Exports principais:
//   metadata — Metadata Next.js para SEO
//   LgpdPage — page component (RSC)
import type { Metadata } from 'next'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_LGPD } from '@/data/faqs'

export const metadata: Metadata = buildSeoMetadata({
  title: 'LGPD na VFIT: direitos, segurança e tratamento de dados',
  description:
    'Entenda como a VFIT aplica a LGPD, protege dados pessoais e disponibiliza canais para exercer seus direitos.',
  path: '/lgpd',
})

const RIGHTS = [
  { icon: 'eye' as DSIconName, title: 'Acesso', description: 'Solicite uma cópia de todos os seus dados pessoais a qualquer momento.' },
  { icon: 'fileText' as DSIconName, title: 'Correção', description: 'Corrija dados pessoais incorretos ou desatualizados na sua conta.' },
  { icon: 'alertTriangle' as DSIconName, title: 'Exclusão', description: 'Solicite a exclusão completa dos seus dados (direito ao esquecimento).' },
  { icon: 'lock' as DSIconName, title: 'Portabilidade', description: 'Exporte seus dados em formato estruturado para migrar para outro serviço.' },
  { icon: 'userCheck' as DSIconName, title: 'Revogação', description: 'Revogue o consentimento dado para tratamento dos seus dados.' },
  { icon: 'helpCircle' as DSIconName, title: 'Informação', description: 'Saiba quais dados coletamos, por quê, e com quem compartilhamos.' },
]

const MEASURES = [
  'Criptografia TLS 1.3 em todas as comunicações',
  'Senhas armazenadas com bcrypt (cost 12)',
  'Tokens JWT com expiração de 1 hora',
  'Rate limiting para proteção contra ataques',
  'Headers de segurança (CSP, HSTS, X-Frame)',
  'Dados hospedados em infraestrutura Cloudflare (ISO 27001)',
  'Banco de dados PostgreSQL com SSL obrigatório',
  'Logs de acesso e auditoria de dados sensíveis',
]

export default function LgpdPage() {
  return (
    <>
      <PageHero
        title="Proteção de Dados Pessoais"
        subtitle="A VFIT está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Sua privacidade e segurança são nossa prioridade."
        badge="LGPD"
        breadcrumbs={[{ label: 'Legal', href: '/termos' }, { label: 'LGPD', href: '/lgpd' }]}
      />

      <div className="mx-auto max-w-5xl px-6 space-y-16 pb-24">
      <PageMetadata lastUpdated="14 de fevereiro de 2026" readingTime="4 min" />
      {/* Your Rights */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">Seus Direitos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RIGHTS.map((right) => (
            <div
              key={right.title}
              className="group rounded-2xl border border-white/8 bg-white/3 p-6 transition-all duration-300 hover:border-brand-primary/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <DSIcon name={right.icon} size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{right.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{right.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Collection */}
      <section className="rounded-2xl border border-white/8 bg-white/3 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Dados que Coletamos</h2>
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Dados de Cadastro</h3>
            <p>Nome completo, e-mail, telefone, data de nascimento, tipo de conta (personal trainer ou aluno). Para personal trainers: CREF, especialidades, foto de perfil.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Dados de Saúde (Alunos)</h3>
            <p>Peso, altura, percentual de gordura, medidas corporais, histórico de treinos, fotos de evolução. Esses dados são coletados exclusivamente pelo seu personal trainer e tratados com consentimento explícito.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Dados Financeiros</h3>
            <p>Informações de pagamento processadas pelo Asaas (intermediário PCI DSS compliant). Não armazenamos dados de cartão de crédito em nossos servidores.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Dados de Navegação</h3>
            <p>Analytics via Google Analytics 4 (anonimizado), Cloudflare Analytics Engine. Cookies essenciais e de performance (veja nossa <a href="/cookies" className="text-brand-primary hover:underline">Política de Cookies</a>).</p>
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">Medidas de Segurança</h2>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {MEASURES.map((measure) => (
              <li key={measure} className="flex items-start gap-3 text-sm text-zinc-400">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                {measure}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <FaqInline items={FAQ_LGPD} />

      {/* DPO Contact */}
      <section className="text-center rounded-2xl border border-brand-primary/20 bg-brand-primary/3 p-8">
        <DSIcon name="mail" size={32} className="mx-auto text-brand-primary mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Encarregado de Dados (DPO)</h2>
        <p className="text-zinc-400 mb-4 max-w-lg mx-auto">
          Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus dados pessoais,
          entre em contato com nosso Encarregado de Proteção de Dados.
        </p>
        <a
          href="mailto:lgpd@iapersonal.app.br"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-bg-dark transition-all hover:bg-brand-primary-hover"
        >
          <DSIcon name="mail" size={16} />
          lgpd@iapersonal.app.br
        </a>
      </section>
      </div>
    </>
  )
}

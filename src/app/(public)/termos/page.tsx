/**
 * src/app/(public)/termos/page.tsx
 *
 * Termos de Uso — Ultra Moderno, Enterprise
 *
 * Exports: metadata, TermosPage
 * Features: DSIcon
 */

// ============================================
// Termos de Uso — Ultra Moderno, Enterprise
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_TERMOS } from '@/data/faqs'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Termos de Uso da VFIT: condições da plataforma',
  description:
    'Leia os Termos de Uso da VFIT com regras, responsabilidades, pagamentos e condições legais de utilização.',
  path: '/termos',
})

const LAST_UPDATED = '14 de fevereiro de 2026'
const VERSION = '2.0'

function Section({ icon, title, id, children }: {
  icon: DSIconName; title: string; id: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
          <DSIcon name={icon} size={20} className="text-brand-primary" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-3 pl-13 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  )
}

export default function TermosPage() {
  return (
    <>
      <PageHero
        title="Termos de Uso"
        subtitle={`Versão ${VERSION} · Última atualização: ${LAST_UPDATED}`}
        badge="Legal"
        breadcrumbs={[{ label: 'Legal', href: '/termos' }, { label: 'Termos de Uso', href: '/termos' }]}
      />

      <div className="mx-auto max-w-4xl px-6 space-y-12 pb-24">
      <PageMetadata lastUpdated={LAST_UPDATED} version={VERSION} readingTime="8 min" />
      {/* Table of Contents */}
      <nav className="rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Índice
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { id: 'aceitacao', label: '1. Aceitação dos Termos' },
            { id: 'servicos', label: '2. Descrição dos Serviços' },
            { id: 'cadastro', label: '3. Cadastro e Conta' },
            { id: 'responsabilidades', label: '4. Responsabilidades' },
            { id: 'pagamentos', label: '5. Pagamentos e Taxas' },
            { id: 'proibicoes', label: '6. Uso Proibido' },
            { id: 'propriedade', label: '7. Propriedade Intelectual' },
            { id: 'rescisao', label: '8. Rescisão' },
            { id: 'limitacao', label: '9. Limitação de Responsabilidade' },
            { id: 'disposicoes', label: '10. Disposições Gerais' },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/4 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Sections */}
      <div className="space-y-10">
        <Section icon="shield" title="1. Aceitação dos Termos" id="aceitacao">
          <p>
            Ao acessar ou utilizar a plataforma <strong className="text-white">VFIT</strong> (&ldquo;Plataforma&rdquo;),
            operada por <strong className="text-white">VFIT (Personal IA Tecnologia LTDA)</strong>, inscrita no CNPJ/MF
            sob o nº XX.XXX.XXX/0001-XX, você (&ldquo;Usuário&rdquo;) concorda integralmente com estes Termos de Uso.
          </p>
          <p>
            Caso não concorde com qualquer disposição, interrompa imediatamente o uso da Plataforma.
            O uso continuado após alterações constitui aceitação tácita das mudanças.
          </p>
          <p>
            Estes Termos são regidos pela legislação brasileira, em especial o{' '}
            <strong className="text-white">Marco Civil da Internet</strong> (Lei nº 12.965/2014),
            o <strong className="text-white">Código de Defesa do Consumidor</strong> (Lei nº 8.078/1990)
            e a <strong className="text-white">Lei Geral de Proteção de Dados</strong> (Lei nº 13.709/2018 — LGPD).
          </p>
        </Section>

        <Section icon="fileText" title="2. Descrição dos Serviços" id="servicos">
          <p>A Plataforma oferece ferramentas para:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Gestão de alunos e seus treinos personalizados</li>
            <li>Geração de treinos utilizando Inteligência Artificial</li>
            <li>Avaliações físicas com fotos e evolução de medidas</li>
            <li>Cobranças automatizadas via PIX, boleto e cartão de crédito</li>
            <li>Comunicação entre personal trainers e alunos</li>
            <li>Marketplace de planos de treino</li>
            <li>Programa de afiliados com comissões automáticas</li>
          </ul>
          <p>
            A Plataforma atua como <strong className="text-white">intermediadora tecnológica</strong>,
            não sendo responsável pela relação contratual entre personal trainers e alunos.
          </p>
        </Section>

        <Section icon="shield" title="3. Cadastro e Conta" id="cadastro">
          <p>Para utilizar os serviços, o Usuário deve:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Ter 18 anos ou mais, ou contar com autorização do responsável legal</li>
            <li>Fornecer informações verídicas, completas e atualizadas</li>
            <li>Manter a confidencialidade de suas credenciais de acesso</li>
            <li>Para Personal Trainers: possuir registro ativo no CREF</li>
          </ul>
          <p>
            O Usuário é <strong className="text-white">integralmente responsável</strong> por todas as atividades
            realizadas em sua conta. Em caso de uso não autorizado, comunique imediatamente
            através de <strong className="text-white">suporte@vfit.app.br</strong>.
          </p>
        </Section>

        <Section icon="scale" title="4. Responsabilidades" id="responsabilidades">
          <p><strong className="text-white">Da Plataforma:</strong></p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Manter os serviços disponíveis com SLA de 99.5% de uptime</li>
            <li>Proteger dados pessoais conforme a LGPD</li>
            <li>Processar pagamentos de forma segura via gateways certificados PCI-DSS</li>
            <li>Notificar usuários sobre alterações relevantes com antecedência mínima de 15 dias</li>
          </ul>
          <p><strong className="text-white">Do Personal Trainer:</strong></p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Possuir habilitação profissional válida (CREF ativo)</li>
            <li>Responsabilizar-se pela prescrição de exercícios e segurança do aluno</li>
            <li>Cumprir obrigações tributárias e trabalhistas aplicáveis</li>
            <li>Manter dados de alunos em conformidade com a LGPD</li>
          </ul>
          <p><strong className="text-white">Do Aluno:</strong></p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Fornecer informações de saúde verdadeiras</li>
            <li>Consultar médico antes de iniciar qualquer programa de exercícios</li>
            <li>Cumprir com os pagamentos acordados</li>
          </ul>
        </Section>

        <Section icon="creditCard" title="5. Pagamentos e Taxas" id="pagamentos">
          <p>
            Pagamentos são processados via <strong className="text-white">Asaas</strong> e/ou{' '}
            <strong className="text-white">Stripe</strong>, gateways certificados PCI-DSS.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-white">Taxa da plataforma:</strong> 3.5% sobre cada transação processada
            </li>
            <li>
              <strong className="text-white">Planos de assinatura:</strong> Grátis (gratuito para sempre, até 5 alunos), Pro (R$ 29,90/mês), Pro+ (R$ 69,90/mês), Max (R$ 129,90/mês)
            </li>
            <li>
              <strong className="text-white">Saques:</strong> PIX instantâneo, sujeito ao saldo disponível e prazo de compensação
            </li>
            <li>
              <strong className="text-white">Reembolsos:</strong> Conforme política do CDC, no prazo de 7 dias para arrependimento
            </li>
          </ul>
          <p>
            A Plataforma se reserva o direito de alterar valores com notificação prévia de 30 dias.
          </p>
        </Section>

        <Section icon="ban" title="6. Uso Proibido" id="proibicoes">
          <p>É vedado ao Usuário:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Utilizar a Plataforma para fins ilegais ou não autorizados</li>
            <li>Compartilhar credenciais de acesso com terceiros</li>
            <li>Realizar engenharia reversa, scraping ou acesso automatizado não autorizado</li>
            <li>Publicar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros</li>
            <li>Tentar comprometer a segurança, integridade ou disponibilidade da Plataforma</li>
            <li>Criar contas falsas ou utilizar identidade de terceiros</li>
          </ul>
          <p>
            Violações podem resultar em <strong className="text-white">suspensão ou exclusão imediata</strong> da conta,
            sem prejuízo de medidas judiciais cabíveis.
          </p>
        </Section>

        <Section icon="refresh" title="7. Propriedade Intelectual" id="propriedade">
          <p>
            Todo o conteúdo da Plataforma — incluindo marca, logotipo, layout, código-fonte,
            algoritmos de IA e textos — é de propriedade exclusiva da{' '}
            <strong className="text-white">VFIT (Personal IA Tecnologia LTDA)</strong> ou de seus licenciantes.
          </p>
          <p>
            Os treinos gerados por IA são licenciados ao Usuário para uso pessoal e profissional
            dentro da Plataforma. É vedada a revenda ou distribuição massiva sem autorização.
          </p>
          <p>
            O conteúdo criado pelos Usuários (treinos manuais, avaliações, fotos) permanece
            de propriedade do respectivo Usuário, sendo concedida à Plataforma licença de uso
            limitada para fins de operação dos serviços.
          </p>
        </Section>

        <Section icon="alertTriangle" title="8. Rescisão" id="rescisao">
          <p>
            O Usuário pode encerrar sua conta a qualquer momento através das configurações
            da Plataforma ou solicitando via <strong className="text-white">suporte@vfit.app.br</strong>.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Dados pessoais serão anonimizados conforme a LGPD</li>
            <li>Saldos pendentes serão processados conforme a política de saques</li>
            <li>Dados podem ser mantidos pelo prazo legal quando aplicável</li>
          </ul>
          <p>
            A Plataforma pode suspender ou encerrar contas que violem estes Termos,
            com notificação prévia quando possível.
          </p>
        </Section>

        <Section icon="shield" title="9. Limitação de Responsabilidade" id="limitacao">
          <p>
            A Plataforma <strong className="text-white">não se responsabiliza por</strong>:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Lesões ou danos decorrentes da execução de treinos prescritos</li>
            <li>Inadimplência entre personal trainers e alunos</li>
            <li>Interrupções causadas por caso fortuito ou força maior</li>
            <li>Conteúdo gerado pela IA que possa ser inadequado para condições médicas específicas</li>
          </ul>
          <p>
            Em qualquer hipótese, a responsabilidade total da Plataforma limita-se ao
            valor pago pelo Usuário nos últimos 12 meses.
          </p>
        </Section>

        <Section icon="gavel" title="10. Disposições Gerais" id="disposicoes">
          <p>
            <strong className="text-white">Foro:</strong> Fica eleito o foro da Comarca de São Paulo/SP
            para dirimir quaisquer controvérsias.
          </p>
          <p>
            <strong className="text-white">Alterações:</strong> A Plataforma pode atualizar estes Termos,
            notificando os Usuários com antecedência mínima de 15 dias via e-mail ou notificação in-app.
          </p>
          <p>
            <strong className="text-white">Cessão:</strong> O Usuário não poderá ceder ou transferir seus
            direitos sem consentimento prévio e expresso da Plataforma.
          </p>
          <p>
            <strong className="text-white">Integralidade:</strong> Estes Termos, juntamente com a{' '}
            <Link href="/privacidade" className="text-brand-primary hover:underline">
              Política de Privacidade
            </Link>{' '}
            e a{' '}
            <Link href="/cookies" className="text-brand-primary hover:underline">
              Política de Cookies
            </Link>
            , constituem o acordo integral entre o Usuário e a Plataforma.
          </p>
        </Section>
      </div>

      {/* FAQ */}
      <FaqInline items={FAQ_TERMOS} />

      {/* Contact */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">
        <p className="text-sm text-zinc-400">
          Dúvidas sobre estes Termos? Entre em contato:
        </p>
        <p className="mt-2 text-sm font-semibold text-white">suporte@vfit.app.br</p>
      </div>
      </div>
    </>
  )
}

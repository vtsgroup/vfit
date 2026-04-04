/**
 * src/app/(public)/privacidade/page.tsx
 *
 * Política de Privacidade — LGPD Compliant, Enterprise
 *
 * Exports: metadata, PrivacidadePage
 * Features: DSIcon
 */

// ============================================
// Política de Privacidade — LGPD Compliant, Enterprise
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { FAQ_PRIVACIDADE } from '@/data/faqs'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Política de Privacidade VFIT (LGPD)',
  description:
    'Conheça as regras de coleta, uso, armazenamento e compartilhamento de dados na Política de Privacidade da VFIT.',
  path: '/privacidade',
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

function DataTable({ rows }: { rows: { data: string; purpose: string; base: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/3">
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Dado</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Finalidade</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Base Legal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/4 last:border-0">
              <td className="px-4 py-3 text-zinc-300">{row.data}</td>
              <td className="px-4 py-3 text-zinc-400">{row.purpose}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                  {row.base}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacidadePage() {
  return (
    <>
      <PageHero
        title="Política de Privacidade"
        subtitle="Conheça as regras de coleta, uso, armazenamento e compartilhamento de dados na VFIT, em conformidade com a LGPD."
        badge="LGPD Compliant"
        breadcrumbs={[{ label: 'Legal', href: '/termos' }, { label: 'Privacidade', href: '/privacidade' }]}
      />

      <div className="mx-auto max-w-4xl px-6 space-y-12 pb-24">
      <PageMetadata lastUpdated={LAST_UPDATED} version={VERSION} readingTime="10 min" />
      {/* LGPD Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: 'shield' as DSIconName, title: 'LGPD Compliant', desc: 'Conformidade total com a Lei Geral de Proteção de Dados' },
          { icon: 'lock' as DSIconName, title: 'Criptografia', desc: 'Dados em trânsito (TLS 1.3) e em repouso (AES-256)' },
          { icon: 'userX' as DSIconName, title: 'Direito ao Esquecimento', desc: 'Exclua sua conta e dados a qualquer momento' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5">
            <DSIcon name={item.icon} size={20} className="mb-3 text-brand-primary" />
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* TOC */}
      <nav className="rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Índice
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { id: 'controlador', label: '1. Controlador de Dados' },
            { id: 'coleta', label: '2. Dados Coletados' },
            { id: 'finalidade', label: '3. Finalidade do Tratamento' },
            { id: 'compartilhamento', label: '4. Compartilhamento' },
            { id: 'armazenamento', label: '5. Armazenamento e Segurança' },
            { id: 'cookies', label: '6. Cookies e Rastreamento' },
            { id: 'direitos', label: '7. Seus Direitos (LGPD)' },
            { id: 'retencao', label: '8. Retenção de Dados' },
            { id: 'menores', label: '9. Menores de Idade' },
            { id: 'alteracoes', label: '10. Alterações e Contato' },
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
        <Section icon="fileText" title="1. Controlador de Dados" id="controlador">
          <p>
            <strong className="text-white">VFIT (Personal IA Tecnologia LTDA)</strong><br />
            CNPJ: XX.XXX.XXX/0001-XX<br />
            Endereço: São Paulo/SP, Brasil<br />
            DPO (Encarregado): <strong className="text-white">dpo@vfit.app.br</strong>
          </p>
        </Section>

        <Section icon="database" title="2. Dados Coletados" id="coleta">
          <p className="mb-4">Coletamos os seguintes dados, organizados por categoria:</p>
          <DataTable rows={[
            { data: 'Nome, Email, CPF', purpose: 'Cadastro e identificação', base: 'Execução contratual' },
            { data: 'Telefone', purpose: 'Comunicação e verificação', base: 'Consentimento' },
            { data: 'CREF e Estado', purpose: 'Validação profissional (personal)', base: 'Obrigação legal' },
            { data: 'Fotos de perfil e avaliação', purpose: 'Visualização e evolução', base: 'Consentimento' },
            { data: 'Peso, gordura, medidas', purpose: 'Avaliação física e IA', base: 'Consentimento' },
            { data: 'Dados de pagamento', purpose: 'Processamento financeiro', base: 'Execução contratual' },
            { data: 'IP, User-Agent, Device', purpose: 'Segurança e analytics', base: 'Legítimo interesse' },
            { data: 'Dados de navegação', purpose: 'Melhoria da plataforma', base: 'Legítimo interesse' },
          ]} />
          <p className="mt-4">
            <strong className="text-white">Dados sensíveis:</strong> Informações de saúde (peso, gordura corporal, restrições médicas)
            são tratadas com proteção reforçada e somente com seu consentimento explícito.
          </p>
        </Section>

        <Section icon="eye" title="3. Finalidade do Tratamento" id="finalidade">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Prestação dos serviços contratados (gestão de treinos, cobranças, avaliações)</li>
            <li>Geração de treinos personalizados via Inteligência Artificial</li>
            <li>Processamento seguro de pagamentos via Asaas/Stripe</li>
            <li>Envio de notificações push e in-app (OneSignal)</li>
            <li>Melhoria contínua da plataforma através de analytics</li>
            <li>Prevenção a fraudes e segurança da plataforma</li>
            <li>Cumprimento de obrigações legais e regulatórias</li>
          </ul>
        </Section>

        <Section icon="globe" title="4. Compartilhamento de Dados" id="compartilhamento">
          <p>Seus dados podem ser compartilhados com:</p>
          <DataTable rows={[
            { data: 'Asaas / Stripe', purpose: 'Processamento de pagamentos', base: 'Execução contratual' },
            { data: 'OneSignal', purpose: 'Notificações push', base: 'Consentimento' },
            { data: 'Replicate', purpose: 'Geração de treinos por IA', base: 'Execução contratual' },
            { data: 'Cloudflare', purpose: 'Hospedagem e CDN', base: 'Execução contratual' },
            { data: 'Provedor gerenciado de PostgreSQL', purpose: 'Banco de dados', base: 'Execução contratual' },
            { data: 'Resend', purpose: 'Email transacional', base: 'Execução contratual' },
          ]} />
          <p className="mt-4">
            <strong className="text-white">Nunca vendemos seus dados.</strong> Compartilhamos apenas o
            mínimo necessário com parceiros técnicos para operação dos serviços.
          </p>
        </Section>

        <Section icon="server" title="5. Armazenamento e Segurança" id="armazenamento">
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-white">Dados em trânsito:</strong> TLS 1.3 em todas as comunicações</li>
            <li><strong className="text-white">Senhas:</strong> Hash bcrypt (cost factor 12), nunca armazenadas em texto puro</li>
            <li><strong className="text-white">Tokens:</strong> JWT com HMAC-SHA256, expiração em 1 hora</li>
            <li><strong className="text-white">Banco de dados:</strong> PostgreSQL com SSL obrigatório (provedor gerenciado, região sa-east-1)</li>
            <li><strong className="text-white">Arquivos:</strong> Cloudflare R2 com acesso autenticado</li>
            <li><strong className="text-white">Rate limiting:</strong> Proteção contra ataques de força bruta</li>
            <li><strong className="text-white">CAPTCHA:</strong> Cloudflare Turnstile em formulários sensíveis</li>
          </ul>
        </Section>

        <Section icon="settings" title="6. Cookies e Rastreamento" id="cookies">
          <p>
            Utilizamos cookies estritamente necessários e cookies de analytics para
            melhoria da plataforma. Para detalhes completos, consulte nossa{' '}
            <Link href="/cookies" className="text-brand-primary hover:underline">
              Política de Cookies
            </Link>.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-white">Necessários:</strong> autenticação, sessão, preferências — não requerem consentimento</li>
            <li><strong className="text-white">Analytics:</strong> Cloudflare Analytics Engine — auto-aprovados conforme legítimo interesse</li>
            <li><strong className="text-white">Não utilizamos:</strong> cookies de terceiros para publicidade</li>
          </ul>
        </Section>

        <Section icon="scale" title="7. Seus Direitos (LGPD — Art. 18)" id="direitos">
          <p>Você tem direito a:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: 'eye' as DSIconName, title: 'Acesso', desc: 'Solicitar cópia de todos os seus dados pessoais' },
              { icon: 'settings' as DSIconName, title: 'Correção', desc: 'Retificar dados incompletos ou desatualizados' },
              { icon: 'userX' as DSIconName, title: 'Exclusão', desc: 'Solicitar a eliminação dos seus dados (anonimização)' },
              { icon: 'download' as DSIconName, title: 'Portabilidade', desc: 'Exportar seus dados em formato legível por máquina' },
              { icon: 'bell' as DSIconName, title: 'Oposição', desc: 'Revogar consentimento para tratamento específico' },
              { icon: 'lock' as DSIconName, title: 'Informação', desc: 'Saber com quem seus dados são compartilhados' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/4 bg-white/1 p-3">
                <DSIcon name={item.icon} size={16} className="mt-0.5 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-xs font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4">
            Para exercer qualquer direito, acesse <strong className="text-white">Configurações → Minha Conta</strong> na
            Plataforma, ou envie e-mail para <strong className="text-white">dpo@vfit.app.br</strong>.
            Responderemos em até <strong className="text-white">15 dias úteis</strong>.
          </p>
        </Section>

        <Section icon="lock" title="8. Retenção de Dados" id="retencao">
          <DataTable rows={[
            { data: 'Dados de conta', purpose: 'Enquanto a conta estiver ativa', base: 'Execução contratual' },
            { data: 'Dados financeiros', purpose: '5 anos (obrigação fiscal)', base: 'Obrigação legal' },
            { data: 'Logs de acesso', purpose: '6 meses (Marco Civil da Internet)', base: 'Obrigação legal' },
            { data: 'Dados de analytics', purpose: '24 meses (agregados e anonimizados)', base: 'Legítimo interesse' },
            { data: 'Dados pós-exclusão', purpose: 'Anonimizados imediatamente', base: 'LGPD Art. 16' },
          ]} />
        </Section>

        <Section icon="shield" title="9. Menores de Idade" id="menores">
          <p>
            A Plataforma não é destinada a menores de 18 anos. Caso um menor utilize
            os serviços, deverá contar com autorização expressa do responsável legal.
            Se identificarmos dados de menores sem autorização, procederemos à exclusão imediata.
          </p>
        </Section>

        <Section icon="bell" title="10. Alterações e Contato" id="alteracoes">
          <p>
            Podemos atualizar esta Política periodicamente. Alterações significativas
            serão comunicadas com antecedência mínima de <strong className="text-white">15 dias</strong> via
            e-mail ou notificação in-app.
          </p>
          <div className="mt-4 rounded-xl border border-white/8 bg-white/3 p-4">
            <p className="text-xs font-semibold text-white">Canais de contato:</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              <li>📧 DPO: <strong className="text-white">dpo@vfit.app.br</strong></li>
              <li>📧 Suporte: <strong className="text-white">suporte@vfit.app.br</strong></li>
              <li>🌐 Site: <strong className="text-white">vfit.app.br</strong></li>
            </ul>
          </div>
        </Section>

        {/* FAQ */}
        <FaqInline items={FAQ_PRIVACIDADE} />
      </div>
      </div>
    </>
  )
}

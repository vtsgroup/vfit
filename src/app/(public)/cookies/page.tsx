/**
 * src/app/(public)/cookies/page.tsx
 *
 * Política de Cookies — Enterprise, Auto-Approve Analytics
 *
 * Exports: metadata, CookiesPage
 * Features: DSIcon
 */

// ============================================
// Política de Cookies — Enterprise, Auto-Approve Analytics
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { PageMetadata } from '@/components/shared/page-metadata'
import { FaqInline } from '@/components/shared/faq-inline'
import { ProfileReturnLink } from '@/components/profile/settings-shell'
import { FAQ_COOKIES } from '@/data/faqs'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Política de Cookies da VFIT (LGPD)',
  description:
    'Saiba quais cookies e tecnologias a VFIT utiliza, com foco em segurança, performance e conformidade LGPD.',
  path: '/cookies',
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

function CookieCard({ name, type, purpose, duration, required }: {
  name: string; type: string; purpose: string; duration: string; required: boolean
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <code className="text-xs font-semibold text-white">{name}</code>
          <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
            required
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-brand-primary/10 text-brand-primary'
          }`}>
            {type}
          </span>
        </div>
        {required && (
          <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
            Obrigatório
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-500">{purpose}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <DSIcon name="clock" size={12} className="text-zinc-600" />
        <span className="text-[10px] text-zinc-600">{duration}</span>
      </div>
    </div>
  )
}

export default function CookiesPage() {
  return (
    <>
      <PageHero
        title="Política de Cookies"
        subtitle="Saiba quais cookies e tecnologias a VFIT utiliza, com foco em segurança, performance e conformidade LGPD."
        badge="Cookies"
        breadcrumbs={[{ label: 'Legal', href: '/termos' }, { label: 'Cookies', href: '/cookies' }]}
        appHeaderContinuation
      />

      <ProfileReturnLink />

      <div className="mx-auto max-w-4xl px-6 space-y-12 pb-24">
      <PageMetadata lastUpdated={LAST_UPDATED} version={VERSION} readingTime="6 min" />
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: 'lock' as DSIconName, title: 'Sem Publicidade', desc: 'Não usamos cookies de anúncios ou rastreamento de terceiros' },
          { icon: 'barChart' as DSIconName, title: 'Analytics Próprio', desc: 'Cloudflare Analytics Engine — privacy-first, sem cookies de terceiros' },
          { icon: 'toggleRight' as DSIconName, title: 'Seu Controle', desc: 'Gerencie cookies não essenciais a qualquer momento' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5">
            <DSIcon name={item.icon} size={20} className="mb-3 text-brand-primary" />
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-10">
        <Section icon="info" title="1. O Que São Cookies?" id="definicao">
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador quando
            você visita um site. Eles permitem que a plataforma funcione corretamente,
            lembre suas preferências e melhore sua experiência.
          </p>
          <p>
            Além de cookies, utilizamos <strong className="text-white">localStorage</strong> para
            dados de sessão e preferências do aplicativo.
          </p>
        </Section>

        <Section icon="lock" title="2. Cookies Estritamente Necessários" id="necessarios">
          <p className="mb-4">
            Estes cookies são essenciais para o funcionamento da plataforma. Não podem
            ser desativados e não requerem consentimento (Art. 7º, V — LGPD).
          </p>
          <div className="space-y-3">
            <CookieCard
              name="auth-storage"
              type="localStorage"
              purpose="Armazena tokens JWT de autenticação e dados da sessão do usuário (Zustand persist)"
              duration="Até logout"
              required
            />
            <CookieCard
              name="app-storage"
              type="localStorage"
              purpose="Preferências do aplicativo: tema, sidebar, configurações de UI"
              duration="Persistente"
              required
            />
            <CookieCard
              name="__cf_bm"
              type="Cookie"
              purpose="Cloudflare Bot Management — proteção contra bots e ataques DDoS"
              duration="30 minutos"
              required
            />
            <CookieCard
              name="cf_clearance"
              type="Cookie"
              purpose="Cloudflare Turnstile — verificação humana em formulários"
              duration="30 minutos"
              required
            />
          </div>
        </Section>

        <Section icon="barChart" title="3. Cookies de Analytics" id="analytics">
          <p className="mb-4">
            Utilizamos o <strong className="text-white">Cloudflare Analytics Engine</strong> para
            analytics. Esta tecnologia é <strong className="text-white">privacy-first</strong> e
            opera majoritariamente no edge (servidor), sem necessidade de cookies de
            rastreamento no navegador.
          </p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <DSIcon name="shield" size={20} className="mt-0.5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">Auto-aprovados por Legítimo Interesse</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Os cookies de analytics são aprovados automaticamente com base no legítimo
                  interesse (Art. 7º, IX — LGPD). Coletamos apenas dados agregados e
                  anonimizados: contagem de pageviews, rotas acessadas e performance.
                  <strong className="text-white"> Nenhum dado pessoal identificável</strong> é processado via analytics.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <CookieCard
              name="Cloudflare Analytics"
              type="Server-side"
              purpose="Métricas de performance, pageviews e erros (anonimizado, sem PII)"
              duration="24 meses (agregado)"
              required={false}
            />
          </div>
        </Section>

        <Section icon="cookie" title="4. Cookies de Terceiros" id="terceiros">
          <p className="mb-4">
            Os seguintes serviços de terceiros podem definir seus próprios cookies
            quando você interage com funcionalidades específicas:
          </p>
          <div className="space-y-3">
            <CookieCard
              name="OneSignal"
              type="Service Worker"
              purpose="Push notifications — armazena subscription ID para envio de notificações"
              duration="Até desinscrição"
              required={false}
            />
            <CookieCard
              name="Google OAuth"
              type="Cookie"
              purpose="Definido durante login social com Google — gerenciado pelo Google"
              duration="Sessão"
              required={false}
            />
          </div>
          <p className="mt-4 text-xs">
            Para políticas de privacidade destes serviços:
          </p>
          <ul className="mt-1 space-y-1 text-xs">
            <li>
              <a href="https://onesignal.com/privacy_policy" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                OneSignal Privacy Policy <DSIcon name="externalLink" size={12} />
              </a>
            </li>
            <li>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                Google Privacy Policy <DSIcon name="externalLink" size={12} />
              </a>
            </li>
          </ul>
        </Section>

        <Section icon="settings" title="5. Gerenciar Cookies" id="gerenciar">
          <p>
            Você pode gerenciar ou bloquear cookies diretamente no seu navegador.
            Note que desativar cookies essenciais pode comprometer o funcionamento da plataforma.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { browser: 'Chrome', url: 'chrome://settings/cookies' },
              { browser: 'Firefox', url: 'about:preferences#privacy' },
              { browser: 'Safari', url: 'Preferências → Privacidade' },
              { browser: 'Edge', url: 'edge://settings/content/cookies' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/4 bg-white/1 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <span className="text-xs font-bold text-zinc-300">{item.browser[0]}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{item.browser}</p>
                  <code className="text-[10px] text-zinc-500">{item.url}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon="shield" title="6. Base Legal e Contato" id="contato">
          <p>
            O tratamento de dados via cookies segue as bases legais previstas no Art.
            7º da LGPD, conforme detalhado em cada categoria acima.
          </p>
          <p>
            Para dúvidas sobre cookies ou exercício dos seus direitos, entre em contato:
          </p>
          <div className="mt-3 rounded-xl border border-white/8 bg-white/3 p-4">
            <ul className="space-y-1 text-xs text-zinc-400">
              <li>📧 DPO: <strong className="text-white">dpo@vfit.app.br</strong></li>
              <li>📧 Suporte: <strong className="text-white">suporte@vfit.app.br</strong></li>
            </ul>
          </div>
          <p className="mt-4">
            Veja também:{' '}
            <Link href="/termos" className="text-brand-primary hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-brand-primary hover:underline">Política de Privacidade</Link>.
          </p>
        </Section>

        {/* FAQ */}
        <FaqInline items={FAQ_COOKIES} />
      </div>
      </div>
    </>
  )
}

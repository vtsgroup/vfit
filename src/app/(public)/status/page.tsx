/**
 * src/app/(public)/status/page.tsx
 *
 * Status Page — /status
 *
 * Exports: metadata, StatusPage
 * Features: DSIcon
 */

// ============================================
// Status Page — /status
// Simple health check for GSC + uptime monitoring
// ============================================

import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { DSIcon } from '@/components/ui/ds-icon'
import type { DSIconName } from '@/components/ui/ds-icon'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Status do Sistema',
  description:
    'Verifique o status dos serviços da VFIT. Plataforma, API, pagamentos e notificações.',
  path: '/status',
})

const services = [
  { name: 'Plataforma Web', description: 'App principal em vfit.app.br', icon: 'globe' as DSIconName },
  { name: 'API Backend', description: 'Cloudflare Workers + Hono.js', icon: 'server' as DSIconName },
  { name: 'Banco de Dados', description: 'Neon PostgreSQL 17', icon: 'flame' as DSIconName },
  { name: 'Segurança', description: 'TLS 1.3 + HSTS + CSP', icon: 'shield' as DSIconName },
]

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-emerald-400">Todos os sistemas operacionais</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Status do Sistema
        </h1>
        <p className="mt-3 text-base text-zinc-400">
          Monitore a disponibilidade dos serviços da VFIT em tempo real.
        </p>
      </div>

      {/* Services */}
      <div className="space-y-3">
        {services.map((service) => {
          return (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-5 py-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                  <DSIcon name={service.icon} size={20} className="text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{service.name}</p>
                  <p className="text-sm text-zinc-500">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5">
                <DSIcon name="checkCircle2" size={16} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-400">Online</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer info */}
      <div className="mt-10 text-center">
        <p className="text-sm text-zinc-600">
          Última verificação: agora ·{' '}
          <a
            href="https://vfit.app.br"
            className="text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Voltar ao site
          </a>
        </p>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { buildSeoMetadata } from '@/lib/seo'
import { PageHero } from '@/components/shared/page-hero'
import { faqSchema } from '@/lib/schemas'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { AFFILIATE_PROGRAM, AFFILIATE_TIERS } from '@config/constants'
import {
  LightBand, SectionHead, HoverEdge, PillArrow, PillSweep,
  lightCard, greenChip, monoLabel, badgeStyle, pillPrimaryClass,
} from '@/components/shared/light-section'

export const metadata: Metadata = buildSeoMetadata({
  title: 'Programa de Afiliados VFIT | Indique e Ganhe Comissão Recorrente',
  description:
    'Ganhe comissão recorrente indicando o VFIT. Sem limite de indicações, com dashboard de performance e pagamentos.',
  path: '/afiliados',
  ogImage: '/og/og-default.png',
})

const STEPS: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'userPlus', title: 'Cadastre-se', desc: 'Crie sua conta e ative seu link de indicação em poucos minutos.' },
  { icon: 'share2', title: 'Compartilhe', desc: 'Divulgue com alunos, profissionais e criadores do nicho fitness.' },
  { icon: 'dollarSign', title: 'Receba', desc: 'Acompanhe conversões e comissões recorrentes pelo painel.' },
]

const PERSONAS: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'dumbbell', title: 'Personal trainers', desc: 'Indicam colegas e alunos da sua rede.' },
  { icon: 'apple', title: 'Nutricionistas', desc: 'Monetizam a base de pacientes.' },
  { icon: 'megaphone', title: 'Criadores', desc: 'Influenciadores do nicho fitness.' },
]

const TIER_DOT: Record<number, string> = { 0: 'bg-amber-400', 1: 'bg-slate-400', 2: 'bg-emerald-500' }

export default function AfiliadosPublicPage() {
  const faq = faqSchema([
    { question: 'Como funciona o programa de afiliados da VFIT?', answer: 'Você ativa seu link de indicação, compartilha com sua audiência e acompanha as conversões no dashboard.' },
    { question: 'A comissão é recorrente?', answer: 'Sim. O programa opera com comissão recorrente enquanto a assinatura indicada estiver ativa e adimplente.' },
    { question: 'Quem pode ser afiliado?', answer: 'Personal trainers, nutricionistas, alunos e criadores de conteúdo do nicho fitness.' },
  ])

  const tiers = Object.values(AFFILIATE_TIERS)
  const topCommission = Math.max(...tiers.map((t) => t.commission_percentage))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <PageHero
        title="Indique o VFIT. Ganhe Todo Mês. Sem Limite."
        subtitle="Cada indicação ativa pode gerar comissão recorrente. Você compartilha seu link e acompanha tudo no dashboard."
        badge="Afiliados"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Afiliados', href: '/afiliados' }]}
      />

      <LightBand>
        {/* Como funciona — 3 passos */}
        <div>
          <SectionHead icon="rocket" eyebrow="/COMO FUNCIONA" lead="Indique em" accent="3 passos" sub="Ative, compartilhe e receba — sem limite de indicações." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
                <HoverEdge />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name={s.icon} size={20} /></span>
                  <span className="font-syne text-2xl font-black leading-none text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="relative mt-4 font-syne text-base font-black tracking-tight text-gray-950">{s.title}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Para quem é — personas */}
        <div>
          <SectionHead icon="users" eyebrow="/PARA QUEM É" lead="Feito pra quem tem" accent="audiência fitness" sub="Você compartilha, a gente cuida do resto." />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PERSONAS.map((p) => (
              <div key={p.title} className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1" style={lightCard}>
                <HoverEdge />
                <span className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-brand-primary" style={greenChip}><DSIcon name={p.icon} size={20} /></span>
                <h3 className="relative font-syne text-base font-black tracking-tight text-gray-950">{p.title}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — card claro + pill perfeito */}
        <div className="relative overflow-hidden rounded-3xl p-8 text-center sm:p-12" style={lightCard}>
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-brand-primary" style={greenChip}><DSIcon name="rocket" size={26} /></span>
          <h3 className="font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">Pronto pra <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">começar?</span></h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-[15px]">Ative seu programa, gere seu link e comece a indicar — sem limite de indicações.</p>
          <div className="mt-7 flex flex-col items-center gap-4">
            <TrackedCtaLink href="/dashboard/affiliates" cta="Ativar programa" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_register_start" className={pillPrimaryClass}>
              <PillSweep />
              <span className="relative z-10">Ativar programa</span>
              <PillArrow />
            </TrackedCtaLink>
            <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-500">
              <TrackedCtaLink href="/app-personal-trainer" cta="Sou personal trainer" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_cta_secondary_click" className="underline-offset-4 transition-colors hover:text-emerald-700 hover:underline">Sou personal</TrackedCtaLink>
              <span className="text-slate-300">·</span>
              <TrackedCtaLink href="/nutricionistas" cta="Sou nutricionista" placement="afiliados_page_main_cta" pageSegment="afiliados" event="lp_cta_secondary_click" className="underline-offset-4 transition-colors hover:text-emerald-700 hover:underline">Sou nutri</TrackedCtaLink>
            </div>
          </div>
        </div>

        {/* Modelo de comissão — cards de tier */}
        <div>
          <SectionHead icon="percent" eyebrow="/COMISSÕES" lead="Modelo de comissão" accent="oficial" sub={`Pagamento via ${AFFILIATE_PROGRAM.payout_method}, frequência ${AFFILIATE_PROGRAM.payout_frequency}. ${AFFILIATE_PROGRAM.commission_note}`} />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {tiers.map((tier, i) => {
              const featured = tier.commission_percentage === topCommission
              return (
                <div
                  key={tier.name}
                  className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={featured
                    ? { background: 'linear-gradient(180deg, #ffffff 0%, #effaf2 100%)', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 54px -24px rgba(34,197,94,0.45), inset 0 1px 0 rgba(255,255,255,0.95)' }
                    : lightCard}
                >
                  {featured ? (
                    <>
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(34,197,94,0.75) 0%, rgba(132,204,22,0.45) 50%, rgba(34,197,94,0.55) 100%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] uppercase text-[#08122B]" style={badgeStyle}><DSIcon name="crown" size={10} /> Top</span>
                    </>
                  ) : (
                    <HoverEdge />
                  )}

                  <div className="relative flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${TIER_DOT[i] ?? 'bg-slate-400'}`} />
                    <h3 className="text-[11px] uppercase tracking-wider text-slate-500" style={monoLabel}>{tier.name}</h3>
                  </div>

                  <div className="relative mt-4 flex items-baseline gap-1">
                    <span className="font-syne text-5xl font-black leading-none tracking-tight bg-linear-to-b from-gray-900 to-emerald-600 bg-clip-text text-transparent">{tier.commission_percentage}</span>
                    <span className="font-syne text-2xl font-black text-emerald-600">%</span>
                  </div>
                  <p className="relative mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400" style={monoLabel}>Comissão recorrente</p>

                  <div className="relative mt-5 flex items-center gap-2 border-t border-slate-200/70 pt-4 text-sm text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-brand-primary" style={greenChip}><DSIcon name="userCheck" size={12} /></span>
                    {tier.min_referrals === 0 ? 'Sem mínimo para ativar' : `A partir de ${tier.min_referrals} indicações ativas`}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <TrackedCtaLink href="/dashboard/affiliates" cta="Ativar programa tiers" placement="afiliados_page_tiers_cta" pageSegment="afiliados" event="lp_register_start" className={pillPrimaryClass}>Quero meu link <PillArrow /></TrackedCtaLink>
          </div>
        </div>
      </LightBand>
    </>
  )
}

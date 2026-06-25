// ============================================
// about-section.tsx — "FEITO POR QUEM ENTENDE"
// ============================================
//
// O que faz:
//   Seção institucional com o fundador (Victor) como foco aspiracional,
//   a VTS GROUP, valores e tech stack (marquee animado). Reusa a linguagem
//   premium da landing (spotlight + borda gradiente + glow) em versão light.
//
// Exports principais:
//   AboutSection — seção "Sobre" da landing
'use client'

import Image from 'next/image'
import { type MouseEvent } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '0',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

function handleCardMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* Camadas de hover (light) */
function HoverFX() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.08), transparent 60%)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.55) 0%, rgba(132,204,22,0.22) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-18px_rgba(34,197,94,0.4)]" />
    </>
  )
}

const cardStyle = {
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(15,23,42,0.07)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 16px 40px -18px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.9)',
} as const

/* ─── Tech stack ─── */
const techStack: { name: string; icon: DSIconName }[] = [
  { name: 'Next.js', icon: 'triangle' },
  { name: 'React', icon: 'atom' },
  { name: 'TypeScript', icon: 'code2' },
  { name: 'Tailwind', icon: 'wind' },
  { name: 'Cloudflare', icon: 'cloud' },
  { name: 'PostgreSQL', icon: 'database' },
  { name: 'Zustand', icon: 'layers' },
  { name: 'AI/ML', icon: 'brainCircuit' },
]

/* ─── Credenciais do fundador (chips) ─── */
const founderChips: { icon: DSIconName; label: string }[] = [
  { icon: 'award', label: '15+ ANOS' },
  { icon: 'zap', label: 'PIONEIRO PIX' },
  { icon: 'code2', label: 'FULL-STACK' },
  { icon: 'cloud', label: 'EDGE-FIRST' },
]

/* ─── Valores ─── */
const values: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'lightbulb', title: 'INOVAÇÃO', desc: 'Tecnologia de ponta aplicada ao fitness' },
  { icon: 'target', title: 'FOCO', desc: 'Cada solução resolve um problema real' },
  { icon: 'flame', title: 'MOTIVAÇÃO', desc: 'Gamificação que mantém constância' },
  { icon: 'trendingUp', title: 'EVOLUÇÃO', desc: 'Dados claros de progresso real' },
]

function TechChip({ tech }: { tech: { name: string; icon: DSIconName } }) {
  return (
    <span className="group/chip inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 transition-all duration-200 hover:border-brand-primary/30 hover:bg-brand-primary/[0.06]">
      <DSIcon name={tech.icon} size={16} className="text-slate-500 transition-all duration-200 group-hover/chip:scale-110 group-hover/chip:text-brand-primary" />
      <span className="whitespace-nowrap text-[10px] font-bold uppercase text-slate-600 group-hover/chip:text-emerald-700" style={monoLabel}>{tech.name}</span>
    </span>
  )
}

export function AboutSection() {
  const victor = {
    name: 'Victor Duarte',
    role: 'FUNDADOR · CEO & CTO',
    photo: '/assets/images/profile-picture-victor.png',
  }

  return (
    <section id="about" className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32" aria-label="Sobre a VFIT">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      {/* Dot pattern + orb sutil */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.3, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-primary/5 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Eyebrow */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
              style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.32)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">Quem somos</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2 className="mb-6 text-center font-black tracking-[-0.02em] text-gray-950" style={{ ...headingFont, fontSize: 'clamp(2.25rem, 5.2vw, 3.75rem)', lineHeight: '0.95' }}>
            FEITO POR QUEM{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">ENTENDE</span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-slate-500 sm:mb-16 sm:text-base">
            A VFIT nasceu da união entre tecnologia, inteligência artificial e paixão pelo fitness. Criada e liderada por Victor Duarte, a plataforma aproxima alunos, personal trainers e nutricionistas numa experiência simples de acompanhar pelo celular.
          </p>
        </IntersectionReveal>

        {/* ── Founder card — foco aspiracional ── */}
        <IntersectionReveal animation="fade-in" delay={150}>
          <div onMouseMove={handleCardMove} className="group relative mb-8 overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-10" style={cardStyle}>
            <HoverFX />
            {/* glow verde de fundo no canto */}
            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%)', filter: 'blur(20px)' }} />

            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* Foto + ring animado */}
              <div className="relative shrink-0">
                <span aria-hidden="true" className="about-ring pointer-events-none absolute -inset-2 rounded-full" style={{ background: 'conic-gradient(from 0deg, rgba(34,197,94,0.5), rgba(132,204,22,0.25), transparent 55%, rgba(34,197,94,0.4))', WebkitMask: 'radial-gradient(closest-side, transparent 72%, #000 74%)', mask: 'radial-gradient(closest-side, transparent 72%, #000 74%)' }} />
                <Image
                  src={victor.photo}
                  alt={victor.name}
                  width={132}
                  height={132}
                  className="relative h-28 w-28 rounded-full object-cover shadow-[0_10px_30px_rgba(34,197,94,0.22)] ring-4 ring-white sm:h-32 sm:w-32"
                />
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white" style={{ background: 'linear-gradient(135deg, #34e565, #16a34a)' }}>
                  <DSIcon name="check" size={14} className="text-[#08122B]" />
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h3 className="font-syne text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">{victor.name}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600" style={monoLabel}>{victor.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  Desenvolvedor <strong className="font-semibold text-emerald-700">Full-Stack</strong> com mais de <strong className="font-semibold text-emerald-700">15 anos</strong> no mercado de tecnologia. Pioneiro na primeira integração de <strong className="font-semibold text-emerald-700">API Pix</strong> com plataformas esportivas do Brasil. Lidera toda a arquitetura de software, engenharia de sistemas, infraestrutura cloud e estratégia de produto do VFIT.
                </p>

                {/* Chips de credencial */}
                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {founderChips.map((c) => (
                    <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600" style={monoLabel}>
                      <DSIcon name={c.icon} size={11} className="text-brand-primary" />
                      {c.label}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] sm:justify-start" style={monoLabel}>
                  <a href="https://victor.pt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-emerald-700">
                    <DSIcon name="externalLink" size={12} /> victor.pt
                  </a>
                  <a href="https://vts.victor.pt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-emerald-700">
                    <DSIcon name="externalLink" size={12} /> vts.victor.pt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </IntersectionReveal>

        {/* ── VTS story + tech stack ── */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* VTS GROUP */}
          <IntersectionReveal animation="fade-in" delay={200}>
            <div onMouseMove={handleCardMove} className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-8" style={cardStyle}>
              <HoverFX />
              <div className="relative mb-5 flex items-center gap-3.5">
                <Image src="/assets/images/profile-picture-vts-group.png" alt="VTS GROUP" width={52} height={52} className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
                <div>
                  <h3 className="text-lg font-black tracking-tight text-gray-950" style={{ fontFamily: headingFont.fontFamily }}>VTS GROUP</h3>
                  <p className="text-[10px] uppercase text-slate-400" style={monoLabel}>SOFTWARE HOUSE · DESDE 2023</p>
                </div>
              </div>
              <p className="relative mb-4 text-sm leading-relaxed text-slate-600">
                Empresa de tecnologia especializada em desenvolvimento web, automação com IA e sistemas financeiros de alta performance. Atuação global, sede no Brasil — soluções digitais escaláveis que transformam negócios, operando como <em>trade name</em> de Victor Duarte há mais de uma década e formalizada em 2023.
              </p>
              <p className="relative mb-5 text-sm leading-relaxed text-slate-600">
                A VFIT é o produto flagship: treinos personalizados, IA, pagamentos digitais e gamificação. Infraestrutura 100% serverless, distribuída globalmente pela Cloudflare — latência mínima, alta disponibilidade e segurança enterprise.
              </p>

              {/* Valores */}
              <div className="relative mt-auto grid grid-cols-2 gap-3">
                {values.map((v) => (
                  <div key={v.title} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors duration-200 hover:border-brand-primary/20 hover:bg-brand-primary/[0.04]">
                    <DSIcon name={v.icon} size={18} className="mb-1.5 text-brand-primary" />
                    <div className="text-[10px] font-bold uppercase text-gray-950" style={monoLabel}>{v.title}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{v.desc}</div>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 border-t border-slate-100 pt-4 text-center">
                <p className="text-[10px] leading-relaxed text-slate-400" style={monoLabel}>VTS GROUP · CNPJ 51.430.605/0001-53</p>
              </div>
            </div>
          </IntersectionReveal>

          {/* Tech stack — marquee */}
          <IntersectionReveal animation="fade-in" delay={300}>
            <div onMouseMove={handleCardMove} className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-8" style={cardStyle}>
              <HoverFX />
              <h3 className="relative mb-5 text-xs uppercase text-slate-400" style={monoLabel}>NOSSA STACK</h3>

              {/* Marquee duplo (direções opostas) */}
              <div className="relative space-y-3 overflow-hidden">
                {/* fades laterais */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-white to-transparent" />
                <div className="flex w-max gap-3 [animation:aboutScroll_28s_linear_infinite]">
                  {[...techStack, ...techStack].map((t, i) => <TechChip key={`a-${i}`} tech={t} />)}
                </div>
                <div className="flex w-max gap-3 [animation:aboutScrollRev_34s_linear_infinite]">
                  {[...techStack.slice().reverse(), ...techStack.slice().reverse()].map((t, i) => <TechChip key={`b-${i}`} tech={t} />)}
                </div>
              </div>

              <div className="relative mt-auto pt-6">
                <div className="rounded-xl bg-bg-page px-4 py-3 text-center">
                  <p className="text-[10px] uppercase text-white/60" style={monoLabel}>
                    <span className="text-brand-primary">EDGE-FIRST</span> · SERVERLESS · GLOBALLY DISTRIBUTED
                  </p>
                </div>
              </div>
            </div>
          </IntersectionReveal>
        </div>
      </div>

      <style jsx global>{`
        @keyframes aboutRing { to { transform: rotate(360deg); } }
        .about-ring { animation: aboutRing 12s linear infinite; will-change: transform; }
        @keyframes aboutScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes aboutScrollRev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          .about-ring { animation: none; }
          [class*='aboutScroll'] { animation: none !important; }
        }
      `}</style>
    </section>
  )
}

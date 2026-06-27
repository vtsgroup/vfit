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
import { type CSSProperties, type MouseEvent } from 'react'
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

/* Camadas de hover (light) — rounded casa com o card */
function HoverFX({ rounded = 'rounded-2xl' }: { rounded?: string }) {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.08), transparent 60%)' }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.55) 0%, rgba(132,204,22,0.22) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className={`pointer-events-none absolute -inset-px ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[0_24px_50px_-18px_rgba(34,197,94,0.4)]`} />
    </>
  )
}

const cardStyle = {
  background: 'linear-gradient(180deg, #ffffff 0%, #eef1f7 100%)',
  border: '1px solid rgba(15,23,42,0.10)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.05), 0 20px 46px -22px rgba(15,23,42,0.20), inset 0 1px 0 rgba(255,255,255,0.95)',
} as const

/* Material menor (chips/metrics) — branco → cinza claro + borda gradiente sutil */
const subCardStyle = {
  background: 'linear-gradient(180deg, #ffffff 0%, #eef1f7 100%)',
  border: '1px solid rgba(15,23,42,0.09)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
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

/* ─── Métricas de infraestrutura (preenche a coluna da stack) ─── */
const infraMetrics: { value: string; label: string }[] = [
  { value: '99.9%', label: 'UPTIME' },
  { value: '<50ms', label: 'LATÊNCIA' },
  { value: '300+', label: 'GLOBAL' },
  { value: '∞', label: 'ESCALA' },
]

/* ─── Pipeline (arquitetura edge) ─── */
const pipeline: { icon: DSIconName; label: string; tone: string }[] = [
  { icon: 'cloud', label: 'EDGE', tone: '#f97316' },
  { icon: 'zap', label: 'WORKERS', tone: '#22c55e' },
  { icon: 'database', label: 'POSTGRES', tone: '#64748b' },
  { icon: 'brainCircuit', label: 'AI/ML', tone: '#84cc16' },
]

/* ─── Linhas do console de deploy ─── */
const deployLog: { cmd: string; out: string; live?: boolean }[] = [
  { cmd: 'npm run build', out: '✓ compilado em 2.4s' },
  { cmd: 'npm run quality:ci', out: '✓ 0 erros · types ok' },
  { cmd: 'wrangler deploy --env prod', out: '→ publicando na edge…', live: true },
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
    <span className="group/chip relative inline-flex shrink-0 items-center gap-2.5 overflow-hidden rounded-xl px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5" style={subCardStyle}>
      {/* borda gradiente sutil (persistente) */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl" style={{ padding: '1px', background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(132,204,22,0.13) 50%, transparent 80%)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
      <DSIcon name={tech.icon} size={22} className="relative text-slate-500 transition-all duration-200 group-hover/chip:scale-110 group-hover/chip:text-brand-primary" />
      <span className="relative whitespace-nowrap text-[12px] font-bold uppercase text-slate-700 group-hover/chip:text-emerald-700" style={monoLabel}>{tech.name}</span>
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
            A Vfit nasceu da união entre tecnologia, inteligência artificial e paixão pelo fitness. Criada e liderada por Victor Duarte, a plataforma aproxima alunos, personal trainers e nutricionistas numa experiência simples de acompanhar pelo celular.
          </p>
        </IntersectionReveal>

        {/* ── Founder card — foco aspiracional ── */}
        <IntersectionReveal animation="fade-in" delay={150}>
          <div onMouseMove={handleCardMove} className="group relative mb-6 overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:mb-8 sm:p-10" style={cardStyle}>
            <HoverFX rounded="rounded-3xl" />

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
                  Desenvolvedor <strong className="font-semibold text-emerald-700">Full-Stack</strong> com mais de <strong className="font-semibold text-emerald-700">15 anos</strong> de experiência no mercado de tecnologia e especialização em soluções de <strong className="font-semibold text-emerald-700">alta performance</strong>. Pioneiro na primeira integração de <strong className="font-semibold text-emerald-700">API Pix</strong> com plataformas esportivas do Brasil, unindo inovação financeira ao universo fitness. Lidera toda a arquitetura de software, engenharia de sistemas, infraestrutura cloud e estratégia de produto do <strong className="font-semibold text-emerald-700">Vfit</strong>, transformando a forma como pessoas se conectam à saúde e performance.
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
          {/* VTS GROUP — Full-bleed visual */}
          <IntersectionReveal animation="fade-in" delay={200}>
            <div onMouseMove={handleCardMove} className="group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-12" style={cardStyle}>
              <HoverFX rounded="rounded-3xl" />

              {/* Decorative accent pattern */}
              <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-96 w-96 bg-linear-to-bl from-brand-primary/8 via-transparent to-transparent rounded-full blur-3xl" />

              <div className="relative mb-8 flex items-start gap-5">
                <div className="group/logo">
                  <Image src="/assets/images/profile-picture-vts-group.png" alt="VTS GROUP" width={72} height={72} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-slate-200 transition-transform group-hover/logo:scale-105" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black tracking-tight text-gray-950" style={{ fontFamily: headingFont.fontFamily }}>VTS GROUP</h3>
                  <p className="mt-2 text-[11px] uppercase text-emerald-600 font-bold tracking-widest" style={monoLabel}>SOFTWARE HOUSE · DESDE 2023</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['WEB DEV', 'IA/ML', 'FINTECH', 'EDGE-FIRST'].map((tag) => (
                      <span key={tag} className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="relative mb-5 text-base leading-relaxed text-slate-700 font-medium">
                Somos uma software house que constrói produtos digitais de <strong className="text-emerald-700">alta performance</strong>. Unimos engenharia de ponta, design obsessivo e inteligência artificial para transformar ideias em plataformas que escalam de verdade.
              </p>
              <p className="relative mb-6 text-[15px] leading-relaxed text-slate-600">
                Do desenvolvimento web e automação com IA a sistemas financeiros críticos, cada produto nasce com a mesma obsessão: <strong className="text-emerald-700">velocidade, segurança e uma experiência impecável</strong> para quem usa.
              </p>

              {/* Highlight box */}
              <div className="relative mb-8 overflow-hidden rounded-2xl bg-linear-to-br from-emerald-50 via-white to-transparent p-6 border border-emerald-100/50">
                <div aria-hidden="true" className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/5 rounded-full blur-2xl" />
                <p className="relative text-sm leading-relaxed text-slate-700">
                  <strong className="text-emerald-700 text-base">Vfit é o flagship:</strong> treinos personalizados, inteligência artificial, pagamentos digitais e gamificação. Infraestrutura <strong className="text-emerald-700">100% serverless</strong> distribuída globalmente pela Cloudflare.
                </p>
              </div>

              {/* Values — full width grid */}
              <div className="relative grid grid-cols-2 gap-4 mt-auto pt-6">
                {values.map((v) => (
                  <div key={v.title} className="group/value rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={subCardStyle}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        <DSIcon name={v.icon} size={24} className="text-brand-primary transition-transform group-hover/value:scale-110" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase text-gray-950 tracking-wide" style={monoLabel}>{v.title}</div>
                        <div className="mt-2 text-[12px] leading-snug text-slate-600">{v.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-[11px] leading-relaxed text-slate-500 font-mono tracking-widest">VTS GROUP · CNPJ 51.430.605/0001-53</p>
              </div>
            </div>
          </IntersectionReveal>

          {/* Tech stack — Grid showcase + metrics + pipeline */}
          <IntersectionReveal animation="fade-in" delay={300}>
            <div className="flex h-full flex-col gap-6">
              {/* Tech Grid — Full prominence */}
              <div onMouseMove={handleCardMove} className="group relative flex-1 overflow-hidden rounded-3xl p-8 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-10" style={cardStyle}>
                <HoverFX rounded="rounded-3xl" />

                <h3 className="relative mb-8 text-sm uppercase text-slate-500 font-black tracking-widest" style={monoLabel}>Nossa Stack Completa</h3>

                {/* Grid 2x4 — Large, prominent */}
                <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="group/tech relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                      style={subCardStyle}
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/tech:opacity-100" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(34,197,94,0.15), transparent 60%)' }} />
                      <DSIcon name={tech.icon} size={32} className="relative text-brand-primary transition-transform group-hover/tech:scale-125 group-hover/tech:rotate-6" />
                      <span className="relative text-[11px] font-bold uppercase text-center text-slate-700 group-hover/tech:text-emerald-700 transition-colors">{tech.name}</span>
                    </div>
                  ))}
                </div>

                {/* Infra metrics — below tech */}
                <div className="relative grid grid-cols-4 gap-2">
                  {infraMetrics.map((m) => (
                    <div key={m.label} className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl p-4 text-center group/metric transition-all hover:-translate-y-1" style={subCardStyle}>
                      <div className="relative font-syne bg-linear-to-b from-gray-900 to-emerald-700 bg-clip-text text-lg font-black leading-tight text-transparent">{m.value}</div>
                      <div className="relative mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-500 group-hover/metric:text-emerald-600">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline + Console — Stacked below */}
              <div onMouseMove={handleCardMove} className="group relative flex-1 overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out-expo hover:-translate-y-1 sm:p-8" style={cardStyle}>
                <HoverFX rounded="rounded-3xl" />

                <h3 className="relative mb-6 text-sm uppercase text-slate-500 font-black tracking-widest" style={monoLabel}>Pipeline Edge-First</h3>

                {/* Pipeline — Large horizontal flow */}
                <div className="relative mb-6 flex items-center gap-3">
                  {pipeline.map((n, i) => (
                    <div key={n.label} className="contents">
                      <div className="pipe-node relative flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4" style={{ ...subCardStyle, '--tone': n.tone, '--i': String(i) } as CSSProperties}>
                        <DSIcon name={n.icon} size={20} style={{ color: n.tone }} className="transition-transform group-hover:scale-110" />
                        <span className="text-[9px] font-black uppercase tracking-wide text-slate-600">{n.label}</span>
                      </div>
                      {i < pipeline.length - 1 && <DSIcon name="chevronRight" size={18} className="shrink-0 text-slate-300" aria-hidden="true" />}
                    </div>
                  ))}
                </div>

                {/* Console — Full width */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1020] p-4">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #22c55e 0 1px, transparent 1px 3px)' }} />
                  <div className="relative mb-3 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                    <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                    <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                    <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-slate-500" style={monoLabel}>vfit@edge</span>
                  </div>
                  <div className="relative space-y-2 font-mono text-[11px] leading-tight">
                    {deployLog.map((l, i) => (
                      <div key={l.cmd} className="console-line flex items-start gap-2" style={{ '--row': String(i) } as CSSProperties}>
                        <span className="text-brand-primary shrink-0">❯</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-300">{l.cmd}</div>
                          <div className={`${l.live ? 'text-emerald-400 motion-safe:animate-pulse' : 'text-slate-500'} text-[10px]`}>
                            {l.out}
                            {l.live && <span className="caret ml-0.5 inline-block h-3 w-1.5 translate-y-px bg-brand-primary/80 align-middle" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status badge */}
                <div className="relative mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
                  </span>
                  <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider" style={monoLabel}>
                    ✓ EDGE-FIRST · SERVERLESS
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
        @keyframes pipeFlow {
          0%, 70%, 100% { box-shadow: inset 0 0 0 0 transparent; }
          35% { box-shadow: 0 0 0 1px color-mix(in srgb, var(--tone) 45%, transparent), 0 6px 16px -8px var(--tone); }
        }
        .pipe-node { animation: pipeFlow 3.2s ease-in-out infinite; animation-delay: calc(var(--i) * 0.4s); will-change: box-shadow; }
        @keyframes consoleIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .console-line { animation: consoleIn 0.5s ease-out both; animation-delay: calc(0.25s + var(--row) * 0.55s); }
        @keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .caret { animation: caretBlink 1s step-end infinite; }
        @media (prefers-reduced-motion: reduce) {
          .about-ring { animation: none; }
          [class*='aboutScroll'] { animation: none !important; }
          .pipe-node, .console-line, .caret { animation: none !important; }
          .console-line { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  )
}

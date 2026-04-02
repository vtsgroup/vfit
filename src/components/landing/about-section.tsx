// ============================================
// about-section.tsx — Seção "Sobre" da landing page
// ============================================
//
// O que faz:
//   Seção institucional da landing com história do produto, tech stack e missão.
//   Usa IntersectionReveal para animação de entrada no scroll.
//   Tech stack exibido como grid de badges com DSIcon.
//
// Exports principais:
//   AboutSection — seção "Sobre" da landing
'use client'

import Image from 'next/image'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

/* ─── Typography — consistent with all sections ─── */
const headingFont = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* ─── Tech stack (Lucide icons — zero emojis) ─── */
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

/* ─── Values (Lucide icons — zero emojis) ─── */
const values: { icon: DSIconName; title: string; desc: string }[] = [
  { icon: 'lightbulb', title: 'INOVAÇÃO', desc: 'Tecnologia de ponta aplicada ao mercado fitness' },
  { icon: 'target', title: 'FOCO', desc: 'Cada solução é construída para resolver problemas reais' },
  { icon: 'flame', title: 'MOTIVAÇÃO', desc: 'Gamificação que engaja e retém profissionais' },
  { icon: 'trendingUp', title: 'CRESCIMENTO', desc: 'Ferramentas projetadas para escalar seu negócio' },
]

/* ─── Equipe — dados reais, fotos reais ─── */
const team = [
  {
    name: 'Victor Duarte',
    role: 'FUNDADOR, CEO & CTO',
    photo: '/assets/images/profile-picture-victor.png',
    desc: 'Desenvolvedor Full-Stack com mais de 15 anos de experiência no mercado de tecnologia. Pioneiro na primeira integração de API Pix com plataformas esportivas do Brasil. Lidera toda a arquitetura de software, engenharia de sistemas, infraestrutura cloud e estratégia de produto do VFIT.',
  },
]

export function AboutSection() {
  return (
    <section id="about" className="relative bg-bg-landing-light py-16 sm:py-32" aria-label="Sobre a VFIT">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-5 text-center">
            <span
              className="inline-block text-xs text-gray-400 uppercase"
              style={monoLabel}
            >
              /QUEM SOMOS
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="mb-6 text-center uppercase text-gray-950"
            style={{ ...headingFont, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '0.95' }}
          >
            FEITO POR QUEM{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              ENTENDE
            </span>
          </h2>
        </IntersectionReveal>

        <IntersectionReveal animation="fade-in" delay={100}>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-gray-500 sm:mb-16 sm:text-base">
            A VFIT nasceu da união entre tecnologia, inteligência artificial
            e paixão pelo fitness. Criada e liderada por Victor Duarte, a plataforma é projetada para ser a melhor ferramenta para personal trainers do Brasil.
          </p>
        </IntersectionReveal>

        {/* VTS Brand + Equipe */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Brand story */}
          <IntersectionReveal animation="fade-in" delay={150}>
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
              {/* VTS Logo */}
              <div className="mb-6 flex items-center gap-3 sm:gap-4">
                <Image
                  src="/assets/images/profile-picture-vts-group.png"
                  alt="VTS GROUP — Software House especializada em desenvolvimento web e inteligência artificial"
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-lg font-black tracking-tight text-gray-950" style={{ fontFamily: headingFont.fontFamily }}>
                    VTS GROUP
                  </h3>
                  <p className="text-xs text-gray-400 uppercase" style={monoLabel}>
                    SOFTWARE HOUSE · DESDE 2023
                  </p>
                </div>
              </div>

              {/* Story */}
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                A VTS GROUP é uma empresa de tecnologia especializada em desenvolvimento web, automação com inteligência artificial e sistemas financeiros de alta performance. Com atuação global e sede no Brasil, entregamos soluções digitais escaláveis que transformam negócios — operando como <em>trade name</em> de Victor Duarte há mais de uma década e formalizada como pessoa jurídica em 2023.
              </p>

              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                A VFIT é nosso produto flagship — uma plataforma completa que integra gestão operacional, pagamentos instantâneos via Pix, inteligência artificial e gamificação para revolucionar o mercado de personal trainers no Brasil.
              </p>

              <p className="mb-8 text-sm leading-relaxed text-gray-600">
                Nossa infraestrutura é 100% serverless e distribuída globalmente pela Cloudflare, garantindo latência mínima, alta disponibilidade e segurança de nível enterprise. Utilizamos PostgreSQL gerenciado, cache inteligente em edge e processamento de pagamentos em tempo real — tudo projetado para escalar sem limites.
              </p>

              <div className="mt-auto">
              {/* Values grid */}
              <div className="grid grid-cols-2 gap-3">
                {values.map((v) => (
                  <div key={v.title} className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                    <DSIcon name={v.icon} size={20} className="mb-1.5 text-brand-primary" />
                    <div className="text-[10px] font-bold text-gray-950 uppercase" style={monoLabel}>{v.title}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-gray-500">{v.desc}</div>
                  </div>
                ))}
              </div>

              {/* CNPJ + Domains */}
              <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                <p className="text-[10px] leading-relaxed text-gray-400" style={monoLabel}>
                  VTS GROUP · CNPJ 51.430.605/0001-53
                </p>
                <p className="mt-1.5 flex items-center justify-center gap-2 text-[10px] text-gray-400" style={monoLabel}>
                  <a
                    href="https://vts.victor.pt"
                    target="_blank"
                    rel="noopener"
                    title="VTS GROUP — Software House de desenvolvimento web, IA e sistemas financeiros"
                    className="text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors duration-200 hover:text-brand-primary hover:decoration-brand-primary"
                  >
                    vts.victor.pt
                  </a>
                  <span>·</span>
                  <a
                    href="https://victor.pt"
                    target="_blank"
                    rel="noopener"
                    title="Victor Duarte — CEO & CTO da VTS GROUP, Desenvolvedor Full-Stack"
                    className="text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors duration-200 hover:text-brand-primary hover:decoration-brand-primary"
                  >
                    victor.pt
                  </a>
                </p>
              </div>
              </div>
            </div>
          </IntersectionReveal>

          {/* Right — Equipe + Stack */}
          <div className="flex flex-col gap-8">
            {/* Equipe */}
            <IntersectionReveal animation="fade-in" delay={250}>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] sm:p-8">
                <h3 className="mb-6 text-xs text-gray-400 uppercase" style={monoLabel}>
                  EQUIPE
                </h3>

                <div className="space-y-5">
                  {team.map((member, i) => (
                    <div key={member.name}>
                      <div className="flex items-start gap-4">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-gray-950">{member.name}</h4>
                          <p className="text-[10px] text-brand-primary uppercase" style={monoLabel}>{member.role}</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{member.desc}</p>
                        </div>
                      </div>
                      {i < team.length - 1 && <div className="mt-5 h-px bg-gray-100" />}
                    </div>
                  ))}
                </div>
              </div>
            </IntersectionReveal>

            {/* Tech stack */}
            <IntersectionReveal animation="fade-in" delay={350}>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] sm:p-8">
                <h3 className="mb-6 text-xs text-gray-400 uppercase" style={monoLabel}>
                  NOSSA STACK
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="group flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-4 transition-all duration-200 hover:border-brand-primary/30 hover:bg-brand-primary/5 sm:px-2"
                    >
                                            <DSIcon name={tech.icon} size={22} className="text-gray-500 transition-all duration-200 group-hover:scale-110 group-hover:text-brand-primary sm:size-5" />
                      <span className="text-center text-[10px] font-bold text-gray-600 uppercase group-hover:text-brand-primary sm:text-[9px]" style={monoLabel}>
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tagline */}
                <div className="mt-6 rounded-lg bg-bg-page px-4 py-3 text-center">
                  <p className="text-[10px] text-white/60 uppercase" style={monoLabel}>
                    <span className="text-brand-primary">EDGE-FIRST</span> · SERVERLESS · GLOBALLY DISTRIBUTED
                  </p>
                </div>
              </div>
            </IntersectionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

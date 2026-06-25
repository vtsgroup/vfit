// ============================================
// faq-section.tsx — FAQ ultra-moderna (ledger interativo)
// ============================================
//
// O que faz:
//   Accordion premium em formato de "ledger" numerado: linha ativa vira card
//   de vidro com borda gradiente + spotlight + accent à esquerda; resposta
//   revela com grid-collapse + blur clear. Acessível (aria + teclado).
//
// Exports principais:
//   FaqSection — seção FAQ da landing
'use client'

import { useState, type MouseEvent } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'

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

interface FaqItem {
  icon: DSIconName
  q: string
  a: string
}

const FAQ_ITEMS: FaqItem[] = [
  { icon: 'sparkles', q: 'O que é o VFIT?', a: 'VFIT é um app de treinos com IA para alunos. Você recebe plano personalizado, acompanha evolução com métricas reais e pode integrar acompanhamento com personal trainer e nutricionista.' },
  { icon: 'creditCard', q: 'É gratuito? Preciso de cartão de crédito?', a: 'Para alunos, são 30 dias grátis, sem cartão de crédito. Planos profissionais de operação (personal e nutrição) ficam nas páginas dedicadas para cada perfil.' },
  { icon: 'brain', q: 'Como funciona a geração de treinos por IA?', a: 'Nosso sistema analisa nível, objetivo, restrições, histórico e equipamentos disponíveis para sugerir um treino completo com exercícios, séries, repetições e descanso. Quando há profissional acompanhando, ele pode ajustar o plano.' },
  { icon: 'creditCard', q: 'Preciso pagar para usar como aluno?', a: 'Você pode começar como aluno com 30 dias grátis, sem cartão de crédito. Quando houver contratação de acompanhamento profissional, as condições aparecem de forma clara no fluxo correspondente.' },
  { icon: 'smartphone', q: 'Funciona no celular? Preciso instalar algo?', a: 'Sim! VFIT é uma PWA (Progressive Web App) que funciona como um app nativo no celular. Pode ser instalado na tela inicial do iPhone e Android, funciona rápido e até offline.' },
  { icon: 'shield', q: 'Preciso ter CREF para usar?', a: 'Alunos não precisam de CREF. Essa validação é exigida apenas para perfis profissionais que prescrevem treino.' },
  { icon: 'trophy', q: 'O que é o sistema de gamificação?', a: 'Nosso sistema de XP, badges e rankings mantém alunos e profissionais engajados. Alunos ganham pontos ao completar treinos, bater metas e manter streaks. Personals sobem de nível conforme engajam seus alunos.' },
  { icon: 'heartHandshake', q: 'Posso cancelar a qualquer momento?', a: 'Sim. Você pode encerrar seu uso a qualquer momento. Em contratos profissionais, as regras são exibidas no plano contratado.' },
  { icon: 'dumbbell', q: 'Os alunos conseguem acessar os treinos pelo celular?', a: 'Sim! Cada aluno recebe acesso à plataforma com login próprio. Eles visualizam treinos, marcam exercícios como concluídos, acompanham evolução e recebem notificações — tudo pelo celular.' },
  { icon: 'fileText', q: 'Consigo gerar avaliações físicas e relatórios?', a: 'Sim. A plataforma oferece avaliações físicas completas com composição corporal, medidas antropométricas e histórico evolutivo. Você pode gerar PDFs profissionais para entregar aos alunos.' },
  { icon: 'lock', q: 'Meus dados estão seguros?', a: 'Sim. Usamos infraestrutura Cloudflare, banco de dados PostgreSQL com backups e autenticação segura. Os dados de alunos e profissionais seguem boas práticas de privacidade e LGPD.' },
  { icon: 'users', q: 'Personal trainer e nutricionista conseguem trabalhar juntos?', a: 'Sim. O VFIT foi desenhado para acompanhamento conjunto, com visão compartilhada da evolução do aluno e comunicação entre profissionais para alinhar treino e dieta.' },
]

function handleMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function AccordionItem({ item, isOpen, toggle, index }: { item: FaqItem; isOpen: boolean; toggle: () => void; index: number }) {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`
  const num = String(index + 1).padStart(2, '0')

  return (
    <div
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out-expo ${index > 0 ? 'mt-2.5' : ''} ${isOpen ? '' : 'hover:-translate-y-0.5'}`}
      style={
        isOpen
          ? { background: 'linear-gradient(180deg, #ffffff 0%, #f0faf3 100%)', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 22px 50px -22px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.9)' }
          : { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }
      }
    >
      {/* Borda gradiente — persistente quando aberto, no hover quando fechado */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{
          padding: '1px',
          background: isOpen
            ? 'linear-gradient(135deg, rgba(34,197,94,0.7) 0%, rgba(132,204,22,0.45) 50%, rgba(34,197,94,0.5) 100%)'
            : 'linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(132,204,22,0.2) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {/* Spotlight no hover */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(380px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.07), transparent 60%)' }} />
      {/* Top hairline quando aberto */}
      <span className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/60 to-transparent transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

      <button
        id={buttonId}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="relative flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset sm:gap-4 sm:px-5"
      >
        {/* Número ledger */}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${isOpen ? 'text-[#08122B]' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-emerald-600'}`}
          style={isOpen ? { ...monoLabel, background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 4px 12px -2px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4)' } : monoLabel}
        >
          {num}
        </span>
        {/* Ícone */}
        <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:flex ${isOpen ? 'bg-brand-primary/12 text-brand-primary ring-1 ring-brand-primary/25' : 'bg-slate-100 text-slate-400'}`}>
          <DSIcon name={item.icon} size={16} />
        </span>
        {/* Pergunta */}
        <span className={`flex-1 pr-2 text-sm font-semibold tracking-tight transition-colors duration-200 sm:pr-4 sm:text-[15px] ${isOpen ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`} style={{ fontFamily: headingFont.fontFamily }}>{item.q}</span>
        {/* Toggle +→× */}
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 text-[#08122B]' : 'border border-slate-300 text-slate-400 group-hover:border-brand-primary/50 group-hover:text-emerald-600'}`} style={isOpen ? { background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 4px 12px -2px rgba(34,197,94,0.5)' } : undefined}>
          <DSIcon name="plus" size={14} />
        </span>
      </button>

      {/* Resposta — grid collapse */}
      <div id={panelId} role="region" aria-labelledby={buttonId} className="relative grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className={`pb-5 pl-13 pr-5 text-sm leading-relaxed text-slate-600 transition-opacity duration-300 sm:pl-22 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {item.a}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-32" aria-label="Perguntas frequentes">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.28, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 top-20 h-72 w-72 translate-x-1/2 rounded-full bg-brand-primary/5 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Eyebrow */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.32)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              <DSIcon name="helpCircle" size={13} className="text-brand-primary" />
              <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">FAQ</span>
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2 className="mb-3 text-center font-black tracking-[-0.02em] text-gray-950" style={{ ...headingFont, fontSize: 'clamp(2.25rem, 5.2vw, 3.5rem)', lineHeight: '0.95' }}>
            PERGUNTAS{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">FREQUENTES</span>
          </h2>
        </IntersectionReveal>
        <IntersectionReveal animation="fade-in" delay={80}>
          <p className="mb-10 text-center text-[11px] uppercase tracking-wider text-slate-400 sm:mb-12" style={monoLabel}>
            {FAQ_ITEMS.length} respostas · tudo que você precisa saber
          </p>
        </IntersectionReveal>

        {/* Accordion */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} item={item} index={i} isOpen={openIndex === i} toggle={() => setOpenIndex(openIndex === i ? null : i)} />
            ))}
          </div>
        </IntersectionReveal>
      </div>
    </section>
  )
}

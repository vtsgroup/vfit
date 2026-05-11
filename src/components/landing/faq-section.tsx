// ============================================
// faq-section.tsx — Seção de FAQ da landing page
// ============================================
//
// O que faz:
//   Accordion de perguntas frequentes sobre o produto.
//   Abre/fecha item via useState com animação de chevron.
//   Usa IntersectionReveal para entrada no scroll.
//
// Exports principais:
//   FaqSection — seção FAQ da landing com accordion
'use client'

import { useState } from 'react'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'

/* ─── Typography ─── */
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

/* ─── FAQ data ─── */
interface FaqItem {
  icon: DSIconName
  q: string
  a: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    icon: 'sparkles',
    q: 'O que é o VFIT?',
    a: 'VFIT é um app de treinos com IA para alunos. Você recebe plano personalizado, acompanha evolução com métricas reais e pode integrar acompanhamento com personal trainer e nutricionista.',
  },
  {
    icon: 'creditCard',
    q: 'É gratuito? Preciso de cartão de crédito?',
    a: 'Para alunos, o início é gratuito e sem cartão de crédito. Planos profissionais de operação (personal e nutrição) ficam nas páginas dedicadas para cada perfil.',
  },
  {
    icon: 'brain',
    q: 'Como funciona a geração de treinos por IA?',
    a: 'Nosso sistema analisa nível, objetivo, restrições, histórico e equipamentos disponíveis para sugerir um treino completo com exercícios, séries, repetições e descanso. Quando há profissional acompanhando, ele pode ajustar o plano.',
  },
  {
    icon: 'creditCard',
    q: 'Preciso pagar para usar como aluno?',
    a: 'Você pode começar como aluno sem cartão de crédito. Quando houver contratação de acompanhamento profissional, as condições aparecem de forma clara no fluxo correspondente.',
  },
  {
    icon: 'smartphone',
    q: 'Funciona no celular? Preciso instalar algo?',
    a: 'Sim! VFIT é uma PWA (Progressive Web App) que funciona como um app nativo no celular. Pode ser instalado na tela inicial do iPhone e Android, funciona rápido e até offline.',
  },
  {
    icon: 'shield',
    q: 'Preciso ter CREF para usar?',
    a: 'Alunos não precisam de CREF. Essa validação é exigida apenas para perfis profissionais que prescrevem treino.',
  },
  {
    icon: 'trophy',
    q: 'O que é o sistema de gamificação?',
    a: 'Nosso sistema de XP, badges e rankings mantém alunos e profissionais engajados. Alunos ganham pontos ao completar treinos, bater metas e manter streaks. Personals sobem de nível conforme engajam seus alunos.',
  },
  {
    icon: 'heartHandshake',
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Você pode encerrar seu uso a qualquer momento. Em contratos profissionais, as regras são exibidas no plano contratado.',
  },
  {
    icon: 'dumbbell',
    q: 'Os alunos conseguem acessar os treinos pelo celular?',
    a: 'Sim! Cada aluno recebe acesso à plataforma com login próprio. Eles visualizam treinos, marcam exercícios como concluídos, acompanham evolução e recebem notificações — tudo pelo celular.',
  },
  {
    icon: 'fileText',
    q: 'Consigo gerar avaliações físicas e relatórios?',
    a: 'Sim. A plataforma oferece avaliações físicas completas com composição corporal, medidas antropométricas e histórico evolutivo. Você pode gerar PDFs profissionais para entregar aos alunos.',
  },
  {
    icon: 'lock',
    q: 'Meus dados estão seguros?',
    a: 'Sim. Usamos infraestrutura Cloudflare, banco de dados PostgreSQL com backups e autenticação segura. Os dados de alunos e profissionais seguem boas práticas de privacidade e LGPD.',
  },
  {
    icon: 'users',
    q: 'Personal trainer e nutricionista conseguem trabalhar juntos?',
    a: 'Sim. O VFIT foi desenhado para acompanhamento conjunto, com visão compartilhada da evolução do aluno e comunicação entre profissionais para alinhar treino e dieta.',
  },
]

/* ─── Accordion Item ─── */
function AccordionItem({ item, isOpen, toggle, index }: { item: FaqItem; isOpen: boolean; toggle: () => void; index: number }) {
  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`

  return (
    <div className={`rounded-xl transition-all duration-300 ${
      isOpen
        ? 'bg-brand-primary/4 ring-1 ring-brand-primary/15 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
        : 'hover:bg-gray-50'
    } ${index > 0 ? 'mt-2' : ''}`}>
      <button
        id={buttonId}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition-colors duration-200 hover:text-brand-primary sm:gap-4 sm:px-5 sm:py-4"
      >
        {/* Number indicator */}
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300 ${
          isOpen
            ? 'bg-brand-primary/10 text-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.12)]'
            : 'bg-gray-100 text-gray-400'
        }`} style={monoLabel}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Icon */}
        <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 sm:flex ${
          isOpen ? 'bg-brand-primary/10 text-brand-primary' : 'bg-gray-100 text-gray-400'
        }`}>
          <DSIcon name={item.icon} size={16} />
        </span>

        {/* Question */}
        <span
          className={`flex-1 pr-2 text-sm font-semibold transition-colors duration-200 sm:pr-4 sm:text-base ${
            isOpen ? 'text-brand-primary' : 'text-gray-950'
          }`}
          style={{ fontFamily: headingFont.fontFamily }}
        >
          {item.q}
        </span>

        {/* Toggle icon */}
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          isOpen ? 'border-brand-primary bg-brand-primary text-gray-900 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-gray-300 text-gray-400'
        }`}>
          <DSIcon name="plus" size={14} className={isOpen ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-all duration-300"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-4 pl-14 pr-4 text-sm leading-relaxed text-gray-500 sm:pl-21 sm:pr-5">
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
    <section id="faq" className="relative bg-bg-landing-light py-16 sm:py-32" aria-label="Perguntas frequentes">
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />

      <div className="mx-auto max-w-3xl px-6">
        {/* Label */}
        <IntersectionReveal animation="fade-in">
          <div className="mb-5 flex items-center justify-center gap-2">
                        <DSIcon name="helpCircle" size={16} className="text-gray-400" />
            <span className="inline-block text-xs text-gray-400 uppercase" style={monoLabel}>
              /FAQ
            </span>
          </div>
        </IntersectionReveal>

        {/* Heading */}
        <IntersectionReveal animation="blur-in" delay={50}>
          <h2
            className="mb-10 text-center uppercase text-gray-950 sm:mb-14"
            style={{ ...headingFont, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '0.95' }}
          >
            PERGUNTAS{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">
              FREQUENTES
            </span>
          </h2>
        </IntersectionReveal>

        {/* Accordion */}
        <IntersectionReveal animation="fade-in" delay={100}>
          <div className="space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                toggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </IntersectionReveal>
      </div>
    </section>
  )
}

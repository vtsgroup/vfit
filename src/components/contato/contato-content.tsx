// ============================================
// contato-content.tsx — Conteúdo da página de Contato (banda CLARA)
// ============================================
//
// O que faz:
//   Client island da /contato. Espelha as SEÇÕES DE CONTEÚDO CLARAS da home
//   (features / about / FAQ): banda full-bleed `bg-bg-landing-light` com dot
//   pattern + orbs verdes, cards branco→#eef1f7 com borda-gradiente verde no
//   hover, chips de ícone verdes, eyebrow pill mint, heading text-gray-950 com
//   palavra em gradiente, formulário claro com success state, e FAQ claro
//   (acordeão numerado idêntico ao da landing). page.tsx permanece RSC.
//
// Exports principais:
//   ContatoContent — canais + formulário + FAQ (client, tema claro)
'use client'

import { useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react'
import { IntersectionReveal } from '@/components/ui/intersection-reveal'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { FAQ_CONTATO } from '@/data/faqs'

/* ─── Tokens (irmãos das seções claras da landing) ─── */
const headingFont: CSSProperties = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 900,
  letterSpacing: '0',
}
const monoLabel: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

/* Card claro padrão (branco → cinza-azulado) */
const lightCard: CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #eef1f7 100%)',
  border: '1px solid rgba(15,23,42,0.09)',
  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -22px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
}
/* Chip de ícone verde */
const greenChip: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.05))',
  border: '1px solid rgba(34,197,94,0.22)',
}

/* Spotlight verde que segue o cursor */
function handleMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/* Borda-gradiente verde (xor) + spotlight + hairline — versão clara */
function HoverFXLight({ rounded = 'rounded-2xl' }: { rounded?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${rounded} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.45) 0%, rgba(132,204,22,0.18) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.06), transparent 60%)' }} />
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </>
  )
}

/* ─── Eyebrow + headline de seção (claro) ─── */
function SectionHead({ icon, eyebrow, lead, accent, sub }: { icon: DSIconName; eyebrow: string; lead: string; accent: string; sub?: string }) {
  return (
    <div className="max-w-xl">
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]"
        style={{ ...monoLabel, background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,243,0.8) 100%)', border: '1px solid rgba(34,197,94,0.32)', boxShadow: '0 8px 20px -8px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.9)' }}
      >
        <DSIcon name={icon} size={13} className="text-brand-primary" />
        <span className="bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{eyebrow}</span>
      </span>
      <h2 className="mt-5 font-black leading-[0.98] tracking-[-0.02em] text-gray-950" style={{ ...headingFont, fontSize: 'clamp(1.9rem, 4vw, 2.85rem)' }}>
        {lead}{' '}
        <span className="bg-linear-to-r from-brand-primary via-brand-mint to-brand-accent bg-clip-text text-transparent">{accent}</span>
      </h2>
      {sub && <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-[15px]">{sub}</p>}
    </div>
  )
}

/* ─── Canais ─── */
interface Channel {
  icon: DSIconName
  eyebrow: string
  title: string
  value: string
  href: string
  cta: string
  external?: boolean
}

const PRIMARY_CHANNELS: Channel[] = [
  { icon: 'messageCircle', eyebrow: 'Resposta rápida', title: 'WhatsApp', value: '+55 (11) 99999-0000', href: 'https://wa.me/5511999990000', cta: 'Abrir conversa', external: true },
  { icon: 'mail', eyebrow: 'Suporte & parcerias', title: 'E-mail', value: 'contato@vfit.app.br', href: 'mailto:contato@vfit.app.br', cta: 'Escrever e-mail' },
]

const INFO_CHIPS: { icon: DSIconName; label: string; value: string }[] = [
  { icon: 'zap', label: 'Resposta média', value: 'até ~4h úteis' },
  { icon: 'clock', label: 'Horário', value: 'Seg–Sex · 9h–18h BRT' },
  { icon: 'mapPin', label: 'Base', value: 'São Paulo · 100% remoto' },
]

function ChannelCard({ ch }: { ch: Channel }) {
  return (
    <a
      href={ch.href}
      onMouseMove={handleMove}
      className="group relative block overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      style={lightCard}
      {...(ch.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <HoverFXLight />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105" style={greenChip}>
          <DSIcon name={ch.icon} size={22} className="text-brand-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wider text-emerald-600/80" style={monoLabel}>{ch.eyebrow}</span>
          <h3 className="mt-0.5 font-syne text-lg font-black tracking-tight text-gray-950">{ch.title}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">{ch.value}</p>
        </div>
      </div>
      <div className="relative mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400" style={monoLabel}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
          </span>
          Online agora
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
          {ch.cta}
          <DSIcon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  )
}

/* ─── Formulário ─── */
const SUBJECTS = [
  { value: 'support', label: 'Suporte Técnico' },
  { value: 'partnership', label: 'Parcerias' },
  { value: 'billing', label: 'Financeiro' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Outro' },
]

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15 focus:outline-none'
const labelClass = 'mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500'

const TRUST_BULLETS = ['Suporte técnico da plataforma', 'Parcerias & comercial', 'Financeiro, planos e cobrança']

function ContactForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl" style={lightCard}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />
      <div className="grid lg:grid-cols-5">
        {/* Form */}
        <div className="p-7 sm:p-9 lg:col-span-3">
          {sent ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full text-brand-primary" style={greenChip}>
                <DSIcon name="checkCircle" size={30} />
              </span>
              <h3 className="mt-5 font-syne text-2xl font-black text-gray-950">Mensagem enviada!</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Recebemos sua mensagem e respondemos em até <span className="font-semibold text-emerald-600">~4h úteis</span>. Fique de olho no seu e-mail.
              </p>
              <button type="button" onClick={() => setSent(false)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 transition-opacity hover:opacity-80">
                <DSIcon name="arrowLeft" size={16} /> Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contato-nome" className={labelClass} style={monoLabel}>Nome</label>
                  <input id="contato-nome" name="nome" type="text" autoComplete="name" required placeholder="Seu nome" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="contato-email" className={labelClass} style={monoLabel}>E-mail</label>
                  <input id="contato-email" name="email" type="email" autoComplete="email" required placeholder="seu@email.com" className={fieldClass} />
                </div>
              </div>
              <div>
                <label htmlFor="contato-assunto" className={labelClass} style={monoLabel}>Assunto</label>
                <div className="relative">
                  <select id="contato-assunto" name="assunto" defaultValue="" className={`${fieldClass} cursor-pointer appearance-none pr-10`}>
                    <option value="" disabled>Selecione</option>
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <DSIcon name="chevronDown" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label htmlFor="contato-mensagem" className={labelClass} style={monoLabel}>Mensagem</label>
                <textarea id="contato-mensagem" name="mensagem" rows={5} required placeholder="Escreva sua mensagem..." className={`${fieldClass} resize-none`} />
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  className="group/cta inline-flex h-12 items-center gap-2 rounded-full pl-6 pr-2.5 text-[13px] font-black uppercase tracking-wider text-[#08122B] transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #34e565 0%, #22c55e 52%, #16a34a 100%)', boxShadow: '0 10px 24px -8px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.45)' }}
                >
                  Enviar mensagem
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#08122B]">
                    <DSIcon name="send" size={14} className="text-[#4ADE80] transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                  </span>
                </button>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <DSIcon name="lock" size={13} /> Seus dados ficam seguros
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Aside — trust rail (verde claro) */}
        <aside className="relative border-t border-slate-200/80 p-7 sm:p-9 lg:border-l lg:border-t-0 lg:col-span-2" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}>
          <span className="text-[10px] uppercase tracking-wider text-emerald-600/80" style={monoLabel}>Por que falar com a gente</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-black leading-none tracking-tight text-gray-950" style={{ ...headingFont, fontSize: '2.5rem' }}>~4h</span>
            <span className="text-xs text-slate-400" style={monoLabel}>RESPOSTA MÉDIA</span>
          </div>
          <ul className="mt-6 space-y-3">
            {TRUST_BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-brand-primary" style={greenChip}>
                  <DSIcon name="check" size={11} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-7 border-t border-slate-200/80 pt-5">
            <p className="text-xs leading-relaxed text-slate-500">
              Prefere mais rápido? Fale direto no{' '}
              <a href="https://wa.me/5511999990000" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">WhatsApp</a>{' '}— atendimento em horário comercial.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─── FAQ (acordeão claro, igual à landing) ─── */
const FAQ_ICONS: DSIconName[] = ['clock', 'headphones', 'bug']

function AccordionItem({ icon, q, a, isOpen, toggle, index }: { icon: DSIconName; q: string; a: string; isOpen: boolean; toggle: () => void; index: number }) {
  const panelId = `contato-faq-panel-${index}`
  const buttonId = `contato-faq-button-${index}`
  const num = String(index + 1).padStart(2, '0')
  return (
    <div
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${index > 0 ? 'mt-2.5' : ''} ${isOpen ? '' : 'hover:-translate-y-0.5'}`}
      style={
        isOpen
          ? { background: 'linear-gradient(180deg, #ffffff 0%, #effaf2 100%)', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 54px -24px rgba(34,197,94,0.38), inset 0 1px 0 rgba(255,255,255,0.95)' }
          : { background: 'linear-gradient(180deg, #ffffff 0%, #f4f6fa 100%)', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }
      }
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{
          padding: '1px',
          background: isOpen
            ? 'linear-gradient(135deg, rgba(34,197,94,0.75) 0%, rgba(132,204,22,0.45) 50%, rgba(34,197,94,0.55) 100%)'
            : 'linear-gradient(135deg, rgba(34,197,94,0.45) 0%, rgba(132,204,22,0.18) 45%, transparent 75%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgba(34,197,94,0.06), transparent 60%)' }} />
      <span className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-brand-primary/70 to-transparent transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

      <button id={buttonId} onClick={toggle} aria-expanded={isOpen} aria-controls={panelId} className="relative flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset sm:gap-4 sm:px-5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 ${isOpen ? 'text-[#08122B]' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-emerald-600'}`}
          style={isOpen ? { ...monoLabel, background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 4px 12px -2px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4)' } : monoLabel}
        >
          {num}
        </span>
        <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:flex ${isOpen ? 'bg-brand-primary/12 text-brand-primary ring-1 ring-brand-primary/25' : 'bg-slate-100 text-slate-400'}`}>
          <DSIcon name={icon} size={16} />
        </span>
        <span className={`flex-1 pr-2 text-sm font-semibold tracking-tight transition-colors duration-200 sm:text-[15px] ${isOpen ? 'text-emerald-700' : 'text-gray-800 group-hover:text-emerald-700'}`} style={{ fontFamily: headingFont.fontFamily }}>{q}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 text-[#08122B]' : 'border border-slate-300 text-slate-400 group-hover:border-brand-primary/50 group-hover:text-emerald-600'}`} style={isOpen ? { background: 'linear-gradient(135deg, #34e565, #16a34a)', boxShadow: '0 4px 12px -2px rgba(34,197,94,0.5)' } : undefined}>
          <DSIcon name="plus" size={14} />
        </span>
      </button>

      <div id={panelId} role="region" aria-labelledby={buttonId} className="relative grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className={`pb-5 pl-13 pr-5 text-sm leading-relaxed text-slate-600 transition-opacity duration-300 sm:pl-[4.25rem] ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{a}</p>
        </div>
      </div>
    </div>
  )
}

function ContactFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.6fr] lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHead icon="helpCircle" eyebrow="/FAQ" lead="Dúvidas de" accent="contato" sub="Respostas rápidas sobre suporte, prazos e atendimento. Não achou? Use os canais acima." />
      </div>
      <IntersectionReveal animation="fade-in" delay={120}>
        <div>
          {FAQ_CONTATO.map((item, i) => (
            <AccordionItem key={i} icon={FAQ_ICONS[i] ?? 'helpCircle'} q={item.question} a={item.answer} index={i} isOpen={openIndex === i} toggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </div>
      </IntersectionReveal>
    </div>
  )
}

/* ─── Export principal (banda clara full-bleed) ─── */
export function ContatoContent() {
  return (
    <section className="relative overflow-hidden bg-bg-landing-light py-16 sm:py-24" aria-label="Canais de contato e formulário">
      {/* Atmosfera (igual às bandas claras da home) */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.3, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-brand-primary/5 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 rounded-full bg-lime-400/5 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-16 px-6 sm:space-y-20">
        {/* Canais */}
        <div>
          <IntersectionReveal animation="fade-in">
            <SectionHead icon="messageCircle" eyebrow="/CONTATO · CANAIS DIRETOS" lead="Escolha como falar com a" accent="gente" sub="Dúvidas, sugestões ou parcerias — respondemos rápido por qualquer canal." />
          </IntersectionReveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRIMARY_CHANNELS.map((ch, i) => (
              <IntersectionReveal key={ch.title} animation="slide-up" delay={100 + i * 80}>
                <ChannelCard ch={ch} />
              </IntersectionReveal>
            ))}
          </div>
          <IntersectionReveal animation="fade-in" delay={260}>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {INFO_CHIPS.map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.08)' }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-primary" style={greenChip}>
                    <DSIcon name={c.icon} size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400" style={monoLabel}>{c.label}</p>
                    <p className="truncate text-sm font-semibold text-gray-800">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </IntersectionReveal>
        </div>

        {/* Formulário */}
        <div>
          <IntersectionReveal animation="fade-in">
            <SectionHead icon="send" eyebrow="/MENSAGEM" lead="Conte o que você" accent="precisa" sub="Preencha abaixo e nossa equipe retorna no e-mail informado." />
          </IntersectionReveal>
          <IntersectionReveal animation="slide-up" delay={120}>
            <div className="mt-8">
              <ContactForm />
            </div>
          </IntersectionReveal>
        </div>

        {/* FAQ */}
        <ContactFaq />
      </div>
    </section>
  )
}

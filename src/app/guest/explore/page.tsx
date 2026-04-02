/**
 * src/app/guest/explore/page.tsx
 *
 * Guest Explore Page — Modo convidado sem login
 *
 * Permite explorar funcionalidades básicas do VFIT
 * sem criar conta. Dados salvos localmente.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

const monoLabel = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontWeight: 700,
  letterSpacing: '0.15em',
}

const features = [
  {
    icon: 'dumbbell' as const,
    title: 'Treinos de Exemplo',
    description: 'Veja modelos de treinos criados por IA',
    href: '/guest/workouts',
    available: true,
  },
  {
    icon: 'hash' as const,
    title: 'Calculadoras',
    description: 'IMC, TMB, macros e mais',
    href: '/guest/calculators',
    available: true,
  },
  {
    icon: 'barChart' as const,
    title: 'Avaliação Física',
    description: 'Faça uma avaliação rápida do seu corpo',
    href: '/guest/assessment',
    available: false,
  },
  {
    icon: 'sparkles' as const,
    title: 'IA Treinos',
    description: 'Converse com a IA sobre treinos',
    href: '/guest/chat',
    available: false,
  },
]

export default function GuestExplorePage() {
  const router = useRouter()

  useEffect(() => {
    // Ensure guest mode flag is set
    if (typeof window !== 'undefined') {
      const isGuest = localStorage.getItem('vfit_guest_mode')
      if (!isGuest) {
        localStorage.setItem('vfit_guest_mode', 'true')
        localStorage.setItem('vfit_guest_started_at', new Date().toISOString())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-black text-white tracking-tight">
              EVOLU<span className="text-brand-primary">IA</span>
            </span>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] font-bold uppercase text-amber-400" style={monoLabel}>
              MODO VISITANTE
            </span>
          </div>
          <Link
            href="/login"
            className="text-[12px] font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-[1.5rem] font-black text-white leading-tight">
            Explore o EVOLU<span className="text-brand-primary">IA</span>
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Descubra o que a IA pode fazer pelo seu treino. Crie uma conta grátis para desbloquear tudo.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-3">
          {features.map((feature) => (
            <button
              key={feature.href}
              type="button"
              onClick={() => {
                if (feature.available) {
                  router.push(feature.href)
                }
              }}
              disabled={!feature.available}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                feature.available
                  ? 'border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/12 cursor-pointer'
                  : 'border-white/4 bg-white/1 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                feature.available ? 'bg-brand-primary/10 text-brand-primary' : 'bg-zinc-800 text-zinc-600'
              }`}>
                <DSIcon name={feature.icon} size={20} />
              </div>
              <div className="min-w-0 grow">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-white truncate">{feature.title}</h3>
                  {!feature.available && (
                    <span className="shrink-0 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-500" style={monoLabel}>
                      EM BREVE
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">{feature.description}</p>
              </div>
              {feature.available && (
                <DSIcon name="chevronRight" size={16} className="shrink-0 text-zinc-600" />
              )}
            </button>
          ))}
        </div>

        {/* CTA to create account */}
        <div className="mt-8 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-5 text-center">
          <DSIcon name="sparkles" size={24} className="mx-auto mb-2 text-brand-primary" />
          <h3 className="text-[15px] font-bold text-white">Quer desbloquear tudo?</h3>
          <p className="mt-1 text-[12px] text-zinc-400">
            Crie sua conta grátis e tenha acesso a treinos personalizados por IA, avaliação física completa e muito mais.
          </p>
          <Button
            onClick={() => router.push('/register')}
            className="mt-4 w-full uppercase tracking-wider font-black"
          >
            CRIAR CONTA GRÁTIS
            <DSIcon name="arrowRight" size={16} />
          </Button>
        </div>
      </main>
    </div>
  )
}

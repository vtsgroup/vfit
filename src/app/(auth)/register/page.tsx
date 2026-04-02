/**
 * src/app/(auth)/register/page.tsx
 *
 * Register — Ultra-modern role selection · 3D cards
 *
 * Exports: RegisterPage
 * Hooks: useEffect, useSearchParams
 * Features: 'use client' · DSIcon
 */

// ============================================
// Register — Ultra-modern role selection · 3D cards
// Koyeb-inspired dark theme · matching login style
// ============================================

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { GuestGuard } from '@/components/auth'
import { saveReferralCode, getReferralCode } from '@/lib/referral-cookie'

/* ─── Design tokens (mesmos do Hero / landing / login) ─── */
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

/* ─── Feature pill ─── */
function FeaturePill({ icon, label, included }: { icon: React.ReactNode; label: string; included: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] uppercase select-none transition-all ${
      included
        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
        : 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/30 line-through'
    }`} style={monoLabel}>
      <span className={included ? 'text-brand-primary' : 'text-zinc-600'}>{icon}</span>
      {label}
    </div>
  )
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const refParam = searchParams.get('ref')

  useEffect(() => {
    if (refParam) saveReferralCode(refParam)
  }, [refParam])

  const activeRef = refParam || getReferralCode()
  const refQuery = activeRef ? `?ref=${activeRef}` : ''

  return (
    <GuestGuard>
      <div className="animate-blur-in">
        {/* Referral badge */}
        {activeRef && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-brand-primary/20 bg-brand-primary/6 px-4 py-3">
            <DSIcon name="gift" size={16} className="text-brand-primary shrink-0" />
            <span className="text-[12px] font-semibold text-brand-primary">
              Indicação aplicada: {activeRef}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DSIcon name="sparkles" size={14} className="text-brand-primary/60" />
            <p className="text-[9px] uppercase text-brand-primary/70" style={monoLabel}>
              CRIE SUA CONTA
            </p>
          </div>
          <h1 className="text-[2rem] text-white leading-none" style={headingFont}>
            Começar grátis
          </h1>
          <p className="mt-1.5 text-[13px] text-zinc-600">
            Escolha seu perfil para personalizar a experiência
          </p>
        </div>

        {/* ─── 3D Role Cards ─── */}
        <div className="space-y-4">
          {/* Personal Trainer Card — 3D with green accent */}
          <Link
            href={`/register/personal${refQuery}`}
            className="group relative block rounded-2xl bg-linear-to-b from-[#0F1A2E] to-[#0B1322] border border-white/6 p-6 transition-all duration-300 shadow-[0_4px_0_0_#166534,0_6px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#166534,0_10px_30px_rgba(34,197,94,0.15)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#166534,0_3px_8px_rgba(0,0,0,0.3)]"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <div className="relative z-10">
              {/* Icon + Title + Arrow */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary to-[#16A34A] shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
                  <DSIcon name="dumbbell" size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] text-white" style={headingFont}>Personal Trainer</h3>
                    <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[8px] font-bold uppercase text-brand-primary" style={monoLabel}>
                      PRO
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-0.5">
                    Gerencie alunos, crie treinos com IA e automatize cobranças
                  </p>
                </div>
                <DSIcon name="arrowRight" className="text-zinc-600 transition-all group-hover:translate-x-1.5 group-hover:text-brand-primary" />
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-1.5">
                <FeaturePill icon={<DSIcon name="bot" size={10} />} label="IA GENERATIVA" included />
                <FeaturePill icon={<DSIcon name="creditCard" size={10} />} label="PIX AUTOMÁTICO" included />
                <FeaturePill icon={<DSIcon name="users" size={10} />} label="GESTÃO ALUNOS" included />
                <FeaturePill icon={<DSIcon name="barChart" size={10} />} label="MÉTRICAS" included />
                <FeaturePill icon={<DSIcon name="rocket" size={10} />} label="MARKETPLACE" included />
                <FeaturePill icon={<DSIcon name="calendarCheck" size={10} />} label="AGENDAMENTOS" included />
              </div>
            </div>
          </Link>

          {/* Student Card — 3D with sky accent */}
          <Link
            href={`/register/student${refQuery}`}
            className="group relative block rounded-2xl bg-linear-to-b from-[#0F1A2E] to-[#0B1322] border border-white/6 p-6 transition-all duration-300 shadow-[0_4px_0_0_#1e3a5f,0_6px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#1e3a5f,0_10px_30px_rgba(56,189,248,0.1)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#1e3a5f,0_3px_8px_rgba(0,0,0,0.3)]"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <div className="relative z-10">
              {/* Icon + Title + Arrow */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 to-sky-600 shadow-[0_4px_12px_rgba(56,189,248,0.3)]">
                  <DSIcon name="graduationCap" size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] text-white" style={headingFont}>Aluno</h3>
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[8px] font-bold uppercase text-sky-400" style={monoLabel}>
                      FREE
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-0.5">
                    Acesse treinos, compre no marketplace e acompanhe sua evolução
                  </p>
                </div>
                <DSIcon name="arrowRight" className="text-zinc-600 transition-all group-hover:translate-x-1.5 group-hover:text-sky-400" />
              </div>

              {/* Feature pills — only included ones */}
              <div className="flex flex-wrap gap-1.5">
                <FeaturePill icon={<DSIcon name="shoppingBag" size={10} />} label="MARKETPLACE" included />
                <FeaturePill icon={<DSIcon name="trophy" size={10} />} label="GAMIFICAÇÃO" included />
                <FeaturePill icon={<DSIcon name="star" size={10} />} label="EVOLUÇÃO" included />
              </div>

              {/* Info note */}
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky-500/6 border border-sky-400/10 px-3 py-2">
                <DSIcon name="shield" size={14} className="text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-sky-300/80 leading-relaxed">
                  Cadastre-se sem personal — compre treinos no marketplace. Vincule-se a um personal a qualquer momento.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between">
          <p className="text-[13px] text-zinc-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
              Entrar
            </Link>
          </p>
          <span className="flex items-center gap-1.5 text-[9px] text-zinc-700" style={monoLabel}>
            <DSIcon name="shield" size={12} /> SSL · LGPD
          </span>
        </div>
      </div>
    </GuestGuard>
  )
}

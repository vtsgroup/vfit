/**
 * src/app/(app)/perfil/page.tsx
 *
 * PERFIL — Tela completa com todas as configurações
 * Seções: Header, Assinatura CTA, Academia, App, Conta
 */

'use client'

import type React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useUpdateAdminSimulationSession } from '@/hooks/use-admin'
import { APP_VERSION, BUILD_DATE, BUILD_NUMBER } from '../../../../lib/version'

type MenuTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate'

const toneStyles: Record<MenuTone, { tile: string; arrow: string; accent: string }> = {
  emerald: {
    tile: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    arrow: 'text-emerald-500',
    accent: 'from-emerald-400/18',
  },
  sky: {
    tile: 'bg-sky-50 text-sky-600 ring-sky-100',
    arrow: 'text-sky-500',
    accent: 'from-sky-400/18',
  },
  amber: {
    tile: 'bg-amber-50 text-amber-700 ring-amber-100',
    arrow: 'text-amber-500',
    accent: 'from-amber-400/18',
  },
  violet: {
    tile: 'bg-violet-50 text-violet-600 ring-violet-100',
    arrow: 'text-violet-500',
    accent: 'from-violet-400/18',
  },
  rose: {
    tile: 'bg-rose-50 text-rose-600 ring-rose-100',
    arrow: 'text-rose-500',
    accent: 'from-rose-400/18',
  },
  slate: {
    tile: 'bg-slate-100 text-slate-600 ring-slate-200',
    arrow: 'text-slate-400',
    accent: 'from-slate-300/28',
  },
}

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const isAdminSimulating = user?.role === 'super_admin' || user?.role === 'admin'
  const exitSimulation = useUpdateAdminSimulationSession()
  const buildShort = String(BUILD_NUMBER).slice(-6)
  const buildDateLabel = `${BUILD_DATE.slice(8, 10)}/${BUILD_DATE.slice(5, 7)}`

  // TODO: Sprint 25 — checar subscription real. Por ora: sempre false para B2C
  const isPremium = false

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-lg bg-linear-to-b from-white via-slate-50 to-white px-4 pt-0 pb-28 text-slate-950">
      {/* Profile header */}
      <div
        className="relative -mx-4 mb-5 overflow-hidden rounded-b-[34px] border-b-0 px-4 pb-6 pt-5 text-white backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 22px 46px -26px rgba(5,10,18,0.96)' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/10 via-sky-300/6 to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-8 h-44 w-44 rounded-full bg-emerald-300/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex h-19 w-19 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border border-white/12 bg-white/8 text-brand-primary shadow-[0_18px_42px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.16)]">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                width={76}
                height={76}
                className="h-full w-full object-cover"
              />
            ) : (
              <DSIcon name="user" size={30} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
              Perfil ativo
            </div>
            <h1 className="truncate text-[28px] font-black leading-none text-white">
              {user?.full_name || 'Visitante'}
            </h1>
            <p className="mt-1 max-w-56 truncate text-[13px] font-medium text-slate-300">{user?.email || 'Sem conta'}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                isPremium
                  ? 'border-emerald-300/25 bg-emerald-300/12 text-emerald-200'
                  : 'border-white/10 bg-white/8 text-slate-200'
              }`}>
                <DSIcon name={isPremium ? 'crown' : 'shield'} size={11} />
                {isPremium ? 'Premium' : 'Conta básica'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                v{APP_VERSION}
              </span>
            </div>
          </div>

          <Link
            href="/perfil/editar"
            aria-label="Editar perfil"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/12 bg-white/8 text-white/75 shadow-glass-inset-md transition-all duration-200 hover:bg-white/12 hover:text-white active:scale-95"
          >
            <DSIcon name="penLine" size={20} />
          </Link>
        </div>
      </div>

      {/* Admin Simulation Banner */}
      {isAdminSimulating && (
        <div className="mb-5 overflow-hidden rounded-[28px] border border-amber-200 bg-linear-to-br from-amber-50 via-white to-amber-100/70 p-4 shadow-[0_18px_42px_-30px_rgba(180,83,9,0.55)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <DSIcon name="shield" size={21} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-amber-950">Modo Simulação Ativo</p>
              <p className="text-[12px] font-medium text-amber-700/75">Você está visualizando como aluno</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            loading={exitSimulation.isPending}
            onClick={async () => {
              await exitSimulation.mutateAsync({ mode: 'super_admin' })
              // Full reload para garantir que o dashboard carregue com estado admin correto
              window.location.href = '/dashboard/admin'
            }}
          >
            <DSIcon name="arrowLeft" size={16} />
            Voltar ao Painel Admin
          </Button>
        </div>
      )}

      {/* Premium CTA */}
      {!isPremium && (
        <Link
          href="/perfil/assinatura"
          className="group relative mb-5 flex min-h-24 items-center gap-3 overflow-hidden rounded-[28px] border border-emerald-100 bg-linear-to-br from-white via-emerald-50/70 to-sky-50 p-4 shadow-[0_18px_45px_-32px_rgba(16,185,129,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-300/18 blur-2xl" />
          <div className="relative flex h-13 w-13 items-center justify-center rounded-[18px] bg-linear-to-b from-emerald-300 to-emerald-600 text-white shadow-[0_10px_24px_-14px_rgba(5,150,105,0.9),inset_0_1px_0_rgba(255,255,255,0.35)]">
            <DSIcon name="crown" size={23} />
          </div>
          <div className="relative flex-1">
            <p className="text-[15px] font-black text-slate-950">Ative sua conta Premium</p>
            <p className="mt-0.5 text-[12px] leading-snug text-slate-500">IA ilimitada, evolução avançada e experiência sem anúncios</p>
          </div>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm transition-transform group-hover:translate-x-0.5">
            <DSIcon name="arrowRight" size={16} />
          </div>
        </Link>
      )}

      {/* ACADEMIA Section */}
      <Section title="Treino e rotina" eyebrow="Academia">
        <MenuItem icon="ruler" label="Unidades de medida" subtitle="Métrico · kg e cm" href="/perfil/unidades" tone="sky" />
        <MenuItem icon="dumbbell" label="Equipamentos" subtitle="Ajuste sua academia e treino em casa" href="/perfil/equipamentos" tone="emerald" />
        <MenuItem icon="clock" label="Descanso padrão" subtitle="Intervalos, ritmo e execução" href="/perfil/descanso" tone="amber" />
        <MenuItem icon="bell" label="Lembretes de treino" subtitle="Horários e consistência" href="/perfil/lembretes" tone="violet" />
      </Section>

      {/* APP Section */}
      <Section title="Experiência" eyebrow="App">
        <MenuItem icon="settings" label="Notificações" subtitle="Push, avisos e preferências" href="/perfil/notificacoes" tone="sky" />
        <MenuItem icon="trophy" label="Gamificação" subtitle="XP, níveis e conquistas" href="/perfil/gamificacao" tone="amber" />
        <MenuItem icon="target" label="Desafios" subtitle="Metas de constância e evolução" href="/perfil/desafios" tone="emerald" />
        <MenuItem icon="wifiOff" label="Offline e performance" subtitle="Dados locais e modo rápido" href="/perfil/offline" tone="slate" />
        <MenuItem icon="sparkles" label="Novidades" subtitle={`Versão ${APP_VERSION} · build ${buildShort}`} href="/perfil/changelog" tone="violet" />
      </Section>

      {/* CONTA Section */}
      <Section title="Conta e segurança" eyebrow="Conta">
        <MenuItem icon="edit3" label="Editar perfil" subtitle="Nome, foto e dados básicos" href="/perfil/editar" tone="emerald" />
        <MenuItem icon="creditCard" label="Minha assinatura" subtitle="Plano, cobrança e benefícios" href="/perfil/assinatura" tone="amber" />
        <MenuItem icon="shield" label="Privacidade" subtitle="Dados, permissões e LGPD" href="/privacidade" tone="sky" />
        <MenuItem icon="fileText" label="Termos de uso" subtitle="Regras da plataforma" href="/termos" tone="slate" />
        <MenuItem icon="helpCircle" label="Sobre o app" subtitle="Versão, suporte e créditos" href="/perfil/sobre" tone="violet" />
      </Section>

      <div className="mb-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-slate-950 text-emerald-300 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)]">
            <DSIcon name="smartphone" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black text-slate-950">VFIT App</p>
            <p className="text-[11px] font-medium text-slate-500">Versão {APP_VERSION} · build {buildShort} · {buildDateLabel}</p>
          </div>
          <Link href="/perfil/changelog" className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-700 transition-colors hover:bg-slate-200">
            Ver notas
          </Link>
        </div>
      </div>

      {/* Logout */}
      <Button
        type="button"
        onClick={handleLogout}
        variant="ghost-danger"
        className="mb-3 w-full justify-start rounded-[18px] border-red-200 bg-red-50/70 px-4 text-red-600 hover:bg-red-50"
      >
        <DSIcon name="logout" size={20} />
        Sair da conta
      </Button>

      {/* Delete account */}
      <Link
        href="/excluir-conta"
        className="flex min-h-12 w-full items-center gap-3 rounded-[18px] px-4 py-3 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
      >
        <DSIcon name="trash2" size={18} />
        <span className="text-[12px] font-bold">Excluir minha conta</span>
      </Link>
    </div>
  )
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">{eyebrow}</p>
          <h2 className="text-[16px] font-black text-slate-950">{title}</h2>
        </div>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.42)]">
        {children}
      </div>
    </section>
  )
}

function MenuItem({
  icon,
  label,
  subtitle,
  href,
  tone = 'emerald',
}: {
  icon: DSIconName
  label: string
  subtitle?: string
  href: string
  tone?: MenuTone
}) {
  const styles = toneStyles[tone]

  return (
    <Link
      href={href}
      className="group relative flex min-h-17 items-center gap-3 overflow-hidden border-b border-slate-100 px-4 py-3.5 text-slate-600 transition-all duration-200 last:border-b-0 hover:bg-slate-50 active:scale-[0.995]"
    >
      <div className={`pointer-events-none absolute inset-y-2 left-0 w-16 bg-linear-to-r ${styles.accent} to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
      <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ring-1 ${styles.tile}`}>
        <DSIcon name={icon} size={19} />
      </div>
      <div className="relative min-w-0 flex-1">
        <span className="block truncate text-[14px] font-black text-slate-950">{label}</span>
        {subtitle && <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-slate-500">{subtitle}</p>}
      </div>
      <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-white ${styles.arrow}`}>
        <DSIcon name="chevronRight" size={15} />
      </div>
    </Link>
  )
}

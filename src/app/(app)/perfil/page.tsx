/**
 * src/app/(app)/perfil/page.tsx
 *
 * PERFIL — Tela completa com todas as configurações
 * Seções: Header, Assinatura CTA, Academia, App, Conta
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useUpdateAdminSimulationSession } from '@/hooks/use-admin'
import { APP_VERSION } from '../../../../lib/version'

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const isAdminSimulating = user?.role === 'super_admin' || user?.role === 'admin'
  const exitSimulation = useUpdateAdminSimulationSession()

  // TODO: Sprint 25 — checar subscription real. Por ora: sempre false para B2C
  const isPremium = false

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-0 pb-24">
      {/* Profile header */}
      <div
        className="-mx-4 mb-5 flex items-center gap-4 rounded-b-3xl border-b-0 px-4 py-5 backdrop-blur-md"
        style={{ background: 'linear-gradient(to bottom, #0b1d36 0%, #0c1f38 20%, #0b1c35 40%, #0a1830 65%, #071628 85%, #050A12 100%)', boxShadow: '0 6px 28px 0 rgba(5,10,18,0.6)' }}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-brand-primary">
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={64}
              height={64}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <DSIcon name="user" size={28} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-black text-white">
            {user?.full_name || 'Visitante'}
          </h1>
          <p className="text-[12px] text-white/60">{user?.email || 'Sem conta'}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isPremium
              ? 'bg-brand-primary/20 text-emerald-300'
              : 'bg-white/8 text-white/65'
          }`}>
            {isPremium ? '⭐ PREMIUM' : 'CONTA BÁSICA'}
          </span>
        </div>
        <Link
          href="/perfil/editar"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/70 transition-colors hover:text-white"
        >
          <DSIcon name="edit3" size={18} />
        </Link>
      </div>

      {/* Admin Simulation Banner */}
      {isAdminSimulating && (
        <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <DSIcon name="shield" size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-amber-300">Modo Simulação Ativo</p>
              <p className="text-[11px] text-amber-400/70">Você está visualizando como aluno</p>
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
          className="glass-card mb-5 flex items-center gap-3 rounded-2xl p-4 transition-all hover:border-brand-primary/20"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/8">
            <DSIcon name="crown" size={22} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-text-primary">Ative sua conta Premium</p>
            <p className="text-[11px] text-text-muted">Planos sem anúncios, IA ilimitada e mais</p>
          </div>
          <DSIcon name="chevronRight" size={16} className="text-brand-primary" />
        </Link>
      )}

      {/* ACADEMIA Section */}
      <SectionTitle title="ACADEMIA" />
      <div className="mb-5 space-y-0.5">
        <MenuItem icon="ruler" label="Unidades de medida" subtitle="Métrico (kg/cm)" href="/perfil/unidades" />
        <MenuItem icon="dumbbell" label="Equipamentos" subtitle="Selecione sua academia" href="/perfil/equipamentos" />
        <MenuItem icon="clock" label="Descanso padrão" subtitle="60 segundos" href="/perfil/descanso" />
        <MenuItem icon="bell" label="Lembretes de treino" href="/perfil/lembretes" />
      </div>

      {/* APP Section */}
      <SectionTitle title="APP" />
      <div className="mb-5 space-y-0.5">
        <MenuItem icon="settings" label="Notificações" href="/perfil/notificacoes" />
        <MenuItem icon="moon" label="Tema" subtitle="Escuro" href="/perfil/tema" />
      </div>

      {/* CONTA Section */}
      <SectionTitle title="CONTA" />
      <div className="mb-5 space-y-0.5">
        <MenuItem icon="edit3" label="Editar perfil" href="/perfil/editar" />
        <MenuItem icon="creditCard" label="Minha assinatura" href="/perfil/assinatura" />
        <MenuItem icon="shield" label="Privacidade" href="/privacidade" />
        <MenuItem icon="fileText" label="Termos de uso" href="/termos" />
        <MenuItem icon="helpCircle" label="Sobre o app" href="/perfil/sobre" />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-400 hover:bg-red-400/5 transition-all"
      >
        <DSIcon name="logout" size={20} />
        <span className="text-[14px] font-medium">Sair da conta</span>
      </button>

      {/* Delete account */}
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted hover:text-red-400 hover:bg-red-400/5 transition-all"
      >
        <DSIcon name="trash2" size={18} />
        <span className="text-[12px] font-medium">Excluir minha conta</span>
      </button>

      {/* Version */}
      <p className="mt-6 text-center text-[10px] text-text-muted">VFIT v{APP_VERSION}</p>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">{title}</p>
  )
}

function MenuItem({
  icon,
  label,
  subtitle,
  href,
}: {
  icon: DSIconName
  label: string
  subtitle?: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-text-secondary hover:bg-white/4 hover:text-text-primary transition-all"
    >
      <DSIcon name={icon} size={20} />
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium text-text-secondary">{label}</span>
        {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
      </div>
      <DSIcon name="chevronRight" size={16} className="text-text-muted" />
    </Link>
  )
}

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
import { useAuthStore } from '@/stores/auth-store'

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  // TODO: Sprint 25 — checar subscription real. Por ora: sempre false para B2C
  const isPremium = false

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Profile header */}
      <div className="mb-5 flex items-center gap-4">
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
          <p className="text-[12px] text-zinc-500">{user?.email || 'Sem conta'}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isPremium
              ? 'bg-brand-primary/15 text-brand-primary'
              : 'bg-zinc-800 text-zinc-400'
          }`}>
            {isPremium ? '⭐ PREMIUM' : 'CONTA BÁSICA'}
          </span>
        </div>
        <Link
          href="/perfil/editar"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
        >
          <DSIcon name="edit3" size={18} className="text-zinc-400" />
        </Link>
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <Link
          href="/perfil/assinatura"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 transition-all hover:bg-white/5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/8">
            <DSIcon name="crown" size={22} className="text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Ative sua conta Premium</p>
            <p className="text-[11px] text-zinc-500">Planos sem anúncios, IA ilimitada e mais</p>
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
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-zinc-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
      >
        <DSIcon name="trash2" size={18} />
        <span className="text-[12px] font-medium">Excluir minha conta</span>
      </button>

      {/* Version */}
      <p className="mt-6 text-center text-[10px] text-zinc-700">VFIT v6.7.7</p>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">{title}</p>
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
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-zinc-400 hover:bg-white/4 hover:text-white transition-all"
    >
      <DSIcon name={icon} size={20} />
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium text-zinc-300">{label}</span>
        {subtitle && <p className="text-[11px] text-zinc-600">{subtitle}</p>}
      </div>
      <DSIcon name="chevronRight" size={16} className="text-zinc-700" />
    </Link>
  )
}

'use client'

import { DSIcon } from '@/components/ui/ds-icon'
import { useRouter } from 'next/navigation'
import PasskeySettingsCard from '@/components/settings/passkey-settings-card'

export default function SegurancaPage() {
  const router = useRouter()

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg overflow-hidden bg-slate-950 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative px-4 pt-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            <DSIcon name="chevronLeft" size={16} />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-white">Segurança da Conta</h1>
          <p className="mt-2 text-sm text-white/60">Gerencie biometria e proteção da conta</p>
        </div>

        {/* Login biométrico + política de app lock (mesmo card do dashboard do personal) */}
        <PasskeySettingsCard />

        {/* Alteração de senha — via fluxo de recuperação por enquanto */}
        <div className="mt-4 glass-card rounded-2xl border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
              <DSIcon name="lock" size={16} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Senha</p>
              <p className="mt-1 text-xs text-white/60">
                Para alterar sua senha, use a opção &quot;Esqueci minha senha&quot; na tela de login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

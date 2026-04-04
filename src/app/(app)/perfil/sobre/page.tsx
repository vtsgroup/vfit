/**
 * src/app/(app)/perfil/sobre/page.tsx
 *
 * Sobre o app — versão, links, créditos
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'

export default function SobrePage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button aria-label="Voltar" onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <DSIcon name="arrowLeft" size={20} className="text-zinc-400" />
        </button>
        <h1 className="text-lg font-bold text-white">Sobre o app</h1>
      </div>

      {/* Logo + version */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-primary/15 text-brand-primary">
          <DSIcon name="dumbbell" size={36} />
        </div>
        <h2 className="text-xl font-black text-white">VFIT</h2>
        <p className="text-[12px] text-zinc-500">Versão 6.7.7</p>
      </div>

      <p className="mb-6 text-center text-[13px] leading-relaxed text-zinc-400">
        Seu treino inteligente, feito sob medida por IA. Evolua todos os dias com treinos personalizados, acompanhamento de progresso e muito mais.
      </p>

      <div className="space-y-0.5">
        <LinkItem icon="shield" label="Política de Privacidade" href="/privacidade" />
        <LinkItem icon="fileText" label="Termos de Uso" href="/termos" />
        <LinkItem icon="helpCircle" label="Central de Ajuda" href="mailto:suporte@vfit.app.br" />
      </div>

      <p className="mt-10 text-center text-[10px] text-zinc-700">
        © 2026 VFIT · Todos os direitos reservados
      </p>
    </div>
  )
}

function LinkItem({ icon, label, href }: { icon: 'shield' | 'fileText' | 'helpCircle'; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-zinc-400 hover:bg-white/4 hover:text-white transition-all"
    >
      <DSIcon name={icon} size={20} />
      <span className="flex-1 text-[14px] font-medium text-zinc-300">{label}</span>
      <DSIcon name="chevronRight" size={16} className="text-zinc-700" />
    </Link>
  )
}

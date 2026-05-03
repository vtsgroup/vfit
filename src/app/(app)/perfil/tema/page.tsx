/**
 * src/app/(app)/perfil/tema/page.tsx
 *
 * Tema — App do aluno em modo claro otimizado
 */

'use client'

import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { hapticSuccess } from '@/lib/haptics'

export default function TemaPage() {
  const router = useRouter()

  const handleSave = () => {
    hapticSuccess()
    router.back()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
        >
          <DSIcon name="arrowLeft" size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-950">Tema</h1>
          <p className="text-[11px] text-slate-500">Aparência do app do aluno</p>
        </div>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-linear-to-br from-white to-sky-50 p-5 shadow-[0_18px_45px_-32px_rgba(37,99,235,0.45)]">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <DSIcon name="sun" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-950">Claro otimizado</p>
            <p className="text-[12px] leading-relaxed text-slate-500">
              O app do aluno usa tema claro fixo para leitura, treinos e acompanhamento diário.
            </p>
          </div>
          <DSIcon name="checkCircle" size={20} className="text-brand-primary" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ['Leitura', 'Texto com alto contraste'],
            ['Treino', 'Melhor visibilidade na academia'],
            ['Rotina', 'Menos distração no dia a dia'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold text-slate-900">{title}</p>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-start gap-2">
          <DSIcon name="info" size={14} className="mt-0.5 shrink-0 text-emerald-700" />
          <p className="text-xs leading-relaxed text-emerald-900">
            Personal trainers e administradores continuam com o tema premium do dashboard.
            Esta tela mostra a regra específica do app do aluno.
          </p>
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        className="mt-6 w-full"
      >
        <DSIcon name="checkCircle" size={16} />
        Salvar
      </Button>
    </div>
  )
}

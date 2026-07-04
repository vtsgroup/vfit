'use client'

import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'

export interface UpsellV2Props {
  trigger: { kind: 'aluno_concluiu' | 'novo_aluno' | 'marco_semanal'; headline: string; detail: string }
  planPrice?: string
  onDismiss: () => void
  onUpgrade: () => void
}

// Sheet ancorado na base: chanfros no topo, base reta (cola no fim da tela).
const CHAMFER_SHEET = 'polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%, 0 18px)'
const CHAMFER_CTA = 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
const CHAMFER_CHIP = 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
const CARBON = [
  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)',
].join(', ')

interface KindCopy {
  badge: string
  icon: DSIconName
  hoje: string[]
  pro: string[]
}

const KIND_COPY: Record<UpsellV2Props['trigger']['kind'], KindCopy> = {
  aluno_concluiu: {
    badge: 'Treino concluído',
    icon: 'checkCheck',
    hoje: ['Check de conclusão', 'Volume total da sessão'],
    pro: ['Relatório completo da sessão', 'Série histórica de cargas', 'Chat direto com o aluno'],
  },
  novo_aluno: {
    badge: 'Novo aluno',
    icon: 'userPlus',
    hoje: ['Aluno na sua lista', 'Ficha básica de cadastro'],
    pro: ['Plano gerado com IA em minutos', 'Anamnese completa', 'Chat direto com o aluno'],
  },
  marco_semanal: {
    badge: 'Marco da semana',
    icon: 'trophy',
    hoje: ['Total de treinos da semana', 'Sequência atual'],
    pro: ['Relatório semanal por aluno', 'Série histórica de evolução', 'Comparativo semana a semana'],
  },
}

function ColumnLabel({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <p
      className={`text-[9px] font-black italic uppercase tracking-[0.28em] ${accent ? 'text-emerald-400' : 'text-slate-400'}`}
      style={{ transform: 'skewX(-6deg)' }}
    >
      {text}
    </p>
  )
}

export function UpsellV2AntesDepois({ trigger, planPrice = 'R$ 29,90', onDismiss, onUpgrade }: UpsellV2Props) {
  const copy = KIND_COPY[trigger.kind]

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={`${copy.badge} — conheça o Pro`}
      className="relative w-full overflow-hidden text-white shadow-[0_-16px_44px_rgba(0,0,0,0.55)] [animation:vfit-lab2c-rise_.45s_cubic-bezier(.22,1,.36,1)_both] motion-reduce:[animation:none]"
      style={{
        clipPath: CHAMFER_SHEET,
        background: 'linear-gradient(to bottom, #161b22 0%, #10151c 55%, #0d1117 100%)',
      }}
    >
      <style>{`
        @keyframes vfit-lab2c-rise { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes vfit-lab2c-cols { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: CARBON }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" aria-hidden />
      <div
        className="pointer-events-none absolute -top-8 right-6 h-40 w-40"
        style={{ background: 'radial-gradient(circle at 70% 20%, rgba(34,197,94,0.14), transparent 65%)' }}
        aria-hidden
      />

      <div className="relative px-4 pb-4 pt-4">
        {/* Celebração primeiro — a vitória do personal é a manchete */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              <DSIcon name={copy.icon} size={12} />
              {copy.badge}
            </p>
            <h2
              className="mt-1.5 text-[24px] font-black italic leading-[0.98] tracking-tight text-white"
              style={{ transform: 'skewX(-4deg)', transformOrigin: 'left bottom' }}
            >
              {trigger.headline}
            </h2>
            <p className="mt-1 text-[12px] font-medium leading-snug text-slate-300">{trigger.detail}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar"
            className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-white active:translate-y-px active:text-slate-300"
          >
            <DSIcon name="x" size={16} />
          </button>
        </div>

        {/* HOJE vs PRO — só o delta que importa para ESTA vitória */}
        <div
          className="mt-4 grid grid-cols-[1fr_auto_1.15fr] gap-3 [animation:vfit-lab2c-cols_.5s_cubic-bezier(.22,1,.36,1)_.12s_both] motion-reduce:[animation:none]"
        >
          <div className="min-w-0 py-1">
            <ColumnLabel text="Hoje" />
            <ul className="mt-2.5 space-y-2">
              {copy.hoje.map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug text-slate-400">
                  <DSIcon name="circle" size={10} className="mt-0.5 shrink-0 text-slate-500" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col items-center" aria-hidden>
            <div className="w-px flex-1 bg-linear-to-b from-transparent via-white/15 to-transparent" />
            <span
              className="my-1.5 flex h-7 w-7 items-center justify-center text-[#052e16]"
              style={{
                clipPath: CHAMFER_CHIP,
                background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 55%, #16a34a 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              <DSIcon name="arrowRight" size={14} />
            </span>
            <div className="w-px flex-1 bg-linear-to-b from-transparent via-emerald-400/40 to-transparent" />
          </div>

          <div
            className="min-w-0 border-l-2 border-emerald-500/40 bg-white/4 px-3 py-2.5"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
          >
            <ColumnLabel text="Pro" accent />
            <ul className="mt-2.5 space-y-2">
              {copy.pro.map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-[11.5px] font-bold leading-snug text-white">
                  <DSIcon name="check" size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé: preço discreto + 1 CTA + saída fácil */}
        <div className="mt-4 border-t border-white/8 pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-400">Plano Pro</p>
            <p className="text-[13px] font-black italic tracking-tight text-emerald-400" style={{ transform: 'skewX(-6deg)' }}>
              {planPrice}
              <span className="ml-0.5 text-[9px] font-bold not-italic tracking-normal text-slate-400">/mês</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onUpgrade}
            className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 text-[15px] font-black italic tracking-tight text-white transition-all duration-150 [text-shadow:0_1px_2px_rgba(2,44,34,0.4)] hover:brightness-110 active:translate-y-px active:brightness-90"
            style={{
              clipPath: CHAMFER_CTA,
              background: 'linear-gradient(180deg, #2ee06e 0%, #22C55E 45%, #15803d 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
            }}
          >
            Ativar o Pro
            <DSIcon name="arrowRight" size={16} />
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-1 flex h-11 w-full items-center justify-center text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-slate-200 active:translate-y-px active:text-slate-300"
          >
            Agora não
          </button>
        </div>
      </div>
    </section>
  )
}

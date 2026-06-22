// ============================================
// pricing-toggle.tsx — Toggle mensal/anual para seção de preços
// ============================================
//
// O que faz:
//   Switch visual para alternar entre preço mensal e anual.
//   Badge "Economize X%" visível no modo anual.
//   Callback onChange(annual: boolean) ao trocar.
//
// Exports principais:
//   PricingToggle — toggle mensal/anual
'use client'

interface PricingToggleProps {
  isAnnual: boolean
  onChange: (annual: boolean) => void
}

export function PricingToggle({ isAnnual, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-zinc-400'}`}>
        Mensal
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isAnnual}
        aria-label={isAnnual ? 'Alternar para plano mensal' : 'Alternar para plano anual'}
        onClick={() => onChange(!isAnnual)}
        className="relative inline-flex h-7 w-13 items-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-brand-primary transition-transform ${
            isAnnual ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-zinc-400'}`}>
        Anual
      </span>
      {isAnnual && (
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
          -20%
        </span>
      )}
    </div>
  )
}

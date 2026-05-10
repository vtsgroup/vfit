/**
 * src/app/(app)/treinos/loading.tsx
 *
 * Skeleton route-level para /treinos — P2.12
 * Mimetiza o FirstWinCommandCenter + lista de templates abaixo.
 */

const S = 'animate-pulse bg-white/8'

export default function TreinosLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-0 pb-28">
      {/* ── Command center skeleton ─────────────────────────────────── */}
      <div className="-mx-4 mb-5 min-h-110 overflow-hidden rounded-b-[30px] bg-linear-to-b from-[#0b1d36] via-[#08172d] to-[#050A12] shadow-[0_18px_48px_rgba(5,10,18,0.42)]">
        <div className="px-4 pt-5 pb-4">
          {/* Label + título */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`${S} mb-2 h-2.5 w-28 rounded`} />
              <div className={`${S} mb-3 h-8 w-44 rounded-lg`} />
              <div className={`${S} h-3 w-56 rounded`} />
            </div>
            {/* Streak pill */}
            <div className={`${S} h-14 w-16 shrink-0 rounded-2xl`} />
          </div>

          {/* Card treino do dia */}
          <div className="rounded-3xl border border-white/10 bg-white/7 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className={`${S} mb-2 h-6 w-32 rounded-full`} />
                <div className={`${S} mb-2 h-6 w-48 rounded-lg`} />
                <div className={`${S} h-3.5 w-36 rounded`} />
              </div>
              <div className={`${S} h-14 w-14 shrink-0 rounded-2xl`} />
            </div>

            {/* Metric tiles */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-white/8 bg-slate-900/70 p-2.5">
                  <div className={`${S} mb-2 h-2.5 w-8 rounded`} />
                  <div className={`${S} mb-2 h-5 w-12 rounded`} />
                  <div className={`${S} h-1.5 w-full rounded-full`} />
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="h-11 w-full animate-pulse rounded-[13px] border border-emerald-900/60 bg-linear-to-b from-emerald-300/60 via-emerald-500/50 to-green-700/50 shadow-[0_5px_0_0_#064e3b]" />
          </div>

          {/* Atalhos nutrição/plano */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[0, 1].map(i => (
              <div key={i} className={`${S} h-20 rounded-2xl`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Seções abaixo ─────────────────────────────────────────────── */}
      <div className="space-y-5 px-0">
        {/* Seção com título */}
        {[60, 80, 100].map((h, i) => (
          <div key={i}>
            <div className={`${S} mb-3 h-4 w-40 rounded`} />
            <div className={`${S} ${h === 60 ? 'h-32' : h === 80 ? 'h-48' : 'h-64'} rounded-[28px] border border-emerald-100/10`} />
          </div>
        ))}

        {/* Biblioteca de templates — grid de cards */}
        <div>
          <div className={`${S} mb-3 h-4 w-44 rounded`} />
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`${S} h-20 rounded-2xl`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

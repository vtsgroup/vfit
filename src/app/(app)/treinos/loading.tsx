/**
 * src/app/(app)/treinos/loading.tsx
 *
 * Skeleton route-level para /treinos — P2.12
 * Mimetiza o FirstWinCommandCenter + lista de templates abaixo.
 */

const S = 'animate-pulse bg-white/5'

export default function TreinosLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* ── Command center skeleton ─────────────────────────────────── */}
      <div className="-mx-4 mb-5 overflow-hidden rounded-b-3xl border-b border-white/8 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 shadow-xl">
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
          <div className="rounded-3xl border border-white/10 bg-white/6 p-3.5">
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
            <div className={`${S} h-14 w-full rounded-2xl`} />
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
            <div className={`${S} h-${h === 60 ? '32' : h === 80 ? '48' : '64'} rounded-2xl`} />
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

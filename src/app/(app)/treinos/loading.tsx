/**
 * src/app/(app)/treinos/loading.tsx
 *
 * Skeleton route-level para /treinos — P2.12
 * Mimetiza o FirstWinCommandCenter + lista de templates abaixo.
 */

const S = 'animate-pulse bg-white/5'

export default function TreinosLoading() {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pt-0 pb-28">
      {/* ── Command center skeleton ─────────────────────────────────── */}
      <div className="vfit-app-hero-gradient -mx-4 mb-4 min-h-103 overflow-hidden rounded-b-[28px] border-b border-white/8 shadow-xl">
        <div className="relative px-4 pt-4 pb-3">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#050A12] via-[#050A12]/70 to-transparent" />
          {/* Label + título */}
          <div className="relative z-1 mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`${S} mb-2 h-2.5 w-28 rounded`} />
              <div className={`${S} mb-3 h-8 w-44 rounded-lg`} />
              <div className={`${S} h-3 w-56 rounded`} />
            </div>
            {/* Streak pill */}
            <div className={`${S} h-14 w-16 shrink-0 rounded-2xl`} />
          </div>

          {/* Card treino do dia */}
          <div className="relative z-1 rounded-[26px] border border-white/12 bg-white/7 p-3 shadow-[0_18px_46px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-xl">
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
          <div className="relative z-1 mt-3 grid grid-cols-2 gap-2">
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

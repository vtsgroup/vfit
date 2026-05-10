/**
 * src/app/(app)/avaliacoes/loading.tsx
 *
 * Skeleton route-level para /avaliacoes — P2.14
 * Mimetiza a listagem de cards de auto-avaliação.
 */

const S = 'animate-pulse bg-white/5'

export default function AvaliacoesLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* ── Header + CTA ──────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between pt-1">
        <div>
          <div className={`${S} mb-2 h-5 w-36 rounded`} />
          <div className={`${S} h-3.5 w-24 rounded`} />
        </div>
        <div className={`${S} h-10 w-32 rounded-xl`} />
      </div>

      {/* ── Search bar ────────────────────────────────────────────── */}
      <div className={`${S} mb-4 h-11 w-full rounded-xl`} />

      {/* ── Cards de avaliação ────────────────────────────────────── */}
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className={`${S} h-48 rounded-2xl`} />
        ))}
      </div>
    </div>
  )
}

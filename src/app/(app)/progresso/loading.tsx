/**
 * src/app/(app)/progresso/loading.tsx
 *
 * Skeleton route-level para /progresso — P2.15
 * Mimetiza KPI grid + gráfico de barras + streak card.
 */

const S = 'animate-pulse bg-white/5'

export default function ProgressoLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* ── Tabs de período ───────────────────────────────────────── */}
      <div className="mb-5 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`${S} h-8 flex-1 rounded-full`} />
        ))}
      </div>

      {/* ── KPI grid 2×3 ─────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${S} h-21 rounded-2xl`} />
        ))}
      </div>

      {/* ── Gráfico de barras ─────────────────────────────────────── */}
      <div className={`${S} mb-5 h-44 rounded-2xl`} />

      {/* ── Streak card ───────────────────────────────────────────── */}
      <div className={`${S} mb-5 h-28 rounded-2xl`} />

      {/* ── Top exercícios ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className={`${S} h-4 w-36 rounded`} />
        {[0, 1, 2].map(i => (
          <div key={i} className={`${S} h-24 rounded-2xl`} />
        ))}
      </div>
    </div>
  )
}

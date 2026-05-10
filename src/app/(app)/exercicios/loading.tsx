/**
 * src/app/(app)/exercicios/loading.tsx
 *
 * Skeleton route-level para /exercicios — P2.16
 * Mimetiza barra de busca + filtros + grid de cards de exercícios.
 */

const S = 'animate-pulse bg-white/5'

export default function ExerciciosLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* ── Busca + filtros ───────────────────────────────────────── */}
      <div className="mb-4 flex gap-2">
        <div className={`${S} h-11 flex-1 rounded-xl`} />
        <div className={`${S} h-11 w-11 rounded-xl`} />
      </div>

      {/* Chips de grupo muscular */}
      <div className="mb-5 flex gap-2 overflow-hidden">
        {[80, 64, 72, 56, 68].map((w, i) => (
          <div key={i} className={`${S} h-8 shrink-0 rounded-full`} style={{ width: w }} />
        ))}
      </div>

      {/* ── Grid de exercícios ────────────────────────────────────── */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${S} h-20 rounded-2xl`} />
        ))}
      </div>
    </div>
  )
}

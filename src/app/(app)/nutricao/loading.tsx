/**
 * src/app/(app)/nutricao/loading.tsx
 *
 * Skeleton route-level para /nutricao — P2.13
 * Mimetiza macro ring + lista de refeições + FAB.
 */

const S = 'animate-pulse bg-white/5'

export default function NutricaoLoading() {
  return (
    <div className="min-h-screen pb-28">
      {/* ── Header macro ring ──────────────────────────────────────── */}
      <div className="mb-5 flex flex-col items-center gap-4 pt-2">
        {/* Ring */}
        <div className={`${S} h-36 w-36 rounded-full`} />
        {/* Macro pills */}
        <div className="flex gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className={`${S} h-8 w-20 rounded-full`} />
          ))}
        </div>
      </div>

      {/* ── Date selector ──────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className={`${S} h-8 w-8 rounded-xl`} />
        <div className={`${S} h-5 w-28 rounded`} />
        <div className={`${S} h-8 w-8 rounded-xl`} />
      </div>

      {/* ── Refeições do dia ───────────────────────────────────────── */}
      <div className="space-y-3">
        {['Café da manhã', 'Almoço', 'Lanche', 'Jantar'].map((_, i) => (
          <div key={i} className={`${S} h-24 rounded-2xl`} />
        ))}
      </div>

      {/* ── Vínculo nutricionista ─────────────────────────────────── */}
      <div className={`${S} mt-5 h-16 rounded-2xl`} />
    </div>
  )
}

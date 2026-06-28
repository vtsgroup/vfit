/**
 * src/app/dashboard/loading.tsx
 *
 * Dashboard Loading — loader on-brand unificado (BrandLoader)
 *
 * Exports: DashboardLoading
 *
 * v2 (2026-06-28): substitui o spinner de 3 anéis aninhados pelo BrandLoader
 * (marca V + halo + barra). Evita white flash nas transições de rota e fica
 * coerente com o splash de abertura.
 */

import { BrandLoader } from '@/components/ui/brand-loader'

export default function DashboardLoading() {
  return <BrandLoader variant="inline" className="min-h-[60dvh]" label="Carregando" />
}

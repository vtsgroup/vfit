// ============================================
// page-metadata.tsx — Metadados de página (data, versão, tempo de leitura)
// ============================================
//
// O que faz:
//   Barra de metadados para páginas de conteúdo claras: última atualização,
//   versão, leitura. Card branco com borda slate e ícones verdes (kit
//   light-section). Cada campo é opcional, com ícone DSIcon correspondente.
//
// Exports principais:
//   PageMetadata — barra de metadados de página (light)
import { DSIcon } from '@/components/ui/ds-icon'

interface PageMetadataProps {
  lastUpdated: string
  version?: string
  readingTime?: string
}

export function PageMetadata({ lastUpdated, version, readingTime }: PageMetadataProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-medium text-slate-500"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 28px -20px rgba(15,23,42,0.18)' }}
    >
      <span className="inline-flex items-center gap-1.5">
        <DSIcon name="calendar" size={14} className="text-brand-primary" />
        Atualizado em {lastUpdated}
      </span>
      {version && (
        <span className="inline-flex items-center gap-1.5">
          <DSIcon name="fileText" size={14} className="text-brand-primary" />
          Versão {version}
        </span>
      )}
      {readingTime && (
        <span className="inline-flex items-center gap-1.5">
          <DSIcon name="clock" size={14} className="text-brand-primary" />
          {readingTime} de leitura
        </span>
      )}
    </div>
  )
}

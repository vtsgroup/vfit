// ============================================
// page-metadata.tsx — Metadados de página (data, versão, tempo de leitura)
// ============================================
//
// O que faz:
//   Barra de metadados para páginas de conteúdo: última atualização, versão, leitura.
//   Cada campo é opcional e renderizado com ícone DSIcon correspondente.
//
// Exports principais:
//   PageMetadata — barra de metadados de página
import { DSIcon } from '@/components/ui/ds-icon'

interface PageMetadataProps {
  lastUpdated: string
  version?: string
  readingTime?: string
}

export function PageMetadata({ lastUpdated, version, readingTime }: PageMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/8 bg-white/3 px-5 py-3 text-xs text-zinc-500 shadow-[0_2px_12px_rgba(0,0,0,0.15)] backdrop-blur-sm">
      <span className="inline-flex items-center gap-1.5">
        <DSIcon name="calendar" size={14} className="text-brand-primary/60" />
        Atualizado em {lastUpdated}
      </span>
      {version && (
        <span className="inline-flex items-center gap-1.5">
          <DSIcon name="fileText" size={14} className="text-brand-primary/60" />
          Versão {version}
        </span>
      )}
      {readingTime && (
        <span className="inline-flex items-center gap-1.5">
          <DSIcon name="clock" size={14} className="text-brand-primary/60" />
          {readingTime} de leitura
        </span>
      )}
    </div>
  )
}

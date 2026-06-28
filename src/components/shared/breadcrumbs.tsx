// ============================================
// breadcrumbs.tsx — Breadcrumbs de navegação com JSON-LD
// ============================================
//
// O que faz:
//   Renderiza trail de breadcrumbs com separadores e links clicáveis.
//   Item atual (último) exibido sem link e com cor diferenciada.
//   Gera JSON-LD BreadcrumbList para rich results de SEO.
//
// Exports principais:
//   BreadcrumbItem — interface { label, href? }
//   Breadcrumbs — componente de breadcrumbs com JSON-LD
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  /** 'dark' (default) usa tokens do tema (fundo escuro); 'light' usa slate p/ bandas claras */
  tone?: 'dark' | 'light'
}

export function Breadcrumbs({ items, tone = 'dark' }: BreadcrumbsProps) {
  const isLight = tone === 'light'
  const navColor = isLight ? 'text-slate-500' : 'text-text-secondary'
  const homeHover = isLight ? 'hover:text-emerald-700' : 'hover:text-text-primary'
  const sepColor = isLight ? 'text-slate-300' : 'text-text-secondary/50'
  const currentColor = isLight ? 'text-slate-600' : 'text-text-secondary'
  const linkHover = isLight ? 'hover:text-emerald-700' : 'hover:text-text-secondary'
  // Build full path for JSON-LD (Home + items)
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items]

  // For JSON-LD, every ListItem MUST have an 'item' URL.
  // Items without href inherit the last known href as fallback.
  let lastHref = '/'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      if (item.href) lastHref = item.href
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: `https://vfit.app.br${item.href || lastHref}`,
      }
    }),
  }

  return (
    <>
      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual breadcrumbs */}
      <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs ${navColor}`}>
        <Link href="/" className={`flex items-center gap-1 transition-colors ${homeHover}`}>
          <DSIcon name="home" size={14} />
          <span className="sr-only">Home</span>
        </Link>

        {items.map((item, i) => {
          const isLast = i === items.length - 1

          return (
            <span key={i} className="flex items-center gap-1.5">
              <DSIcon name="chevronRight" size={12} className={sepColor} />
              {isLast || !item.href ? (
                <span className={`font-medium ${currentColor}`}>{item.label}</span>
              ) : (
                <Link href={item.href} className={`transition-colors ${linkHover}`}>
                  {item.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}

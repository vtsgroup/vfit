// ============================================
// seo.ts — Helpers de metadados SEO para Next.js
// ============================================
//
// O que faz:
//   Gera objetos Metadata do Next.js com title, description, canonical,
//   Open Graph e Twitter Card. Fornece presets de robots para páginas
//   autenticadas (noindex) e públicas (index).
//
// Exports principais:
//   buildSeoMetadata(config) → Metadata — metadados completos
//   NO_INDEX_ROBOTS — robots para dashboard (áreas autenticadas)
//   INDEX_FOLLOW_ROBOTS — robots para landing e blog
// ============================================
import type { Metadata } from 'next'

const SITE_URL = 'https://vfit.app.br'
const SITE_NAME = 'VFIT'
const DEFAULT_OG_IMAGE = '/og/og-default.png'

export const NO_INDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

export const INDEX_FOLLOW_ROBOTS: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

type SeoConfig = {
  title: string
  description: string
  path: string
  ogImage?: string
  type?: 'website' | 'article'
  section?: string
  tags?: string[]
  publishedTime?: string
  modifiedTime?: string
}

export function buildSeoMetadata({
  title,
  description,
  path,
  ogImage,
  type = 'website',
  section,
  tags,
  publishedTime,
  modifiedTime,
}: SeoConfig): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`
  const ogImg = ogImage || DEFAULT_OG_IMAGE
  const absoluteOgImg = ogImg.startsWith('http') ? ogImg : `${SITE_URL}${ogImg}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: INDEX_FOLLOW_ROBOTS,
    openGraph: {
      type,
      locale: 'pt_BR',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: absoluteOgImg,
          width: 1200,
          height: 630,
          alt: `${title} | ${SITE_NAME}`,
          type: 'image/png',
        },
      ],
      ...(type === 'article'
        ? {
            section,
            tags,
            publishedTime,
            modifiedTime,
            authors: [SITE_NAME],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteOgImg],
    },
    category: section,
  }
}

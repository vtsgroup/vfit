// ============================================
// schemas.ts — Helpers de Schema JSON-LD para SEO, AEO e GEO
// ============================================
//
// O que faz:
//   Funções utilitárias para gerar schemas JSON-LD dinâmicos.
//   Complementa os componentes estáticos em components/seo/json-ld.tsx.
//   Usado para schemas que precisam de dados dinâmicos (artigos, FAQ, breadcrumbs).
//
// Exports principais:
//   articleSchema(post) → JSON-LD Article
//   faqSchema(faqs) → JSON-LD FAQPage
//   breadcrumbSchema(items) → JSON-LD BreadcrumbList
//   howToSchema(steps) → JSON-LD HowTo

const SITE_URL = 'https://iapersonal.app.br'
const BRAND = 'VFIT'
const LOGO_URL = `${SITE_URL}/AI-logo-round-ext.png?v=20260224-round`

/* ─── Article Schema ─── */
interface ArticleInput {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  image?: string
  authorName?: string
  authorUrl?: string
  keywords?: string[]
}

export function articleSchema(post: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image || `${SITE_URL}/og/og-default.png`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: post.authorName
      ? {
          '@type': 'Person',
          name: post.authorName,
          url: post.authorUrl,
        }
      : {
          '@type': 'Organization',
          name: BRAND,
        },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${post.slug}`,
    },
    keywords: post.keywords,
    inLanguage: 'pt-BR',
  }
}

/* ─── FAQ Schema ─── */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/* ─── Breadcrumb Schema ─── */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/* ─── HowTo Schema ─── */
interface HowToStep {
  name: string
  text: string
  image?: string
}

export function howToSchema(title: string, steps: HowToStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  }
}

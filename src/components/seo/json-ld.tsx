// ============================================
// json-ld.tsx — Schemas JSON-LD para SEO, AEO e GEO
// ============================================
//
// O que faz:
//   Injeta scripts JSON-LD de dados estruturados para SEO 2026.
//   Schemas: SoftwareApplication, Organization, WebSite, FAQPage, Blog.
//   Cada schema é um componente independente para composição flexível.
//
// Exports principais:
//   SoftwareApplicationSchema — schema do app para Google
//   OrganizationSchema — schema da organização
//   WebSiteSchema — schema do site com sitelinks search
//   FaqPageSchema — schema de FAQ para rich results
//   BlogSchema — schema de blog para Google News
import { PLANS } from '@config/constants'

type JsonLdProps = {
  data: Record<string, unknown>
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VFIT',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Personal Training',
    operatingSystem: 'Android, iOS, Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Grátis',
        price: String(PLANS.trial.price_brl),
        priceCurrency: 'BRL',
        description: 'Grátis para até 5 alunos, inclui gamificação básica e Pix',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: String(PLANS.pro.price_brl),
        priceCurrency: 'BRL',
        description: 'Alunos ilimitados + Pix automático',
      },
      {
        '@type': 'Offer',
        name: 'Pro+',
        price: String(PLANS.profissional.price_brl),
        priceCurrency: 'BRL',
        description: 'NF eletrônica + contratos digitais',
      },
      {
        '@type': 'Offer',
        name: 'Max',
        price: String(PLANS.max.price_brl),
        priceCurrency: 'BRL',
        description: 'White-label + e-mail profissional + marketplace',
      },
    ],
    description:
      'App completo para personal trainers com IA. Pix automático, gamificação de alunos (XP, conquistas, ranking), contratos digitais, nota fiscal eletrônica e white-label.',
    url: 'https://vfit.app.br',
    image: 'https://vfit.app.br/og/og-default.png',
    downloadUrl: 'https://vfit.app.br',
    author: {
      '@type': 'Organization',
      name: 'VFIT',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
    },
    featureList: [
      'Geração de treinos por IA',
      'Gestão de alunos',
      'Cobranças automáticas (PIX, boleto, cartão)',
      'Avaliações físicas com fotos',
      'Gamificação com XP, conquistas e ranking',
      'Contratos digitais',
      'Push notifications',
      'Programa de afiliados',
      'Dashboard completo',
      'PWA - funciona offline',
    ],
  }

  return <JsonLd data={schema} />
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VFIT',
    url: 'https://vfit.app.br',
    logo: 'https://vfit.app.br/AI-logo-round-ext.png?v=20260224-round',
    description: 'App completo para personal trainers com IA. Pix automático, gamificação, contratos digitais e NF eletrônica.',
    sameAs: [
      'https://instagram.com/vfitapp',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Portuguese'],
      url: 'https://vfit.app.br/contato',
    },
  }

  return <JsonLd data={schema} />
}

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VFIT',
    url: 'https://vfit.app.br',
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vfit.app.br/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLd data={schema} />
}

export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O que é o VFIT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'VFIT é o app mais completo para personal trainers no Brasil. Oferece gestão de alunos, treinos com IA, avaliações físicas, cobranças automáticas via PIX/boleto/cartão, gamificação com XP e conquistas, contratos digitais e NF eletrônica.',
        },
      },
      {
        '@type': 'Question',
        name: 'O VFIT é gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. O plano Grátis permite até 5 alunos. Os planos pagos são Pro (R$29,90/mês), Pro+ (R$69,90/mês) e Max (R$129,90/mês).',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona a geração de treinos por IA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nosso sistema de IA analisa o perfil do aluno (nível, objetivos, restrições) e gera um treino completo e personalizado com exercícios, séries, repetições e descanso. Você pode ajustar tudo antes de enviar.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quais formas de pagamento são aceitas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você pode cobrar seus alunos via PIX, boleto bancário ou cartão de crédito. Os pagamentos são processados automaticamente e você acompanha tudo pelo dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'Funciona no celular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! VFIT é uma PWA (Progressive Web App) que funciona como um app nativo no celular. Pode ser instalado na tela inicial e funciona até offline.',
        },
      },
      {
        '@type': 'Question',
        name: 'Precisa de CREF para usar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, personal trainers precisam informar seu número de CREF no cadastro. Isso garante que apenas profissionais habilitados utilizem a plataforma.',
        },
      },
    ],
  }

  return <JsonLd data={schema} />
}

type BlogCollectionItem = {
  name: string
  url: string
  datePublished?: string
}

export function BlogCollectionSchema({ items }: { items: BlogCollectionItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog VFIT',
    url: 'https://vfit.app.br/blog',
    inLanguage: 'pt-BR',
    blogPost: items.map((item) => ({
      '@type': 'BlogPosting',
      headline: item.name,
      url: item.url,
      datePublished: item.datePublished,
      author: {
        '@type': 'Organization',
        name: 'VFIT',
      },
    })),
  }

  return <JsonLd data={schema} />
}

type BlogPostingSchemaProps = {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  keywords?: string[]
}

export function BlogPostingSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  keywords,
}: BlogPostingSchemaProps) {
  const url = `https://vfit.app.br${slug}`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: url,
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: 'pt-BR',
    keywords,
    image: [`https://vfit.app.br/og/og-blog-${slug.split('/').pop()?.replace('-personal', '') || 'default'}.png`],
    publisher: {
      '@type': 'Organization',
      name: 'VFIT',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vfit.app.br/AI-logo-round-ext.png?v=20260224-round',
      },
    },
    author: {
      '@type': 'Organization',
      name: 'VFIT',
    },
  }

  return <JsonLd data={schema} />
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://vfit.app.br/#localbusiness',
    name: 'VFIT',
    image: 'https://vfit.app.br/AI-logo-round-ext.png?v=20260224-round',
    url: 'https://vfit.app.br',
    telephone: '+55-21-96564-1822',
    priceRange: 'R$0 - R$199',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Al. Rio Negro, 503 - SALA 2020',
      addressLocality: 'Barueri',
      addressRegion: 'SP',
      postalCode: '06454-000',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -23.5015,
      longitude: -46.8484,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    sameAs: [
      'https://www.instagram.com/vfitapp',
    ],
    description: 'Plataforma SaaS para personal trainers. Crie treinos com IA, gerencie alunos, automatize cobranças via PIX/boleto/cartão e avaliações físicas.',
    founder: [
      { '@type': 'Person', name: 'Victor Duarte' },
    ],
  }

  return <JsonLd data={schema} />
}

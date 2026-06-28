// ============================================
// blog-posts.ts — Dados estáticos dos posts do blog (SSG)
// ============================================
//
// O que faz:
//   Define os dados de todos os posts do blog como constante estática.
//   Funções utilitárias para busca e filtragem de posts.
//   Usado em RSC para geração estática de páginas de blog.
//
// Exports principais:
//   BlogPost, BlogCategory, BlogAuthor — tipos de dados
//   BLOG_POSTS — array com todos os posts
//   CATEGORY_COLORS — mapeamento de categoria para cor de badge
//   getPost(slug) → BlogPost | undefined — busca por slug
//   getRelatedPosts(post, limit) → BlogPost[] — posts relacionados
//   getCategories() → BlogCategory[] — categorias únicas
import type { DSIconName } from '@/components/ui/ds-icon'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  image: string
  ogImage: string
  category: BlogCategory
  author: BlogAuthor
  date: string
  dateISO: string
  modifiedISO: string
  readingTime: string
  tags: string[]
  /** Código curto p/ link de compartilhamento — /r/{shortId} → 301 → /blog/{slug} (ver public/_worker.js). NÃO indexado. */
  shortId: string
  /** Crédito da imagem hero (fonte/fotógrafo). Se ausente, exibe "Divulgação". */
  imageCredit?: string
}

export type BlogCategory = 'Tecnologia' | 'Gestão' | 'Financeiro' | 'Fitness' | 'Engajamento' | 'Negócios'

export interface BlogAuthor {
  name: string
  avatar: string
  role: string
}

export const BLOG_AUTHOR: BlogAuthor = {
  name: 'Equipe Vfit',
  avatar: '/favicons/icon-192x192.png?v=4.3.4',
  role: 'Time de Conteúdo',
}

export const CATEGORY_COLORS: Record<BlogCategory, string> = {
  Tecnologia: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Gestão: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Fitness: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  Financeiro: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Engajamento: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Negócios: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

export const CATEGORY_ACCENT: Record<BlogCategory, string> = {
  Tecnologia: 'brand-primary',
  Gestão: 'emerald-500',
  Fitness: 'brand-primary',
  Financeiro: 'amber-500',
  Engajamento: 'pink-500',
  Negócios: 'cyan-500',
}

/** Ícone por categoria — distingue as tags dentro da gramática verde da home */
export const CATEGORY_ICON: Record<BlogCategory, DSIconName> = {
  Tecnologia: 'brainCircuit',
  Gestão: 'layoutDashboard',
  Fitness: 'dumbbell',
  Financeiro: 'dollarSign',
  Engajamento: 'heartHandshake',
  Negócios: 'trendingUp',
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'app-treino-ia-gratis-iniciantes',
    title: 'App de treino com IA grátis: guia completo para iniciantes em 2026',
    excerpt:
      'Entenda como escolher um app de treino com IA, quais recursos realmente importam para iniciantes e como começar grátis com segurança e consistência.',
    image: '/blog/hero-treino-iniciante.webp',
    ogImage: '/og/og-blog.png',
    category: 'Fitness',
    author: BLOG_AUTHOR,
    date: '12 Abr 2026',
    dateISO: '2026-04-12T09:00:00-03:00',
    modifiedISO: '2026-04-12T09:00:00-03:00',
    readingTime: '9 min',
    tags: ['App de treino com IA', 'Treino para iniciantes', 'Treino personalizado', 'Aplicativo fitness'],
    shortId: 'ia-gratis',
  },
  {
    slug: 'ia-montar-treinos-personalizados-personal',
    title: 'Como usar IA para montar treinos personalizados em menos de 2 minutos',
    excerpt:
      'Tutorial prático para personal trainers usarem IA na geração de treinos, revisão técnica e publicação com velocidade sem perder qualidade.',
    image: '/blog/hero-ia-personal-trainer.webp',
    ogImage: '/og/og-blog-ia.png',
    category: 'Tecnologia',
    author: BLOG_AUTHOR,
    date: '12 Abr 2026',
    dateISO: '2026-04-12T10:00:00-03:00',
    modifiedISO: '2026-04-12T10:00:00-03:00',
    readingTime: '8 min',
    tags: ['IA para montar treinos', 'Software para personal trainer', 'Treino personalizado', 'Automação fitness'],
    shortId: 'ia-treinos',
  },
  {
    slug: 'melhores-apps-personal-trainer-2026',
    title: 'Melhores apps para personal trainer em 2026: comparativo completo',
    excerpt:
      'Compare apps para personal trainer por gestão, IA, cobrança, experiência do aluno e potencial de escala antes de escolher sua plataforma.',
    image: '/blog/hero-blog-index.webp',
    ogImage: '/og/og-blog.png',
    category: 'Negócios',
    author: BLOG_AUTHOR,
    date: '12 Abr 2026',
    dateISO: '2026-04-12T11:00:00-03:00',
    modifiedISO: '2026-04-12T11:00:00-03:00',
    readingTime: '10 min',
    tags: ['Melhor app para personal trainer', 'Comparativo software fitness', 'Gestão personal trainer', 'Plataforma fitness'],
    shortId: 'apps-pt',
  },
  {
    slug: 'nutricionista-personal-trainer-trabalho-conjunto',
    title: 'Nutricionista e personal trainer: como trabalhar juntos e multiplicar resultados',
    excerpt:
      'Veja como alinhar treino e nutrição, melhorar adesão do paciente e criar uma operação colaborativa entre nutricionista e personal trainer.',
    image: '/blog/hero-nutricao-personal.webp',
    ogImage: '/og/og-blog.png',
    category: 'Engajamento',
    author: BLOG_AUTHOR,
    date: '12 Abr 2026',
    dateISO: '2026-04-12T12:00:00-03:00',
    modifiedISO: '2026-04-12T12:00:00-03:00',
    readingTime: '8 min',
    tags: ['Nutricionista e personal trainer', 'Integração treino e nutrição', 'Parceria fitness', 'Pacientes'],
    shortId: 'nutri-pt',
  },
  {
    slug: 'ia-personal-trainer',
    title: 'IA para personal trainer: como aplicar no dia a dia com qualidade',
    excerpt:
      'Guia prático para usar inteligência artificial na prescrição de treinos, acompanhamento e retenção de alunos — sem perder personalização técnica.',
    image: '/blog/hero-ia-personal-trainer.webp',
    ogImage: '/og/og-blog-ia.png',
    category: 'Tecnologia',
    author: BLOG_AUTHOR,
    date: '15 Fev 2026',
    dateISO: '2026-02-15T09:00:00-03:00',
    modifiedISO: '2026-03-03T09:00:00-03:00',
    readingTime: '8 min',
    tags: ['IA', 'Personal Trainer', 'Treino Personalizado', 'Gestão de Alunos', 'Inteligência Artificial'],
    shortId: 'ia-pt',
  },
  {
    slug: 'retencao-alunos-personal',
    title: 'Retenção de alunos no personal: 5 alavancas para reduzir churn',
    excerpt:
      'Estratégias comprovadas para aumentar frequência, engajamento e tempo de permanência dos seus alunos no personal training.',
    image: '/blog/hero-retencao-alunos.webp',
    ogImage: '/og/og-blog-retencao.png',
    category: 'Gestão',
    author: BLOG_AUTHOR,
    date: '12 Fev 2026',
    dateISO: '2026-02-12T09:00:00-03:00',
    modifiedISO: '2026-03-03T09:00:00-03:00',
    readingTime: '10 min',
    tags: ['Retenção de alunos', 'Churn', 'LTV', 'Gestão para personal trainer'],
    shortId: 'retencao',
  },
  {
    slug: 'cobranca-automatica-personal',
    title: 'Cobrança automática para personal trainer: menos inadimplência',
    excerpt:
      'Como configurar cobrança automática com régua de lembretes para previsibilidade de caixa, reduzir atrasos e nunca mais perseguir pagamentos.',
    image: '/blog/hero-cobranca-automatica.webp',
    ogImage: '/og/og-blog-cobranca.png',
    category: 'Financeiro',
    author: BLOG_AUTHOR,
    date: '8 Fev 2026',
    dateISO: '2026-02-08T09:00:00-03:00',
    modifiedISO: '2026-03-03T09:00:00-03:00',
    readingTime: '7 min',
    tags: ['Cobrança Automática', 'PIX', 'Financeiro para personal trainer', 'Inadimplência'],
    shortId: 'cobranca',
  },
]

/** Get a post by slug */
export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

/** Get related posts (excluding current) */
export function getRelatedPosts(currentSlug: string, limit = 2): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, limit)
}

/** Get unique categories */
export function getCategories(): BlogCategory[] {
  return [...new Set(BLOG_POSTS.map((p) => p.category))]
}

/**
 * Caminho do link curto de compartilhamento de um post: `/r/{shortId}`.
 * O `_worker.js` faz 301 → `/blog/{slug}` (canônica). Como é só redirect e
 * está em `Disallow: /r/`, não compete no índice nem afeta o SEO.
 * Fallback: se o slug não existir, devolve a própria rota canônica.
 */
export function getShortPath(slug: string): string {
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  return post ? `/r/${post.shortId}` : `/blog/${slug}`
}

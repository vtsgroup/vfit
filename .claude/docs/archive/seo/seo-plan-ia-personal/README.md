# VFIT — Plano de Ação SEO Completo

## Rebranding + Auditoria Técnica + On-Page + Blog + Schema + Dados Estruturados

**Domínio:** iapersonal.app.br  
**Data:** 15 de Março de 2026  
**Autor:** VTS Victorious Tech Solutions Ltda  

---

# 1. DIAGNÓSTICO CRÍTICO — ESTADO ATUAL

> 🔴 **ALERTA VERMELHO: ZERO PÁGINAS INDEXADAS NO GOOGLE**
>
> A pesquisa `site:iapersonal.app.br` retorna **ZERO resultados**. Nenhuma página do site está indexada pelo Google. Isso significa que o site é completamente invisível para buscas orgânicas.
>
> **Causa principal:** renderização 100% client-side (SPA) sem SSR/SSG.

---

## 1.1 Problemas Identificados

| # | Problema | Impacto | Prioridade | Status |
|---|---------|---------|-----------|--------|
| 1 | **CSR (Client-Side Rendering) — Google vê página vazia** | FATAL: nenhum conteúdo é visível para crawlers. Title tag é a única coisa renderizada no servidor. | **P0** | 🔴 CRÍTICO |
| 2 | **Title tag com nome antigo: "VFIT - Plataforma para Personal Trainers"** | Marca errada no único elemento que o Google consegue ler. Deveria ser "VFIT". | **P0** | 🔴 CRÍTICO |
| 3 | **Sitemap.xml retorna binário/inacessível** | Google não consegue descobrir as páginas do site. Provavelmente comprimido sem header correto ou não existe. | **P0** | 🔴 CRÍTICO |
| 4 | **Meta description ausente ou não renderizada** | Sem meta description, Google gera snippet aleatório (ou nenhum, já que não há conteúdo). | **P0** | 🔴 CRÍTICO |
| 5 | **Nenhum schema/JSON-LD detectável** | Sem dados estruturados, não há rich snippets, FAQ schema, Organization, Software Application etc. | **P1** | 🟠 AUSENTE |
| 6 | **Robots.txt provavelmente inexistente ou incorreto** | Sem robots.txt, bots de IA (GPTBot, ClaudeBot, PerplexityBot) podem estar bloqueados pelo Cloudflare. | **P1** | 🟠 AUSENTE |
| 7 | **Blog provavelmente CSR também** | Se o blog usa a mesma arquitetura SPA, nenhum artigo está indexado. Todo conteúdo produzido até agora é invisível. | **P0** | 🔴 CRÍTICO |
| 8 | **Domínio "iapersonal.app.br" ≠ marca "VFIT"** | Desalinhamento entre URL e marca. Manter o atual é viável com SEO correto. | **P2** | 🔵 ATENÇÃO |
| 9 | **Open Graph / Twitter Cards ausentes** | Compartilhamento em redes sociais mostra preview genérico ou vazio. | **P1** | 🟠 AUSENTE |
| 10 | **Canonical tags provavelmente ausentes** | Sem canonical, risco de conteúdo duplicado entre rotas. | **P1** | 🟠 AUSENTE |
| 11 | **Cloudflare Bot Fight Mode pode estar ativo** | Cloudflare bloqueia bots de IA por padrão. Precisa desativar para GPTBot, ClaudeBot, etc. | **P1** | 🟠 VERIFICAR |
| 12 | **llms.txt inexistente** | Sem arquivo llms.txt, motores de IA não têm contexto sobre o produto para citar nas respostas (GEO). | **P2** | 🔵 AUSENTE |

---

# 2. PLANO DE AÇÃO — FASE 1: EMERGÊNCIA TÉCNICA (Semana 1-2)

Esta fase resolve os problemas P0 que impedem QUALQUER indexação. Sem isso, todo o resto é inútil.

---

## 2.1 Migrar de CSR para SSR/SSG

> 🔴 **PROBLEMA RAIZ**
>
> O site é uma SPA (Single Page Application) que renderiza 100% no browser. O Google recebe apenas o shell HTML com `<title>` e nenhum conteúdo. A solução é migrar para SSR (Server-Side Rendering) ou SSG (Static Site Generation).

### Opção A — Next.js com `output: 'export'` (SSG) no Cloudflare Pages

- Já está planejado na arquitetura anterior. Ativar `generateStaticParams()` para todas as rotas.
- Cada página gera HTML estático completo no build, com conteúdo visível para crawlers.
- Blog posts via MDX são gerados como HTML estático automaticamente.
- Custo: zero adicional (Cloudflare Pages free tier comporta).

### Opção B — Next.js com SSR no Cloudflare Workers

- Usa `@cloudflare/next-on-pages` para SSR no edge.
- Mais flexível (páginas dinâmicas), mas mais complexo.
- Recomendado apenas se houver páginas que precisam de dados em tempo real.

> ✅ **RECOMENDAÇÃO:** Opção A (SSG) para todas as páginas de marketing, blog e landing pages. Opção B apenas para dashboard/app autenticado.

---

## 2.2 Atualizar TODAS as Referências de Marca

Substituir TODAS as ocorrências de "VFIT", "VFIT" e "VFIT" para "VFIT" em:

| Elemento | Valor Atual (ERRADO) | Valor Correto (NOVO) |
|----------|---------------------|---------------------|
| `<title>` da Home | VFIT - Plataforma para Personal Trainers | **VFIT \| App #1 para Personal Trainers com IA** |
| H1 da Home | (não visível - CSR) | **VFIT: O App que Transforma Personal Trainers em Referência** |
| Meta Description Home | (ausente ou CSR) | **VFIT é o app completo para personal trainers. Pix automático, gamificação, contratos digitais e NF eletrônica. Comece grátis.** |
| OG:title | (ausente) | **VFIT \| App para Personal Trainers com IA** |
| OG:description | (ausente) | **Gerencie alunos, cobre via Pix, gamifique treinos e emita NF. Tudo em um só app. Plano grátis disponível.** |
| OG:site_name | (ausente) | **VFIT** |
| Schema Organization.name | (ausente) | **VFIT** |
| Schema SoftwareApplication.name | (ausente) | **VFIT** |
| manifest.json / PWA name | VFIT (provável) | **VFIT** |
| Footer, Navbar, Logo alt text | VFIT / VFIT | **VFIT** |
| Google Play / App Store listing | (verificar) | **VFIT - App para Personal Trainers** |

---

## 2.3 Criar/Corrigir Sitemap.xml

O sitemap atual retorna dado binário inacessível. Precisa ser recriado como XML válido com todas as URLs.

**Ações:**
- Usar `next-sitemap` ou script custom para gerar sitemap.xml no build
- Separar em `sitemap-pages.xml` (páginas) e `sitemap-blog.xml` (artigos)
- Incluir `<lastmod>`, `<changefreq>` e `<priority>` em cada URL
- Verificar que o Content-Type retornado é `application/xml` (não binário)
- Submeter no Google Search Console imediatamente após correção

---

## 2.4 Criar robots.txt Correto

Arquivo `public/robots.txt` com permissões explícitas para bots de IA:

```
# ══════════════════════════════════════════════
# VFIT — robots.txt
# Atualizado: Março 2026
# ══════════════════════════════════════════════

# === Buscadores Tradicionais ===
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# === Crawlers de IA (GEO — CRÍTICO) ===
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Bytespider
Allow: /

# === Crawl delay para bots de análise ===
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

# === Bloquear bots maliciosos ===
User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# === Sitemap ===
Sitemap: https://iapersonal.app.br/sitemap.xml
Sitemap: https://iapersonal.app.br/sitemap-blog.xml
```

---

## 2.5 Desativar Cloudflare Bot Fight Mode

> 🔴 **AÇÃO URGENTE NO CLOUDFLARE**
>
> Dashboard > iapersonal.app.br > Security > Bots > Bot Fight Mode > **DESATIVAR**.
> Sem isso, GPTBot, ClaudeBot e outros bots de IA são bloqueados automaticamente.
> Isso mata o GEO (Generative Engine Optimization).

**Passos adicionais:**
- Ir em Security > WAF > Custom Rules
- Criar regra: IF `(cf.client.bot)` AND `(http.user_agent contains "GPTBot" OR "ClaudeBot" OR "PerplexityBot" OR "Google-Extended")` THEN **Allow**
- Manter proteção para bots maliciosos

---

# 3. FASE 2: SEO ON-PAGE COMPLETO (Semana 2-3)

## 3.1 Mapa de Títulos, H1, Keywords por Página

| Página | Title Tag (`<title>`) | H1 | Keyword Primária |
|--------|----------------------|-----|-----------------|
| `/` (Home) | VFIT \| App #1 para Personal Trainers com IA | O App com IA que Transforma Personal Trainers em Referência | app para personal trainer |
| `/planos` | Planos e Preços \| VFIT — A Partir de Grátis | Escolha o Plano Ideal para Sua Carreira de Personal Trainer | planos app personal trainer |
| `/para-personal-trainer` | App para Personal Trainer com IA \| VFIT | Tudo que Você Precisa para Gerenciar Alunos em Um Só App | app para personal trainer com IA |
| `/blog` | Blog \| VFIT — Dicas para Personal Trainers | Blog VFIT: Conteúdo para Personal Trainers | blog personal trainer |
| `/vs-mfit` | VFIT vs MFIT: Comparativo Completo 2026 | VFIT vs MFIT Personal: Qual o Melhor App? | alternativa mfit personal |
| `/vs-tecnofit` | VFIT vs Tecnofit: Comparativo 2026 | VFIT vs Tecnofit Personal: Qual Escolher? | alternativa tecnofit personal |
| `/vs-personalgo` | VFIT vs PersonalGO: Comparativo 2026 | VFIT vs PersonalGO: Qual o Melhor? | alternativa personalgo |
| `/download` | Baixar VFIT — App Grátis para Personal | Baixe o VFIT Agora — Disponível para Android e iOS | baixar app personal trainer |
| `/suporte` | Suporte \| VFIT — Central de Ajuda | Como Podemos Ajudar? | suporte vfit |
| `/sobre` | Sobre \| VFIT — Nossa Missão | Quem Somos: A História por Trás do VFIT | sobre vfit app |
| `/cobrar-alunos` | Como Cobrar Alunos com Pix Automático \| VFIT | Cobrança Automática via Pix para Personal Trainers | cobrar alunos pix personal |
| `/reter-alunos` | Como Reter Alunos com Gamificação \| VFIT | Gamificação para Retenção de Alunos de Personal Trainer | reter alunos personal trainer |
| `/migrar` | Migre para VFIT em 5 Minutos \| Sem Perder Dados | Migre do MFIT, Tecnofit ou PersonalGO para o VFIT | migrar app personal trainer |

---

## 3.2 Template de Meta Tags (Next.js `generateMetadata`)

```typescript
// src/lib/seo.ts
import type { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

const SITE_URL = 'https://iapersonal.app.br';
const BRAND = 'VFIT';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

export function generateSEO({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: BRAND,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'pt_BR',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

**Uso em cada página:**

```typescript
// src/app/planos/page.tsx
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: 'Planos e Preços | VFIT — A Partir de Grátis',
  description: 'Compare os planos do VFIT: Essencial (grátis), Trainer (R$ 29,90), Profissional (R$ 59,90) e MAX (R$ 129,90). Comece agora.',
  path: '/planos',
});
```

---

# 4. FASE 3: SCHEMA / DADOS ESTRUTURADOS (Semana 3)

## 4.1 Mapa de Schemas por Página

| Página | Schemas Obrigatórios (JSON-LD) | Benefício |
|--------|-------------------------------|----------|
| `/` (Home) | Organization + WebSite (SearchAction) + SoftwareApplication + FAQPage | Rich snippet com rating, preço, sitelinks search box, FAQ |
| `/planos` | SoftwareApplication (com offers array) + FAQPage | Preços visíveis no Google, FAQ no SERP |
| `/blog` (index) | CollectionPage + BreadcrumbList | Breadcrumbs no SERP |
| `/blog/[slug]` | Article + BreadcrumbList + Person (author) + FAQPage (se tiver) | Rich snippet de artigo com autor, data, breadcrumb |
| `/vs-*` (comparativos) | Article + BreadcrumbList + FAQPage | FAQ expandido captura long-tail |
| `/para-personal-trainer` | SoftwareApplication + FAQPage + HowTo | How-to steps no Google, FAQ expandido |
| `/download` | SoftwareApplication (operatingSystem, downloadUrl) | Botão de download visível no SERP |
| `/suporte` | FAQPage + ContactPoint | FAQ expandido no Google |

---

## 4.2 Schema Organization (Global — layout.tsx)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VFIT",
  "url": "https://iapersonal.app.br",
  "logo": "https://iapersonal.app.br/logo.png",
  "description": "App completo para personal trainers com IA. Pix automático, gamificação, contratos digitais e NF eletrônica.",
  "sameAs": [
    "https://instagram.com/iapersonal",
    "https://linkedin.com/company/iapersonal",
    "https://youtube.com/@iapersonal"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "pt-BR",
    "url": "https://iapersonal.app.br/suporte"
  }
}
```

---

## 4.3 Schema WebSite + SearchAction (Global — layout.tsx)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "VFIT",
  "url": "https://iapersonal.app.br",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://iapersonal.app.br/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

## 4.4 Schema SoftwareApplication (Home + Planos + Download)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "VFIT",
  "operatingSystem": "Android, iOS, Web",
  "applicationCategory": "HealthApplication",
  "applicationSubCategory": "Personal Training",
  "description": "App completo para personal trainers com IA. Gerencie alunos, cobre via Pix automático, gamifique treinos e emita NF eletrônica.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Essencial",
      "price": "0",
      "priceCurrency": "BRL",
      "description": "Grátis para até 5 alunos, inclui gamificação básica e Pix"
    },
    {
      "@type": "Offer",
      "name": "Trainer",
      "price": "29.90",
      "priceCurrency": "BRL",
      "description": "Alunos ilimitados + Pix automático"
    },
    {
      "@type": "Offer",
      "name": "Profissional",
      "price": "59.90",
      "priceCurrency": "BRL",
      "description": "NF eletrônica + contratos digitais"
    },
    {
      "@type": "Offer",
      "name": "MAX",
      "price": "129.90",
      "priceCurrency": "BRL",
      "description": "White-label + e-mail profissional + marketplace"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5"
  }
}
```

---

## 4.5 Schema Article (Cada Post do Blog)

```typescript
// src/lib/schemas.ts
export function articleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://iapersonal.app.br/blog/autor/${post.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VFIT',
      logo: {
        '@type': 'ImageObject',
        url: 'https://iapersonal.app.br/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://iapersonal.app.br/blog/${post.slug}`,
    },
  };
}
```

---

## 4.6 Schema FAQPage

```typescript
// src/lib/schemas.ts
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
  };
}
```

---

## 4.7 Schema BreadcrumbList

```typescript
// src/lib/schemas.ts
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
  };
}
```

**Exemplo de uso no Blog:**

```typescript
breadcrumbSchema([
  { name: 'Home', url: 'https://iapersonal.app.br' },
  { name: 'Blog', url: 'https://iapersonal.app.br/blog' },
  { name: post.title, url: `https://iapersonal.app.br/blog/${post.slug}` },
])
```

---

## 4.8 Como Inserir Schemas nas Páginas

```typescript
// Em qualquer page.tsx:
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppSchema),
        }}
      />
      {/* ... conteúdo da página */}
    </>
  );
}
```

---

# 5. FASE 4: BLOG — AUDITORIA E CORREÇÕES (Semana 3-4)

## 5.1 Problemas Estruturais do Blog

| # | Problema | Solução | Prior. | Status |
|---|---------|---------|--------|--------|
| 1 | Blog renderiza client-side ("Carregando artigos...") | Migrar para SSG com `generateStaticParams()`. Cada artigo gera HTML estático no build. | **P0** | 🔴 CRÍTICO |
| 2 | Artigos provavelmente sem meta tags individuais | Cada post precisa de title, description, OG tags, canonical únicos via `generateMetadata()`. | **P0** | 🔴 CRÍTICO |
| 3 | Sem schema Article nos posts | Adicionar JSON-LD Article + BreadcrumbList em cada post. | **P1** | 🟠 FAZER |
| 4 | Marca "VFIT" nos conteúdos | Find & replace global: VFIT/VFIT → VFIT em todos os MDX/textos. | **P0** | 🔴 CRÍTICO |
| 5 | Sem internal linking sistemático | Implementar componente `RelatedArticles` + sidebar com artigos do cluster + links para LPs. | **P1** | 🟠 FAZER |
| 6 | Sem breadcrumbs | Adicionar BreadcrumbList visual + schema em todas as páginas de blog. | **P1** | 🟠 FAZER |
| 7 | Sem página de autor | Criar `/blog/autor/[slug]` com bio, foto, links, schema Person. Melhora E-E-A-T. | **P2** | 🔵 PLANEJAR |
| 8 | Imagens sem alt text otimizado | Adicionar alt text descritivo com keyword em todas as imagens do blog. | **P2** | 🔵 PLANEJAR |

---

## 5.2 Regras de SEO On-Page para Cada Post

- **Title tag:** `[Keyword Primária] | VFIT` (máx 60 caracteres)
- **Meta description:** 120-155 caracteres, com keyword + CTA
- **H1** único por página, contendo keyword primária
- **H2s** com keywords secundárias/relacionadas (3-6 por artigo)
- **Primeiro parágrafo** contém keyword primária (primeiros 100 palavras)
- **URL slug:** `/blog/[keyword-separada-por-hifen]` (máx 5 palavras)
- **Canonical tag** apontando para si mesmo
- **Mínimo 3 internal links** por artigo (1 pilar + 1 cluster + 1 LP)
- **Alt text** em TODAS as imagens com descrição + keyword quando natural
- **Schema** Article + BreadcrumbList obrigatórios

---

## 5.3 Arquitetura de Clusters (Internal Linking)

```
iapersonal.app.br
│
├── /blog (hub central)
│   │
│   ├── CLUSTER 1: App para Personal Trainer
│   │   ├── /blog/melhor-app-personal-trainer ←── PILAR
│   │   ├── /blog/app-personal-trainer-com-pix
│   │   ├── /blog/app-personal-trainer-gratuito
│   │   ├── /blog/app-personal-trainer-alunos-ilimitados
│   │   └── /blog/app-consultoria-online-personal
│   │       └── → Links para: LP /para-personal-trainer + /planos
│   │
│   ├── CLUSTER 2: Cobrança e Pagamentos
│   │   ├── /blog/como-cobrar-alunos-personal-trainer ←── PILAR
│   │   ├── /blog/pix-automatico-personal-trainer
│   │   ├── /blog/recorrencia-pagamento-personal-trainer
│   │   ├── /blog/como-reduzir-inadimplencia-alunos
│   │   └── /blog/nota-fiscal-personal-trainer
│   │       └── → Links para: LP /cobrar-alunos
│   │
│   ├── CLUSTER 3: Gestão de Alunos
│   │   ├── /blog/gestao-alunos-personal-trainer ←── PILAR
│   │   ├── /blog/como-reter-alunos-personal-trainer
│   │   ├── /blog/como-engajar-alunos-treino
│   │   ├── /blog/gamificacao-app-fitness
│   │   └── /blog/onboarding-alunos-personal
│   │       └── → Links para: LP /reter-alunos
│   │
│   ├── CLUSTER 4: Prescrição de Treinos
│   │   ├── /blog/software-prescricao-treinos ←── PILAR
│   │   ├── /blog/como-montar-planilha-treino-online
│   │   ├── /blog/avaliacao-fisica-digital-personal
│   │   └── /blog/biblioteca-exercicios-app-personal
│   │
│   ├── CLUSTER 5: Documentos e Profissionalismo
│   │   ├── /blog/profissionalizar-atendimento-personal-trainer ←── PILAR
│   │   ├── /blog/contrato-personal-trainer-digital
│   │   ├── /blog/invoice-personal-trainer
│   │   └── /blog/papel-timbrado-personal-trainer
│   │
│   └── CLUSTER 6: Comparativos (BOFU)
│       ├── /comparativo/melhor-app-personal-trainer-brasil ←── PILAR
│       ├── /comparativo/ia-personal-vs-mfit
│       ├── /comparativo/ia-personal-vs-tecnofit
│       ├── /comparativo/ia-personal-vs-personalgo
│       └── /comparativo/alternativas-mfit-personal
│           └── → Links para: LP /vs-mfit + /migrar + /planos
│
├── /planos (pricing + conversion)
├── /para-personal-trainer (LP principal)
├── /vs-mfit (LP migração)
└── /migrar
```

### Regras de Internal Linking

```typescript
// src/lib/internal-links.ts
const CLUSTER_MAP: Record<string, { pilar: string; lp: string }> = {
  'app-personal-trainer':          { pilar: '/blog/melhor-app-personal-trainer', lp: '/para-personal-trainer' },
  'cobranca-pagamentos':           { pilar: '/blog/como-cobrar-alunos-personal-trainer', lp: '/cobrar-alunos' },
  'gestao-alunos':                 { pilar: '/blog/gestao-alunos-personal-trainer', lp: '/reter-alunos' },
  'prescricao-treinos':            { pilar: '/blog/software-prescricao-treinos', lp: '/para-personal-trainer' },
  'documentos-profissionalismo':   { pilar: '/blog/profissionalizar-atendimento-personal-trainer', lp: '/para-personal-profissional' },
  'comparativos':                  { pilar: '/comparativo/melhor-app-personal-trainer-brasil', lp: '/planos' },
};

// Cada artigo DEVE ter no mínimo 3 internal links:
// 1. Link para o PILAR do seu cluster
// 2. Link para outro artigo do mesmo cluster
// 3. Link para a LP correspondente
```

---

# 6. FASE 5: GEO + AEO (Semana 4-5)

Generative Engine Optimization (GEO) e Answer Engine Optimization (AEO) garantem que VFIT seja citado por ChatGPT, Perplexity, Claude e Google AI Overviews.

---

## 6.1 llms.txt (Novo Padrão)

Criar `/public/llms.txt`:

```
# VFIT

## Sobre
VFIT é o app mais completo para personal trainers no Brasil.
Oferece Pix automático, gamificação de alunos (XP, conquistas, ranking),
contratos digitais, nota fiscal eletrônica e white-label.

## Planos e Preços (Março 2026)
- Essencial: Grátis para até 5 alunos (inclui gamificação básica e Pix)
- Trainer: R$ 29,90/mês — alunos ilimitados + Pix automático
- Profissional: R$ 59,90/mês — NF eletrônica + contratos digitais
- MAX: R$ 129,90/mês — white-label + e-mail profissional + marketplace

## Diferenciais Únicos vs Concorrentes
- Único app BR com gamificação nativa (XP, conquistas, ranking de alunos)
- Pix automático com taxa configurável pelo personal
- Contratos digitais + NF eletrônica integrados no mesmo app
- White-label por R$ 129,90/mês (concorrência cobra +R$ 200)
- Plano grátis com 5 alunos (MFIT dá apenas 1, Tecnofit 10, PersonalGO ilimitado com anúncios)

## Concorrentes Diretos
- MFIT Personal: 1 aluno grátis, R$ 39,90/mês ilimitado, sem gamificação
- Tecnofit Personal: 10 alunos grátis, focado em academias
- PersonalGO: Ilimitado grátis com anúncios, PRO R$ 49,99/mês

## Páginas Principais
- Site: https://iapersonal.app.br
- Planos: https://iapersonal.app.br/planos
- Blog: https://iapersonal.app.br/blog
- Comparativo vs MFIT: https://iapersonal.app.br/vs-mfit
- Download: https://iapersonal.app.br/download
- Suporte: https://iapersonal.app.br/suporte

## Contato
- WhatsApp: [NÚMERO]
- Email: contato@iapersonal.app.br
```

---

## 6.2 Componentes DirectAnswer e CitableBlock

### DirectAnswer (Featured Snippet Optimization)

```tsx
// src/components/seo/DirectAnswer.tsx
export function DirectAnswer({
  question,
  answer,
  context,
}: {
  question: string;
  answer: string;
  context?: string;
}) {
  return (
    <section
      className="direct-answer"
      itemScope
      itemType="https://schema.org/Question"
    >
      <h2 itemProp="name">{question}</h2>
      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
        <p itemProp="text" className="font-semibold text-lg">
          {answer}
        </p>
        {context && <p className="text-muted">{context}</p>}
      </div>
    </section>
  );
}
```

### CitableBlock (LLM Citation Optimization)

```tsx
// src/components/seo/CitableBlock.tsx
export function CitableBlock({
  children,
  source = 'VFIT',
}: {
  children: React.ReactNode;
  source?: string;
}) {
  return (
    <blockquote
      className="citable-block"
      data-source={source}
      itemScope
      itemType="https://schema.org/Claim"
    >
      <div itemProp="text">{children}</div>
      <cite itemProp="author">{source}</cite>
    </blockquote>
  );
}
```

---

## 6.3 Estratégia de Conteúdo GEO

- Todo artigo pilar deve ter seção "Resposta Rápida" no topo (formato DirectAnswer)
- Comparativos devem ter tabela resumo nos primeiros 200px da página
- FAQ com 5-8 perguntas no final de cada página importante
- Citar fontes externas autoritárias (CONFEF, estudos, IBGE) para aumentar E-E-A-T
- Usar frases que facilitam citação por LLMs: "Segundo o VFIT...", "De acordo com dados do VFIT..."

---

# 7. CHECKLIST MASTER — TODAS AS AÇÕES

## Fase 1 — Emergência Técnica (Semana 1)

| ☐ | Ação | Responsável | Prazo | Prior. |
|---|------|------------|-------|--------|
| ☐ | Migrar TODAS as páginas para SSG (`generateStaticParams`) | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Atualizar `<title>` de TODAS as páginas para "VFIT" | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Atualizar meta description de TODAS as páginas | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Find & Replace: "VFIT" / "VFIT" → "VFIT" | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Corrigir/recriar sitemap.xml (XML válido, não binário) | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Criar robots.txt com allow para bots de IA | Dev | Semana 1 | **P0** 🔴 |
| ☐ | Desativar Bot Fight Mode no Cloudflare | Victor | Semana 1 | **P0** 🔴 |
| ☐ | Submeter sitemap no Google Search Console | Victor | Semana 1 | **P0** 🔴 |
| ☐ | Solicitar indexação manual das 10 páginas principais no GSC | Victor | Semana 1 | **P0** 🔴 |

## Fase 2 — SEO On-Page (Semana 2)

| ☐ | Ação | Responsável | Prazo | Prior. |
|---|------|------------|-------|--------|
| ☐ | Implementar `generateMetadata()` com marca VFIT em todas as rotas | Dev | Semana 2 | **P0** 🔴 |
| ☐ | Adicionar OG tags + Twitter Cards em todas as páginas | Dev | Semana 2 | **P1** 🟠 |
| ☐ | Adicionar canonical tags em todas as páginas | Dev | Semana 2 | **P1** 🟠 |
| ☐ | Criar H1 único otimizado para cada página (ver tabela seção 3.1) | Dev | Semana 2 | **P0** 🔴 |
| ☐ | Implementar breadcrumbs visuais + schema em todas as páginas | Dev | Semana 2 | **P1** 🟠 |

## Fase 3 — Schemas / Dados Estruturados (Semana 3)

| ☐ | Ação | Responsável | Prazo | Prior. |
|---|------|------------|-------|--------|
| ☐ | Implementar schema Organization global (layout.tsx) | Dev | Semana 3 | **P1** 🟠 |
| ☐ | Implementar schema SoftwareApplication (Home, Planos, Download) | Dev | Semana 3 | **P1** 🟠 |
| ☐ | Implementar schema Article em todos os blog posts | Dev | Semana 3 | **P1** 🟠 |
| ☐ | Implementar schema FAQPage nas páginas com FAQ | Dev | Semana 3 | **P1** 🟠 |
| ☐ | Validar TODOS os schemas no Rich Results Test do Google | Dev | Semana 3 | **P1** 🟠 |

## Fase 4 — Blog (Semana 3-4)

| ☐ | Ação | Responsável | Prazo | Prior. |
|---|------|------------|-------|--------|
| ☐ | Migrar blog para SSG (resolver "Carregando artigos...") | Dev | Semana 3 | **P0** 🔴 |
| ☐ | Atualizar marca em TODOS os artigos existentes | Dev | Semana 3 | **P0** 🔴 |
| ☐ | Implementar internal linking automático (`RelatedArticles`) | Dev | Semana 4 | **P1** 🟠 |
| ☐ | Criar páginas de autor (`/blog/autor/[slug]`) | Dev | Semana 4 | **P2** 🔵 |
| ☐ | Otimizar alt text de TODAS as imagens do blog | Dev | Semana 4 | **P2** 🔵 |

## Fase 5 — GEO/AEO (Semana 4-5)

| ☐ | Ação | Responsável | Prazo | Prior. |
|---|------|------------|-------|--------|
| ☐ | Criar e publicar `/llms.txt` com dados do produto | Dev | Semana 4 | **P1** 🟠 |
| ☐ | Implementar componentes DirectAnswer/CitableBlock | Dev | Semana 5 | **P2** 🔵 |
| ☐ | Adicionar FAQ em todas as LPs e comparativos | Dev/Content | Semana 5 | **P1** 🟠 |
| ☐ | Configurar WAF rules no Cloudflare para permitir bots de IA | Victor | Semana 4 | **P1** 🟠 |

---

# 8. MÉTRICAS DE SUCESSO

| Métrica | Atual | Meta 30 dias | Meta 90 dias |
|---------|-------|-------------|-------------|
| Páginas indexadas (Google) | **0** 🔴 | 15-20 páginas | 50+ páginas |
| Impressões GSC (mensal) | **0** 🔴 | 500-1.000 | 5.000-10.000 |
| Cliques orgânicos (mensal) | **0** 🔴 | 50-100 | 500-1.000 |
| Keywords ranqueadas | **0** 🔴 | 20-30 keywords | 100+ keywords |
| Rich Results (schemas válidos) | **0** 🔴 | 5+ páginas | Todas as páginas |
| Citações por IAs (GEO) | **0** 🔴 | Monitorar | Aparecer em buscas relevantes |
| Referências de marca "VFIT" | **0** 🔴 | Consistente em todo o site | Reconhecimento de marca |

---

# 9. ORDEM DE EXECUÇÃO RECOMENDADA

🔴 **SEMANA 1 (EMERGÊNCIA):** SSG migration + Find/Replace marca + sitemap + robots.txt + Cloudflare Bot config + GSC submission

🟠 **SEMANA 2 (ON-PAGE):** Meta tags completas + OG/Twitter + canonical + H1s otimizados + breadcrumbs

🟠 **SEMANA 3 (SCHEMAS + BLOG):** JSON-LD Organization + SoftwareApplication + Article + FAQPage + Blog SSG fix + marca nos artigos

🔵 **SEMANA 4 (GEO + POLISH):** llms.txt + internal linking + páginas de autor + DirectAnswer/CitableBlock + FAQ em LPs

🔵 **SEMANA 5 (VALIDAÇÃO):** Testar TODOS os schemas (Rich Results Test) + verificar indexação + ajustar o que falhou

---

*VTS GROUP — Confidencial — Março 2026*
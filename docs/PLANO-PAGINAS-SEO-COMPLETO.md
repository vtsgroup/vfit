# 🚀 PLANO ULTRA-DETALHADO — Páginas Completas, SEO, AEO, GEO

> **Versão do plano:** 1.0 · **Criado:** 05/03/2026
> **Escopo:** Unificar header/footer, hero em todas as páginas, breadcrumbs, blog completo,
> SEO/AEO/GEO perfeito, schema markup, remover noindex, produção-ready.
> **Estimativa total:** 14 Sprints (Lotes)

---

## 📊 Estado Atual (Auditoria)

| Aspecto | Status Atual | Problema |
|---------|-------------|----------|
| Header | 3 variantes (landing, institutional inline, legal inline) | Inconsistente, headers inline são simples demais |
| Footer | 3 variantes (landing mega, institutional inline, legal inline) | Footer inline não tem links completos |
| Hero nas páginas | ❌ Nenhuma página além da home tem hero | Páginas começam direto no conteúdo |
| Breadcrumbs | ❌ Zero breadcrumbs no projeto | Navegação ruim, SEO penalizado |
| Blog listing | ✅ Existe com 3 posts | Falta imagens geradas, categorias, busca |
| Blog individual | ✅ 3 artigos hardcoded | Sem breadcrumbs, sem autor visível, sem data, sem comentários |
| Páginas legais | ✅ Conteúdo completo (termos, privacidade, cookies, LGPD) | Sem hero, sem breadcrumbs, header/footer inline |
| Páginas institucionais | ✅ Conteúdo existe (sobre, contato, carreiras) | Sem hero, sem breadcrumbs, header/footer inline |
| SEO metadata | ✅ Lib centralizada (`generatePageMetadata`) | Funciona, só precisa garantir em tudo |
| JSON-LD | ✅ 6 schemas na LP | Falta FAQPage nas individuais, BreadcrumbList |
| Sitemaps | ✅ 2 arquivos | Atualizar com novas páginas |
| robots.txt | ✅ Bots IA permitidos | Adicionar Disallow para /dashboard, /auth |
| noindex | ✅ Correto em dashboard/auth | **Nenhuma** página pública tem noindex (bom!) |
| OG Images | ⚠️ Genérica na maioria | Criar OG images por página |
| AEO (Answer Engine) | ⚠️ Parcial | Precisa FAQ schema em todas as páginas |
| GEO (Generative Engine) | ⚠️ Tem llms.txt | Expandir com structured data |

---

## 🏗️ Arquitetura Proposta

### Layout Hierarchy (Next.js App Router)

```
src/app/layout.tsx                    ← Root (metadata global, providers, GA4)
├── src/app/page.tsx                  ← Landing Page (layout próprio inline)
├── src/app/(public)/layout.tsx       ← NOVO: Layout público com Navbar + Footer + Hero wrapper
│   ├── blog/
│   │   ├── page.tsx                  ← Blog listing
│   │   ├── [slug]/page.tsx           ← Blog post (dinâmico ou estático)
│   ├── sobre/page.tsx
│   ├── contato/page.tsx
│   ├── carreiras/page.tsx
│   ├── termos/page.tsx
│   ├── privacidade/page.tsx
│   ├── lgpd/page.tsx
│   ├── cookies/page.tsx
│   ├── excluir-conta/page.tsx
│   └── changelog/page.tsx            ← NOVO
├── src/app/(auth)/layout.tsx         ← Auth (noindex, sem header/footer)
├── src/app/(dashboard)/layout.tsx    ← Dashboard (noindex, sidebar)
```

### Componentes Compartilhados Novos

```
src/components/shared/
├── page-hero.tsx          ← Hero wrapper reutilizável (background gradiente + header inside)
├── breadcrumbs.tsx        ← Breadcrumb com JSON-LD BreadcrumbList
├── page-metadata.tsx      ← Author + date + reading time + views
├── faq-inline.tsx         ← FAQ compacto reutilizável (não o da landing, menor)
├── comments-section.tsx   ← Sistema de comentários próprio
├── share-buttons.tsx      ← Botões de compartilhar (WhatsApp, Twitter, LinkedIn, Copy)
├── table-of-contents.tsx  ← TOC automático por heading IDs
└── back-to-top.tsx        ← Botão voltar ao topo flutuante
```

---

## 📋 SPRINT 1 — Infraestrutura Base (Layout Público + Hero)

> **Estimativa:** ~2h · **Arquivos:** 6-8 novos/modificados

### Tarefas:

1. **Criar route group `(public)`** movendo todas as páginas públicas para dentro dele
   - Mover: `sobre`, `contato`, `carreiras`, `termos`, `privacidade`, `lgpd`, `cookies`, `excluir-conta`, `blog`
   - Remover route groups antigos: `(institutional)` e `(legal)`

2. **Criar `src/app/(public)/layout.tsx`**
   - Importar `Navbar` e `Footer` da landing page (`src/components/landing/`)
   - Wrapper com `children` entre Navbar e Footer
   - Navbar e Footer idênticos à home (mesmos componentes)

3. **Criar `src/components/shared/page-hero.tsx`**
   - Background: gradiente escuro similar à home (`#050A12` → `#0A1628`)
   - Mesh/noise texture sutil (CSS radial-gradient)
   - Props: `title` (string), `subtitle?` (string), `breadcrumbs` (array), `badge?` (string)
   - O Navbar fica DENTRO do hero (position relative, não fixed)
   - Altura: ~300px em desktop, ~250px mobile
   - Título H1 grande com gradiente brand
   - Animações: `IntersectionReveal`

4. **Criar `src/components/shared/breadcrumbs.tsx`**
   - Props: `items: { label: string, href?: string }[]`
   - Renderiza: Home > Seção > Página atual
   - Ícones Lucide: `Home` + `ChevronRight` separadores
   - JSON-LD `BreadcrumbList` schema embutido
   - Estilo: mono font, cores `white/50` → `white` (active)

5. **Atualizar `src/components/landing/navbar.tsx`**
   - Garantir que funciona tanto na LP (transparent bg) quanto nas páginas internas (dentro do hero)
   - Prop opcional: `variant?: 'landing' | 'page'` para ajustar comportamento

6. **Testar** que a home (`/`) continua funcionando com seu layout inline separado

### Resultado Sprint 1:
- ✅ Todas as páginas públicas têm Navbar + Footer da landing
- ✅ Hero escuro com H1 + breadcrumbs em todas
- ✅ Route groups limpos e organizados

---

## 📋 SPRINT 2 — Páginas Legais Redesign (Termos, Privacidade, Cookies, LGPD, Excluir Conta)

> **Estimativa:** ~2h · **Arquivos:** 5 modificados

### Tarefas:

1. **Redesign `termos/page.tsx`**
   - Hero via `PageHero` com title "Termos de Uso" + badge "VERSÃO 2.0"
   - Breadcrumbs: Home > Legal > Termos de Uso
   - Metadata: `generatePageMetadata()` com author "VFIT", lastModified
   - Ícones Lucide em cada seção (manter os existentes, refinar)
   - `PageMetadata` component: Última atualização, Versão, Tempo de leitura
   - FAQ inline no final: 3 perguntas relevantes sobre termos
   - JSON-LD: `FAQPage` schema

2. **Redesign `privacidade/page.tsx`**
   - Hero: "Política de Privacidade" + badge "LGPD COMPLIANT"
   - Breadcrumbs: Home > Legal > Privacidade
   - Mesma estrutura que Termos
   - FAQ inline: 3 perguntas sobre dados pessoais

3. **Redesign `cookies/page.tsx`**
   - Hero: "Política de Cookies" + badge "TRANSPARÊNCIA"
   - Breadcrumbs: Home > Legal > Cookies

4. **Redesign `lgpd/page.tsx`**
   - Hero: "LGPD — Seus Direitos" + badge "LEI 13.709/2018"
   - Breadcrumbs: Home > Legal > LGPD

5. **Redesign `excluir-conta/page.tsx`**
   - Hero: "Excluir Conta" + badge "DATA DELETION"
   - Breadcrumbs: Home > Legal > Excluir Conta

### Padrão para TODAS as legais:
```
PageHero (title, breadcrumbs, badge)
├── PageMetadata (lastModified, version, readingTime)
├── Table of Contents (links para seções)
├── Conteúdo (seções com Lucide icons)
├── FaqInline (3 perguntas relevantes + FAQPage JSON-LD)
└── CTA "Voltar à Home" ou "Registrar"
```

### Resultado Sprint 2:
- ✅ 5 páginas legais com hero, breadcrumbs, metadata, FAQ schema
- ✅ Design consistente com a LP

---

## 📋 SPRINT 3 — Páginas Institucionais Redesign (Sobre, Contato, Carreiras)

> **Estimativa:** ~2h · **Arquivos:** 3 modificados

### Tarefas:

1. **Redesign `sobre/page.tsx`**
   - Hero: "Sobre o VFIT" + badge "NOSSA HISTÓRIA"
   - Breadcrumbs: Home > Sobre
   - Seção fundadores reutilizando dados do `about-section.tsx` da landing
   - Stats animados (igual landing numbers)
   - Timeline da empresa
   - FAQ inline: 3 perguntas sobre a empresa
   - JSON-LD: `Organization` + `FAQPage`
   - CTA: "Experimente Grátis"

2. **Redesign `contato/page.tsx`**
   - Hero: "Fale Conosco" + badge "SUPORTE"
   - Breadcrumbs: Home > Contato
   - 4 cards de contato com Lucide icons (Email, WhatsApp, Localização, Horário)
   - Formulário funcional (ou mailto: como fallback)
   - Mapa embed ou ilustração
   - FAQ inline: 3 perguntas sobre suporte
   - JSON-LD: `ContactPage` + `FAQPage`

3. **Redesign `carreiras/page.tsx`**
   - Hero: "Trabalhe Conosco" + badge "VAGAS ABERTAS"
   - Breadcrumbs: Home > Carreiras
   - Cards de benefícios com Lucide icons
   - Cards de vagas com requirements + apply button
   - FAQ inline: 3 perguntas sobre processo seletivo
   - JSON-LD: `JobPosting` + `FAQPage`

### Resultado Sprint 3:
- ✅ 3 páginas institucionais com hero, breadcrumbs, FAQ schema
- ✅ JSON-LD rico em cada página

---

## 📋 SPRINT 4 — Blog Listing Page Redesign

> **Estimativa:** ~2h · **Arquivos:** 3-4 modificados/novos

### Tarefas:

1. **Redesign `blog/page.tsx`**
   - Hero: "Blog VFIT" + badge "CONTEÚDO PROFISSIONAL"
   - Breadcrumbs: Home > Blog
   - Grid de cards modernos (imagem, tag com ícone, data, título, excerpt, author avatar)
   - Filtro por categorias (tabs: Todos, Tecnologia, Gestão, Retenção, Financeiro)
   - Newsletter signup CTA (redesign do existente)
   - JSON-LD: `Blog` + `CollectionPage`
   - Metadata: title "Blog | VFIT", description rica

2. **Criar dados centralizados `src/data/blog-posts.ts`**
   - Array de posts com: slug, title, excerpt, image, ogImage, category, author, date, readingTime, tags
   - Reutilizável na listing e nos posts individuais
   - TypeScript interfaces `BlogPost`, `BlogCategory`

3. **Gerar imagens hero para cada post** (se não existirem)
   - Verificar `/blog/*.webp` existentes
   - Criar placeholders ou imagens faltantes

4. **Criar `src/components/blog/blog-card.tsx`** (versão full-page, diferente do landing)
   - Imagem grande com overlay gradient
   - Author avatar + name + date
   - Categoria com ícone Lucide
   - Reading time
   - Hover animations sofisticadas

### Resultado Sprint 4:
- ✅ Blog listing moderno com filtros e cards ricos
- ✅ Dados centralizados para reutilização
- ✅ JSON-LD Blog schema

---

## 📋 SPRINT 5 — Blog Posts Individuais Redesign

> **Estimativa:** ~3h · **Arquivos:** 5-7 modificados/novos

### Tarefas:

1. **Criar template de post `src/app/(public)/blog/[slug]/page.tsx`** (ou refatorar os 3 existentes)
   - Hero: título do post + badge da categoria
   - Breadcrumbs: Home > Blog > [Categoria] > Título
   - Author bar: avatar, nome, data de publicação, reading time, views (icon `Eye`)
   - Conteúdo do artigo com estilos prose/typography
   - Table of Contents lateral (sticky no desktop, colapsável no mobile)
   - Imagens com `next/image` + captions
   - CTA inline entre seções
   - Share buttons no final: WhatsApp, Twitter, LinkedIn, Copiar Link
   - Post navigation: "← Post anterior" / "Próximo post →"
   - Related posts (2-3 cards)
   - FAQ inline específico do tema + JSON-LD `FAQPage`
   - Seção de comentários (Sprint 8)

2. **Refatorar os 3 posts existentes** para o novo template
   - `ia-personal-trainer` → manter conteúdo, adaptar estrutura
   - `cobranca-automatica-personal` → manter conteúdo, adaptar estrutura
   - `retencao-alunos-personal` → manter conteúdo, adaptar estrutura

3. **JSON-LD por post:**
   - `Article` schema (headline, author, datePublished, dateModified, image, publisher)
   - `FAQPage` schema (perguntas inline)
   - `BreadcrumbList` schema

4. **Metadata por post:**
   - `generatePageMetadata()` com title, description, OG image, canonical
   - Twitter card `summary_large_image`
   - `article:published_time`, `article:modified_time`, `article:author`, `article:section`

5. **Criar `src/components/blog/`:**
   - `article-header.tsx` — hero + meta do artigo
   - `article-toc.tsx` — table of contents sticky
   - `article-share.tsx` — share buttons
   - `article-navigation.tsx` — prev/next post
   - `article-related.tsx` — posts relacionados
   - `article-author.tsx` — bio card do autor

### Resultado Sprint 5:
- ✅ 3 posts com design ultra-moderno
- ✅ JSON-LD Article + FAQ + BreadcrumbList em cada post
- ✅ Navegação entre posts
- ✅ Componentes reutilizáveis para futuros posts

---

## 📋 SPRINT 6 — FAQ Reutilizável + FAQ Schema Global

> **Estimativa:** ~1.5h · **Arquivos:** 4-6 novos/modificados

### Tarefas:

1. **Criar `src/components/shared/faq-inline.tsx`**
   - Versão compacta do FAQ da landing
   - Props: `items: { question, answer, icon? }[]`, `title?`, `schema?: boolean`
   - Accordion com Lucide `Plus`/`Minus`
   - Opcional: JSON-LD `FAQPage` schema embutido quando `schema=true`
   - Estilo: card branco com padding, consistente em fundo light e dark

2. **Criar banco de FAQs `src/data/faqs.ts`**
   - FAQs organizadas por página/contexto:
     - `FAQ_GENERAL` (12 — da landing)
     - `FAQ_TERMOS` (3-4)
     - `FAQ_PRIVACIDADE` (3-4)
     - `FAQ_COOKIES` (3-4)
     - `FAQ_LGPD` (3-4)
     - `FAQ_SOBRE` (3-4)
     - `FAQ_CONTATO` (3-4)
     - `FAQ_CARREIRAS` (3-4)
     - `FAQ_BLOG_IA` (3-4)
     - `FAQ_BLOG_COBRANCA` (3-4)
     - `FAQ_BLOG_RETENCAO` (3-4)
   - Total: ~50 perguntas únicas

3. **Integrar FAQ em todas as páginas** (Sprint 2, 3, 5 dependem deste)
   - Cada página pública renderiza `FaqInline` com as perguntas do contexto
   - Schema JSON-LD `FAQPage` emitido automaticamente

4. **Atualizar FAQ da landing** para importar de `src/data/faqs.ts`

### Resultado Sprint 6:
- ✅ FAQ reutilizável em todas as páginas
- ✅ 50+ perguntas organizadas por contexto
- ✅ FAQPage JSON-LD em TODAS as páginas públicas (AEO boost)

---

## 📋 SPRINT 7 — SEO Técnico Completo

> **Estimativa:** ~2h · **Arquivos:** 8-10 modificados

### Tarefas:

1. **Atualizar `robots.txt`**
   ```
   # Bloquear áreas privadas explicitamente
   Disallow: /dashboard
   Disallow: /auth
   Disallow: /login
   Disallow: /register
   Disallow: /forgot-password
   Disallow: /reset-password
   Disallow: /verify-email
   Disallow: /offline
   Disallow: /profile
   ```

2. **Atualizar `sitemap.xml`**
   - Adicionar TODAS as páginas públicas
   - Priority correta por importância
   - `lastmod` dinâmico (ou data real)
   - Incluir imagens nos posts (`<image:image>`)

3. **Atualizar `sitemap-blog.xml`**
   - Incluir todos os posts com `<news:news>` tag

4. **Criar `src/lib/structured-data.ts`** (centralizar JSON-LD)
   - `generateBreadcrumbSchema(items)`
   - `generateFaqSchema(items)`
   - `generateArticleSchema(post)`
   - `generateOrganizationSchema()`
   - `generateWebsiteSchema()`
   - `generateJobPostingSchema(job)`

5. **Metadata canônicas**
   - Garantir `canonical` em TODAS as páginas
   - Garantir `alternates` se aplicável
   - Remover qualquer `noindex` de páginas públicas (verificar que não há)

6. **Open Graph images**
   - Verificar OG images existentes em `/og/`
   - Criar/atualizar OG images faltantes (1200×630)
   - Cada página pública deve ter OG image própria

7. **Meta tags adicionais por página:**
   - `article:published_time` nos blog posts
   - `article:author` nos blog posts
   - `article:section` (categoria)
   - `article:tag` (tags)
   - `og:locale` = `pt_BR`

8. **Head tags para AEO/GEO:**
   - `<link rel="me">` para social profiles
   - `<meta name="google-site-verification">` se aplicável
   - Expandir `llms.txt` com mais contexto

### Resultado Sprint 7:
- ✅ robots.txt com bloqueios explícitos
- ✅ Sitemaps atualizados com todas as URLs
- ✅ JSON-LD centralizado e reutilizável
- ✅ OG images em todas as páginas
- ✅ Meta tags completas

---

## 📋 SPRINT 8 — Sistema de Comentários Próprio

> **Estimativa:** ~3h · **Arquivos:** 8-10 novos

### Tarefas:

1. **Backend: Criar tabela `comments`**
   ```sql
   CREATE TABLE comments (
     id TEXT PRIMARY KEY,
     page_slug TEXT NOT NULL,
     user_id TEXT REFERENCES users(id),
     guest_name TEXT,
     guest_email TEXT,
     content TEXT NOT NULL,
     parent_id TEXT REFERENCES comments(id),
     status TEXT DEFAULT 'approved', -- approved, pending, spam
     likes_count INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   CREATE INDEX idx_comments_page ON comments(page_slug, status, created_at DESC);
   ```

2. **Backend: API endpoints**
   - `GET /api/v1/comments?page_slug=xxx` — listar comentários da página
   - `POST /api/v1/comments` — criar comentário (autenticado ou guest com Turnstile)
   - `POST /api/v1/comments/:id/like` — curtir
   - `DELETE /api/v1/comments/:id` — deletar (owner ou admin)
   - `PATCH /api/v1/comments/:id` — editar (owner, 15min window)

3. **Frontend: `src/components/shared/comments-section.tsx`**
   - Lista de comentários com avatars, nomes, datas relativas
   - Reply threading (1 nível)
   - Like button com `Heart` icon
   - Form: textarea + submit com Turnstile
   - Guest mode: nome + email obrigatório
   - Logged in: auto-fill do user
   - Lucide icons: `MessageCircle`, `Heart`, `Reply`, `Trash2`, `Edit3`

4. **Frontend: Hooks**
   - `useComments(pageSlug)` — query
   - `useCreateComment()` — mutation
   - `useLikeComment()` — mutation

5. **Integrar** em todas as páginas de blog e opcionalmente em institucionais

### Resultado Sprint 8:
- ✅ Sistema de comentários funcional
- ✅ Threading, likes, guest mode
- ✅ Anti-spam via Turnstile

---

## 📋 SPRINT 9 — Sistema de Views/Visualizações

> **Estimativa:** ~1.5h · **Arquivos:** 5-6 novos

### Tarefas:

1. **Backend: Usar D1 para views** (cold data, alta frequência)
   ```sql
   CREATE TABLE page_views (
     page_slug TEXT NOT NULL,
     date TEXT NOT NULL, -- YYYY-MM-DD
     views INTEGER DEFAULT 0,
     unique_views INTEGER DEFAULT 0,
     PRIMARY KEY (page_slug, date)
   );
   ```

2. **Backend: API endpoints**
   - `POST /api/v1/views/track` — incrementar view (rate-limited por IP via KV)
   - `GET /api/v1/views?page_slug=xxx` — retornar total de views

3. **Frontend: `src/components/shared/view-counter.tsx`**
   - Exibe views com ícone `Eye`
   - Formato: "1.2K visualizações"
   - Auto-track on mount (1 view por sessão via sessionStorage)

4. **Integrar** no header dos blog posts e opcionalmente em outras páginas

### Resultado Sprint 9:
- ✅ View counter funcional em D1
- ✅ Rate-limiting anti-abuse
- ✅ Display formatado

---

## 📋 SPRINT 10 — Share Buttons + Social

> **Estimativa:** ~1h · **Arquivos:** 2-3 novos

### Tarefas:

1. **Criar `src/components/shared/share-buttons.tsx`**
   - Props: `url`, `title`, `description`
   - Botões: WhatsApp, Twitter/X, LinkedIn, Facebook, Copiar Link
   - Lucide icons + ícones SVG para redes
   - Copy: `navigator.clipboard` com toast "Link copiado!"
   - Estilo: pills horizontais com hover brand
   - Mobile: WhatsApp primeiro (prioridade BR)

2. **Integrar** no final de cada blog post e página institucional

### Resultado Sprint 10:
- ✅ Share buttons em todas as páginas públicas
- ✅ WhatsApp prioritário para audiência BR

---

## 📋 SPRINT 11 — OG Images Gerados + Assets

> **Estimativa:** ~2h · **Arquivos:** 10-15 imagens + scripts

### Tarefas:

1. **Criar/verificar OG images para cada página:**
   - `/og/og-home.png` (1200×630) — já existe?
   - `/og/og-blog.png` — listagem do blog
   - `/og/og-blog-ia.png` — post IA ✅ existe
   - `/og/og-blog-cobranca.png` — post cobrança ✅ existe
   - `/og/og-blog-retencao.png` — post retenção ✅ existe
   - `/og/og-sobre.png` — sobre nós
   - `/og/og-contato.png` — contato
   - `/og/og-carreiras.png` — carreiras
   - `/og/og-termos.png` — termos
   - `/og/og-privacidade.png` — privacidade
   - `/og/og-lgpd.png` — LGPD
   - `/og/og-cookies.png` — cookies

2. **Opção A**: Gerar via script Node.js com `@vercel/og` ou `satori`
3. **Opção B**: Criar manualmente no Figma com template consistente
4. **Template**: Fundo dark `#050A12`, logo VFIT, título da página, gradiente brand

### Resultado Sprint 11:
- ✅ OG image própria para cada página pública
- ✅ Template visual consistente

---

## 📋 SPRINT 12 — Changelog Page + Status

> **Estimativa:** ~1.5h · **Arquivos:** 2-3 novos

### Tarefas:

1. **Criar `src/app/(public)/changelog/page.tsx`**
   - Hero: "Changelog" + badge "ATUALIZAÇÕES"
   - Breadcrumbs: Home > Changelog
   - Timeline vertical com versões e datas
   - Badges por tipo: `Feature`, `Fix`, `Improvement`, `Breaking`
   - Lucide icons por tipo: `Sparkles`, `Bug`, `TrendingUp`, `AlertTriangle`
   - Dados vindo de um array estático (ou parse do `docs/CHANGELOG.md`)
   - FAQ inline: "Com que frequência atualizam?", etc.

2. **Atualizar sitemap** com `/changelog`

3. **Opcional: Criar `/status`** (redirect para status page externo ou página interna com health check)

### Resultado Sprint 12:
- ✅ Página de changelog pública e indexável
- ✅ Transparência sobre atualizações

---

## 📋 SPRINT 13 — Performance + Lighthouse Audit

> **Estimativa:** ~2h · **Arquivos:** 5-10 modificados

### Tarefas:

1. **Audit Lighthouse** em todas as páginas públicas
   - Performance > 90
   - SEO > 95
   - Accessibility > 90
   - Best Practices > 95

2. **Otimizações:**
   - Lazy loading de componentes abaixo do fold
   - `next/image` com `priority` no hero
   - Font optimization (`next/font`)
   - Preconnect para domínios externos
   - CSS critical path

3. **Core Web Vitals:**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

4. **Verificar todos os headings** (H1 → H6 hierarchy correta)

5. **Alt text** em todas as imagens

6. **Links internos** — verificar 404s, links quebrados

### Resultado Sprint 13:
- ✅ Lighthouse 95+ em todas as métricas
- ✅ Core Web Vitals green

---

## 📋 SPRINT 14 — Go-Live Checklist Final

> **Estimativa:** ~1h · **Arquivos:** 3-5 modificados

### Tarefas:

1. **Submeter sitemaps** no Google Search Console
2. **Verificar indexação** com `site:iapersonal.app.br`
3. **Request indexing** para páginas prioritárias
4. **Verificar** Google Rich Results Test para cada página com JSON-LD
5. **Verificar** Open Graph debugger (Facebook, Twitter, LinkedIn)
6. **Verificar** Schema.org validator
7. **Remover** qualquer referência a "em construção", "em breve", etc.
8. **Verificar** todos os links do footer apontam para páginas reais
9. **Verificar** canonical URLs corretas
10. **Deploy final** com todas as mudanças

### Resultado Sprint 14:
- ✅ Tudo indexável, validado, production-ready
- ✅ Rich results configurados
- ✅ Sem erros de SEO

---

## 📊 Resumo de Sprints

| Sprint | Foco | Estimativa | Arquivos |
|--------|------|-----------|----------|
| 1 | Infraestrutura (layout público + hero + breadcrumbs) | ~2h | 6-8 |
| 2 | Páginas legais redesign (5 páginas) | ~2h | 5 |
| 3 | Páginas institucionais redesign (3 páginas) | ~2h | 3 |
| 4 | Blog listing redesign | ~2h | 3-4 |
| 5 | Blog posts individuais redesign | ~3h | 5-7 |
| 6 | FAQ reutilizável + banco de FAQs | ~1.5h | 4-6 |
| 7 | SEO técnico (robots, sitemaps, JSON-LD, OG) | ~2h | 8-10 |
| 8 | Sistema de comentários | ~3h | 8-10 |
| 9 | Sistema de views | ~1.5h | 5-6 |
| 10 | Share buttons | ~1h | 2-3 |
| 11 | OG images geradas | ~2h | 10-15 |
| 12 | Changelog page | ~1.5h | 2-3 |
| 13 | Performance + Lighthouse | ~2h | 5-10 |
| 14 | Go-Live checklist | ~1h | 3-5 |
| **TOTAL** | | **~26h** | **~70-95** |

---

## 🔄 Dependências entre Sprints

```
Sprint 1 (infra) ──────┬──→ Sprint 2 (legais)
                        ├──→ Sprint 3 (institucionais)
                        ├──→ Sprint 4 (blog listing)
                        └──→ Sprint 12 (changelog)

Sprint 6 (FAQ data) ───┬──→ Sprint 2 (FAQ nas legais)
                        ├──→ Sprint 3 (FAQ nas institucionais)
                        └──→ Sprint 5 (FAQ nos posts)

Sprint 4 (blog listing) ──→ Sprint 5 (blog posts)

Sprint 5 (blog posts) ─┬──→ Sprint 8 (comentários)
                        ├──→ Sprint 9 (views)
                        └──→ Sprint 10 (share)

Sprint 7 (SEO) ────────→ Sprint 11 (OG images)

Tudo ──────────────────→ Sprint 13 (Lighthouse)
                        → Sprint 14 (Go-Live)
```

### Ordem Recomendada de Execução:
```
Sprint 1 → Sprint 6 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5
→ Sprint 7 → Sprint 8 → Sprint 9 → Sprint 10 → Sprint 11
→ Sprint 12 → Sprint 13 → Sprint 14
```

---

## 🎯 Prompt de Continuação

Quando estiver pronto para começar, use este prompt:

```
Execute o Sprint 1 do plano em docs/PLANO-PAGINAS-SEO-COMPLETO.md.

Contexto:
- Projeto: VFIT (Next.js 15, Tailwind v4, Lucide React)
- Versão atual: v4.4.8
- Path: /Users/macos/Development/apps/personal-ia-prod
- Layout atual: (institutional) e (legal) são route groups separados com header/footer inline
- Objetivo: Criar route group (public) unificado, layout com Navbar+Footer da landing,
  componente PageHero reutilizável, componente Breadcrumbs com JSON-LD

Regras:
- Tailwind CSS v4 canônico (bg-linear-to-r, não bg-gradient-to-r)
- Lucide React para todos os ícones
- Next.js Image para todas as imagens
- Deploy com: node scripts/cf-deploy.js patch --skip-workers --msg "..."
- Documentar no CHANGELOG após deploy

Faça tudo do Sprint 1, build, deploy, e me pergunte antes de ir ao Sprint 2.
```

---

> **📌 Nota:** Este plano é vivo. Sprints podem ser ajustados, divididos ou reordenados conforme necessidade.
> Cada sprint deve terminar com build + deploy + documentação.

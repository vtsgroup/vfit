# TRACKING — VFIT Public Pages Redesign v1

> **Plano:** `vfit-public-pages-redesign-v1`
> **Início:** Abril 2026
> **Score inicial:** 6.3/10 → **Meta:** 8.5/10
> **Última atualização:** v1.7.0 (05/04/2026)

---

## Progresso Geral

**0/85 (0%)**

---

## S1 — Quick Wins & Renaming (01, 03)

### T1 — Correções Urgentes

- [ ] **T1.1** Corrigir email no footer → `contato@vfit.app.br`
- [ ] **T1.2** Alinhar nomes dos planos no FAQ (Grátis, Pro, Pro+, Max)
- [ ] **T1.3** Adicionar `width`/`height` em todas as `<img>` (CLS)
- [ ] **T1.4** Contadores animados só no viewport (`IntersectionObserver`)
- [ ] **T1.5** Adicionar `aria-label` no carrossel de testimonials
- [ ] **T1.6** Atualizar meta title de todas as páginas → `VFIT | ...`

### T2 — Renaming (iapersonal → VFIT)

- [ ] **T2.1** Buscar/substituir "iapersonal" e "IA Personal" em código
- [ ] **T2.2** Atualizar todos os `<title>`, `<meta>` OG tags
- [ ] **T2.3** Atualizar `manifest.json` (name, short_name, description)
- [ ] **T2.4** Atualizar `sitemap.xml`, `robots.txt`, canonical tags
- [ ] **T2.5** Redirect 301: `iapersonal.app.br` → `vfit.app.br` (CF DNS)
- [ ] **T2.6** FAQ Q1/Q2: substituir "IA Personal" → "VFIT", alinhar planos
- [ ] **T2.7** Termos de Uso e Política de Privacidade: revisar menções
- [ ] **T2.8** Footer: novo email `contato@vfit.app.br`

### T3 — Comunicação

- [ ] **T3.1** Emails transacionais: remetente → `noreply@vfit.app.br`
- [ ] **T3.2** PDFs de avaliação: logo VFIT no cabeçalho
- [ ] **T3.3** Push notifications: remetente "VFIT"

---

## S2 — Logo & Assets (05)

### T4 — Logo Design

- [ ] **T4.1** Criar logo mark SVG (símbolo V com pulso verde, 40×40)
- [ ] **T4.2** Criar logo horizontal SVG (mark + wordmark, 128×40) — dark + light
- [ ] **T4.3** Criar favicon SVG simplificado (32×32, fundo verde escuro)

### T5 — Assets Visuais

- [ ] **T5.1** Apple Touch Icon (180×180 PNG)
- [ ] **T5.2** PWA Icons 192×192 e 512×512 PNG
- [ ] **T5.3** PWA Icon maskable 512×512
- [ ] **T5.4** OG Image (1200×630) — fundo preto, gradient verde, logo, tagline
- [ ] **T5.5** Logo para PDF (vetorial, para avaliações)

### T6 — Implementação Logo

- [ ] **T6.1** Atualizar `manifest.json` completo (icons, screenshots)
- [ ] **T6.2** Atualizar `<head>` com novos links de favicon/icons
- [ ] **T6.3** Criar componente `<Logo>` em Next.js com props size/variant
- [ ] **T6.4** Testar logo em 16px, 40px, 200px e fundos variados
- [ ] **T6.5** Testar navbar mobile (375px)

---

## S3 — Auth Pages Redesign (07)

### T7 — Login Redesign

- [ ] **T7.1** Layout split-screen desktop (60/40): brand panel + form panel
- [ ] **T7.2** Brand panel: logo, headline, bullets de benefícios, social proof
- [ ] **T7.3** Form panel: email + senha com ícones, toggle visibilidade
- [ ] **T7.4** Validação inline + loading state no submit
- [ ] **T7.5** Divider "ou continue com" + Google Sign In
- [ ] **T7.6** Links: "Esqueci senha", "Criar conta grátis"
- [ ] **T7.7** Legal: links Termos + Privacidade
- [ ] **T7.8** Mobile: card único centralizado (brand panel hidden)

### T8 — Outras Auth Pages

- [ ] **T8.1** Esqueci Senha: card centralizado, campo email, estado sucesso
- [ ] **T8.2** Nova Senha: nova senha + confirmação + indicador de força
- [ ] **T8.3** Cadastro Personal: fluxo 3 etapas (tipo → dados → plano)
- [ ] **T8.4** Cadastro Aluno: fluxo simplificado
- [ ] **T8.5** Verificar Email: criar se não existe
- [ ] **T8.6** Onboarding Welcome: melhorar fluxo existente

---

## S4 — Home Sections Part 1 (04, 01)

### T9 — Hero

- [ ] **T9.1** Adicionar mockup do app real
- [ ] **T9.2** Mesh gradient no fundo
- [ ] **T9.3** Social proof badges como chips
- [ ] **T9.4** CTA "Ver demonstração" com vídeo
- [ ] **T9.5** Contadores com IntersectionObserver
- [ ] **T9.6** Mobile: hero otimizado

### T10 — Features

- [ ] **T10.1** Layout assimétrico (2fr 1fr) — card principal maior
- [ ] **T10.2** Screenshots/GIFs reais do app
- [ ] **T10.3** Ícones Lucide padronizados (mapeamento das 16 features)
- [ ] **T10.4** Badges unificados
- [ ] **T10.5** Card "Em Breve" para features futuras

### T11 — Como Funciona

- [ ] **T11.1** Linha conectora pontilhada entre steps
- [ ] **T11.2** Screenshot/animação por passo
- [ ] **T11.3** Stagger animation
- [ ] **T11.4** Tempo estimado por passo

---

## S5 — Home Sections Part 2 (04, 01)

### T12 — Pricing

- [ ] **T12.1** Toggle mensal/anual acima dos cards
- [ ] **T12.2** Tabela comparativa feature-by-feature
- [ ] **T12.3** Garantia 7 dias visual
- [ ] **T12.4** FAQ inline de pricing (6-8 perguntas)
- [ ] **T12.5** Destaque visual Pro/Pro+

### T13 — Testimonials

- [ ] **T13.1** Avatar system com initials fallback
- [ ] **T13.2** Controles acessíveis (setas, dots, teclado)
- [ ] **T13.3** Rating 5 estrelas
- [ ] **T13.4** Vídeo-depoimento (se disponível)

### T14 — Gamificação & Footer

- [ ] **T14.1** Gamificação: virar seção destaque, stagger animation, tooltip badges
- [ ] **T14.2** Footer: newsletter (campo email)
- [ ] **T14.3** Footer: YouTube como ícone social
- [ ] **T14.4** Footer: badges de confiança mais visíveis

### T15 — Navbar

- [ ] **T15.1** Logo SVG real no navbar
- [ ] **T15.2** Indicador de página ativa
- [ ] **T15.3** `backdrop-filter: blur()` no scroll
- [ ] **T15.4** Responsividade mobile melhorada

---

## S6 — Blog Infrastructure (04, 06)

### T16 — Template & Estrutura

- [ ] **T16.1** Template frontmatter MDX (title, slug, description, author, tags, readTime)
- [ ] **T16.2** Estrutura padrão de artigo (H1, problema, solução, passos, CTA)
- [ ] **T16.3** Componente CTA inline para artigos
- [ ] **T16.4** Schema markup `Article` + `BreadcrumbList`
- [ ] **T16.5** SEO checklist por artigo (meta, headings, links, canonical, OG)

### T17 — Páginas de Blog

- [ ] **T17.1** Listagem: pesquisa, filtros por categoria
- [ ] **T17.2** Artigo destaque full-width
- [ ] **T17.3** Grade 3 colunas + sidebar
- [ ] **T17.4** Artigo: breadcrumb, hero com imagem, TOC, artigos relacionados

---

## S7 — Blog Content — Abril (06)

### T18 — Artigos Abril 2026

- [ ] **T18.1** "PIX Automático para Personal Trainers: Guia Completo 2026"
- [ ] **T18.2** "Como a IA Prescreve Treinos Melhores que Planilhas Manuais"
- [ ] **T18.3** "App para Personal Trainer: Os 5 Melhores em 2026"

---

## S8 — Blog Content — Maio/Junho (06)

### T19 — Artigos Maio 2026

- [ ] **T19.1** "Contrato para Personal Trainer: Modelo Gratuito"
- [ ] **T19.2** "Como Cobrar Mais Caro Sendo Personal Trainer"
- [ ] **T19.3** "Gamificação no Fitness: Por Que Seus Alunos Abandonam em 3 Meses"
- [ ] **T19.4** "LGPD e Personal Trainers: O Que Você Precisa Saber"

### T20 — Artigos Junho 2026

- [ ] **T20.1** "Nota Fiscal para Personal Trainer: MEI, ME ou PJ?"
- [ ] **T20.2** "7 Templates de Mensagem para Reengajar Alunos Sumidos"
- [ ] **T20.3** "Como Montar um Programa de 12 Semanas que Retém Alunos"
- [ ] **T20.4** "PWA vs App Nativo"
- [ ] **T20.5** "Avaliação Física Completa: Checklist Gratuito"

### T21 — Lead Magnets

- [ ] **T21.1** Ficha de Avaliação Física (PDF)
- [ ] **T21.2** Contrato PT (DOC/PDF)
- [ ] **T21.3** 7 Templates de Mensagem (PDF)
- [ ] **T21.4** Checklist Retenção (PDF)
- [ ] **T21.5** Calculadora de Precificação (Web)
- [ ] **T21.6** Planilha de Metas (XLSX)

---

## S9 — Polish & Acessibilidade (01)

### T22 — Acessibilidade

- [ ] **T22.1** Auditoria WCAG 2.1 AA completa (contraste, focus, alt text)
- [ ] **T22.2** Keyboard navigation em todas as seções interativas
- [ ] **T22.3** Screen reader testing (VoiceOver)

### T23 — Performance

- [ ] **T23.1** Lighthouse audit > 90 em todas as categorias
- [ ] **T23.2** CLS < 0.1 (imagens com dimensões, lazy loading)
- [ ] **T23.3** LCP < 2.5s (font preloading, critical CSS)

---

## Tabela de Deploys

| Versão | Sprint | Data | Commit | Arquivos |
|--------|--------|------|--------|----------|
| — | — | — | — | — |

---

> **Nota:** Este plano tem ~85 tasks. Prioridade de execução: S1 → S2 → S3 → S4 → S5 → S6 → S7+.

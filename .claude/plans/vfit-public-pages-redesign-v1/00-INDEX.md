# VFIT — Plano Completo de Frontend & Design System

> Auditoria visual + plano de melhorias completo  
> Nome oficial: **VFIT** (migração de "IA Personal" / "iapersonal.app.br")  
> Data: Abril 2026 | Versão: 1.0

---

## 📁 Estrutura dos Documentos

| Arquivo | Conteúdo |
|---------|----------|
| `00-INDEX.md` | Este índice geral + resumo executivo |
| `01-AUDITORIA-VISUAL.md` | Diagnóstico completo do site atual |
| `02-DESIGN-SYSTEM.md` | Design System oficial do VFIT (tokens, cores, tipografia) |
| `03-RENAMING-GUIDE.md` | Guia de migração de nome — onde mudar tudo |
| `04-PAGES-PLAN.md` | Plano de melhoria página por página |
| `05-LOGO-ICONS.md` | Nova logo SVG, ícones, favicon, manifest |
| `06-BLOG-ARTICLES.md` | Calendário editorial + estrutura de artigos |
| `07-LOGIN-AUTH-PAGES.md` | Redesign das páginas de login e auth |

---

## 🎯 Resumo Executivo

O VFIT possui base sólida: copy forte, funcionalidades bem articuladas e pricing clara. O problema central é a **inconsistência visual** — o site mistura estilos, usa o nome antigo "iapersonal" em URLs e meta tags, e carece de Design System documentado.

### Prioridades (ordem de impacto)

1. **Renomear** tudo para VFIT (URLs, meta tags, emails, footers)
2. **Nova logo SVG** + favicon + brand mark
3. **Design System** — tokens unificados em código
4. **Redesign Login/Onboarding** — primeira impressão do produto
5. **Melhorias por seção** — hero, pricing, testimonials, blog
6. **Blog com novos artigos** — SEO e autoridade no nicho

---

## 📊 Score Geral (Auditoria Inicial)

| Área | Nota |
|------|------|
| Copy / Mensagem | 9/10 |
| Visual Design | 6/10 |
| Branding | 5/10 |
| UX / Usabilidade | 7/10 |
| Acessibilidade | 5/10 |
| SEO On-page | 6/10 |
| Performance | 6/10 |
| **GERAL** | **6.3/10** |

---

## ⚡ Próximos Passos

**Semana 1 — Branding**
- Criar logo SVG final (ver `05-LOGO-ICONS.md`)
- Registrar domínio `vfit.app` e configurar redirect 301
- Gerar favicon, apple-touch-icon, PWA icons

**Semana 2 — Código**
- Implementar tokens CSS no projeto (ver `02-DESIGN-SYSTEM.md`)
- Substituir todas as referências "iapersonal" (ver `03-RENAMING-GUIDE.md`)
- Atualizar meta tags, OG tags, manifest.json

**Semana 3 — Páginas**
- Redesign da página de Login (ver `07-LOGIN-AUTH-PAGES.md`)
- Adicionar mockup do produto no Hero
- Unificar sistema de ícones com Lucide Icons

**Semana 4 — Conteúdo**
- Publicar 3 primeiros artigos do blog (ver `06-BLOG-ARTICLES.md`)
- Adicionar foto do fundador na seção Sobre
- Corrigir inconsistência de nomes dos planos (Pricing vs FAQ)

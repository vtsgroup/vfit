# 06 — Template de Artigos (SEO + FAQ)

## Objetivo

Padronizar publicação de artigos com estrutura consistente para SEO, GEO, AEO e conversão.

## Estrutura obrigatória do artigo

1. `title` com keyword principal + benefício claro
2. introdução com resposta direta (até 80 palavras)
3. blocos com `h2` e `h3` escaneáveis
4. ao menos 1 tabela, matriz ou checklist
5. seção de prova/contexto prático
6. FAQ final (3 a 8 perguntas naturais)
7. CTA contextual para página money
8. schemas válidos (`Article` + `FAQPage` e, quando aplicável, `HowTo`/`ItemList`)

## Contrato mínimo de metadata

- `title`: até ~60 caracteres relevantes
- `description`: até ~155 caracteres com intenção + benefício
- `path`: URL canônica final
- `type`: `article`
- `section`: categoria principal
- `tags`: keyword principal + secundárias
- `publishedTime` e `modifiedTime`

## Contrato de conteúdo (blocos recomendados)

- **Abertura:** dor + promessa + contexto
- **Quadro comparativo:** antes/depois, comum/especializado
- **Bloco operacional:** passo a passo/checklist
- **Bloco de decisão:** quando usar, quando não usar
- **FAQ:** respostas diretas, linguagem de busca
- **CTA:** 1 ação principal por artigo

## Schema checklist

- [ ] `articleSchema(...)`
- [ ] `faqSchema(...)`
- [ ] `howToSchema(...)` (quando tutorial)
- [ ] `ItemList` (quando comparativo/ranking)

## Checklist editorial de qualidade

- [ ] keyword principal no título e no primeiro parágrafo
- [ ] sem canibalizar URL já existente
- [ ] links internos para 2+ páginas estratégicas
- [ ] links externos com fonte confiável quando houver dado
- [ ] CTA alinhado ao ICP do artigo
- [ ] linguagem objetiva, sem jargão excessivo

## Snippet de scaffold (referência)

```tsx
export const metadata: Metadata = buildSeoMetadata({
  title: post.title,
  description: post.excerpt,
  path: '/blog/slug-do-artigo',
  ogImage: post.ogImage,
  type: 'article',
  section: post.category,
  tags: post.tags,
  publishedTime: post.dateISO,
  modifiedTime: post.modifiedISO,
})

const faq = [
  { question: '...', answer: '...' },
]

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(...)) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faq)) }} />
```

# SEO and Growth Plan

## Estado atual

O VFIT já tem fundamentos bons:

- `buildSeoMetadata` com canonical, Open Graph, Twitter Card e robots.
- `public/sitemap.xml` e `public/sitemap-blog.xml`.
- Landings para home, personal trainer, nutricionistas, afiliados e pricing.
- Blog com posts sobre IA, retenção, cobrança, apps para personal e nutrição integrada.
- Componentes `JsonLd`, `DirectAnswer` e `CitableBlock`.
- FAQs estruturadas por página.

O gap é escala e intenção. O site cobre algumas queries grandes, mas ainda não cobre a cauda longa que compra: “como cobrar aluno personal”, “app para personal com pix”, “treino para aluno iniciante”, “nutricionista esportivo acompanhar aluno online”, “loja de planos de treino”.

## Objetivo SEO

Transformar VFIT em autoridade brasileira para tecnologia de personal trainers, treino com IA, gestão fitness, cobrança recorrente e integração treino + nutrição.

```text
Search intent -> direct answer -> proof -> product fit -> CTA -> onboarding
```

## Clusters prioritários

### Cluster 1 — Personal trainer software

**Objetivo:** capturar profissionais prontos para trocar planilha/WhatsApp por sistema.

Páginas:

- `/app-personal-trainer` como hub.
- `/app-personal-trainer/gestao-alunos`
- `/app-personal-trainer/cobranca-automatica`
- `/app-personal-trainer/avaliacao-fisica`
- `/app-personal-trainer/montar-treino-ia`
- `/app-personal-trainer/agenda-personal`
- `/app-personal-trainer/whatsapp-vs-app`
- `/app-personal-trainer/planilha-vs-vfit`

Schema:

- SoftwareApplication.
- Product.
- FAQPage.
- BreadcrumbList.

CTA:

- “Começar grátis”.
- “Ver como fica para meus alunos”.
- “Calcular economia de tempo”.

### Cluster 2 — Aluno e app de treino

**Objetivo:** capturar demanda B2C e alimentar loja/marketplace.

Páginas:

- `/app-treino-ia`
- `/app-treino-iniciante`
- `/treino-em-casa-com-ia`
- `/treino-academia-com-ia`
- `/plano-de-treino-personalizado`
- `/calcular-macros`
- `/avaliacao-fisica-online`
- `/loja-planos-treino`

CTA:

- “Gerar meu treino”.
- “Explorar planos”.
- “Encontrar personal”.

Product connection:

- Leva para onboarding aluno.
- Recomendação de planos na loja.
- Captura objetivo, equipamento e nível.

### Cluster 3 — Nutricionistas

**Objetivo:** tornar nutrição um produto, não um subtópico.

Páginas:

- `/nutricionistas` como hub.
- `/nutricionistas/app-nutricionista-esportivo`
- `/nutricionistas/plano-alimentar-online`
- `/nutricionistas/acompanhamento-paciente-treino`
- `/nutricionistas/bioimpedancia-e-evolucao`
- `/nutricionistas/personal-trainer-parceria`

CTA:

- “Criar perfil de nutricionista”.
- “Vincular paciente por código”.
- “Ver fluxo com personal”.

### Cluster 4 — Cobrança e monetização

**Objetivo:** capturar dor econômica direta.

Páginas:

- `/cobranca-automatica-personal-trainer`
- `/pix-recorrente-personal-trainer`
- `/boleto-para-personal-trainer`
- `/assinatura-alunos-personal`
- `/inadimplencia-personal-trainer`
- `/comissao-afiliados-fitness`

CTA:

- “Criar primeira cobrança”.
- “Simular receita recorrente”.

### Cluster 5 — Marketplace/loja

**Objetivo:** abrir demanda transacional.

Páginas:

- `/loja/planos-de-treino` pública indexável.
- `/loja/hipertrofia`
- `/loja/emagrecimento`
- `/loja/funcional`
- `/loja/corrida`
- `/loja/calistenia`
- `/loja/personal/[slug]` para seller profile.

Regras:

- Só indexar planos publicados e aprovados.
- Canonical por plano.
- Structured data Product/Offer/Review quando houver dados reais.
- No fake reviews.

## Technical SEO checklist

### Metadata

- Cada rota pública tem title único e description <160 chars.
- App/dashboard/auth noindex preservado.
- Canonical não aponta para URL errada.
- OG image por cluster, não só default.
- Twitter Card coerente.

### Sitemaps

- `sitemap.xml` referencia hubs principais.
- `sitemap-blog.xml` apenas blog.
- Criar `sitemap-store.xml` quando loja pública existir.
- Criar `sitemap-programmatic.xml` para páginas programáticas aprovadas.
- Atualizar `lastmod` no build, não manualmente para sempre.

### Schema.org

Obrigatório por tipo:

| Página | Schema |
|---|---|
| Home | Organization, WebSite, SoftwareApplication |
| Pricing | Product, OfferCatalog, FAQPage |
| Blog post | Article, BreadcrumbList, FAQPage quando houver FAQ |
| Personal hub | SoftwareApplication, FAQPage |
| Nutri hub | SoftwareApplication, FAQPage |
| Store category | CollectionPage, BreadcrumbList |
| Store plan detail | Product, Offer, Review aggregate real |
| Public profile | Person, Service, BreadcrumbList |

### Internal linking

Cada post deve linkar para:

- Uma página hub.
- Uma página de feature.
- Um CTA de cadastro ou ferramenta.
- Dois conteúdos relacionados.

Hubs devem linkar para:

- Posts que suportam claims.
- Pricing.
- Cadastro.
- Casos de uso.

### Performance SEO

- Lighthouse mobile >= 90 em páginas públicas principais.
- LCP < 2.5s em landing e blog.
- CLS < 0.05.
- Remover preloads não usados.
- Imagens com largura/altura definidas.
- Font loading sem shift.
- Cookie banner não bloqueia LCP nem CTA.

### E-E-A-T

Fitness e nutrição são temas sensíveis. Conteúdo precisa de confiança explícita:

- Autor com bio e credencial quando conteúdo prescritivo.
- Revisão por profissional quando falar de treino, dieta, lesão ou saúde.
- Fontes externas confiáveis citadas.
- Data de atualização visível.
- Disclaimer: conteúdo informativo, não substitui avaliação profissional.

## Content roadmap

### Sprint SEO-1 — Fundamentos

- Auditar metadata de todas páginas públicas.
- Corrigir OG por cluster.
- Garantir JSON-LD em home, pricing, blog e ICP pages.
- Criar dashboard de indexação e Search Console.
- Criar templates programáticos seguros.

### Sprint SEO-2 — Personal trainer acquisition

- 8 páginas de cluster personal.
- 6 posts suportando cobrança, retenção, IA e avaliação.
- Comparativos com planilha/WhatsApp.
- Calculadora de economia de tempo.

### Sprint SEO-3 — Aluno/store acquisition

- Hub app de treino.
- Categorias públicas da loja.
- Páginas por objetivo/equipamento/nível.
- Onboarding aluno conectado ao conteúdo.

### Sprint SEO-4 — Nutricionistas

- Hub nutri expandido.
- 6 posts de nutrição esportiva/colaboração.
- Página parceria personal + nutri.
- CTA para cadastro role nutritionist.

### Sprint SEO-5 — Programmatic moat

- Páginas por cidade apenas se houver oferta real/localidade.
- Páginas por modalidade: musculação, funcional, crossfit, calistenia, corrida.
- Páginas por objetivo: hipertrofia, emagrecimento, força, mobilidade.
- Geração com review humano e canonical correto.

## Conversion instrumentation

Eventos mínimos:

```text
seo_page_view
cta_click
pricing_plan_click
register_started
register_completed
onboarding_started
onboarding_completed
store_plan_viewed
store_checkout_started
store_purchase_completed
personal_invite_created
student_linked_personal
student_linked_nutritionist
```

Cada evento precisa de:

- `source_page`
- `utm_*`
- `persona`
- `route_group`
- `experiment_id` quando existir

## SEO risks

### Risk 1 — Programmatic thin content

Páginas programáticas sem dados reais podem virar conteúdo fino. Mitigação: só publicar template com resposta útil, FAQ real, CTA, schema e revisão.

### Risk 2 — Health claims

Promessas de treino/dieta podem criar risco regulatório e confiança baixa. Mitigação: disclaimers, fontes, revisão profissional.

### Risk 3 — Auth leakage in public QA

Sessão logada redireciona login/register para admin. Mitigação: QA incognito e browser smoke público sem cookies.

### Risk 4 — Duplicate sitemaps/canonicals

Blog aparece em sitemap principal e sitemap blog. Isso é aceitável, mas precisa consistência de priority/lastmod e canonical.

## Growth loops

### Loop personal

```text
Personal cria aluno -> aluno recebe app -> aluno treina -> personal vê progresso
-> personal cobra/retém -> aluno indica ou personal convida mais alunos
```

### Loop aluno loja

```text
Aluno vê progresso/objetivo -> recomenda plano -> compra -> conclui treino
-> avalia plano -> melhora ranking -> mais vendas para creator
```

### Loop nutricionista

```text
Aluno vincula nutri -> nutri cria plano alimentar -> aluno registra refeições
-> nutri ajusta -> personal vê contexto -> resultado melhora -> retenção sobe
```

### Loop afiliados

```text
Usuário satisfeito -> link afiliado -> novo personal -> comissão -> incentivo recorrente
```

## Metrics that matter

### Acquisition

- Organic clicks by cluster.
- Landing -> register conversion.
- Blog -> product CTA conversion.
- Pricing -> checkout conversion.

### Activation

- Personal creates first student.
- Student completes onboarding.
- Student starts first workout.
- Nutritionist creates first patient.

### Retention

- Weekly active students.
- Workouts completed per week.
- Meals logged per week.
- Personal active days.
- Nutritionist active patients.

### Revenue

- MRR by plan.
- Marketplace GMV.
- Creator payouts.
- Payment recovery rate.
- Affiliate CAC/payback.

## Definition of SEO done

- Page indexed intentionally.
- Metadata unique.
- Schema valid.
- Internal links present.
- CTA mapped.
- Search intent answered in first viewport or first section.
- Lighthouse mobile >= 90.
- No console errors.
- Search Console submitted.
- Conversion event tracked.
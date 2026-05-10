# Live Site and Repo Audit

> Auditoria executada em 2026-05-09 usando navegação live, sitemaps, rotas do repo e docs de tracking.

## Resumo do crawl

### Público e SEO

Rotas públicas navegadas com HTTP 200:

- `/`
- `/app-personal-trainer`
- `/nutricionistas`
- `/afiliados`
- `/pricing`
- `/blog`
- `/sobre`
- `/contato`
- `/status`
- principais posts do blog via sitemap
- legais: `/termos`, `/privacidade`, `/cookies`, `/lgpd`, `/excluir-conta`
- guest: `/guest/explore`, `/guest/workouts`, `/guest/calculators`

Sitemap público atual cobre landing, ICPs, blog, legal, pricing, conta e status. Login/register foram removidos do sitemap por `noindex,nofollow`, o que está correto.

### App do aluno

Rotas navegadas com HTTP 200:

- `/treinos`
- `/nutricao`
- `/avaliacoes`
- `/progresso`
- `/exercicios`
- `/ia`
- `/perfil`
- `/plano`
- `/social`
- `/ia/dieta`
- `/ia/macros`
- `/ia/recuperacao`
- `/ia/treino-adaptado`
- `/perfil/assinatura`
- `/perfil/notificacoes`
- `/perfil/tema`
- `/perfil/lembretes`
- `/perfil/equipamentos`
- `/perfil/desafios`
- `/perfil/offline`
- `/perfil/changelog`

Rotas respondem, mas algumas têm chamadas API quebradas na sessão testada.

### Dashboard personal/admin

Rotas navegadas com HTTP 200:

- `/dashboard`
- `/dashboard/onboarding`
- `/dashboard/students`
- `/dashboard/students/invite`
- `/dashboard/workouts`
- `/dashboard/workouts/create`
- `/dashboard/exercises`
- `/dashboard/calendar`
- `/dashboard/assessments`
- `/dashboard/assessments/create`
- `/dashboard/payments`
- `/dashboard/payments/create`
- `/dashboard/financeiro`
- `/dashboard/ai`
- `/dashboard/messages`
- `/dashboard/meal-plans`
- `/dashboard/nutrition-assessments`
- `/dashboard/marketplace`
- `/dashboard/marketplace/create`
- `/dashboard/plans`
- `/dashboard/affiliates`
- `/dashboard/settings`
- `/dashboard/admin/*`

O dashboard está amplo: alunos, treinos, exercícios, agenda, avaliações, pagamentos, financeiro, IA, mensagens, meal plans, nutrition assessments, marketplace, afiliados, planos e admin.

## Achados P0/P1 do live site

### P0-001 — OneSignal preso em domínio antigo

**Evidência:** console live em `/nutricao`:

```text
[OneSignal] Init error: Can only be used on: https://iapersonal.app.br
```

**Impacto:** notificações push podem não inicializar em produção `vfit.app.br`. Isso quebra lembretes, reengajamento, cobranças e qualquer loop de retenção que dependa de push.

**Correção planejada:** revisar OneSignal App/Web Push origin, service worker scope, app id, allowed domains e documentação de migração de domínio. Adicionar smoke de push inicializando sem erro em `vfit.app.br`.

**Status 2026-05-09:** bloqueado por configuração externa. O código frontend já usa `vfit.app.br` em `defaultUrl` e service workers locais corretos; o erro indica allowed origin configurado no app OneSignal.

### P0-002 — CSP bloqueia `images.vfit.app.br`

**Evidência:** console live em `/exercicios`:

```text
Connecting to 'https://images.vfit.app.br/muscles/chest/image_male_url.png' violates connect-src
Fetch API cannot load ... Refused to connect because it violates CSP
```

**Impacto:** imagens de músculos/exercícios podem falhar, quebrando biblioteca, detalhe de exercício e percepção premium.

**Correção planejada:** incluir `images.vfit.app.br` e `videos.vfit.app.br` nas diretivas corretas (`img-src`, `media-src`, e `connect-src` se houver fetch), validar R2 custom domains e ORB/CORS.

**Status 2026-05-09:** corrigido em código. `public/_headers` agora inclui domínios VFIT/legados de imagem e vídeo em `connect-src`, além de `media-src` explícito para vídeo.

### P0-003 — `/students/me` retorna 404 em app do aluno

**Evidência:** `/treinos`, `/nutricao`, `/avaliacoes` chamaram:

```text
https://api.vfit.app.br/api/v1/students/me -> 404
```

**Impacto:** app do aluno pode depender de fallback ou dados incompletos. Na sessão testada, a UI continuou renderizando, mas isso mascara erro de identidade/role.

**Hipóteses:**

- Sessão atual é admin/super_admin usando app aluno; endpoint exige `student` real.
- `students/me` não cobre simulação/admin, mas UI permite entrar na área aluno.
- Registro de student ausente para o usuário autenticado.

**Correção planejada:** definir comportamento explícito para admin/persona simulada, erro user-visible quando role incompatível, e smoke autenticado com token real de student.

**Status 2026-05-09:** corrigido em API para admin/super_admin sem simulação de aluno. `workers/api/students.ts` agora retorna `400` descritivo em vez de `404` genérico. Ainda precisa smoke com token real de student.

### P0-004 — `/progress/top-exercises` retorna 500

**Evidência:** `/progresso`:

```text
https://api.vfit.app.br/api/v1/progress/top-exercises?limit=4 -> 500
```

**Impacto:** progresso é uma rota central de retenção. 500 em produção reduz confiança e pode acionar demo/fallback incorreto.

**Correção planejada:** investigar query, schema, usuário sem dados, joins com exercícios, empty state e error handling específico.

**Status 2026-05-09:** corrigido em API. `workers/api/progress.ts` removeu o join com `exercises` no Neon e busca nomes do catálogo no D1 de forma best-effort. Teste de regressão criado em `tests/api/progress.test.ts`.

### P0-005 — Chunk `_next` servido como HTML

**Evidência:** snapshot inicial em `/nutricao`:

```text
Refused to execute script from .../app/(app)/perfil/page-...js because MIME type ('text/html') is not executable
```

**Impacto:** rota pode quebrar após deploy se HTML fallback responder por chunk antigo. Isso é típico de cache/stale asset em static export/Cloudflare Pages.

**Correção planejada:** revisar cache headers de `_next/static`, Pages deploy invalidation, service worker update strategy, fallback rewrite e versão do SW.

**Status 2026-05-09:** corrigido em código. `public/_worker.js` não faz fallback SPA para assets ausentes; `public/OneSignalSDKWorker.js` subiu cache para `v9` e descarta HTML cacheado para JS/CSS.

### P1-001 — `financeiro` warning de chart dimensions

**Evidência:** `/dashboard/financeiro`:

```text
The width(-1) and height(-1) of chart should be greater than 0
```

**Impacto:** gráficos podem renderizar vazios em certos breakpoints, afetando confiança do personal em financeiro.

**Correção planejada:** containers com dimensão estável, skeleton de chart, `ResponsiveContainer` com altura explícita e teste visual desktop/mobile.

**Status 2026-05-09:** corrigido em código. `src/components/financial/financial-charts.tsx` adicionou wrapper medido por `ResizeObserver`, largura mínima e placeholder estável antes de montar `ResponsiveContainer`.

### P1-002 — Preloads não usados

**Evidência:** warnings repetidos para CSS e `vfit-logo-white.svg` preloaded but not used.

**Impacto:** desperdício de prioridade de rede e possível piora de performance em mobile.

**Correção planejada:** revisar preload vs prefetch, mover para `as=image/style` correto ou remover preloads globais não usados.

**Status 2026-05-09:** corrigido em código para o preload controlado pelo app. `src/app/layout.tsx` removeu o preload global de `vfit-logo-white.svg`, que era baixado em rotas onde o logo não era usado logo após o load. Warnings de `challenges.cloudflare.com` vêm do Turnstile/Cloudflare e não têm origem direta no código do app.

### P1-003 — Auth pages com sessão redirecionam para admin

**Evidência:** `/login` e `/register` com sessão atual exibiram `Painel Admin`.

**Impacto:** comportamento provavelmente correto para usuário autenticado, mas impede QA público com sessão ativa e pode esconder regressões de aquisição.

**Correção planejada:** QA público sempre com contexto limpo/incognito; smoke específico de login/register sem sessão; copy/metadata noindex preservados.

## Responsividade

Viewport testado: mobile `390x844` e desktop `1440x900`.

Rotas críticas não apresentaram overflow horizontal:

- `/`
- `/app-personal-trainer`
- `/nutricionistas`
- `/pricing`
- `/blog`
- `/treinos`
- `/nutricao`
- `/exercicios`
- `/progresso`
- `/dashboard`
- `/dashboard/marketplace`
- `/dashboard/financeiro`

Observação: mobile app tem múltiplos elementos fixed (`fixedCount` 4 no app aluno, 7 no dashboard). Isso exige regressão visual específica para sobreposição de headers, bottom nav, FAB, banners, modais e teclado virtual.

## Estado do repo

### Git

- Branch atual: `main`.
- Base branch: `main`.
- Diff local contra `main`: vazio no momento da auditoria.
- Stash existente: `stash@{0}: WIP on main: 09a887bb infra: VFIT v1.0.0 — Complete CF infrastructure migration`.

Status 2026-05-09: stash antigo documentado no tracking. Ele não foi aplicado nem removido. Qualquer ação futura deve acontecer em branch isolada após `git stash show --stat` e `git stash show --patch`.

### Áreas tocadas recentemente

Arquivos quentes nos últimos 30 dias:

- `public/manifest.json`
- `package.json`
- `lib/version.ts`
- `src/components/navigation/student-header.tsx`
- `src/app/(app)/treinos/page.tsx`
- `src/app/globals.css`
- `docs/CHANGELOG.md`
- `.claude/docs/CHANGELOG.md`
- `src/components/ui/button.tsx`
- `src/app/(app)/nutricao/page.tsx`

Interpretação: há histórico forte de ajustes visuais/deploy/pwa, então o próximo plano precisa de gates de regressão, não só mais polimento visual.

## O que já existe e deve ser reaproveitado

### SEO público

- `src/lib/seo.ts` gera metadata com canonical, Open Graph, Twitter e robots.
- `public/sitemap.xml` e `public/sitemap-blog.xml` já existem.
- Componentes SEO existem: `src/components/seo/json-ld.tsx`, `direct-answer.tsx`, `citable-block.tsx`.
- FAQs estruturadas existem em `src/data/faqs.ts`.

### Skeletons/loading

- `src/components/ui/skeleton.tsx` tem skeleton genérico, card, grid, table, list, chart, profile, form.
- `src/components/ui/page-skeletons.tsx` tem skeletons específicos para dashboard, marketplace, affiliates, financeiro, plans, calendar, AI, admin etc.
- `src/app/dashboard/loading.tsx` existe, mas só há um `loading.tsx` de rota detectado.

### Nutricionistas

- `workers/api/nutritionist.ts` já tem profile, patients, meal plans, nutrition assessments e dashboard.
- `workers/api/students.ts` já tem `POST /students/me/link-nutritionist`.
- Páginas dashboard existem para `/dashboard/meal-plans` e `/dashboard/nutrition-assessments`.
- Landing `/nutricionistas` já existe.

### Marketplace

- `workers/api/payments.ts` já tem marketplace de workout plans: create, list, my plans, my purchases, detail, patch, delete e buy.
- Dashboard já tem `/dashboard/marketplace`, `/dashboard/marketplace/create`, view e checkout.
- Falta transformar isso em **loja de aluno** com navegação própria, biblioteca comprada e recomendação no app aluno.

### Admin/Operação

- `/dashboard/admin/smoke` existe para smoke tokens.
- `/dashboard/admin/design-system` existe como showcase.
- Admin cobre users, personals, payments, exercises, config, smoke e DS.

## Principais lacunas de produto

1. O app do aluno ainda não tem loja integrada, biblioteca de compras e pós-compra claramente visível.
2. Nutricionista existe como API e landing, mas precisa virar jornada completa com onboarding, agenda, cobranças e colaboração com personal.
3. Personal tem muitas superfícies, mas precisa de loops de negócio: lead -> aluno -> treino -> cobrança -> retenção -> upsell.
4. SEO ainda é concentrado em poucas páginas; falta cluster por intenção e páginas programáticas com E-E-A-T.
5. Production readiness ainda depende de validações manuais pendentes.
6. PWA/TWA precisa de política forte para SW/chunks para evitar erro de MIME após deploy.

## Stale diagram audit

Nenhum diagrama ASCII em arquivos tocados foi auditado linha a linha nesta sessão. O plano recomenda uma task específica para varrer diagramas em docs e comentários antes da execução, porque diagramas desatualizados são piores que ausência de diagramas.
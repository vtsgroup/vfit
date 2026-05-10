# VFIT Production Completion Plan

> Criado em 2026-05-09 · Escopo: produto completo, produção real, SEO, aluno, personal, nutricionista, loja, QA, observabilidade e rollout.

## Por que este plano existe

O VFIT já não é um MVP vazio: existe app do aluno, dashboard do personal/admin, marketplace, pagamentos, IA, nutrição, SEO público, PWA/TWA, skeleton system, gamificação, afiliados e integrações Cloudflare/Neon/Asaas/OneSignal. O problema agora é outro: transformar um produto com muitas peças em um sistema completo, confiável, navegável, vendável e pronto para produção sem depender de sorte, sessão específica ou validação manual informal.

Este pacote usa a abordagem **Full Product Completion Program**: ambição alta, mas faseada. A meta é completar o produto como uma plataforma operacional moderna para três personas principais:

- **Personal trainer:** vender, cadastrar, cobrar, prescrever, acompanhar, reter e crescer.
- **Aluno:** treinar, comprar planos, acompanhar progresso, registrar nutrição, receber suporte e permanecer engajado.
- **Nutricionista:** receber pacientes, prescrever planos alimentares, acompanhar evolução e colaborar com personais.

## Evidência usada

- Navegação live em `https://vfit.app.br` em páginas públicas, app do aluno, dashboard, admin, marketplace e rotas de nutrição.
- Sitemaps `public/sitemap.xml` e `public/sitemap-blog.xml`.
- Rotas Next.js em `src/app/**/page.tsx`.
- APIs em `workers/api/*`, especialmente `students.ts`, `nutritionist.ts` e `payments.ts`.
- Skeleton system em `src/components/ui/skeleton.tsx` e `src/components/ui/page-skeletons.tsx`.
- SEO helper em `src/lib/seo.ts`.
- Tracking Ultra v4 em `.claude/plans/vfit-ultra-v4-ux-redesign/TRACKING.md`.
- TODOs existentes em `TODOS.md`.

## Arquivos deste pacote

| Arquivo | Uso |
|---|---|
| `AUDIT.md` | O que foi navegado, estado atual e achados de produção. |
| `PRODUCT-ROADMAP.md` | Roadmap por persona: público, personal, aluno, nutricionista, admin e loja. |
| `PRODUCTION-READINESS.md` | Gates de produção, QA, observabilidade, release, smoke auth, rollback e incident response. |
| `SEO-GROWTH.md` | Plano SEO e aquisição para personal, alunos, nutricionistas, afiliados e conteúdo. |
| `ARCHITECTURE-RISKS.md` | Arquitetura alvo, diagramas, error map, failure modes e riscos técnicos. |
| `DESIGN-UX-REVIEW.md` | Revisão visual/UX do plano, wireframes, estados, IA, a11y, anti-slop e decisões. |
| `TRACKING.md` | Execução por fases, IDs, prioridades, dependências e critérios de aceite. |

## Decisão de escopo

### Em escopo

- Corrigir bloqueadores reais encontrados no crawl live.
- Fechar o app do aluno como experiência completa, não só treino/nutrição isolados.
- Transformar o marketplace atual em **loja dentro do app do aluno**.
- Evoluir nutrição para um produto de nutricionista e colaboração personal + nutri.
- Completar skeletons, empty states, error states e loading states por rota crítica.
- Criar gates objetivos de produção: smoke auth, Lighthouse, Playwright, acessibilidade, visual regression, observabilidade e rollback.
- Ampliar SEO público e programático com clusters por intenção de busca.
- Manter o visual VFIT atual: dark premium, verde como marca, glass/3D/tokens existentes, sem reinventar design system.

### Fora de escopo por agora

- Reescrever stack, trocar Next.js/Workers/Neon ou substituir o design system.
- Criar app nativo completo além do TWA/PWA sem prova de necessidade.
- Rodar deploy ou migrations nesta sessão.
- Ler ou alterar `.env` / `.env.local`.
- Resolver todos os bugs agora. Este pacote é plano e auditoria; execução fica no tracking.

## Diagnóstico executivo

O VFIT tem base suficiente para ser um produto forte, mas ainda não está pronto para produção ampla porque há falhas de runtime, validações finais incompletas e lacunas de produto entre personas.

### P0 antes de qualquer campanha ou lançamento forte

1. **OneSignal com domínio antigo:** live mostra erro `Can only be used on: https://iapersonal.app.br` em `vfit.app.br`.
2. **CSP bloqueando imagens R2:** `/exercicios` tentou acessar `https://images.vfit.app.br/...` e foi bloqueado por `connect-src`.
3. **API do aluno retornando 404:** `/treinos`, `/nutricao`, `/avaliacoes` chamaram `https://api.vfit.app.br/api/v1/students/me` e receberam 404 na sessão testada.
4. **Progresso retornando 500:** `/progresso` chamou `progress/top-exercises?limit=4` e recebeu 500.
5. **Chunk stale/MIME errado:** snapshot anterior registrou `_next/static/chunks/app/(app)/perfil/...js` servido como `text/html`.
6. **Smoke auth bloqueado:** tracking Ultra v4 documenta `npm run smoke:auth:local` falhando por tokens expirados.
7. **QA formal incompleto:** Lighthouse, WCAG formal, teclado, VoiceOver e teste físico mobile ainda pendentes.

### Oportunidade principal

O produto já tem as peças de um ecossistema: personal vende e gerencia, aluno consome e evolui, nutricionista acompanha, admin opera, marketplace monetiza. O plano certo não é adicionar “mais telas”; é fechar o loop:

```text
Aquisição SEO -> cadastro -> onboarding -> primeira vitória -> rotina semanal
      -> compra/renovação -> acompanhamento -> progresso visível -> retenção
      -> indicação/afiliado -> novos profissionais e alunos
```

## Norte de produto

Em 12 meses, o VFIT deve parecer menos “um app com várias features” e mais um **sistema operacional de fitness assistido por IA**:

```text
CURRENT STATE                  THIS PLAN                         12-MONTH IDEAL
Muitas superfícies     ->      Produto conectado por loops  ->    OS de personal + aluno + nutrição
com boa base visual            de valor, QA e monetização          com loja, IA, operação e SEO
```

## Modo de execução recomendado

1. **Stabilize:** consertar P0 live e gates quebrados.
2. **Complete Core:** fechar aluno, personal e nutricionista em jornadas ponta a ponta.
3. **Monetize:** loja do aluno, marketplace, afiliados, planos e checkout sólidos.
4. **Grow:** SEO programático, conteúdo por ICP, referral e métricas.
5. **Operate:** observabilidade, runbooks, QA visual, smoke auth e release train.

## Lake score

Recomendação de completude: **9/10**.

O caminho 10/10 seria construir a plataforma/ecossistema inteira de uma vez. O caminho 9/10 entrega quase todo o valor, mas organiza a execução em ondas que conseguem ir para produção com controle.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | Full Product Completion Program selected before this package. |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | NOT RUN | Codex CLI unavailable in this environment. |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | REQUIRED | Not run yet for this plan; run before implementation. |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES OPEN | score: 5/10 -> 8/10, 7 decisions, 3 deferred, mockups blocked by missing OpenAI key. |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | NOT RUN | Not applicable unless developer-facing API/docs become part of this phase. |

- **UNRESOLVED:** 3 design decisions deferred: approved mockup variant, exact hero media asset, store ranking algorithm.
- **VERDICT:** DESIGN REVIEW COMPLETED WITH CONCERNS. Eng review required before implementation.
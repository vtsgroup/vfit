# VFIT Production Completion — Tracking

> Última atualização: 2026-05-10 · Status: Phase 2 loading.tsx + empty states concluídos · Branch de execução: `phase0-production-stabilization` · Versão live observada: `3.5.9` no app.

## Progresso geral

```text
Fases: 0/9 concluídas
Tasks: 23/127 concluídas
Bloqueadores P0 abertos: 2 + validação runtime publicada pendente
Gate produção: NÃO LIBERADO
```

## Design review status

```text
/plan-design-review: DONE_WITH_CONCERNS
Initial design score: 5/10
Current design score after addendum: 8/10
Reference: DESIGN-UX-REVIEW.md
Mockups: blocked until gstack designer gets OpenAI key via $D setup
Next required review: /plan-eng-review
```

Design decisions from `DESIGN-UX-REVIEW.md` are binding for implementation unless explicitly changed in this tracking file.

## Legenda

- `[ ]` Não iniciado
- `[~]` Em progresso
- `[x]` Concluído
- `[!]` Bloqueado
- `P0` Bloqueia produção/campanha
- `P1` Alto impacto antes de escala
- `P2` Importante para completar produto
- `P3` Otimização/expansão

---

## Phase 0 — Production Stabilization (P0)

Objetivo: remover erros reais vistos no live site antes de ampliar tráfego ou lançar a visão completa.

- [!] **P0.1** Corrigir OneSignal allowed domain para `vfit.app.br` e validar service workers. `P0` — código já usa `vfit.app.br`; bloqueado em configuração externa do OneSignal dashboard.
- [x] **P0.2** Adicionar `images.vfit.app.br` e `videos.vfit.app.br` às diretivas CSP corretas. `P0` — `img-src`, `media-src` e `connect-src` atualizados em `public/_headers`.
- [ ] **P0.3** Validar R2 CORS para imagens/vídeos usados no app. `P0`
- [x] **P0.4** Investigar `/api/v1/students/me` retornando 404 em rotas do aluno. `P0` — root cause provável: admin/super_admin acessando app aluno sem simulação de aluno ativa.
- [x] **P0.5** Definir comportamento explícito para admin/persona simulada acessando app aluno. `P0` — `/students/me` agora retorna erro 400 descritivo para admin sem simulação correta, em vez de 404 genérico.
- [x] **P0.6** Corrigir `/api/v1/progress/top-exercises?limit=4` retornando 500. `P0` — query removida do join em `exercises` no Neon; nomes são buscados no D1 best-effort.
- [x] **P0.7** Criar empty state 200 para progresso sem histórico. `P0` — endpoint preserva `200 { exercises: [] }` quando não há logs.
- [x] **P0.8** Corrigir stale `_next/static` chunk servido como HTML. `P0` — Pages worker agora retorna 404/no-store para asset ausente, sem fallback HTML.
- [x] **P0.9** Revisar cache headers de `_next/static`, `public/sw.js` e fallback. `P0` — SW `v9` invalida caches antigos e descarta respostas HTML cacheadas para JS/CSS.
- [x] **P0.10** Corrigir warning Recharts width/height `-1` em `/dashboard/financeiro`. `P1` — gráficos agora só montam após wrapper medir dimensões positivas.
- [x] **P0.11** Remover ou corrigir preloads não usados de CSS/logo. `P1` — preload global de `vfit-logo-white.svg` removido do root layout; warning restante de Cloudflare challenge é externo.
- [x] **P0.12** Revalidar smoke auth com tokens atuais. `P0` — script direto executado com tokens temporários válidos: 8 passed, 0 failed, 4 skipped por mutações desabilitadas.
- [x] **P0.13** Atualizar evidência em `.claude/docs/archive/legacy-plans/AUTH-SMOKE.generated.md`. `P0`
- [ ] **P0.14** Rodar browser smoke público em contexto sem sessão. `P1`
- [x] **P0.15** Criar issue/runbook para stash antigo `infra: VFIT v1.0.0`, sem aplicar nem remover automaticamente. `P2`
- [x] **P0.16** Destravar UI local de smoke tokens para clique em localhost. `P0` — `pointer-events-none` agora depende de role hidratado, `LazyMotion strict` não derruba mais o dashboard e `SplashScreen` invisível não intercepta cliques.
- [x] **P0.17** Corrigir erros React Query `data undefined` no app aluno local. `P0` — nutrição e progresso agora retornam empty states tipados quando a API vem sem payload.
- [x] **P0.18** Bloquear chamadas aluno/progresso fora da visão efetiva de aluno. `P0` — hooks usam a simulação admin existente para evitar `/students/me` e `/progress/*` em sessão admin sem aluno ativo.
- [x] **P0.19** Sanitizar URLs placeholder de mídia muscular. `P1` — URLs finais como `image_female_url.png` são ignoradas antes de renderizar, evitando 404/ORB em `images.vfit.app.br`.
- [x] **P0.20** Corrigir warnings/scroll horizontal mobile nas rotas públicas. `P1` — dimensões do logo foram alinhadas ao SVG, drawer mobile fechado fica invisível para métricas e o documento bloqueia overflow horizontal.

**Gate Phase 0:** nenhuma rota crítica com console error P0, smoke auth verde, app aluno sem 404/500 nas rotas principais.

### Execução Phase 0 — 2026-05-09

Branch: `phase0-production-stabilization`.

Root causes confirmados:

- CSP: `images.vfit.app.br` estava em `img-src`, mas não em `connect-src`; chamadas via `fetch` eram bloqueadas.
- Progress: `top-exercises` fazia `LEFT JOIN exercises` no Neon, mas o catálogo de exercícios vive no D1.
- Student identity: admin/super_admin sem simulação de aluno ativa passava pelo bypass de role e caía em `NotFoundError('Aluno')`.
- Chunks stale: `public/_worker.js` deixava qualquer asset ausente cair no fallback SPA, servindo HTML para caminhos `.js` antigos.
- Smoke UI: a página aplicava `pointer-events-none` a partir de um helper não assinado reativamente; em paralelo, o dashboard local quebrava antes de renderizar por `LazyMotion strict` enquanto vários componentes ainda usam `motion.*`; depois disso, o `SplashScreen` ficava invisível em `exit`, mas permanecia no DOM como `fixed inset-0 z-9999` com `pointer-events:auto`.
- QA localhost pós-smoke: hooks de nutrição/progresso assumiam `res.data` sempre definido, URLs placeholder de músculo eram tratadas como mídia real, e a sessão admin local disparava queries de app aluno sem simulação ativa.
- Public mobile: o logo usava dimensões intrínsecas divergentes do SVG e elementos full-bleed/decorativos criavam scroll horizontal de página em viewport mobile.

Validação já executada:

- `npm run test -- tests/api/progress.test.ts` ✅
- `npm run type-check -- --project tsconfig.workers.json` ✅
- `npm run type-check && npm run type-check:workers && npm run test -- tests/api/progress.test.ts` ✅
- `npm run type-check` ✅ após correções da UI local de smoke.
- `node scripts/run-auth-smoke.mjs` ✅ com tokens temporários válidos: 8 passed, 0 failed, 4 skipped por mutações desabilitadas.
- `npm run type-check && npm run type-check:workers && npm run test -- tests/api/progress.test.ts` ✅ após correções de QA local em nutrição/progresso/mídia/logo/overflow.
- `npx eslint src/components/landing/navbar.tsx` ✅ após limpeza do estado não usado no logo.
- `npm run build` ✅ build de produção local concluído após correções finais.
- `npx eslint 'src/app/(app)/treinos/page.tsx'` ✅ após First Win em `/treinos`.
- `npm run type-check` ✅ após First Win em `/treinos`.
- `npm run build` ✅ após First Win em `/treinos`; rota `/treinos` exportada com 13 kB / 176 kB first load.
- Browser QA local em `http://localhost:3000` ✅: rotas públicas e app aluno focadas sem console errors, sem 4xx/5xx capturados, sem page errors; page-level horizontal scroll bloqueado (`scrollX` permanece 0).
- Browser QA visual de `/treinos` pós-First Win ✅ via export estático em `http://localhost:3000/treinos.html?firstwin=1`: primeira dobra exibiu “Primeira vitória do dia”, CTA “Começar treino de hoje”, seção “Detalhes do treino de hoje” e `scrollX=0`.
- `npx eslint 'src/app/(app)/progresso/page.tsx' 'src/app/(app)/progresso/loading.tsx' 'src/app/(app)/avaliacoes/loading.tsx' 'src/app/(app)/exercicios/loading.tsx'` ✅ zero warnings após P2.12-P2.17.
- `npm run type-check` ✅ após P2.12-P2.17 (loading.tsx batch + CTA em /progresso).
- `npm run build` ✅ após P2.12-P2.17; export estático gerou 141 HTML files.
- Browser smoke estático em `/treinos`, `/nutricao`, `/avaliacoes`, `/progresso` e `/exercicios` ✅: status 200, textos esperados encontrados, `scrollX=0`, zero page errors. Observação: API live ainda retornou `/progress/top-exercises` 500, esperado antes do deploy do Worker corrigido.
Ainda pendente para liberar gate:

- Configurar `vfit.app.br` como allowed origin no OneSignal dashboard.
- Validar R2 CORS/headers em ambiente publicado.
- Manter tokens temporários renováveis via UI de smoke; o wrapper `npm run smoke:auth:local` ainda carrega `.env.local` e pode sobrescrever tokens frescos por valores antigos.
- Rodar browser smoke público/aluno após deploy ou preview.

Runbook do stash antigo:

- Stash detectado: `stash@{Thu Apr 2 12:19:31 2026}: WIP on main: 09a887bb infra: VFIT v1.0.0 — Complete CF infrastructure migration`.
- Não aplicar e não remover automaticamente.
- Antes de qualquer ação futura: executar `git stash show --stat 'stash@{0}'` e `git stash show --patch 'stash@{0}'` em revisão isolada.
- Se ainda for relevante, criar branch temporária `review/legacy-infra-stash` e aplicar lá; se obsoleto, pedir aprovação explícita antes de dropar.

---

## Phase 1 — QA and Release Gates

Objetivo: transformar validação manual em sistema repetível.

- [ ] **P1.1** Criar matriz Playwright: público, aluno, personal, nutricionista e admin. `P0`
- [ ] **P1.2** Adicionar teste incognito para `/login` e `/register`. `P1`
- [ ] **P1.3** Adicionar teste authenticated student real para `/treinos`, `/nutricao`, `/avaliacoes`, `/progresso`, `/exercicios`. `P0`
- [ ] **P1.4** Adicionar teste personal para alunos, treinos, pagamentos, financeiro, marketplace. `P1`
- [ ] **P1.5** Adicionar teste admin para smoke, config e payments. `P1`
- [ ] **P1.6** Criar visual regression mobile/desktop para rotas críticas. `P1`
- [ ] **P1.7** Definir threshold de screenshot diff e política de aprovação. `P1`
- [ ] **P1.8** Rodar Lighthouse mobile em `/`, `/app-personal-trainer`, `/nutricionistas`, `/pricing`, `/blog`. `P1`
- [ ] **P1.9** Rodar Lighthouse/app-shell em `/treinos`, `/nutricao`, `/dashboard`. `P1`
- [ ] **P1.10** Rodar auditoria WCAG formal. `P1`
- [ ] **P1.11** Rodar teste teclado em auth, checkout, forms e modais. `P1`
- [ ] **P1.12** Rodar VoiceOver/NVDA spot check. `P2`
- [ ] **P1.13** Criar release checklist obrigatório em `plan/` ou `.claude/plans`. `P1`
- [ ] **P1.14** Definir go/no-go objetivo para campanha. `P1`

**Gate Phase 1:** `quality:ci`, smoke auth, browser smoke, visual regression, Lighthouse e acessibilidade com evidência.

---

## Phase 2 — Student App Completion

Objetivo: aluno conseguir treinar, evoluir, comprar, registrar nutrição e entender o que fazer a seguir.

- [ ] **P2.1** Criar superfície de loja no app aluno (`/loja` ou entrada em `/treinos`). `P1`
- [ ] **P2.2** Criar detalhe de plano da loja para aluno. `P1`
- [ ] **P2.3** Criar biblioteca de planos comprados. `P1`
- [ ] **P2.4** Permitir ativar plano comprado no fluxo de treino. `P1`
- [ ] **P2.5** Criar recomendação de planos por objetivo/equipamento/nível. `P2`
- [ ] **P2.6** Garantir compra idempotente e sem duplicidade. `P0`
- [ ] **P2.7** Criar estado “pago, liberando plano” para entrega assíncrona. `P0`
- [ ] **P2.8** Adicionar review/rating verificado pós-compra. `P2`
- [ ] **P2.9** Melhorar `/nutricao` com câmera, barcode, favoritos e histórico alimentar. `P2`
- [ ] **P2.10** Adicionar estados de erro/retry em vínculo com nutricionista. `P1`
- [ ] **P2.11** Fechar fluxo offline/sync para treino ativo. `P1`
- [x] **P2.12** Criar skeleton route-level para `/treinos`. `P1` — `src/app/(app)/treinos/loading.tsx` criado com shimmer do FirstWinCommandCenter.
- [x] **P2.13** Criar skeleton route-level para `/nutricao`. `P1` — `src/app/(app)/nutricao/loading.tsx` criado com shimmer do macro ring + refeições.
- [x] **P2.14** Criar skeleton route-level para `/avaliacoes`. `P1` — `src/app/(app)/avaliacoes/loading.tsx` criado com shimmer header + search + cards.
- [x] **P2.15** Criar skeleton route-level para `/progresso`. `P1` — `src/app/(app)/progresso/loading.tsx` criado com shimmer tabs + KPI grid + gráfico + streak.
- [x] **P2.16** Criar skeleton route-level para `/exercicios`. `P1` — `src/app/(app)/exercicios/loading.tsx` criado com shimmer busca + chips + lista.
- [x] **P2.17** Criar estados vazios com CTA por rota. `P1` — `/treinos` tem CTA "Gerar plano com IA" (FirstWinCommandCenter); `/avaliacoes` tem CTA "Fazer minha avaliação"; `/nutricao` tem CTA "Adicionar Refeição"; `/progresso` ganhou CTA "Ver meu treino de hoje" linkando para `/treinos`; `/exercicios` tem CTA para favoritos vazios.
- [ ] **P2.18** Definir propósito de `/social`: ranking, desafios ou comunidade; remover ruído se não houver tese. `P2`
- [ ] **P2.19** Adicionar analytics de workout_started/completed, meal_logged, store_purchase. `P1`
- [x] **P2.20** Implementar First Win operacional no topo de `/treinos`. `P1` — primeira dobra agora prioriza treino de hoje, progresso/meta/XP, nutrição e próxima ação de evolução de plano.

**Gate Phase 2:** aluno novo consegue entrar, receber plano, treinar, ver progresso, registrar nutrição e comprar/usar plano da loja.

### Execução Phase 2 — 2026-05-10

Primeira entrega de produto/design:

- `/treinos` ganhou o componente `FirstWinCommandCenter`, condensando a primeira dobra em uma ação principal: começar/rever o treino de hoje.
- O cockpit usa dados existentes (`useCurrentPlan`, `useDailyGoal`, `useXPBalance`, `useStreak`, nutrição e logs), sem novo backend e sem inventar métricas.
- A hierarquia visual segue a decisão de design: treino de hoje primeiro, progresso semanal/XP/meta segundo, e evolução de plano/loja como ação posterior.
- As seções antigas de avaliação, personal, gamificação e detalhe do treino permanecem abaixo como suporte, evitando regressão funcional.

Limite conhecido:

- A entrada de loja ainda é teaser/ação de evolução de plano, não a superfície completa de marketplace. P2.1-P2.8 seguem pendentes.

---

## Phase 3 — Personal Trainer OS

Objetivo: personal operar negócio completo no VFIT.

- [ ] **P3.1** Criar pipeline de leads/alunos com status e próxima ação. `P1`
- [ ] **P3.2** Melhorar invite flow com tracking de convite aberto/cadastrado. `P1`
- [ ] **P3.3** Tornar agenda operacional com semana/dia, disponibilidade e lembretes reais. `P1`
- [ ] **P3.4** Resolver TODO-001: proteção contra double booking concorrente. `P0`
- [ ] **P3.5** Planejar TODO-002: editar este/futuros recorrentes. `P2`
- [ ] **P3.6** Migrar schema runtime calendar conforme TODO-003. `P2`
- [ ] **P3.7** Melhorar mensagens com templates e automações. `P2`
- [ ] **P3.8** Criar régua de reengajamento por aluno inativo. `P2`
- [ ] **P3.9** Criar régua de cobrança automática com tom profissional. `P1`
- [ ] **P3.10** Transformar IA em action center com ações graváveis, não só chat. `P1`
- [ ] **P3.11** Melhorar dashboard financeiro com explicabilidade e previsão. `P1`
- [ ] **P3.12** Criar seller analytics do marketplace. `P2`
- [ ] **P3.13** Criar seller checklist para publicar plano vendável. `P2`

**Gate Phase 3:** personal consegue adquirir, cadastrar, prescrever, cobrar, acompanhar e reter sem sair do VFIT.

---

## Phase 4 — Nutritionist OS

Objetivo: nutricionista virar primeira-classe no produto.

- [ ] **P4.1** Criar onboarding frontend para role `nutritionist`. `P1`
- [ ] **P4.2** Criar dashboard específico de nutricionista. `P1`
- [ ] **P4.3** Criar navegação role-aware para nutricionista. `P1`
- [ ] **P4.4** Criar patients list/detail usando `workers/api/nutritionist.ts`. `P1`
- [ ] **P4.5** Criar meal plan builder versionado. `P1`
- [ ] **P4.6** Criar nutrition assessment flow completo. `P1`
- [ ] **P4.7** Criar compartilhamento seguro de dados aluno-personal-nutri. `P0`
- [ ] **P4.8** Criar permissão explícita do aluno para compartilhamento nutricional. `P0`
- [ ] **P4.9** Criar check-ins e ajustes de plano alimentar. `P2`
- [ ] **P4.10** Criar monetização nutri: consulta, pacote, assinatura. `P2`
- [ ] **P4.11** Criar landing de nutri com CTA para cadastro real. `P2`
- [ ] **P4.12** Criar analytics nutritionist_activation. `P2`

**Gate Phase 4:** nutricionista cadastra paciente, cria avaliação, publica plano, acompanha check-in e colabora com aluno/personal com permissão clara.

---

## Phase 5 — Marketplace and Student Store

Objetivo: marketplace virar receita real e produto usado por alunos.

- [ ] **P5.1** Separar conceito de marketplace seller e student store. `P1`
- [ ] **P5.2** Avaliar extração de marketplace de `payments.ts` para router próprio. `P2`
- [ ] **P5.3** Adicionar estados de plan: draft, review, published, unpublished, archived. `P1`
- [ ] **P5.4** Adicionar review/moderação antes de publicar. `P1`
- [ ] **P5.5** Garantir plano comprado imutável/versionado para comprador. `P0`
- [ ] **P5.6** Adicionar refunds/disputes. `P1`
- [ ] **P5.7** Adicionar payout status creator. `P1`
- [ ] **P5.8** Adicionar category pages públicas indexáveis. `P2`
- [ ] **P5.9** Adicionar seller profile público. `P2`
- [ ] **P5.10** Adicionar recomendação baseada em objetivo/equipamento. `P2`
- [ ] **P5.11** Adicionar eventos de funil loja. `P1`

**Gate Phase 5:** aluno compra plano, recebe conteúdo, creator vê venda, admin consegue moderar/reembolsar, dados financeiros reconciliam.

---

## Phase 6 — SEO and Growth Engine

Objetivo: VFIT gerar demanda orgânica qualificada por persona e intenção.

- [ ] **P6.1** Auditar metadata de todas páginas públicas. `P1`
- [ ] **P6.2** Validar schema JSON-LD em home, pricing, blog e ICP pages. `P1`
- [ ] **P6.3** Criar cluster personal trainer software. `P1`
- [ ] **P6.4** Criar cluster app de treino/aluno. `P2`
- [ ] **P6.5** Criar cluster nutricionistas. `P2`
- [ ] **P6.6** Criar cluster cobrança/monetização. `P2`
- [ ] **P6.7** Criar cluster marketplace/loja. `P2`
- [ ] **P6.8** Criar comparativos planilha/WhatsApp/apps. `P2`
- [ ] **P6.9** Criar `sitemap-store.xml` quando loja pública existir. `P2`
- [ ] **P6.10** Criar Search Console dashboard de indexação. `P2`
- [ ] **P6.11** Definir política E-E-A-T para treino/nutrição. `P1`
- [ ] **P6.12** Instrumentar eventos de conversão SEO. `P1`

**Gate Phase 6:** páginas indexáveis têm metadata, schema, internal links, CTA, performance e tracking.

---

## Phase 7 — Mobile, PWA and TWA Polish

Objetivo: app parecer nativo, estável e confiável no celular.

- [ ] **P7.1** Revisar service worker update strategy contra chunks stale. `P0`
- [ ] **P7.2** Testar Android TWA em rotas aluno e auth. `P1`
- [ ] **P7.3** Testar PWA install em iOS/Chrome. `P2`
- [ ] **P7.4** Verificar bottom nav, FAB, header, banners e modais sem sobreposição. `P1`
- [ ] **P7.5** Testar teclado virtual em forms críticos. `P1`
- [ ] **P7.6** Testar offline treino ativo. `P1`
- [ ] **P7.7** Testar push prompt e permissões. `P1`
- [ ] **P7.8** Validar manifest/icons/theme-color. `P2`

**Gate Phase 7:** aluno consegue usar treino principal em mobile com experiência fluida, sem chunks quebrados, sem overlap e com estados offline/push claros.

---

## Phase 8 — Observability, Security and Admin Ops

Objetivo: operar VFIT sem adivinhar.

- [ ] **P8.1** Criar dashboard de API 5xx por rota. `P1`
- [ ] **P8.2** Criar alerta de auth smoke failure. `P0`
- [ ] **P8.3** Criar alerta de payment webhook failures. `P0`
- [ ] **P8.4** Criar alerta de marketplace paid-not-delivered. `P0`
- [ ] **P8.5** Criar alerta de OneSignal init failure. `P1`
- [ ] **P8.6** Criar alerta de CSP violation first-party. `P1`
- [ ] **P8.7** Criar feature flags/kill switches mínimos. `P1`
- [ ] **P8.8** Criar audit log para admin/payment/nutrition sharing. `P1`
- [ ] **P8.9** Criar runbook de incidentes P0. `P1`
- [ ] **P8.10** Criar admin panel de release health. `P2`
- [ ] **P8.11** Threat model de loja e nutrição. `P1`
- [ ] **P8.12** Revisar LGPD para dados nutri/saúde e sharing. `P1`

**Gate Phase 8:** incidentes críticos têm alerta, owner, runbook, dashboard e rollback.

---

## Phase 9 — Monetization and Business Completeness

Objetivo: receita recorrente e marketplace com contabilidade confiável.

- [ ] **P9.1** Revisar planos e limits por persona: personal, nutri, aluno/store. `P2`
- [ ] **P9.2** Unificar nomenclatura de planos nos locais divergentes. `P2`
- [ ] **P9.3** Corrigir settings exibindo `Essencial (Free)` se nomes canônicos forem Grátis/Pro/Pro+/Max. `P2`
- [ ] **P9.4** Criar upgrade prompts contextuais por valor, não bloqueio genérico. `P2`
- [ ] **P9.5** Criar marketplace GMV dashboard. `P2`
- [ ] **P9.6** Criar creator payout reconciliation. `P1`
- [ ] **P9.7** Criar refund/dispute accounting. `P1`
- [ ] **P9.8** Criar affiliate attribution audit. `P2`
- [ ] **P9.9** Criar forecast MRR/churn/inadimplência. `P2`
- [ ] **P9.10** Criar experimentos de pricing por plano anual/mensal. `P3`

**Gate Phase 9:** money movement tem reconciliação, estados explícitos e dashboard confiável.

---

## Known dependencies from existing TODOs

- **TODO-001** calendar DB-level conflict protection: required before serious agenda launch.
- **TODO-002** edit recurring future events: required for mature calendar UX.
- **TODO-003** calendar migrations: needed to avoid runtime DDL cold-start risk.
- **TODO-005** rollout runbook: folded into Phase 1/8.
- **TODO-006** visual regression pipeline: folded into Phase 1.
- **TODO-007** secondary button feature flag: generalized into feature flag strategy.

---

## Launch readiness scorecard

| Area | Current | Target | Status |
|---|---:|---:|---|
| Public pages load | 8/10 | 10/10 | P1: good base |
| Student app stability | 5/10 | 9/10 | P0 blockers |
| Personal dashboard | 7/10 | 9/10 | needs loops/QA |
| Nutritionist product | 4/10 | 9/10 | backend seed exists |
| Marketplace/store | 4/10 | 9/10 | seller exists, student store missing |
| SEO engine | 5/10 | 9/10 | foundations exist, scale missing |
| Production QA | 4/10 | 10/10 | smoke/visual/a11y gaps |
| Observability | 4/10 | 9/10 | needs dashboards/alerts |
| Mobile/PWA/TWA | 6/10 | 9/10 | needs SW/chunk/push validation |

## Completion summary template

```text
+====================================================================+
|          VFIT PRODUCTION COMPLETION — STATUS SUMMARY                |
+====================================================================+
| Phase 0 Stabilization | ___/15 | P0 blockers open: ___             |
| Phase 1 QA Gates      | ___/14 | Gate production: YES/NO            |
| Phase 2 Student App   | ___/19 | Store usable: YES/NO               |
| Phase 3 Personal OS   | ___/13 | Business loop complete: YES/NO     |
| Phase 4 Nutritionist  | ___/12 | Nutri role complete: YES/NO        |
| Phase 5 Marketplace   | ___/11 | Paid delivery safe: YES/NO         |
| Phase 6 SEO/Growth    | ___/12 | SEO clusters live: ___             |
| Phase 7 Mobile/PWA    | ___/8  | TWA/PWA smoke green: YES/NO        |
| Phase 8 Ops/Security  | ___/12 | Alerts/runbooks live: YES/NO       |
| Phase 9 Monetization  | ___/10 | Reconciliation ready: YES/NO       |
+--------------------------------------------------------------------+
| Production verdict    | NOT READY / READY WITH CONCERNS / READY     |
+====================================================================+
```

## First execution recommendation

Start with **Phase 0**, not design polish. The product has enough visual quality to continue, but production trust is currently limited by real runtime errors and missing QA evidence.

Recommended first work package:

1. Fix OneSignal domain.
2. Fix CSP/R2 images.
3. Fix student identity 404 and progress 500.
4. Fix stale chunk/SW/cache behavior.
5. Re-run smoke auth with valid tokens.
6. Add Playwright smoke covering those exact failures.

Only after this should the team invest in store, SEO expansion or nutricionista portal at scale.
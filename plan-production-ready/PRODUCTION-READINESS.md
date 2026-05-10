# Production Readiness Plan

## Regra de ouro

Produção não é “build passou”. Produção é: usuário consegue entrar, usar, pagar, receber, falhar de forma compreensível, e a equipe consegue ver e corrigir o problema sem adivinhar.

## Release gate mínimo

Nenhum lançamento forte, campanha, tráfego pago ou abertura ampla deve acontecer sem este gate verde:

```text
Code quality     -> npm run type-check, npm run lint, npm run test
Build            -> npm run build
Auth smoke       -> npm run smoke:auth:local com tokens válidos
Browser smoke    -> Playwright público + aluno + personal + admin
Visual           -> screenshots mobile/desktop em rotas críticas
SEO              -> sitemap, metadata, canonical, robots, schema
Perf             -> Lighthouse/Core Web Vitals em rotas públicas e app shell
Security         -> CSP, auth boundaries, no secrets, payment sanity
Observability    -> Sentry/analytics/logs/alerts ativos
Rollback         -> versão anterior e kill switches conhecidos
```

## P0 blockers before production push

### P0-001 — OneSignal domain mismatch

**Current:** SDK reclama que só pode ser usado em `https://iapersonal.app.br`.

**Target:** OneSignal inicializa em `https://vfit.app.br` sem console error.

**Acceptance:**

- `vfit.app.br` cadastrado como allowed origin no OneSignal.
- Service workers `OneSignalSDK.sw.js` e `OneSignalSDKWorker.js` servidos com escopo correto.
- Smoke em browser verifica `window.OneSignalDeferred` init sem erro.
- Push prompt/subscribe testado em desktop Chrome e Android TWA.

### P0-002 — CSP/R2 image domain

**Current:** `images.vfit.app.br` bloqueado por CSP em `/exercicios`.

**Target:** imagens R2 renderizam sem violation.

**Acceptance:**

- `images.vfit.app.br` em `img-src`.
- `videos.vfit.app.br` em `media-src`.
- Domínios em `connect-src` quando a UI usa `fetch` para validar assets.
- R2 CORS permite origins esperados.
- Browser smoke de `/exercicios` sem CSP error.

### P0-003 — Student identity endpoint

**Current:** app aluno chama `/api/v1/students/me` e recebe 404 na sessão testada.

**Target:** comportamento explícito por role.

**Acceptance:**

- Token de student real retorna 200 com payload completo.
- Token de personal/admin em rota aluno retorna redirect/simulation explícito ou mensagem controlada.
- UI não faz chamadas repetidas que terminam em 404 silencioso.
- React Query auth guard preservado.

### P0-004 — Progress 500

**Current:** `/api/v1/progress/top-exercises?limit=4` retorna 500.

**Target:** rota retorna 200 com lista ou empty state estruturado.

**Acceptance:**

- Usuário sem treino retorna `[]`, não 500.
- Joins toleram exercícios sem media/dados agregados.
- Erros DB logam requestId, userId e query context.
- Teste cobre no-data, malformed data e student sem histórico.

### P0-005 — Stale chunks / MIME text-html

**Current:** chunk `_next/static/...js` para `/perfil` serviu `text/html`.

**Target:** assets versionados nunca caem em HTML fallback.

**Acceptance:**

- `_next/static/*` com cache immutable e content-type correto.
- Fallback SPA não intercepta assets estáticos.
- Service worker invalida cache por versão.
- Deploy canary acessa rotas app após novo build e sem reload antigo quebrado.

### P0-006 — Smoke auth expirado

**Current:** tracking Ultra v4 registra smoke auth falhando por tokens expirados.

**Target:** smoke auth vira gate confiável.

**Acceptance:**

- `SMOKE_PERSONAL_TOKEN` e `SMOKE_STUDENT_TOKEN` renováveis por script/admin smoke.
- `.claude/docs/archive/legacy-plans/AUTH-SMOKE.generated.md` atualizado a cada QA final.
- Falha bloqueia deploy/campanha.

## Browser smoke matrix

### Public incognito

```text
/                         -> landing, H1, CTAs, cookie banner
/app-personal-trainer     -> ICP personal, pricing CTA
/nutricionistas           -> ICP nutri, CTA, schema
/afiliados                -> commission explanation
/pricing                  -> plan cards, checkout CTA
/blog                     -> listing, posts, internal links
/status                   -> service statuses
/login                    -> no session, auth form, no admin redirect
/register                 -> no session, user choice, Turnstile behavior
```

### Student authenticated

```text
/treinos        -> today plan, templates, empty state, API 200
/nutricao       -> macros, meals, nutritionist link
/avaliacoes     -> list, new assessment CTA
/progresso      -> streaks, top exercises, charts no 500
/exercicios     -> images loaded, no CSP
/ia             -> actions available
/plano          -> current plan and edit/settings
/loja           -> store entry, recommended plans
/perfil         -> settings, subscription, notifications
```

### Personal authenticated

```text
/dashboard/students          -> list, invite, detail
/dashboard/workouts          -> list, create, AI generate
/dashboard/calendar          -> availability, recurrence, conflict
/dashboard/assessments       -> create, share, PDF
/dashboard/payments          -> create, status, subscription
/dashboard/financeiro        -> charts dimensions stable
/dashboard/messages          -> conversation list and empty state
/dashboard/marketplace       -> seller flow
/dashboard/ai                -> action center
```

### Nutritionist authenticated

```text
/dashboard/nutritionist or role route -> dashboard
/dashboard/patients                   -> list/create/detail
/dashboard/meal-plans                 -> create/edit/version
/dashboard/nutrition-assessments      -> create/history
/dashboard/messages                   -> patient communication
/dashboard/payments                   -> consultations/plans
```

### Admin

```text
/dashboard/admin/users
/dashboard/admin/personals
/dashboard/admin/payments
/dashboard/admin/exercises
/dashboard/admin/config
/dashboard/admin/smoke
/dashboard/admin/design-system
```

## Observability

### Logs

Every critical route should log structured events:

```text
event_name, request_id, user_id, user_type, route, status, duration_ms,
provider, external_id, error_class, error_code, safe_context
```

Never log secrets, tokens, card data, raw auth headers, full CPF, or sensitive health notes.

### Metrics

Minimum dashboard panels:

- API 5xx by route.
- API p95/p99 latency by route.
- Auth 401/403/404 by route and user_type.
- Payment webhook success/failure.
- Asaas API latency/failure.
- OneSignal init/subscription errors.
- CSP violation count.
- Marketplace checkout success rate.
- AI generation success/failure/refusal/malformed response.
- Smoke auth last status.
- Current deployed version.

### Alerts

- Any payment webhook 5xx spike.
- Auth smoke failure.
- `/health` down for 2 consecutive checks.
- `/students/me` 404 > threshold for student tokens.
- `/progress/*` 500 > threshold.
- OneSignal init errors on production.
- CSP violations involving required first-party domains.
- Marketplace purchase failures.

## Feature flags / kill switches

Required flags:

- `PUSH_NOTIFICATIONS_ENABLED`
- `MARKETPLACE_PURCHASES_ENABLED`
- `STUDENT_STORE_ENABLED`
- `NUTRITIONIST_PORTAL_ENABLED`
- `AI_GENERATORS_ENABLED`
- `PAYMENT_SUBSCRIPTIONS_ENABLED`
- `PUBLIC_SEO_EXPERIMENTS_ENABLED`
- `NEW_SERVICE_WORKER_ENABLED`

Kill switch behavior:

- UI hides entry points.
- API returns structured 503/feature-disabled.
- Admin shows current flag state.
- Logs include feature flag value.

## Rollout sequence

```text
1. Fix P0 runtime issues.
2. Add smoke coverage for those exact issues.
3. Ship behind flags where user-facing risk exists.
4. Run browser smoke on production after deploy.
5. Canary 5-10 real users or internal accounts.
6. Monitor 24h: errors, auth, checkout, push, web vitals.
7. Open broader traffic or campaign.
```

## Rollback flowchart

```text
Issue detected
  |
  v
Is it config/flag controlled?
  |-- yes -> disable flag -> verify smoke -> monitor
  |
  no
  v
Is it frontend-only?
  |-- yes -> rollback Pages deploy or patch hotfix -> verify public/app routes
  |
  no
  v
Is it Worker/API?
  |-- yes -> rollback Worker deploy -> verify /health + smoke auth + affected route
  |
  no
  v
Is DB migration involved?
  |-- yes -> stop writes if needed -> run rollback plan -> restore/repair data -> incident report
```

## Incident response

### P0 incident definition

- Login broken for real users.
- Payment creation/webhook broken.
- Student app cannot load core routes.
- Data leakage or authorization issue.
- Marketplace purchase creates wrong access or money movement.
- Production API down.

### First 15 minutes

1. Freeze deploys.
2. Capture request IDs and impacted routes.
3. Check latest deploy version and diff.
4. Toggle kill switch if available.
5. Rollback if no safe flag exists.
6. Update operational channel.

### First hour

1. Root cause note.
2. Regression test added.
3. User impact estimate.
4. Data repair plan if needed.
5. Post-incident TODO or fix branch.

## QA tiers

### Quick gate

- P0 route smoke.
- Auth smoke.
- Payment smoke with non-real/safe test path only.
- OneSignal no init error.
- CSP no blocker.

### Full gate

- All Quick.
- Lighthouse public + app shell.
- Playwright E2E for public, student, personal, admin.
- Visual regression mobile/desktop.
- Keyboard navigation.
- VoiceOver/NVDA spot check.
- Network throttling and offline for PWA.

### Release candidate gate

- All Full.
- Load baseline.
- Sentry/no-console-error pass.
- Payment reconciliation.
- Marketplace purchase flow.
- Nutritionist collaboration flow.
- TWA smoke on Android.

## Production definition of done

A feature is production-ready only when it has:

- Clear owner and user outcome.
- Happy path, empty path, nil path and upstream error path.
- Loading, empty, error, success and partial states.
- Auth/authorization tests.
- Observability: logs + metrics + alert when needed.
- Rollback/kill switch if risky.
- Documentation in the plan/tracking docs.
- Browser evidence on mobile and desktop.
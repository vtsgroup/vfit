# Design UX Review - VFIT Production Ready

> Skill: `/plan-design-review` · Data: 2026-05-09 · Escopo: revisar a experiencia visual/UX planejada antes da implementacao · Pasta alvo: `plan-production-ready/`.

## Status

```text
Status: DONE_WITH_CONCERNS
Initial design score: 5/10
Final plan design score after this addendum: 8/10
Mockups: attempted, blocked by missing OpenAI key for gstack designer
Outside voices: Claude subagent only; Codex CLI unavailable
```

## System Audit

### UI Scope

Este plano tem UI scope alto. A revisao cobre:

- Public pages e SEO hubs.
- App aluno: `/treinos`, `/nutricao`, `/avaliacoes`, `/progresso`, `/exercicios`, `/ia`, `/perfil`, `/plano`, `/social` e futura `/loja`.
- Dashboard personal: alunos, treinos, agenda, avaliacoes, pagamentos, financeiro, IA, mensagens, marketplace, planos e afiliados.
- Portal nutricionista: onboarding, patients, meal plans, assessments, check-ins e colaboracao com personal.
- Admin/ops: smoke, config, payments, users, exercises e status operacional.
- Estados de loading, empty, error, success e partial.
- Mobile/PWA/TWA, teclado, screen reader, touch targets e regressao visual.

### DESIGN.md Status

Nao existe `DESIGN.md` no repositorio. A revisao usa como fonte de verdade o Design System ja documentado em `.claude/docs/DESIGN-SYSTEM.md`.

### What Already Exists

O plano deve reaproveitar estes padroes existentes:

| Area | Reuso obrigatorio |
|---|---|
| CTAs e acoes | `Button` de `@/components/ui/button`, com `loading` para mutacoes. |
| Iconografia | `DSIcon`, sem imports diretos de lucide nos novos componentes. |
| Skeletons | `src/components/ui/skeleton.tsx` e `src/components/ui/page-skeletons.tsx`. |
| App aluno | `student-header`, `bottom-navigation`, `student-fab-menu`. |
| Marketplace atual | `/dashboard/marketplace`, view, create e checkout como base do seller flow. |
| SEO | `buildSeoMetadata`, `JsonLd`, `DirectAnswer`, `CitableBlock`, FAQs e sitemaps atuais. |
| Visual | VFIT dark premium, brand green, slate secondary, glass/3D com moderacao. |

### Design Tooling

O gstack designer esta instalado, mas a geracao de mockups falhou porque nao ha chave configurada:

```text
No OpenAI API key found.
Run: $D setup
or save to ~/.gstack/openai.json
or set OPENAI_API_KEY
```

Decisao: seguir com review text-first, wireframes ASCII e especificacoes no plano. Rodar `$D setup` depois para gerar mockups reais antes da implementacao visual.

## Outside Voice Summary

Codex CLI nao esta disponivel neste ambiente (`CODEX_NOT_AVAILABLE`). Um subagente independente revisou o pacote e retornou estes achados principais:

| Finding | Severity | Integrated fix |
|---|---|---|
| Student app sem narrativa treino -> execucao -> progresso -> loja | HIGH | Adicionado spine de IA e first-win. |
| Personal dashboard com muitas entradas sem prioridade | HIGH | Adicionado Personal OS home com next actions. |
| Nutritionist API-first, sem jornada visual | CRITICAL | Adicionado onboarding e dashboard wireframe. |
| Store/marketplace sem discovery e social proof | HIGH | Adicionado fluxo loja: discovery, detail, purchase, library. |
| Fluxos criticos sem estados de erro/retry claros | CRITICAL | Adicionadas state tables por feature. |
| Fixed elements mobile podem competir | HIGH | Adicionada hierarquia mobile fixa. |
| WCAG/teclado/screen reader ainda nao travados como comportamento | HIGH | Adicionadas regras de gate e cenarios minimos. |

## Decision Log

| Decision | Choice | Why |
|---|---|---|
| D1 - Review scope | Full 7-pass review | O plano e multi-persona; reduzir escopo deixaria conexoes importantes sem design. |
| D2 - Outside voices | Run outside voice | Plano amplo e visualmente sensivel; segunda leitura reduz ponto cego. |
| Mockup fallback | Text-first specs now, real mockups after `$D setup` | Designer instalado, mas sem API key. Nao bloquear o plano por credencial local. |
| `/social` default | Weekly challenges, not feed | Feed amplo cria superficie social sem tese; challenges conectam XP, streak e retencao. |
| Student store entry | Store lives inside `/treinos` first, with `/loja` as deeper route | Aluno compra melhor quando a recomendacao aparece no contexto de treino. |
| Nutritionist IA | Patient timeline, not generic dashboard | Nutricionista pensa por paciente, check-in e evolucao, nao por cards abstratos. |

## Pass 1 - Information Architecture

**Rating:** 5/10 -> 8.5/10

### Gap

O plano lista muitas telas, mas nao define o que o usuario ve primeiro, segundo e terceiro. Sem isso, implementadores tendem a criar mosaicos de cards com pesos iguais.

### Fix

Adotar uma hierarquia de tres itens por superficie critica.

#### Student App IA

```text
Mobile /treinos
+------------------------------------------------+
| Header: nome, streak, notificacoes             |
+------------------------------------------------+
| 1. Treino de hoje                              |
|    CTA primario: Comecar treino                |
|    Contexto: duracao, foco, equipamento        |
+------------------------------------------------+
| 2. Progresso da semana                         |
|    XP, streak, proximo marco, alerta de ajuste |
+------------------------------------------------+
| 3. Planos recomendados                         |
|    3 cards max: objetivo, preco, creator proof |
+------------------------------------------------+
| Bottom nav: Treinos, Nutricao, Progresso, Loja |
+------------------------------------------------+
```

Top 3 only:

1. O que fazer agora: treino de hoje.
2. Por que continuar: progresso/streak.
3. O que comprar/expandir: planos relevantes.

#### Student Store IA

```text
Mobile /loja
+------------------------------------------------+
| Header: Loja VFIT + busca                      |
+------------------------------------------------+
| 1. Recomendado para seu objetivo               |
|    Plano unico destacado + CTA Ver detalhes    |
+------------------------------------------------+
| 2. Filtros rapidos                             |
|    Objetivo, Equipamento, Duracao, Nivel       |
+------------------------------------------------+
| 3. Lista densa de planos                       |
|    Creator, rating real, amostra, preco        |
+------------------------------------------------+
| Library entry: Meus planos comprados           |
+------------------------------------------------+
```

#### Personal OS Home IA

```text
Desktop /dashboard
+------------------+-------------------------------------+
| Sidebar          | 1. Next actions this week            |
|                  |    max 3 actions, one-click          |
|                  +-------------------------------------+
|                  | 2. Business pulse                    |
|                  |    revenue, overdue, inactive        |
|                  +-------------------------------------+
|                  | 3. Work queue                        |
|                  |    workouts, assessments, messages   |
+------------------+-------------------------------------+
```

#### Nutritionist Portal IA

```text
Desktop /dashboard/nutritionist
+------------------+-------------------------------------+
| Sidebar          | 1. Patients needing attention        |
|                  |    check-ins, missing logs, alerts   |
|                  +-------------------------------------+
|                  | 2. Patient timeline                  |
|                  |    meals, assessment, workout context|
|                  +-------------------------------------+
|                  | 3. Meal plan workbench               |
|                  |    drafts, versions, publishing      |
+------------------+-------------------------------------+
```

#### Public SEO Hub IA

```text
First viewport
+------------------------------------------------+
| Brand/product signal: VFIT                     |
| Headline literal by persona                    |
| One sentence value prop                        |
| CTA group: Comecar gratis / Ver para alunos    |
| Real product visual: app/dashboard screenshot  |
| Hint of next proof section                     |
+------------------------------------------------+
```

Hard rule: no 3-column feature grid as first impression.

## Pass 2 - Interaction State Coverage

**Rating:** 5/10 -> 8.5/10

### Feature State Table

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Student `/treinos` | Route skeleton with today-card dimensions | "Seu primeiro treino esta pronto para ser criado" + CTA | Inline retry + support if identity missing | Workout card active + start CTA | Offline workout with sync pending badge |
| Student store | Plan-card skeletons matching final cards | "Ainda nao ha planos para este objetivo" + change filters | Retry list + preserve filters | Purchased plan enters library | Payment confirmed, delivery pending |
| Store purchase | `Button loading` + locked secondary actions | Not applicable | Payment failed with method-specific retry | Success screen + activate plan | Paid but not delivered: recovery state |
| Nutritionist link | Validating code state | "Voce ainda nao vinculou nutricionista" + code input | Invalid/expired/already linked copy | Linked card with nutritionist identity | Request sent, waiting confirmation if approval added |
| Nutritionist patients | Patient-list skeleton | "Nenhum paciente ainda" + show referral code | Retry + contact support for permission mismatch | Patient list with attention markers | Patient exists but logs missing |
| Personal next actions | Skeleton action rows | "Tudo em dia" + create next plan CTA | Retry queue | Action dismissed/completed | Some providers down, local tasks still visible |
| Finance charts | Fixed-height chart skeleton | "Sem dados financeiros ainda" + create charge CTA | Chart error with retry | Chart with forecast and detail link | Provider delayed: stale-data badge |
| Public SEO page | Hero visual skeleton or immediate static render | Not applicable | No client-blocking error; static content remains | CTA and schema valid | Some dynamic trust counts hidden if unavailable |

### Critical Flow State Machines

#### Link Nutritionist

```text
READY -> VALIDATING -> LINKED
                  |-> INVALID_CODE
                  |-> ALREADY_LINKED
                  |-> PERMISSION_BLOCKED
                  |-> NETWORK_RETRY
```

User copy:

- Invalid code: "Codigo invalido ou expirado. Confira com seu nutricionista e tente novamente."
- Already linked: "Voce ja esta vinculado a {name}. Para trocar, confirme primeiro."
- Permission blocked: "Este nutricionista nao esta aceitando novos pacientes por codigo agora."

#### Store Purchase

```text
IDLE -> PROCESSING -> PAYMENT_PENDING -> PURCHASED -> ACTIVATED
                   |-> FAILED_RETRY
                   |-> PAID_DELIVERY_PENDING
                   |-> REFUNDED_OR_DISPUTED
```

User copy:

- Pending: "Seu pagamento esta sendo processado. Avisaremos quando o plano liberar."
- Delivery pending: "Pagamento confirmado. Estamos liberando seu plano."
- Failed: "Nao foi possivel concluir. Tente outro metodo ou repita em alguns segundos."

#### Offline Workout

```text
SYNCED -> OFFLINE_ACTIVE -> SYNC_PENDING -> SYNCED
                                      |-> CONFLICT_REVIEW
                                      |-> FAILED_RETRY
```

Mobile behavior: while offline, show persistent compact banner above bottom nav; hide non-critical promo/store banners.

## Pass 3 - User Journey and Emotional Arc

**Rating:** 5/10 -> 8/10

### Student Arc

| Time | User does | User should feel | UI support |
|---|---|---|---|
| Day 1 | Completes onboarding | "This plan is made for me" | Goal/equipment/level selection, immediate first workout card. |
| First workout | Starts and completes treino | "I can do this" | Simple execution UI, rep/timer clarity, completion celebration. |
| Week 1 | Returns to app | "I am building a habit" | Streak, next workout, visible micro-progress. |
| Week 4 | Checks progress | "This is working" | Delta in volume, measures, photos or consistency chart. |
| Week 12 | Finishes cycle | "I changed" | Before/after, summary, next plan recommendation. |

### Personal Arc

| Time | User does | User should feel | UI support |
|---|---|---|---|
| Day 1 | Adds first student | "My business is organized" | Invite flow with clear next step. |
| Week 1 | Sends workouts and charges | "Money is coming in" | Next actions and payment status on home. |
| Month 1 | Reviews retention | "I can manage this" | Inactive/unpaid/renewal queue. |
| Month 3 | Scales templates/marketplace | "I can grow" | Seller analytics and reusable plans. |

### Nutritionist Arc

| Time | User does | User should feel | UI support |
|---|---|---|---|
| Day 1 | Shares link code | "I can onboard patients" | Empty state with copyable code and instructions. |
| Week 1 | Publishes meal plan | "I prescribed something useful" | Meal plan builder with publish state. |
| Week 4 | Reviews check-in | "My patient improved" | Patient timeline with logs and progress. |
| Month 3 | Collaborates with personal | "The team setup works" | Shared read-only workout context and message action. |

## Pass 4 - AI Slop Risk

**Rating:** 6/10 -> 8.5/10

### Classifier

| Surface | Rule set |
|---|---|
| Public SEO hubs | Marketing/Landing |
| App aluno | App UI |
| Dashboard personal | App UI |
| Portal nutricionista | App UI |
| Marketplace public categories | Hybrid |
| Store inside app | App UI |

### Hard Rules for Implementation

- No generic 3-column icon feature grid as the first public impression.
- No dashboard made only of equal cards. Each role needs a primary workspace.
- No hero card. Public hero must be one composition with product signal visible.
- No purple/blue gradient theme. Preserve VFIT green and dark premium.
- No decorative icons in colored circles unless the icon is the actual control.
- Cards earn existence: plan cards, patient rows, action queue items and repeated marketplace items are allowed; decorative section cards are not.
- Copy must use product language: "Comecar treino", "Liberar plano", "Enviar lembrete", "Vincular paciente". Avoid mood copy that does not create action.

### Visual Direction by Surface

| Surface | Direction |
|---|---|
| Student app | Fast mobile task surface. One big action, compact progress, store only when relevant. |
| Store | Discovery with trust. Creator proof, sample workout, rating, price and one CTA. |
| Personal | Business command center. Next actions and money status first. |
| Nutritionist | Patient timeline. Check-ins and meal plan workbench first. |
| Public SEO | Brand-first product proof. Real UI signal, not abstract illustration. |

## Pass 5 - Design System Alignment

**Rating:** 6/10 -> 8.5/10

### Required Components and Tokens

| Need | Required implementation direction |
|---|---|
| Text CTAs | `Button`, never raw CTA `<button>`. |
| Mutations | `Button loading` with disabled state and clear loading copy. |
| Icons | `DSIcon`, not direct lucide imports. |
| Primary action | `variant="primary"` or approved domain variant. |
| Secondary action | Slate blue-gray `secondary`, not old generic style. |
| Destructive action | `danger` or `ghost-danger`, never plain red text only. |
| Status | Color plus icon/text, not color alone. |
| Skeleton | Existing skeleton components first, route-level `loading.tsx` where needed. |
| Cards | Radius 8px or local DS default; no bubbly uniform radius everywhere. |
| Light mode text | Do not use `text-brand-primary` or `text-muted` for informative body copy on white. |

### Design System Debt to Gate

- Audit `text-muted` in informative labels/help text.
- Validate all primary mobile controls are at least 44px touch targets.
- Add visual regression for Button variants and charts.
- Verify secondary button migration in all important CTA contexts.

## Pass 6 - Responsive and Accessibility

**Rating:** 4.5/10 -> 8/10

### Viewport Rules

| Viewport | Layout rule |
|---|---|
| 360-390px mobile | One primary action per screen. Bottom nav max 5 items. Promo/store surfaces compact and dismissible. |
| 390-430px mobile | Allow secondary progress/store module below fold. Keep CTAs thumb-reachable. |
| Tablet | Two-column app layout only when both columns have independent jobs. |
| Desktop dashboard | Sidebar + primary workspace + secondary context. Do not center mobile cards in a wide blank canvas. |
| Public desktop | Full-bleed hero composition with visible next section hint. |

### Fixed Element Stack

```text
Mobile allowed stack:
1. Header, 56px
2. Content, scrollable
3. Optional inline alert, not fixed unless P0
4. Bottom nav, 56px
5. One FAB max, above bottom nav

When keyboard opens:
- Hide FAB
- Hide bottom nav if it overlaps input
- Preserve focused field visibility
```

### A11y Gates

- Keyboard-only test for auth, checkout, nutritionist link, meal plan builder and modals.
- Visible focus ring on every actionable element.
- Labels must remain visible when form fields have content; placeholder-only labels are blocked.
- Invalid code and payment errors must be announced via accessible error regions.
- Body text contrast >= 4.5:1.
- Touch targets >= 44x44px.
- Screen reader scenarios: login, start workout, buy plan, link nutritionist, publish meal plan.

## Pass 7 - Unresolved Design Decisions

**Rating:** 4/10 -> 8/10

### Resolved in This Review

| Decision | Resolution |
|---|---|
| Where does student store enter? | Primary entry inside `/treinos`, deeper route `/loja`. |
| What is `/social`? | Weekly challenges linked to XP/streaks. No broad feed for this phase. |
| How does nutritionist dashboard differ? | Patient timeline + attention queue, not generic KPI grid. |
| How does personal dashboard start? | Next actions and business pulse before feature navigation. |
| What state model governs purchase? | Processing -> payment pending -> purchased -> activated, with recovery state. |
| What state model governs nutritionist link? | Ready -> validating -> linked or specific user-visible error. |
| What is public hero rule? | Brand/product first, real UI signal, no hero card or generic feature grid. |

### Deferred

| Decision | Why deferred | Required before build |
|---|---|---|
| Exact visual mockup variant | `$D variants` blocked by missing OpenAI key. | Run `$D setup`, regenerate variants, approve one per critical surface. |
| Exact hero media asset | Needs product screenshot or generated bitmap matching final product UI. | Capture/generate media after first UI implementation or mockup approval. |
| Exact store ranking algorithm | Product/data decision, not pure visual design. | Define ranking inputs before public marketplace launch. |

## Store UX Spec

### Discovery

```text
Entry from /treinos:
Treino de hoje -> "Quer variar seu treino?" -> 3 recommended plans -> Ver loja

/loja:
Recommended for your goal
Filters: Objetivo, Equipamento, Nivel, Duracao, Preco
Sections: Recomendados, Populares, Novos, Do seu personal
```

Plan card contents:

- Creator avatar + name.
- Plan title and objective.
- Duration in weeks.
- Equipment needed.
- Rating and verified purchase count when real.
- Price and CTA.
- Small preview: first workout focus.

### Detail

```text
Plan Detail
1. Title + creator trust
2. What you get: weeks, workouts, level, equipment
3. Sample: Week 1 Day 1 preview
4. Reviews from verified buyers
5. Price and CTA sticky on mobile
```

### Post Purchase

```text
Success -> Library -> Activate plan -> Appears in /treinos
```

If payment succeeds but delivery is delayed, show recovery state instead of success pretending everything is done.

## Nutritionist UX Spec

### Onboarding

```text
Signup role selection -> Create nutritionist profile -> Share patient code
-> Empty patients state -> First patient detail -> First meal plan
```

### Dashboard

```text
1. Patients needing attention
2. Upcoming check-ins
3. Meal plan drafts
4. Patient progress timeline
5. Collaboration messages with personal
```

### Patient Detail

Visible:

- Student name and goal.
- Nutrition logs and check-ins.
- Assessments/metrics user has consented to share.
- Personal trainer and read-only workout context if linked.
- Message personal action.

Not visible by default:

- Private personal notes.
- Payment details unrelated to nutritionist relationship.
- Workout editing controls.

## Personal OS UX Spec

### Home

```text
Next actions this week
├─ 3 students unpaid -> Send reminder
├─ 5 inactive students -> Send check-in
└─ 2 workouts missing -> Create now

Business pulse
├─ Due this week
├─ Overdue
├─ Active subscriptions
└─ Renewal risk

Work queue
├─ Assessments due
├─ Messages waiting
└─ Marketplace plan review
```

Rule: max 3 top actions. Everything else moves to secondary lists.

## Public SEO UX Spec

### Hero Rules

- H1 must be literal offer/persona, not vague slogan.
- VFIT brand/product visible in first viewport.
- One primary CTA and one secondary CTA max.
- Real product signal: screenshot/mockup/video still of app/dashboard.
- Hint of next section visible on mobile and desktop.
- No decorative card shell around hero text.

### Section Rules

- One job per section.
- Each section headline must be enough to understand the page by scanning.
- Use proof close to claim: screenshots, numbers, quotes, real workflow snippets.
- Pricing/contact cannot be hidden behind vague copy.

## NOT in Scope

- Rebranding VFIT.
- Replacing the design system.
- Building native iOS/Android outside the current PWA/TWA path.
- Creating a broad social feed in Phase 2.
- Creating fake reviews, fake ratings or fake marketplace proof.
- Implementing code during this design review.

## TODO Proposals

These are not added to `TODOS.md` yet because the user was unavailable for individual TODO approval during the skill run.

| TODO | Why it matters | Suggested destination |
|---|---|---|
| Configure gstack designer with `$D setup` and generate approved mockups | Current visual references are text/wireframes only. | `TODOS.md` or `TRACKING.md` Phase 1 |
| Add route-level loading specs for app aluno | Prevents blank or shifting screens during data fetch. | `TRACKING.md` Phase 2 |
| Add personal OS next-action pattern | Reduces dashboard cognitive load. | `TRACKING.md` Phase 3 |
| Add nutritionist onboarding wireframes | Turns API seed into user-facing journey. | `TRACKING.md` Phase 4 |
| Add store detail social-proof rules | Prevents generic product-card checkout. | `TRACKING.md` Phase 5 |
| Elevate keyboard and screen reader scenarios to release gate | Avoids accessibility being treated as late QA only. | `TRACKING.md` Phase 1 |

## Completion Summary

```text
+====================================================================+
|         DESIGN PLAN REVIEW - COMPLETION SUMMARY                    |
+====================================================================+
| System Audit         | No DESIGN.md; DS doc exists; broad UI scope  |
| Step 0               | Initial rating 5/10; full review selected    |
| Pass 1  Info Arch    | 5/10 -> 8.5/10 after IA specs               |
| Pass 2  States       | 5/10 -> 8.5/10 after state tables           |
| Pass 3  Journey      | 5/10 -> 8/10 after emotional arcs           |
| Pass 4  AI Slop      | 6/10 -> 8.5/10 after hard rules             |
| Pass 5  Design Sys   | 6/10 -> 8.5/10 after DS alignment           |
| Pass 6  Responsive   | 4.5/10 -> 8/10 after viewport/a11y specs    |
| Pass 7  Decisions    | 7 resolved, 3 deferred                      |
+--------------------------------------------------------------------+
| NOT in scope         | written, 6 items                            |
| What already exists  | written                                     |
| TODOS.md updates     | 6 proposed, not added without user approval |
| Approved Mockups     | 0 generated; blocked by missing API key     |
| Decisions made       | 7 added to plan                             |
| Decisions deferred   | 3 listed                                    |
| Overall design score | 5/10 -> 8/10                                |
+====================================================================+
```

## Next Review Recommendation

Run `/plan-eng-review` next. This design review added interaction states, store delivery states, nutritionist permissions, mobile fixed-element rules and accessibility gates. Engineering needs to validate API contracts, data model, state machines, tests and rollout impact before implementation.
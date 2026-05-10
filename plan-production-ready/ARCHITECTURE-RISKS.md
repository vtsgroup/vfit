# Architecture, Risk, Error and Rescue Review

## Current architecture snapshot

```text
Browser/PWA/TWA
  |
  v
Next.js static export on Cloudflare Pages
  |
  |-- public landing/blog/legal/pricing
  |-- authenticated app shell
  |-- service worker + OneSignal workers
  |
  v
API client -> Cloudflare Worker /api/v1
  |
  |-- auth middleware JWT/KV sessions
  |-- Hono routers: auth, students, workouts, assessments, payments, nutritionist, admin, ai...
  |
  |-- Neon PostgreSQL via lib/db.ts
  |-- D1 exercise catalog
  |-- KV sessions/cache/rate-limit
  |-- R2 images/videos
  |-- Asaas/Stripe
  |-- OneSignal/Resend/Replicate/Workers AI
```

## Target architecture for product completion

```text
                         +-----------------------+
                         | Public SEO Surface    |
                         | landings/blog/store   |
                         +-----------+-----------+
                                     |
                                     v
+--------------+        +-----------+-----------+        +----------------+
| Student App  | <----> | VFIT API / Domain     | <----> | Personal App   |
| train/nutri  |        | services              |        | CRM/business   |
| store/social |        +-----------+-----------+        +----------------+
+------+-------+                    |
       |                            |
       v                            v
+------+-------+        +-----------+-----------+        +----------------+
| Store/Library|        | Shared Data Platform  | <----> | Nutritionist   |
| purchases    |        | Neon/D1/KV/R2         |        | patients/meals |
+--------------+        +-----------+-----------+        +----------------+
                                     |
                                     v
                         +-----------+-----------+
                         | Operations Layer     |
                         | admin, smoke, flags, |
                         | logs, metrics, QA    |
                         +-----------------------+
```

## Core domain boundaries

### Auth/identity

Roles: `student`, `personal`, `nutritionist`, `admin`, `super_admin`.

Rule: route access must be explicit by role. Admin simulation can exist, but it must not create silent 404s in user-facing app routes.

### Student domain

Owns:

- App home/treinos.
- Progress.
- Nutrition logging.
- Evaluations.
- Purchases/library.
- Profile/preferences.

### Personal domain

Owns:

- Students.
- Workouts.
- Assessments.
- Calendar.
- Payments.
- Messages.
- Marketplace seller tools.

### Nutritionist domain

Owns:

- Nutritionist profile.
- Patients.
- Nutrition assessments.
- Meal plans.
- Collaboration with student/personal.

### Marketplace/store domain

Owns:

- Published plans.
- Purchase records.
- Checkout.
- Delivery/cloning/versioning.
- Creator share and payout state.
- Reviews/refunds/disputes.

Currently marketplace lives under `payments.ts`. That works for MVP, but as store grows it should move toward a dedicated router/service to avoid payments becoming a mega-router.

## Data flow diagrams

### Store purchase flow

```text
Student opens store
  |
  v
GET /payments/plans?filters
  |
  v
Plan detail -> validate published -> show preview
  |
  v
Buy click -> POST /payments/plans/:id/buy
  |
  +-- nil/invalid user -> 401/403 user-visible login/access message
  +-- plan missing/unpublished -> 404/disabled state
  +-- already purchased -> 409 with open-library CTA
  +-- payment provider fails -> retry/payment failed state
  +-- double click -> idempotency key prevents duplicate purchase
  |
  v
Purchase row + creator/platform share + delivery record
  |
  v
Clone/version workout plan into student library
  |
  v
Student sees plan in /loja/compras and can activate
```

### Student nutritionist link flow

```text
Student enters referral code
  |
  v
POST /students/me/link-nutritionist
  |
  +-- empty code -> validation error
  +-- invalid code -> NotFoundError, user sees "código inválido"
  +-- existing link -> ConflictError, user sees current nutritionist
  +-- student profile missing -> NotFoundError, support CTA
  +-- DB write fails after patient insert -> compensation needed
  |
  v
patients row + nutritionists counters + user metadata
  |
  v
Nutritionist dashboard sees new patient
```

### Progress page flow

```text
Student opens /progresso
  |
  v
React Query calls progress endpoints
  |
  +-- no workout history -> 200 [] + helpful empty state
  +-- malformed aggregate -> structured 500 + fallback section
  +-- DB timeout -> retry/backoff + user-visible degraded message
  +-- auth mismatch -> redirect/login or role-specific message
  |
  v
Charts render with fixed dimensions and skeletons
```

### Public SEO to activation flow

```text
Google query -> public page -> direct answer + proof
  |
  +-- visitor is personal -> register personal -> dashboard onboarding
  +-- visitor is student -> onboarding -> generated plan/store
  +-- visitor is nutritionist -> nutritionist onboarding
  +-- visitor is not ready -> blog/internal links/newsletter/remarketing-free
```

## State machines

### Marketplace plan

```text
DRAFT -> PENDING_REVIEW -> PUBLISHED -> UNPUBLISHED
  |           |                |             |
  |           v                v             v
  |        REJECTED        PURCHASED      ARCHIVED
  |                            |
  +----------------------------+

Invalid transitions:
- PURCHASED -> DELETE is blocked. Use UNPUBLISHED/ARCHIVED.
- REJECTED -> PUBLISHED requires review pass.
- DRAFT -> PURCHASED impossible because list endpoint only shows published.
```

### Purchase

```text
INITIATED -> PAYMENT_PENDING -> PAID -> DELIVERED -> ACTIVE
    |              |            |        |
    v              v            v        v
  ABANDONED      FAILED      REFUNDED  COMPLETED

Critical invariant: paid but not delivered must alert.
```

### Nutritionist link

```text
UNLINKED -> LINK_REQUESTED -> LINKED -> PAUSED -> UNLINKED
     |           |             |
     |           v             v
     |        INVALID       BLOCKED
     |
     +-- existing active link blocks duplicate LINKED
```

## Error and rescue registry

| Codepath | What can go wrong | Exception/status | Rescued? | Rescue action | User sees |
|---|---|---|---|---|---|
| OneSignal init | domain mismatch | SDK init error | No today | Configure domain + suppress non-critical failure | Push unavailable or silent |
| Exercise images | CSP blocks R2 domain | CSP violation | No today | Update CSP/R2 CORS and add smoke | Broken images |
| `students/me` | role has no student row | 404 | Partial | Explicit role handling and UI message | Currently silent-ish |
| `progress/top-exercises` | no data/query/schema issue | 500 | No today | Return empty list or typed error | Progress degraded |
| Next chunk loading | stale asset fallback HTML | MIME error | No today | cache/SW/fallback fix | Route JS fails |
| Marketplace buy | double click/retry | duplicate purchase | Partial | idempotency key + unique constraint | Duplicate or error |
| Marketplace buy | plan unpublished mid-checkout | 404/409 | Needs explicit | revalidate before payment | Purchase unavailable |
| Marketplace buy | paid but delivery clone fails | partial state | Needs alert | outbox/repair job | Paid but no access |
| Nutritionist link | invalid referral code | NotFoundError | Yes | show invalid code | Código inválido |
| Nutritionist link | duplicate active link | ConflictError | Yes | show existing link | Já vinculado |
| Nutritionist link | insert succeeds, counter update fails | partial DB state | No transaction risk | transaction or repair job | Link inconsistent |
| Finance chart | container width -1 | Recharts warning | No today | stable dimensions/skeleton | chart may disappear |
| Smoke auth | expired token | preflight failed | No today | token renewal flow | deploy blocked |
| AI generation | malformed/refusal/empty | provider error | Unknown per route | typed parser + fallback | incomplete output |
| Payment webhook | Asaas retry/out-of-order | duplicate/stale event | Needs audit | idempotency by provider id | payment status wrong |

## Failure modes registry

| Codepath | Failure mode | Rescued? | Test? | User sees? | Logged? | Severity |
|---|---|---:|---:|---|---:|---|
| Push | OneSignal domain mismatch | N | N | maybe nothing | console only | P0 |
| R2 images | CSP blocks asset | N | N | missing images | console only | P0 |
| Student app | `/students/me` 404 | Partial | Unknown | app still renders | likely API log | P0 |
| Progress | top exercises 500 | N | Unknown | partial/empty progress | likely API log | P0 |
| SW/assets | stale chunk served as HTML | N | N | broken route | console only | P0 |
| Store buy | paid not delivered | N | N | no access after pay | maybe DB only | P0 |
| Marketplace | duplicate buy | Partial | Unknown | error/duplicate | API log | P1 |
| Nutrition link | partial write | N | N | inconsistent link | DB only | P1 |
| Finance | chart invalid size | N | N | broken chart | console only | P1 |
| SEO | programmatic thin pages | N/A | Review gate | poor ranking | Search Console | P2 |
| Auth public | logged-in session masks auth pages | Y | N | admin page | no | P2 |

Rows with `Rescued=N` and `Test=N` are critical gaps when they affect core revenue, auth, push, app load or payments.

## Security and privacy risks

### Authorization boundaries

- Student purchases must be scoped to buyer.
- Personal seller endpoints must verify creator ownership.
- Nutritionist patient endpoints already check `nutritionist_id`; preserve this invariant.
- Admin simulation must never leak real student data across tenants.

### Payment risk

- Asaas production is active. Marketplace/store tests must not create real unintended charges.
- Webhook idempotency must use provider payment id/event id.
- Creator payouts must be reconciled, not inferred only from UI totals.

### Health/nutrition data

- Assessments, meal plans, body metrics and dietary restrictions are sensitive data.
- Need audit log for access/export/share.
- Nutritionist-personal sharing needs explicit permission model.

### Store trust

- Published plans need moderation or trust tier.
- Reviews must be from verified buyers.
- Refund/dispute workflow must exist before broad launch.

## Performance risks

### Public pages

- Preloads not used waste network priority.
- Hero and OG images need stable dimensions and optimized formats.
- Programmatic pages must not bloat JS.

### App pages

- Multiple fixed elements can overlap on mobile if banners/modals stack.
- Charts need stable containers.
- Skeletons should avoid layout shift.

### API

- Nutritionist `patients` list uses subqueries per row for counts. Acceptable at small scale, but may need aggregate joins/materialized stats later.
- Marketplace list sorts by fields; indexes needed on `is_published`, `category`, `difficulty`, `created_at`, `price_brl`, `total_sales`.
- Progress aggregates need no-data fast path and indexes by `student_id`/date/exercise.

## Observability gaps

Minimum new events:

```text
onesignal_init_failed
csp_required_asset_blocked
student_identity_missing
progress_endpoint_failed
marketplace_purchase_initiated
marketplace_purchase_paid
marketplace_delivery_failed
nutritionist_link_created
nutritionist_link_failed
sw_chunk_load_failed
```

## Data consistency rules

### Marketplace purchase invariant

```text
plan_purchases.status = paid -> delivered must become true within N seconds
```

If not, alert and show user a recoverable state: “Pagamento confirmado, liberando seu plano.”

### Nutrition link invariant

```text
patients.user_id unique active link per nutritionist relationship policy
nutritionists.active_patients == count(active patients) eventually
```

Counter drift needs repair job.

### Student profile invariant

```text
user.user_type = student -> students.id = users.id exists
```

If violated, admin smoke should flag.

## Rollout architecture

```text
Feature flag off
  |
  v
Deploy code dark
  |
  v
Run migration/backfill if needed
  |
  v
Enable for internal users
  |
  v
Enable for 5% real users
  |
  v
Monitor errors/conversion
  |
  +-- bad -> disable flag + fix
  |
  v
Enable 100%
```

## Architectural recommendation

### Keep now

- Next.js + Workers + Neon + D1 + KV + R2.
- Existing DS and page skeleton system.
- Existing marketplace primitives in payments for short-term completion.
- Existing nutritionist routes as seed.

### Refactor soon

- Extract marketplace from `payments.ts` into `workers/api/marketplace.ts` once student store expands.
- Add transaction boundaries or compensation for multi-write flows.
- Add feature flag service instead of ad hoc env booleans.
- Add outbox/repair pattern for paid-but-not-delivered flows.

### Do not do yet

- Do not rewrite frontend navigation.
- Do not introduce a second design system.
- Do not build a generic social network.
- Do not add programmatic SEO at scale before schema/canonical/review gate exists.
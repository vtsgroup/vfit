# 📊 Discovery Inventory: 679 References Mapped

> **Mapa completo de todas as referências a iapersonal.app.br na codebase**
>
> Baseado em Explore agent scan (2026-04-04 17:30 GMT-3)

---

## 📈 Summary Stats

| Métrica | Valor |
|---------|-------|
| **Referências encontradas** | 679 |
| **Arquivos afetados** | 163 |
| **Domínios problemáticos** | 5 |
| **Risk Level: CRITICAL** | 42 refs |
| **Risk Level: HIGH** | 156 refs |
| **Risk Level: MEDIUM** | 245 refs |
| **Risk Level: LOW** | 236 refs |

---

## 🎯 By Risk Level

### 🔴 CRITICAL (42 refs) — MUST FIX BEFORE GO-LIVE

#### 1. Cloudflare Custom Domains (8 refs)

**Where:** Cloudflare Dashboard (not in code, but critical)
- Frontend: `iapersonal.app.br` → CNAME → `vfit.pages.dev`
- API: `api.iapersonal.app.br` → CNAME → `vfit-api.vd-b0b.workers.dev`
- Images: `images.iapersonal.app.br` → R2 bucket
- Videos: `videos.iapersonal.app.br` → R2 bucket
- WhatsApp: `whatsapp.iapersonal.app.br` → Worker

**Action:** Update in Cloudflare Dashboard (not code)
**Timeline:** Sprint 1, Day 1
**Rollback:** 1 click (revert DNS records)

---

#### 2. config/constants.ts (4 refs) — CENTRAL CONFIGURATION

**File:** `/Users/macos/Development/apps/vfit-production/config/constants.ts`

```typescript
// CURRENT (hardcoded, ignored by most code)
export const API_BASE_URL = 'https://api.iapersonal.app.br'
export const FRONTEND_URL = 'https://iapersonal.app.br'
export const WHATSAPP_WEBHOOK_URL = 'https://whatsapp.iapersonal.app.br'

// TO FIX
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://api.vfit.app.br'
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vfit.app.br'
export const WHATSAPP_WEBHOOK_URL = process.env.WHATSAPP_WEBHOOK_URL || 'https://whatsapp.vfit.app.br'
```

**Sprint:** Sprint 1
**Task:** `S1.2 Centralize domains in config/constants.ts`

---

#### 3. workers/api/passkey.ts (5 refs) — WEBAUTHN RP_ID

**File:** `/Users/macos/Development/apps/vfit-production/workers/api/passkey.ts`
**Lines:** 47, 163, 168, 339, 344

```typescript
// CURRENT
const RP_ID = 'iapersonal.app.br'

// AFTER (dual-write, 30d transition)
const VALID_RP_IDS = ['iapersonal.app.br', 'vfit.app.br']  // for 30 days
// Day 31: change to ['vfit.app.br'] only
```

**Sprint:** Sprint 2
**Task:** `S2.4 Implement dual-write for WebAuthn rpId`
**Impact:** 🔴 CRITICAL — If rpId changes without dual-write, ALL passkeys become invalid
**Recovery:** Email recovery link + password fallback

---

#### 4. lib/email-resend.ts (10 refs) — EMAIL SENDER

**File:** `/Users/macos/Development/apps/vfit-production/lib/email-resend.ts`

```typescript
// CURRENT
from: 'noreply@iapersonal.app.br'

// AFTER
from: process.env.EMAIL_FROM || 'noreply@vfit.app.br'
```

**Sprint:** Sprint 2
**Task:** `S2.5 Update email sender domain`
**Pre-requisite:** Configure DNS (SPF/DKIM/DMARC) for vfit.app.br BEFORE deploying
**Test:** Send test email, verify inbox (not spam)

---

#### 5. workers/api/auth.ts (4 refs) — OAUTH

**File:** `/Users/macos/Development/apps/vfit-production/workers/api/auth.ts`
**Lines:** OAuth redirect URIs

```typescript
// CURRENT
const REDIRECT_URIS = {
  google: 'https://iapersonal.app.br/auth/callback/google',
  github: 'https://iapersonal.app.br/auth/callback/github'
}

// AFTER
const REDIRECT_URIS = {
  google: process.env.OAUTH_GOOGLE_REDIRECT_URI || 'https://vfit.app.br/auth/callback/google',
  github: process.env.OAUTH_GITHUB_REDIRECT_URI || 'https://vfit.app.br/auth/callback/github'
}
```

**Sprint:** Sprint 2
**Task:** `S2.6 Update OAuth redirect URIs`
**Pre-requisite:** Update Google Cloud Console + GitHub before deploying
**Test:** Try OAuth login with both providers

---

#### 6. src/app/layout.tsx (3 refs) — METADATA

**File:** `/Users/macos/Development/apps/vfit-production/src/app/layout.tsx`

```typescript
// CURRENT
metadata: {
  metadataBase: new URL('https://iapersonal.app.br'),
  canonical: 'https://iapersonal.app.br',
  openGraph: {
    url: 'https://iapersonal.app.br'
  }
}

// AFTER
metadata: {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vfit.app.br'),
  canonical: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vfit.app.br',
  openGraph: {
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vfit.app.br'
  }
}
```

**Sprint:** Sprint 3
**Task:** `S3.1 Update Next.js layout metadata`
**Impact:** Affects SEO + Open Graph on all pages

---

#### 7. src/lib/api-client.ts (1 ref) — API FALLBACK

**File:** `/Users/macos/Development/apps/vfit-production/src/lib/api-client.ts`

```typescript
// CURRENT
const BASE_URL = 'https://api.iapersonal.app.br'

// AFTER
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || constants.API_BASE_URL
```

**Sprint:** Sprint 3
**Task:** `S3.2 Update API client base URL`

---

#### 8. workers/middleware/cors.ts (1 ref) — CORS ALLOWLIST

**File:** `/Users/macos/Development/apps/vfit-production/workers/middleware/cors.ts`

```typescript
// CURRENT
const ALLOWED_ORIGINS = [
  'https://iapersonal.app.br',
  'https://app.iapersonal.app.br'
]

// AFTER (dual-write, accept both for 30d)
const ALLOWED_ORIGINS = [
  'https://iapersonal.app.br',    // legacy
  'https://app.iapersonal.app.br', // legacy
  'https://vfit.app.br',           // new
  'https://app.vfit.app.br'        // new (if needed)
]

// Day 31: remove legacy origins
```

**Sprint:** Sprint 1
**Task:** `S1.3 Update CORS allowlist`

---

#### 9. .env.example & .env.production (4 refs) — ENVIRONMENT

**Files:**
- `.env.example` (5 refs)
- `.env.production` (secrets, 4 refs)

```bash
# BEFORE
NEXT_PUBLIC_API_BASE=https://api.iapersonal.app.br
NEXT_PUBLIC_FRONTEND_URL=https://iapersonal.app.br
WHATSAPP_WEBHOOK_URL=https://whatsapp.iapersonal.app.br

# AFTER
NEXT_PUBLIC_API_BASE=https://api.vfit.app.br
NEXT_PUBLIC_FRONTEND_URL=https://vfit.app.br
WHATSAPP_WEBHOOK_URL=https://whatsapp.vfit.app.br
```

**Sprint:** Sprint 1
**Task:** `S1.1 Update .env.example and production secrets`

---

#### 10. wrangler.toml (2 refs) — CLOUDFLARE WORKERS CONFIG

**File:** `/Users/macos/Development/apps/vfit-production/wrangler.toml`

```toml
# BEFORE
[[routes]]
pattern = "api.iapersonal.app.br/*"
zone_name = "iapersonal.app.br"

# AFTER
[[routes]]
pattern = "api.vfit.app.br/*"
zone_name = "vfit.app.br"
```

**Sprint:** Sprint 1
**Task:** `S1.4 Update wrangler.toml routing`

---

### 🟠 HIGH (156 refs) — UPDATE BEFORE USER ROLLOUT

#### 11-25. Backend Handlers (40 refs)

**Files with OAuth/invitation/share URLs:**
- `workers/api/students.ts` (9 refs) — Invitation links to `iapersonal.app.br`
- `workers/api/assessments.ts` (5 refs) — Share URLs
- `workers/api/affiliates.ts` (3 refs) — Affiliate links
- `workers/api/users.ts` (3 refs) — DPO contact email
- `workers/api/exercise-media.ts` (2 refs) — Media URLs
- `workers/api/admin.ts` (2 refs) — Admin dashboard links
- `workers/api/chat.ts` (1 ref) — Chat notification URLs

**Action:** Update URL generation in each handler
**Sprint:** Sprint 2
**Tasks:** `S2.1 through S2.12`

---

#### 26-50. Frontend Components (80 refs)

**Files with hardcoded URLs:**
- `src/components/seo/json-ld.tsx` (17 refs) — Structured data
- `src/app/(app)/**` (25 refs) — Page links
- `src/app/(public)/**` (18 refs) — Legal pages, contact
- `src/app/(auth)/**` (12 refs) — Auth pages
- `src/lib/email.ts` (3 refs) — Email template URLs
- `src/lib/story-export.ts` (1 ref) — Watermark
- Various components (4 refs) — Images, logos

**Action:** Replace with constants or env vars
**Sprint:** Sprint 3
**Tasks:** `S3.1 through S3.18`

---

#### 51-60. Invitation & Sharing (12 refs)

**Files:**
- `src/app/dashboard/students/invite/page.tsx` — Invitation link generation
- `src/hooks/use-assessments.ts` — Share URL generation
- `workers/api/students.ts` — Invitation endpoint

**Action:** Use environment-based domain in URL generation
**Sprint:** Sprint 2-3
**Task:** `S2.7, S3.8`

---

### 🟡 MEDIUM (245 refs) — UPDATE FOR UX

#### Legal/Contact Pages (50 refs)

**Files:**
- `src/app/(public)/privacidade/page.tsx` (5 refs) — Privacy policy with email
- `src/app/(public)/contato/page.tsx` (3 refs) — Contact page
- `src/app/(public)/termos/page.tsx` (2 refs) — Terms with email
- `src/app/(public)/carreiras/page.tsx` (1 ref) — Careers
- `src/app/(public)/excluir-conta/page.tsx` (1 ref) — Account deletion

**Current emails:**
- `noreply@iapersonal.app.br`
- `contato@iapersonal.app.br`
- `suporte@iapersonal.app.br`
- `dpo@iapersonal.app.br`
- `lgpd@iapersonal.app.br`

**Action:** Update email addresses in pages
**Sprint:** Sprint 3
**Task:** `S3.10 Update contact emails in legal pages`

---

#### Documentation (100+ refs)

**Files:**
- `.claude/docs/**/*.md` (50+ refs)
- `README.md` (10 refs)
- `docs/**/*.md` (20+ refs)
- `.claude/plans/**/*.md` (historical, low priority)

**Action:** Update after go-live (low risk)
**Sprint:** Post-Sprint 5 (documentation phase)

---

#### Scripts & Deploy (15 refs)

**Files:**
- `scripts/cf-deploy.js` (3 refs) — Deployment script
- `scripts/exec-migration.mjs` (1 ref) — Data migration
- `scripts/run-auth-smoke.mjs` (2 refs) — Smoke tests
- `scripts/whatsapp-task.mjs` (2 refs) — WhatsApp task
- Other scripts (7 refs)

**Action:** Update URLs in smoke tests and validation scripts
**Sprint:** Sprint 1-2 (as part of validation setup)

---

### 🟢 LOW (236 refs) — UPDATE FOR COMPLETENESS

#### Comments & Documentation (100+ refs)

**Where:** Throughout codebase as comments, logs, error messages

**Action:** Update in separate doc-cleanup pass after go-live
**Sprint:** Post-deployment cleanup

---

#### Mock Data & Tests (50+ refs)

**Files:**
- `tests/**/*.ts` (fixtures, mocks)
- `__mocks__/**` (mock factories)

**Action:** Update test fixtures as tests are run
**Sprint:** Sprint 1-5 (as part of test validation)

---

#### Email Templates (30+ refs)

**Files:**
- `lib/email.ts` (template bodies)
- Email template strings throughout codebase

**Action:** Update after email infrastructure is ready
**Sprint:** Sprint 2

---

## 🔗 Critical Dependencies (Ordering)

```
Sprint 1 (Infra)
  ├─ .env.example + .env.production
  ├─ config/constants.ts
  ├─ wrangler.toml
  ├─ workers/middleware/cors.ts
  └─ Cloudflare Dashboard (custom domains)
      ↓
Sprint 2 (Backend)
  ├─ workers/api/passkey.ts (dual-write)
  ├─ workers/api/auth.ts (OAuth)
  ├─ lib/email-resend.ts (sender domain)
  ├─ workers/api/students.ts (invites)
  └─ workers/api/... (other handlers)
      ↓ (must test email & OAuth before)
Sprint 3 (Frontend)
  ├─ src/app/layout.tsx (metadata)
  ├─ src/lib/api-client.ts (API base)
  ├─ src/components/**/* (hardcodes)
  └─ src/app/**/*.tsx (links, forms)
      ↓
Sprint 4 (CDN/Media)
  ├─ R2 custom domains
  ├─ images.vfit.app.br
  ├─ videos.vfit.app.br
  └─ whatsapp.vfit.app.br
      ↓
Sprint 5 (TWA/Mobile)
  ├─ twa-manifest.json
  ├─ assetlinks.json
  └─ Rebuild + re-sign APK
```

---

## 📋 Validation Checklist (By Risk Level)

### Before Sprint 1
- [ ] Cloudflare Dashboard access (DNS, Workers, Pages, R2)
- [ ] GitHub secrets access (for env updates)
- [ ] OAuth provider access (Google, GitHub)
- [ ] Email infrastructure access (Resend)

### Before Sprint 2
- [ ] .env.production updated with new domains
- [ ] DNS records created for vfit.app.br (SPF, DKIM, DMARC)
- [ ] OAuth provider redirect URIs updated
- [ ] Test email sent successfully from noreply@vfit.app.br

### Before Sprint 3
- [ ] api.vfit.app.br resolves correctly
- [ ] api.iapersonal.app.br still works (fallback)
- [ ] OAuth login works with both providers

### Before Sprint 4
- [ ] Frontend loads correctly from vfit.app.br
- [ ] All internal links working

### Before Sprint 5
- [ ] R2 custom domains configured
- [ ] CDN serving images/videos correctly

### Before Go-Live
- [ ] TWA rebuilt and signed
- [ ] assetlinks.json generated correctly
- [ ] Deep linking tested on Android

---

## 🔍 Validation Commands

```bash
# Find all remaining iapersonal.app.br refs
grep -r "iapersonal.app.br" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
  src/ workers/ lib/ config/ scripts/ public/ twa/ | \
  grep -v ".env" | grep -v "node_modules" | grep -v ".next" > /tmp/domain-refs.txt

# Count refs by file
grep -r "iapersonal.app.br" --include="*.ts" --include="*.tsx" --include="*.js" \
  src/ workers/ lib/ config/ scripts/ | wc -l

# Check DNS resolution
dig api.vfit.app.br
dig vfit.app.br
nslookup images.vfit.app.br

# Test API endpoint
curl https://api.vfit.app.br/healthz

# Test email
curl -X POST https://api.vfit.app.br/emails/test \
  -H "Content-Type: application/json" \
  -d '{"to": "you@example.com"}'
```

---

## 📞 Reference

- **Discover details:** Ask about specific file/section
- **Architecture:** See `01-ARCHITECTURE.md`
- **Sprint tasks:** See `03-SPRINT-PLAN.md`
- **Validation:** See `VALIDATION-CHECKLIST.md`

---

**Last updated:** 2026-04-04 17:45 GMT-3
**Next:** Review `01-ARCHITECTURE.md` for strategy details

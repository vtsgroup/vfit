# 🏗️ Architecture: Domain Migration Design

> **Desenho de engenharia para migração iapersonal.app.br → vfit.app.br**
>
> Zero-downtime, dual-write, rollback-safe

---

## 1️⃣ Estratégia: Dual-Write + Transição Gradual

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION TIMELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRE-CUTOVER        │   CUTOVER        │   TRANSITION (30d)   │
│  (Sprints 1-5)      │   (Day 1)        │   (Days 1-30)        │
│                     │                  │                       │
│ • Deploy code with  │ • Update CF DNS  │ • Dual-write config │
│   dual-write        │   (1 click)      │   active in backend  │
│ • Test both domains │ • Update .env    │ • Users sync         │
│ • Prepare rollback  │   in production  │   passkeys/configs   │
│                     │ • Monitor 24h    │ • Monitor traffic    │
│                     │                  │                       │
│                     ↓                  ↓                       │
│                   OLD DOMAIN          NEW DOMAIN             │
│                  (fallback)            (primary)              │
│                 Resolvendo a          Recebendo              │
│                 traffic via           100%                    │
│                 redirect              do traffic             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

             Day 31: Remove dual-write, delete fallback
```

### Por que dual-write?

1. **Sem downtime:** Usuarios em apps legados (mobile, old web) continuam funcionando
2. **Rollback seguro:** Se há bug, volta para domínio antigo em 1 click
3. **Transição gradual:** Usuários migram naturalmente (re-login, nova sessão)
4. **Monitora fallback:** Rastreamos quando tráfego sai do domínio antigo

---

## 2️⃣ Componentes Afetados

```
┌─────────────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE DEPENDENCY GRAPH                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────────┐        │
│  │  Cloudflare DNS  │◄─────────┤  vfit.app.br domains │        │
│  │  (1 click to     │          │  • api.vfit.app.br   │        │
│  │   cut over)      │          │  • images.vfit...    │        │
│  └────────┬─────────┘          │  • videos.vfit...    │        │
│           │                    │  • whatsapp.vfit...  │        │
│           ▼                    └──────────────────────┘        │
│  ┌──────────────────────────┐                                  │
│  │  Cloudflare Workers      │                                  │
│  │  (API @ api.vfit.app.br) │                                  │
│  │  ├─ config/constants.ts  │◄─── env vars (.env, secrets)    │
│  │  ├─ workers/api/auth.ts  │◄─── OAuth redirect URIs         │
│  │  ├─ workers/api/...      │◄─── Email sender domain         │
│  │  └─ workers/middleware   │◄─── CORS, rate-limit            │
│  └──────────────────────────┘                                  │
│           │                                                     │
│           ├──────────────────────────────────┐                 │
│           │                                  │                 │
│           ▼                                  ▼                 │
│  ┌──────────────────┐          ┌──────────────────────┐       │
│  │  Neon Postgres   │          │  Cloudflare D1       │       │
│  │  • users table   │          │  • cold data         │       │
│  │  • sessions      │          │  (exercises)         │       │
│  │  • notifications │          └──────────────────────┘       │
│  └──────────────────┘                                          │
│           ▲                                                     │
│           │                                                     │
│  ┌──────────────────────────┐                                  │
│  │  Cloudflare Pages        │                                  │
│  │  (Frontend @ vfit.app.br)│                                  │
│  │  ├─ src/app/layout.tsx   │◄─── metadata, canonical URL     │
│  │  ├─ src/lib/api-client   │◄─── API fallback                │
│  │  ├─ hardcoded URLs       │◄─── all src/ + public/          │
│  │  └─ manifest.json        │◄─── PWA manifest                │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │  R2 + CDN                │                                  │
│  │  ├─ images.vfit.app.br   │◄─── Bucket 1 (images)           │
│  │  ├─ videos.vfit.app.br   │◄─── Bucket 2 (videos)           │
│  │  └─ redirect old→new     │◄─── 301 redirect (90d)          │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │  Resend Email            │                                  │
│  │  ├─ noreply@vfit.app.br  │◄─── SPF/DKIM/DMARC config       │
│  │  └─ templates            │◄─── from address in emails      │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │  OAuth Providers         │                                  │
│  │  ├─ Google               │◄─── Redirect URI: vfit.app.br   │
│  │  ├─ GitHub               │◄─── Redirect URI: vfit.app.br   │
│  │  └─ (others)             │◄─── Update before cutover       │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────┐                                  │
│  │  TWA (Android App)       │                                  │
│  │  ├─ twa-manifest.json    │◄─── host: vfit.app.br           │
│  │  ├─ assetlinks.json      │◄─── Android deep linking        │
│  │  └─ signing key          │◄─── Must rebuild & re-sign      │
│  └──────────────────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Fluxo de Mudança: Por Componente

### A. Cloudflare Infrastructure (Sprint 1)

```
ANTES:
  api.iapersonal.app.br  ──[CNAME]──> vfit-api.vd-b0b.workers.dev
  iapersonal.app.br      ──[CNAME]──> vfit.pages.dev

DEPOIS:
  api.vfit.app.br        ──[CNAME]──> vfit-api.vd-b0b.workers.dev
  vfit.app.br            ──[CNAME]──> vfit.pages.dev

⚙️ Processo:
  1. Create CNAME records (Cloudflare Dashboard)
  2. Update Workers routing (wrangler.toml)
  3. Update Pages custom domain (CF Dashboard)
  4. Test DNS propagation
  5. Keep old records as fallback (30 days)
```

### B. Config Centralization (Sprint 1)

```
ANTES:
  • config/constants.ts: hardcoded domains (ignored)
  • src/components/**/*.ts: hardcoded URLs (scattered)
  • workers/api/*.ts: hardcoded in 20+ places
  • .env: incomplete, inconsistent

DEPOIS:
  • config/constants.ts: 100% env-driven (single source)
  • All code references: process.env.NEXT_PUBLIC_API_URL || constants.API_BASE_URL
  • .env.example: documented, complete
  • .env.production: secrets, injected at build time

Estratégia:
  1. Update config/constants.ts with env fallbacks
  2. Update .env.example + .env.production
  3. Update webpack/build to inject env vars
  4. Refactor hardcodes to use constants (gradual, 163 files)
```

### C. WebAuthn rpId Handling (Sprint 2)

```
ANTES:
  workers/api/passkey.ts:
    const RP_ID = 'iapersonal.app.br'
    
  Passkey registration:
    rpId: 'iapersonal.app.br'  ← hardcoded in credential
    
  Passkey authentication:
    rpId: 'iapersonal.app.br'  ← must match exactly

DEPOIS (com dual-write, 30d transition):
  workers/api/passkey.ts:
    const VALID_RP_IDS = ['iapersonal.app.br', 'vfit.app.br']
    
    // On registration: register with NEW rpId
    function registerPasskey(userId, challenge) {
      return credential.create({
        rp: { name: 'VFIT', id: 'vfit.app.br' },  ← NEW
        ...
      })
    }
    
    // On authentication: accept BOTH rpIds
    function verifyPasskey(userId, assertion) {
      if (!VALID_RP_IDS.includes(assertion.id)) {
        throw new Error('Invalid rpId')
      }
      // verification continues...
    }
    
    // Recovery: user can delete old passkey, add new one
    function deleteAndRegisterPasskey(userId) {
      await db.query('DELETE FROM passkeys WHERE user_id = $1', [userId])
      return registerPasskey(userId, newChallenge)
    }

Timeline:
  Day 0-30:   Dual-write active (accept both rpIds)
  Day 31:     Remove support for old rpId
  Recovery:   Email sent to users: "Re-register passkey on new domain"
```

### D. Email Infrastructure (Sprint 2)

```
ANTES:
  lib/email-resend.ts:
    from: 'noreply@iapersonal.app.br'
    
  templates:
    <img src="https://iapersonal.app.br/logo.png" />
    Click: https://iapersonal.app.br/reset-password?token=...

DEPOIS:
  lib/email-resend.ts:
    from: 'noreply@vfit.app.br'
    
  templates:
    <img src="https://vfit.app.br/logo.png" />
    Click: https://vfit.app.br/reset-password?token=...

PRE-REQUISITE (must do BEFORE Sprint 2):
  1. Cloudflare DNS for vfit.app.br:
     - SPF: v=spf1 include:resend.com ~all
     - DKIM: resend generates automatically
     - DMARC: v=DMARC1; p=reject; rua=mailto:dmarc@vfit.app.br
  
  2. Test email delivery:
     - Send test email from noreply@vfit.app.br
     - Check inbox (not spam)
     - Monitor bounce rate in Resend dashboard

Monitor (post-go-live):
  - Bounce rate < 0.5%
  - Spam rate < 0.1%
  - Delivery time < 5s
```

### E. OAuth Redirect URIs (Sprint 2)

```
ANTES:
  workers/api/oauth.ts:
    const REDIRECT_URIs = {
      google: 'https://iapersonal.app.br/auth/callback/google',
      github: 'https://iapersonal.app.br/auth/callback/github'
    }

DEPOIS:
  workers/api/oauth.ts:
    const REDIRECT_URIs = {
      google: 'https://vfit.app.br/auth/callback/google',
      github: 'https://vfit.app.br/auth/callback/github'
    }

PRE-REQUISITE (must update BEFORE deploying):
  1. Google Cloud Console:
     - OAuth consent screen: add vfit.app.br
     - Credentials: add authorized redirect URI
  
  2. GitHub:
     - Settings > OAuth Apps > vfit app
     - Add Authorization callback URL: https://vfit.app.br/auth/callback/github
  
  3. Test:
     - Login with Google → should redirect to vfit.app.br
     - Login with GitHub → should redirect to vfit.app.br
     - Old domain should show error (provider rejects)

Fallback:
  - If OAuth fails, password login still works
  - Error message: "OAuth provider doesn't recognize this domain. Try password login instead."
```

### F. Frontend Hardcodes (Sprint 3)

```
ANTES:
  src/app/layout.tsx:
    canonical: 'https://iapersonal.app.br/...'
    image: 'https://iapersonal.app.br/og-image.png'
  
  src/components/seo/json-ld.tsx:
    "url": "https://iapersonal.app.br/..."
    "image": "https://iapersonal.app.br/..."
  
  src/lib/api-client.ts:
    const BASE_URL = 'https://api.iapersonal.app.br'
  
  src/hooks/use-auth.ts:
    fallback: 'https://api.iapersonal.app.br/healthz'
  
  src/app/dashboard/students/invite/page.tsx:
    inviteLink = `https://iapersonal.app.br/auth/signup?ref=...`

DEPOIS (all use constants + env):
  config/constants.ts:
    export const DOMAIN_BASE = process.env.NEXT_PUBLIC_DOMAIN_BASE || 'vfit.app.br'
    export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://api.vfit.app.br'
    export const FRONTEND_URL = `https://${DOMAIN_BASE}`

  src/components/seo/json-ld.tsx:
    "url": `${constants.FRONTEND_URL}/...`

  src/lib/api-client.ts:
    const BASE_URL = constants.API_BASE_URL

  src/hooks/use-auth.ts:
    fallback: `${constants.API_BASE_URL}/healthz`
```

### G. R2 CDN Domains (Sprint 4)

```
ANTES:
  images.iapersonal.app.br/...   → R2 bucket vfit-images
  videos.iapersonal.app.br/...   → R2 bucket vfit-videos

DEPOIS:
  images.vfit.app.br/...         → R2 bucket vfit-images (new domain)
  videos.vfit.app.br/...         → R2 bucket vfit-videos (new domain)

Estratégia de transição:
  1. Create new custom domains in R2 (vfit.app.br)
  2. Update code to use new domains
  3. Keep old domains as redirect (301 permanent)
     - Cloudflare Worker: Route requests old→new
     - OR R2 bucket redirect setting (if available)
  4. Monitor traffic to old domains
  5. After 90 days, delete old domains

Monitoramento:
  - Requests to images.iapersonal.app.br → should be < 1% of traffic
  - Cache hit ratio on images.vfit.app.br → should be > 95%
  - Video stream quality → should not degrade
```

### H. TWA Android App (Sprint 5)

```
ANTES:
  twa/twa-manifest.json:
    "host": "iapersonal.app.br"
  
  twa/config/twa-manifest.json:
    "host": "iapersonal.app.br"
  
  public/.well-known/assetlinks.json:
    "site": "https://iapersonal.app.br"

DEPOIS:
  twa/twa-manifest.json:
    "host": "vfit.app.br"
  
  twa/config/twa-manifest.json:
    "host": "vfit.app.br"
  
  public/.well-known/assetlinks.json:
    "site": "https://vfit.app.br"

Processo:
  1. Update manifest files
  2. Rebuild TWA: npm run twa:build
  3. Re-sign APK with keystore
  4. Generate new assetlinks.json (script: twa/scripts/gen-assetlinks.js)
  5. Upload assetlinks.json to public/.well-known/
  6. Test deep linking: am start -a android.intent.action.VIEW -d "https://vfit.app.br/dashboard"
  7. Submit to Play Store (new version)

Note:
  - APK signature = new SHA-256 (assetlinks.json must match)
  - Users must update app from Play Store (old APK won't work with new domain)
  - Fallback: old APK still works if old domain is active
```

---

## 4️⃣ Decision Points & Tradeoffs

### Pergunta 1: "Single deployment vs. phased?"

**Opção A (Single):** Deploy tudo de uma vez
- ✅ Simples, sem dual-write complexity
- ❌ Alto risco: se algo quebra, 100% de usuários afetado
- ❌ Rollback exige revert de código inteiro

**Opção B (Phased with dual-write)** ← **RECOMENDADO**
- ✅ Baixo risco: pode testar em production com fallback
- ✅ Rollback é 1 click (DNS)
- ✅ Usuários migram naturalmente
- ❌ Dual-write complexity em Sprint 2 (passkeys, email)

**Escolha:** Phased with dual-write (30-day transition period)

---

### Pergunta 2: "Quando remover domínio antigo?"

**Opção A:** Imediatamente após go-live
- ✅ Limpo, sem legacy baggage
- ❌ Apps legados quebram
- ❌ Usuários reclamam

**Opção B (recomendado):** Keep for 90 days
- ✅ Apps legados continuam funcionando
- ✅ Redirect gradual reduz choque
- ✅ Tempo para comunicar usuarios
- ❌ Custa mais (manter ambos domínios)

**Escolha:** Keep old domains for 90 days com redirects

---

### Pergunta 3: "Test coverage?"

**Opção A:** Unit tests apenas
- ❌ Não testa integração com OAuth, email, etc.
- ❌ Risco em production

**Opção B (recomendado):** Unit + integration + smoke tests
- ✅ Testa OAuth flow ponta-a-ponta
- ✅ Testa email delivery
- ✅ Testa passkey registration/authentication
- ✅ Testa webhooks (Asaas, OneSignal)

**Escolha:** Full test suite (vide VALIDATION-CHECKLIST.md)

---

## 5️⃣ Anti-Patterns & Guards

❌ **AVOID:**
- Hardcoding novo domínio em código (use env vars)
- Deletar domínio antigo imediatamente (break apps)
- Não atualizar OAuth providers (login quebra)
- Não configurar email DNS (deliverability falha)
- Single deployment (risco alto)

✅ **DO:**
- Centralizar domínios em config/constants.ts
- Use env vars (.env.production)
- Keep old domains with 301 redirects (90d)
- Test OAuth providers antes de go-live
- Test email delivery antes de go-live
- Monitorar 24h pós-go-live (bounce rates, errors)

---

## 6️⃣ Rollback Decision Tree

```
┌─────────────────────────────────────────┐
│ Problema detectado pós-go-live?         │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
  SIM               NÃO
   │              (monitorar 24h)
   │
┌──┴──────────────────────────────────┐
│ Que tipo de erro?                   │
└──┬──────────────────────────────────┘
   │
   ├──> Email bounce rate > 2%
   │    → Revert email domain to old in Resend
   │    → Update .env, re-deploy
   │    → RTO: 5 min
   │
   ├──> OAuth login failures > 5%
   │    → Update OAuth provider redirect URI back to old domain
   │    → Clear browser cache
   │    → RTO: 10 min
   │
   ├──> Passkey authentication failures > 5%
   │    → Revert VALID_RP_IDS to [old domain only]
   │    → Users can use password login
   │    → RTO: 2 min (just change constant)
   │
   ├──> API unreachable
   │    → DNS rollback: api.vfit.app.br → api.iapersonal.app.br
   │    → CloudFlare DNS 1 click
   │    → RTO: < 1 min
   │
   └──> Website completely broken
        → Full code revert: git revert <commit>
        → npm run cf:deploy
        → RTO: 15 min
```

---

## 7️⃣ Monitoring & Alerts

```
┌─────────────────────────────────────────┐
│  METRICS TO MONITOR (24h pós-go-live)   │
├─────────────────────────────────────────┤
│                                          │
│ 1. Email deliverability                  │
│    ├─ Bounce rate (target: < 0.5%)      │
│    ├─ Spam rate (target: < 0.1%)        │
│    ├─ Delivery time (target: < 5s)      │
│    └─ Provider: Resend Dashboard         │
│                                          │
│ 2. API response time                     │
│    ├─ api.vfit.app.br latency           │
│    ├─ Target: p95 < 100ms                │
│    └─ Provider: Cloudflare Analytics     │
│                                          │
│ 3. OAuth login failures                  │
│    ├─ Google login success rate          │
│    ├─ GitHub login success rate          │
│    ├─ Target: > 99%                      │
│    └─ Provider: Custom logging            │
│                                          │
│ 4. Passkey authentication                │
│    ├─ Registration success rate          │
│    ├─ Authentication success rate        │
│    ├─ Target: > 99%                      │
│    └─ Provider: Custom logging            │
│                                          │
│ 5. CDN performance                       │
│    ├─ Cache hit ratio (images)           │
│    ├─ Cache hit ratio (videos)           │
│    ├─ Target: > 95%                      │
│    └─ Provider: R2 Analytics              │
│                                          │
│ 6. DNS resolution time                   │
│    ├─ api.vfit.app.br lookup time        │
│    ├─ Target: < 50ms                     │
│    └─ Provider: Cloudflare               │
│                                          │
│ 7. Error rate                            │
│    ├─ 4xx errors (bad request)           │
│    ├─ 5xx errors (server errors)         │
│    ├─ Target: 4xx < 1%, 5xx < 0.1%      │
│    └─ Provider: Cloudflare Analytics     │
│                                          │
└─────────────────────────────────────────┘

Alert thresholds:
  - Email bounce > 2% → immediate investigation
  - OAuth failures > 5% → immediate rollback
  - API latency p95 > 500ms → investigate
  - CDN cache hit < 80% → investigate
```

---

**Próxima seção:** `02-DISCOVERY-INVENTORY.md` (mapa detalhado das 679 refs)

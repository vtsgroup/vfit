# 📊 TRACKING: Domain Migration Progress

> **Live status de todas as 48 tasks através de 5 sprints**
>
> Atualizado: 2026-04-04 17:50 GMT-3

---

## 📈 Overall Progress

```
┌──────────────────────────────────────────────────────┐
│                  SPRINT PROGRESS                     │
├──────────────────────────────────────────────────────┤
│  Sprint 1 (Infra):     ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│  Sprint 2 (Backend):   ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│  Sprint 3 (Frontend):  ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│  Sprint 4 (CDN):       ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│  Sprint 5 (TWA):       ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│  QA:                   ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│                                                      │
│  TOTAL:                ░░░░░░░░░░░░░░░░░░░░░░ 0%   │
│         (0 of 48 tasks)                             │
└──────────────────────────────────────────────────────┘
```

**Completion Date (Est.):** 2026-04-18 (14 dias from start)

---

## 🔴 SPRINT 1: Infrastructure + Configuration

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

| Task | Description | Status | Date | Notes |
|------|---|---|---|---|
| S1.1 | Update .env.example + .env.production | ⏳ Pending | — | Blocked: Not started |
| S1.2 | Centralize config/constants.ts | ⏳ Pending | — | Blocked: Not started |
| S1.3 | Update wrangler.toml | ⏳ Pending | — | Blocked: Not started |
| S1.4 | Update CORS allowlist | ⏳ Pending | — | Blocked: Not started |
| S1.5 | Create CF DNS records | ⏳ Pending | — | Blocked: Not started |
| S1.6 | Configure Resend email domain | ⏳ Pending | — | Blocked: Not started |
| S1.7 | Update OAuth providers | ⏳ Pending | — | Blocked: Not started |
| S1.8 | Create S1 validation tests | ⏳ Pending | — | Blocked: Not started |

**Sprint Summary:**
- [ ] All tasks completed
- [ ] Code changes committed
- [ ] Cloudflare DNS configured (both old + new)
- [ ] Email DNS verified
- [ ] OAuth providers updated
- [ ] S1 validation tests pass
- [ ] Ready for S2

**Blockers:** None yet

**Notes:**
- Sprint 1 is blocker for S2-S5
- Once complete, can deploy S1+S2 together
- Keep all old domains for fallback

---

## 🟠 SPRINT 2: Backend Handlers

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

| Task | Description | Status | Date | Notes |
|------|---|---|---|---|
| S2.1 | Dual-write passkey rpId | ⏳ Pending | — | Blocked: S1 not done |
| S2.2 | Update OAuth redirect URIs | ⏳ Pending | — | Blocked: S1 not done |
| S2.3 | Update email sender domain | ⏳ Pending | — | Blocked: S1 not done |
| S2.4 | Update students.ts URLs | ⏳ Pending | — | Blocked: S1 not done |
| S2.5 | Update assessments.ts URLs | ⏳ Pending | — | Blocked: S1 not done |
| S2.6 | Update users.ts contact | ⏳ Pending | — | Blocked: S1 not done |
| S2.7 | Update other handlers | ⏳ Pending | — | Blocked: S1 not done |
| S2.8 | Update webhook callbacks | ⏳ Pending | — | Blocked: S1 not done |
| S2.9 | Deploy S1+S2 code | ⏳ Pending | — | Blocked: S1 not done |
| S2.10 | Test OAuth flows | ⏳ Pending | — | Blocked: S2.9 |
| S2.11 | Test email delivery | ⏳ Pending | — | Blocked: S2.9 |
| S2.12 | Test passkey flows | ⏳ Pending | — | Blocked: S2.9 |

**Sprint Summary:**
- [ ] All backend handlers updated
- [ ] Deployment: S1+S2 deployed together
- [ ] Production API at api.vfit.app.br working
- [ ] OAuth, email, passkeys tested
- [ ] Ready for S3 (frontend)

**Blockers:** 
- None, but depends on S1 completion

**Notes:**
- Dual-write keeps old domain support for 30 days
- Day 31 post-go-live: remove old domain from VALID_RP_IDS
- Monitor passkey recovery emails

---

## 🟡 SPRINT 3: Frontend

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

| Task | Description | Status | Date | Notes |
|---|---|---|---|---|
| S3.1 | Update src/app/layout.tsx metadata | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.2 | Update src/lib/api-client.ts | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.3 | Update src/app/**/*.tsx links | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.4 | Update src/app/(public)/**/*.tsx | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.5 | Update src/app/(auth)/**/*.tsx | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.6 | Update src/app/(app)/**/*.tsx | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.7 | Update src/components/seo/json-ld.tsx | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.8 | Update invitation/share URL generation | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.9 | Update lib/email.ts templates | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.10 | Update contact emails in legal pages | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.11 | Update story-export.ts watermark | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.12 | Update avatar/image components | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.13 | Update manifest.json PWA | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.14 | Update public/sw.js service worker | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.15 | Update next.config.ts | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.16 | Refactor all hardcodes to constants | ⏳ Pending | — | Blocked: S1+S2 not deployed |
| S3.17 | Run npm run build | ⏳ Pending | — | Blocked: S3.1-S3.16 |
| S3.18 | Deploy to vfit.pages.dev | ⏳ Pending | — | Blocked: S3.17 |

**Sprint Summary:**
- [ ] All frontend files updated
- [ ] All links use constants
- [ ] npm run build passes
- [ ] Frontend deployed to vfit.pages.dev
- [ ] No broken links

**Blockers:** 
- Depends on S1+S2 deployed

**Notes:**
- Can run in parallel with S4+S5
- Total ~163 hardcodes to update
- Use grep to validate: `grep -r "iapersonal.app.br" src/`

---

## 🟢 SPRINT 4: CDN + Media

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

| Task | Description | Status | Date | Notes |
|---|---|---|---|---|
| S4.1 | Create images.vfit.app.br custom domain | ⏳ Pending | — | Blocked: Not started |
| S4.2 | Create videos.vfit.app.br custom domain | ⏳ Pending | — | Blocked: Not started |
| S4.3 | Configure R2 301 redirects | ⏳ Pending | — | Blocked: Not started |
| S4.4 | Update whatsapp.vfit.app.br endpoint | ⏳ Pending | — | Blocked: Not started |
| S4.5 | Test CDN performance + cache | ⏳ Pending | — | Blocked: Not started |
| S4.6 | Monitor media delivery (24h) | ⏳ Pending | — | Blocked: S4.5 |

**Sprint Summary:**
- [ ] All CDN custom domains configured
- [ ] 301 redirects working (old→new)
- [ ] Cache hit ratio > 95%
- [ ] Media delivery tested

**Blockers:** 
- None, can run in parallel with S3+S5

**Notes:**
- Keep old CDN domains for 90 days with redirects
- Monitor traffic to old domains (should decrease over time)

---

## 🔵 SPRINT 5: TWA + Mobile

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

| Task | Description | Status | Date | Notes |
|---|---|---|---|---|
| S5.1 | Update twa/twa-manifest.json | ⏳ Pending | — | Blocked: Not started |
| S5.2 | Update public/.well-known/assetlinks.json | ⏳ Pending | — | Blocked: Not started |
| S5.3 | Rebuild TWA (npm run twa:build) | ⏳ Pending | — | Blocked: S5.1+S5.2 |
| S5.4 | Re-sign APK + submit to Play Store | ⏳ Pending | — | Blocked: S5.3 |

**Sprint Summary:**
- [ ] TWA rebuilt with new domain
- [ ] APK re-signed
- [ ] assetlinks.json matches signature
- [ ] Deep linking tested
- [ ] Submitted to Play Store
- [ ] New version available for users

**Blockers:** 
- None, can run in parallel with S3+S4

**Notes:**
- Users must update app from Play Store
- Old APK still works with old domain (fallback)
- Deep linking test: `am start -a android.intent.action.VIEW -d https://vfit.app.br/dashboard`

---

## ✅ QA + Validation

**Start:** TBD | **End:** TBD | **Status:** 🔵 Pending

See `VALIDATION-CHECKLIST.md` for complete smoke test suite.

| Category | Tests | Status |
|---|---|---|
| Infrastructure | DNS, CORS, HTTPS | ⏳ Pending |
| Backend | OAuth, Email, Passkeys | ⏳ Pending |
| Frontend | Links, Forms, Metadata | ⏳ Pending |
| CDN | Images, Videos, Cache | ⏳ Pending |
| Mobile | TWA, Deep linking, APK | ⏳ Pending |
| Monitoring | Alerts, Dashboards, Rollback | ⏳ Pending |

---

## 🎯 Key Milestones

```
Day 1-3:   ▓▓░░░░░░░░░░░░  Sprint 1 (Infra)
Day 4-6:   ░░▓▓░░░░░░░░░░  Sprint 2 (Backend) + Deploy S1+S2
Day 7-9:   ░░░░▓▓░░░░░░░░  Sprint 3 (Frontend) [parallel S4+S5]
Day 10-11: ░░░░░░▓▓░░░░░░  Sprint 4 (CDN)      [parallel S3+S5]
Day 12-13: ░░░░░░░░▓▓░░░░  Sprint 5 (TWA)      [parallel S3+S4]
Day 14:    ░░░░░░░░░░▓▓░░  QA + Validation
Day 15:    ░░░░░░░░░░░░▓▓  GO-LIVE
```

---

## 📊 Detailed Task Status

### Legend
- ⏳ **Pending** — Not started
- 🔄 **In Progress** — Currently working
- ✅ **Complete** — Done and tested
- 🔴 **Blocked** — Waiting for dependency
- ❌ **Failed** — Needs rework

---

## 🚨 Critical Path

**Tasks that block other work:**

1. S1 (all 8 tasks) → blocks S2
2. S1.5 (CF DNS) → blocks S2.9 (deploy)
3. S1.6 (Email DNS) → blocks S2.3 (email tests)
4. S1.7 (OAuth) → blocks S2.2 (OAuth tests)
5. S2.9 (Deploy S1+S2) → blocks S3 start
6. S3 (all 18 tasks) → ready for frontend go-live

**Non-critical path (can parallelize):**
- S4 (CDN) can start after S1
- S5 (TWA) can start after S1

---

## 📝 Daily Stand-Up Template

Use this for daily updates:

```markdown
## Day X Stand-Up

**Date:** 2026-04-XX
**Current Sprint:** S[N]

### Completed
- [ ] Task SN.X — Description
- [ ] Task SN.Y — Description

### In Progress
- [ ] Task SN.Z — Description (E.g., review code)

### Blockers
- [ ] Issue: X
  - Impact: Y
  - Resolution: Z by when

### Tomorrow
- [ ] Task SN.A
- [ ] Task SN.B

### Metrics
- Progress: X% (Y of Z tasks)
- Blockers: 0
- Tests passing: X/Y
```

---

## 🔍 Validation Evidence

After each sprint, document:

1. **Code review:** Link to PR + approvals
2. **Test results:** Paste test output (grep, curl, etc.)
3. **Deployment:** Commit hash, deploy timestamp
4. **Monitoring:** Metrics snapshot (latency, errors, bounce rate)

### Example (S1 complete):

```markdown
### Sprint 1 Validation Evidence

**PR:** #XXX (feat: domain migration S1)
**Commits:**
- abc1234 chore(env): update domains
- def5678 chore(config): centralize constants
- ghi9012 chore(wrangler): add routing

**Test Results:**
```
✅ S1.1: .env.example validated
✅ S1.2: config/constants.ts exports correct values
✅ S1.3: wrangler.toml routes both domains
✅ S1.4: CORS headers include vfit.app.br
✅ S1.5: DNS resolution:
  api.vfit.app.br → vfit-api.vd-b0b.workers.dev ✓
  vfit.app.br → vfit.pages.dev ✓
✅ S1.6: Resend domain verified
✅ S1.7: OAuth providers configured
✅ S1.8: Validation tests pass
```

**Deployment:** Deployed 2026-04-XX at 14:30 (commit abc1234)

**Monitoring (24h post-deploy):**
- Error rate: 0.01% ✅
- API latency p95: 85ms ✅
- No rollback needed
```

---

## 🔄 Rollback Evidence

If rollback needed, document:

```markdown
### Rollback Event

**Date:** 2026-04-XX at 15:45
**Trigger:** Email bounce rate > 2%
**Action:** Reverted email domain

**Evidence:**
- Bounce rate before: 2.3%
- Bounce rate after: 0.4%
- Recovery time: 5 minutes
- User impact: 5 min downtime on email delivery
```

---

## 📞 Contact / Questions

- **Architecture questions** → See `01-ARCHITECTURE.md`
- **Task details** → See `03-SPRINT-PLAN.md`
- **Validation checklist** → See `VALIDATION-CHECKLIST.md`
- **Live questions** → Update this file + sync with team

---

## 🎯 Definition of Done (per task)

For a task to be marked ✅ COMPLETE:

1. **Code changes** committed to branch
2. **Tests** written and passing
3. **Validation** checklist completed
4. **Documentation** updated in this file
5. **No blockers** for next sprint
6. **Peer review** done (if team environment)

---

**Status:** 🔵 Planning phase | Ready to start Sprint 1
**Last updated:** 2026-04-04 17:50 GMT-3
**Next update:** After S1.1 completion

# 7. Deployment & Rollback

---

## Pre-Deploy Checklist

### Code Quality

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint` — zero linting issues
- [ ] `npm run test` — all unit tests pass
- [ ] `npm run test:e2e` — onboarding E2E test passes
- [ ] `npm run build` — Next.js build succeeds
- [ ] `npm run wrangler:build` — Workers build succeeds

### Smoke Tests

- [ ] `npm run smoke:auth:local` — both tokens valid
  ```bash
  SMOKE_PERSONAL_TOKEN=xxx SMOKE_STUDENT_TOKEN=yyy npm run smoke:auth:local
  ```
- [ ] `POST /api/v1/plans/generate` returns 200 with valid plan
  ```bash
  curl -X POST https://api.vfit.app.br/api/v1/plans/generate \
    -H "Content-Type: application/json" \
    -d '{"gender":"male","age":25,...}' \
    | jq '.plan.days | length'
  ```
- [ ] D1 query works (if Phase 3)
  ```bash
  wrangler d1 execute vfit-exercises --remote \
    --command "SELECT COUNT(*) FROM user_workouts_cache"
  ```

### Git Hygiene

- [ ] All changes committed
- [ ] Branch name: `feat/vfit-sprint-planning`
- [ ] Commit messages: Conventional Commits
  ```
  feat(twa): update startUrl to /welcome
  feat(onboarding): fix POST /plans/generate payload validation
  feat(d1): add user_workouts_cache table and sync
  feat(dashboard): polish header with DS components
  ```
- [ ] No untracked files (except `.env.local`)

---

## WhatsApp Notifications

**Rule 18:** Toda ação operacional (deploy, migration) requer start/end no WhatsApp.

### Format

**START:**
```
🚀 VFIT Sprint Iniciado
━━━━━━━━━━━━━━━━━━━━━
Phase 1: TWA Entry ▶️
Phase 2: Onboarding Fix (bloqueador)
Phase 3: D1 Sync
Phase 4: Visual Polish

Executor: Copilot via Opus
Branch: feat/vfit-sprint-planning
Started: 2026-04-03 10:00:00 UTC
```

**Phase Completion:**
```
✅ Phase 1 (TWA Entry) — 22 min
├─ twa-manifest.json updated
├─ welcome/page.tsx auth redirect added
└─ Tests passed

Next: Phase 2 (Onboarding Fix)
```

**END:**
```
✅ VFIT Sprint Concluído
━━━━━━━━━━━━━━━━━━━━━━
✅ Phase 1: TWA Entry (22 min)
✅ Phase 2: Onboarding Fix (2h 15m)
✅ Phase 3: D1 Sync (1h 45m)
✅ Phase 4: Visual Polish (1h)
━━━━━━━━━━━━━━━━━━━━━━
Total: 5h 22m
Started: 2026-04-03 10:00
Ended: 2026-04-03 15:22
Status: ✅ SUCCESS

Commits:
- feat(twa): update startUrl to /welcome
- feat(onboarding): fix POST /plans/generate
- feat(d1): add user_workouts_cache sync
- feat(dashboard): polish header with DS

Deploy: v1.0.2 → v1.1.0
```

---

## Deploy Commands

### Phase 1 (TWA)

```bash
# No deploy needed — config file + Next.js code
# But TWA rebuild required for next release
npm run twa:build
# Output: twa/dist/app-release-*.aab
```

### Phase 2 + 3 (Next.js + Workers)

```bash
# Frontend + Backend deploy
npm run cf:deploy

# This runs:
# 1. npm run build (Next.js)
# 2. wrangler deploy (Workers)
# 3. Sends WhatsApp notification (via cf-deploy.js)

# Or manual:
npm run build
wrangler deploy
```

### Phase 3 Only (D1 Migration)

```bash
# Apply D1 migration
wrangler d1 migrations apply vfit-exercises --remote

# Verify
wrangler d1 execute vfit-exercises --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## Deployment Sequence

```
1. Run all pre-deploy checks
2. Send WhatsApp START message
3. Create feature branch (already done)
4. Complete Phases 1-4 (as implemented)
5. Verify each phase locally
6. Stage all commits
7. Deploy Phase 1 (TWA — no backend impact)
8. Deploy Phases 2 + 3 together:
   - npm run cf:deploy (includes D1 migration)
9. Verify D1 table exists
10. Deploy Phase 4 (independent)
11. Send WhatsApp END message
12. Create PR + merge to main
13. Tag release: v1.1.0
```

---

## Rollback Procedures

### Phase 1 (TWA) — NO ROLLBACK NEEDED
- Config-only change
- TWA app doesn't update automatically
- If issue: next build fixes it

### Phase 2 (Onboarding) — QUICK ROLLBACK

If POST /plans/generate still broken:

```bash
# Rollback last commit
git revert <commit-hash>
git push origin feat/vfit-sprint-planning

# Or reset to last working version
git reset --hard origin/main
npm run cf:deploy
```

**Impact:** Onboarding quiz still broken until Phase 2 completes. No other features affected.

### Phase 3 (D1) — REQUIRES CARE

If D1 sync fails:

```bash
# Rollback migration
wrangler d1 migrations rollback vfit-exercises --remote

# Revert code
git revert <commit-hash>
npm run cf:deploy

# Verify PostgreSQL still works (it should)
```

**Impact:** Workouts go to PostgreSQL only (no D1 cache). PWA offline limited. Accept risk or wait for Phase 3 fix.

### Phase 4 (Visual) — SAFE

If header breaks:

```bash
# Just revert the commit
git revert <commit-hash>
npm run cf:deploy
```

**Impact:** Header looks slightly off (no DS Button polish), but fully functional.

---

## Post-Deploy Verification

### Automated

```bash
# Run smoke tests again
npm run smoke:auth:local
npm run test:e2e

# Check logs
wrangler tail
```

### Manual

1. Open https://vfit.app.br/welcome (not authenticated)
   - Expect: Hero + "Começar" CTA
2. Click "Começar" → complete 1 step
   - Expect: Can fill field + continue
3. Go through all 17 steps (can skip, just test UX)
4. Click final CTA "Criar Meu Plano"
   - Expect: Loading screen with phases
5. Wait 10-15 seconds
   - Expect: /onboarding/result with plan displayed
6. Go to /dashboard (logged in)
   - Expect: Header renders, no errors
   - Expect: All icons visible + clickable
7. Check Dark mode contrast
   - Expect: All text readable (contrast ≥4.5:1)

---

## Success Criteria (Post-Deploy)

✅ **Phase 1:**
- [ ] TWA opens /welcome (not authenticated)
- [ ] Authenticated user sees /dashboard directly

✅ **Phase 2:**
- [ ] Onboarding 17 steps complete without error
- [ ] Plan generated and displayed in /onboarding/result
- [ ] No "Ops! Algo deu errado" errors

✅ **Phase 3:**
- [ ] D1 query returns new workout rows
- [ ] `SELECT COUNT(*) FROM user_workouts_cache` > 0

✅ **Phase 4:**
- [ ] Header uses <Button> for logout
- [ ] All icons are <DSIcon>
- [ ] No console errors in dark mode

---

## Incident Response

If deployment fails:

1. **Check logs immediately**
   ```bash
   wrangler tail
   # Look for 5xx errors
   ```

2. **Identify phase**
   - Phase 1: Unlikely to fail (config-only)
   - Phase 2: Check Workers logs for /plans/generate errors
   - Phase 3: Check D1 migration errors
   - Phase 4: Check Next.js build errors

3. **Notify team**
   - Send WhatsApp update: "❌ Phase X failed, rolling back"
   - Prepare rollback

4. **Rollback**
   ```bash
   # Revert last commit
   git revert HEAD
   npm run cf:deploy
   wrangler tail # Verify it's rolling back
   ```

5. **Post-mortem**
   - Document what failed
   - Add TODO for fix
   - Update CHANGELOG

---

## Versioning

```
Current: v1.0.2
Target: v1.1.0 (minor version bump = new feature)

Update files:
- lib/version.ts
- package.json
- CHANGELOG.md

Command:
npm run bump-version minor
```

---

## CHANGELOG Entry

```markdown
## [1.1.0] — 2026-04-03

### Added
- TWA smart entry point: starts at /welcome instead of /dashboard
- Onboarding quiz fix: POST /plans/generate now handles all edge cases
- D1 workout sync: generated workouts replicated to D1 for offline PWA
- Dashboard visual polish: header uses Design System components exclusively

### Fixed
- Onboarding error "Ops! Algo deu errado" resolved
- Auth redirect logic for authenticated TWA users

### Changed
- twa-manifest.json: startUrl=/welcome (from /dashboard)

### Migration
- D1: new table user_workouts_cache for offline availability

### Technical
- Upgraded plan-generation schema validation
- Added D1 INSERT pattern to workers/api/plans.ts
- Header refactored to use Button component exclusively
```

---

## Support & Escalation

- **Phase 1 issues:** Check twa-manifest.json, rebuild TWA
- **Phase 2 issues:** Check /plans/generate logs, verify schema alignment
- **Phase 3 issues:** Check D1 migration, verify D1 binding in wrangler.toml
- **Phase 4 issues:** Check Next.js build, verify Button/DSIcon imports

**Escalation:** If Phase 2 still fails after rollback, create TODO for deeper investigation.

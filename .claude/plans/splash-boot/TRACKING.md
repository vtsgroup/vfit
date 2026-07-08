# TRACKING — Plano splash-boot v2 (Boot Experience TWA/PWA)

> **Última atualização:** 2026-07-08 · v5.4.5 DEPLOYED ✅
> Plano: `~/.gstack/projects/vtsgroup-vfit/ceo-plans/2026-07-08-splash-boot-experience.md`
> Origem: /investigate (causa raiz confirmada) + /plan-eng-review (ENG CLEARED, outside voice absorvido)

## Tasks

- [x] T1 — ✅ Concluído — Boot script pré-paint: fix allowlist `/welcome` p/ logado, branch morto, admin→`/dashboard/admin`, guest mode respeitado (`src/app/layout.tsx`)
- [x] T2 — ✅ Concluído — Splash pré-renderizada: `show=true`, classes pré-paint `vsp-standalone`/`vsp-instant`, prop `standaloneOnly`, válvula CSS sem-JS fora do reduced-motion, `MIN_VISIBLE 1600` (`splash-screen.tsx` v6)
- [x] T3 — ✅ Concluído — `useSessionBoot()` guard por token; AuthProvider consome (`use-session-boot.ts`, `auth-provider.tsx`)
- [x] T4 — ✅ Concluído — `isBootResolved` no store + marcações (`DashboardAuthGate`, `AppShell`, `BootResolvedMarker`) + orquestrador observer (`auth-store.ts`, `splash-orchestrator.tsx`)
- [x] T5 — ✅ Concluído — Mounts `(onboarding)`/`(auth)` + `lib/boot-destination.ts` + unit/paridade (21 casos verdes)
- [x] T6 — ✅ Concluído — E2E standalone-emulado 12 cenários verdes + build gate `check-splash-export.mjs` no postbuild
- [x] T7 — ✅ Concluído — TODOS.md (TODO-008, TODO-009) + CHANGELOG 5.4.5 + este TRACKING
- [x] T8 — ✅ Concluído — Deploy produção v5.4.5 no ar (76,6s, Pages+Workers+tag) · smoke TWA em dispositivo real: aguardando o dono

**Progresso:** 8/8 (100%)

## Evidências

- Build gate: `out/welcome.html` contém `vsp-root`+`bc-jumbo`; `out/dashboard.html` contém `vsp-root` ✅
- `quality:ci` completo: exit 0 ✅
- Vitest: 21/21 ✅ · Playwright splash-boot (chromium): 12/12 ✅
- Smoke no export estático real (serve out/): redirect pré-paint personal `/welcome→/dashboard` ✅ · splash visível 1º paint standalone anon ✅ · splash oculta em browser comum ✅
- Review adversarial multi-lente (workflow) rodado pré-commit

## Limitações conhecidas (pré-existentes, fora de escopo)

- **No-JS total**: conteúdo do welcome fica num wrapper `display:none` do Suspense streaming do Next (revelado por script inline `$RC` — sem rede, mas exige JS habilitado). Pré-existente ao plano; a válvula CSS da splash garante que ela nunca bloqueia por cima.
- **Smoke auth**: tokens `SMOKE_*` do `.env.local` expirados no preflight — renovar via `/dashboard/admin/smoke` (super_admin). Mudança é 100% frontend (API intocada).

## Deploys

| Versão | Data | Commit | Arquivos | Notas |
|--------|------|--------|----------|-------|
| 5.4.5 | 2026-07-08 | a1030452 | 21 | splash-boot v2 — validado em produção (vsp-root em /welcome e /dashboard, manifest 5.4.5, API healthy) |

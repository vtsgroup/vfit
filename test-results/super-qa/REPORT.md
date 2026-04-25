# Super QA Report — VFIT v3.2.0

- **Base URL:** https://vfit.app.br
- **Data:** 2026-04-25T22:14:57.195Z
- **Rotas testadas:** 59 (mobile + desktop = 118 runs)

## Resumo

| Severity | Count |
|----------|------:|
| 🔴 critical | 4 |
| 🟠 high | 11 |
| 🟡 medium | 4 |
| ✅ ok | 99 |

## CRITICAL (4)

| Path | Viewport | Status | Issues |
|------|----------|-------:|--------|
| `/` | mobile | 200 | — |
| `/_not-found-test-404` | mobile | 200 | — |
| `/` | desktop | 200 | — |
| `/_not-found-test-404` | desktop | 200 | — |

## HIGH (11)

| Path | Viewport | Status | Issues |
|------|----------|-------:|--------|
| `/login` | mobile | 200 | 15 console-error · 4 warn |
| `/register/personal` | mobile | 200 | 15 console-error · 6 warn |
| `/register/student` | mobile | 200 | 15 console-error · 5 warn |
| `/forgot-password` | mobile | 200 | 15 console-error · 5 warn |
| `/exercicios` | mobile | 200 | 1 console-error |
| `/progresso/streaks` | mobile | 200 | overflow-x |
| `/login` | desktop | 200 | 15 console-error · 8 warn |
| `/register/personal` | desktop | 200 | 15 console-error · 6 warn |
| `/register/student` | desktop | 200 | 15 console-error · 8 warn |
| `/forgot-password` | desktop | 200 | 15 console-error · 5 warn |
| `/exercicios` | desktop | 200 | 1 console-error |

## MEDIUM (4)

| Path | Viewport | Status | Issues |
|------|----------|-------:|--------|
| `/onboarding/loading` | mobile | 200 | 1 warn |
| `/treino-ativo` | mobile | 200 | 1 warn |
| `/onboarding/loading` | desktop | 200 | 1 warn |
| `/treino-ativo` | desktop | 200 | 1 warn |

## Detalhes por rota (não-ok)

### `/`

**mobile** — critical — HTTP 200 — 5914ms

- screenshot: `test-results/super-qa/mobile/home.png`

**desktop** — critical — HTTP 200 — 2876ms

- screenshot: `test-results/super-qa/desktop/home.png`

### `/login`

**mobile** — high — HTTP 200 — 5415ms

- console errors:
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScriptURL' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/mobile/login.png`

**desktop** — high — HTTP 200 — 5436ms

- console errors:
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `Failed to load resource: the server responded with a status of 401 ()`
  - `%c%d font-size:0;color:transparent NaN`
  - `%c%d font-size:0;color:transparent NaN`
- screenshot: `test-results/super-qa/desktop/login.png`

### `/register/personal`

**mobile** — high — HTTP 200 — 5810ms

- console errors:
  - `%c%d font-size:0;color:transparent NaN`
  - `%c%d font-size:0;color:transparent NaN`
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/mobile/register_personal.png`

**desktop** — high — HTTP 200 — 5693ms

- console errors:
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `Permissions policy violation: xr-spatial-tracking is not allowed in this document.`
  - `Failed to load resource: the server responded with a status of 401 ()`
  - `%c%d font-size:0;color:transparent NaN`
  - `%c%d font-size:0;color:transparent NaN`
- screenshot: `test-results/super-qa/desktop/register_personal.png`

### `/register/student`

**mobile** — high — HTTP 200 — 6092ms

- console errors:
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScriptURL' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/mobile/register_student.png`

**desktop** — high — HTTP 200 — 5672ms

- console errors:
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScript' assignment. The action has been blocked.`
  - `This document requires 'TrustedScriptURL' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/desktop/register_student.png`

### `/forgot-password`

**mobile** — high — HTTP 200 — 6143ms

- console errors:
  - `Failed to load resource: the server responded with a status of 401 ()`
  - `%c%d font-size:0;color:transparent NaN`
  - `%c%d font-size:0;color:transparent NaN`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/mobile/forgot-password.png`

**desktop** — high — HTTP 200 — 5493ms

- console errors:
  - `%c%d font-size:0;color:transparent NaN`
  - `%c%d font-size:0;color:transparent NaN`
  - `Failed to load resource: the server responded with a status of 401 ()`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
  - `This document requires 'TrustedHTML' assignment. The action has been blocked.`
- screenshot: `test-results/super-qa/desktop/forgot-password.png`

### `/onboarding/loading`

**mobile** — medium — HTTP 200 — 5629ms

- screenshot: `test-results/super-qa/mobile/onboarding_loading.png`

**desktop** — medium — HTTP 200 — 5236ms

- screenshot: `test-results/super-qa/desktop/onboarding_loading.png`

### `/exercicios`

**mobile** — high — HTTP 200 — 2515ms

- console errors:
  - `Fetch API cannot load https://images.vfit.app.br/muscles/chest/image_female_url.png?v=20260413-1. Refused to connect because it violates the document's Content Security Policy.`
- screenshot: `test-results/super-qa/mobile/exercicios.png`

**desktop** — high — HTTP 200 — 1454ms

- console errors:
  - `Fetch API cannot load https://images.vfit.app.br/muscles/chest/image_female_url.png?v=20260413-1. Refused to connect because it violates the document's Content Security Policy.`
- screenshot: `test-results/super-qa/desktop/exercicios.png`

### `/progresso/streaks`

**mobile** — high — HTTP 200 — 1457ms

- ⚠️ horizontal overflow
- screenshot: `test-results/super-qa/mobile/progresso_streaks.png`

### `/treino-ativo`

**mobile** — medium — HTTP 200 — 1410ms

- screenshot: `test-results/super-qa/mobile/treino-ativo.png`

**desktop** — medium — HTTP 200 — 814ms

- screenshot: `test-results/super-qa/desktop/treino-ativo.png`

### `/_not-found-test-404`

**mobile** — critical — HTTP 200 — 7905ms

- screenshot: `test-results/super-qa/mobile/_not-found-test-404.png`

**desktop** — critical — HTTP 200 — 2598ms

- screenshot: `test-results/super-qa/desktop/_not-found-test-404.png`

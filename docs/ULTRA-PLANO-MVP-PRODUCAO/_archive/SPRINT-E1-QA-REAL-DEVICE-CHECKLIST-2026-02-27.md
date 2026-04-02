# Sprint E.1 — Checklist QA Real-Device (27/02/2026)

> Status: em execução
> Objetivo: validar acabamento final do PWA em iPhone/Android antes do próximo deploy de fechamento.

## 1) Evidências automatizadas desta rodada

- `npm run test:e2e -- --project=mobile-chrome tests/e2e/smoke-public.spec.ts` ✅ (2/2)
- `npm run ops:release:gate` ✅
  - `smoke:auth:local` ✅
  - `quality:ci` ✅
  - `ops:go-no-go` ✅

## 2) Escopo visual/final a validar em device real

### iPhone (PWA instalado)
- [ ] Navbar inferior sem borda verde residual
- [ ] Safe-area inferior confortável (sem sobrepor home indicator)
- [ ] FAB e quick actions sem clipping
- [ ] Ícone de app sem borda branca perceptível
- [ ] Splash de abertura com logo estendida correta
- [ ] Navegação dashboard/alunos/treinos sem jump visual

### Android (PWA instalado)
- [ ] Navbar inferior com espaçamento adequado
- [ ] FAB e quick actions posicionados corretamente
- [ ] Ícone launcher sem respiro indevido
- [ ] Retorno ao app sem badge/banner de update
- [ ] Reabertura após minutos/horas mantendo atualização silenciosa

## 3) Critério de aceite Sprint E.1

- 100% dos checks de device real aprovados em iPhone + Android.
- Sem regressão no gate técnico (`ops:release:gate`).
- Evidência atualizada no changelog e no plano de sprint train.

## 4) Próxima ação após checklist real-device

- Se aprovado: seguir para Sprint E.2 (SEO lote 2 + hardening final) e preparar deploy incremental.
- Se reprovado: corrigir UX PWA e repetir checklist no mesmo ciclo.

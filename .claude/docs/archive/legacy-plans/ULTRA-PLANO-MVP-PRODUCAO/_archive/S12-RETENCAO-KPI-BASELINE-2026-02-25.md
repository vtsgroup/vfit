# S12 — Retenção KPI Baseline (Dashboard)

> Data: 25/02/2026

## Objetivo
Abrir a sprint S12 com leitura semanal objetiva de retenção dentro do produto (sem frente de landing).

## KPIs iniciais (semana)
1. `story_open` (engajamento inicial)
2. `story_complete` (engajamento profundo)
3. `story_share` (sinal de valor percebido)
4. `story_cta_click` (intenção de próxima ação)

## Fórmulas operacionais
- Completion rate = `story_complete / story_open`
- Share rate = `story_share / story_open`
- CTA rate = `story_cta_click / story_open`

## Fonte de dados atual
- Backend: endpoint de KPI Story em `workers/api/assessments.ts`
- Frontend admin: card KPI Story em `src/app/dashboard/admin/page.tsx`
- Hook: `useStoryKpis` em `src/hooks/use-assessments.ts`

## Critérios de aceite S12
- KPI semanal disponível e consistente no painel admin.
- Leitura rápida de tendência (subiu, caiu, estável) documentada por ciclo.
- Gate obrigatório mantido: smoke/auth + quality checks sem regressão.

## Próxima ação (S12.1)
- Consolidar regra de decisão operacional por KPI:
  - se completion cair >10% semana/semana => investigar fricção de fluxo;
  - se CTA subir >=15% => manter variante e ampliar experimento;
  - se share subir sem CTA subir => revisar CTA/contexto de fechamento.

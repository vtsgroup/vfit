# Baseline Inicial — GA4/GSC (27/02/2026)

## Status operacional
- GA4 script ativo no app root (`G-XGXZ4R6JXH`).
- Eventos base Sprint 00 instrumentados:
  - `cta_click`
  - `plan_click`
  - `signup_start`
  - `web_vitals`
- Bootstrap analytics de landing ativo na home.

## Evidências de implementação
- `src/app/layout.tsx`
- `src/lib/landing-analytics.ts`
- `src/components/landing/pricing.tsx`
- `src/components/analytics/web-vitals-tracker.tsx`
- `src/app/page.tsx`

## Snapshot de métricas (D0)

### GA4
- Property ID: `G-XGXZ4R6JXH`
- Coleta de eventos: **ativa em código**
- Volume numérico (usuários/sessões/eventos): **pendente acesso ao painel GA4**

### Google Search Console
- Propriedade: `https://iapersonal.app.br`
- Impressões, cliques, CTR e posição média: **pendente acesso ao painel GSC**

## Pendências para fechamento do gate
1. Exportar 7 dias (GA4): users, sessions, engaged sessions, conversões por `cta_click`, `plan_click`, `signup_start`.
2. Exportar 7 dias (GSC): impressions, clicks, CTR, avg position por URL.
3. Registrar os números neste arquivo e no board da Sprint 00.

## Observação crítica
O bloqueio de `bingbot` (HTTP 403) pode impactar parcialmente descoberta orgânica em Bing/IndexNow até ajuste no Cloudflare.

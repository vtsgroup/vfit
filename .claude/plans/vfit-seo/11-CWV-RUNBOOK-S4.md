# 11 — Runbook CWV (Sprint 4)

Objetivo: manter LCP/INP/CLS dentro de faixa saudável nas páginas públicas de aquisição.

## Estado atual

- Coleta já ativa via `useReportWebVitals` com envio para GA4 (`event: web_vitals`)
- Montagem global em layout raiz com carregamento lazy
- Build estático validado após mudanças de SEO/Growth

## Métricas e metas

| Métrica | Meta (bom) | Alerta |
|---|---:|---:|
| LCP | <= 2500ms | > 3000ms |
| INP | <= 200ms | > 300ms |
| CLS | <= 0.10 | > 0.15 |

## Escopo de revisão

- Home (`/`)
- Landings ICP (`/app-personal-trainer`, `/nutricionistas`, `/afiliados`)
- 4 artigos pilar

## Rotina quinzenal

1. Filtrar evento `web_vitals` por `event_label` no GA4
2. Segmentar por `page_path`
3. Priorizar correção em URLs com maior tráfego orgânico
4. Abrir ação técnica quando métrica em alerta por 2 janelas consecutivas

## Playbook de mitigação

### LCP alto
- otimizar mídia hero (`preload`, compressão, formatos webp/avif)
- reduzir bloqueio de terceiros no first paint
- revisar prioridade de recursos críticos

### INP alto
- reduzir handlers pesados no main thread
- quebrar tarefas longas e deferir scripts não críticos
- revisar componentes com transições/efeitos em massa

### CLS alto
- reservar espaço fixo para mídia e blocos dinâmicos
- evitar injeção tardia de elementos acima da dobra
- padronizar alturas mínimas em cards e CTAs

## Critério de pronto (T4.6)

- Runbook definido
- Fonte de dados e metas objetivas publicadas
- Processo de ação para regressão estabelecido

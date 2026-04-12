# 10 — Baseline de KPIs (Sprint 4)

Objetivo: padronizar a leitura semanal de aquisição orgânica e conversão para decisões de copy, CTA e conteúdo.

## Janela de baseline

- Período mínimo: últimos 28 dias
- Fonte primária: GA4
- Fonte secundária: Search Console
- Atualização: semanal (segunda-feira)

## KPIs obrigatórios

| KPI | Fonte | Definição operacional | Fórmula |
|---|---|---|---|
| Sessões orgânicas | GA4 | Tráfego com `session_default_channel_group = Organic Search` | Soma de sessões |
| Conversão LP → registro | GA4 | Taxa de início de cadastro nas páginas de aquisição | `lp_register_start / lp_view` |
| CTR orgânico por URL | Search Console | CTR das páginas money (home + ICP + pilares) | `clicks / impressions` |
| Posição média keywords alvo | Search Console | Ranking médio dos clusters prioritários | Média de `position` |
| Taxa de CTA primário | GA4 | Efetividade do botão principal por página | `lp_cta_primary_click / lp_view` |

## Segmentos mínimos para relatório

- `page_segment`: `home`, `personal`, `nutricionistas`, `afiliados`, `blog`
- `placement`: `hero`, `cta_section`, `segment_switcher_home`, `*_page_main_cta`
- Experimentos: `experiment_id` e `experiment_variant` quando disponíveis

## Meta de qualidade de coleta

- 100% das LPs com `lp_view`
- 100% dos CTAs principais com `lp_cta_primary_click`
- 100% dos inícios de cadastro com `lp_register_start`
- Experimentos com `lp_experiment_view` para leitura por variante

## Rito semanal (30 min)

1. Extrair painel GA4 (últimos 7 e 28 dias)
2. Extrair Search Console (query + página)
3. Atualizar tabela de baseline e delta semanal
4. Abrir ações para:
   - queda > 15% de conversão por página
   - queda > 20% de CTR em página money
   - aumento de tráfego sem aumento de conversão

## Critério de pronto (T4.1)

- Baseline definido com fórmulas, segmentos e rito
- Eventos necessários confirmados na implementação atual
- Próximo ciclo apto para comparação A/B

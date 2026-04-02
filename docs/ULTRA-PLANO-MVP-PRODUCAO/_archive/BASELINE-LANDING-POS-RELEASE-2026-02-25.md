# Baseline Landing — Pós-Release (25/02/2026)

## Objetivo
Congelar os números atuais da aquisição para comparar evolução após melhorias de copy/layout/CTA.

## Janela de medição recomendada
- Período mínimo: 7 dias
- Segmentação: mobile vs desktop

## KPIs principais
| KPI | Fórmula | Baseline atual | Meta ciclo 1 |
|---|---|---:|---:|
| Taxa de clique CTA primário | `lp_cta_primary_click / lp_view` | pendente | +30% |
| Taxa de início de cadastro | `lp_register_start / lp_view` | pendente | +25% |
| Taxa de conclusão de cadastro | `lp_register_complete / lp_register_start` | pendente | +15% |
| Taxa de interesse em preço | `lp_pricing_view / lp_view` | pendente | +20% |

## Eventos instrumentados
- `lp_view`
- `lp_cta_primary_click`
- `lp_cta_secondary_click`
- `lp_pricing_view`
- `lp_register_start`
- `lp_register_complete`

## Fontes de contexto
- UTM persistidas: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Path de origem: `landing_path`

## Checklist operacional
- [x] Eventos instrumentados na home/landing
- [x] CTAs principais instrumentados
- [x] Início de cadastro instrumentado
- [x] Conclusão de cadastro instrumentada
- [ ] Coleta de 7 dias concluída
- [ ] Decisão do 1º A/B test documentada

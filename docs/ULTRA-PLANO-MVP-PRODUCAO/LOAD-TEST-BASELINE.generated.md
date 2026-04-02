# Load Test Baseline (Gerado automaticamente)

> Gerado em: 2026-02-27T08:31:22.953Z
> Base URL: https://api.iapersonal.app.br
> Auth scenarios: disabled

## Resultados
| Cenário | Requisições | Concorrência | Sucesso | Falha | Taxa sucesso | RPS | p50 (ms) | p95 (ms) | p99 (ms) | máx (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Health check | 200 | 20 | 200 | 0 | 100.00% | 24.93 | 380.83 | 2080.99 | 2088.33 | 2138.80 |
| Public exercises list | 120 | 12 | 120 | 0 | 100.00% | 18.85 | 519.22 | 673.95 | 1001.25 | 1004.12 |

## Interpretação inicial
- Baseline não destrutivo (carga controlada) para referência do Lote 009.
- Usar este resultado como comparativo para tuning futuro (Lote 010+).
- Para cenários protegidos, executar com `LOAD_TEST_AUTH_TOKEN` em janela controlada.

## Próximos passos
1. Repetir baseline em horários de pico e fora de pico.
2. Comparar variação de p95/p99 com metas de SLO do Lote 008.
3. Evoluir para cenários de escrita com dados de teste isolados.

# SLO/SLA Baseline (Gerado automaticamente)

> Gerado em: 2026-04-10T22:02:18.289Z
> Lote: 008 — SLO/SLA iniciais

## Escopo inicial
- API Workers (`/health`, `/api/v1/auth/*`, `/api/v1/students/*`, `/api/v1/workouts/*`, `/api/v1/assessments/*`, `/api/v1/payments/*`)
- Dashboard web (Pages)
- Fluxos críticos: auth, pagamentos, avaliações

## SLO propostos (v1)

| Domínio | Indicador | Meta SLO | Janela |
|---|---|---|---|
| API disponibilidade | Sucesso em health check | >= 99.90% | mensal |
| Auth disponibilidade | Login/refresh sem erro 5xx | >= 99.95% | mensal |
| Payments disponibilidade | Criação de cobrança/consulta saldo sem erro 5xx | >= 99.90% | mensal |
| API latência | p95 latência rotas críticas | <= 800 ms | semanal |
| API latência | p99 latência rotas críticas | <= 1500 ms | semanal |
| Frontend disponibilidade | App acessível (probe sintético) | >= 99.90% | mensal |

## SLA interno (operação)

| Severidade | Exemplo | Tempo de resposta | Tempo de mitigação alvo |
|---|---|---:|---:|
| P0 | indisponibilidade auth/payments | <= 15 min | <= 60 min |
| P1 | degradação alta latência | <= 30 min | <= 4 h |
| P2 | erro funcional não crítico | <= 4 h | <= 24 h |

## Error Budget (mensal)
- API 99.90% => budget de indisponibilidade: ~43m 49s/mês
- Auth 99.95% => budget de indisponibilidade: ~21m 54s/mês

## Alertas iniciais
- P0: health check 5xx contínuo por 5 minutos
- P0: taxa de erro 5xx > 5% por 5 minutos em auth/payments
- P1: p95 > 1200ms por 10 minutos
- P1: fila indisponível contínua por 15 minutos (com fallback ativo)

## Evidências operacionais desta baseline
- Qualidade técnica validada (lint/types/build/tests)
- Logs estruturados + requestId ativos
- Scanner de referências sensíveis em CI ativo (`security:audit:ci`)

## Próximos passos
1. Lote 009: teste de carga inicial com metas de throughput/latência
2. Lote 010: backup/restore drill com RTO/RPO formalizados

# 05 — Riscos, Segurança e Rescue

## Threat model resumido

## Ameaça 1: bypass de consultoria paga
- Vetor: abrir sessão/chat premium sem order paid.
- Mitigação:
  1. Enforcement server-side em cada ação premium.
  2. token de sessão vinculado a order_id.
  3. auditoria em ledger_security_events.

## Ameaça 2: inconsistência entre webhook e estado interno
- Vetor: evento atrasado/duplicado fora de ordem.
- Mitigação:
  1. idempotência por provider_event_id.
  2. máquina de estado explícita.
  3. reconciliação diária.

## Ameaça 3: fraude de repasse
- Vetor: manipulação de fee/net no fluxo de settlement.
- Mitigação:
  1. cálculo determinístico no backend.
  2. dupla escrituração em ledger.
  3. bloqueio de payout com inconsistência.

## Error & rescue map (essencial)

| Codepath | Falha | Rescue | Usuário vê |
|---|---|---|---|
| create consultation order | gateway timeout | retry com backoff + pending state | pagamento pendente |
| confirm payment | evento duplicado | idempotência + noop | nada quebra |
| start session | order não paga | 402-like domínio + CTA pagar | ação bloqueada clara |
| settlement job | diff ledger x provider | trava payout + alerta P1 | creator vê payout em análise |

## Rollback

1. Desligar FF_CONSULTATION_PAID_ONLY (retorno ao fluxo anterior).
2. Manter ledger ligado para auditoria, mesmo com rollback funcional.
3. Reprocessar eventos pendentes após estabilização.

RTO alvo: < 30 min
RPO alvo: 0 para eventos financeiros (append-only)

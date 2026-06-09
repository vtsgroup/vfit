# Consultation Alerts (P1/P2)

Updated: 2026-06-09
Scope: consultation commerce monitoring and incident thresholds

## Alert Sources

- Cron job: runConsultationReconciliation
- Log sink: app_logs table
- Path: /cron/consultation-reconciliation

## P1 Alerts

1. Ledger mismatch detected
- Source: alerts.consultation.p1.ledger_mismatch
- Trigger: missingEntries > 0
- Level: error

2. Unauthorized premium attempts spike
- Source: alerts.consultation.p1.unauthorized_premium_attempts
- Trigger: security_violation events >= 10 in 60 minutes
- Level: error

## P2 Alerts

1. Stale pending consultation orders
- Source: alerts.consultation.p2.stale_pending_orders
- Trigger: pending orders with asaas_payment_id and age > 30 min, count >= 5
- Level: warn

## Operational Queries

```sql
-- Recent consultation alerts
SELECT created_at, level, source, message, context
FROM app_logs
WHERE source LIKE 'alerts.consultation.%'
ORDER BY created_at DESC
LIMIT 100;

-- Open payout risk per creator
SELECT creator_id, COUNT(*)
FROM consultation_orders co
WHERE co.status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM consultation_ledger_events le
    WHERE le.order_id = co.id AND le.event_type = 'creator_settled'
  )
GROUP BY creator_id
ORDER BY count DESC;
```

## Escalation

- P1: on-call response in 15 min, mitigation target 60 min
- P2: on-call response in 30 min, mitigation target 4 h

## Validation Checklist

1. Cron 0 */4 * * * running without errors
2. app_logs receiving alerts.consultation.* entries
3. smoke:consultations:local runs with valid tokens
4. runbook and support playbook updated

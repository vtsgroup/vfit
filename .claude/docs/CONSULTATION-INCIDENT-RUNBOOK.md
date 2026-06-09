# Consultation Incident Runbook

Updated: 2026-06-09
Scope: student-first consultation commerce (offers, orders, sessions, ledger)

## P1 and P2 Trigger Matrix

- P1: consultation ledger mismatch above threshold (missingEntries > 0 in reconciliation)
- P1: repeated unauthorized premium session attempts spike
- P2: webhook delay or delivery failures from Asaas
- P2: checkout error ratio above baseline

## Immediate Triage

1. Confirm API health at /health and /api/v1/consultations/offers.
2. Run consultation smoke locally with environment tokens.
3. Check reconciliation endpoint for missing ledger entries.
4. Validate recent Asaas webhook events for consult_order_ external references.

## Commands

```bash
npm run smoke:consultations:local
npm run smoke:auth:local
npm run type-check
```

## Reconciliation Checks

1. Admin endpoint:
   GET /api/v1/consultations/admin/ledger/reconciliation?days=7
2. Creator endpoint:
   GET /api/v1/consultations/admin/ledger/creator/:id/status
3. Verify that all paid consultation orders have:
   - order_paid
   - fee_charged
   - creator_settled
4. Verify refunded orders have:
   - refunded

## Payout Safety Rule

- If creator status returns inconsistentOrders > 0, payouts stay blocked at POST /api/v1/payments/transfers/pix.
- Unblock only after reconciliation returns zero missing entries.

## Recovery Procedure

1. Identify affected order IDs from reconciliation report.
2. Reprocess payment confirmation/refund signal via idempotent ledger writer path.
3. Re-run reconciliation endpoint.
4. Re-run smoke checks and confirm no failed checks.
5. Document incident in changelog and operations notes.

## Rollback Strategy

1. Keep ledger table active (append-only) even during functional rollback.
2. If needed, stop premium session start by returning payment-required domain error.
3. Re-enable flow after ledger consistency is restored.

## Evidence Files

- .claude/docs/archive/legacy-plans/CONSULTATION-SMOKE.generated.md
- docs/CHANGELOG.md
- .claude/plans/alunos-pagam-profissionais-free/TRACKING.md

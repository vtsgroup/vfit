# Consultation Smoke Report

- Run ID: consult-20260609151512
- Generated at: 2026-06-09T15:15:19.676Z
- Base URL: https://api.vfit.app.br
- Passed: 1
- Failed: 5
- Skipped: 1

| Check | Status | Code | Latency (ms) | Error |
|---|---|---:|---:|---|
| Personal auth me | failed | network_error | 1109 | fetch failed |
| Student auth me | failed | 401 | 1635 | Token expirado, faça refresh |
| Admin auth me | failed | network_error | 761 | fetch failed |
| Public consultation offers | failed | 401 | 792 | Token expirado, faça refresh |
| Admin ledger creator status | skipped | - | 0 | personal id indisponivel |
| Admin ledger reconciliation | failed | 401 | 1682 | Token expirado, faça refresh |
| Student cannot access admin ledger | passed | 401 | 716 |  |

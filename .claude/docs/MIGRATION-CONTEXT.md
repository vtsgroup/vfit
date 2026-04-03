# Migração VFIT — Contexto (02/04/2026)

## O que aconteceu

O projeto migrou de infraestrutura completa em 02/04/2026:

| Item | Antes | Agora |
|------|-------|-------|
| GitHub | `victor-development/personal-ia` | **`vtsgroup/vfit`** |
| Workspace | `personal-ia-prod/` | **`vfit-production/`** |
| CF Worker | `personal-ia-api` | **`vfit-api`** |
| CF Pages | `personal-ia-prod` | **`vfit`** |
| D1 | `personaliai-exercises` | **`vfit-exercises`** |
| Hyperdrive | `personaliai-db` | **`vfit-db`** |
| KV | `personaliai-*` | **`vfit-*`** |
| R2 | `personaliai-media` | **`vfit-media`** |
| Auth key | `personal-ia-auth` | **`vfit-auth`** (migração automática) |
| Package | `personal-ia` | **`vfit`** |

## O que NÃO mudou

- Domínios: `iapersonal.app.br` + `api.iapersonal.app.br`
- Neon DB: mesma connection string
- CF Account: `b0bf95d0fabb322ac3df37bd84ec0c77`
- Zone ID: `71e8d150d12015b016231950337b075e`
- Funcionalidades: todas preservadas

## DNS

- `api.iapersonal.app.br` → AAAA `100::` proxied (Workers route)
- Record ID: `9bd68a376d9ed12102ba6ad5700a6f45`
- Criado via CF API com Global API Key

## Commits

```
966c50ee — VFIT v1.0.0 Initial release
89906007 — Complete CF infrastructure migration
e3c08017 — Rename workspace
55b6dc3b — Fix 42 TypeScript errors
68814be3 — Docs migration context
6cfdba19 — Fix Turnstile + DNS record (v1.0.2)
```

## Referências legadas

Ao encontrar `personal-ia`, `personaliai`, `pia` ou `evoluia` no código:
- Em **docs/archive/** ou **docs/MIGRATION-*.md**: manter (histórico)
- Em **código de produção**: substituir por `vfit`
- Em **variáveis globais**: renomear (`__piaTurnstile` → `__vfitTurnstile` — já feito)

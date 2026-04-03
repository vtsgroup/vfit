# Secrets Migration Inventory — 2026-02-22

## Escopo auditado

- Workers scripts (conta):
  - offshore-proz-article-scheduler
  - offshoreproz-email-scheduler
  - vfiti-api
- Pages projects (conta):
  - portugal-festas
  - cms-offshore-proz
  - personal-ia-prod
  - vts-dev
  - victor-pt
  - site-offshore
  - offshoreproz-docs
  - pmz-capital
  - bet67-customization
- Secret Store (account-level):
  - default_secrets_store (`88b0ebf0455e437c8d75597ba6aae568`) — atualmente sem secrets

## Secrets por Worker

### offshore-proz-article-scheduler
- CRON_SECRET
- LINKEDIN_ACCESS_TOKEN
- LINKEDIN_USER_URN
- NOTIFY_EMAIL
- OPENROUTER_API_KEY
- RESEND_API_KEY

### offshoreproz-email-scheduler
- CRON_SECRET

### vfiti-api
- ASAAS_API_KEY
- ASAAS_WEBHOOK_TOKEN
- EMAIL_FROM
- FACEBOOK_APP_ID
- FACEBOOK_APP_SECRET
- FACEBOOK_REDIRECT_URI
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- JWT_REFRESH_SECRET
- JWT_SECRET
- NEON_DATABASE_URL
- ONESIGNAL_APP_ID
- ONESIGNAL_REST_KEY
- REPLICATE_API_TOKEN
- RESEND_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY

## Secrets por Pages (produção)

### portugal-festas
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### cms-offshore-proz
- ADMIN_PASSWORD
- CRON_SECRET
- GITHUB_TOKEN
- JWT_SECRET
- NOTIFY_EMAIL
- OPENROUTER_API_KEY
- RESEND_API_KEY
- SESSION_SECRET

### offshoreproz-docs
- ADMIN_PASSWORD_HASH
- CRON_SECRET
- ONEDRIVE_CLIENT_ID
- ONEDRIVE_CLIENT_SECRET
- ONEDRIVE_REFRESH_TOKEN
- OPENROUTER_API_KEY
- RESEND_API_KEY

### Sem secrets (produção)
- personal-ia-prod
- vts-dev
- victor-pt
- site-offshore
- pmz-capital
- bet67-customization

## União deduplicada (29 nomes)

- ADMIN_PASSWORD
- ADMIN_PASSWORD_HASH
- ASAAS_API_KEY
- ASAAS_WEBHOOK_TOKEN
- CRON_SECRET
- EMAIL_FROM
- FACEBOOK_APP_ID
- FACEBOOK_APP_SECRET
- FACEBOOK_REDIRECT_URI
- GITHUB_TOKEN
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI
- JWT_REFRESH_SECRET
- JWT_SECRET
- LINKEDIN_ACCESS_TOKEN
- LINKEDIN_USER_URN
- NEON_DATABASE_URL
- NOTIFY_EMAIL
- ONEDRIVE_CLIENT_ID
- ONEDRIVE_CLIENT_SECRET
- ONEDRIVE_REFRESH_TOKEN
- ONESIGNAL_APP_ID
- ONESIGNAL_REST_KEY
- OPENROUTER_API_KEY
- REPLICATE_API_TOKEN
- RESEND_API_KEY
- SESSION_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY

## Convenção recomendada no Secret Store

Para evitar colisão entre apps, usar nomes com prefixo por aplicação:

- `VFITI_API__<SECRET_NAME>`
- `OFFSHORE_ARTICLE__<SECRET_NAME>`
- `OFFSHORE_EMAIL__<SECRET_NAME>`
- `PAGES_CMS_OFFSHORE__<SECRET_NAME>`
- `PAGES_DOCS_OFFSHORE__<SECRET_NAME>`
- `PAGES_PORTUGAL_FESTAS__<SECRET_NAME>`

Exemplo:
- `VFITI_API__JWT_SECRET`
- `PAGES_CMS_OFFSHORE__JWT_SECRET`

## Ordem de migração segura

1. Criar secrets novos no Secret Store (sem remover os antigos).
2. Vincular aplicações para ler do Secret Store.
3. Validar healthchecks por aplicação.
4. Rotacionar/invalidar credenciais antigas no provedor externo.
5. Remover secrets legados por Worker/Pages.

## Status

- Inventário: ✅ concluído
- Seed no Secret Store: ⏳ pendente (inserção manual dos valores)
- Cutover por aplicação: ⏳ pendente

#!/usr/bin/env bash
set -euo pipefail

# Uso:
#   STORE_ID=88b0ebf0455e437c8d75597ba6aae568 ./scripts/secrets-store-seed.sh
#
# O comando abaixo NÃO recebe valor por CLI.
# O Wrangler vai solicitar cada valor de forma interativa.

STORE_ID="${STORE_ID:-}"
if [[ -z "$STORE_ID" ]]; then
  echo "Defina STORE_ID, ex: STORE_ID=88b0ebf0455e437c8d75597ba6aae568 ./scripts/secrets-store-seed.sh"
  exit 1
fi

create_secret() {
  local name="$1"
  echo "\n=== Criando: $name ==="
  npx wrangler secrets-store secret create "$STORE_ID" \
    --name "$name" \
    --scopes workers \
    --comment "seed-2026-02-22" \
    --remote
}

# personaliai-api (legacy CF name — keep until resource renamed)
create_secret "PERSONALIAI_API__ASAAS_API_KEY"
create_secret "PERSONALIAI_API__ASAAS_WEBHOOK_TOKEN"
create_secret "PERSONALIAI_API__EMAIL_FROM"
create_secret "PERSONALIAI_API__FACEBOOK_APP_ID"
create_secret "PERSONALIAI_API__FACEBOOK_APP_SECRET"
create_secret "PERSONALIAI_API__FACEBOOK_REDIRECT_URI"
create_secret "PERSONALIAI_API__GOOGLE_CLIENT_ID"
create_secret "PERSONALIAI_API__GOOGLE_CLIENT_SECRET"
create_secret "PERSONALIAI_API__GOOGLE_REDIRECT_URI"
create_secret "PERSONALIAI_API__JWT_REFRESH_SECRET"
create_secret "PERSONALIAI_API__JWT_SECRET"
create_secret "PERSONALIAI_API__DATABASE_URL"
create_secret "PERSONALIAI_API__ONESIGNAL_APP_ID"
create_secret "PERSONALIAI_API__ONESIGNAL_REST_KEY"
create_secret "PERSONALIAI_API__REPLICATE_API_TOKEN"
create_secret "PERSONALIAI_API__RESEND_API_KEY"
create_secret "PERSONALIAI_API__STRIPE_SECRET_KEY"
create_secret "PERSONALIAI_API__STRIPE_WEBHOOK_SECRET"
create_secret "PERSONALIAI_API__TURNSTILE_SECRET_KEY"

# offshore-proz-article-scheduler
create_secret "OFFSHORE_ARTICLE__CRON_SECRET"
create_secret "OFFSHORE_ARTICLE__LINKEDIN_ACCESS_TOKEN"
create_secret "OFFSHORE_ARTICLE__LINKEDIN_USER_URN"
create_secret "OFFSHORE_ARTICLE__NOTIFY_EMAIL"
create_secret "OFFSHORE_ARTICLE__OPENROUTER_API_KEY"
create_secret "OFFSHORE_ARTICLE__RESEND_API_KEY"

# offshoreproz-email-scheduler
create_secret "OFFSHORE_EMAIL__CRON_SECRET"

# pages cms-offshore-proz
create_secret "PAGES_CMS_OFFSHORE__ADMIN_PASSWORD"
create_secret "PAGES_CMS_OFFSHORE__CRON_SECRET"
create_secret "PAGES_CMS_OFFSHORE__GITHUB_TOKEN"
create_secret "PAGES_CMS_OFFSHORE__JWT_SECRET"
create_secret "PAGES_CMS_OFFSHORE__NOTIFY_EMAIL"
create_secret "PAGES_CMS_OFFSHORE__OPENROUTER_API_KEY"
create_secret "PAGES_CMS_OFFSHORE__RESEND_API_KEY"
create_secret "PAGES_CMS_OFFSHORE__SESSION_SECRET"

# pages offshoreproz-docs
create_secret "PAGES_DOCS_OFFSHORE__ADMIN_PASSWORD_HASH"
create_secret "PAGES_DOCS_OFFSHORE__CRON_SECRET"
create_secret "PAGES_DOCS_OFFSHORE__ONEDRIVE_CLIENT_ID"
create_secret "PAGES_DOCS_OFFSHORE__ONEDRIVE_CLIENT_SECRET"
create_secret "PAGES_DOCS_OFFSHORE__ONEDRIVE_REFRESH_TOKEN"
create_secret "PAGES_DOCS_OFFSHORE__OPENROUTER_API_KEY"
create_secret "PAGES_DOCS_OFFSHORE__RESEND_API_KEY"

# pages portugal-festas
create_secret "PAGES_PORTUGAL_FESTAS__GOOGLE_CLIENT_ID"
create_secret "PAGES_PORTUGAL_FESTAS__GOOGLE_CLIENT_SECRET"

echo "\n✅ Seed concluído. Próximo passo: bind por aplicação + cutover controlado."

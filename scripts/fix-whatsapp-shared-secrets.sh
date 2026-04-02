#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/macos/Development/apps/personal-ia-prod"
STORE_ID="88b0ebf0455e437c8d75597ba6aae568"
CF_ACCOUNT_ID="b0bf95d0fabb322ac3df37bd84ec0c77"

# Secret IDs (Secrets Store remoto)
SECRET_ID_UNIPILE_API_KEY="5bb438298f3f4fbd956d095ab3b06097"
SECRET_ID_UNIPILE_ACCOUNT_ID="1e9d1774c15542b4820969bbf8856e83"
SECRET_ID_UNIPILE_GROUP_CHAT_ID="1e7f9361d88149d3b2fced8c720d327a"
SECRET_ID_UNIPILE_GROUP_NAME="183f982e0c0f48d9b9c298ec17f4c88f"

cd "$ROOT_DIR"

if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi

export CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"

echo "Cole apenas a chave da Unipile (UNIPILE_API_KEY)."
read -s "?UNIPILE_API_KEY: " U_API_KEY; echo

# Defaults já confirmados em docs/worker
U_ACCOUNT_ID="nEog3ulQQYeAoZR8zvmINQ"
U_CHAT_ID="Rzsb4DgGVp6NDV5IWA5w5Q"
U_GROUP_NAME="Logs e Docs: IA + PERSONAL"

echo "\n🔐 Atualizando shared secrets..."
npx wrangler secrets-store secret update "$STORE_ID" --remote --secret-id "$SECRET_ID_UNIPILE_API_KEY" --value "$U_API_KEY"
npx wrangler secrets-store secret update "$STORE_ID" --remote --secret-id "$SECRET_ID_UNIPILE_ACCOUNT_ID" --value "$U_ACCOUNT_ID"
npx wrangler secrets-store secret update "$STORE_ID" --remote --secret-id "$SECRET_ID_UNIPILE_GROUP_CHAT_ID" --value "$U_CHAT_ID"
npx wrangler secrets-store secret update "$STORE_ID" --remote --secret-id "$SECRET_ID_UNIPILE_GROUP_NAME" --value "$U_GROUP_NAME"

echo "\n🚀 Deploy do worker whatsapp..."
cd "$ROOT_DIR/workers/whatsapp"
CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID" npx wrangler deploy

echo "\n🧪 Smoke test /task-notify..."
cd "$ROOT_DIR"
set -a; source .env.local; set +a
curl -sS -X POST "https://vfit-whatsapp.vd-b0b.workers.dev/task-notify" \
  -H "Authorization: Bearer $WHATSAPP_NOTIFY_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"event":"start","actor_label":"Developer Agent","title":"Smoke WhatsApp pós-secrets","task_id":"WA-SMOKE-2026-02-24","priority":"ALTA"}' | jq

echo "\n📲 Enviando start/end da Sprint S1..."
node scripts/whatsapp-task.mjs start --task-id S1-2026-02-24-R1 --title "Sprint S1 R1 - Overlays e Safe Area" --priority ALTA --actor "Developer Agent" --link "https://iapersonal.app.br/dashboard/workouts/create"
node scripts/whatsapp-task.mjs end --task-id S1-2026-02-24-R1 --title "Sprint S1 R1 - Overlays e Safe Area" --status success --deploy v3.3.1 --actor "Developer Agent" --summary "✅ Debug panel com camadas ajustadas (z-index)" --summary "✅ Passkey prompt com safe-area + scroll interno" --summary "✅ Crop modal e install overlay com safe-area" --summary "✅ Fluxo workouts/create validado com safe-area-inset-bottom"

echo "\n✅ Fluxo concluído."
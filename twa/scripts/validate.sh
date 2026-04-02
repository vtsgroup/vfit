#!/bin/bash
# validate.sh — Valida PWA, assetlinks e ambiente antes do build
# Uso: npm run validate

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0
WARNINGS=0

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   VFIT — TWA Validação                   ║"
echo "╚══════════════════════════════════════════╝"

# ─── Validar assetlinks em produção ──────────────────────────────
echo ""
echo "🔍  Verificando assetlinks em produção..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  https://iapersonal.app.br/.well-known/assetlinks.json)

if [ "$RESPONSE" = "200" ]; then
  echo "  ✅ assetlinks.json acessível (HTTP 200)"
  CONTENT=$(curl -s https://iapersonal.app.br/.well-known/assetlinks.json)
  if echo "$CONTENT" | grep -q "br.app.vfit"; then
    echo "  ✅ Package ID correto: br.app.vfit"
  else
    echo "  ❌ Package ID não encontrado no assetlinks.json!"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ⚠️  assetlinks.json retornou HTTP $RESPONSE (deploy do frontend pendente)"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Validar manifest PWA em produção ────────────────────────────
echo ""
echo "🔍  Verificando manifest.json em produção..."
MANIFEST_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  https://iapersonal.app.br/manifest.json)

if [ "$MANIFEST_HTTP" = "200" ]; then
  echo "  ✅ manifest.json acessível (HTTP 200)"
  MANIFEST_CONTENT=$(curl -s https://iapersonal.app.br/manifest.json)
  if echo "$MANIFEST_CONTENT" | grep -q '"standalone"'; then
    echo "  ✅ display: standalone"
  else
    echo "  ⚠️  display não é standalone"
    WARNINGS=$((WARNINGS + 1))
  fi
  if echo "$MANIFEST_CONTENT" | grep -q '"icons"'; then
    echo "  ✅ icons definidos"
  else
    echo "  ❌ icons não encontrados no manifest!"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ❌ manifest.json retornou HTTP $MANIFEST_HTTP"
  ERRORS=$((ERRORS + 1))
fi

# ─── Validar ícones em produção ───────────────────────────────────
echo ""
echo "🔍  Verificando ícones em produção..."
for size in 192 512; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://iapersonal.app.br/icons/icon-${size}.png")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ icon-${size}.png (HTTP 200)"
  else
    echo "  ❌ icon-${size}.png retornou HTTP $STATUS"
    ERRORS=$((ERRORS + 1))
  fi
done

# ─── Verificar maskable icons ─────────────────────────────────────
echo ""
echo "🔍  Verificando maskable icons em produção..."
for size in 192 512; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://iapersonal.app.br/icons/icon-${size}-maskable.png")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ icon-${size}-maskable.png (HTTP 200)"
  else
    echo "  ⚠️  icon-${size}-maskable.png retornou HTTP $STATUS"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# ─── Verificar keystore ───────────────────────────────────────────
echo ""
echo "🔍  Verificando keystore..."
if [ -f "$DIR/keystore/vfit-release.jks" ]; then
  echo "  ✅ Keystore encontrado"
else
  echo "  ⚠️  Keystore não encontrado. Execute: npm run setup"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Verificar ícone fonte ────────────────────────────────────────
echo ""
echo "🔍  Verificando ícone base..."
if [ -f "$DIR/icons/source/icon-1024.png" ]; then
  echo "  ✅ icon-1024.png encontrado"
else
  echo "  ⚠️  Ícone base não encontrado: twa/icons/source/icon-1024.png"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Verificar Bubblewrap ─────────────────────────────────────────
echo ""
echo "🔍  Verificando Bubblewrap..."
if command -v bubblewrap &>/dev/null; then
  echo "  ✅ Bubblewrap: $(bubblewrap --version 2>/dev/null)"
else
  echo "  ⚠️  Bubblewrap não instalado: npm install -g @bubblewrap/cli"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Verificar Java ───────────────────────────────────────────────
echo ""
echo "🔍  Verificando Java..."
if command -v java &>/dev/null; then
  JAVA_VER=$(java -version 2>&1 | head -1)
  echo "  ✅ Java: $JAVA_VER"
else
  echo "  ⚠️  Java não encontrado: brew install openjdk@17"
  WARNINGS=$((WARNINGS + 1))
fi

# ─── Resultado ───────────────────────────────────────────────────
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "╔══════════════════════════════════════════════╗"
  echo "║   ✅ Tudo OK! Pronto para: npm run build     ║"
  echo "╚══════════════════════════════════════════════╝"
elif [ $ERRORS -eq 0 ]; then
  echo "╔══════════════════════════════════════════════╗"
  echo "║   ⚠️  $WARNINGS aviso(s) — build pode prosseguir ║"
  echo "╚══════════════════════════════════════════════╝"
else
  echo "╔══════════════════════════════════════════════╗"
  echo "║   ❌ $ERRORS erro(s) + $WARNINGS aviso(s)              ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""
  echo "   Corrija os erros acima antes de fazer o build."
fi
echo ""

[ $ERRORS -eq 0 ]

#!/bin/bash

# Script para extrair SHAs do keystore e preparar build
# ⚠️  USE COM CUIDADO - NÃO COMMITAR ESTE ARQUIVO

set -e

KEYSTORE_PATH="twa/keystore/vfit-release.jks"
ALIAS="vfit"

echo "🔐 Extraindo fingerprints do keystore..."
echo ""

# Solicita senha (vai pedir interativamente)
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$ALIAS" | grep -A 1 "SHA"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ SHA-1: Copiar e colar no Google Play Console → App Signing"
echo "✅ SHA-256: Já está em public/.well-known/assetlinks.json"
echo ""
echo "🚀 Para fazer build com a senha:"
echo ""
echo "   export KEYSTORE_PASS='<sua_senha_aqui>'"
echo "   cd twa && ./gradlew bundleRelease --info"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

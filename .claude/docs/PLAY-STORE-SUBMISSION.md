# 📱 Google Play Store - Guia Completo de Submission (VFIT v4.3.0)

> **Status:** ✅ READY FOR PRODUCTION  
> **App:** VFIT (br.app.vfit)  
> **Version:** 4.3.0 (versionCode: 430)  
> **Date:** May 11, 2026  
> **Build:** app-release.aab (1.7 MB)

---

## 📋 Pré-Requisitos

### ✅ Verificar AAB Gerado

```bash
# 1. Confirmar arquivo existe
ls -lh /Users/macos/Development/apps/vfit-production/twa/app/build/outputs/bundle/release/app-release.aab

# Esperado:
# -rw-r--r--@ 1 macos staff 1.7M May 11 01:47 app-release.aab

# 2. Fazer backup seguro
cp app-release.aab ~/Desktop/vfit-v4.3.0-release.aab
```

---

## 🔐 Certificados & SHAs - Referência Completa

### SHA-256 (Upload/App Signing Key)

```
E1:55:72:99:10:B3:A7:42:D3:DF:DE:F2:D1:32:7E:9B:4C:8C:15:A8:08:4A:E8:6F:8B:07:28:FC:A4:E6:5F:3A
```

**Onde está:**
- ✅ `public/.well-known/assetlinks.json` (JÁ CONFIGURADO)
- ✅ Google Play Console (exibido automaticamente após upload)
- ✅ Certificado do keystore (personalia)

**Função:**
- Valida app linking (vfit.app.br → abre no app)
- Autenticação do certificado de assinatura
- Verificação de integridade do APK/AAB

### SHA-1 (Legacy/Reference)

```
58:14:E9:08:81:32:56:D7:62:A5:26:47:0F:FC:5E:11:91:85:BA:3[...]
```

**Status:** ⚠️ **NÃO adicione em lugar nenhum**
- Deprecated desde Android 2019
- Google exibe apenas para referência (legacy support)
- SHA-256 é o padrão moderno

---

## 🚀 Passo a Passo - Google Play Console

### ETAPA 1: Preparação (5 min)

#### 1.1 - Acessar Play Console

```
URL: https://play.google.com/console
Login: Conta Google com acesso ao br.app.vfit
```

#### 1.2 - Navegar até Release

```
Dashboard Home
   ↓
Menu esquerdo: "Release"
   ↓
Selecionar: "Production"
   ↓
Botão: "Create new release"
```

---

### ETAPA 2: Upload do AAB (3 min)

#### 2.1 - Release Configuration

Tela: **Release details**

```
Release type:       Bundle (AAB)  ← IMPORTANTE: é AAB, não APK
Countries:          All countries (manter padrão)
Initial rollout:    Choose later  ← Vamos fazer staged (5% → 100%)
```

#### 2.2 - Upload File

Seção: **App bundles**

```
Clique: "Upload" ou Drag-and-drop
   ↓
Selecione: vfit-v4.3.0-release.aab
   ↓
Aguarde: Validação Google (1-2 min)
```

**Google valida automaticamente:**

```
✅ Bundle signed correctly
✅ Bundle version: 4.3.0 (430)
✅ Minimum SDK: 24 (Android 7.0)
✅ Target SDK: 35 (Android 15)
✅ App signing certificate: E1:55:72:99:10:B3:A7:42:[...]

App Signing by Google Play:
  Status: ✅ Configured
  Certificate: E1:55:72:99:10:B3:A7:42:D3:DF:DE:F2:D1:32:7E:9B:[...]
```

---

### ETAPA 3: Configurar Release (4 min)

#### 3.1 - Release Notes

Seção: **Release notes**

**Portuguese (Brazil):**
```
VFIT v4.3.0

🆕 Novo:
• Design de ícones completo (100% canvas, sem padding)
• Suporte nativo a Android 15 (targetSdkVersion 35)
• Ícones adaptativos para múltiplas densidades
• Otimizações de performance no TWA

🔒 Segurança:
• Certificados de app linking atualizados
• Assinatura APK com keystore robusto
• Deep linking habilitado (vfit.app.br)

📱 Compatibilidade:
• Android 7.0+ (minSdkVersion 24)
• Suporte a PWA offline
• App linking com delegação de URL
```

**English:**
```
VFIT v4.3.0

🆕 New:
• Complete icon design (100% canvas, no padding)
• Native Android 15 support (targetSdkVersion 35)
• Adaptive icons for multiple densities
• TWA performance optimizations

🔒 Security:
• Updated app linking certificates
• Robust keystore APK signing
• Deep linking enabled (vfit.app.br)

📱 Compatibility:
• Android 7.0+ (minSdkVersion 24)
• PWA offline support
• URL delegation for app linking
```

#### 3.2 - Countries & Languages

```
Countries:     All countries  (mantém selecionado)
Languages:     Portuguese (Brazil), English
```

---

### ETAPA 4: Staged Rollout (⚠️ CRÍTICO)

#### 4.1 - Por que fazer em fases?

```
Evita: Quebra geral caso algo de errado
Monitora: Crashes, feedback negativo, problemas
Reverte: Se necessário, em minutos (não em dias)
```

#### 4.2 - Estratégia Recomendada

**Dia 1: 5% rollout**
```
Clique: "Enable phased rollout"
   ↓
Percentage: 5%
   ↓
Monitore por 4-6 horas:
  • Crashes & ANRs (menu: Vitals → Crashes)
  • User reviews (1★ - 5★)
  • Rating trend
  
Se OK → próximo dia
Se problema → "Pause rollout" e investigate
```

**Dia 2: 10% rollout**
```
Se sem crashes em 24h, aumentar para 10%
Monitore por 12-24h
```

**Dia 3: 50% rollout**
```
Confiança aumentada
Pode aumentar para 50%
```

**Dia 4: 100% rollout**
```
Release para todos os usuários
```

---

### ETAPA 5: Review & Submit (2 min)

#### 5.1 - Revisar Tudo

Clique: **"Review"** (canto inferior)

```
Checklist de Validação:

✅ App Information
   • Name: VFIT
   • Package: br.app.vfit
   • Category: Health & Fitness

✅ Release Information
   • Version: 4.3.0
   • Version code: 430
   • Release type: Production

✅ Bundle Details
   • Type: AAB (Bundle)
   • Size: 1.7 MB
   • Min SDK: 24
   • Target SDK: 35
   • Compile SDK: 36

✅ Languages
   • Portuguese (Brazil)
   • English

✅ Release Notes
   • PT-BR: ✅ Preenchido
   • EN: ✅ Preenchido

✅ Rollout Strategy
   • Staged: 5% → 100% (ou remover para 100% direto)

✅ Content Rating
   • Must have: Complete (se não tiver, preencher agora)

✅ Privacy Policy
   • Required: Deve estar em vfit.app.br/privacy (se obrigatório)
```

#### 5.2 - ENVIAR PARA REVIEW

```
Botão Final: "Send for review"
   ↓
Popup: "Are you sure?"
   ↓
Clique: "Confirm"
   ↓
✅ Release submitted for review!
```

---

## 📊 Timeline Esperado

| Fase | Duração | Status | Ação |
|------|---------|--------|------|
| **Submit** | T+0 | "Pending review" (amarelo) | Aguarde Google revisar |
| **Review** | 2-4h | "Under review" (azul) | Checagem automática de políticas |
| **Approval** | 4-6h | "Published" (verde) | 🎉 APP LIVE! |
| **Indexing** | 2-3h | Searchable | Aparecer no Play Store |

**Se Rejected:**
- Google envia email com motivo (24h)
- Corrigir issue
- Resubmeter manualmente

---

## ✅ Validação Pós-Publicação

### Imediatamente (T+0)

```bash
# 1. Confirmar status no Console
#    Status deve ser: "Published" (verde)

# 2. Verificar Build & Release Info
#    Version: 4.3.0 ✅
#    Version code: 430 ✅
#    Min SDK: 24 ✅
#    Target SDK: 35 ✅
```

### Após 2-3 horas (T+2-3h)

```bash
# 1. Procurar no Play Store
#    Search: "VFIT" ou "Treinos com IA"
#    ✅ Deve aparecer

# 2. Verificar ícone
#    ✅ Deve ser redondo com logo verde
#    ✅ Deve aparecer correto em múltiplas densidades

# 3. Verificar screenshots
#    ✅ Aparecer em pt-BR e en-US
```

### Após 24h (T+24h)

```bash
# 1. Testar App Linking (CRÍTICO)
#    Ação: Abrir navegador → https://vfit.app.br/dashboard
#    ✅ Esperado: Abre direto no app (se instalado)
#    ❌ Problema: Se abre no navegador, assetlinks.json inválido

# 2. Monitorar Vitals (Play Console)
#    Menu: Vitals → Crashes & ANRs
#    ✅ Esperado: Zero crashes nas primeiras 24h
#    ❌ Problema: Investigar + hotfix

# 3. Ler Reviews
#    ✅ Rating deve estar entre 4-5 stars
#    ❌ Rating < 3: Problema encontrado, comunicar via update
```

### Após 48h (T+48h)

```bash
# 1. User Growth
#    Console: Acquisition → Overview
#    ✅ Usuários começando a instalar

# 2. Retention
#    Console: Retention → Day 1
#    ✅ 30%+ de usuários voltam no dia 2

# 3. Rollout Progress
#    Console: Release notes
#    ✅ Percentual aumentando conforme agendado
```

---

## 🆘 Troubleshooting

### ❌ "Build failed - Certificate not found"

**Causa:** Alias errado no keystore

```bash
# Verificar alias correto
keytool -list -keystore twa/keystore/vfit-release.jks \
  -storepass "Tw4#9wo4nseWIrW1qG6qnzIOobGJNbjfkR1l"

# Output esperado:
# personalia, Mar 4, 2026, PrivateKeyEntry

# Corrigir em: twa/app/build.gradle
# keyAlias "personalia"  ← é isso, não "vfit"
```

### ❌ "App linking not working"

**Causa:** assetlinks.json inválido ou não publicado

```bash
# Validar URL
curl -I https://vfit.app.br/.well-known/assetlinks.json
# Esperado: HTTP 200

# Verificar conteúdo
curl https://vfit.app.br/.well-known/assetlinks.json | jq .
# Esperado:
# {
#   "relation": ["delegate_permission/common.handle_all_urls"],
#   "target": {
#     "namespace": "android_app",
#     "package_name": "br.app.vfit",
#     "sha256_cert_fingerprints": ["E1:55:72:99:10:B3:A7:42:..."]
#   }
# }
```

### ❌ "Release rejected by Google"

**Motivos comuns:**

| Motivo | Solução |
|--------|---------|
| **Missing privacy policy** | Adicionar em vfit.app.br/privacy |
| **Invalid icon** | Regenerar com script icons |
| **Malware detected** | Pode ser false positive, resubmeter |
| **Excessive permissions** | Revisar AndroidManifest.xml |
| **Crash on startup** | Testar localmente antes de resubmeter |

---

## 📝 Documentação Relacionada

- **Icon System:** [Design System - Ícones](DESIGN-SYSTEM.md#ícones--dsicon-obrigatório)
- **Asset Linking:** [App Linking Configuration](STACK.md#-app-linking)
- **Build Config:** [TWA Documentation](TWA-DOCUMENTATION.md)
- **Deploy:** [Production Deployment](DEPLOY.md)

---

## 🔒 Segurança & Boas Práticas

### ❌ NUNCA

```bash
# ❌ Commitar keystore password em Git
echo "KEYSTORE_PASS=senha123" >> .env.local
git add .env.local  # NÃO FAÇA!

# ❌ Fazer push de keystore file
git add twa/keystore/vfit-release.jks  # JÁ ESTÁ IGNORADO (.gitignore)

# ❌ Resets massivos sem backup
git force-push  # Backup antigo = perda de certificado
```

### ✅ SEMPRE

```bash
# ✅ Export temporário em shell
export KEYSTORE_PASS="senha"
cd twa && ./gradlew bundleRelease
# Depois: unset KEYSTORE_PASS

# ✅ Backup do keystore
cp twa/keystore/vfit-release.jks ~/BACKUPS/vfit-release-2026.jks

# ✅ Manter SHA-256 documentado
# Já está em assetlinks.json (controlado no Git)
```

---

## 📞 Checklist Final

```
PRÉ-UPLOAD:
☑️ AAB gerado (1.7 MB)
☑️ Version 4.3.0 (430) ✅
☑️ Min SDK 24, Target SDK 35 ✅
☑️ Package br.app.vfit ✅
☑️ Backup de keystore realizado ✅

NO CONSOLE:
☑️ Release notes em PT-BR e EN
☑️ Countries: All (ou selecionar Brasil primeiro)
☑️ Staged rollout configurado (5% → 100%)
☑️ Content rating completo
☑️ Privacy policy válida

PÓS-PUBLICAÇÃO:
☑️ Status "Published" (verde)
☑️ App linking testado
☑️ Ícone aparecendo corretamente
☑️ Sem crashes nas primeiras 24h
☑️ Reviews positivos (4-5 stars)
```

---

## 📞 Suporte

- **Google Play Help:** https://support.google.com/googleplay/android-developer
- **App Signing Issues:** https://support.google.com/googleplay/android-developer/answer/7384423
- **Assetlinks Validator:** https://www.digitalassetlinks.org/well-known/assetlinks.json

---

**Status:** ✅ READY TO SUBMIT  
**Last Updated:** May 11, 2026  
**Next Step:** Access Play Console → Create Release → Upload AAB → Send for Review

# 🚀 Instruções de Instalação — VFIT v4.3.1 (Ícones Novos)

> **IMPORTANTE:** O problema anterior era cache local. Siga EXATAMENTE estes passos.

---

## ⚠️ PASSO 1: Desinstalar Completamente

### Opção A: Via ADB (Recomendado)
```bash
adb uninstall br.app.vfit
```

### Opção B: Manualmente no Android
1. Abra **Settings** → **Apps** 
2. Procure **Vfit** 
3. Clique em **Uninstall**
4. Confirme

---

## 🧹 PASSO 2: Limpar Cache do Sistema (Opcional mas Recomendado)

1. **Settings** → **Apps** → **All apps**
2. Procure **Vfit** (se ainda aparecer)
3. Toque em **Storage** → **Clear Cache**
4. Se tiver "Clear Data", clique também

---

## 📦 PASSO 3: Instalar Novo APK

### Com ADB (Recomendado - mais rápido)
```bash
adb install /Users/macos/Development/apps/vfit-production/twa/app/build/outputs/apk/release/app-release.apk
```

### Manualmente (Transfer para seu PC/Mac)
1. Copie o arquivo:
   ```
   /Users/macos/Development/apps/vfit-production/twa/app/build/outputs/apk/release/app-release.apk
   ```
2. Coloque no seu telefone (USB Transfer)
3. Toque no arquivo `.apk` no seu File Manager
4. Clique **Install**

---

## ✅ Verificar Resultado

Depois de instalar:

1. **Home Screen**: Long press no ícone da app
   - ✅ Deve aparecer 3 shortcuts (Dashboard, Alunos, Treinos)
   - ✅ Cada shortcut com seu ícone semântico

2. **Launcher Icon**:
   - ✅ Deve ser **verde rounded** (não antigo)

3. **Splash Screen**:
   - ✅ Ícone verde rounded centralizado

4. **Notifications**:
   - ✅ Ícone branco 

5. **App Name**:
   - ✅ Deve ser **"Vfit"** (não "VFIT")

---

## 🎯 Checklist Final

- [ ] APK desinstalado completamente
- [ ] Cache limpo (opcional)
- [ ] Novo APK instalado (v4.3.1)
- [ ] Ícone launcher é verde rounded
- [ ] 3 shortcuts aparecem com ícones certos
- [ ] App abre com nome "Vfit"

---

## 📁 Arquivos Prontos

| Tipo | Caminho | Tamanho |
|------|---------|---------|
| **APK** | `twa/app/build/outputs/apk/release/app-release.apk` | 1.2 MB |
| **AAB** (Play Store) | `twa/app/build/outputs/bundle/release/app-release.aab` | 1.3 MB |

---

## ❓ Se Ainda Não Funcionar

1. **Reinicie o telefone** (limpa cache de sistema)
2. **Force Stop** da app:
   - Settings → Apps → Vfit → Force Stop
   - Abra novamente
3. **Limpe o build local**:
   ```bash
   cd /Users/macos/Development/apps/vfit-production/twa
   rm -rf build .gradle
   ./gradlew clean
   ```
4. **Regenere o APK** (avise para rodar rebuild)

---

**Gerado em:** 11 Mai 2026, 02:11  
**Versão:** 4.3.1 (versionCode: 431)  
**Package:** br.app.vfit

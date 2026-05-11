# 🎨 Icons Generation — VFIT

> Sistema completo de geração de ícones para web, PWA e TWA
> **Última atualização:** 2026-05-11 · v1.0.0

---

## 📋 Overview

O projeto usa um ícone-fonte único (`icon-round.png`) para gerar todos os ícones necessários:
- **Favicons** — navegadores web
- **PWA Icons** — Progressive Web App (instalação em home)
- **Maskable Icons** — adaptive icons (Android)
- **TWA Icons** — Trusted Web Activity (Play Store)

### 🎯 Estratégia

**100% escala, sem padding ou cortes** — O ícone ocupa todo o espaço disponível via `fit: 'fill'`

---

## 🚀 Como usar

### Gerar todos os ícones

```bash
npm run icons:generate
```

Isso gera automaticamente:
- ✅ 5 favicons (16×16, 32×32, 48×48, 96×96, 180×180)
- ✅ 11 ícones PWA (48–1024px, todos os tamanhos padrão)
- ✅ 9 ícones maskable (Android safe zone)
- ✅ 10 ícones TWA (mipmap densities)
- ✅ Cópias em root (public/)

### Alterar o ícone-fonte

Se quiser usar um ícone diferente:

```bash
# 1. Coloque a imagem em public/
cp seu-icone.png public/icon-round.png

# 2. Regenere os ícones
npm run icons:generate
```

> **Importante:** A imagem fonte deve ser quadrada (1024×1024 ou maior recomendado)

---

## 📁 Arquivos gerados

### Favicons (`public/favicons/`)
```
favicon-16.png        (16×16)
favicon-32.png        (32×32)
favicon-48.png        (48×48)
favicon-96.png        (96×96)
apple-touch-icon.png  (180×180)
```

### PWA Icons (`public/icons/`)
```
icon-48.png               (para installs pequenos)
icon-72.png               (tablet pequeno)
icon-96.png               (tablet médio)
icon-128.png              (desktop)
icon-144.png              (desktop)
icon-152.png              (desktop)
icon-192.png              (padrão PWA)
icon-256.png              (high-end desktop)
icon-384.png              (splash screens)
icon-512.png              (padrão PWA grande)
icon-1024.png             (splash gigante)
```

### Maskable Icons (`public/icons/`)
```
icon-48-maskable.png
icon-72-maskable.png
icon-96-maskable.png
icon-128-maskable.png
icon-144-maskable.png
icon-152-maskable.png
icon-192-maskable.png
icon-384-maskable.png
icon-512-maskable.png
```

### TWA Icons (`twa/app/src/main/res/`)
```
mipmap-mdpi/ic_launcher.png         (48×48)
mipmap-hdpi/ic_launcher.png         (72×72)
mipmap-xhdpi/ic_launcher.png        (96×96)
mipmap-xxhdpi/ic_launcher.png       (144×144)
mipmap-xxxhdpi/ic_launcher.png      (192×192)

mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_round.png
```

---

## 🔧 Técnico

### Método de escala

Usa Sharp com `fit: 'fill'`:
- **Sem padding** — espaço vazio em volta
- **Sem crop** — ícone inteiro preservado
- **Apenas escala** — redimensiona proporcionalmente até preencher o canvas

```javascript
await sharp(SOURCE_ICON)
  .resize(size, size, {
    fit: 'fill',        // 100% scale
    position: 'center'
  })
  .png({ quality: 95 })
  .toFile(outputPath)
```

### Tamanhos padrão

| Contexto | Tamanhos | Notas |
|----------|----------|-------|
| **Favicon** | 16, 32, 48, 96, 180 | Apple touch + navegadores |
| **PWA (any)** | 48–1024 | Vários dispositivos |
| **PWA (maskable)** | 48–512 | Android adaptive shapes |
| **TWA** | 48–192 | 5 densidades Android |

---

## 📱 Integração

### Web Header

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### PWA Manifest

```json
{
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Veja `public/manifest.json` para configuração completa ✅

### TWA AndroidManifest

Veja `twa/app/src/main/AndroidManifest.xml`:
```xml
<application android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round">
```

---

## 🎯 Qualidade

### Verificar tamanho dos ícones

```bash
ls -lh public/icons/icon-512.png public/icons/icon-512-maskable.png
# Devem estar em torno de 20–40KB cada
```

### Testar no navegador

```bash
npm run dev
# Abrir DevTools → Application → Manifest
# Verificar se todos os ícones estão presentes
```

### Testar PWA

```bash
# Chrome: Settings → Install app
# Verificar se o ícone aparece corretamente
```

---

## 🔄 Workflow recomendado

1. **Criar nova versão do ícone**
   ```bash
   cp novo-icone.png public/icon-round.png
   ```

2. **Gerar ícones**
   ```bash
   npm run icons:generate
   ```

3. **Validar na web**
   ```bash
   npm run dev
   # Abrir em browser, verificar favicon
   ```

4. **Deploy**
   ```bash
   npm run cf:deploy
   # Ícones são deployados automaticamente
   ```

---

## 🐛 Troubleshooting

### "Source image not found"
- Verifique se `public/icon-round.png` existe
- Confirme o caminho correto

### "Ícones muito grandes/pequenos"
- Aumente/diminua a imagem de origem
- Regenere com `npm run icons:generate`

### "Ícone cortado na tela"
- Use `fit: 'fill'` (já padrão) — não usa fit: 'cover'
- Verifique se a imagem de origem é quadrada

### "Maskable icon aparece estranho"
- Maskable é otimizado para Android 8+
- Safe zone = 80% de diâmetro do ícone
- Seu ícone redondo ocupa ~100% do espaço

---

## 📚 Referências

- [Web App Manifest — MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Android App Icons — Material Design](https://material.io/design/iconography/)
- [Maskable Icons — CSS Tricks](https://www.smashingmagazine.com/2021/06/understanding-adaptive-icons/)
- [Sharp.js — Image processing](https://sharp.pixelplumbing.com/)

---

## 📝 Changelog

| Versão | Data | Mudanças |
|--------|------|----------|
| **1.0.0** | 2026-05-11 | Script inicial com suporte PWA + TWA |

---

**Mantido por:** Developer Agent  
**Próximas melhorias:** Suporte para dark mode variants, monochrome icons


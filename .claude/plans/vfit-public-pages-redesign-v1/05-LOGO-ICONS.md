# 05 — Nova Logo, Ícones e Assets Visuais

> Guia completo para identidade visual VFIT  
> Conceito + SVG + Favicon + Manifest + Ícones do produto  
> VFIT | Abril 2026

---

## 🎨 Conceito da Nova Logo

### Direção Criativa

```
Palavra-chave: EVOLUÇÃO
Tom: Energia cinética + Tecnologia + Performance
Metáfora visual: O "V" de VFIT como vetor de progresso ascendente
Inspiração: marcas de performance (Nike, Strava, Whoop) + tech (Vercel, Linear)
```

### Princípios

1. **Funciona em 16px** (favicon) e **500px** (hero, impressão)
2. **Monocromático primeiro** — funciona em preto, branco e verde
3. **Geométrico e minimal** — sem ornamentos desnecessários
4. **O "V" como símbolo central** — velocidade, vitória, vetor, vitalidade
5. **Integração do "pulso"** — o V interno menor evoca: frequência cardíaca, sinal de vida, progresso

---

## 🔷 Logo Mark (Símbolo Isolado)

```svg
<!-- vfit-mark.svg — símbolo isolado, 40x40 -->
<svg width="40" height="40" viewBox="0 0 40 40" fill="none"
     xmlns="http://www.w3.org/2000/svg" aria-label="VFIT">

  <!-- V externo (branco/claro) — estrutura principal -->
  <path d="M5 8 L20 34 L35 8"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

  <!-- V interno (verde) — pulsação / energia -->
  <path d="M12 8 L20 24 L28 8"
        stroke="#16a34a"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

</svg>
```

---

## 📝 Logo Completa (Mark + Wordmark)

```svg
<!-- vfit-logo.svg — logo horizontal completa -->
<svg width="128" height="40" viewBox="0 0 128 40" fill="none"
     xmlns="http://www.w3.org/2000/svg" aria-label="VFIT">

  <!-- Mark -->
  <path d="M5 7 L18 31 L31 7"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
  <path d="M11 7 L18 22 L25 7"
        stroke="#16a34a"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

  <!-- Wordmark: VFIT -->
  <text x="40" y="27"
        font-family="Cabinet Grotesk, Inter, sans-serif"
        font-weight="800"
        font-size="24"
        letter-spacing="-0.5"
        fill="currentColor">VFIT</text>

</svg>
```

---

## 🔲 Favicon SVG (simplificado para 32px)

```svg
<!-- favicon.svg — versão ultra-simplificada -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none"
     xmlns="http://www.w3.org/2000/svg">

  <!-- Fundo verde escuro -->
  <rect width="32" height="32" rx="8" fill="#0d2e18"/>

  <!-- V mark em branco -->
  <path d="M6 7 L16 25 L26 7"
        stroke="white"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

  <!-- Pulso verde -->
  <path d="M11 7 L16 18 L21 7"
        stroke="#22c55e"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>

</svg>
```

---

## 🖼️ Variações Necessárias

| Variação | Arquivo | Uso | Tamanho |
|----------|---------|-----|---------|
| Logo horizontal (escuro) | `vfit-logo-dark.svg` | Navbar (fundo escuro) | 128×40 |
| Logo horizontal (claro) | `vfit-logo-light.svg` | Fundo branco/claro | 128×40 |
| Logo mark isolado | `vfit-mark.svg` | Avatar, ícone | 40×40 |
| Favicon SVG | `favicon.svg` | Tab do browser | 32×32 |
| Apple Touch Icon | `apple-touch-icon.png` | iOS home screen | 180×180 |
| PWA Icon 192 | `icon-192.png` | Android, PWA | 192×192 |
| PWA Icon 512 | `icon-512.png` | Android large | 512×512 |
| OG Image | `og-image.png` | Compartilhamento social | 1200×630 |
| Logo para PDF | `vfit-logo-print.svg` | Avaliações físicas, docs | Vetorial |

---

## 📦 manifest.json Completo

```json
{
  "name": "VFIT",
  "short_name": "VFIT",
  "description": "Plataforma #1 para Personal Trainers no Brasil",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0a0a0a",
  "theme_color": "#16a34a",
  "categories": ["health", "fitness", "productivity"],
  "lang": "pt-BR",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

---

## 🎯 OG Image (1200×630)

Especificação para criar com Figma, Canva ou código (Satori/OG Image Gen):

```
Background: #0a0a0a (preto VFIT)
Gradient overlay: radial verde esquerda, 40% opacidade
Logo: vfit-logo-dark.svg centralizado, ~200px largura
Tagline: "Treinos com IA — Seu App de Treinos" 
  Font: Cabinet Grotesk 800, 36px, branco
Subtext: "vfit.app"
  Font: Satoshi 400, 24px, #888888
Badge: "2.500+ Personal Trainers"
  Font: Satoshi 600, 18px, verde
```

---

## 🎨 Paleta da Marca (Uso Visual)

| Nome | Hex | OKLCH | Uso |
|------|-----|-------|-----|
| VFIT Black | `#0a0a0a` | `oklch(0.06 0 0)` | Background principal |
| VFIT Green | `#16a34a` | `oklch(0.55 0.15 145)` | CTA, brand mark |
| VFIT Green Light | `#22c55e` | `oklch(0.65 0.15 145)` | Hover, destaque |
| VFIT White | `#f2f2f2` | `oklch(0.95 0 0)` | Texto principal |
| VFIT Gray | `#888888` | `oklch(0.58 0 0)` | Texto secundário |

---

## 🎯 Ícones do Produto (Lucide Icons)

### CDN

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<!-- Uso: -->
<i data-lucide="dumbbell" width="20" height="20"></i>
<script>lucide.createIcons();</script>
```

### Mapeamento por Feature

| Feature do VFIT | Ícone Lucide | `data-lucide` |
|----------------|-------------|---------------|
| Treinos com IA | Brain + Dumbbell | `brain` |
| Gestão de alunos | Users | `users` |
| Cobranças automáticas | Zap / CreditCard | `zap` |
| Avaliação física | Activity / ClipboardList | `activity` |
| Gamificação | Trophy | `trophy` |
| App PWA | Smartphone | `smartphone` |
| PIX | QrCode | `qr-code` |
| IA / Automação | Cpu / Sparkles | `sparkles` |
| Relatórios | BarChart2 | `bar-chart-2` |
| Notificações | Bell | `bell` |
| Segurança/LGPD | ShieldCheck | `shield-check` |
| Integração | Plug | `plug` |
| Comunidade | MessageCircle | `message-circle` |
| Suporte | HeadphonesIcon | `headphones` |
| Plano Grátis | Star | `star` |
| Plano Pro | Zap | `zap` |
| Plano Max | Crown | `crown` |

### CSS dos Ícones no produto

```css
.feature-icon {
  width: 24px;
  height: 24px;
  color: var(--vfit-green-400);
  flex-shrink: 0;
}
.feature-icon-lg {
  width: 32px;
  height: 32px;
  color: var(--vfit-green-400);
}
/* Ícone com fundo (usar com moderação — evitar o clichê) */
.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--vfit-green-highlight);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🛠️ Como Usar a Logo no Next.js

```tsx
// components/Logo.tsx
export function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = { sm: 'h-6', md: 'h-8', lg: 'h-10' };

  return (
    <svg
      className={`${sizes[size]} w-auto`}
      viewBox="0 0 128 40"
      fill="none"
      aria-label="VFIT"
    >
      {/* Mark */}
      <path d="M5 7 L18 31 L31 7"
        stroke="currentColor" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 7 L18 22 L25 7"
        stroke="#16a34a" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Wordmark */}
      <text x="40" y="27"
        fontFamily="Cabinet Grotesk, sans-serif"
        fontWeight="800" fontSize="24"
        letterSpacing="-0.5"
        fill="currentColor">VFIT</text>
    </svg>
  );
}
```

---

## 📋 Checklist de Assets

- [ ] Logo mark SVG criado e testado em 16px, 40px, 200px
- [ ] Logo horizontal SVG nas duas variações (dark/light)
- [ ] Favicon SVG gerado e validado
- [ ] Apple Touch Icon 180×180 PNG exportado
- [ ] PWA icons 192 e 512 exportados
- [ ] OG Image 1200×630 criado
- [ ] manifest.json atualizado
- [ ] `<head>` de todas as páginas com novos links
- [ ] Logo testada em fundos: preto, branco, verde, cinza
- [ ] Logo testada no mobile (navbar em 375px)

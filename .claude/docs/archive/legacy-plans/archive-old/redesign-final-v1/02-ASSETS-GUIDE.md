# 🖼️ Guia de Assets — Favicons, OG Images & Imagens

> Especificações técnicas para todos os assets visuais do redesign.

---

## Favicons

### SVG Master (fonte de verdade)
- **Formato:** SVG com viewBox `0 0 512 512`
- **Design:** Logo VFIT (P+IA estilizado) com gradiente verde mint → lime
- **Background:** Dark `#09090B` com border-radius proporcional

### Tamanhos necessários (PNG)
| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `favicon.ico` | 16×16 + 32×32 (multi) | Browser tab (legacy) |
| `favicon-16.png` | 16×16 | Tab fallback |
| `favicon-32.png` | 32×32 | Tab retina |
| `favicon-48.png` | 48×48 | Windows shortcut |
| `favicon-96.png` | 96×96 | Google TV, etc |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `icon-192.png` | 192×192 | Android Chrome |
| `icon-192-maskable.png` | 192×192 (safe zone) | Android maskable |
| `icon-512.png` | 512×512 | PWA splash |
| `icon-512-maskable.png` | 512×512 (safe zone) | PWA splash maskable |

### Regras Maskable
- Safe zone: **80%** da área total (10% padding cada lado)
- O ícone deve ficar TOTALMENTE dentro da safe zone
- Background: `#09090B` sólido (sem transparência)

---

## OG Images (Open Graph)

### Especificações
- **Tamanho:** 1200×630px
- **Formato:** PNG (fallback) / WebP (modern)
- **Peso máximo:** 300KB
- **DPI:** 72

### Templates necessários

| Arquivo | Página | Design |
|---------|--------|--------|
| `og-default.png` | Home / fallback | Logo grande + tagline + gradient bg |
| `og-blog.png` | `/blog` | "Blog VFIT" + ícone artigo |
| `og-blog-ia.png` | `/blog/ia-personal-trainer` | Título + visual IA |
| `og-blog-cobranca.png` | `/blog/cobranca-automatica` | Título + visual financeiro |
| `og-blog-retencao.png` | `/blog/retencao-alunos` | Título + visual retenção |
| `og-pricing.png` | `/register?plan=*` | Planos + preços |
| `og-sobre.png` | `/sobre` | Equipe + missão |
| `og-contato.png` | `/contato` | "Fale conosco" |

### Design Pattern OG
```
┌──────────────────────────────────────────────┐
│                                              │
│  ┌─────┐                                     │
│  │LOGO │   VFIT                       │
│  └─────┘                                     │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │   [Título da Página]                   │  │
│  │                                        │  │
│  │   [Subtítulo / Descrição]              │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  iapersonal.app.br          [Visual Element] │
│                                              │
└──────────────────────────────────────────────┘

Background: Gradiente escuro (#09090B → #111113)
Accent: Glow verde mint no canto superior direito
Texto: Branco + verde brand
```

---

## Imagens do App

### Hero Section
| Arquivo | Tamanho | Formato | Uso |
|---------|---------|---------|-----|
| `hero-poster.webp` | 1920×1080 | WebP | Poster do video (LCP) |
| `hero-poster-mobile.webp` | 640×960 | WebP | Poster mobile |
| `hero-gradient.svg` | Escalável | SVG | Gradiente fallback |

### Dashboard Mockups
| Arquivo | Tamanho | Formato | Uso |
|---------|---------|---------|-----|
| `mockup-dashboard.webp` | 1200×800 | WebP | Hero section |
| `mockup-mobile.webp` | 390×844 | WebP | Mobile preview |
| `mockup-tablet.webp` | 1024×768 | WebP | Tablet preview |

### Patterns (Decorativos)
| Arquivo | Formato | Uso |
|---------|---------|-----|
| `grid.svg` | SVG | Background grid sutil |
| `dots.svg` | SVG | Pattern de pontos |
| `noise.svg` | SVG | Textura noise (já existe inline) |

---

## Imagens de Placeholder

### Blur Data URLs (base64)
Para cada imagem pesada, gerar um blur placeholder de ~10×10px em base64.
Usar com o componente `OptimizedImage`:

```tsx
<OptimizedImage
  src="/images/hero-poster.webp"
  blurDataURL="data:image/webp;base64,UklGR..."
  alt="Dashboard VFIT"
  width={1200}
  height={800}
  priority // para LCP
/>
```

### Regras de Imagem
1. **TODAS** as imagens devem ter `width` e `height` explícitos
2. **TODAS** devem usar `border-radius` (mínimo `radius-lg`)
3. **TODAS** devem ter `alt` descritivo
4. **Nenhuma** imagem deve causar layout shift
5. **Hero/LCP** imagens: `priority` + preload
6. **Below the fold**: `loading="lazy"`

---

## Checklist de Assets

- [ ] Favicon SVG master criado
- [ ] 10 tamanhos de favicon gerados
- [ ] OG default (1200×630)
- [ ] OG para cada blog post (4)
- [ ] OG para pricing
- [ ] OG para sobre/contato
- [ ] Hero poster WebP (desktop + mobile)
- [ ] Dashboard mockup WebP
- [ ] Grid pattern SVG
- [ ] Dots pattern SVG
- [ ] Blur placeholders gerados para todas as imagens
- [ ] `manifest.json` atualizado com novos ícones
- [ ] `_headers` atualizado com cache policies para imagens

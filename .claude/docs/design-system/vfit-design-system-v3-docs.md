# VFIT — Design System v2.0
## Documentação Completa + Prompt de Implementação
### Light & Dark Mode • SVG Icons • Zero Emojis

---

## 1. VISÃO GERAL

Este documento é a referência definitiva para a modernização visual da plataforma VFIT. Cobre **100% das páginas e componentes** do sistema, com especificações para **modo claro E escuro**, iconografia SVG premium, animações performáticas e um design system coeso.

**Princípios fundamentais:**
- ZERO emojis em qualquer lugar — todos os ícones são SVG vetoriais
- Animações APENAS com `transform` + `opacity` (GPU-accelerated)
- `will-change` nos elementos que animam
- `prefers-reduced-motion` obrigatório
- CSS Custom Properties para dual-theme (light/dark)
- Mobile-first, todas as animações < 400ms

---

## 2. PALETA DE CORES — DUAL THEME

```css
:root {
  /* ==========================================
     LIGHT THEME (default)
     ========================================== */
  --bg: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 40%, #ecfdf5 100%);
  --surface: rgba(255, 255, 255, 0.88);
  --surface-solid: #ffffff;
  --surface-hover: rgba(255, 255, 255, 0.95);
  --surface-secondary: #f8fafc;
  --surface-elevated: rgba(255, 255, 255, 0.92);
  --glass: rgba(255, 255, 255, 0.6);

  --border: rgba(0, 0, 0, 0.07);
  --border-light: rgba(0, 0, 0, 0.04);
  --border-focus: #34d399;

  --text: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --text-inverse: #ffffff; /* ← texto sobre superfícies coloridas */

  /* Primary — Verde (manter) */
  --primary: #10b981;
  --primary-light: #34d399;
  --primary-lighter: #6ee7b7;
  --primary-dark: #059669;
  --primary-darker: #047857;
  --primary-bg: #ecfdf5;
  --primary-bg-hover: #d1fae5;

  /* Secondary — Slate (NOVO — substituiu #3a3a3a) */
  --secondary: #64748b;
  --secondary-light: #94a3b8;
  --secondary-lighter: #cbd5e1;
  --secondary-dark: #475569;
  --secondary-darker: #334155;

  /* Accent — Amber (financeiro) */
  --accent: #f59e0b;
  --accent-light: #fbbf24;
  --accent-dark: #d97706;
  --accent-darker: #b45309;

  /* AI — Purple (features de IA) */
  --ai: #8b5cf6;
  --ai-light: #a78bfa;
  --ai-dark: #7c3aed;

  /* Semantic */
  --error: #ef4444;
  --error-bg: #fef2f2;
  --success: #10b981;
  --info: #3b82f6; /* ⚠️ Usado inline no JSX (ex: badge aluno, stat "Indicados"), NÃO é token nomeado no themes object */

  /* Neutrals */
  --neutral-50: #fafbfc;
  --neutral-100: #f4f6f8;
  --neutral-200: #e8ecf0;
  --neutral-300: #d1d9e0;

  /* Shadows */
  --card-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.05);
  --card-shadow-hover: 0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08);
  --select-shadow: 0 2px 0 #e8ecf0, 0 4px 8px rgba(0,0,0,0.03);
  --action-btn-bg: #f4f6f8;
  --action-btn-hover-bg: #ecfdf5;
  --backdrop: blur(12px);

  /* 3D Button Shadows */
  --btn-3d-primary: 0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  --btn-3d-primary-hover: 0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
  --btn-3d-primary-active: 0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.2), inset 0 2px 4px rgba(0,0,0,0.1);
  --btn-3d-secondary: 0 4px 0 #334155, 0 6px 14px rgba(71,85,105,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
  --btn-3d-secondary-hover: 0 5px 0 #334155, 0 8px 20px rgba(71,85,105,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  --btn-3d-secondary-active: 0 1px 0 #334155, 0 2px 6px rgba(71,85,105,0.15), inset 0 2px 4px rgba(0,0,0,0.1);
  --btn-3d-warning: 0 4px 0 #b45309, 0 6px 14px rgba(217,119,6,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  --btn-3d-danger: 0 4px 0 #b91c1c, 0 6px 14px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
}

[data-theme="dark"] {
  /* ==========================================
     DARK THEME
     ========================================== */
  --bg: linear-gradient(135deg, #0c1220 0%, #111827 40%, #0f1a2e 100%);
  --surface: rgba(30, 41, 59, 0.85);
  --surface-solid: #1e293b;
  --surface-hover: rgba(30, 41, 59, 0.95);
  --surface-secondary: #1a2332;
  --surface-elevated: rgba(30, 41, 59, 0.92);
  --glass: rgba(30, 41, 59, 0.5);

  --border: rgba(255, 255, 255, 0.08);
  --border-light: rgba(255, 255, 255, 0.04);
  --border-focus: #34d399; /* mesmo valor do light — explícito para clareza */

  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-inverse: #ffffff;

  --primary-bg: rgba(16, 185, 129, 0.1);
  --primary-bg-hover: rgba(16, 185, 129, 0.15);

  --error-bg: rgba(239, 68, 68, 0.1);

  --neutral-50: rgba(255, 255, 255, 0.03);
  --neutral-100: rgba(255, 255, 255, 0.05);
  --neutral-200: rgba(255, 255, 255, 0.08);
  --neutral-300: rgba(255, 255, 255, 0.12);

  --card-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3);
  --card-shadow-hover: 0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4);
  --select-shadow: 0 2px 0 rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2);
  --action-btn-bg: rgba(255, 255, 255, 0.05);
  --action-btn-hover-bg: rgba(16, 185, 129, 0.12);
  --backdrop: blur(16px);

  --btn-3d-primary: 0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  --btn-3d-primary-hover: 0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  --btn-3d-primary-active: 0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.25), inset 0 2px 4px rgba(0,0,0,0.2);
  --btn-3d-secondary: 0 4px 0 #1e293b, 0 6px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  --btn-3d-secondary-hover: 0 5px 0 #1e293b, 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
  --btn-3d-secondary-active: 0 1px 0 #1e293b, 0 2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2);
}
```

---

## 2.1 TIPOGRAFIA

> **Definida no JSX** mas ausente na documentação original.

```css
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Import Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

| Peso | Uso |
|------|-----|
| 400 | Texto corrido |
| 500 | Labels, options de select |
| 600 | Subtítulos, badges, botões, stats labels |
| 700 | Títulos, valores numéricos, nomes |
| 800 | Header principal ("VFIT Design System") |

---

## 3. ICONOGRAFIA SVG — MAPEAMENTO COMPLETO

**REGRA: ZERO emojis. Todo ícone é SVG vetorial.**

### Fonte recomendada: Lucide Icons (https://lucide.dev)
- MIT License, 1400+ ícones, consistente, 24x24 grid
- Importar via `lucide-react` no projeto React

### Ícones Implementados no JSX (Icons object)

> **30 ícones** no total. Keys exatas do objeto `Icons` no JSX:

| Key JSX | Equivalente Lucide | SVG Path |
|---|---|---|
| `search` | Search | ✅ Idêntico |
| `settings` | Settings | ✅ Idêntico |
| `bell` | Bell | ✅ Idêntico |
| `logout` | LogOut | ✅ Idêntico |
| `menu` | Menu | ✅ Idêntico |
| `home` | Home | ✅ Idêntico |
| `edit` | Pen / Pencil | ✅ Idêntico (path de edição) |
| `copy` | Copy | ✅ Idêntico |
| `trash` | Trash2 | ✅ Idêntico |
| `gift` | Gift | ✅ Idêntico |
| `plus` | Plus | ✅ Idêntico |
| `check` | Check | ✅ Checkmark simples (strokeWidth 2.5) |
| `x` | X | ✅ Idêntico |
| `users` | Users | ✅ Idêntico |
| `message` | MessageCircle | ✅ Path simplificado |
| `chart` | Custom (line chart) | ⚠️ NÃO é TrendingUp — é um gráfico de linha customizado |
| `dollar` | DollarSign | ✅ Idêntico |
| `wallet` | Wallet | ✅ Idêntico |
| `link` | Link2 | ✅ Idêntico |
| `qrcode` | QrCode | ✅ Idêntico |
| `download` | Download | ✅ Idêntico |
| `filter` | Filter | ✅ Idêntico |
| `chevronDown` | ChevronDown | ✅ Default size 16 (outros são 20), strokeWidth 2.5 |
| `externalLink` | ExternalLink | ✅ Idêntico |
| `brain` | Brain | ✅ strokeWidth 1.8 (mais fino que padrão) |
| `sparkles` | Sparkles | ✅ Idêntico |
| `wand` | Wand2 | ✅ Idêntico |
| `messageAI` | Custom (MessageSquare variação) | ⚠️ Path customizado — NÃO é MessageSquareCode |
| `image` | Image | ✅ Idêntico |
| `barChart` | BarChart | ✅ Barras verticais simples |
| `lock` | Lock | ✅ Idêntico |
| `sun` | Sun | ✅ Idêntico |
| `moon` | Moon | ✅ Idêntico |
| `monitor` | Monitor | ✅ Idêntico |
| `aiBot` | **Custom SVG** | Ícone exclusivo VFIT (ver seção abaixo) |

### Mapeamento por Contexto de Uso (conforme JSX)

| Contexto | Key JSX | Nota |
|---|---|---|
| **Navbar** | | |
| Busca | `search` | |
| Tema claro | `sun` | |
| Tema escuro | `moon` | |
| Tema sistema | `monitor` | |
| Mensagens | `message` | MessageCircle path |
| Notificações | `bell` | Com badge pulse |
| Configurações | `settings` | |
| Sair/Logout | `logout` | |
| Menu mobile | `menu` | Hamburger (3 linhas) |
| Home | `home` | |
| **User Actions** | | |
| Editar | `edit` | Pen/pencil path |
| Duplicar/Copiar | `copy` | |
| Bônus/Presente | `gift` | |
| Excluir | `trash` | Destructive (vermelho) |
| Download | `download` | |
| Link externo | `externalLink` | |
| Fechar/Cancelar | `x` | |
| Confirmar | `check` | Checkmark simples |
| Adicionar | `plus` | |
| **Stats Cards** | | |
| Indicados | `users` | accent `#3b82f6` |
| Ganhos/Receita | `dollar` | accent `#f59e0b` |
| Saldo | `wallet` | accent `#10b981` |
| Este Mês | `chart` | accent `#8b5cf6` — ⚠️ Line chart customizado |
| **IA Features** | | |
| Gerar Treino IA | `wand` | Tool card accent `#10b981` |
| Assistente IA | `messageAI` | Tool card accent `#3b82f6` — ⚠️ SVG customizado |
| Gerador Conteúdo | `image` | Tool card accent `#f59e0b` |
| Comparação Fotos (disabled) | `image` | ⚠️ **Usa `image`**, não ScanEye |
| Cobranças Inteligentes (disabled) | `dollar` | ⚠️ **Usa `dollar`**, não Receipt |
| Análise Sentimento (disabled) | `barChart` | |
| Chamadas IA (stat) | `sparkles` | accent `var(--ai)` |
| Tokens (stat) | `wand` | accent `var(--ai)` |
| Ferramentas (stat) | `brain` | accent `var(--ai)` |
| **Afiliados** | | |
| Link indicação | `link` | |
| Copiar link | `copy` | |
| QR Code | `qrcode` | |
| **Financeiro** | | |
| Nova Cobrança | `plus` | Btn warning icon |
| Saques PIX | `download` | Btn secondary icon |
| Pagamento (notification) | `dollar` | |
| **Empty States** | | |
| Sem conversas | `message` | Com gentleBounce animation |
| **Status** | | |
| Verificado (badge) | `check` | ⚠️ Check simples, NÃO CheckCircle2 |
| Super Admin (badge) | `sparkles` | size 10px |
| Em breve / Lock | `lock` | Cards disabled, top-right |
| Notif badge | Dot com `pulse` animation | CSS animation |
| **Filtros** | | |
| Filtrar | `filter` | |
| Chevron dropdown | `chevronDown` | Default size 16, strokeWidth 2.5 |

### ⚠️ Ícones NÃO implementados no JSX (apenas na spec original)

| Ícone | Contexto original | Status |
|---|---|---|
| `BellOff` | Sem notificações (empty) | ❌ Não existe no JSX Icons |
| `ArrowUpDown` | Ordenar | ❌ Não existe no JSX Icons |
| `CheckCircle2` | Verificado | ❌ JSX usa `check` simples |
| `ScanEye` | Comparação Fotos | ❌ JSX usa `image` |
| `Receipt` | Cobranças IA / Sem cobranças | ❌ JSX usa `dollar` |
| `TrendingUp` | Gráfico mensal | ❌ JSX usa `chart` customizado |
| `MessageSquareCode` | Assistente IA | ❌ JSX usa `messageAI` customizado |

### AI Bot Icon — Custom SVG

```svg
<!-- VFIT AI Bot — Custom Premium Icon -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
  <!-- Head -->
  <rect x="4" y="8" width="24" height="18" rx="5" stroke="currentColor" stroke-width="2"/>
  <!-- Eyes -->
  <circle cx="12" cy="17" r="2.5" fill="currentColor"/>
  <circle cx="20" cy="17" r="2.5" fill="currentColor"/>
  <!-- Smile -->
  <path d="M12 22c0 0 2 2.5 4 2.5s4-2.5 4-2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Antenna -->
  <path d="M16 8V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="16" cy="3" r="1.5" fill="currentColor"/>
  <!-- Ears/Sensors -->
  <path d="M4 15H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M30 15h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

O FAB (Floating Action Button) do AI Bot usa:
- Container: `border-radius: 18px`, `background: linear-gradient(135deg, var(--primary), var(--primary-dark))`
- Shadow: `0 4px 16px rgba(16,185,129,0.35)` → hover: `0 8px 24px rgba(16,185,129,0.5)`
- Hover: `transform: scale(1.08) rotate(-5deg)` com `cubic-bezier(0.34,1.56,0.64,1)`
- O ícone SVG do bot sempre em `#ffffff`

---

## 4. COMPONENTES — CSS COMPLETO (ambos os temas via variáveis)

### 4.1 Botões 3D

5 variantes: **primary**, **secondary**, **warning**, **danger**, **ghost**
3 tamanhos: **sm** (8/16px), **md** (12/24px), **lg** (16/32px)

| Tamanho | Padding | Font Size | Border Radius | Gap (icon) |
|---------|---------|-----------|---------------|------------|
| sm | 8px 16px | 13px | 10px | 6px |
| md | 12px 24px | 14px | 12px | 8px |
| lg | 16px 32px | 16px | 14px | 10px |

Cada botão tem:
- `background: linear-gradient(180deg, LIGHTER 0%, BASE 50%, DARK 100%)`
- `box-shadow` 3D com `inset` highlight superior
- `transform: translateY(-1px)` no hover
- `transform: translateY(3px)` no active (press)
- `text-shadow: 0 1px 2px rgba(0,0,0,0.15)` em variantes com texto branco
- `transition: transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow 150ms`
- `fontFamily: inherit` (herda Plus Jakarta Sans)
- Suporte a ícone SVG à esquerda via `gap` dinâmico por tamanho (ver tabela acima)

Referência de gradients por variante:

> **Nota:** Cada variante tem 3 stops em `linear-gradient(180deg, TOP 0%, MID 50%, BOTTOM 100%)`. No **hover**, os stops deslocam um nível mais claro.

| Variante | Normal (top → mid → bottom) | Hover (top → mid → bottom) | Shadow base |
|---|---|---|---|
| primary | `#34d399 → #10b981 → #059669` | `#6ee7b7 → #34d399 → #10b981` | `#047857` |
| secondary | `#94a3b8 → #64748b → #475569` | `#cbd5e1 → #94a3b8 → #64748b` | `#334155` (light) / `#1e293b` (dark) |
| warning | `#fbbf24 → #f59e0b → #d97706` | `#fcd34d → #fbbf24 → #f59e0b` | `#b45309` |
| danger | `#f87171 → #ef4444 → #dc2626` | (mesmo, sombra intensifica) | `#b91c1c` |
| ghost | `surface → surface` | `surfaceHover` | `neutral-200` |

### 4.2 Cards

Base: `background: var(--surface)`, `backdrop-filter: var(--backdrop)`, `border: 1px solid var(--border)`, `border-radius: 16px`

| Variante | Uso | Extras |
|---|---|---|
| card-stat | Stats (Afiliados, IA) | Top accent bar no hover (3px gradient), ícone scale 1.1 + rotate -5deg |
| card-tool | Ferramentas IA | Gradient overlay no hover, ícone translateY(-4px) |
| card-disabled | "Em Breve" | opacity: 0.45, lock icon top-right, no hover |
| card-notification | Notificações | border-left: 3px primary, slide-in animation |
| card-user | Lista usuários | border-left transparent → primary no hover, translateX(4px) |
| card-empty | Empty states | Ícone SVG com gentleBounce animation |
| card-appearance | Tema (claro/escuro/sistema) | border: 2px selection state, glow ring |
| card-revenue | Receita total | Gradient background sutil |

### 4.3 Custom Select

Substitui **TODO** `<select>` nativo no sistema:
- Trigger: gradient `surface-solid → surface-secondary`, border, 3D shadow
- Dropdown: glassmorphism `backdrop-filter: blur(20px)`, scale animation
- Options: hover translateX(4px), active com check icon
- Chevron: rotate 180deg animado
- Click outside para fechar

### 4.4 Action Buttons (Edit, Copy, Gift, Trash)

```
width: 38px, height: 38px, border-radius: 10px
border: 1px solid var(--border)
background: var(--action-btn-bg)
hover normal: background: var(--action-btn-hover-bg), color: var(--primary), scale(1.12)
hover destructive: background: var(--error-bg), color: var(--error), scale(1.12)
transition: all 180ms cubic-bezier(0.34,1.56,0.64,1)
```

### 4.5 Badges

| Tipo | Background (light) | Color | Border |
|---|---|---|---|
| aluno | linear-gradient(135deg, #dbeafe, #eff6ff) | #2563eb | rgba(37,99,235,0.15) |
| personal | linear-gradient(135deg, primary-bg, primary-bg-hover) | primary-dark | primary 25% |
| super-admin | linear-gradient(135deg, #fef3c7, #fffbeb) | #d97706 | rgba(217,119,6,0.15) |
| verified | primary-bg gradient | primary | primary 20% |

Cada badge tem:
- Ícone SVG prefixo: super-admin = Sparkles (10px), verified = Check (10px)
- `font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase`
- `padding: 3px 10px; border-radius: 8px`

### 4.6 Sliding Tabs

- Container: `background: var(--neutral-100)`, `padding: 4px`, `border-radius: 14px`
- Indicator: `background: linear-gradient(180deg, primary-light, primary)`, `box-shadow: 0 2px 0 primary-dark`
- Transition: `left + width 300ms cubic-bezier(0.16,1,0.3,1)` via JS (offsetLeft/offsetWidth)
- Tab ativa: `color: #fff` (sobre o indicator)
- Tab inativa: `color: var(--text-muted)`, hover → `color: var(--text-secondary)`

### 4.7 Progress Bar

- Container: `height: 8px; background: rgba(128,128,128,0.1); border-radius: 8px`
- Bar: `background: linear-gradient(90deg, #34d399, #10b981, #34d399); background-size: 200% 100%`
- Animation: `shimmer 2s ease-in-out infinite`
- Width transition: `600ms cubic-bezier(0.16,1,0.3,1)`

### 4.8 Search Input

- Background: `var(--surface)`, backdrop-filter
- Border: `1.5px solid var(--border)` → focus: `var(--border-focus)`
- Focus ring: `box-shadow: 0 0 0 4px rgba(16,185,129,0.08)`
- Ícone Search SVG à esquerda, `color: var(--text-muted)` → focus: `var(--primary)`
- `border-radius: 14px`

### 4.9 Filter Pills

- Inativo: `background: var(--neutral-50)`, `border: 1.5px solid var(--border)`, `color: var(--text-muted)`
- Ativo: gradient primary 3D com shadow (mesmo estilo do botão primary)
- `border-radius: 10px; padding: 8px 18px; font-size: 13px; font-weight: 600`

---

## 5. ANIMAÇÕES — KEYFRAMES

### ✅ Implementadas no JSX (dentro do `<style>` tag)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gentleBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 📋 Planejadas (na spec, NÃO no JSX preview)

```css
/* slideInRight — listado na spec original mas NÃO implementado no JSX */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Uso no JSX

| Animação | Onde é usada | Propriedade |
|---|---|---|
| `fadeInUp` | Cards, sections, header, user list items | `animation: fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both` |
| `gentleBounce` | Empty state icon container | `animation: gentleBounce 3s ease-in-out infinite` |
| `shimmer` | ProgressBar fill | `animation: shimmer 2s ease-in-out infinite` com `backgroundSize: 200% 100%` |
| `pulse` | Notification badge (dot) | `animation: pulse 2s ease-in-out infinite` |
| `spin` | Loading spinner (definido mas uso implícito) | `animation: spin ...` |

### Stagger Pattern (implementado via inline, NÃO via CSS class)

> **Nota:** O JSX usa `animationDelay` inline com incremento por item, NÃO classes CSS `.stagger-list`.

```jsx
// Padrão no JSX — inline delay por index:
style={{ animation: "fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${i * 60}ms` }}
// i=0 → 0ms, i=1 → 60ms, i=2 → 120ms, i=3 → 180ms...
```

**Para implementação CSS (alternativa sugerida):**
```css
/* Stagger List — versão CSS class (NÃO no JSX, sugerida para produção) */
.stagger-list > * { animation: fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both; }
.stagger-list > *:nth-child(1) { animation-delay: 0ms; }
.stagger-list > *:nth-child(2) { animation-delay: 60ms; }
.stagger-list > *:nth-child(3) { animation-delay: 120ms; }
.stagger-list > *:nth-child(4) { animation-delay: 180ms; }
.stagger-list > *:nth-child(5) { animation-delay: 240ms; }
.stagger-list > *:nth-child(n+6) { animation-delay: 300ms; }
```

### Reduced Motion (obrigatório na implementação, NÃO no JSX preview)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Scrollbar Customizada (no JSX)

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
```

---

## 6. MAPEAMENTO PÁGINA-POR-PÁGINA

### Seções demonstradas no JSX Preview

O JSX organiza o preview em **7 seções de componentes** (não em páginas do app):

| Seção JSX | Componentes demonstrados |
|---|---|
| **buttons** | Btn ×5 variantes × 3 tamanhos, com ícones |
| **cards** | Stats Cards ×4, Tool Cards ×3, Disabled Cards ×3, Notification Card, Empty State |
| **selects** | CustomSelect ×2, SlidingTabs, ProgressBar, FilterPills |
| **users** | SearchInput (inline), Btn, CustomSelect, User Cards ×3 com Badges e ActionBtns |
| **icons** | Grid com todos os 30+ ícones SVG |
| **ai** | AIBotFAB, Bot icon variants (24-48px), IA Stats Dashboard ×3 |
| **navbar** | Navbar completa com busca, theme toggle, notif badge, user info, action btns |

### Mapeamento para Páginas do App

| Página | Componentes | Ícones SVG (keys JSX) |
|---|---|---|
| **Dashboard** | card-stat ×4, card-revenue | `users`, `dollar`, `wallet`, `chart` |
| **Afiliados** | card-stat ×4, SlidingTabs, ProgressBar, referral-box, badges | `users`, `dollar`, `wallet`, `chart`, `link`, `copy`, `qrcode` |
| **Cobranças** | Btn warning (Nova Cobrança), Btn secondary (Saques PIX), card-revenue, card-empty | `plus`, `download`, `dollar` |
| **Marketplace** | SearchInput, FilterPills, CustomSelect ×2, card-tool grid | `search`, `filter`, `chevronDown` |
| **IA** | card-stat ×3, card-tool ×3, card-disabled ×3 | `sparkles`, `wand`, `brain`, `messageAI`, `image`, `lock`, `dollar`, `barChart` |
| **Mensagens** | SearchInput, card-empty (conversas) | `search`, `message` |
| **Notificações** | FilterPills, Btn primary (Marcar lidas), card-notification, ActionBtns | `bell`, `check`, `trash`, `dollar` |
| **Usuários (Admin)** | SearchInput, Btn primary (Buscar), CustomSelect, card-user list, badges, ActionBtns | `search`, `edit`, `copy`, `gift`, `trash` |
| **Perfil/Config** | avatar-upload, card-appearance ×3, toggle-switch | `sun`, `moon`, `monitor`, `bell` |
| **Super Admin** | CustomSelect (user), Btn primary (Aplicar), Btn secondary (Voltar) | `users`, `chevronDown` |

---

## 7. PROMPT DE IMPLEMENTAÇÃO

```
Você é um engenheiro frontend sênior modernizando o VFIT (SaaS para personal trainers, React/Next.js).

ARQUIVO DE REFERÊNCIA: vfit-design-system-v2.jsx
Este arquivo contém o preview interativo com TODOS os componentes, tokens, e variações light/dark.

## CONTEXTO
- Plataforma atual usa botões verdes 3D (MANTER estilo) e cinza escuro #3a3a3a (SUBSTITUIR por slate)
- Zero animações atualmente — adicionar com transform + opacity (GPU only)
- Cards flat sem profundidade — glassmorphism sutil com backdrop-filter
- Selects HTML nativos — substituir por CustomSelect component
- Emojis como ícones — PROIBIDO, substituir por SVG (lucide-react ou inline)

## REGRAS INVIOLÁVEIS
1. ZERO emojis — todo ícone é SVG (lucide-react ou inline custom)
2. Animações APENAS transform + opacity (GPU-accelerated)
3. will-change nos elementos animados
4. prefers-reduced-motion obrigatório
5. Todas as cores via CSS custom properties (ver Seção 2)
6. data-theme="dark" para modo escuro
7. Mobile-first, animações < 400ms
8. Não quebrar funcionalidade existente
9. Font: Plus Jakarta Sans (wght 400-800) — ver Seção 2.1

## COMPONENTES IMPLEMENTADOS NO JSX (8 de 12)

| # | Componente | Status no JSX | Implementação |
|---|---|---|---|
| 1 | Btn | ✅ Completo | 5 variantes × 3 tamanhos, icon support |
| 2 | Card | ✅ Completo | Base glass + hover, 6 variações inline |
| 3 | CustomSelect | ✅ Completo | Click outside, chevron rotate, glassmorphism |
| 4 | ActionBtn | ✅ Completo | Normal + destructive, tooltip, scale bounce |
| 5 | Badge | ✅ Completo | 4 types: aluno, personal, super-admin, verified |
| 6 | SlidingTabs | ✅ Completo | Indicator via JS offsetLeft/offsetWidth |
| 7 | ProgressBar | ✅ Completo | Shimmer animation |
| 8 | AIBotFAB | ✅ Completo | Gradient + scale/rotate hover |
| 9 | SearchInput | ⚠️ Inline only | Implementado inline na seção users, não componente separado |
| 10 | FilterPills | ⚠️ Inline only | Implementado inline na seção selects |
| 11 | ToggleSwitch | ❌ Não no JSX | Apenas na spec, precisa implementar |
| 12 | AvatarUpload | ❌ Não no JSX | Apenas na spec, precisa implementar |

## IMPLEMENTAÇÃO

### Passo 1: Instalar fonte + ícones
```bash
npm install lucide-react
```
Adicionar font import no `<head>` ou CSS.

### Passo 2: CSS Global
Adicionar as custom properties :root e [data-theme="dark"] conforme Seção 2.
Adicionar keyframes conforme Seção 5.

### Passo 3: Componentes (ordem de prioridade)
1. Btn (5 variantes × 3 tamanhos) — referência: JSX linhas 186-210
2. Card (base glass + variações inline) — referência: JSX linhas 213-225
3. CustomSelect — referência: JSX linhas 256-294
4. ActionBtn (normal + destructive) — referência: JSX linhas 228-241
5. Badge (4 types com ícones prefixo) — referência: JSX linhas 244-254
6. SlidingTabs — referência: JSX linhas 297-314
7. ProgressBar — referência: JSX linhas 316-321
8. SearchInput (extrair de inline) — referência: JSX linhas 604-612
9. FilterPills (extrair de inline) — referência: JSX linhas 581-592
10. AIBotFAB — referência: JSX linhas 324-357
11. ToggleSwitch (criar do zero)
12. AvatarUpload (criar do zero)

### Passo 4: Aplicar por página
Seguir mapeamento página-por-página da Seção 6.

### Passo 5: Animações
- Stagger com animationDelay inline (padrão JSX: i*60ms para cards, i*70ms para users, i*80ms para tools)
- fadeInUp para cards ao carregar
- gentleBounce para empty states (3s infinite)
- shimmer para progress bars (2s infinite)
- pulse para notification badge (2s infinite)
- slideInRight para notifications (spec only — implementar)

### Passo 6: Dark Mode
- Toggle no header: Sun/Moon com ícones SVG
- Aplicar data-theme="dark" no <html>
- Persistir preferência no localStorage
- Respeitar prefers-color-scheme do sistema
```

---

## 8. CHECKLIST FINAL

### Core — Alinhamento com JSX
- [x] CSS Custom Properties (light + dark) — ✅ 50+ tokens documentados
- [x] Lucide Icons (ou inline SVG equivalente) — ✅ 30 ícones no JSX
- [x] AI Bot SVG custom — ✅ Componente aiBot no Icons object
- [x] Botões 3D (5 variantes × 3 tamanhos) — ✅ Btn component
- [x] Card base com glassmorphism — ✅ Card component
- [x] CustomSelect component — ✅ Com click outside, chevron rotate
- [x] ActionBtn (normal + destructive) — ✅ Com tooltip
- [x] Badge (4 types) — ✅ Com ícones prefixo
- [x] SlidingTabs — ✅ Com indicator JS
- [x] ProgressBar — ✅ Com shimmer
- [x] AIBotFAB — ✅ Com scale+rotate hover
- [ ] SearchInput como componente separado — ⚠️ Inline no JSX, extrair
- [ ] FilterPills como componente separado — ⚠️ Inline no JSX, extrair
- [ ] ToggleSwitch — ❌ Não implementado no JSX
- [ ] AvatarUpload — ❌ Não implementado no JSX
- [x] Tipografia Plus Jakarta Sans — ✅ Google Fonts import no JSX
- [x] textInverse token — ✅ Documentado e no JSX

### Animações
- [x] fadeInUp — ✅ No JSX, usado em cards e sections
- [x] gentleBounce — ✅ No JSX, usado em empty states
- [x] shimmer — ✅ No JSX, usado em ProgressBar
- [x] pulse — ✅ No JSX, usado em notification badge
- [x] spin — ✅ Definido no JSX
- [ ] slideInRight — ❌ Na spec apenas, não no JSX
- [x] Stagger via animationDelay inline — ✅ No JSX
- [ ] Stagger via CSS class .stagger-list — ❌ Sugerido apenas
- [ ] prefers-reduced-motion CSS — ❌ Na spec apenas, obrigatório na implementação

### Por Página
- [ ] Dashboard — stats cards, revenue card
- [ ] Afiliados — tabs, progress, referral, stats
- [ ] Cobranças — warning buttons, empty state, revenue
- [ ] Marketplace — search, filters, selects, cards
- [ ] IA — stats, tool cards, disabled cards, FAB
- [ ] Mensagens — empty state, search
- [ ] Notificações — filter pills, notification cards
- [ ] Usuários — user cards, badges, action buttons, search, select
- [ ] Configurações — appearance cards, toggle, avatar
- [ ] Super Admin — select, buttons

### Qualidade
- [ ] prefers-reduced-motion implementado
- [ ] Dark mode funcional com toggle + localStorage + prefers-color-scheme
- [ ] Todos os `<select>` nativos substituídos por CustomSelect
- [ ] Zero emojis em todo o codebase
- [ ] Mobile responsivo
- [ ] Stagger animations em listas
- [ ] Action buttons com hover states corretos
- [ ] Scrollbar customizada

---

## 9. DIFERENÇAS CONSOLIDADAS: DOCS vs JSX

> **Referência rápida** de tudo que difere entre a spec original e o JSX implementado.

### Ícones divergentes

| Contexto | Docs original | JSX real | Ação |
|---|---|---|---|
| Gráfico mensal | `TrendingUp` | `chart` (line chart custom) | Usar JSX ✅ |
| Comparação Fotos | `ScanEye` | `image` | Usar JSX ✅ |
| Cobranças IA | `Receipt` | `dollar` | Usar JSX ✅ |
| Assistente IA | `MessageSquareCode` | `messageAI` (custom) | Usar JSX ✅ |
| Verificado badge | `CheckCircle2` | `check` (simples) | Usar JSX ✅ |

### Tokens ausentes no docs original

| Token | Valor | Tema |
|---|---|---|
| `textInverse` | `#ffffff` | Ambos |
| `borderFocus` (dark) | `#34d399` | Dark (explícito) |
| `btn3dPrimaryHover` (dark) | Valores diferentes do light | Dark |
| `btn3dPrimaryActive` (dark) | Valores diferentes do light | Dark |
| `btn3dSecondaryHover` (dark) | Valores diferentes do light | Dark |
| `btn3dSecondaryActive` (dark) | Valores diferentes do light | Dark |

### Componentes: spec vs JSX

| Componente | Spec original | JSX real |
|---|---|---|
| Card | 8 variantes nomeadas | 1 base + variações inline |
| SearchInput | Componente separado | Inline na seção users |
| FilterPills | Componente separado | Inline na seção selects |
| ToggleSwitch | Listado | ❌ Não implementado |
| AvatarUpload | Listado | ❌ Não implementado |
| Btn gap | Fixo 8px | Dinâmico: sm=6, md=8, lg=10 |
| Btn border-radius | Não especificado | sm=10, md=12, lg=14 |

### Animações: spec vs JSX

| Animação | Spec | JSX |
|---|---|---|
| slideInRight | ✅ Definida | ❌ Não implementada |
| spin | ❌ Não listada | ✅ Definida |
| Stagger | CSS class `.stagger-list` | Inline `animationDelay` |
| prefers-reduced-motion | ✅ Definida | ❌ Não no preview (obrigatória na prod) |

---

**Documento atualizado — VFIT v2.0 — Março 2026**
**Última sincronização com JSX: 13/03/2026**

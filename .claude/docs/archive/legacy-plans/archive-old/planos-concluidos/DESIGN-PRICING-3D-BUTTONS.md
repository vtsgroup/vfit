# 🎨 VFIT — Design System: Pricing & Botões 3D

> **v1.1** · 28/02/2026 · Referência: Koyeb.com (DARK adaptation)

---

## 📐 Referência Visual

A seção de Pricing segue o design da **Koyeb** (`koyeb.com/pricing`) adaptada para versão **DARK** com botões verdes 3D no estilo da marca VFIT.

**Componente:** `src/components/landing/pricing-koyeb.tsx`

---

## 🎯 Planos Definidos

### Tabela de Preços

| Plano | Mensal | Anual (−20%) | Economia/ano | Ícone |
|-------|-------:|-------------:|-------------:|:-----:|
| **Essencial** | R$ 0 | R$ 0 | — | Spark |
| **Trainer** | R$ 29,90 | R$ 23,92/mês | R$ 71,76 | Bolt |
| **Profissional** | R$ 59,90 | R$ 47,92/mês | R$ 143,76 | Briefcase |
| **Max** | R$ 129,90 | R$ 103,92/mês | R$ 311,76 | Crown |

> **Regra:** Anual = Mensal × 0.80 (20% off = 2 meses grátis)

### Features por Plano

#### Essencial (Grátis)
- 5 alunos ativos
- Gamificação (XP, streaks) ← **destaque** (nenhum concorrente tem no grátis)
- Cobrança Pix/boleto com taxa configurável
- Personal decide: absorve ou repassa taxa ao aluno
- App PWA completo
- Suporte por e-mail

#### Trainer (R$ 29,90/mês)
- **Alunos ilimitados** ← destaque
- Recorrência automática (Pix Automático 2026)
- Gamificação completa (badges, conquistas, ranking)
- **Notificações automáticas via e-mail + WhatsApp** ← destaque
- E-mail @iapersonal.app.br incluso
- Relatórios avançados
- 👉 *MFIT cobra R$ 39,90 sem recorrência e sem gamificação*

#### Profissional (R$ 59,90/mês)
- Tudo do Trainer +
- **Contratos digitais com modelos prontos** ← destaque
- Invoices profissionais com logo do personal
- Papel timbrado digital
- **30 NFs/mês incluídas** ← destaque
- Agendamento automático
- Topo do marketplace + Selo Verificado
- 👉 *Nenhum concorrente oferece tudo isso num único app*

#### Max (R$ 129,90/mês)

---

## ✨ Refinamento Pixel Perfect (v1.1)

- Tipografia ajustada para legibilidade premium:
  - `tracking-[0.01em]` no heading principal
  - preço com hierarquia mais forte (`text-5xl/sm:text-6xl`)
  - sufixo `/mês` também em mono style
- Plano popular reforçado:
  - `rounded-3xl`
  - `border-2` verde com `ring` interno
  - camada (`z-30`) acima dos cards adjacentes
- Emojis removidos e substituídos por ícones vetoriais premium (`PlanTierIcon`)
- Checks de features atualizados para estilo moderno:
  - cápsula circular com borda/glow
  - badge `Pro` em features destacadas
- Correção visual de seam/borda entre cards no desktop:
  - compensação com `lg:-ml-px` nos cards não-populares
- Banners inferiores (`Diferenciais` e `Plano Anual`) em glassmorphism:
  - `bg-white/4` + `backdrop-blur-xl`
  - overlay com gradiente suave
  - `ring` interno e mesma altura (`h-full`)
- Tudo do Profissional +
- **E-mail com domínio próprio (@seudominio.com.br)** ← destaque
- **App white-label (nome + logo do personal)** ← destaque
- Contratos com assinatura digital ICP-Brasil
- Zero menção ao VFIT
- **Suporte VIP 24/7** ← destaque
- 👉 *Mobitrainer e Nexur cobram R$ 149,90+ com menos recursos*

---

## 🔘 Design System: Botões 3D

### Conceito

Os botões seguem o estilo **Koyeb** com efeito 3D criado por `box-shadow` com offset inferior sólido, simulando profundidade. No hover, o botão "levanta". No active/click, o botão "afunda".

### Anatomia do Botão 3D

```
┌──────────────────────────┐ ← border-radius: 8px (rounded-lg)
│  ▶  COMEÇAR AGORA        │ ← font-mono, text-xs, uppercase, tracking-wider
└──────────────────────────┘
████████████████████████████  ← shadow bottom (4px solid, cor escura)
```

### Variantes

#### 1. Primary (Popular/Destacado) — `btn-3d-green`

```css
/* Estado normal */
background: #22C55E;                          /* brand-primary */
color: #050A12;                               /* bg-base */
box-shadow:
  0 4px 0 0 #166534,                          /* brand-deep — borda 3D */
  0 6px 16px rgba(0, 0, 0, 0.3);             /* sombra suave */
transform: translateY(0);

/* Hover */
transform: translateY(-2px);
box-shadow:
  0 6px 0 0 #166534,
  0 10px 24px rgba(34, 197, 94, 0.25);        /* glow verde */

/* Active/Click */
transform: translateY(2px);
box-shadow:
  0 2px 0 0 #166534,
  0 3px 8px rgba(0, 0, 0, 0.2);
```

**Tailwind classes:**
```
bg-brand-primary text-bg-base
shadow-[0_4px_0_0_#166534,0_6px_16px_rgba(0,0,0,0.3)]
hover:shadow-[0_6px_0_0_#166534,0_10px_24px_rgba(34,197,94,0.25)]
hover:-translate-y-0.5
active:translate-y-0.5
active:shadow-[0_2px_0_0_#166534,0_3px_8px_rgba(0,0,0,0.2)]
```

#### 2. Secondary (Ghost/Outline) — `btn-3d-dark`

```css
/* Estado normal */
background: rgba(255, 255, 255, 0.04);
color: #F0F4F8;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow:
  0 4px 0 0 rgba(0, 0, 0, 0.4),
  0 6px 16px rgba(0, 0, 0, 0.2);

/* Hover */
border-color: rgba(255, 255, 255, 0.2);
background: rgba(255, 255, 255, 0.08);
transform: translateY(-2px);

/* Active */
transform: translateY(2px);
```

**Tailwind classes:**
```
border border-white/[0.1] bg-white/[0.04] text-white
shadow-[0_4px_0_0_rgba(0,0,0,0.4),0_6px_16px_rgba(0,0,0,0.2)]
hover:border-white/[0.2] hover:bg-white/[0.08]
hover:-translate-y-0.5
active:translate-y-0.5
```

#### 3. Outline Green — `btn-3d-outline-green`

```css
/* Estado normal */
background: rgba(34, 197, 94, 0.1);
color: #22C55E;
border: 1px solid rgba(34, 197, 94, 0.3);
box-shadow:
  0 4px 0 0 rgba(22, 101, 52, 0.5),
  0 6px 16px rgba(0, 0, 0, 0.25);

/* Hover */
background: rgba(34, 197, 94, 0.2);
border-color: rgba(34, 197, 94, 0.5);
transform: translateY(-2px);

/* Active */
transform: translateY(2px);
```

**Tailwind classes:**
```
border border-brand-primary/30 bg-brand-primary/10 text-brand-primary
shadow-[0_4px_0_0_rgba(22,101,52,0.5),0_6px_16px_rgba(0,0,0,0.25)]
hover:bg-brand-primary/20 hover:border-brand-primary/50
hover:-translate-y-0.5
active:translate-y-0.5
```

### Propriedades Compartilhadas (Todos os Botões 3D)

| Propriedade | Valor |
|-------------|-------|
| **Font** | `font-mono` (monospace) |
| **Size** | `text-xs` (12px) |
| **Weight** | `font-black` (900) |
| **Transform** | `uppercase` |
| **Tracking** | `tracking-wider` (0.05em) |
| **Padding** | `px-5 py-3` (20px × 12px) |
| **Border Radius** | `rounded-lg` (8px) |
| **Transition** | `transition-all duration-150` |
| **Ícone** | Seta triangular ▶ (SVG, 12×12) |

### Ícone do Botão (Arrow)

```svg
<svg viewBox="0 0 12 12" fill="currentColor" class="h-3 w-3">
  <path d="M2 1.5l7.5 4.5-7.5 4.5V1.5z" />
</svg>
```

---

## 🏗️ Estrutura do Card (Koyeb-Style)

### Layout

```
┌─────────────────────────────────────────┐
│  🆓  ESSENCIAL           (tier label)   │
│                                         │
│  Grátis                  (preço grande) │
│  ou R$ 29,90 /mês                       │
│  ━━━ R$ 23,92/mês ━━━   (se anual)     │
│  Economize R$ 71,76/ano  (badge)        │
│                                         │
│  Para quem está começando... (desc)     │
│                                         │
│  ─── RECURSOS ───        (header)       │
│  ✓ 5 alunos ativos                      │
│  ✓ Gamificação (XP, streaks) *destaque* │
│  ✓ Cobrança Pix/boleto                  │
│  ✓ Taxa configurável                    │
│                                         │
│  👉 Comparativo concorrente  (box)      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ▶  COMEÇAR GRÁTIS              │    │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (3D)      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Cores dos Cards

| Elemento | Popular (Trainer) | Normal |
|----------|-------------------|--------|
| **Border** | `border-brand-primary/40` | `border-white/[0.06]` |
| **Background** | `bg-bg-surface-1` (#0B1221) | `bg-bg-base` (#050A12) |
| **Shadow** | `shadow-[0_0_40px_rgba(34,197,94,0.08)]` | none |
| **Scale** | `lg:scale-[1.02]` | normal |
| **Hover** | `-translate-y-1` | `-translate-y-1` + `border-white/[0.12]` |

### Grid Responsivo

| Breakpoint | Colunas | Notas |
|------------|---------|-------|
| Mobile (`<640px`) | 1 col | Stack vertical |
| Tablet (`sm:`) | 2 cols | 2×2 grid |
| Desktop (`lg:`) | 4 cols | Linha única, sem gap |

**Border radius:** Os cards nas pontas têm cantos arredondados (`rounded-2xl`) enquanto os internos são retos, criando um efeito de "card unificado" como no Koyeb.

---

## 🔀 Toggle Anual/Mensal

### Comportamento

- **Default:** Mensal selecionado
- **Toggle:** Clique alterna entre Mensal e Anual
- **Desconto:** 20% off no anual (2 meses grátis)
- **Visual:** Pill toggle com label ativo em bg-white/10
- **Badge:** "−20%" em verde ao lado de "Anual"
- **Analytics:** Envia evento `pricing_toggle` com billing type

### Cálculo de Preços

```typescript
// Preço anual = mensal × 0.80
function getAnnualPrice(monthlyPrice: number): number {
  if (monthlyPrice === 0) return 0
  return Math.round(monthlyPrice * 0.8 * 100) / 100
}

// Economia anual = (mensal × 12) - (anual × 12)
// = mensal × 12 × 0.20
// = mensal × 2.4
```

| Plano | Mensal | Anual/mês | Anual total | Economia |
|-------|-------:|----------:|------------:|---------:|
| Trainer | R$ 29,90 | R$ 23,92 | R$ 287,04 | R$ 71,76 |
| Profissional | R$ 59,90 | R$ 47,92 | R$ 575,04 | R$ 143,76 |
| Max | R$ 129,90 | R$ 103,92 | R$ 1.247,04 | R$ 311,76 |

---

## 🎨 Tokens de Cor Usados

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-brand-primary` | `#22C55E` | Botão primary, badges, checks, texto destaque |
| `--color-brand-deep` | `#166534` | Shadow 3D (borda inferior dos botões) |
| `--color-brand-primary-hover` | `#4ADE80` | Hover de links |
| `--color-brand-mint` | `#86EFAC` | Gradiente do título |
| `--color-brand-accent` | `#84CC16` | Gradiente do título + glow |
| `--color-bg-base` | `#050A12` | Background da seção + cards normais |
| `--color-bg-surface-1` | `#0B1221` | Background do card popular |
| `--color-text-primary-cool` | `#F0F4F8` | Texto branco principal |
| `--color-text-secondary-cool` | `#94A3B8` | Texto secundário/descrições |
| `--color-text-muted-cool` | `#64748B` | Labels, preços antigos, tier names |

---

## 📝 Banners Inferiores (Koyeb-style)

### Banner 1: Diferenciais Únicos
- Border: `border-brand-primary/20`
- Background: gradient sutil `from-brand-primary/[0.06]`
- Decoração: Círculos concêntricos (como os circuit patterns do Koyeb)
- CTA: Link com ícone ▶

### Banner 2: Plano Anual
- Border: `border-white/[0.06]`
- Background: `bg-white/[0.02]`
- CTA: Botão que ativa o toggle anual

### 🔒 Forçar backdrop blur real (Safari + Chromium)

Para garantir blur perceptível em todos os browsers, usamos camada dedicada com `backdrop-filter` explícito (além do visual gradient/ring):

```tsx
const forcedGlassStyle = {
  backdropFilter: 'blur(22px) saturate(1.45)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.45)',
}

<div className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-bg-surface-1/18 shadow-[0_16px_50px_rgba(3,8,16,0.45)]">
  <div className="absolute inset-0 rounded-2xl bg-bg-surface-1/12" style={forcedGlassStyle} />
  <div className="absolute inset-0 bg-linear-to-br from-brand-primary/16 via-white/5 to-brand-accent/9" />
  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/14" />
  <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-brand-primary/30 via-transparent to-white/16 opacity-60" />
  {/* conteúdo */}
</div>
```

> Regra prática: sem camada translúcida + `backdrop-filter`, o blur quase não aparece. O blur atua no que está **atrás** do card.

### ✅ Força máxima aplicada (v4.0.5+)

Para garantir percepção visual clara do blur, aplicamos **dupla camada**:

1. blur no container do card (classe + inline style)
2. blur no filme interno (`absolute inset-0`) com alpha baixo

Isso melhora consistência quando o fundo é escuro e de baixo contraste.

---

## ♻️ Padrões reutilizáveis deste design

### 1) `PricingCardPremium`
- Base: `relative flex h-full flex-col border backdrop-blur-md`
- Popular: `rounded-3xl border-2 border-brand-primary/70` + `z-80`
- Normal: `border-white/8 bg-bg-base/92`
- Sem deslocamento no hover (estabilidade visual), apenas borda/sombra.

### 2) `Button3D`
- 3 variantes: `primary`, `ghost`, `outline-green`
- Profundidade por `box-shadow` inferior fixo (`0 4px 0 0 #166534` no verde)
- `active` sempre reduz profundidade para simular clique real.

### 3) `FeatureCheckBadge`
- Check em cápsula circular com borda translúcida
- Badge `Pro` para itens `highlight: true`
- Leitura rápida: destaque visual sem poluir card.

### 4) `GlassPanelPremium`
- Fundo translúcido (`bg-bg-surface-1/18`)
- Camada blur forçada (`forcedGlassStyle`)
- Overlay gradiente + ring interno + borda degradê externa
- Pode ser reutilizado em CTA final, testimonials destacados e cards de dashboard.

### 5) `StackingRulePopular`
- Grid com `relative isolate overflow-visible`
- Wrapper animado do card popular com `z-70`
- Card popular com `z-80`
- Garante sobreposição correta mesmo com `IntersectionReveal`.

---

## 📱 Analytics Tracking

| Evento | Quando | Dados |
|--------|--------|-------|
| `lp_pricing_view` | Seção visível | `{ section: 'pricing-koyeb' }` |
| `pricing_toggle` | Toggle anual/mensal | `{ billing: 'annual'/'monthly' }` |
| `plan_click` | Clique no CTA | `{ plan, plan_price, billing }` |
| `lp_register_start` | CTA leva a /register | `{ plan }` |

---

## 🔧 Como Usar

```tsx
import { PricingKoyeb } from '@/components/landing/pricing-koyeb'

// Na landing page:
<PricingKoyeb />
```

Para substituir o pricing antigo, trocar a importação em `src/app/(landing)/page.tsx`:
```tsx
// Antes:
import { Pricing } from '@/components/landing/pricing'
// Depois:
import { PricingKoyeb as Pricing } from '@/components/landing/pricing-koyeb'
```

---

## 🆚 Status

- [x] Componente criado (`pricing-koyeb.tsx`)
- [x] 4 planos com features completas
- [x] Toggle Anual/Mensal com 20% off
- [x] Botões 3D (3 variantes)
- [x] Design responsivo (1/2/4 colunas)
- [x] Analytics tracking
- [x] Comparativos com concorrentes
- [x] Banners inferiores (Koyeb-style)
- [ ] Integração na landing page (stand by)
- [ ] Testes visuais mobile

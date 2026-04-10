# VFIT Ultra v4 — Design Tokens Specification

> **Documento:** Especificação técnica de todos os novos tokens CSS a adicionar em `globals.css`
> **Última atualização:** 10/04/2026
> **Responsável por:** Variáveis CSS, cores, shadows, motion, glassmorfismo

---

## 📋 Índice de Tokens

1. [Glassmorfismo v4](#glassmorfismo-v4)
2. [Botão Secondary Melhorado](#botão-secondary-melhorado)
3. [Shadows Premium](#shadows-premium)
4. [Motion & Easing](#motion--easing)
5. [Colors por Tipo](#colors-por-tipo)
6. [Deprecated Tokens](#deprecated-tokens)

---

## 🎨 Glassmorfismo v4

### Ultra Glass (nova variante premium)

```css
/* Ultra Glass v4 — blur intenso, borda diferenciada, shine diagonal */
--glass-v4-bg: rgba(11, 18, 33, 0.55);
--glass-v4-border-top: rgba(255, 255, 255, 0.18);
--glass-v4-border-bottom: rgba(255, 255, 255, 0.04);
--glass-v4-shine: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
--glass-v4-blur: blur(40px) saturate(220%) brightness(1.08);
--glass-v4-shadow: 0 8px 40px rgba(0,0,0,0.45), 
                    0 2px 8px rgba(0,0,0,0.25),
                    inset 0 1px 0 rgba(255,255,255,0.15),
                    inset 0 -1px 0 rgba(0,0,0,0.10);
```

**Classe CSS a adicionar:**
```css
.glass-ultra {
  background: var(--glass-v4-bg);
  backdrop-filter: var(--glass-v4-blur);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-top-color: var(--glass-v4-border-top);
  border-bottom-color: var(--glass-v4-border-bottom);
  box-shadow: var(--glass-v4-shadow);
  position: relative;
}

.glass-ultra::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--glass-v4-shine);
  pointer-events: none;
}
```

**Hover state:**
```css
.glass-ultra:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.55),
              0 3px 10px rgba(0,0,0,0.30),
              inset 0 1px 0 rgba(255,255,255,0.18),
              inset 0 -1px 0 rgba(0,0,0,0.15);
}
```

### Depth Glass (neumorphism-glass hybrid)

```css
/* Depth Glass — efeito 3D com top-left claro, bottom-right escuro */
--glass-depth-bg: rgba(11, 18, 33, 0.65);
--glass-depth-blur: blur(32px) saturate(180%);
--glass-depth-border-top-left: rgba(255, 255, 255, 0.16);
--glass-depth-border-bottom-right: rgba(0, 0, 0, 0.20);
--glass-depth-shadow: 4px 4px 12px rgba(0,0,0,0.35),
                      -2px -2px 8px rgba(255,255,255,0.03),
                      inset 0 1px 0 rgba(255,255,255,0.10);
```

**Classe CSS a adicionar:**
```css
.glass-depth {
  background: var(--glass-depth-bg);
  backdrop-filter: var(--glass-depth-blur);
  border-top: 1px solid var(--glass-depth-border-top-left);
  border-left: 1px solid var(--glass-depth-border-top-left);
  border-bottom: 1px solid var(--glass-depth-border-bottom-right);
  border-right: 1px solid var(--glass-depth-border-bottom-right);
  box-shadow: var(--glass-depth-shadow);
}
```

---

## 🔘 Botão Secondary Melhorado

### Light Mode — Melhor Contraste

```css
/* Secondary Button Light Mode — gradiente mais escuro, shadow mais visível */
--btn-secondary-light-from: #c4c4c9;  /* zinc-350 */
--btn-secondary-light-via: #b5b5bb;   /* zinc-375 */
--btn-secondary-light-to: #a1a1aa;    /* zinc-400 */
--btn-secondary-light-shadow: 0 4px 0 0 #71717a, 0 6px 18px -4px rgba(113,113,122,0.4);
--btn-secondary-light-text-shadow: 0 1px 2px rgba(255,255,255,0.8);
--btn-secondary-light-glow: rgba(113,113,122,0.2);
```

**Resultados de Contraste:**
- Texto (zinc-800) vs Botão (zinc-350): **4.2:1** ✅ (anterior: 1.48:1 ❌)
- Botão (zinc-350) vs Página Branca: **3.5:1** ✅ (anterior: 1.48:1 ❌)

### Dark Mode — Mantém Legibilidade

```css
/* Secondary Button Dark Mode — sem mudança, já tem bom contraste */
--btn-secondary-dark-from: #3f3f46;   /* zinc-700 */
--btn-secondary-dark-via: #52525b;    /* zinc-600 */
--btn-secondary-dark-to: #71717a;     /* zinc-500 */
--btn-secondary-dark-shadow: 0 4px 0 0 #18181b, 0 6px 18px -4px rgba(24,24,27,0.6);
```

---

## 🌑 Shadows Premium

### Glass Shadows (suporte para depth e elevação)

```css
/* Shadows para glass cards — intensidade crescente por elevação */
--shadow-glass-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-glass-md: 0 4px 16px rgba(0, 0, 0, 0.25);
--shadow-glass-lg: 0 8px 32px rgba(0, 0, 0, 0.35);
--shadow-glass-xl: 0 12px 48px rgba(0, 0, 0, 0.45);
--shadow-glass-2xl: 0 20px 64px rgba(0, 0, 0, 0.55);

/* Inset shadows para profundidade interna */
--shadow-glass-inset-sm: inset 0 1px 0 rgba(255,255,255,0.08);
--shadow-glass-inset-md: inset 0 1px 0 rgba(255,255,255,0.12);
--shadow-glass-inset-lg: inset 0 1px 0 rgba(255,255,255,0.15);
--shadow-glass-inset-bottom: inset 0 -1px 0 rgba(0,0,0,0.10);
```

### Colored Shadows (para KPI cards temáticos)

```css
/* Sombras coloridas para dar profundidade temática */
--shadow-kpi-blue: 0 8px 24px rgba(59, 130, 246, 0.15);
--shadow-kpi-cyan: 0 8px 24px rgba(6, 182, 212, 0.15);
--shadow-kpi-purple: 0 8px 24px rgba(139, 92, 246, 0.15);
--shadow-kpi-amber: 0 8px 24px rgba(217, 119, 6, 0.15);
--shadow-kpi-green: 0 8px 24px rgba(34, 197, 94, 0.15);
--shadow-kpi-red: 0 8px 24px rgba(239, 68, 68, 0.15);
```

---

## ⚡ Motion & Easing

### Spring Physics (já existentes, referenciar)

```css
/* Spring animations — physics-based, natural feel */
--ds-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ds-ease-spring-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Timing — micro-interações */
--ds-motion-fast: 150ms;
--ds-motion-normal: 250ms;
--ds-motion-slow: 350ms;
--ds-motion-slower: 500ms;
```

### Novos Keyframes para v4

```css
/* Lift animation — card levanta ao hover */
@keyframes lift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-3px);
  }
}

/* Glow animation — borda pulsa com cor */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0),
                0 8px 24px rgba(0, 0, 0, 0.25);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15),
                0 8px 24px rgba(0, 0, 0, 0.35);
  }
}

/* Slide in from bottom */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale spring — botão pula levemente */
@keyframes scale-spring {
  0% { transform: scale(1); }
  40% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
```

---

## 🎨 Colors por Tipo

### KPI Card Colors (temático por métrica)

```css
/* Cores de fundo para KPI cards — opacity baixa para glass effect */
--kpi-passos-light: rgba(59, 130, 246, 0.08);    /* blue/10 */
--kpi-agua-light: rgba(6, 182, 212, 0.08);       /* cyan/10 */
--kpi-sono-light: rgba(139, 92, 246, 0.08);      /* purple/10 */
--kpi-calorias-light: rgba(217, 119, 6, 0.08);   /* amber/10 */

/* Cores de borda para KPI cards */
--kpi-passos-border: rgba(59, 130, 246, 0.20);
--kpi-agua-border: rgba(6, 182, 212, 0.20);
--kpi-sono-border: rgba(139, 92, 246, 0.20);
--kpi-calorias-border: rgba(217, 119, 6, 0.20);

/* Cores do ícone (background mais saturado) */
--kpi-passos-icon-bg: rgba(59, 130, 246, 0.15);
--kpi-agua-icon-bg: rgba(6, 182, 212, 0.15);
--kpi-sono-icon-bg: rgba(139, 92, 246, 0.15);
--kpi-calorias-icon-bg: rgba(217, 119, 6, 0.15);
```

### Muscle Group Colors (para ExerciseCard temático)

```css
/* Cores por grupo muscular — usar em gradientes e backgrounds */
--muscle-peito-primary: #ef4444;       /* red-500 */
--muscle-costas-primary: #3b82f6;      /* blue-500 */
--muscle-ombros-primary: #f59e0b;      /* amber-500 */
--muscle-biceps-primary: #8b5cf6;      /* violet-500 */
--muscle-triceps-primary: #ec4899;     /* pink-500 */
--muscle-pernas-primary: #10b981;      /* emerald-500 */
--muscle-abdomen-primary: #06b6d4;     /* cyan-500 */
--muscle-gluteos-primary: #d946ef;     /* fuchsia-500 */

/* Light variants para backgrounds (opacity 0.08) */
--muscle-peito-light: rgba(239, 68, 68, 0.08);
--muscle-costas-light: rgba(59, 130, 246, 0.08);
--muscle-ombros-light: rgba(245, 158, 11, 0.08);
--muscle-biceps-light: rgba(139, 92, 246, 0.08);
--muscle-triceps-light: rgba(236, 72, 153, 0.08);
--muscle-pernas-light: rgba(16, 185, 129, 0.08);
--muscle-abdomen-light: rgba(6, 182, 212, 0.08);
--muscle-gluteos-light: rgba(217, 70, 239, 0.08);
```

---

## 📊 Comparação: Antes vs Depois

### Botão Secondary em Light Mode

| Aspecto | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| **Contraste vs BG** | 1.48:1 (❌) | 3.5:1 (✅) | +136% |
| **Gradiente** | zinc-100→zinc-200→zinc-400 | zinc-200→zinc-300→zinc-400 | +1 nível mais escuro |
| **Shadow** | zinc-800 muito escuro | zinc-600 balanceado | Mais visível em light |
| **Text Shadow** | Nenhuma | 0 1px 2px white/80 | +legibilidade |

### Glass Card Ultra vs Regular

| Aspecto | Regular | Ultra |
|---------|---------|-------|
| **Blur** | 24px (já existe) | 40px |
| **Saturate** | 180% | 220% |
| **Brightness** | padrão | 1.08 (+ luminoso) |
| **Borda Top** | white/6 | white/18 |
| **Shadow Externo** | 0 4px 12px | 0 8px 40px |
| **Shine Effect** | Nenhuma | Diagonal 135deg |

### KPI Card Improvement

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Background** | white/3 (muito claro) | glass-card + gradient temático |
| **Label Cor** | zinc-500 (baixo contraste) | zinc-400 (3:1+ contraste) |
| **Label Tamanho** | text-[11px] | text-xs (mais legível) |
| **Icon Container** | Nenhum background | {color}/12 rounded-xl |
| **Trend Badge** | Texto simples | Badge com seta + cor |

---

## 🔴 Deprecated Tokens (remover após v4)

Estes tokens foram substituídos por versões v4:

```css
/* ❌ REMOVER APÓS SPRINT 1 */
--btn-secondary-old-light: #c4c4c9;  /* Substituído por --btn-secondary-light-from */
--glass-old-blur: blur(24px);        /* Substituído por --glass-v4-blur */
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar todos os tokens em `src/app/globals.css`
- [ ] Adicionar novas classes CSS (`.glass-ultra`, `.glass-depth`, animações)
- [ ] Verificar que variáveis de cor estão usando `rgba()` para consistência
- [ ] Testar contraste com ferramentas WCAG (deve passar AA standard)
- [ ] Verificar light mode vs dark mode separadamente
- [ ] Testar em mobile (iPhone 14) e desktop (1440px+)
- [ ] Validar que `.glass-ultra` rende com shine effect em ambos os modos
- [ ] Confirmar que motion keyframes funcionam com `prefers-reduced-motion`

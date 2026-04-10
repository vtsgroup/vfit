# VFIT Ultra v4 — UX/UI Mega Redesign
> **Plano criado:** 10/04/2026  
> **Objetivo:** Melhorias massivas de usabilidade com Design System 3D ultra-moderno, glassmorfismo aprimorado, contraste/cor do botão secundário, e experiência de usuário de primeiro nível.

---

## 📋 Índice de Sprints

| Sprint | Foco | Arquivos | Status |
|--------|------|----------|--------|
| **S1** | Tokens CSS + Botão Secundário 3D aprimorado | `globals.css`, `button.tsx` | ⬜ |
| **S2** | GlassCard v4 — nova variante premium com depth real | `glass-card.tsx`, `card.tsx` | ⬜ |
| **S3** | KPI Cards ultra-modernos com glassmorfismo | `kpi-card.tsx`, `stats-card.tsx` | ⬜ |
| **S4** | Página Treinos B2C — redesign total dos cards | `treinos/page.tsx` | ⬜ |
| **S5** | Página Meu Plano — exercise cards + muscle chips ultra | `plano/page.tsx` | ⬜ |
| **S6** | Página Exercícios — biblioteca ultra-moderna | `exercicios/page.tsx`, `ExerciseCard` | ⬜ |
| **S7** | Navigation upgrade — bottom nav + sidebar refinamento | `bottom-navigation.tsx`, `sidebar.tsx` | ⬜ |
| **S8** | Inputs, Empty States e Feedback global | `md3-input.tsx`, `empty-state-ds.tsx`, `modern-notification.tsx` | ⬜ |

---

## 🎯 Contexto & Motivação

O VFIT tem um design system robusto (glassmorfismo, botões 3D com spring physics, tokens CSS organizados) mas as **páginas principais dos usuários B2C** ainda usam a classe `.glass-card` de forma básica e repetitiva, sem explorar o potencial completo dos tokens premium já definidos.

**Problemas identificados:**
1. Botão `secondary` em light mode tem contraste baixo (zinc-300 quase invisível vs fundo branco)
2. Cards das páginas B2C (treinos, plano, exercícios) usam o glassmorfismo de forma monótona — todos iguais
3. KPI cards de progresso têm visual flat demais (label `text-[11px]` em zinc-500, pouco contraste)
4. Página Exercícios usa MUSCLE_EMOJI (violação da regra DSIcon) e design flat nos grid cards
5. Bottom navigation não usa o depth 3D que já existe no button system
6. Empty states genéricos sem personalidade

**Solução:** Aproveitar os tokens já existentes (premium glass, shadows, motion) para elevar cada componente ao nível premium que os tokens prometem mas ainda não entregam.

---

## Sprint 1 — Tokens CSS + Botão Secundário 3D

### Problema
`secondary` em light mode: `zinc-300 → zinc-800` com contraste bg-vs-page de apenas 1.48:1 — quase invisível.

### Solução
Criar variante `secondary` com mais profundidade visual em light mode usando zinc-400 como base (mais escuro) e adicionando um gradiente lateral para diferenciar do primary.

### Novos Tokens CSS a adicionar no `globals.css`
```css
/* Ultra Glass v4 */
--glass-v4-bg: rgba(11, 18, 33, 0.55);
--glass-v4-border-top: rgba(255, 255, 255, 0.18);
--glass-v4-border-bottom: rgba(255, 255, 255, 0.04);
--glass-v4-shine: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
--glass-v4-blur: blur(32px) saturate(200%) brightness(1.05);

/* Botão Secondary melhorado */
--btn-secondary-light-from: #c4c4c9;  /* zinc-350 — mais escuro que zinc-300 */
--btn-secondary-light-via: #b5b5bb;
--btn-secondary-light-to: #a1a1aa;    /* zinc-400 */
--btn-secondary-light-shadow: 0 4px 0 0 #71717a, 0 6px 18px -4px rgba(113,113,122,0.4);
```

### Mudança em `button.tsx` — variante `secondary`
- Light mode: trocar `from-zinc-100 via-zinc-200 to-zinc-400` para `from-zinc-200 via-zinc-300 to-zinc-400` (mais escuro, mais contraste vs página branca)
- Adicionar `text-shadow` mais forte: `0_1px_2px_rgba(255,255,255,0.8)` para legibilidade do texto zinc-800
- Shadow 3D: de `zinc-800` para `zinc-600` (mais visível em light mode)
- Novo hover glow: `rgba(113,113,122,0.2)` ambient

**Arquivo:** `src/components/ui/button.tsx` — linhas 58-78 (variante secondary)

---

## Sprint 2 — GlassCard v4 (nova variante premium)

### Nova variante `ultra` no `glass-card.tsx`

O GlassCard atual tem 6 variantes (`surface | glass | elevated | outline | glow | gradient`). Adicionar:

**`ultra`**: Glassmorfismo de nível premium com:
- `backdrop-filter: blur(40px) saturate(220%) brightness(1.08)`
- Border: top `rgba(255,255,255,0.20)`, bottom `rgba(0,0,0,0.15)` — efeito de vidro real
- Shine pseudo-elemento diagonal (já existe no `.glass-premium`, encapsular como variante)
- Shadow: `0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)`
- Hover: `translateY(-3px)` + glow verde tênue `rgba(34,197,94,0.06)`

**`depth`**: Card com profundidade 3D estilo neumorphism-glass:
- Border top-left `rgba(255,255,255,0.15)`, bottom-right `rgba(0,0,0,0.20)`
- Dupla shadow: externa escura + interna clara

**Arquivo:** `src/components/ui/glass-card.tsx`

---

## Sprint 3 — KPI Cards Ultra-Modernos

### KPICard atual (progresso)
```
rounded-2xl border border-white/6 bg-white/3 p-4
```
Muito básico. Redesign total:

### KPICard v4
```
glass-card bg-linear-to-br from-{color}/8 via-transparent to-transparent
border border-{color}/15 (topo mais claro, bottom mais escuro)
icon: bg-{color}/12 rounded-xl p-2.5 + icon ring {color}/20
valor: text-xl font-black text-white
label: text-xs font-medium text-text-secondary (zinc-400, não zinc-500)
trend badge: chip pequeno com delta e seta
hover: borda sobe para {color}/25 + translateY(-2px)
```

**Arquivo:** `src/components/progresso/kpi-card.tsx`

---

## Sprint 4 — Página Treinos B2C

### Estado Atual
Cards todos iguais com `glass-card rounded-2xl border border-brand-primary/20`. Repetitivo.

### Redesign
- **Card Treino do Dia**: Glass ultra com borda verde na esquerda (strip colorida 3px), header com gradiente emerald/transparent, ProgressRing mais proeminente
- **KPI Grid (4 mini-cards)**: Cada card com cor própria por tipo (passos=azul, agua=cyan, sono=violet, calorias=amber)
- **Card Nutrição**: Gradiente amber, barra de progresso com animação spring
- **Card Avaliação**: Gradiente violet, CTAs com botão assessment melhorado
- **Seção Explorar Templates**: Cards de template com thumbnail placeholder mais ricos (ícone de grupo muscular + gradiente temático)

**Arquivo:** `src/app/(app)/treinos/page.tsx`

---

## Sprint 5 — Página Meu Plano

### Estado Atual
`ExerciseCard` local usa `rounded-2xl border border-white/6 bg-bg-secondary`. 
`MuscleChip` usa cores hardcoded via `style` inline (violação de convention).

### Redesign
- **MuscleChip**: Migrar cores para tokens `--ds-glass-{color}` existentes, adicionar ícone DSIcon, hover lift
- **ExerciseCard**: Glass com cor temática do grupo muscular, thumbnail 3D, badge de sets/reps mais legível
- **Day Selector Tabs**: Tabs com indicador ativo 3D (pill com sombra, não só border-bottom)
- **Header Greeting**: Gradiente de texto (brand-primary → brand-mint) com texto mais impactante

**Arquivo:** `src/app/(app)/plano/page.tsx`

---

## Sprint 6 — Página Exercícios (Biblioteca)

### Problemas
1. Usa `MUSCLE_EMOJI` (violação da regra 16 — SEMPRE DSIcon)
2. ExerciseCard da biblioteca não documentado aqui mas provavelmente flat

### Mudanças
- Substituir todos `MUSCLE_EMOJI` por `<DSIcon name="{muscleIcon}" size={16} />` 
- Chips de filtro de músculo: adicionar ícone + label mais legível
- Cards de exercício: glassmorfismo temático por grupo muscular
- Tabs (músculo/equipamento/favoritos): sliding pill indicator 3D

**Arquivos:** 
- `src/app/(app)/exercicios/page.tsx`
- `src/components/exercicios/exercise-card.tsx` (verificar)

---

## Sprint 7 — Navigation Upgrade

### Bottom Navigation
- Adicionar micro-animação spring no active indicator (pill com glow verde)
- FAB central: efeito glow pulsante mais pronunciado
- Badge de notificação: animar com scale spring quando aparece

### Sidebar Desktop
- Itens ativos: adicionar strip verde 3D na esquerda (3px border-left com sombra verde)
- Collapsed state: ícones com background mais contrastante

**Arquivos:**
- `src/components/navigation/bottom-navigation.tsx`  
- `src/components/layout/sidebar.tsx`

---

## Sprint 8 — Inputs, Empty States e Notificações

### MD3 Input v4
- Estado focus: border glow mais intenso (`box-shadow: 0 0 0 3px rgba(34,197,94,0.15)`)
- Estado error: shake animation leve
- Helper text: animação fade-in suave

### Empty States
- Ilustrações substituídas por composições geométricas com tokens brand
- CTA button mais proeminente (usar size `lg`)

### Modern Notification Cards
- Adicionar animação de entrada mais elaborada (slide + spring + fade)
- Dot de status: pulse animation sincronizada

**Arquivos:**
- `src/components/ui/md3-input.tsx`
- `src/components/ui/empty-state-ds.tsx`
- `src/components/ui/modern-notification.tsx`

---

## 🔧 Regras Técnicas a Seguir

1. **Tailwind v4**: `bg-linear-to-r` (não `bg-gradient-to-r`), `bg-white/6` (não `/[0.06]`)
2. **Variáveis CSS**: `bg-(--ds-glass-green)` (não `bg-[var(--ds-glass-green)]`)
3. **DSIcon**: Nunca importar `lucide-react` diretamente
4. **Button**: Sempre `<Button>` de `@/components/ui/button` para CTAs
5. **Barrel**: Ao adicionar componente novo → adicionar em `src/components/ui/index.ts`
6. **Auth Guard**: Todo `useQuery` com `enabled: isReady`
7. **Sem hex hardcoded no JSX**: Sempre usar tokens semânticos

---

## 📐 Novos Tokens Visuais a Adicionar

```css
/* Glassmorfismo v4 — ultra premium */
.glass-ultra {
  background: rgba(11, 18, 33, 0.55);
  backdrop-filter: blur(40px) saturate(220%) brightness(1.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.20);
  box-shadow: 
    0 8px 40px rgba(0,0,0,0.45),
    0 2px 8px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.10);
}

/* Depth Card — neumorphism-glass hybrid */
.glass-depth {
  background: rgba(11, 18, 33, 0.65);
  backdrop-filter: blur(32px) saturate(180%);
  border-top: 1px solid rgba(255,255,255,0.16);
  border-left: 1px solid rgba(255,255,255,0.10);
  border-bottom: 1px solid rgba(0,0,0,0.20);
  border-right: 1px solid rgba(0,0,0,0.15);
  box-shadow:
    4px 4px 12px rgba(0,0,0,0.35),
    -2px -2px 8px rgba(255,255,255,0.03),
    inset 0 1px 0 rgba(255,255,255,0.10);
}
```

---

## ✅ Critérios de Conclusão por Sprint

- [ ] S1: `npm run quality:ci` passa, botão secondary tem contraste ≥ 3:1 vs bg branco
- [ ] S2: GlassCard variante `ultra` e `depth` renderizam corretamente em light e dark
- [ ] S3: KPI cards com cor temática e hover suave
- [ ] S4: Página treinos com 3+ variações visuais de card (não mais todos iguais)
- [ ] S5: ZERO uso de `style` inline para cores em MuscleChip; ExerciseCard com glassmorfismo temático
- [ ] S6: ZERO `MUSCLE_EMOJI` — todos DSIcon; filtros com ícone + label
- [ ] S7: Bottom nav active pill com spring animation; sidebar active com strip 3D
- [ ] S8: Input focus com glow ring; empty states com CTA `lg`

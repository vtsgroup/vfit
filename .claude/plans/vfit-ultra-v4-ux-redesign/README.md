# VFIT Ultra v4 — UX/UI Mega Redesign

> **Status:** 🔄 Em Planejamento  
> **Criado em:** 10/04/2026  
> **Objetivo Final:** Elevar o design system VFIT ao nível ultra-moderno com glassmorfismo aprimorado, botões 3D melhorados, e experiência de usuário exponencialmente melhorada.

---

## 📚 Documentação Completa

| Arquivo | Propósito |
|---------|-----------|
| [PLAN.md](./PLAN.md) | Plano estratégico de 8 sprints com objetivos, problemas e soluções |
| [TRACKING.md](./TRACKING.md) | Checklist de tasks com progresso em tempo real |
| [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) | Especificação técnica de novos tokens CSS |
| [COMPONENT-SPECS.md](./COMPONENT-SPECS.md) | Detalhe de cada componente a ser modificado |
| [PAGES-REDESIGN.md](./PAGES-REDESIGN.md) | Mudanças por página (treinos, plano, exercícios) |
| [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) | Passo-a-passo técnico para copilot começar |
| [QA-CHECKLIST.md](./QA-CHECKLIST.md) | Testes, verificações e critérios de aceitação |

---

## 🎯 Visão Geral

### Problema
O VFIT tem um design system robusto (glassmorfismo, botões 3D, tokens CSS bem-organizados) mas as **páginas principais B2C** ainda usam essas features de forma básica e repetitiva, sem explorar o potencial premium já definido nos tokens.

**Achados principais:**
- ❌ Botão `secondary` em light mode: contraste baixo (zinc-300 vs fundo branco = 1.48:1)
- ❌ Cards B2C monotônicos — todos usam a mesma classe `.glass-card` sem variação
- ❌ KPI cards: visual flat (label em `text-[11px]` zinc-500, pouco contraste)
- ❌ Página Exercícios: usa `MUSCLE_EMOJI` (violação DSIcon) e grid flat
- ❌ Bottom nav: não aproveita profundidade 3D do sistema de botões
- ❌ Empty states: genéricos, sem personalidade

### Solução
Criar **8 sprints coordenados** que elevam cada camada (tokens → componentes → páginas) ao nível premium, aproveitando os recursos já existentes mas subutilizados.

---

## 🚀 Sprints Overview

```
S1: Tokens CSS + Botão Secundário 3D             [2–3 arquivos modificados]
S2: GlassCard v4 (variantes ultra + depth)       [1 componente]
S3: KPI Cards Ultra-Modernos                     [2 componentes]
S4: Página Treinos B2C                           [1 página]
S5: Página Meu Plano                             [1 página]
S6: Página Exercícios (Biblioteca)               [2 componentes + 1 página]
S7: Navigation (Bottom Nav + Sidebar)            [2 componentes]
S8: Inputs, Empty States, Notificações           [3 componentes]
```

**Total estimado:** 8–10 horas de implementação (sprints sequenciais, alguns podem paralelizar).

---

## 📋 Quick Start para Implementação

1. **Leia [PLAN.md](./PLAN.md)** → contexto completo
2. **Leia [DESIGN-TOKENS.md](./DESIGN-TOKENS.md)** → tokens CSS a adicionar
3. **Leia [COMPONENT-SPECS.md](./COMPONENT-SPECS.md)** → spec de cada componente
4. **Leia [PAGES-REDESIGN.md](./PAGES-REDESIGN.md)** → mudanças por página
5. **Siga [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)** → passo-a-passo técnico

---

## 🎨 Exemplos Visuais (Descritos)

### Botão Secondary — Light Mode (S1)
```
ANTES:  zinc-300 (#d4d4d8) → contraste 1.48:1 vs white (invisível)
DEPOIS: zinc-300 → zinc-400 gradiente com shadow zinc-600 (3D visível)
        Contraste: ≥3:1 vs white
```

### GlassCard Ultra (S2)
```
ANTES:  .glass-card { blur: 24px; }
DEPOIS: .glass-ultra { blur: 40px; border-top: rgba(255,255,255,0.20); shine: yes; }
        + inset shadows para profundidade
```

### KPI Card (S3)
```
ANTES:  bg-white/3 border-white/6 p-4 (muito básico)
DEPOIS: glass-card com gradiente temático
        icon: bg-{color}/12 rounded-xl (visibilidade)
        label: text-xs text-text-secondary (contraste WCAG)
        trend: delta badge com seta e cor
```

### Treinos Page (S4)
```
ANTES:  todos cards iguais com .glass-card rounded-2xl
DEPOIS: 
  - Treino do Dia:    glass-ultra com strip verde 3px left + ProgressRing maior
  - KPI Grid:         4 cards coloridos (passos=blue, agua=cyan, sono=purple, calorias=amber)
  - Nutrição:         gradiente amber com barra animada
  - Avaliação:        gradiente violet com CTA assessment
```

---

## 🔗 Integração com Codebase

**Branches:** Feature branches por sprint (ex: `feat/vfit-v4-s1-tokens`)  
**Commits:** Conventional Commits com ref ao plano (ex: `feat: S1 — secondary button 3D`)  
**Docs:** Atualizar `.claude/docs/CHANGELOG.md` após cada sprint  
**TRACKING:** Atualizar `TRACKING.md` em tempo real (via copilot durante implementação)

---

## 🚀 Como Começar a Implementação

### Opção 1: Usar Copilot Prompt (Recomendado)

```bash
# 1. Abrir Claude Code
# 2. Copiar todo o conteúdo de COPILOT-PROMPT.md
# 3. Colar no chat
# 4. Seguir as instruções
```

**Vantagens:** Guiado passo-a-passo, com verificações automáticas, zero chance de errar.

### Opção 2: Implementar Manual (Se preferir autonomia)

```bash
# 1. Ler IMPLEMENTATION-GUIDE.md
# 2. Seguir seção "Sprint 1 — Tokens CSS + Botão Secondary"
# 3. Fazer cada step manualmente
# 4. Rodar testes após cada step
```

### Opção 3: Rodar Um Sprint Por Vez

```bash
git checkout -b feat/vfit-ultra-v4-s1-tokens
# Implementar S1 (seguindo COPILOT-PROMPT.md para S1)
git commit -m "feat: S1 — ..."
# Esperar aprovação do usuário para merge
```

---

## 📞 Contato & Feedback

**Plano criado por:** Claude Code Assistant  
**Data:** 10/04/2026  
**Versão:** v1.0 (Ready to implement)

**Para executar:**
1. **Recomendado:** Usar `COPILOT-PROMPT.md` (copy-paste para Claude)
2. **Alternativa:** Ler `IMPLEMENTATION-GUIDE.md` e fazer manual
3. **Referência:** Consultar `PLAN.md`, `DESIGN-TOKENS.md`, `COMPONENT-SPECS.md` conforme necessário

**Branch Atual:** `feat/vfit-ultra-v4-plan` (documentação)
**Próxima Branch:** `feat/vfit-ultra-v4-s1-tokens` (implementação)

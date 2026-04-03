# 🚀 VFIT Ultra v2 — README

> **Plano estratégico massivo para transformação completa do VFIT B2C**
> 14 sprints · 4 fases · ~200 tasks

---

## 🔥 O Problema

O VFIT B2C (app do aluno standalone) está **visualmente incompleto e funcionalmente quebrado**:

### Bugs Críticos Encontrados
1. **Pagamento não funciona** — botão "Assinar" na página de assinatura não tem onClick handler
2. **Preços inconsistentes** — 4+ definições de preço divergentes entre config, paywall, assinatura, e hooks
3. **Plano IA não persiste** — salvo em sessionStorage, perdido ao fechar app
4. **Onboarding não gera assessment** — dados coletados mas jogados fora
5. **Nutrição hardcoded** — todos os alunos veem 2000kcal/150g proteína
6. **Push notifications ausentes** — OneSignalProvider não está no layout B2C
7. **Admin→Student mostra rotas erradas** — quick actions do dashboard apontam para /dashboard/* (B2B) em vez de /treinos, /avaliacoes (B2C)

### Problemas Visuais
1. **Fundo verde excessivo** — cards, backgrounds, tudo verde. Deveria ser navy blue profundo
2. **Sem header fixo** — app B2C não tem header top, apenas bottom nav
3. **Navbar básica demais** — student bottom nav é simplória vs personal (que tem FAB, drawer, SVGs custom)
4. **Emojis em vez de SVGs** — loading do onboarding usa emojis (🏋️, 🎯), deveria ser SVG premium
5. **Botões sem estilo DS** — muitos botões custom em vez do `<Button>` do Design System com 3D depth

---

## 📊 Diagnóstico Completo

### Preços Encontrados (Inconsistência)

| Local | Mensal | Anual |
|-------|:------:|:-----:|
| `config/constants.ts` (VFIT_PLANS) | R$ 19,90 | R$ 149,90/ano |
| `perfil/assinatura/page.tsx` | R$ 29,90 | R$ 238,80/ano |
| `paywall-plans.tsx` | R$ 14,90 | R$ 89,90/ano |
| **Decisão necessária** | **???** | **???** |

### Bridges Ausentes

```
Onboarding (17 steps)
  ├── weight_kg, height_cm, age ──────────× ──→ Self Assessment (não criado)
  ├── goal, activity_level ───────────────× ──→ Nutrition targets (hardcoded)
  ├── plan gerado pela IA ────────────────× ──→ DB persistence (sessionStorage)
  └── OneSignal permission ───────────────× ──→ Provider (ausente no layout)
```

### Arquitetura Atual vs Desejada

```
ATUAL:                              DESEJADO:
/(app) layout                       /(app) layout
  └── BottomNavigation              ├── FixedHeader (sticky top)
  └── {children}                    ├── OneSignalProvider
                                    ├── SubscriptionGate
                                    ├── BottomNavigation (premium)
                                    └── {children}
```

---

## 🏗️ Estrutura do Plano

```
.claude/plans/vfit-ultra-v2/
├── INDEX.md          ← Mapa de documentos e fases
├── README.md         ← Este arquivo (contexto e diagnóstico)
├── TRACKING.md       ← Status de cada task com checkboxes
│
├── 01-VISUAL-FOUNDATION.md    ← S0: Navy theme, DS tokens, bg fix
├── 02-NAVBAR-HEADER.md        ← S1: Header fixo, navbar premium, IA icon
├── 03-PRICING-UNIFICATION.md  ← S2: Single source of truth para preços
├── 04-ONBOARDING-PERFECT.md   ← S3: Flow completo, SVGs, persistence
├── 05-PAYMENT-B2C.md          ← S4: Checkout funcional, PIX, Asaas
├── 06-AUTO-ASSESSMENT-NUTRITION.md ← S5: Bridges automáticos
├── 07-AI-WORKOUT-PERSISTENCE.md   ← S6: Salvar no DB, ativar plano
├── 08-STUDENT-DASHBOARD.md    ← S7: Dashboard B2C completo
├── 09-ONESIGNAL-FOLLOWUPS.md  ← S8: Push, follow-ups, reminders
├── 10-ANIMATIONS-ICONS.md     ← S9: SVG premium, LazyMotion
├── 11-AUDIT-SECURITY-BACKEND.md   ← S10: SQL injection, auth, webhooks
├── 12-AUDIT-PERFORMANCE-BUNDLE.md ← S11: Bundle -350KB, lazy imports
├── 13-AUDIT-CLEANUP-DX.md    ← S12: Dead CSS, console.log, types
└── 14-POLISH-FINAL.md        ← S13: A11y, error boundaries, QA
```

---

## 🎯 Prioridade de Execução

### 🔴 Bloqueia Lançamento (S0–S6)
- Preços unificados e corretos
- Pagamento B2C funcional (PIX + cartão)
- Plano IA salvo no banco
- Auto-assessment do onboarding
- Visual navy + header + navbar

### 🟡 Experiência Premium (S7–S9)
- Dashboard B2C completo
- Push notifications integradas
- Animações e SVG icons

### 🟢 Excelência Técnica (S10–S13)
- Security audit fixes
- Bundle optimization
- Code cleanup
- QA final

---

## 📝 Convenções

- **Arquivo tocado** → Adicionar header comment com path e descrição
- **Componente UI** → Usar `<Button>`, `<DSIcon>`, tokens do DS v4
- **Preços** → SEMPRE de `config/constants.ts` VFIT_PLANS, nunca hardcode
- **Ícones** → SVG inline ou `<DSIcon>`, NUNCA emojis em UI funcional
- **Background** → Navy (`bg-primary` #050A12), NUNCA verde como fundo principal
- **Fundo de cards** → `bg-surface-1` / `bg-surface-2`, com borda glass
- **Botões CTA** → `<Button variant="primary">` com 3D depth, SEMPRE

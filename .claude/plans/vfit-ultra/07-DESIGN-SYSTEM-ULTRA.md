# 07 — Design System & Ultramodernização

> Auditoria atual: **6.2/10**. Base excelente (tokens, DSIcon, Button, dark mode), mas fragmentada. Meta: **≥ 9/10** — produto que "parece caro", coerente e moderno em cada pixel.

> Tudo aqui respeita RULES §12-16: Tailwind v4 canônico (`bg-linear-to-r`, `bg-white/6`, `bg-(--var)`), `<Button>` para CTAs, barrel exports, `DSIcon` para ícones.

---

## 1. Unificação (matar a fragmentação)

### 1.1 Sistema de Card: 5 → 1
- **Hoje:** `FormCard`, `MD3Card`, `GlassCard`, `Card`, `modern-notification` coexistem.
- **Ação:**
  - **Manter:** `Card` (base genérica, com variantes `default | glass | elevated`) e `GlassCard` **apenas** para overlays.
  - **Deprecar:** `MD3Card`, `FormCard` → migrar usos para `Card` com variante.
  - Codemod + busca por uso; migração tela a tela.
- **Ganho:** -15-20% CSS, manutenção trivial, consistência visual.

### 1.2 Variantes de Button: 13 → 6
- **Hoje:** primary, secondary, outline, ghost, ghost-danger, danger, warning, workout, assessment, payment, soft, gradient, glass.
- **Núcleo (manter):** `primary`, `secondary`, `outline`, `ghost`, `danger`, (+`ghost-danger`).
- **Contextuais (`workout`/`assessment`/`payment`)** → virar `primary` + ícone/cor de contexto, não variante própria.
- **Utilitárias** (`gradient`/`glass`/`soft`) → manter só se justificadas; documentar uso.
- ⚠️ Atenção: RULES §14 lista variantes oficiais — **atualizar RULES.md** junto com a mudança.

### 1.3 Tokens de cor: zero hardcode
- **10 cores `bg-[#...]`** furando tokens (splash, smart-app-banner, custom-select-3d, oauth-buttons, bottom-navigation).
- **Ação:** substituir por tokens (`bg-primary`, `bg-surface-1`, etc.) + **lint rule** que proíbe `bg-[#` em `src/`.

---

## 2. Tipografia & espaçamento
- **Hierarquia tipográfica documentada:** escala h1-h6 + body-sm/md/lg, pesos definidos (Syne display / DM Sans texto).
- **Reduzir `uppercase`** agressivo em headlines (parece genérico) — usar peso/escala.
- **Escala de espaçamento mobile padronizada:** `px-4 py-3` (mobile) → `sm:px-6 sm:py-4` → `lg:px-8 lg:py-5`. Aplicar a todos os containers de página.
- **Inputs:** `h-11` mobile (44px touch) → `sm:h-13`.
- **Safe-area** na bottom nav (notch devices).

---

## 3. Componentes que faltam (criar)
| Componente | Função |
|------------|--------|
| `PageTransition` | Entrada suave de página (fade + slide-up 300ms) |
| `FormProgressIndicator` | Indicador de passos para wizards (treino create, quiz) |
| `ErrorRecovery` | Estado de erro com retry (padrão único) |
| `LoadingOverlay` / skeletons faltantes | Feedback de operação assíncrona |
| Ilustrações de empty state | 8-12 SVGs para vazios contextuais (não só ícone) |

---

## 4. Micro-interações & motion (o "ultramoderno")
- **Botão:** press = scale + compressão de sombra (80ms) — já tem base 3D.
- **Modais:** entrada com spring (400ms ease-out-expo) + backdrop blur em transição.
- **Listas:** stagger sutil na entrada de itens.
- **Optimistic UI** em ações frequentes (marcar série, favoritar, completar treino) — já parcial no treino ativo, expandir.
- **Spinner premium:** gradiente da marca + estados (loading/erro/sucesso com checkmark).
- **Haptics** (mobile/TWA) em ações-chave — já presente no treino ativo, padronizar.

---

## 5. Os 4 estados como padrão de plataforma
Criar **convenção e helpers** para que toda tela tenha, sem exceção:
1. **Loading** → skeleton específico (proibir `loading && return null`).
2. **Vazio** → `EmptyStateDS` + ilustração + CTA.
3. **Erro** → `ErrorRecovery` + retry.
4. **Sucesso** → conteúdo + micro-interação de entrada.

Lint/PR checklist: nenhuma tela nova sem os 4 estados.

---

## 6. Acessibilidade (WCAG)
- `aria-label` em todos os `DSIcon` com significado.
- Testar focus trap de modais com leitor de tela (NVDA/VoiceOver).
- Auditar `alt` de imagens.
- Manter contrastes documentados (já AAA/AA).
- Navegação por teclado nos 10 fluxos principais.

---

## 7. Dark mode premium
- Adicionar tints de superfície (overlay sutil da cor de marca) — hoje "flat".
- Glass morphism menos opaco.
- Revisar todas as cores em dark após unificação de tokens.

---

## 8. Atualizar a fonte de verdade
- `.claude/docs/DESIGN-SYSTEM.md` reescrito com: tokens finais, hierarquia tipográfica, variantes de Button finais, sistema de Card único, catálogo de componentes novos, regra dos 4 estados.
- `/admin/design-system` (showcase) atualizado.
- `RULES.md` §14 atualizado (variantes de Button).
- Rodar `node scripts/sync-ai-docs.mjs` (RULES §20).

---

## 9. Critério de "perfeito" (design)
- ✅ 1 sistema de Card, 6 variantes de Button, **zero** cor hardcoded.
- ✅ Hierarquia tipográfica e espaçamento mobile consistentes em todas as telas.
- ✅ Micro-interações e motion em ações-chave; dark mode premium.
- ✅ 4 estados em 100% das telas (plataforma inteira).
- ✅ Acessibilidade auditada; docs e showcase atualizados.
- ✅ Nota interna **≥ 9/10**.

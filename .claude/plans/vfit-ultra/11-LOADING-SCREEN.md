# 11 — Nova Tela de Loading (leve + ultramoderna)

> Pedido explícito do usuário: nova tela de loading **perfeita**, usando o SVG da marca, **leve** e ultramoderna. ✅ **IMPLEMENTADO nesta sessão.**

---

## 1. O que foi entregue

### `src/components/ui/brand-loader.tsx` (NOVO)
Componente reutilizável `BrandLoader` para estados de loading em qualquer tela.
- **Ultraleve:** CSS-only. Sem partículas, sem `Math.random`, sem máquina de estados. DOM mínimo (~6 nós vs ~40 do splash antigo).
- **Variantes:** `page` (overlay full-screen escuro) e `inline` (transparente, para dentro de cards/seções).
- **Props:** `variant`, `size`, `label`, `className`.
- **Acessível:** `role="status"`, `aria-live`, `aria-busy`, texto `sr-only` "Carregando…".
- **Respeita `prefers-reduced-motion`** (desliga animações).
- Mark V desenha (stroke draw 0.7s) + halo pulsante suave + barra indeterminada.
- Exportado no barrel (`src/components/ui/index.ts`) — RULES §15.

### `src/components/ui/splash-screen.tsx` (REESCRITO — v4)
Abertura do app, agora **leve**:
- Removidas **30 partículas animadas** e **3 camadas de aurora** (custo de CPU/DOM).
- Removida **cor hardcoded de className** (`bg-[#050A12]` → background via inline style) — corrige achado da auditoria (RULES §12).
- **Mantida a máquina de estados e a API `isReady`** + a válvula de segurança que cobre a validação de `/auth/me` sem prender o usuário. Nenhum call-site muda.
- ~1.8s total (antes ~2.8s). Mark V desenha + halo + wordmark + barra.

### Verificação
- `npx tsc --noEmit` → **exit 0, 0 erros**.
- `eslint` nos arquivos → **0 problemas**.
- Grep RULES §12 (`bg-gradient-to-`, `bg-[#`) → limpo nos arquivos novos.

---

## 2. Como usar o `BrandLoader`

```tsx
import { BrandLoader } from '@/components/ui'

// Full-page (rota carregando)
if (isLoading) return <BrandLoader variant="page" label="Carregando seu treino" />

// Inline (dentro de um card/seção)
<BrandLoader variant="inline" size={40} />
```

Substitui os `loading && return null` (anti-padrão apontado na auditoria) e os spinners genéricos por uma identidade de marca consistente.

---

## 3. Próximos passos (opcional, no roadmap)
- [ ] L.1 Trocar `return null`/spinners genéricos por `BrandLoader` nas rotas de maior tráfego (treinos, dashboard, nutrição).
- [ ] L.2 Variante "skeleton + BrandLoader" para listas.
- [ ] L.3 Usar o mesmo mark/halo como ícone de "gerando com IA" (plano instantâneo, doc 02 B.4).

---

## 4. Por que está "perfeito"
- ✅ Leve (CSS-only, DOM mínimo, respeita reduced-motion).
- ✅ Ultramoderno (mark V desenhando + halo + barra, identidade da marca).
- ✅ Reutilizável e acessível.
- ✅ Sem hardcode, sem violar RULES, verificado (tsc + lint).
- ✅ Não quebra nada (mesma API do splash).

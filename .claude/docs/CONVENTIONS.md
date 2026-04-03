# Convenções de Código — VFIT

> Padrões obrigatórios de código, imports, TypeScript e CSS.

---

## Imports Padrão

### Backend (Workers)

```typescript
import { pgQuery, pgQueryOne, pgQueryCount, generateId } from '@lib/db'
import { d1Query, d1QueryOne } from '@lib/db'
import { AppError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, RateLimitError } from '@lib/errors'
import { success, error, paginated, created, noContent } from '@lib/response'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext, Bindings, Variables, JWTPayload } from '@workers/types'
import { createCustomer, createPayment, getBalance, createTransfer } from '@lib/asaas'
import { notify, notifyNewWorkout, notifyPaymentReceived, notifyPaymentOverdue, notifyNewStudent } from '@lib/onesignal'
import { PLANS, FEES, BADGES, RATE_LIMITS, CACHE_TTL } from '@config/constants'
```

### Frontend (Next.js)

```typescript
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
// Hooks: import { useWorkouts, useCreateWorkout } from '@/hooks/use-workouts'
```

---

## TypeScript

- **TypeScript strict**. Nunca `any` sem comentário justificando.
- **Imports**: alias `@/` para `src/`. Nunca paths relativos com `../../../`.
- **Comentários de seção**: `// ============================================` no topo de cada arquivo.
- Dual config: `tsconfig.json` (editor) vs `tsconfig.workers.json` (wrangler build).

---

## Componentes UI

- **Design System**: componentes base SEMPRE de `src/components/ui/`.
- **Ícones**: SEMPRE `<DSIcon name="..." />`. Nunca importar lucide/heroicons direto.
- **AuthGuard**: toda page de dashboard usa `<AuthGuard requiredType="personal|student">`.
- **Dados**: NUNCA fetch direto — sempre via hooks em `src/hooks/`.
- **Barrel exports**: ao criar componente em `ui/`, adicionar ao `src/components/ui/index.ts`.

---

## CSS / Tailwind v4

### Sintaxe Canônica (OBRIGATÓRIA desde v4)

```
❌ bg-gradient-to-r    → ✅ bg-linear-to-r
❌ bg-white/[0.06]     → ✅ bg-white/6
❌ bg-[var(--custom)]  → ✅ bg-(--custom)
❌ flex-shrink-0       → ✅ shrink-0
❌ flex-grow           → ✅ grow
❌ h-[600px]           → ✅ h-150 (quando divisível por 4)
❌ z-[9999]            → ✅ z-9999
❌ bg-[length:200%]    → ✅ bg-size-[200%_100%]
```

### Cores

- CSS vars `--ds-*` e classes semânticas (`brand-primary`, `text-primary`, `text-muted`)
- **Nunca** hardcode hex no JSX
- Usar aliases do tema em vez de brackets

### Grep de Validação

```bash
grep -rn "bg-gradient-to-" src/              # deve retornar zero
grep -rn "\-\[var(--" src/components/ui/      # deve retornar zero
grep -rn "className.*bg-brand-primary.*font-semibold" src/ | grep "<button"  # deve retornar zero para CTAs
```

---

## React Query — Auth Guard

```typescript
// SEMPRE em todo useQuery:
const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
return useQuery({
  queryKey: ['x'],
  queryFn: ...,
  enabled: isReady,  // ← OBRIGATÓRIO
})
// Com ID: enabled: isReady && !!id
// Com polling: refetchInterval: isReady ? 60_000 : false
```

---

## Neon Driver

```typescript
// ❌ await sql(query, params)
// ✅ await sql.query(query, params)
```

---

## Regras do Agente

1. Leia o arquivo relevante ANTES de propor mudanças.
2. Se a task envolve workers, leia o endpoint existente primeiro.
3. Para mudanças no Design System, leia `.claude/docs/DESIGN-SYSTEM.md` primeiro.
4. Planeje antes de modificar >3 arquivos simultâneos.
5. Use `multi_replace_string_in_file` para edições em batch.
6. `grep_search` com regex antes de `semantic_search`.
7. Paralelizar tools independentes na mesma chamada.
8. **Documentar SEMPRE** — toda mudança reflete em `.claude/docs/` e TRACKING.md.
9. **Tracking em tempo real** — marcar task in-progress ANTES, done DEPOIS. Nunca deixar desatualizado.
10. Ao final de sessão: CHANGELOG + TRACKING + docs relevantes DEVEM estar atualizados.

---

## Economia de Tokens

**❌ NUNCA:**
- Re-ler arquivos já lidos na conversa — o contexto persiste
- Re-explorar o projeto — `.claude/docs/` tem tudo documentado
- `semantic_search` amplo — use `grep_search` com regex preciso
- Ler arquivo inteiro — use `startLine` / `endLine`
- Edições sequenciais uma a uma — agrupe com `multi_replace_string_in_file`

**✅ SEMPRE:**
- Reutilizar contexto da conversa antes de qualquer tool call
- Confirmar escopo exato antes de abrir múltiplos arquivos
- Referenciar `.claude/docs/` sem re-ler

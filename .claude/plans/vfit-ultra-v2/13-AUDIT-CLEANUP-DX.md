# Sprint 12 — Audit: Cleanup & DX

> **Fase:** 3 · **Prioridade:** 🟢 MÉDIA · **Estimativa:** 4-6h
> **Objetivo:** Código limpo, zero console.log, tipagem forte, imports organizados

---

## 🎯 Problemas (da auditoria)

1. **console.log proliferation** — logs de debug em produção
2. **`as any` casting** — bypasses de tipo não justificados
3. **Duplicate components** — componentes com funcionalidade duplicada
4. **Unused imports** — imports mortos em vários arquivos
5. **God files** — payments.ts (2900L), assessments.ts (2291L), admin.ts (2231L)
6. **22% mutations sem onError** — erros silenciosos

---

## 📋 Tasks

### T12.1 — Remover console.log de produção
**Encontrar todos:**
```bash
grep -rn "console\.log\|console\.warn\|console\.info" src/ --include="*.tsx" --include="*.ts" | wc -l
grep -rn "console\.log\|console\.warn\|console\.info" workers/ --include="*.ts" | wc -l
```

**Regras:**
- `console.error` → MANTER (erros reais)
- `console.log` → REMOVER ou converter para `console.error` se for erro real
- `console.warn` → Avaliar caso a caso
- `console.info` → REMOVER (é debug)

**Frontend:** Adicionar ESLint rule:
```json
// eslint.config.mjs
"no-console": ["warn", { "allow": ["error", "warn"] }]
```

### T12.2 — Eliminar `as any`
**Encontrar todos:**
```bash
grep -rn "as any" src/ --include="*.tsx" --include="*.ts" | wc -l
grep -rn "as any" workers/ --include="*.ts" | wc -l
```

**Para cada `as any`:**
1. Se o tipo correto é óbvio → substituir pelo tipo real
2. Se é uma limitação de lib → adicionar comentário `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason`
3. Se é preguiça → tipar corretamente

### T12.3 — Identificar e remover componentes duplicados
**Suspeitos (da auditoria):**
- Modal components com funcionalidade similar
- Card components com layout similar
- Form fields duplicados entre B2B e B2C
- Status badges com implementação diferente

**Método:**
```bash
# Componentes com nomes similares
find src/components -name "*.tsx" | xargs -I{} basename {} .tsx | sort | uniq -d
```

### T12.4 — Unused imports cleanup
**Usar Pylance refactoring:**

Para cada arquivo `.tsx`/`.ts`:
```
source.unusedImports
```

**Ou batch via ESLint:**
```bash
npx eslint src/ --rule '{"@typescript-eslint/no-unused-vars": "error"}' --fix
```

### T12.5 — onError em todas mutations
**Encontrar mutations sem onError:**
```bash
grep -B5 "useMutation" src/hooks/ --include="*.ts" | grep -A20 "mutationFn" | grep -L "onError"
```

**Padrão obrigatório:**
```typescript
return useMutation({
  mutationFn: async (data) => { /* ... */ },
  onSuccess: () => {
    toast.success('Operação realizada!')
    queryClient.invalidateQueries({ queryKey: ['...'] })
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Erro ao realizar operação')
  },
})
```

### T12.6 — Plan de refactoring para god files
**NÃO refatorar agora** — apenas documentar o plano:

| Arquivo | Linhas | Proposta |
|---------|:------:|----------|
| `payments.ts` | 2900 | Split: `payments-personal.ts`, `payments-webhooks.ts`, `payments-admin.ts` |
| `assessments.ts` | 2291 | Split: `assessments-crud.ts`, `assessments-analysis.ts`, `assessments-pdf.ts` |
| `admin.ts` | 2231 | Split: `admin-users.ts`, `admin-payments.ts`, `admin-reports.ts` |

**Criar:** `.claude/plans/vfit-ultra-v2/TECH-DEBT.md` com plano de refactoring futuro.

### T12.7 — React.memo para componentes pesados
**Candidatos (da auditoria — 0 React.memo encontrados):**

```typescript
// Componentes que re-renderizam frequentemente sem mudança:
// 1. Cards em listas longas
// 2. Header/Footer fixos
// 3. Sidebar items
// 4. Bottom navigation

// Exemplo:
export const WorkoutCard = React.memo(function WorkoutCard({ workout }: Props) {
  // ...
})
```

**Identificar com React DevTools Profiler** quais componentes re-renderizam excessivamente.

### T12.8 — State explosion (17-22 useState)
**Componentes com estado excessivo:**

**Solução:** Consolidar em `useReducer` ou objeto de estado:

```typescript
// ❌ 17 useStates
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [phone, setPhone] = useState('')
// ... mais 14

// ✅ useReducer ou objeto
const [form, setForm] = useState<FormState>({
  name: '', email: '', phone: '', /* ... */
})
const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
  setForm(prev => ({ ...prev, [key]: value }))
}
```

---

## ✅ Critérios de Aceite

- [ ] Zero console.log em src/ (apenas console.error)
- [ ] `as any` eliminados ou justificados com comentário
- [ ] Componentes duplicados consolidados
- [ ] Unused imports removidos
- [ ] 100% das mutations têm onError
- [ ] God files documentados para refactoring futuro
- [ ] ESLint no-console rule ativado
- [ ] State explosion reduzido (máx 6-8 useState por componente)

---

## 📁 Arquivos Impactados

```
src/**/*.tsx — console.log removal, unused imports
src/**/*.ts — as any elimination
workers/**/*.ts — console.log cleanup
src/hooks/*.ts — onError em mutations
eslint.config.mjs — no-console rule
.claude/plans/vfit-ultra-v2/TECH-DEBT.md (NOVO) — plano de refactoring
```

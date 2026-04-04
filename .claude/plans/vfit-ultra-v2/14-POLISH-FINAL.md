# Sprint 13 — Polish Final & Deploy v2.0.0

> **Fase:** 4 · **Prioridade:** 🟡 ALTA · **Estimativa:** 6-8h
> **Objetivo:** QA completo, a11y fixes, error boundaries, skeletons, deploy final

---

## 🎯 Objetivo

Polir TUDO que foi construído nos sprints 0-12, garantir que o app B2C
funciona end-to-end perfeitamente, e deploy como v2.0.0.

---

## 📋 Tasks

### T13.1 — Accessibility fixes (a11y)
**Problemas da auditoria:**

| Problema | Quantidade | Fix |
|----------|:----------:|-----|
| Back buttons sem `aria-label` | 11 | Adicionar `aria-label="Voltar"` |
| Touch targets <44px | vários | Mínimo `min-h-11 min-w-11` (44×44px) |
| Focus states ausentes | vários | `focus-visible:ring-2 focus-visible:ring-brand-primary/50` |
| Color-only indicators | vários | Adicionar ícone + cor para status |

**Grep + fix:**
```bash
# Botões de voltar sem aria-label
grep -rn "onClick.*back\|onClick.*goBack\|onClick.*router.back" src/ --include="*.tsx" | grep -v "aria-label"
```

### T13.2 — Error Boundaries
**Criar:** `src/components/ui/error-boundary.tsx`

```tsx
'use client'
import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <DSIcon name="alert-triangle" size={48} className="text-error mb-4" />
          <h2 className="text-lg font-semibold text-primary mb-2">
            Algo deu errado
          </h2>
          <p className="text-secondary mb-4">
            Não se preocupe, tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
```

**Aplicar em:**
- Layout root do (app)
- Layout root do dashboard
- Cada page que faz data fetching

### T13.3 — Skeleton components
**Criar:** `src/components/ui/skeleton.tsx`

```tsx
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-lg bg-surface-2",
        className
      )}
      {...props}
    />
  )
}

// Specific skeletons
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-1 border border-white/8 p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" /> {/* greeting */}
      <CardSkeleton /> {/* today workout */}
      <CardSkeleton /> {/* follow-ups */}
      <CardSkeleton /> {/* nutrition */}
    </div>
  )
}

export function PlanSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-64" />
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl bg-surface-1 border border-white/8 p-4 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  )
}
```

**Aplicar em TODAS as pages B2C** que fazem data fetching:
- `/treinos` → `DashboardSkeleton`
- `/plano` → `PlanSkeleton`
- `/nutricao` → `NutritionSkeleton`
- `/avaliacoes` → `AssessmentSkeleton`
- `/perfil` → `ProfileSkeleton`

### T13.4 — Empty states
**Cada page precisa de empty state quando não há dados:**

```tsx
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: DSIconName
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
        <DSIcon name={icon} size={32} className="text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
      <p className="text-secondary text-sm mb-6 max-w-xs">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

### T13.5 — QA Checklist end-to-end

**Flow completo B2C — testar cada passo:**

```
1. [ ] Registro de aluno B2C
2. [ ] Onboarding 17 steps (todos renderizam)
3. [ ] Loading screen com SVGs
4. [ ] AI gera plano de treino
5. [ ] Plano salvo no DB
6. [ ] Paywall com preços corretos
7. [ ] "Continuar grátis" → /treinos com plano
8. [ ] Dashboard mostra treino do dia
9. [ ] Follow-up cards aparecem
10. [ ] Nutrição mostra targets personalizados
11. [ ] Avaliações mostra auto-assessment
12. [ ] IA chat funciona
13. [ ] Perfil mostra dados do aluno
14. [ ] Subscription page com PIX funcional
15. [ ] Pagamento PIX → plano ativado
16. [ ] Push notification recebida
17. [ ] Bottom nav funciona em todas tabs
18. [ ] Header com título dinâmico
19. [ ] Dark mode consistente em todas telas
20. [ ] PWA installable
```

### T13.6 — Performance audit
**Lighthouse CI local:**

```bash
npx lighthouse https://vfit.app.br --output=json --output=html \
  --chrome-flags="--headless" \
  --preset=desktop
```

**Targets:**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

### T13.7 — Smoke auth test
```bash
npm run smoke:auth:local
```

**Garantir que TODOS os endpoints protegidos retornam 401 sem token e 200 com token.**

### T13.8 — Documentação atualizada
**Atualizar:**
- `.claude/docs/CHANGELOG.md` — Entry para v2.0.0
- `.claude/docs/BACKEND.md` — Novos endpoints VFIT
- `.claude/docs/STACK.md` — Novas tabelas, bindings

### T13.9 — Deploy v2.0.0
```bash
# 1. Backup
npm run cf:backup

# 2. Wrangler atualizado
npm install -g wrangler@latest && wrangler --version

# 3. WhatsApp: start
node scripts/whatsapp-task.mjs start \
  --task-id "DEPLOY-v2.0.0" \
  --title "Deploy v2.0.0 — App B2C Completo" \
  --priority "ALTA" \
  --actor "Developer Agent" \
  --why "App B2C premium com pagamentos, IA, nutrição, push" \
  --expected "Alunos B2C com experiência completa end-to-end"

# 4. Deploy
npm run cf:deploy:major

# 5. WhatsApp: end
node scripts/whatsapp-task.mjs end \
  --task-id "DEPLOY-v2.0.0" \
  --title "Deploy v2.0.0 — App B2C Completo" \
  --status "success" \
  --actor "Developer Agent" \
  --deploy "v2.0.0" \
  --result "App B2C completo: pagamentos PIX, IA, nutrição, push" \
  --reason "Transformação B2C de stub para produção" \
  --benefit "Alunos podem assinar, treinar, e acompanhar progresso"
```

---

## ✅ Critérios de Aceite FINAIS

- [ ] a11y: Todos os botões com aria-label
- [ ] a11y: Touch targets ≥44px
- [ ] Error boundaries em todos os layouts
- [ ] Skeletons em todas as pages com data fetching
- [ ] Empty states em todas as pages
- [ ] QA checklist 20/20 ✅
- [ ] Lighthouse Performance >90
- [ ] Smoke auth passing
- [ ] Documentação atualizada
- [ ] Deploy v2.0.0 com sucesso
- [ ] WhatsApp notification enviada

---

## 📁 Arquivos Impactados

```
src/components/ui/error-boundary.tsx (NOVO)
src/components/ui/skeleton.tsx (atualizar/expandir)
src/components/ui/empty-state.tsx (NOVO)
src/app/(app)/*/page.tsx — skeletons + empty states
~11 botões — aria-label
.claude/docs/CHANGELOG.md
.claude/docs/BACKEND.md
.claude/docs/STACK.md
```

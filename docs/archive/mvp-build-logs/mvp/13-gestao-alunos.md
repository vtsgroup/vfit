# LOTE 13 — Gestão de Alunos (Frontend)

**Commit:** `c38f106`
**Data:** Junho 2025

## Escopo

Páginas frontend de gestão de alunos para o dashboard do personal trainer:
- Listagem com busca, filtros e paginação
- Detalhe do aluno com perfil, stats e ações administrativas
- Convite de aluno por email com link copiável

## Arquivos Criados

### Páginas

| Arquivo | Descrição |
|---------|-----------|
| `src/app/dashboard/students/page.tsx` | Lista de alunos com busca, filtros (status/pagamento), paginação |
| `src/app/dashboard/students/invite/page.tsx` | Formulário de convite (nome + email) com resultado exibindo token/link |
| `src/app/dashboard/students/view/page.tsx` | Detalhe do aluno — rota estática com `?id=` query param |

### Componentes

| Arquivo | Descrição |
|---------|-----------|
| `src/components/students/student-detail.tsx` | Componente de detalhe: cabeçalho com avatar/status, menu de ações (ativar/desativar/bloquear/remover), grid de stats, cards de informações pessoais e pagamentos |

### Hooks

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/use-students.ts` | Hooks TanStack Query: `useStudents(params)`, `useStudent(id)`, `useInviteStudent`, `useUpdateStudent(id)`, `useUpdateStudentStatus(id)`, `useDeleteStudent(id)` |

## Arquivos Modificados

Correções de classes Tailwind v4 (arbitrary values → scale values):

| Arquivo | Alteração |
|---------|-----------|
| Auth pages (7 arquivos) | `animate-[fade-in_0.3s_ease-out]` → `animate-fade-in`, `top-[34px]` → `top-8.5` |
| `src/app/(auth)/layout.tsx` | `h-[600px]`/`w-[600px]` → `h-150`/`w-150`, `max-w-[440px]` → `max-w-110` |
| `src/components/layout/sidebar.tsx` | `w-[72px]` → `w-18`, `w-[260px]` → `w-65` |
| `src/components/layout/header.tsx` | `lg:left-[72px]` → `lg:left-18`, `lg:left-[260px]` → `lg:left-65` |
| `src/components/layout/dashboard-layout.tsx` | `lg:pl-[72px]` → `lg:pl-18`, `lg:pl-[260px]` → `lg:pl-65` |
| `src/components/layout/mobile-nav.tsx` | `w-[280px]` → `w-70` |
| `src/components/layout/toast-container.tsx` | `z-[60]` → `z-60`, `w-[340px]` → `w-85` |
| `src/components/dashboard/revenue-chart.tsx` | `max-w-[40px]` → `max-w-10` |

## Decisão Arquitetural: Rotas Estáticas com Query Params

### Problema
Next.js 15.5.12 com `output: "export"` exige que `generateStaticParams()` retorne **pelo menos 1 rota** para dynamic segments `[id]`. A verificação está em `node_modules/next/dist/build/index.js:1245`:

```javascript
const hasGenerateStaticParams = workerResult.prerenderedRoutes
  && workerResult.prerenderedRoutes.length > 0;
if (config.output === 'export' && isDynamic && !hasGenerateStaticParams) {
  throw new Error(`Page "${page}" is missing "generateStaticParams()"...`)
}
```

Para IDs de API (alunos, treinos, avaliações etc.) que não existem em build time, retornar `[]` causa falha no build.

### Solução Adotada
- **Substituir** `/dashboard/students/[id]` → `/dashboard/students/view?id=xxx`
- **Padrão:** rota estática + `useSearchParams()` + `<Suspense>`
- **Aplicar em TODOS os lotes futuros** com rotas de detalhe

### Estrutura da Rota View
```tsx
// view/page.tsx
'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function Content() {
  const id = useSearchParams().get('id') ?? ''
  if (!id) return <Fallback />
  return <DetailComponent id={id} />
}

export default function Page() {
  return <Suspense fallback={<Loading />}><Content /></Suspense>
}
```

## Funcionalidades

### Lista de Alunos (`/dashboard/students`)
- Busca por nome/email com debounce (400ms)
- Filtros: status (ativo/inativo/pendente/bloqueado) e pagamento (pago/pendente/atrasado/free)
- Card com avatar, badges de status, stats (treinos/streak/badges), data relativa
- Paginação com 20 por página
- EmptyState com CTA para convidar aluno
- AuthGuard `requiredType="personal"`

### Detalhe do Aluno (`/dashboard/students/view?id=xxx`)
- Cabeçalho: avatar (foto ou iniciais), nome, status badge, email, telefone
- Menu de ações: ativar, desativar, bloquear, remover (com confirmação)
- Grid de stats: treinos completados, streak atual, badges, tempo como aluno
- Card Informações: nível fitness, objetivos, restrições médicas, gênero, nascimento, altura, frequência
- Card Pagamentos: mensalidade, último/próximo pagamento, convite, aceite, maior streak

### Convite de Aluno (`/dashboard/students/invite`)
- Formulário: nome + email do aluno
- Sucesso: exibe token + link copiável para registro
- Info box explicando o fluxo de convite
- Botões: convidar outro ou ver lista de alunos

## Build
```
✓ Compiled successfully
✓ Generating static pages (16/16)
✓ Exporting (2/2)
Route: /dashboard/students ○ (static)
Route: /dashboard/students/invite ○ (static)
Route: /dashboard/students/view ○ (static)
```

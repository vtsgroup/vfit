---
name: nextjs-react-padrao
description: Padrões para projetos Next.js + React + TypeScript
globs: "**/*.{ts,tsx}"
---

- Preferir Server Components por padrão; usar `"use client"` apenas quando necessário (eventos, hooks, estado)
- Em Server Components, usar `async/await` diretamente — sem `useEffect` para data fetching
- Estilização com Tailwind CSS; componentes de UI via shadcn/ui
- Validação de schemas com Zod — nunca validação manual de objetos
- Formulários com React Hook Form + `zodResolver`
- Data fetching no cliente com TanStack Query (`useQuery`, `useMutation`)
- Proibido usar axios em arquivos novos — usar `fetch` nativo ou `ky`
- Tipos explícitos em props e retornos de função; evitar `any`
- Nomes de arquivos de componentes em PascalCase; utilitários em camelCase

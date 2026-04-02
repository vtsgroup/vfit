---
name: review-pr
description: Code review do branch atual vs main. Foca em bugs, segurança e problemas de runtime. Uso: /review-pr [branch]
allowed-tools: Bash, Read, Grep, Glob
model: claude-sonnet-4-6
---

# Review PR Skill — IA + PERSONAL

Argumento: $ARGUMENTS (nome do branch, ou vazio para branch atual vs main)

## Processo

1. Determine o diff:
   - Se $ARGUMENTS fornecido: `git diff main..$ARGUMENTS`
   - Senão: `git diff main..HEAD`
   - Também: `git log main..HEAD --oneline` para ver commits incluídos

2. Leia os arquivos alterados relevantes com Read para contexto.

3. Analise em **quatro dimensões**, reportando apenas issues reais:

   ### 🔴 Bugs (Critical)
   - Lógica incorreta ou invertida
   - Null/undefined não tratados
   - Race conditions em async/await
   - Valores hardcoded que deveriam ser dinâmicos
   - Edge cases em cálculos (divisão por zero, overflow)

   ### 🔴 Segurança (Critical)
   - Dados sensíveis em logs ou responses
   - Autorização ausente em endpoints do Worker
   - Injeção SQL (queries com string interpolation sem sanitização)
   - CORS mal configurado
   - Tokens ou secrets expostos
   - Falta de rate limiting em endpoints críticos

   ### 🟡 Problemas de Runtime (Warning)
   - Queries N+1 (loop com query dentro)
   - Re-renders desnecessários em React (dependências incorretas em useMemo/useEffect)
   - Memory leaks (event listeners sem cleanup)
   - Requests sem timeout/abort controller

   ### 🔵 Qualidade (Info — não bloqueia)
   - Lógica duplicada que poderia ser extraída
   - Tipos TypeScript imprecisos (uso de `any`)
   - Componente muito grande (>300 linhas) que poderia ser dividido

4. Para cada issue, reporte:
   ```
   [SEVERIDADE] arquivo.ts:linha-aproximada
   Problema: descrição concisa
   Sugestão: como corrigir
   ```

5. Ao final: resumo com contagem de issues por severidade.

## O que NÃO reportar
- Formatação (Prettier resolve automaticamente)
- Naming trivial (a não ser que seja confuso)
- Preferências pessoais de estilo
- Coisas que já existiam antes do PR (foque apenas no diff)

## Contexto do projeto
- Workers (Hono) precisam de `requireAuth` em TODA rota protegida
- `AuthGuard` é obrigatório em TODA page de dashboard
- Ícones: sempre `DSIcon`, nunca lucide diretamente
- CSS: sempre classes semânticas `text-text-primary`, nunca `text-gray-900`

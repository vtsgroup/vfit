# LOTE 11 — Auth Pages (Frontend)

## Commit: `319e94e`

## Resumo
Páginas de autenticação completas: login, registro (personal + aluno), recuperação/reset de senha e verificação de email.

## Arquivos Criados (13 arquivos, 1538 linhas)

### Hooks
- **src/hooks/use-auth.ts** — 8 mutations TanStack Query:
  - `useLogin`: POST /auth/login → armazena tokens → redirect /dashboard
  - `useRegisterPersonal`: POST /auth/register/personal → redirect /login?registered=true
  - `useRegisterStudent`: POST /auth/register/student → redirect /login?registered=true
  - `useForgotPassword`: POST /auth/forgot-password → toast de sucesso
  - `useResetPassword`: POST /auth/reset-password → redirect /login?reset=true
  - `useVerifyEmail`: POST /auth/verify-email → toast de sucesso
  - `useLogout`: POST /auth/logout → limpa store → redirect /login
  - `useOAuthRedirect`: POST /oauth/{provider}/redirect → redirect externo

### Componentes Auth
- **src/components/auth/auth-guard.tsx** — AuthGuard (redireciona para /login se não autenticado, aceita `requiredType`) + GuestGuard (redireciona para /dashboard se autenticado)
- **src/components/auth/oauth-buttons.tsx** — Botões Google e Facebook com SVGs inline + AuthDivider ("ou")
- **src/components/auth/turnstile.tsx** — Widget Cloudflare Turnstile (lazy script, render on mount, cleanup)
- **src/components/auth/index.ts** — Barrel export

### Layout Auth
- **src/app/(auth)/layout.tsx** — Layout dedicado com fundo gradiente (brand-primary/5 + brand-accent/5 blurs), header com logo, card centralizado (max-w-[440px]), footer

### Páginas
- **src/app/(auth)/login/page.tsx** — Login completo: email, senha (show/hide), "Esqueceu a senha?", Turnstile, OAuth, submit. Lê searchParams para alertas: registered, reset, verified
- **src/app/(auth)/register/page.tsx** — Tela de escolha: Personal Trainer (Dumbbell) ou Aluno (GraduationCap)
- **src/app/(auth)/register/personal/page.tsx** — Formulário 2 etapas:
  - Etapa 1: nome, email, CPF (máscara 000.000.000-00), telefone, senha (show/hide), confirmar senha
  - Etapa 2: CREF (máscara), UF do CREF (select 27 estados), código referência, Turnstile, submit
- **src/app/(auth)/register/student/page.tsx** — Registro por convite: nome, email, CPF (máscara), telefone, senha, confirmar senha, invitation_token (via URL ou input manual), Turnstile
- **src/app/(auth)/forgot-password/page.tsx** — Email + Turnstile, exibe mensagem de sucesso após envio
- **src/app/(auth)/reset-password/page.tsx** — Token via URL, nova senha + confirmação, tela de erro para token inválido
- **src/app/(auth)/verify-email/page.tsx** — Auto-verifica no mount, 4 estados (loading, success, error, no-token) com ícones

## Padrões
- Todas as páginas usam `GuestGuard` (redireciona autenticado para /dashboard)
- Máscara de CPF: remove não-dígitos, formata 000.000.000-00
- Validação client-side antes de habilitar submit
- Turnstile integrado em todos os formulários que exigem
- Animação fade-in em todas as páginas auth
- Design dark-first consistente com o sistema de design

## Build
- Type-check: 0 erros
- Build: 13 páginas estáticas exportadas com sucesso

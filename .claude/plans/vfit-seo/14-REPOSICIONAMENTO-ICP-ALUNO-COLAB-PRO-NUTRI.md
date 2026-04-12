# 14 — Reposicionamento ICP: Aluno-first + Colaboração Personal/Nutri

> Data: 12/04/2026
> Status: em execução (fase 1 e fase 2 entregues + fase 3 parcial)

## Objetivo

Reposicionar a home para foco em aluno e consolidar páginas ICP de profissionais com narrativa de trabalho conjunto (treino + dieta), incluindo monetização por afiliados.

## Princípios

1. Home (`/`) vende resultado para aluno.
2. Comercial B2B (planos de personal) fica fora da home.
3. Personal e nutricionista trabalham no mesmo contexto do aluno.
4. SEO separado por intenção: aluno vs profissional.

## Plano de execução

### Fase 1 — Mensagem e oferta (entregue)
- Home sem bloco de preço profissional.
- Hero e FAQ da home reescritos para aluno-first.
- JSON-LD FAQ da home alinhado ao novo posicionamento.

### Fase 2 — ICP de profissionais (entregue)
- `/app-personal-trainer` com:
  - painel colaborativo com nutrição,
  - chat entre profissionais,
  - monetização por afiliados.
- `/nutricionistas` com:
  - área de nutrição + leitura de contexto de treino,
  - colaboração ativa com personal,
  - afiliados para indicações qualificadas.

### Fase 3 — SEO e CRO (parcial entregue)
- ✅ Adicionar links internos de blog → ICP pages.
- ✅ Criar camada de roteamento por perfil no hub do blog e artigos pilares.
- ✅ Criar acessos diretos por ICP (entrar, cadastrar, termos/condições) na home e páginas profissionais.
- ⏳ Revisar titles/descriptions de todo cluster legado de blog.
- ⏳ Medir CTR por segmento (`home`, `personal`, `nutricionistas`) no GA4.

## Critérios de aceite

- Usuário entende em até 5s que a home é para aluno.
- Nenhum preço de plano profissional aparece na home.
- Páginas de personal e nutrição deixam explícito o trabalho conjunto no mesmo painel.
- Conversão por segmento registrada separadamente no tracking de eventos.

## Evidências de implementação

- `src/app/page.tsx`
- `src/components/landing/hero.tsx`
- `src/components/landing/faq-section.tsx`
- `src/components/seo/json-ld.tsx`
- `src/app/(public)/app-personal-trainer/page.tsx`
- `src/app/(public)/nutricionistas/page.tsx`
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/blog/app-treino-ia-gratis-iniciantes/page.tsx`
- `src/app/(public)/blog/ia-montar-treinos-personalizados-personal/page.tsx`
- `src/app/(public)/blog/melhores-apps-personal-trainer-2026/page.tsx`
- `src/app/(public)/blog/nutricionista-personal-trainer-trabalho-conjunto/page.tsx`
- `src/app/page.tsx`
- `src/app/(public)/app-personal-trainer/page.tsx`
- `src/app/(public)/nutricionistas/page.tsx`

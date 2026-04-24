# MASTER PLAN - Mobile QA Completo + Lancamento Maximo

Data: 2026-04-24
Escopo: app inteiro (mobile-first), QA exaustivo, padronizacao visual de heroes/headers, robustez de dados de nutricao e exercicios, readiness de lancamento.

## 1) Objetivo

Elevar o app para um padrao de lancamento premium com:
- QA real de ponta a ponta no mobile (funcional, visual, acessibilidade, performance)
- Correcoes de UX e consistencia visual em todos os heroes do dashboard
- Base de dados forte para Nutricao (alimentos) e Exercicios (grupos/subgrupos)
- Gate de release estrito com criterios objetivos de go/no-go

## 2) Contexto Tecnico Ja Mapeado

Arquivos chave identificados:
- Header padrao DS dashboard: src/components/layout/header.tsx
- Header student mobile: src/components/navigation/student-header.tsx
- Componente base de header de pagina: src/components/ui/page-header.tsx
- Avaliacoes dashboard (B2B): src/app/dashboard/assessments/page.tsx
- Avaliacoes app student (B2C): src/app/(app)/avaliacoes/page.tsx
- Nutricao app student (B2C): src/app/(app)/nutricao/page.tsx
- Avaliacoes nutricionais dashboard: src/app/dashboard/nutrition-assessments/page.tsx
- Estilos globais de header: src/app/globals.css

## 3) Padronizacao Hero/Header (decisoes)

Objetivo de design:
- Um padrao unico de HeroMobileDashboard para contexto mobile
- Botao voltar obrigatorio em telas de detalhe/subfluxo
- CTA primario consistente no lado direito (copy orientada a acao)
- Sem borda inferior no header de Avaliacoes Fisicas (como solicitado)
- Nutricao no mesmo estilo visual de Avaliacoes

Regras de produto:
- Botao voltar em todos os heroes de dashboard onde ha hierarquia de navegacao
- CTA padrao para adicao:
  - + Adicionar (generico)
  - + Adicionar Alimento (nutricao)
  - + Nova Avaliacao (avaliacoes)
- Componente Button obrigatorio para CTAs

## 3.1) Light Theme Modernization (frente dedicada)

Objetivo:
- Fazer o tema claro parecer produto premium, nao apenas versao invertida do dark.

Pilares de execucao:
- Superficies: hierarquia clara entre pagina, card, glass e elevated.
- Botoes: contraste, depth e estados consistentes em todas as variantes.
- Header: leitura imediata, acao clara, sem ruindo visual no scroll.
- Inputs e forms: foco visivel, placeholder legivel, borda consistente.
- Tokens DS: reduzir ambiguidade de cores e remover conflitos de override.

Criterio de aceite:
- Nenhuma tela critica com contraste abaixo de AA para texto funcional.
- Header e action buttons aprovados em light/dark com regressao visual.
- Botoes primarios/secondary/outline com comportamento previsivel no mobile.

## 4) QA Completo Mobile - Estrategia de Teste

### Milestone: Documentação pública R2 publicada (24/04/2026)
Todos os detalhes de buckets, bindings, domínios, CORS, cache, PWA e próximos passos estão documentados em R2-SETUP.md, MEDIA-STRATEGY.md e STACK.md. Status: ✅

### 4.1 Cobertura funcional (100%)

- Auth e sessao: login, refresh, expiracao, logout
- Navegacao: tabs, back stack, deep links
- Fluxos principais:
  - Treinos
  - Nutricao
  - Avaliacoes
  - Perfil e Plano
- Estados de erro: API lenta, indisponivel, fallback e retry
- Estados de UI: loading, empty, success, error

### 4.2 Cobertura visual

- Snapshot de heroes/headers em rotas criticas
- Validacao de safe area (iOS/Android)
- Validacao de contraste e legibilidade
- Validacao de consistencia de spacing e tipografia

### 4.3 Cobertura de acessibilidade

- Rotulos e nomes acessiveis
- Foco/ordem de navegacao
- Touch target e feedback de interacao
- Mensagens de erro compreensiveis

### 4.4 Cobertura de performance

- CWV mobile nas rotas principais
- LCP/CLS/TBT em baseline e pos-ajuste
- Priorizacao por impacto real

## 5) Dados e Conteudo em Escala

### 5.1 Nutricao

- Definir volume alvo inicial de alimentos
- Criar pipeline de importacao em lote com dedupe
- Garantir macros/micros minimos por item
- Otimizar busca e cadastro rapido no mobile

### 5.2 Exercicios

- Auditar grupos e subgrupos musculares
- Fechar lacunas por modalidade
- Normalizar taxonomia e tags
- Completar biblioteca com cobertura real

## 6) Orquestracao de Skills (fluxo recomendado)

## 6.1) R2 Buckets — Imagens e Vídeos


Referência: `.claude/plans/mobile-qa-lancamento-maximo/R2-SETUP.md`

- Buckets criados: vfit-images, vfit-videos
- Domínios: images.vfit.app.br, videos.vfit.app.br (ativos, testados, antigos removidos)
- Bindings e vars no wrangler.toml
- CORS restrito a *.vfit.app.br
- Estrutura de keys padronizada
- Cache e PWA: runtime caching, range requests
- Status: documentação publicada, infra pública 100% pronta, testes Playwright pendentes

- plan-ceo-review: elevar ambicao e definir diferencial do release
- plan-eng-review: fechar arquitetura de execucao e riscos
- qa: execucao iterativa de testes + fixes
- webapp-testing: automacao Playwright orientada a fluxo
- design-review: auditoria visual e refinos finais
- web-design-guidelines: conformidade de interface e a11y
- cloudflare-web-perf: baseline e melhoria de performance
- vercel-react-best-practices: refino de qualidade React/Next
- review-pr: auditoria de regressao antes de merge
- document-release: sincronizar docs pos-entrega

## 7) Criticos de Go/No-Go

So vai para lancamento se:
- Sem P0/P1 abertos
- Smoke auth obrigatorio aprovado
- Quality gate aprovado (type, lint, testes)
- Hero/header padronizado nas telas-alvo
- Fluxo Nutricao com CTA de adicionar funcionando
- Cobertura de dados minima atingida (alimentos e exercicios)
- Relatorio final com riscos residuais aceitos

## 8) Entregaveis

- Suite Playwright mobile completa (smoke + standard + exhaustive)
- Hero/header padrao aplicado e validado
- Base de alimentos reforcada + fluxo de adicao robusto
- Taxonomia de exercicios/grupos/subgrupos revisada
- Relatorio de prontidao para lancamento
- TRACKING atualizado em tempo real durante execucao

## 9) Primeira Sprint (48h)

- Criar baseline QA + performance
- Implementar padrao de hero em Avaliacoes e Nutricao
- Garantir botao voltar nas telas-alvo
- Rodar rodada Quick QA e corrigir P0/P1
- Consolidar plano de dados para alimentos/exercicios

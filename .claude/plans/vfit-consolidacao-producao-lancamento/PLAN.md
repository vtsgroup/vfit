# VFIT — Consolidação Produção Lançamento

> **Criado:** 03/05/2026  
> **Status:** Em execução  
> **Decisão de produto:** MVP perfeito primeiro

## Objetivo

Consolidar o VFIT para lançamento com foco no fluxo essencial: cadastro → onboarding → treino gerado por IA → primeiro treino iniciado/concluído. O plano corrige o tema light quebrado, separa identidade visual pública do app interno, reduz ruído/scroll e fecha os gates de produção.

## Decisões confirmadas

- Aluno B2C: **light-only**.
- Personal/admin: mantêm **dark premium** atual.
- Páginas públicas e auth: migrar para **azul premium**.
- App interno: verde VFIT segue como cor de ação/progresso.
- Escopo: MVP perfeito primeiro; fase 2 documentada como backlog.

## CEO Review

1. O VFIT deve comunicar dois caminhos sem confundir: aluno começa grátis com IA + acompanhamento real; profissional monetiza e opera alunos em página dedicada.
2. A home deve remover duplicações de escolha de perfil e repetir menos CTAs.
3. A métrica central do lançamento é ativação: onboarding concluído, plano criado, treino iniciado/concluído.
4. Azul público/auth transmite confiança e tecnologia; verde fica para energia/ação dentro do produto.
5. Qualquer entrada de menu incompleta ou “em breve” deve sair do caminho principal do MVP.

## Eng Review

1. Não reescrever arquitetura; usar stores, layouts, tokens e componentes existentes.
2. Corrigir tema no nível de `ThemeProvider`, layout e tokens, evitando patches página a página.
3. Preservar regras críticas: auth guard em React Query, Tailwind v4 canônico, `Button` em CTAs e `DSIcon` em ícones.
4. Validar com editor diagnostics, lint, type-check, testes, build, a11y, smoke auth e release gate.
5. Deploy somente com confirmação explícita e via pipeline oficial.

## Design Review

- Tema aluno deve ser claro, limpo e com hierarquia forte, sem headers escuros misturados.
- Páginas públicas/auth devem usar azul como cor de confiança; verde apenas para sucesso/ação.
- Reduzir scroll desnecessário: conteúdo primário acima da dobra, secundário colapsável/lazy.
- Menus devem ser previsíveis e derivados de fonte única sempre que possível.

## Workstreams

1. Plano operacional e baseline visual.
2. Correção de quebras reais e higiene Tailwind v4.
3. Light-only no app do aluno.
4. Componentes base em light mode.
5. Página Treinos com menos scroll e sem duplicidade.
6. Menus e navegação simplificados.
7. Público/auth azul premium.
8. Remoção de UI/rotas desnecessárias para MVP.
9. QA visual com screenshots e gates de produção.

## Critérios de aceite

- Aluno nunca vê tema dark no app B2C.
- Personal/admin continuam sem regressão visual no dashboard.
- Público/auth ficam visualmente coerentes em azul premium.
- Páginas críticas não têm scroll vazio/desnecessário.
- Editor diagnostics zerados para os arquivos alterados.
- `quality:ci`, `smoke:auth:local` e `ops:release:gate` passam antes de go/no-go.

## Fora do MVP

- Comunidade avançada.
- Blog avançado/SEO extenso.
- Food database massiva.
- Assessment avançado se não bloquear o fluxo principal.
- Migrations sem bug comprovado.

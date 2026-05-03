# VISUAL AUDIT — VFIT Consolidação Produção Lançamento

> **Criado:** 03/05/2026  
> **Status:** Baseline inicial a partir dos prints anexados + exploração do código

## Baseline dos prints anexados

### 1. Escolha seu caminho

Problemas observados:

- Seção branca com botões 3D escuros herdados do app interno.
- CTAs misturam personal, nutricionista e afiliado sem hierarquia clara.
- Verde aparece em texto pequeno, mas o bloco não comunica premium/tecnologia.
- Espaçamento vertical e ordem dos botões podem confundir o primeiro clique.

Decisão:

- Consolidar em uma seção única de segmentação com azul premium nas páginas públicas.
- Primário: aluno grátis.
- Secundário: profissional/personal.
- Terciário: nutricionista/afiliado se fluxo estiver completo; senão mover para secundário/discreto.

### 2. Acesso para aluno

Problemas observados:

- Repete escolhas já feitas no bloco anterior.
- Há dois níveis de CTAs: escolha de perfil e entrar/cadastrar/termos por perfil.
- A página fica mais longa sem necessidade.
- Visual alterna verde/escuro/cinza em uma seção que deveria ser objetiva.

Decisão:

- Remover duplicação e criar uma única matriz de caminhos.
- Fluxo público recomendado: Hero → Caminho do usuário → Benefícios/prova → Preços/CTA → FAQ.

## Baseline técnico encontrado

- Público/auth ainda usa muitos glows verdes.
- App aluno mistura desejo de light mode com headers e páginas hardcoded dark.
- Página Treinos tem alto volume de blocos acima da biblioteca e duplicidade de treino do dia.
- Diagnostics atuais indicam classes Tailwind v4 não canônicas.

## Screenshots planejadas

Salvar em `SCREENSHOTS/`:

- `public-home-before-desktop.png`
- `public-home-after-desktop.png`
- `auth-login-before-desktop.png`
- `auth-login-after-desktop.png`
- `student-treinos-before-mobile.png`
- `student-treinos-after-mobile.png`
- `student-plano-after-mobile.png`
- `student-perfil-after-mobile.png`
- `dashboard-personal-after-desktop.png`

## Critérios visuais

- Aluno: fundo claro, cards claros, header claro, bottom nav claro, contraste AA.
- Personal/admin: sem regressão no dark premium.
- Público/auth: azul premium coeso, sem glows verdes dominantes.
- Scroll: primeira ação do usuário visível acima da dobra em mobile.
- Menus: sem opções duplicadas ou caminhos incompletos como CTA primário.

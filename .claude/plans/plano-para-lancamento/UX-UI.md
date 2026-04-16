# UX-UI - Especificacao de Interface

## Objetivo

Elevar a qualidade visual das telas principais mantendo consistencia com o design system atual e prioridade em mobile.

## 1) Header no tema claro

Problema:
- Header fica com leitura ruim quando o app esta em modo claro

Diretriz:
- Superficie clara com contraste alto
- Titulo e breadcrumb com texto escuro
- Icones de acao com contraste AA
- Divisor inferior suave para separar do conteudo

Criterios de aceite:
- Contraste de texto >= 4.5:1 no header light
- Sem perda de legibilidade em brilho alto de tela

## 2) Verde principal unificado

Problema:
- O verde favorito do usuario (chip Dia 1) nao esta sendo reaplicado nos CTAs principais

Diretriz:
- Eleger o token do chip Dia 1 como verde principal de acao
- Aplicar em:
  - Botao Iniciar Treino
  - Botao Proximo Exercicio
  - Estados ativos relevantes de treino

Criterios de aceite:
- Todos os CTAs primarios usam o mesmo token de verde
- Hover/pressed/disabled seguem a mesma familia tonal

## 3) Efeito 3D dos botoes

Diretriz:
- Adotar profundidade visual consistente com botoes de dia
- Estrutura recomendada:
  - Gradiente sutil
  - Sombra de base com deslocamento curto
  - Estado pressed com reducao de altura visual
  - Transicao curta e responsiva

Aplicacao obrigatoria:
- Botao Proximo Exercicio
- Botao Iniciar Treino

Criterios de aceite:
- Interacao visual em <100ms apos toque
- Sem jitter de layout
- Touch area minima 44x44

## 4) Home Treinos semelhante a Meu Plano

Diretriz:
- Aproximar visual da secao hero de Meu Plano
- Topo com bloco verde de destaque e hierarquia clara
- Cards de conteudo com profundidade coerente

Criterios de aceite:
- Percepcao de consistencia entre Meu Plano e Treinos
- Sem regressao de navegacao e scroll

## 5) Acessibilidade e responsividade

Checklist obrigatorio:
- Contraste AA em light e dark
- Safe area respeitada
- Sem conteudo coberto pela bottom nav
- Labels e foco coerentes para elementos interativos

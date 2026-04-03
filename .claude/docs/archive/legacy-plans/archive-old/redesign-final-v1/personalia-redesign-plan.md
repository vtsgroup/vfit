# PLANO DEFINITIVO DE REDESIGN — VFIT
## SaaS Fitness Premium · Ultra Moderno · Glassmorphism · Design System Completo

---

# A) DIAGNÓSTICO ESTRATÉGICO DE PERCEPÇÃO PREMIUM

## A.1 — Principais Erros que Deixam o Produto "Amador"

Analisando as 15 telas do estado atual:

**1. Monotonia cromática e falta de profundidade**
O site inteiro é uma massa escura (#0a0a0a a #1a1a2e) sem variação de profundidade. Os cards não se separam do fundo porque usam praticamente o mesmo tom escuro com borda sutil. Produtos premium criam camadas visíveis (surface-1, surface-2, surface-3) onde cada nível de profundidade tem uma cor levemente mais clara. Seu site parece "flat demais" — como se tudo flutuasse no mesmo plano.

**2. Verde neon saturado sem controle**
O verde (#00D26A / #2FE89A) é usado indiscriminadamente em headlines enormes, CTAs, ícones, badges, bordas e labels. Quando tudo é destaque, nada é destaque. Em produtos premium, cor de acento ocupa no máximo 10-15% da superfície visual. No seu caso, está próximo de 35-40%.

**3. Cards sem glassmorphism real**
Os cards atuais são retângulos escuros com borda de 1px — não há blur, não há transparência, não há gradiente sutil. Glassmorphism de verdade requer: background rgba com alpha 0.05-0.15, backdrop-filter: blur(20-40px), borda com gradiente sutil (branco 5-10% alpha), e sombra com camadas.

**4. Tipografia sem hierarquia refinada**
As headlines usam bold pesado sem variação de peso entre título e subtítulo. A fonte parece ser apenas uma família (provavelmente Inter ou similar) sem contraste tipográfico. Produtos premium usam pelo menos 2 famílias ou pesos bem distintos (display para títulos, texto para corpo).

**5. Espaçamento inconsistente**
O padding interno dos cards varia entre seções. A distância entre blocos (hero → recursos → como funciona) não segue ritmo vertical. Isso cria sensação inconsciente de "montado às pressas".

**6. Dashboard sem data storytelling**
O dashboard admin mostra números crus sem contexto visual. Os stat cards têm ícones coloridos mas não contam história. Não há sparklines, não há variação temporal, não há hierarchy between primary and secondary metrics.

**7. Login sem impacto emocional**
A tela de login é funcional mas genérica. Split-screen com formulário funciona, mas o lado esquerdo é apenas texto sobre fundo escuro — não há imagem, não há gradient sofisticado, não há elemento visual que gere confiança.

**8. Lista de alunos sem densidade visual inteligente**
A tela de alunos é uma lista repetitiva com avatar genérico + texto + badge. Não há status visual rápido, não há agrupamento, não há ações rápidas visíveis.

## A.2 — Matriz Impacto × Esforço

| Prioridade | Ação | Impacto | Esforço |
|-----------|------|---------|---------|
| P0 | Implementar glassmorphism real nos cards (backdrop-filter + camadas) | ★★★★★ | ★★☆☆☆ |
| P0 | Rebalancear uso do verde (10-15% da superfície) | ★★★★★ | ★☆☆☆☆ |
| P0 | Criar 3 níveis de surface color (depth system) | ★★★★★ | ★★☆☆☆ |
| P0 | Hero section com composição visual premium | ★★★★★ | ★★★☆☆ |
| P1 | Design system de tokens (cor, tipografia, espaçamento) | ★★★★☆ | ★★★☆☆ |
| P1 | Dashboard com data storytelling (sparklines, trends) | ★★★★☆ | ★★★☆☆ |
| P1 | Login page com gradient mesh + glassmorphism | ★★★★☆ | ★★☆☆☆ |
| P1 | Sistema de motion consistente | ★★★☆☆ | ★★☆☆☆ |
| P2 | Tipografia display para headlines | ★★★☆☆ | ★☆☆☆☆ |
| P2 | Ícones refinados (Lucide/Phosphor) | ★★★☆☆ | ★★☆☆☆ |
| P2 | Pricing cards com glassmorphism + highlight premium | ★★★☆☆ | ★★☆☆☆ |
| P2 | Testimonials com layout grid (não carousel solo) | ★★☆☆☆ | ★★☆☆☆ |
| P3 | Blog template premium | ★★☆☆☆ | ★★★☆☆ |
| P3 | Microinterações em todos componentes | ★★☆☆☆ | ★★★☆☆ |
| P3 | Animações de scroll (entrada de seções) | ★★☆☆☆ | ★★☆☆☆ |

---

# B) CONCEITOS MODERNOS — APLICADOS AO VFIT

## B.1 — Minimalismo Funcional
**O que é:** Remover tudo que não contribui para a decisão do usuário. Não é "pouco conteúdo", é "zero ruído".
**Por que importa:** Personal trainers são ocupados. Cada segundo poupado = mais percepção de valor.
**Como aplicar no VFIT:** Remover bordas decorativas dos cards (usar sombra + blur), eliminar labels redundantes (o ícone + número já comunica), reduzir o footer para 3 colunas máx.
**Erro comum:** Confundir minimalismo com vazio — eliminar informação útil. O hero precisa de prova social (números), não pode ser só headline + CTA.

## B.2 — Visual Hierarchy First
**O que é:** O olho do usuário deve percorrer a tela em Z ou F, passando exatamente pelos pontos que você quer.
**Por que importa:** Se o usuário não vê o CTA nos primeiros 3 segundos, a taxa de conversão cai 40%.
**Como aplicar no VFIT:** Hero: headline > dashboard mockup > CTA > prova social. Dashboard: greeting > KPI cards > gráfico principal > atividade recente. Usar tamanho, peso, cor e espaço para criar 3 níveis claros (primário, secundário, terciário).
**Erro comum:** Tornar TUDO bold ou TUDO verde — destroi hierarquia. Seu hero atual tem a headline e "Inteligência Artificial" competindo em peso visual com o dashboard mockup.

## B.3 — Progressive Disclosure
**O que é:** Mostrar informação em camadas. O essencial primeiro, detalhes sob demanda.
**Por que importa:** Evita sobrecarga cognitiva. Um personal com 50 alunos não precisa ver tudo de uma vez.
**Como aplicar no VFIT:** Dashboard: mostrar top 4 KPIs, expandir para detalhes. Lista de alunos: mostrar nome + status + última atividade, expandir para perfil completo. Avaliação física: resumo visual primeiro, tabela detalhada sob "Ver detalhes".
**Erro comum:** Esconder informação crítica atrás de cliques. O preço NUNCA deve ser hidden. Os KPIs primários NUNCA devem exigir scroll.

## B.4 — Data Storytelling
**O que é:** Transformar números em narrativa visual. Não é "mostrar dados", é "contar a história dos dados".
**Por que importa:** O personal precisa entender saúde do negócio em 5 segundos. O aluno precisa ver progresso instantaneamente.
**Como aplicar no VFIT:** Cada stat card deve ter: número grande + label + sparkline (mini gráfico) + indicador de tendência (↑12% em verde ou ↓5% em vermelho). Dashboard do personal: "Sua receita cresceu 23% este mês" com área chart animado. Avaliação do aluno: timeline visual de progresso (antes → depois).
**Erro comum:** Mostrar números sem contexto. "48 alunos ativos" não diz nada. "48 alunos ativos (+12% vs mês passado)" conta uma história.

## B.5 — Motion com Significado
**O que é:** Animação que comunica estado, transição ou feedback — não decoração.
**Por que importa:** Motion bem feito aumenta percepção de qualidade em 40% (estudo NNGroup).
**Como aplicar no VFIT:** Stat cards: números animam de 0 ao valor real (count-up) ao carregar. Cards: hover com translateY(-2px) + sombra expandida. Página transitions: fade + slide sutil (200-300ms). Toast de sucesso: slide-in from right + scale sutil.
**Erro comum:** Animação em tudo = cansaço visual. Nunca animar mais de 3 elementos simultaneamente. Sempre respeitar prefers-reduced-motion.

## B.6 — Neurodesign para Confiança e Ação
**O que é:** Usar princípios cognitivos para gerar confiança e guiar decisão.
**Por que importa:** Um personal que confia no produto converte. Um que hesita abandona.
**Como aplicar no VFIT:** Prova social logo abaixo do hero (números reais + depoimentos). Pricing: destacar plano Pro como "recomendado" com border glow verde. Formulário de login: mostrar logos de segurança + "2.500+ personais confiam". CTA: usar verde apenas no botão primário para criar association verde = ação positiva.
**Erro comum:** Excesso de social proof genérico ("milhares confiam") sem especificidade. Usar números reais: "2.847 personais, 47.230 treinos criados".

## B.7 — UX Writing Orientado à Decisão
**O que é:** Cada texto guia o usuário para a próxima ação, não apenas informa.
**Por que importa:** Microcopy ruim causa 30% de abandono em formulários.
**Como aplicar no VFIT:** Botão não é "Enviar" → é "Começar teste grátis" ou "Criar meu treino agora". Estado vazio não é "Nenhum dado" → é "Ainda não há treinos. Crie o primeiro em 30 segundos →". Erro não é "Erro 500" → é "Algo deu errado. Estamos resolvendo. Tente em 30 segundos."
**Erro comum:** Tom robótico em mensagens de sistema. VFIT fala com personais — deve ser motivacional mas profissional, nunca infantil.

## B.8 — Conversão sem Agressividade
**O que é:** Guiar para conversão sem popups invasivos, countdowns falsos ou dark patterns.
**Por que importa:** Personal trainers são profissionais. Táticas agressivas destroem confiança.
**Como aplicar no VFIT:** CTA principal sempre visível no hero e sticky no header (após scroll). Pricing transparente sem asteriscos. Trial de 7 dias sem cartão — essa é sua arma, destaque isso. Blog com CTA contextual inline ("Você faz isso manualmente? Automatize →") em vez de popup.
**Erro comum:** Não ter CTA suficiente. Cada seção da home deve ter um caminho para conversão, mas orgânico — não gritante.

## B.9 — Consistência Sistêmica (Design Debt Zero)
**O que é:** Todo componente segue as mesmas regras de cor, espaçamento, radius e sombra.
**Por que importa:** Inconsistência é o sinal #1 de "produto amador" que o cérebro detecta inconscientemente.
**Como aplicar no VFIT:** Um radius para tudo (12px para cards, 8px para inputs, 20px para pills). Uma escala de sombras (3 níveis: sm/md/lg). Uma escala de espaçamento (4/8/12/16/24/32/48/64/96). Tokens CSS variables usados em 100% dos componentes.
**Erro comum:** "Vou ajustar depois". Design debt cresce exponencialmente. Defina tokens ANTES de implementar.

## B.10 — Percepção de Velocidade
**O que é:** Fazer a app PARECER rápida, mesmo quando carregando.
**Por que importa:** Usuário percebe lentidão acima de 200ms. Skeleton screens eliminam sensação de espera.
**Como aplicar no VFIT:** Skeleton loading para dashboard cards (pulse animation nos placeholders). Optimistic UI: ao salvar treino, mostrar sucesso imediato e sincronizar em background. Imagens com blur-up (placeholder de baixa resolução → imagem full). Font-display: swap para evitar FOIT.
**Erro comum:** Spinner genérico em tudo. Skeleton > spinner. Progress bar > spinner. Nunca mostrar tela em branco.

---

# C) 3 DIREÇÕES CRIATIVAS

## DIREÇÃO 1: "Midnight Pulse"
**Moodboard textual:** Noite sofisticada, gradientes suaves como aurora boreal, glassmorphism profundo, sensação de tecnologia avançada. Pense: Vercel, Linear, Raycast.

**Paleta de cores:**

| Token | HEX | Uso |
|-------|-----|-----|
| --bg-base | #050A12 | Background principal (quase preto com tom azul) |
| --bg-surface-1 | #0B1221 | Cards nível 1, sidebar |
| --bg-surface-2 | #111B2E | Cards nível 2, dropdowns |
| --bg-surface-3 | #182640 | Cards nível 3, hover states |
| --brand-primary | #00D47F | Verde principal (mais frio que o atual) |
| --brand-secondary | #00F5A0 | Verde claro para gradientes |
| --brand-accent | #7DF9B5 | Verde pastel para badges leves |
| --neon-glow | #00FFB2 | Apenas para glow effects (uso < 5%) |
| --text-primary | #F0F4F8 | Texto principal (off-white frio) |
| --text-secondary | #8899AA | Texto secundário |
| --text-muted | #4A5568 | Texto terciário / placeholders |
| --border-subtle | rgba(255,255,255,0.06) | Bordas de cards |
| --border-hover | rgba(255,255,255,0.12) | Bordas on hover |
| --glass-bg | rgba(11,18,33,0.60) | Fundo glassmorphism |
| --glass-border | rgba(255,255,255,0.08) | Borda glassmorphism |
| --success | #00D47F | Sucesso (reusa brand) |
| --warning | #FFB020 | Avisos (âmbar quente) |
| --error | #FF4D6A | Erros (rosa-vermelho) |
| --info | #38BDF8 | Informacional (azul céu) |

**Tipografia:**
- Títulos: **Inter Display** (peso 700-800, tracking -0.02em)
- Corpo: **Inter** (peso 400-500)
- Números/dados: **JetBrains Mono** ou **Inter Tabular** (monospace elegante para métricas)
- Escala: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 / 72px

**Linguagem visual:**
- Cards: backdrop-filter: blur(24px), bg rgba com 0.6 alpha, borda gradiente (rgba branco 8%), radius 16px, sombra multicamada
- Superfícies: 3 camadas de profundidade com variação sutil de luminosidade
- Bordas: predominantemente transparentes/sutis, sem bordas sólidas coloridas
- Sombras: 3 níveis — sm (0 1px 2px rgba(0,0,0,0.2)), md (0 4px 16px rgba(0,0,0,0.3)), lg (0 8px 32px rgba(0,0,0,0.4))
- Luz: gradientes mesh sutis no background (gradiente radial do verde com 3-5% opacity)
- Glow: reservado para CTAs primários e elementos premium (box-shadow: 0 0 30px rgba(0,212,127,0.15))

**Estilo de ícones:** Lucide Icons (outline, 1.5px stroke) em branco/cinza. Ícones de feature com fundo glass circle (40x40) e ícone em verde.

**Nível de motion:** Médio-alto. Transições suaves (300ms ease-out), hover states com lift, count-up em números, stagger nos cards ao entrar, parallax sutil no hero.

**Prós:** Ultra moderno, se posiciona junto de apps top-tier, altamente escalável, glassmorphism funciona perfeitamente com dark theme.
**Contras:** Exige atenção a contraste (WCAG), glassmorphism pesado pode afetar performance em devices fracos.
**Risco de execução:** Médio. Backdrop-filter é suportado em 95%+ dos browsers. Precisa fallback para Safari antigo.
**Fit fitness:** Excelente. Escuridão transmite seriedade/profissionalismo, verde transmite progresso e saúde.

---

## DIREÇÃO 2: "Clean Edge"
**Moodboard textual:** Minimalismo escandinavo encontra tech premium. Fundo predominantemente light (branco/cinza claro) com detalhes escuros e verde como acento cirúrgico. Pense: Notion, Stripe, Calcium.

**Paleta de cores:**

| Token | HEX | Uso |
|-------|-----|-----|
| --bg-base | #FAFBFC | Background principal |
| --bg-surface-1 | #FFFFFF | Cards nível 1 |
| --bg-surface-2 | #F4F6F8 | Background alternado |
| --bg-surface-3 | #EDF0F4 | Hover/active |
| --brand-primary | #059669 | Verde escuro (confiança) |
| --brand-secondary | #10B981 | Verde médio |
| --text-primary | #0F172A | Texto principal (navy) |
| --text-secondary | #475569 | Texto secundário |
| --border-subtle | #E2E8F0 | Bordas |

**Tipografia:** Geist (Vercel) ou Plus Jakarta Sans para títulos, Inter para corpo.
**Nível de motion:** Baixo-médio.

**Prós:** Acessibilidade fácil, performance excelente, universalmente aceito.
**Contras:** Pode parecer "genérico" no nicho fitness. Falta energia/dinamismo que personais esperam.
**Risco de execução:** Baixo.
**Fit fitness:** Médio. Profissional demais, falta a energia motivacional que o público espera.

---

## DIREÇÃO 3: "Neon Forge"
**Moodboard textual:** Energia pura, gradientes vibrantes, efeito cyber-fitness. Fundo muito escuro com explosões de neon. Pense: Figma Conf, Replit, gaming dashboards.

**Paleta de cores:**

| Token | HEX | Uso |
|-------|-----|-----|
| --bg-base | #000000 | Preto puro |
| --brand-primary | #00FF88 | Neon verde saturado |
| --brand-secondary | #00CCFF | Neon ciano |
| --accent-glow | #FF00FF | Magenta para detalhes (uso mínimo) |

**Tipografia:** Space Grotesk para títulos (geométrica, bold), Inter para corpo.
**Nível de motion:** Alto. Animações complexas, partículas, efeitos de blur em tempo real.

**Prós:** Extremamente impactante, memorável, diferenciado.
**Contras:** Cansativo em uso prolongado (dashboard), problemas severos de acessibilidade, performance pesada.
**Risco de execução:** Alto. Muitos efeitos = muito CSS/JS = performance degradada.
**Fit fitness:** Baixo-médio. Funciona para marketing, insustentável para produto diário.

---

## ✅ DECISÃO FINAL: DIREÇÃO 1 — "Midnight Pulse"

**Justificativa objetiva:**
1. Equilibra sofisticação premium com energia fitness
2. Glassmorphism no dark theme é o padrão visual mais premium e moderno de 2024-2026
3. Escalável — funciona tanto para site público quanto para dashboard
4. Performance controlável (backdrop-filter é a única preocupação)
5. Verde da marca se destaca perfeitamente contra fundo navy/dark
6. Compatível com a identidade visual existente (dark + green) — evolução, não ruptura
7. O público de personais quer "tecnológico e profissional", não "corporativo" (mata dir.2) nem "gaming" (mata dir.3)

---

# D) DESIGN SYSTEM COMPLETO

## D.1 — Tokens de Cor

### Background / Surfaces
```css
:root {
  /* Base backgrounds */
  --bg-base: #050A12;
  --bg-elevated: #080E1A;
  --bg-surface-1: #0B1221;
  --bg-surface-2: #111B2E;
  --bg-surface-3: #182640;

  /* Glass surfaces */
  --glass-bg: rgba(11, 18, 33, 0.60);
  --glass-bg-hover: rgba(11, 18, 33, 0.75);
  --glass-bg-dense: rgba(11, 18, 33, 0.85);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(255, 255, 255, 0.14);
  --glass-blur: 24px;
  --glass-blur-heavy: 40px;

  /* Brand colors */
  --brand-50: #E6FFF2;
  --brand-100: #B3FFD9;
  --brand-200: #7DF9B5;
  --brand-300: #4AF492;
  --brand-400: #00F5A0;
  --brand-500: #00D47F;  /* PRIMARY */
  --brand-600: #00B36A;
  --brand-700: #009256;
  --brand-800: #007142;
  --brand-900: #00512F;

  /* Semantic */
  --success: #00D47F;
  --success-subtle: rgba(0, 212, 127, 0.12);
  --warning: #FFB020;
  --warning-subtle: rgba(255, 176, 32, 0.12);
  --error: #FF4D6A;
  --error-subtle: rgba(255, 77, 106, 0.12);
  --info: #38BDF8;
  --info-subtle: rgba(56, 189, 248, 0.12);

  /* Text */
  --text-primary: #F0F4F8;
  --text-secondary: #8899AA;
  --text-muted: #4A5568;
  --text-on-brand: #050A12;
  --text-link: #00D47F;
  --text-link-hover: #00F5A0;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-hover: rgba(255, 255, 255, 0.16);
  --border-focus: rgba(0, 212, 127, 0.50);
  --border-brand: #00D47F;
}
```

### Gradientes Chave
```css
:root {
  /* Hero background mesh */
  --gradient-hero: radial-gradient(ellipse at 20% 50%, rgba(0,212,127,0.06) 0%, transparent 60%),
                   radial-gradient(ellipse at 80% 20%, rgba(0,245,160,0.04) 0%, transparent 50%),
                   radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.03) 0%, transparent 40%);

  /* Card highlight gradient (para borda) */
  --gradient-card-border: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%);

  /* CTA button gradient */
  --gradient-cta: linear-gradient(135deg, #00D47F 0%, #00F5A0 100%);
  --gradient-cta-hover: linear-gradient(135deg, #00E88C 0%, #2FFFB2 100%);

  /* Pricing popular card */
  --gradient-popular-border: linear-gradient(180deg, #00D47F 0%, rgba(0,212,127,0.0) 100%);

  /* Text gradient */
  --gradient-text: linear-gradient(135deg, #00D47F 0%, #00F5A0 50%, #7DF9B5 100%);
}
```

## D.2 — Tipografia

```css
:root {
  /* Font families */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Scale */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  --text-7xl: 4.5rem;      /* 72px */

  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-widest: 0.1em;
}
```

**Uso por contexto:**

| Elemento | Size | Weight | Tracking | Leading |
|----------|------|--------|----------|---------|
| Hero headline | text-6xl / text-7xl | extrabold (800) | tight (-0.025em) | tight (1.1) |
| Section headline | text-4xl / text-5xl | bold (700) | tight | snug (1.25) |
| Card title | text-xl | semibold (600) | normal | snug |
| Body text | text-base | normal (400) | normal | normal (1.5) |
| Small/caption | text-sm | medium (500) | normal | normal |
| Overline/label | text-xs | semibold (600) | widest (0.1em) | normal |
| KPI número grande | text-4xl | bold (700) | tight | tight |
| Code/data | text-sm mono | normal (400) | normal | normal |

## D.3 — Espaçamento

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */

  /* Specific spacing tokens */
  --section-gap: var(--space-24);        /* Entre seções da home */
  --card-padding: var(--space-6);        /* Padding interno de cards */
  --card-padding-sm: var(--space-4);     /* Cards compactos */
  --card-gap: var(--space-4);            /* Entre cards em grid */
  --input-padding-x: var(--space-4);     /* Padding horizontal inputs */
  --input-padding-y: var(--space-3);     /* Padding vertical inputs */
  --sidebar-width: 260px;
  --sidebar-collapsed: 72px;
  --header-height: 64px;
  --header-height-mobile: 56px;
}
```

## D.4 — Radius

```css
:root {
  --radius-sm: 6px;       /* Badges, tooltips, small elements */
  --radius-md: 8px;       /* Inputs, buttons, small cards */
  --radius-lg: 12px;      /* Cards, dropdowns, modals */
  --radius-xl: 16px;      /* Large cards, sections */
  --radius-2xl: 20px;     /* Hero cards, feature highlights */
  --radius-full: 9999px;  /* Pills, avatars, toggles */
}
```

**Regras:**
- Cards gerais: `--radius-xl` (16px)
- Inputs e botões: `--radius-md` (8px)
- Badges e pills: `--radius-full`
- Modais: `--radius-xl` (16px)
- Imagens dentro de cards: `--radius-lg` (12px)
- Avatar: `--radius-full`

## D.5 — Sombras

```css
:root {
  /* Sombras para dark theme — mais sutis que light theme */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4);

  /* Glow shadows (para brand elements) */
  --glow-sm: 0 0 12px rgba(0, 212, 127, 0.12);
  --glow-md: 0 0 24px rgba(0, 212, 127, 0.18);
  --glow-lg: 0 0 40px rgba(0, 212, 127, 0.25);
  --glow-cta: 0 4px 20px rgba(0, 212, 127, 0.30);

  /* Inner glow para glassmorphism */
  --inner-glow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

## D.6 — Grid / Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1440px;

  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1200px;
  --container-2xl: 1320px;
}

/* Grid system */
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }
}
```

## D.7 — Z-Index

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-drawer: 400;
  --z-modal-backdrop: 500;
  --z-modal: 600;
  --z-popover: 700;
  --z-tooltip: 800;
  --z-toast: 900;
  --z-max: 9999;
}
```

## D.8 — Componentes Base (Especificações)

### GLASS CARD (componente mais importante)
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--card-padding);
  box-shadow: var(--shadow-sm), var(--inner-glow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow: var(--shadow-md), var(--inner-glow);
  transform: translateY(-2px);
}

/* Variante: card com destaque verde (para popular pricing, etc) */
.glass-card--highlight {
  border-image: var(--gradient-popular-border) 1;
  /* OU usar pseudo-element para borda gradiente com radius */
  position: relative;
}
.glass-card--highlight::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-xl);
  padding: 1px;
  background: linear-gradient(180deg, rgba(0,212,127,0.5) 0%, rgba(0,212,127,0) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### STAT CARD
```css
.stat-card {
  /* Herda .glass-card */
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  min-height: 120px;
}

.stat-card__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.stat-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-tight);
}

.stat-card__trend {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.stat-card__trend--up { color: var(--success); }
.stat-card__trend--down { color: var(--error); }

.stat-card__sparkline {
  height: 32px;
  width: 80px;
  margin-top: auto;
}
```

### BUTTON
```css
/* Primário */
.btn-primary {
  background: var(--gradient-cta);
  color: var(--text-on-brand);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--glow-sm);
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  background: var(--gradient-cta-hover);
  box-shadow: var(--glow-cta);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--glow-sm);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

/* Secundário (glass) */
.btn-secondary {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--glass-bg-hover);
  border-color: var(--border-hover);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text-primary);
}

/* Sizes */
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }

/* Icon button */
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.btn-icon:hover {
  background: rgba(255,255,255,0.06);
  border-color: var(--border-hover);
  color: var(--text-primary);
}
```

### INPUT
```css
.input {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  background: var(--bg-surface-1);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: var(--font-body);
  transition: all 0.2s ease;
  height: 44px; /* Touch target mínimo */
}

.input::placeholder {
  color: var(--text-muted);
}

.input:hover {
  border-color: var(--border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(0, 212, 127, 0.15);
}

.input--error {
  border-color: var(--error);
}
.input--error:focus {
  box-shadow: 0 0 0 3px rgba(255, 77, 106, 0.15);
}

/* Glass input (para login, hero forms) */
.input--glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-color: var(--glass-border);
}
```

### BADGE
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  line-height: 1;
  white-space: nowrap;
}

/* Variantes glassmorphism */
.badge--success {
  background: var(--success-subtle);
  color: var(--brand-300);
  backdrop-filter: blur(8px);
}

.badge--warning {
  background: var(--warning-subtle);
  color: #FFD080;
}

.badge--error {
  background: var(--error-subtle);
  color: #FF8DA0;
}

.badge--info {
  background: var(--info-subtle);
  color: #7DD3FC;
}

/* Badge premium (com glow) */
.badge--premium {
  background: linear-gradient(135deg, rgba(0,212,127,0.15) 0%, rgba(0,245,160,0.08) 100%);
  color: var(--brand-200);
  border: 1px solid rgba(0,212,127,0.20);
  box-shadow: var(--glow-sm);
}

/* Badge com dot */
.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

### MODAL / DRAWER / BOTTOMSHEET
```css
/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.60);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop);
  animation: fade-in 0.2s ease;
}

/* Modal */
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  max-width: 520px;
  width: calc(100% - var(--space-8));
  max-height: calc(100vh - var(--space-16));
  overflow-y: auto;
  animation: modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-in {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* Drawer (desktop) */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 90vw;
  background: var(--bg-surface-1);
  border-left: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-drawer);
  animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* BottomSheet (mobile) */
@media (max-width: 768px) {
  .bottomsheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-surface-1);
    border-top: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: var(--shadow-xl);
    z-index: var(--z-modal);
    max-height: 85vh;
    overflow-y: auto;
    animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bottomsheet__handle {
    width: 36px;
    height: 4px;
    background: var(--border-default);
    border-radius: var(--radius-full);
    margin: var(--space-3) auto;
  }
}
```

### TOAST / ALERT
```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  min-width: 300px;
  max-width: 440px;
  animation: toast-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast--success { border-left: 3px solid var(--success); }
.toast--error { border-left: 3px solid var(--error); }
.toast--warning { border-left: 3px solid var(--warning); }
.toast--info { border-left: 3px solid var(--info); }
```

### EMPTY STATE
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-16) var(--space-8);
  gap: var(--space-4);
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.empty-state__title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.empty-state__description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 400px;
}
```

## D.9 — Estados Obrigatórios

| Componente | default | hover | focus | active | disabled | loading | success | error | empty |
|-----------|---------|-------|-------|--------|----------|---------|---------|-------|-------|
| Button | ✅ | ✅ translateY(-1px) + glow | ✅ outline ring | ✅ translateY(0) | ✅ opacity 0.4 | ✅ spinner | ✅ check icon | — | — |
| Input | ✅ | ✅ border-hover | ✅ border-focus + ring | — | ✅ opacity 0.4 + no-pointer | — | ✅ green check | ✅ red border + msg | — |
| Card | ✅ | ✅ lift + border | — | ✅ scale(0.99) | ✅ opacity 0.5 | ✅ skeleton pulse | — | ✅ error banner | ✅ empty state |
| Table row | ✅ | ✅ bg-surface-2 | ✅ ring | ✅ bg-surface-3 | — | ✅ skeleton rows | — | — | ✅ empty state |
| Toggle | ✅ off | ✅ bg lighten | ✅ ring | ✅ on (green) | ✅ muted | — | — | — | — |

## D.10 — Checklist Anti-Inconsistência

- [ ] Todo card usa exatamente `border-radius: 16px`
- [ ] Todo input tem exatamente `height: 44px`
- [ ] Todo botão primário usa `--gradient-cta`
- [ ] Todo hover de card tem `translateY(-2px)`
- [ ] Todo focus tem `outline: 2px solid` com `offset: 2px`
- [ ] Todo texto de label usa `font-size: 12px, weight: 600, tracking: 0.05em, uppercase`
- [ ] Todo estado de loading usa skeleton (não spinner isolado)
- [ ] Todo espaçamento é múltiplo de 4px
- [ ] Nenhuma sombra usa rgb puro — sempre rgba
- [ ] Todo glassmorphism tem `-webkit-` prefix
- [ ] Todo elemento interativo tem `cursor: pointer`
- [ ] Todo texto em card tem max 3 níveis de hierarquia (title, body, caption)

---

# E) HERO SECTION WOW

## PROPOSTA 1: "Dashboard Flutuante" (RECOMENDADA ✅)

### Estrutura visual
```
┌──────────────────────────────────────────────────────────────────┐
│ [Header: Logo VFIT | Nav links | Instalar | Entrar | CTA] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ● badge: "Plataforma #1 para Personal Trainers"                │
│                                                                  │
│  # Transforme sua carreira                                       │
│  # com Inteligência Artificial ← (verde gradiente)               │
│                                                                  │
│  Subtítulo: 2 linhas max, cinza claro                            │
│                                                                  │
│  [████ Teste grátis — 7 dias ████]  [Veja como funciona →]       │
│                                                                  │
│  ✓ 7 dias grátis · ✓ Sem cartão · ✓ Cancele quando quiser       │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 2.500+      │  │ 45.000+     │  │ 98%         │              │
│  │ Personais   │  │ Treinos     │  │ Satisfação  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐        │
│  │                                                      │        │
│  │     ┌─────────────────────────────────────┐          │        │
│  │     │  DASHBOARD MOCKUP (glass card)      │          │        │
│  │     │  com dados fictícios e gráficos     │          │        │
│  │     │  flutuando com parallax sutil       │          │        │
│  │     └─────────────────────────────────────┘          │        │
│  │                                                      │        │
│  │  ┌──────┐ ┌──────┐  (stat cards flutuantes)         │        │
│  │  │48    │ │R$12k │                                   │        │
│  │  │alunos│ │receita│                                  │        │
│  │  └──────┘ └──────┘                                   │        │
│  │                                                      │        │
│  │              ┌──────────────────────┐                │        │
│  │              │ notification toast   │                │        │
│  │              │ "+3 alunos hoje" ✅  │                │        │
│  │              └──────────────────────┘                │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
│  BACKGROUND: gradient mesh verde/azul super sutil (3-5% opacity) │
│  + grid de pontos em off-white 2% opacity                        │
└──────────────────────────────────────────────────────────────────┘
```

### Headline e Subheadline
- **Headline:** "Transforme sua carreira com **Inteligência Artificial**" — "Inteligência Artificial" em gradiente verde (text-gradient)
- **Subheadline:** "Crie treinos personalizados com IA, gerencie alunos, automatize cobranças e avaliações físicas — tudo em uma plataforma inteligente."
- Overline badge (pill): "● Plataforma #1 para Personal Trainers" — fundo glass, texto branco, dot verde animado (pulse)

### CTA primário e secundário
- **Primário:** "Teste grátis — 7 dias" → botão verde gradiente com glow, ícone de seta
- **Secundário:** "Veja como funciona →" → botão ghost/outlined, scroll suave para seção seguinte
- **Trust badges abaixo:** ✓ 7 dias grátis · ✓ Sem cartão de crédito · ✓ Cancele quando quiser — texto muted, ícones de check verdes

### Prova social
- 3 stat pills flutuantes abaixo dos CTAs: "2.500+ Personais", "45.000+ Treinos", "98% Satisfação"
- Cada pill é glass card com ícone à esquerda, fade-in staggered (100ms delay entre cada)

### Elemento visual principal
- Dashboard mockup em glass card grande, posicionado ao lado direito (desktop) ou abaixo (mobile)
- O mockup tem 3 camadas flutuantes:
  1. Card principal com gráfico de barras + donut chart
  2. Stat cards menores (alunos, receita) flutuando com offset e parallax leve
  3. Toast notification "+3 alunos hoje" flutuando no canto superior direito
- Cada camada tem glassmorphism com diferentes níveis de blur
- Parallax sutil on mouse move (2-5px de deslocamento, não mais)

### Motion e microinterações
- Badge de overline: dot verde pulsa suavemente (animation: pulse 2s infinite)
- Headline: fade-in + slide-up (300ms, stagger por palavra)
- Stat numbers: count-up de 0 ao valor (800ms, ease-out)
- Dashboard mockup: fade-in + scale de 0.95 a 1.0 (400ms, ease-out, 200ms delay)
- Stat cards flutuantes: float animation sutil (translateY 3-5px, 4s infinite ease-in-out, offset entre cards)
- Background gradient mesh: sutilmente animado (shift de posição a cada 8s)

### Versão mobile
```
┌────────────────────────┐
│ [Logo] [☰]             │
├────────────────────────┤
│ ● Plataforma #1...     │
│                        │
│ Transforme sua         │
│ carreira com           │
│ Inteligência           │
│ Artificial             │
│                        │
│ Subtítulo (2 linhas)   │
│                        │
│ [██ Teste grátis ██]   │
│ [Veja como funciona →] │
│                        │
│ ✓ 7 dias · ✓ Sem cartão│
│                        │
│ 2.500+ │ 45k+ │ 98%   │
│ Person │ Trein │ Satisf│
│                        │
│ ┌────────────────────┐ │
│ │ Dashboard mockup   │ │
│ │ (simplificado)     │ │
│ │ ┌──────┐ ┌──────┐  │ │
│ │ │48    │ │R$12k │  │ │
│ │ └──────┘ └──────┘  │ │
│ └────────────────────┘ │
│                        │
│ ▼ Scroll               │
└────────────────────────┘
```

- Hero em coluna única (título → CTAs → prova → mockup)
- Headline: text-4xl (não text-7xl)
- CTAs: full-width stacked
- Mockup: versão compacta (apenas 2 stat cards + mini chart)
- Parallax e float desligados em mobile (performance)
- Stats em row horizontal com separadores sutis

### Variação A/B testável
- **A:** Com dashboard mockup (social proof + produto)
- **B:** Com vídeo autoplay muted (15s loop) mostrando uso real da plataforma

### Risco de performance
- O mockup usa múltiplas camadas CSS com backdrop-filter → risco de jank em scroll
- **Mitigação:** Usar `will-change: transform` nas camadas, desabilitar parallax em mobile, usar `contain: layout` no container do mockup, lazy-load o mockup se abaixo do fold

### ESCOLHA FINAL: Proposta 1 — Dashboard Flutuante
Combina produto real (social proof) com glassmorphism premium. Altíssimo impacto visual, execução viável.

---

# F) BLUEPRINT POR ÁREAS

## F1) SITE PÚBLICO

### HOME — Blueprint Completo

**Seção 1: Header (sticky)**
```
[Logo VFIT] ........ [Recursos] [Como funciona] [Planos] [Depoimentos] ........ [Instalar ↓] [Entrar] [████ Teste grátis ████]
```
- Estado inicial: background transparente sobre hero
- Após scroll (60px): background `--bg-base` com blur, border-bottom sutil, shadow-sm
- Logo: versão completa em desktop, apenas ícone "IA" em mobile
- CTA "Teste grátis": sempre verde, sempre visível
- Mobile: logo + hamburger. Menu abre como drawer pela direita com glass effect

**Seção 2: Hero (descrito na seção E)**

**Seção 3: Logos/Confiança (opcional)**
- "Usado por profissionais em todo o Brasil"
- Grid de logos de certificações ou parceiros (se existir)
- Se não tiver logos: pular esta seção e reforçar prova social no hero

**Seção 4: Recursos**
- Overline: "RECURSOS" (verde, uppercase, tracking wide)
- Headline: "Tudo que você precisa, **nada que não precisa**"
- Subheadline: 1 linha descritiva
- Grid 3×2 de feature cards (glassmorphism)
- Cada card: ícone em circle glass (40px) + título + descrição (2 linhas) + link "Saiba mais →"
- MELHORIA vs ATUAL: adicionar ícone animado (lottie micro, 24fps) em hover, adicionar mini-screenshot do feature dentro do card (opaco 30%, decorativo)
- Mobile: stack vertical, 1 card por row

**Seção 5: Como funciona**
- Overline: "COMO FUNCIONA"
- Headline: "Comece em **3 passos simples**"
- 3 steps em row horizontal conectados por linha tracejada
- Cada step: número em circle neon glow + ícone + título + descrição
- MELHORIA vs ATUAL: adicionar mini-animação ao scroll (step 1 aparece, 200ms, step 2, 200ms, step 3)
- Linha de conexão: gradient que vai do verde ao transparente
- Mobile: vertical com linha à esquerda (timeline style)

**Seção 6: Feature Showcase (NOVO — não existia)**
- Seção alternada: imagem à esquerda + texto à direita, depois inverte
- 2-3 features principais com screenshot real do produto
- Cada bloco:
  - Overline: "TREINOS COM IA"
  - Headline: "Crie treinos perfeitos em segundos"
  - 3 bullet points com ícone verde
  - CTA: "Teste agora →"
  - Screenshot em glass card com float animation
- RAZÃO: O site atual mostra features como texto abstrato. Screenshots reais geram 2-3x mais conversão.

**Seção 7: Planos / Pricing**
- Overline: "PLANOS"
- Headline: "Escolha o plano **ideal para você**"
- Subheadline: "Teste grátis por 7 dias, sem cartão de crédito"
- 3 pricing cards em glass layout
- Card central (Pro) = destaque com:
  - Borda gradiente verde (top to bottom, fading)
  - Badge "MAIS POPULAR" em verde gradient pill
  - Background levemente mais claro que os outros
  - Glow sutil verde no hover
- MELHORIA vs ATUAL: adicionar toggle anual/mensal (desconto de 20% anual), adicionar "Economize R$XX/ano" em badge

**Seção 8: Depoimentos**
- MELHORIA vs ATUAL: não usar carousel solo (1 depoimento por vez é fraco)
- Novo layout: grid de 3 cards (desktop) com destaque para 1 principal
- Card de depoimento: aspas decorativas (") em verde gradient, texto, avatar+nome+cargo, estrelas
- Glassmorphism em cada card
- Mobile: carousel horizontal (swipe), 1.2 cards visíveis (peek next card)

**Seção 9: CTA Final**
- Background: gradient mesh mais intenso que hero (verde 8-10% opacity)
- Headline: "Pronto para **revolucionar** seus treinos?"
- Subheadline com prova social inline
- CTA duplo: verde + ghost
- Trust badges
- MELHORIA: adicionar countdown sutil "Teste grátis expira em 7 dias" (sem ser aggressive, just informational)

**Seção 10: Footer**
- 4 colunas: Brand/Description, Produto, Empresa, Legal
- Logo com tagline
- Social icons (glass circle style)
- MELHORIA: adicionar mini-form de newsletter, adicionar badge de segurança/SSL
- Background: `--bg-elevated` (mais escuro que content)

### PÁGINA SOBRE
- Hero simplificado: headline "Sobre a VFIT" + subtítulo missão
- Seção: história da empresa (timeline vertical com glass nodes)
- Seção: valores (3 cards glass com ícone + título + descrição)
- Seção: equipe (se aplicável, cards com avatar + nome + cargo)
- CTA: "Conheça nosso produto →"

### PÁGINA CONTATO
- Split layout: formulário à esquerda, informações à direita
- Form: nome, email, mensagem (inputs glass style)
- Info: email, telefone, redes sociais, mapa (opcional)
- FAQ inline: "Perguntas frequentes antes de entrar em contato"

### PÁGINA FAQ
- Accordion glass style com ícone +/- animado
- Categorias em tabs: "Geral", "Planos", "Funcionalidades", "Técnico"
- Cada item: título bold + conteúdo que expande suavemente (max-height transition)
- CTA no final: "Não encontrou resposta? Fale conosco"

### PÁGINAS LEGAIS
- Layout limpo de texto longo
- Sidebar com sumário sticky (links âncora)
- Tipografia de leitura: 18px, leading relaxed, max-width 720px
- Última atualização visível em badge no topo

## F2) BLOG

### Página de Listagem
- Header: "Blog VFIT" + barra de busca glass
- Filtros: categorias em pill/tag horizontal scrollable
- Grid: 1 card featured (large, com imagem) + grid 3×n de cards menores
- Card de artigo: thumbnail 16:9 + categoria badge + título + excerpt (2 linhas) + data + reading time
- Glassmorphism nos cards
- Paginação: numbered com estilo glass
- SEO: breadcrumbs, structured data para Blog/BlogPosting

### Página de Artigo
- Layout: conteúdo central (max 720px) + sidebar sticky
- Sidebar: sumário do artigo (auto-generated), CTA contextual, cards relacionados
- Blocos recomendados:
  - Sumário com links âncora (auto-scroll)
  - CTA inline contextual: "Automatize isso com VFIT →" (dentro do conteúdo)
  - Bloco de autor: avatar + bio + social links (glass card)
  - Cards de artigos relacionados (3, no final)
  - Share buttons (sticky lateral em desktop, footer em mobile)
- Regras visuais: parágrafo 18px, imagens com radius 12px e shadow, code blocks com syntax highlighting dark
- SEO: schema Article, meta og:image, reading time, canonical

## F3) PAINEL AUTENTICADO

### Dashboard Principal
**Problemas atuais:**
- Cards de stat não têm sparkline (números sem contexto temporal)
- KPI Story section parece "debug mode" (texto raw como "Story completion: 0%")
- Muita informação no mesmo nível visual (tudo compete)
- Sidebar ocupa muito espaço com poucos itens

**Redesign visual:**
```
┌─────────┬────────────────────────────────────────────────────────┐
│ SIDEBAR │ ┌────────────────────────────────────────────────────┐ │
│         │ │ Bom dia, Victor 👋 · Terça, 26 Fev              │ │
│ [Logo]  │ │                                                    │ │
│         │ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │ │
│ Dash    │ │ │ Alunos   │ │ Treinos  │ │ Receita  │ │ Aval.  │ │ │
│ Alunos  │ │ │ 48 ↑12%  │ │ 156 ↑8%  │ │R$12.4k   │ │ 23 +5  │ │ │
│ Treinos │ │ │ [spark]  │ │ [spark]  │ │ ↑23%     │ │        │ │ │
│ Avaliações│ │ └──────────┘ └──────────┘ │ [spark]  │ └────────┘ │ │
│ Agenda  │ │                            └──────────┘            │ │
│         │ │ ┌────────────────────┐ ┌─────────────────────────┐ │ │
│ ─────── │ │ │ Receita Mensal     │ │ Atividade Recente       │ │ │
│ FINANC. │ │ │ [Area Chart]       │ │ MR Treino concluído  5m │ │ │
│ Finance │ │ │                    │ │ JS Pagamento ok      1h │ │ │
│         │ │ │                    │ │ AL Nova avaliação    3h │ │ │
│ ─────── │ │ └────────────────────┘ │ [Ver todas →]           │ │ │
│ Victor  │ │                        └─────────────────────────┘ │ │
│ Config  │ │ ┌──────────────────────────────────────────────────┐│ │
│ Sair    │ │ │ Agenda de Hoje: 3 aulas ........ [Ver agenda →] ││ │
│         │ │ │ 08:00 Maria Rosa · 10:00 João · 14:00 Ana      ││ │
│ ◀ Recol │ │ └──────────────────────────────────────────────────┘│ │
└─────────┴────────────────────────────────────────────────────────┘
```

**Redesign de fluxo UX:**
- Greeting personalizado com hora do dia
- Top 4 KPIs com sparklines (mini gráficos de tendência 7 dias)
- Área chart de receita (com período selecionável: 7d / 30d / 90d)
- Activity feed com avatar, ação, tempo relativo
- Agenda resumida do dia (expandível)
- Meta mensal com progress ring

**Empty states motivacionais:**
- Nenhum aluno: "Adicione seu primeiro aluno e comece a transformar vidas! →"
- Nenhum treino: "Crie seu primeiro treino com IA em 30 segundos →"
- Nenhuma receita: "Configure cobranças e receba automaticamente →"

### Alunos
**Problemas:** Lista repetitiva sem diferenciação visual, alunos "convidados" dominam a tela, sem ações rápidas.

**Redesign:**
- View toggle: Lista / Cards
- Cada aluno: avatar colorido (gerado por initials) + nome + status badge (ativo/inativo/convidado) + último treino + ações rápidas (chat, treino, avaliação)
- Filtros rápidos: Todos / Ativos / Inativos / Convidados (tabs glass)
- Busca com debounce
- Ação bulk: selecionar múltiplos → enviar treino / mensagem
- Card expandível: ao clicar, mostra perfil resumido inline (sem sair da lista)

### Treinos
- Lista de treinos criados com search + filtros
- Card de treino: nome + aluno + exercícios (count) + data + badge (rascunho/publicado/concluído)
- Ação principal: "Criar treino com IA" → abre wizard/modal com steps
- Preview do treino em drawer lateral

### Avaliações
**Problemas:** Tela atual é funcional mas os gauges/donuts no final parecem de template.

**Redesign:**
- Header do aluno: avatar + nome + data + fotos badge
- Métricas principais: cards glass com número grande + unidade + contexto
- Gráficos de progresso: timeline horizontal mostrando evolução (peso, gordura, massa magra over time)
- Gauges: redesign para radial progress bars mais clean (sem gradient multicolor clichê)
- Comparação antes/depois: slider visual de fotos (se disponível)
- CTA: "Gerar PDF" e "Compartilhar com aluno"

### Chat/Comunicação
- Layout split: lista de conversas à esquerda, chat à direita
- Bolhas de mensagem: glass style, alinhamento esquerda/direita
- Status: online/offline dot
- Enviar: input com attach + emoji + enviar
- Mobile: lista → drill-down para conversa

### Configurações
- Layout: sidebar de categorias + conteúdo
- Categorias: Perfil, Conta, Notificações, Integrações, Plano, Segurança
- Cada seção: agrupamento visual com glass cards
- Save: autosave com toast de confirmação

---

# G) MOBILE UX

## G.1 — Thumb Zone
- Bottom navigation bar (5 itens max): Dashboard, Alunos, + (criar), Agenda, Perfil
- O botão "+" central é verde, elevado, com glow — ação primária sempre acessível
- Ações frequentes (criar treino, add aluno) acessíveis com max 2 taps
- Ações destrutivas (deletar) nunca no thumb zone, sempre com confirmação

## G.2 — Targets Mínimos
- Touch target: 44px × 44px mínimo
- Botões: altura 48px
- Espaço entre itens clicáveis: mínimo 8px
- Links inline: padding expandido para 44px de hit area

## G.3 — Bottom Navigation
```
┌────────────────────────────────┐
│                                │
│      (conteúdo da página)      │
│                                │
├────────────────────────────────┤
│ 🏠    👥    ⊕    📅    👤    │
│ Home  Alunos [+] Agenda  Eu   │
└────────────────────────────────┘
```
- Glass background com blur
- Ícone ativo: verde + label visível
- Ícone inativo: cinza, sem label
- Badge de notificação: dot vermelho sobre ícone

## G.4 — Cards Compactos
- Padding reduzido: 12px-16px (vs 24px desktop)
- Stat cards: 2 por row (grid 2col)
- Feature cards: full-width stack
- Fonte reduzida: body 14px (vs 16px)

## G.5 — Formulários Mobile
- Labels acima do input (nunca floating label — causa confusão)
- Teclado numérico para campos de número (inputmode="numeric")
- Autocomplete em emails
- Botão submit sticky no bottom
- Validação inline em tempo real (não só no submit)

---

# H) MOTION SYSTEM

| Tipo de interação | Duração | Easing | Exemplo |
|-------------------|---------|--------|---------|
| Hover (cor, sombra) | 150-200ms | ease | Button hover, card hover |
| Hover (transform) | 200-300ms | cubic-bezier(0.4, 0, 0.2, 1) | Card lift, scale |
| Entrada de elemento | 300-400ms | cubic-bezier(0.4, 0, 0.2, 1) | Fade-in + slide-up |
| Saída de elemento | 200ms | cubic-bezier(0.4, 0, 1, 1) | Fade-out |
| Modal abrir | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Scale 0.96→1 + fade |
| Modal fechar | 200ms | cubic-bezier(0.4, 0, 1, 1) | Scale 1→0.96 + fade |
| Drawer abrir | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Slide from right |
| Toast | 400ms | cubic-bezier(0.4, 0, 0.2, 1) | Slide-up + fade |
| Count-up (números) | 800-1200ms | ease-out | Stat values |
| Stagger (lista) | 50-100ms delay | ease | Cards em grid |
| Page transition | 200-300ms | ease | Fade between routes |
| Skeleton pulse | 1.5s | ease-in-out infinite | Loading placeholder |
| Float (decorativo) | 3-5s | ease-in-out infinite | Hero elements |

### Regras Anti-Cansaço
1. Máximo 3 elementos animando simultaneamente no viewport
2. Animações de scroll: trigger apenas 1 vez (não re-trigger ao scroll up)
3. Float/pulse: apenas no hero, nunca dentro do dashboard
4. Nunca animar mais de 300ms para interações diretas (click, hover)
5. Toda animação deve ter prefers-reduced-motion media query

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# I) CONTEÚDO VISUAL

### Quando usar vídeo vs imagem
- Hero: imagem estática ou mockup CSS (melhor performance) — vídeo apenas como A/B test
- Feature showcase: screenshots estáticos do produto
- Testimonials: foto real do usuário (nunca stock)
- Blog: imagens relevantes, never generic stock fitness
- Dashboard: dados reais, gráficos renderizados (nunca imagem de gráfico)

### Direção fotográfica fitness premium
- **NÃO:** academias escuras com filtro azul, corpos exageradamente musculosos, clichê de halteres na mão
- **SIM:** profissional fitness com tablet/celular atendendo aluno, close-up de tela do app sendo usado, ambiente clean e bem iluminado, diversidade de corpos e idades
- Iluminação: natural/clean, nunca dramática. Tons neutros quentes.
- Enquadramento: 2/3 do frame mostra o contexto de uso (app em uso), não just a pessoa.

### Fornecedores sugeridos
- Unsplash (free): buscar "personal trainer technology"
- Pexels (free): bom para lifestyle fitness
- Envato Elements (~R$80/mês): mockups de device, templates
- Figma Community: mockup devices gratuitos para showcase

---

# J) COPYWRITING E UX WRITING

### Tom da marca
- **Motivacional** mas não gritante. "Transforme sua carreira" > "EXPLODA SEUS RESULTADOS!!!"
- **Profissional** mas acessível. "Automatize cobranças" > "Sistema de gestão financeira integrada"
- **Confiável** com dados. "2.500+ personais usam" > "Muitos confiam em nós"

### Microcopy

| Contexto | ❌ Ruim | ✅ Bom |
|----------|---------|--------|
| Botão de ação | Enviar | Criar meu treino |
| Estado vazio | Nenhum resultado | Nenhum aluno ainda. Convide o primeiro! → |
| Erro de campo | Inválido | Insira um email válido (ex: nome@email.com) |
| Sucesso | Salvo | Treino salvo com sucesso ✓ |
| Loading | Carregando... | Preparando seu dashboard... |
| Erro de servidor | Erro 500 | Algo deu errado. Tente novamente em instantes. |
| Delete confirm | Tem certeza? | Remover "João Silva" da sua lista? Isso não pode ser desfeito. |
| Upgrade prompt | Faça upgrade | Desbloqueie alunos ilimitados por R$49/mês → |

### Headlines por seção

| Seção | Headline |
|-------|----------|
| Hero | Transforme sua carreira com **Inteligência Artificial** |
| Recursos | Tudo que você precisa, **nada que não precisa** |
| Como funciona | Comece em **3 passos simples** |
| Pricing | Escolha o plano **ideal para você** |
| Testimonials | Quem usa, **recomenda** |
| CTA Final | Pronto para **revolucionar** seus treinos? |
| Login | Bem-vindo de volta. **Acesse sua conta.** |
| Dashboard | Bom dia, [nome] 👋 |

---

# K) PERFORMANCE

### Core Web Vitals — Metas

| Métrica | Meta | Estratégia |
|---------|------|-----------|
| LCP | < 2.0s | Hero image como CSS gradient (não imagem), fontes preloaded, above-fold sem JS dependency |
| INP | < 150ms | Debounce em inputs, delegação de eventos, evitar layout thrashing |
| CLS | < 0.05 | Dimensões explícitas em imagens, font-display: swap + size-adjust, skeleton com tamanho fixo |

### Imagens
- Formato: WebP (fallback JPEG) para fotos, SVG para ícones/logos, AVIF se suportado
- Tamanhos: srcset com 3 breakpoints (640w, 1024w, 1440w)
- Compressão: quality 80 para WebP
- Loading: lazy para below-fold, eager para hero
- Aspect ratio: sempre definido via CSS aspect-ratio

### Fontes
- Preload Inter (woff2) com link rel="preload"
- Subsetear apenas latin (remover cirílico, grego etc)
- font-display: swap
- Fallback stack: -apple-system, BlinkMacSystemFont, sans-serif
- Considerar font-size-adjust para evitar CLS durante swap

### CSS/JS Budget
- CSS total: < 60KB gzipped
- JS total (first load): < 100KB gzipped
- Backdrop-filter: isolar em camadas com will-change: transform

### Checklist por release
- [ ] Lighthouse Performance > 90
- [ ] LCP < 2.0s
- [ ] INP < 150ms
- [ ] CLS < 0.05
- [ ] Todas imagens em WebP com lazy loading
- [ ] Fontes preloaded
- [ ] CSS crítico inlined
- [ ] JS code-split por rota

---

# L) ACESSIBILIDADE

### Contraste mínimo
- Texto normal: 4.5:1 ratio mínimo (WCAG AA)
- Texto grande (18px+ bold): 3:1
- `--text-primary` (#F0F4F8) sobre `--bg-base` (#050A12) = ratio ~17:1 ✅
- `--text-secondary` (#8899AA) sobre `--bg-base` (#050A12) = ratio ~5.5:1 ✅
- `--brand-500` (#00D47F) sobre `--bg-base` (#050A12) = ratio ~8.5:1 ✅
- `--text-muted` (#4A5568) sobre `--bg-base` = verificar, pode precisar ajuste

### Combinações proibidas
- Verde sobre verde (brand sobre success-subtle)
- Texto muted sobre surface-3 (contraste insuficiente)
- Placeholder sobre glass-bg (contraste muito baixo — usar border para indicar campo)

### Navegação por teclado
- Tab order lógico em todos os formulários
- Skip-to-content link no topo
- Escape fecha modais/drawers
- Arrow keys navegam em tabs e dropdowns
- Enter e Space ativam botões

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

/* Remove focus ring de mouse clicks */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Checklist AA
- [ ] Todos inputs com label associada (for/id)
- [ ] Todos ícones decorativos com aria-hidden="true"
- [ ] Todos ícones funcionais com aria-label
- [ ] Headings em ordem (h1 → h2 → h3, sem pular)
- [ ] Formulários com error summary
- [ ] Imagens com alt text
- [ ] Color não é único indicador (ex: error = vermelho + ícone + texto)
- [ ] Tabelas com th e scope

---

# M) SEO

### Estrutura técnica
- Cada página: title tag único, meta description, og:title, og:description, og:image
- Home: "VFIT — Plataforma #1 para Personal Trainers com IA"
- Schema.org: Organization, SoftwareApplication, FAQPage (na FAQ), BlogPosting (nos artigos)
- Sitemap XML atualizado automaticamente
- Robots.txt: permitir crawling de todas páginas públicas

### Blog SEO
- URL structure: /blog/[slug]
- Breadcrumbs com schema
- Internal linking: cada artigo deve linkar para 2-3 artigos relacionados
- Table of contents para artigos longos (schema markup)
- Author page com schema Person

### Performance SEO
- Core Web Vitals green (conforme seção K)
- HTTPS everywhere
- Mobile-friendly (responsive)
- Hreflang se expandir para outros idiomas

---

# N) ROADMAP DE IMPLEMENTAÇÃO

## Fase 1: Foundation (Semana 1-2)
**Objetivo:** Design system tokens + componentes base
- Definir todas CSS variables (cores, tipografia, espaçamento, radius, sombras)
- Implementar glass-card, button, input, badge componentes
- Criar Storybook ou playground para validação visual
- **Entregáveis:** Arquivo de tokens CSS, 8 componentes base implementados
- **Esforço:** 3-5 dias dev

## Fase 2: Hero + Header (Semana 2-3)
**Objetivo:** Impacto visual imediato na home
- Redesign header (sticky, glass on scroll, logo rules)
- Implementar hero "Dashboard Flutuante" com glassmorphism
- Prova social com count-up animation
- Mobile responsive hero
- **Entregáveis:** Header + Hero completos
- **Esforço:** 3-4 dias dev
- **Dependência:** Fase 1 (tokens)

## Fase 3: Homepage Completa (Semana 3-4)
**Objetivo:** Toda a home com visual premium
- Seções: recursos, como funciona, feature showcase, pricing, testimonials, CTA, footer
- Todos usando glass cards e design system
- Scroll animations (intersection observer)
- Performance audit
- **Entregáveis:** Homepage completa
- **Esforço:** 5-7 dias dev
- **Dependência:** Fase 2

## Fase 4: Login + Auth (Semana 4-5)
**Objetivo:** Primeira impressão premium na autenticação
- Login page redesign: gradient mesh background + glass form card
- Estados: loading, error, success com microinterações
- Mobile-first
- **Entregáveis:** Login/Registro/Reset password
- **Esforço:** 2-3 dias dev

## Fase 5: Dashboard + Painel (Semana 5-8)
**Objetivo:** Experiência premium na área autenticada
- Dashboard: stat cards com sparklines, activity feed, agenda
- Alunos: nova lista com filtros + ações rápidas
- Treinos: lista + wizard de criação
- Avaliações: redesign de métricas + charts
- Sidebar: collapsible, glass style
- **Entregáveis:** Painel principal completo
- **Esforço:** 10-15 dias dev
- **Dependência:** Fase 1 + 4

## Fase 6: Polish + Blog + SEO (Semana 8-10)
**Objetivo:** Acabamento e otimização
- Blog templates
- Páginas institucionais (sobre, contato, FAQ, legais)
- SEO audit completo
- Performance audit (Lighthouse 90+)
- Accessibility audit (WAVE, axe-core)
- **Entregáveis:** Site completo
- **Esforço:** 5-7 dias dev

### Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Backdrop-filter lento em mobile | Média | Alto | Fallback com background sólido semi-transparente |
| Inconsistência visual entre seções | Alta | Médio | Storybook + design review a cada fase |
| CLS durante font loading | Média | Médio | Preload + font-display: swap + size-adjust |
| Scope creep no dashboard | Alta | Alto | Definir escopo mínimo por módulo antes de começar |

---

# SEÇÃO 3) FORMATO DE SAÍDA FINAL

## 1) TOP 20 AÇÕES IMEDIATAS

| # | Ação | Impacto | Tempo |
|---|------|---------|-------|
| 1 | Definir CSS variables para todos tokens (cor, tipo, espaço) | ★★★★★ | 2h |
| 2 | Criar componente glass-card com backdrop-filter | ★★★★★ | 1h |
| 3 | Redesign header: transparente → glass on scroll | ★★★★★ | 3h |
| 4 | Reduzir uso do verde para max 15% da superfície | ★★★★★ | 2h |
| 5 | Hero: implementar gradient mesh background | ★★★★★ | 2h |
| 6 | Hero: redesign headline com text-gradient no "IA" | ★★★★☆ | 1h |
| 7 | Hero: adicionar sparklines nos stat cards | ★★★★☆ | 3h |
| 8 | Implementar 3 níveis de surface color (depth) | ★★★★☆ | 1h |
| 9 | Refazer pricing card central com borda gradiente + glow | ★★★★☆ | 2h |
| 10 | Login page: gradient mesh + glass form card | ★★★★☆ | 3h |
| 11 | Implementar button component (primary gradient + glow) | ★★★★☆ | 1h |
| 12 | Implementar badge component (glass variants) | ★★★☆☆ | 1h |
| 13 | Adicionar hover states em TODOS cards (lift + border) | ★★★☆☆ | 2h |
| 14 | Implementar skeleton loading para dashboard | ★★★☆☆ | 3h |
| 15 | Font preloading + font-display: swap | ★★★☆☆ | 30m |
| 16 | Testimonials: trocar carousel solo por grid 3-col | ★★★☆☆ | 2h |
| 17 | Feature section: adicionar screenshots reais | ★★★☆☆ | 3h |
| 18 | Footer: dark differentiation + social glass icons | ★★☆☆☆ | 1h |
| 19 | Empty states com copy motivacional | ★★☆☆☆ | 2h |
| 20 | Adicionar prefers-reduced-motion em todas animações | ★★☆☆☆ | 1h |

## 2) TOP 15 ERROS FATAIS A EVITAR

| # | Erro | Por que é fatal |
|---|------|----------------|
| 1 | Usar verde em mais de 15% da superfície visual | Mata a hierarquia. Quando tudo é verde, nada é destaque. |
| 2 | Backdrop-filter sem -webkit- prefix | Quebra em Safari (40% dos mobile users no Brasil). |
| 3 | Glassmorphism sem fallback | Em browsers sem suporte, cards ficam transparentes e ilegíveis. |
| 4 | Animações sem prefers-reduced-motion | Gatilho de motion sickness em 30% dos usuários. |
| 5 | Inputs sem label associada | Inacessível. Screenreaders não conseguem usar. |
| 6 | Focus states removidos | Quebra navegação por teclado. Violação WCAG. |
| 7 | Imagens sem dimensões explícitas | CLS (layout shift) destrói Core Web Vitals. |
| 8 | Fontes carregando sem preload | FOIT de 1-3 segundos = tela em branco. |
| 9 | Cards todos com mesma altura/peso visual | Zero hierarquia = zero escaneabilidade. |
| 10 | Dark theme com preto puro (#000000) | Harsh para os olhos. Usar #050A12 ou similar. |
| 11 | Sombras box-shadow em dark theme sem ajuste | Sombras padrão são invisíveis em dark. Usar inner glow + border sutil. |
| 12 | Mobile: mesma tipografia que desktop | Texto de 72px no hero mobile = 2 palavras por linha. Escalar. |
| 13 | Carousel como única forma de ver testimonials | Esconde 80% da prova social. Usar grid. |
| 14 | Toast sem timeout auto | Usuário não consegue fechar = frustração. 5s max. |
| 15 | Inconsistência de radius entre componentes | O sinal mais claro de "template colado" é radius 4px aqui, 20px ali. |

## 3) GUIA DE CONSISTÊNCIA DA MARCA

### Logo — Regras

**Variações disponíveis:**
- Logo completa: ícone "IA" (squircle verde) + "VFIT" (texto)
- Ícone isolado: "IA" squircle para favicon, app icon, loading
- Logo texto: "VFIT" sem ícone (para espaços apertados)

**Uso por contexto:**

| Contexto | Variação | Tamanho mínimo |
|----------|----------|---------------|
| Header desktop | Logo completa | Ícone 32px + texto |
| Header mobile | Ícone isolado | 32px |
| Header scroll (compacto) | Logo completa (escala 90%) | Ícone 28px + texto |
| Favicon | Ícone isolado simplificado | 32×32 e 16×16 |
| App icon (PWA) | Ícone + "PERSONAL" | 512×512 fonte |
| Fundo escuro | Logo branca/verde (default) | — |
| Fundo claro | Logo verde/escura | — |
| Loading screen | Ícone isolado + pulse animation | 48-64px |

**Área de proteção:** Mínimo 50% da largura do ícone em cada direção (sem texto/elemento invadindo).

**Proibido:**
- Distorcer proporções
- Aplicar drop shadow colorido
- Colocar sobre fundo verde (se confunde)
- Reduzir abaixo de 24px de ícone
- Mudar as cores do gradiente verde

**Microinteração de loading:**
- Ícone "IA" aparece com scale 0.8→1.0 (200ms, ease-out)
- Dot verde no canto superior direito pulsa 1 vez
- Fade-in do restante da página

## 4) BLUEPRINT DA HOMEPAGE IDEAL

```
[HEADER] Logo | Nav | Instalar | Entrar | CTA verde
  ↓ scroll: bg glass + shadow

[HERO] full viewport
  Overline pill: "● Plataforma #1..."
  H1: "Transforme sua carreira com Inteligência Artificial"
  Subtitle: descrição concisa
  [CTA verde] [CTA ghost →]
  Trust: ✓ 7 dias · ✓ Sem cartão · ✓ Cancele
  Stats: 2.500+ | 45k+ | 98%
  Dashboard mockup (glassmorphism, 3 camadas flutuantes)
  BG: gradient mesh verde/azul sutil

[RECURSOS] padding-top: 96px
  Overline: RECURSOS
  H2: "Tudo que você precisa, nada que não precisa"
  Grid 3×2: glass cards com ícone + título + descrição

[COMO FUNCIONA] padding-top: 96px
  Overline: COMO FUNCIONA
  H2: "Comece em 3 passos simples"
  3 steps: numerados com linha de conexão gradient

[FEATURE SHOWCASE] padding-top: 96px (NOVO)
  Alternating: screenshot + texto | texto + screenshot
  2-3 features com prova visual real

[PRICING] padding-top: 96px
  Overline: PLANOS
  H2: "Escolha o plano ideal para você"
  Toggle: Mensal / Anual
  3 cards glass: Free | Pro (highlight) | Enterprise

[TESTIMONIALS] padding-top: 96px
  Overline: DEPOIMENTOS
  H2: "Quem usa, recomenda"
  Grid 3-col de testimonial cards

[CTA FINAL] padding-top: 96px
  BG: gradient mesh intenso
  H2: "Pronto para revolucionar seus treinos?"
  [CTA verde] [CTA ghost]
  Trust badges

[FOOTER]
  4 colunas: Brand | Produto | Empresa | Legal
  Social icons | Copyright
```

## 5) BLUEPRINT DO DASHBOARD IDEAL

```
[SIDEBAR] 260px, collapsible → 72px
  Logo VFIT
  ───
  PRINCIPAL
  · Dashboard (active: bg-surface-2, left border verde)
  · Alunos (badge count se pendentes)
  · Treinos
  · Avaliações
  · Agenda
  ───
  FINANCEIRO
  · Dashboard Financeiro
  ───
  (bottom)
  Avatar + Nome truncated
  · Configurações
  · Sair
  · ◀ Recolher

[TOP BAR] sticky
  Breadcrumb: VFIT / Dashboard
  [Search ⌘K] [Theme toggle] [Notifications bell] [Avatar dropdown]

[CONTENT]
  Greeting: "Bom dia, Victor 👋"
  Subtitle: "Terça, 26 Fev · 3 aulas hoje"

  [STAT CARDS] grid 4-col
  | Alunos: 48 ↑12% [sparkline] |
  | Treinos/sem: 156 ↑8% [sparkline] |
  | Receita: R$12.4k ↑23% [sparkline] |
  | Avaliações: 23 +5 |

  [MAIN ROW] grid 2-col (60/40)
  | Receita Mensal [Area Chart]      | Atividade Recente [Feed list] |
  | Período: 7d/30d/90d tabs         | Avatar + ação + tempo relativo |
  |                                   | "Ver todas →"                 |

  [SECONDARY ROW] grid 2-col (50/50)
  | Agenda Hoje                      | Meta Mensal                   |
  | 3 próximas aulas timeline        | Progress ring 82% +label      |
  | "Ver agenda completa →"          | "Faltam 8 aulas para meta"    |
```

## 6) PLANO DE 30 DIAS

| Semana | Foco | Entregáveis |
|--------|------|-------------|
| Semana 1 | Foundation | Tokens CSS completos, 8 componentes base (glass-card, button, input, badge, stat-card, modal, toast, empty-state), playground de validação |
| Semana 2 | Header + Hero + CTA | Header responsive com scroll behavior, Hero section completa com glassmorphism + parallax, Seção CTA final, Font preloading |
| Semana 3 | Homepage body + Login | Seções: recursos, como funciona, pricing, testimonials, footer. Login page redesign. Scroll animations. |
| Semana 4 | Dashboard + Polish | Dashboard redesign com stat cards + sparklines + charts. Alunos list redesign. Performance audit. Accessibility audit. Bug fixes. |

## 7) DEFINIÇÃO DE PRONTO (DoD)

Uma UI é considerada "pronta para produção premium" quando:

- [ ] Usa exclusivamente tokens do design system (0 valores hardcoded)
- [ ] Glassmorphism funciona em Chrome, Firefox, Safari, Edge
- [ ] Fallback sólido existe para browsers sem backdrop-filter
- [ ] Todos estados implementados: default, hover, focus, active, disabled, loading, error, empty
- [ ] Responsivo em 5 breakpoints: 375px, 640px, 768px, 1024px, 1280px
- [ ] Touch targets ≥ 44px em mobile
- [ ] Contraste WCAG AA em todo texto
- [ ] Focus visible em todo elemento interativo
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] CLS < 0.05
- [ ] LCP < 2.0s
- [ ] Sem console errors
- [ ] Testado com prefers-reduced-motion
- [ ] Copy aprovado (sem placeholders, sem lorem ipsum)
- [ ] Screenshots de validação em Chrome + Safari mobile

## 8) TABELA DE MÉTRICAS DE SUCESSO

| Métrica | Baseline (estimado) | Meta 30d | Meta 90d | Como medir |
|---------|---------------------|----------|----------|-----------|
| **Conversão** | | | | |
| Taxa visitante → trial | ~2% | 3.5% | 5% | Analytics funnel |
| Taxa trial → pago | ~15% | 20% | 30% | Cohort analysis |
| Bounce rate home | ~60% | 45% | 35% | GA4 |
| **Retenção** | | | | |
| DAU/MAU | ~20% | 30% | 40% | Product analytics |
| Churn mensal | ~8% | 6% | 4% | Billing data |
| **Engajamento** | | | | |
| Sessões/semana (personal) | ~3 | 4 | 5+ | Analytics |
| Features usadas/sessão | ~2 | 3 | 4 | Event tracking |
| Treinos criados/semana | ~10 | 15 | 20 | Internal metrics |
| **Velocidade percebida** | | | | |
| Lighthouse Performance | ~65 | 85 | 92+ | Lighthouse CI |
| LCP | ~3.5s | 2.0s | 1.5s | CrUX |
| CLS | ~0.15 | 0.05 | 0.02 | CrUX |
| **Satisfação** | | | | |
| NPS | — | 40 | 60+ | In-app survey |
| CSAT (design) | — | 4.0/5 | 4.5/5 | Feedback widget |
| Support tickets/100 users | — | < 5 | < 3 | Help desk |

---

# PROMPT COMPLETO PARA COPILOT/CURSOR

Use o prompt abaixo para gerar código com IA (Copilot, Cursor, Claude, etc.) mantendo consistência total:

```
Você é um frontend developer senior implementando o redesign premium do VFIT, um SaaS fitness para personal trainers.

REGRAS OBRIGATÓRIAS:
1. SEMPRE usar CSS custom properties (nunca valores hardcoded de cor, tamanho ou espaço)
2. DARK THEME: fundo base #050A12, surfaces escalonadas (#0B1221, #111B2E, #182640)
3. GLASSMORPHISM: todo card usa backdrop-filter: blur(24px) + bg rgba(11,18,33,0.60) + border rgba(255,255,255,0.08) + border-radius 16px
4. VERDE BRAND: #00D47F como primário, gradiente com #00F5A0 para CTAs. USO MÁXIMO 15% da superfície.
5. TIPOGRAFIA: Inter para tudo. Display 800 weight para headlines com tracking -0.025em. Body 400-500.
6. BOTÃO PRIMÁRIO: background gradient(135deg, #00D47F, #00F5A0), shadow glow rgba(0,212,127,0.30), hover: translateY(-1px) + glow aumentado
7. BOTÃO SECUNDÁRIO: bg glass + border rgba(255,255,255,0.10), hover: lighten
8. TODOS elementos interativos: transition 200ms ease, hover state, focus-visible outline 2px solid #00D47F offset 2px
9. INPUTS: height 44px, bg #0B1221, border rgba(255,255,255,0.10), focus ring verde
10. BADGES: border-radius 9999px, bg com 12% alpha da cor, font 12px semibold
11. SOMBRAS: sm(0 2px 4px rgba(0,0,0,0.3)), md(0 4px 12px rgba(0,0,0,0.4)), lg(0 8px 24px rgba(0,0,0,0.5))
12. ESPAÇAMENTO: múltiplos de 4px. Section gap: 96px. Card padding: 24px. Card gap: 16px.
13. MOBILE-FIRST: todo layout responsivo com breakpoints em 640/768/1024/1280px
14. ACESSIBILIDADE: contraste WCAG AA, aria-labels, focus states, prefers-reduced-motion
15. PERFORMANCE: lazy loading em imagens, will-change em camadas animadas, font-display: swap

STACK: React/Next.js + Tailwind CSS (ou CSS modules) + Framer Motion para animações.

Ao criar qualquer componente, SEMPRE incluir:
- Variante default, hover, focus, disabled
- Versão mobile
- Fallback sem backdrop-filter
- Aria attributes quando aplicável
```

---

*Plano gerado para VFIT — Versão 1.0 — Fevereiro 2026*
*Este documento é o guia definitivo para transformar VFIT em um produto visualmente premium de classe mundial.*

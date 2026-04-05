# 04 — Plano de Melhorias por Página

> Recomendações detalhadas para cada página do site público VFIT  
> VFIT | Abril 2026

---

## 🏠 HOME (/)

### Hero Section

**Objetivo:** Converter em < 5 segundos — personal trainer precisa entender que isso é pra ele/ela

**Melhorias:**
1. **Manter** a headline animada "E V O L U IA" — diferencial criativo único, não remover
2. **Adicionar mockup do app** (mobile + tablet) flutuando à direita do texto no desktop
3. **Fundo:** Adicionar mesh gradient sutil — radial gradient verde escuro sobre preto
4. **Social proof badges** — redesenhar como chips horizontais com ícone + número
5. **Contadores:** Animar apenas quando entram no viewport via `IntersectionObserver`
6. **CTA secundário:** "Ver demonstração" com ícone de play (vídeo curto de 60s)

```css
/* Hero mesh gradient */
.hero {
  background:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(22,163,74,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 80% at 80% 20%, rgba(22,163,74,0.06) 0%, transparent 50%),
    var(--color-bg);
}
```

**Badge de credibilidade (novo):**
```html
<div class="hero-badge">
  <span class="badge badge-green">🏆 #1 Para Personal Trainers</span>
  <span class="hero-social-proof">
    <span class="counter" data-target="2500">0</span>+ personais ativos
  </span>
</div>
```

---

### Features Section

**Melhorias:**
1. **Layout assimétrico** em vez de 3 colunas idênticas:
   - 1 card grande (feature principal — Treinos com IA) ocupando 2/3 da largura
   - 2 cards menores ao lado
2. **Screenshots reais** dentro de cada card (GIF animado ou imagem estática)
3. **Ícones Lucide** padronizados — um por feature
4. **Badges unificados** usando o sistema definido em `02-DESIGN-SYSTEM.md`
5. **Card "Em Breve"** para features futuras com badge `badge-amber`

```css
.features-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--space-4);
}
.feature-card-main { grid-row: span 2; }

@media (max-width: 768px) {
  .features-grid { grid-template-columns: 1fr; }
  .feature-card-main { grid-row: span 1; }
}
```

---

### Como Funciona (3 Passos)

**Melhorias:**
1. Adicionar **linha conectora pontilhada** entre os 3 passos
2. Cada passo com **screenshot ou animação** do produto correspondente
3. Animação de entrada staggered (passo 1 → 2 → 3 com 100ms de delay)
4. Adicionar **tempo estimado** em cada passo: "Leva 2 minutos"

```css
.steps-connector {
  position: absolute;
  top: 24px;
  left: calc(50% + 24px);
  right: calc(-50% + 24px);
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    var(--vfit-green-500) 0px, var(--vfit-green-500) 8px,
    transparent 8px, transparent 16px
  );
  opacity: 0.4;
}
```

---

### Pricing Section

**Melhorias:**
1. **Toggle mensal/anual** mais proeminente — acima dos cards, não entre eles
2. **Tabela comparativa completa** abaixo dos cards (feature por feature)
3. **Garantia explícita**: "✓ 7 dias de garantia nos planos pagos"
4. **FAQ de pricing** inline: 3 perguntas mais comuns logo abaixo da seção
5. Alinhar nomes dos planos com o FAQ (urgente!)
6. Card Pro/Pro+: destacar mais — aumentar `border-color` e adicionar `box-shadow: var(--shadow-glow)`

**Tabela comparativa (estrutura):**

```html
<table class="pricing-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Grátis</th>
      <th>Pro</th>
      <th class="highlighted">Pro+</th>
      <th>Max</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Alunos ativos</td><td>5</td><td>30</td><td>100</td><td>Ilimitado</td></tr>
    <tr><td>Treinos com IA</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td>Cobranças automáticas</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td></tr>
    <tr><td>App white-label</td><td>❌</td><td>❌</td><td>❌</td><td>✅</td></tr>
    <tr><td>Relatórios avançados</td><td>❌</td><td>Básico</td><td>Completo</td><td>Completo</td></tr>
  </tbody>
</table>
```

---

### Testimonials Section

**Melhorias:**
1. **Avatar system:** círculo colorido com inicial do nome — cor baseada no hash do nome
2. **Controles acessíveis:** setas `←` `→` visíveis + dots indicadores + navegação por teclado
3. **Rating visual:** 5 estrelas preenchidas em cada depoimento
4. **Vídeo-depoimento** de 1 personal trainer (se disponível) como card especial

```javascript
// Sistema de cor do avatar baseado no nome
function getAvatarColor(name) {
  const colors = ['#16a34a','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
```

---

### Gamificação Section

**Melhorias:**
1. **Virar seção destaque** — tem diferencial único, merece mais espaço
2. **Animação de entrada** nos cards de ranking (stagger com 50ms delay por item)
3. **Tooltip no hover** de cada badge de conquista: descrição de como desbloquear
4. Dados reais ou disclaimer visível: "Ranking atualizado em tempo real"

---

### Blog Section

**Melhorias:**
1. Cards com **imagem de capa** e **tempo de leitura**
2. **Filtro por categoria**: Tecnologia | Gestão | Retenção | Negócios
3. **Artigo destaque** (1 card grande) + grade de 2-3 cards menores
4. **CTA de newsletter** no final: "Receba dicas semanais para personal trainers"

---

### Sobre / Quem Somos

**Melhorias:**
1. **Foto do fundador** com bio curta (3-4 linhas)
2. **Timeline** da história do produto
3. **Stack tecnológica** mantida — é diferencial de credibilidade
4. **Número de CNPJ** ainda mais visível

---

### Footer

**Melhorias:**
1. Atualizar email para `contato@vfit.app`
2. Adicionar **newsletter** (campo de email simples)
3. Adicionar **YouTube** como quarto ícone social
4. Mover badges de confiança (CREF, SSL, LGPD) para linha mais visível

---

## 🔐 LOGIN (/login)

Ver arquivo completo: `07-LOGIN-AUTH-PAGES.md`

**Resumo das melhorias:**
- Layout split-screen (brand panel + form panel)
- Formulário limpo com validação inline
- Loading state no botão de submit
- Links para "Esqueci senha" e "Criar conta"

---

## 📝 CADASTRO (/register ou /welcome)

**Fluxo em 3 etapas:**

```
Step 1: Tipo de conta
  ┌──────────────┐  ┌──────────────┐
  │  Personal    │  │    Aluno     │
  │  Trainer     │  │              │
  └──────────────┘  └──────────────┘

Step 2: Dados básicos
  - Nome completo
  - Email
  - Senha (com indicador de força)
  - CREF (se Personal Trainer)
  - Telefone (opcional)

Step 3: Plano
  - Cards dos planos (Grátis pré-selecionado)
  - "Começar grátis" / "Ir para pagamento"
```

**CSS da progress bar:**
```css
.steps-progress {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}
.step-dot {
  height: 4px;
  border-radius: var(--radius-full);
  flex: 1;
  background: var(--color-surface-3);
  transition: background var(--transition);
}
.step-dot.active  { background: var(--vfit-green-500); }
.step-dot.done    { background: var(--vfit-green-700); }
```

---

## 💳 PRICING (/pricing)

**Página independente de pricing** (além da seção na home):

```
Estrutura:
1. Hero: "Planos para todo tipo de personal"
2. Toggle mensal/anual (destaque economia anual em %)
3. Cards dos 4 planos
4. Tabela comparativa completa
5. FAQ de pricing (6-8 perguntas)
6. Garantia: "7 dias ou seu dinheiro de volta"
7. CTA final: "Começar grátis agora"
```

---

## 📰 BLOG (/blog)

**Estrutura da listagem:**
```
Header:
  - Título: "Blog VFIT"
  - Subtítulo: "Dicas para personal trainers crescerem seu negócio"
  - Barra de pesquisa

Filtros:
  - Todos | Tecnologia | Gestão | Retenção | Negócios | IA

Layout:
  - 1 artigo destaque (full-width, imagem grande)
  - Grade 3 colunas (artigos recentes)
  - Sidebar: Categorias + Mais lidos + Newsletter

Card de artigo:
  - Imagem de capa (16:9)
  - Categoria (badge)
  - Título
  - Resumo (2 linhas)
  - Autor + Data + Tempo de leitura
```

---

## 📄 ARTIGO (/blog/[slug])

**Estrutura de artigo:**
```
- Breadcrumb: Blog > Categoria > Título
- Hero com imagem de capa (full-width)
- Metadata: Autor | Data | Tempo de leitura | Categoria
- Índice de conteúdo (para artigos > 1500 palavras)
- Conteúdo com CTA inline no meio
- Artigos relacionados (3)
- CTA final: "Experimente o VFIT gratuitamente"
- Comentários (Disqus ou sistema próprio)
```

---

## 📞 CONTATO (/contato)

**Estrutura recomendada:**
```
1. FAQ rápido (3 perguntas mais comuns) — resolve 80% antes do formulário
2. Formulário: Nome, Email, Assunto (select), Mensagem
3. Alternativas: WhatsApp | Email | Instagram
4. Tempo de resposta esperado: "Respondemos em até 24h úteis"
```

---

## ⚖️ TERMOS E PRIVACIDADE

- Atualizar nome "IA Personal" → "VFIT" em todos os documentos
- Verificar CNPJ e razão social correta
- Garantir conformidade LGPD
- Adicionar data de última atualização no topo

---

## 📊 Impacto Estimado por Melhoria

| Melhoria | Esforço | Impacto | Prioridade |
|---------|---------|---------|------------|
| Mockup do produto no Hero | Médio | 🔴 Alto | Semana 1 |
| Redesign Login | Médio | 🔴 Alto | Semana 1 |
| Unificar nomes dos planos | Baixo | 🔴 Alto | Imediato |
| Tabela comparativa pricing | Baixo | 🟡 Médio | Semana 2 |
| Avatar system testimonials | Baixo | 🟡 Médio | Semana 2 |
| Layout assimétrico features | Alto | 🟡 Médio | Semana 3 |
| Animações de gamificação | Médio | 🟢 Baixo | Semana 3 |
| Blog com 10 artigos | Alto | 🔴 Alto (SEO) | Semana 4 |

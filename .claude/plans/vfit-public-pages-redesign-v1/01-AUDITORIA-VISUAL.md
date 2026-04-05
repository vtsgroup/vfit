# 01 — Auditoria Visual Completa

> Diagnóstico do site público atual (iapersonal.app.br)  
> Análise seção a seção + problemas globais  
> VFIT | Abril 2026

---

## 🔴 Problemas Críticos (Alta Prioridade)

### 1. Identidade de Marca Fragmentada
- Nome "IA Personal" ainda aparece em: domínio `iapersonal.app.br`, email `contato@iapersonal.app.br`, FAQ Q1/Q2, e meta title
- Hero usa "VFIT+" como logo mas domínio é `iapersonal.app.br` — confusão de marca
- FAQ Q2 menciona planos "Trainer, Profissional, Max" mas pricing mostra "Grátis, Pro, Pro+, Max" — inconsistência interna grave
- Footer mostra "© 2026 VFIT — VTS DEVELOPMENT" ✅ mas FAQ e outras seções ainda divergem

### 2. Tipografia Inconsistente
- Hero usa tipografia all-caps animada (estilo editorial forte) ✅
- Seções internas usam estilos mais genéricos sem a mesma personalidade
- Falta hierarquia visual clara entre h2 de seção e subheadings
- Sem fonte de display documentada — parece usar fonte padrão do sistema

### 3. Sistema de Cores Não Documentado
- Site usa verde/teal como cor primária (bom) mas sem tokens CSS formais
- Botões CTA inconsistentes: alguns verdes, alguns brancos, sem padrão claro
- Dark mode não implementado — produto de fitness/tech em 2026 precisa ter
- Falta paleta definida para estados: hover, active, disabled, error, success

### 4. Logo Atual — Problemas
- "VFIT+" em texto simples no nav — não é uma logo real
- Elemento animado "E V O L U IA" no hero é criativo mas não escalável
- Sem favicon customizado visível na aba do browser
- Sem brand mark isolado (símbolo sem texto) para uso em app, favicon e ícones

### 5. Performance e Acessibilidade
- Imagens sem `width`/`height` declarados → causa CLS (Cumulative Layout Shift)
- Carrossel de testimonials sem controles acessíveis (`aria-labels`, `aria-controls`)
- Contadores animados iniciam do 0 mesmo fora do viewport — causa desconfiança
- Formulários sem labels associados visíveis

---

## 📋 Auditoria Seção a Seção

### NAVBAR

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Logo | ⚠️ | Texto "VFIT+" sem marca visual | Criar SVG logo (ver `05-LOGO-ICONS.md`) |
| Links de nav | ✅ | Estrutura ok | Adicionar indicador de página ativa |
| Botão ENTRAR | ⚠️ | Estilo ghost pouco visível | Aumentar contraste ou usar `outline` estilizado |
| Botão COMEÇAR GRÁTIS | ✅ | CTA visível | Manter, refinar hover state |
| Responsividade mobile | ⚠️ | Menu hamburger não verificado | Implementar bottom nav no mobile |
| Scroll behavior | ⚠️ | Navbar sem efeito de scroll | Adicionar `backdrop-filter: blur()` ao fazer scroll |

### HERO

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Headline animada | ✅ | Criativo e diferenciado | Manter e refinar — diferencial único |
| Subtítulo | ✅ | Copy forte | Ok |
| CTAs | ✅ | Dois botões bem posicionados | Ok |
| Social proof (badges) | ⚠️ | Visual genérico | Estilizar como chips/tokens visuais |
| Contadores | ⚠️ | Iniciam em 0 mesmo fora do viewport | Animar apenas após `IntersectionObserver` |
| Background | ⚠️ | Fundo escuro sólido | Adicionar textura sutil ou mesh gradient verde |
| Mockup do produto | ❌ | Ausente — visitante não sabe como o app parece | Adicionar screenshot/mockup flutuante |

### FEATURES (A PLATAFORMA)

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Tabs Para Personals / Alunos | ✅ | Boa segmentação de audiência | Ok |
| Cards de feature | ⚠️ | Layout genérico 3-col idênticos | Variar tamanhos — feature principal maior |
| Badges (ILIMITADO, NOVO) | ⚠️ | Inconsistentes visualmente | Criar sistema de badge unificado |
| Ícones | ❌ | Não padronizados | Usar Lucide Icons consistentemente |
| Screenshots dentro dos cards | ❌ | Ausentes | Adicionar GIF ou screenshot por feature |

### COMO FUNCIONA (3 PASSOS)

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Numeração visual | ✅ | Clara | Ok |
| Copy | ✅ | Direto e claro | Ok |
| Visual/ilustração | ❌ | Ausente | Adicionar screenshot ou animação por passo |
| Linha conectora | ❌ | Sem elemento visual entre passos | Adicionar linha pontilhada conectora |

### PRICING

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Toggle mensal/anual | ✅ | Presente | Ok |
| Destaque "Mais Popular" | ✅ | Presente no Pro | Aumentar destaque visual |
| Comparativo com concorrentes | ✅ | Criativo e diferenciado | Manter |
| Tabela de features completa | ⚠️ | Lista simples | Adicionar checkmarks e ícones |
| Inconsistência de nomes | ❌ | FAQ = nomes diferentes do pricing | Alinhar nomenclatura URGENTE |
| Garantia explícita | ❌ | Ausente | Adicionar "7 dias de garantia" visível |

### TESTIMONIALS

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Quantidade | ✅ | ~10 depoimentos | Ok |
| Carrossel | ⚠️ | Sem controles visíveis | Adicionar dots, arrows e keyboard nav |
| Avatars | ⚠️ | Provavelmente placeholder | Usar sistema de initials avatar |
| Segmentação | ✅ | Tabs Personals/Alunos | Ok |
| Rating | ❌ | Sem estrelas visíveis | Adicionar 5/5 em cada depoimento |

### GAMIFICAÇÃO

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Ranking visual | ✅ | Diferencial único do produto | Destacar mais — virar seção principal |
| Badges de conquista | ✅ | Visual de conquistas presente | Adicionar tooltip ao hover |
| Dados dos rankings | ⚠️ | Parecem dados de demonstração | Conectar com dados reais ou adicionar disclaimer |
| Animações de entrada | ⚠️ | Básicas | Adicionar stagger animation nos cards |

### BLOG

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Quantidade de artigos | ❌ | Apenas 3 artigos | Criar mínimo de 10 artigos (ver `06-BLOG-ARTICLES.md`) |
| Imagens de capa | ⚠️ | Básicas | Cards maiores com imagem de destaque |
| Categorias/filtros | ❌ | Ausentes | Adicionar filtro por categoria |
| Tempo de leitura | ❌ | Ausente | Adicionar em cada card |
| SEO | ❌ | Meta descriptions provavelmente genéricas | Otimizar cada artigo |

### SOBRE / QUEM SOMOS

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Copy | ✅ | Forte, técnico, credível | Ok |
| Stack tecnológica | ✅ | Diferencial de credibilidade | Ok |
| Foto do fundador | ❌ | Ausente | Adicionar foto profissional |
| CNPJ visível | ✅ | Credibilidade jurídica | Manter |
| Missão/visão | ⚠️ | Implícita | Tornar mais explícita |

### FOOTER

| Item | Status | Problema | Recomendação |
|------|--------|----------|--------------|
| Email | ❌ | `contato@iapersonal.app.br` | Mudar para `contato@vfit.app` |
| Copyright | ✅ | "VFIT — VTS DEVELOPMENT" | Ok |
| Links sociais | ⚠️ | Instagram, X, LinkedIn | Adicionar YouTube |
| Badges de confiança | ⚠️ | CREF, SSL, LGPD presentes | Tornar mais visíveis (acima do copyright) |
| Newsletter | ❌ | Ausente | Adicionar campo de email no footer |

---

## 🏆 Score Detalhado

| Categoria | Nota | Justificativa |
|-----------|------|---------------|
| Copy/Messaging | 9/10 | Excelente, diferenciado, específico |
| Visual Design | 6/10 | Inconsistente — hero forte, seções genéricas |
| Branding | 5/10 | Nome/logo em transição, sem sistema |
| UX/Usabilidade | 7/10 | Boa estrutura, gaps em acessibilidade |
| Acessibilidade | 5/10 | Carrossel, contadores, labels, alt text |
| SEO On-page | 6/10 | Conteúdo bom, meta tags fracas |
| Performance | 6/10 | CLS, imagens sem dimensões, JS bloqueante |
| **GERAL** | **6.3/10** | Bom conteúdo, precisa de polish técnico |

---

## ✅ Quick Wins (implementar em < 1 dia)

1. Corrigir email no footer → `contato@vfit.app`
2. Alinhar nomes dos planos no FAQ
3. Adicionar `width`/`height` em todas as `<img>`
4. Animar contadores apenas no viewport (`IntersectionObserver`)
5. Adicionar `aria-label` no carrossel de testimonials
6. Atualizar meta title de todas as páginas para `VFIT | ...`

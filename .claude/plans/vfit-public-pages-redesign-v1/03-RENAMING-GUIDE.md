# 03 — Guia de Renomeação: "IA Personal" → VFIT

> Checklist completo de onde mudar o nome  
> VFIT | Abril 2026

---

## ⚠️ Por Que Isso É Urgente

Ter o produto se chamando "VFIT" mas o domínio sendo `iapersonal.app.br` e o email sendo `contato@iapersonal.app.br` gera:
- **Desconfiança** do visitante (marca frágil)
- **Confusão no Google** (dois nomes indexados)
- **Custo futuro maior** quanto mais tempo demorar a migrar

---

## 📂 CÓDIGO / CODEBASE

### Meta Tags (todas as páginas)

```html
<!-- ANTES -->
<title>IA Personal | Treinos com IA</title>
<meta name="description" content="IA Personal é a plataforma...">
<meta property="og:title" content="IA Personal">
<meta property="og:site_name" content="IA Personal">

<!-- DEPOIS -->
<title>VFIT | Treinos com IA — Seu App de Treinos</title>
<meta name="description" content="VFIT é o app de treinos com IA mais completo do Brasil. Planos personalizados, progresso real e comunidade. Comece grátis.">
<meta property="og:title" content="VFIT | Treinos com IA">
<meta property="og:site_name" content="VFIT">
<meta property="og:url" content="https://vfit.app">
```

### manifest.json

```json
{
  "name": "VFIT",
  "short_name": "VFIT",
  "description": "Plataforma #1 para Personal Trainers no Brasil",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#16a34a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/favicon.svg",  "sizes": "any",     "type": "image/svg+xml" }
  ]
}
```

### Checklist de Arquivos para Busca & Substituição

Execute no terminal do projeto:

```bash
# Buscar todas as ocorrências
grep -r "iapersonal" ./src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.html" --include="*.json"

grep -r "IA Personal" ./src --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.html"

# Substituir (macOS/Linux)
find ./src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  -exec sed -i '' 's/IA Personal/VFIT/g' {} +

find ./src -type f -name "*.html" \
  -exec sed -i '' 's/iapersonal/vfit/g' {} +
```

---

## 🌐 DOMÍNIO E INFRAESTRUTURA

| Tarefa | Status | Prioridade |
|--------|--------|------------|
| Registrar domínio `vfit.app` | ❓ | 🔴 Alta |
| Configurar DNS no Cloudflare para `vfit.app` | ❓ | 🔴 Alta |
| Redirect 301: `iapersonal.app.br` → `vfit.app` | ❓ | 🔴 Alta |
| Atualizar Cloudflare Pages — project URL | ❓ | 🔴 Alta |
| Atualizar variáveis de ambiente (`NEXT_PUBLIC_SITE_URL`) | ❓ | 🔴 Alta |
| Atualizar sitemap.xml com novo domínio | ❓ | 🟡 Média |
| Atualizar robots.txt | ❓ | 🟡 Média |
| Resubmeter sitemap no Google Search Console | ❓ | 🟡 Média |
| Atualizar canonical tags | ❓ | 🟡 Média |

### Redirect Cloudflare (Workers ou _redirects)

```
# Arquivo: /public/_redirects (Cloudflare Pages)
https://iapersonal.app.br/*   https://vfit.app/:splat   301
https://www.iapersonal.app.br/*  https://vfit.app/:splat  301
```

---

## 📧 COMUNICAÇÃO E EMAIL

| Onde | De | Para | Prioridade |
|------|-----|------|------------|
| Footer do site | `contato@iapersonal.app.br` | `contato@vfit.app` | 🔴 Alta |
| Emails transacionais (boas-vindas) | remetente antigo | `noreply@vfit.app` | 🔴 Alta |
| Emails de cobrança | remetente antigo | `financeiro@vfit.app` | 🔴 Alta |
| Assinatura de email da equipe | IA Personal | VFIT | 🟡 Média |
| PDFs de avaliação física | logo antiga | logo VFIT | 🟡 Média |
| Push notifications | "IA Personal" | "VFIT" | 🟡 Média |
| WhatsApp Business | nome antigo | VFIT | 🟡 Média |

### Aliases recomendados de email

```
contato@vfit.app      → principal
suporte@vfit.app      → atendimento
noreply@vfit.app      → emails automáticos
financeiro@vfit.app   → cobranças
```

---

## 📱 REDES SOCIAIS

| Rede | Handle Atual | Status | Ação |
|------|-------------|--------|------|
| Instagram | @vfit.app ou @iapersonal | ❓ | Confirmar handle VFIT |
| X (Twitter) | @vfit_app ou @iapersonal | ❓ | Confirmar handle VFIT |
| LinkedIn | /company/vfit | ❓ | Confirmar |
| YouTube | Sem canal | ❌ | Criar canal @vfit |
| Google My Business | IA Personal? | ❓ | Criar/atualizar como VFIT |
| TikTok | — | ❌ | Criar @vfit (opcional, nicho fitness) |

---

## 📄 CONTEÚDO DO SITE PÚBLICO

### Seções para revisar manualmente

| Seção | O que mudar |
|-------|-------------|
| FAQ Q1 | "O que é o **IA Personal**?" → "O que é o **VFIT**?" |
| FAQ Q2 | Nomes dos planos divergem do pricing — alinhar |
| Seção Pricing | Verificar se "IA Personal" aparece na comparação com concorrentes |
| Quem Somos | "A VFIT nasceu..." ✅ já correto em alguns lugares |
| Footer | `contato@iapersonal.app.br` → `contato@vfit.app` |
| Termos de Uso | Verificar menções ao nome antigo |
| Política de Privacidade | Verificar menções ao nome antigo |

### Textos de comparação com concorrentes

Se a seção de pricing cita "Diferente do MFIT e Mobitrainer", verificar se em algum lugar o VFIT se refere a si mesmo pelo nome antigo.

---

## 📲 DENTRO DO PRODUTO (App)

| Item | Ação |
|------|------|
| Logo na navbar do app | Substituir por logo VFIT SVG |
| Tela de splash/loading | Marca VFIT + fundo verde/preto |
| Push notifications | Remetente: "VFIT" |
| Nome do app no celular (PWA) | `short_name: "VFIT"` no manifest |
| PDF de avaliação física gerado | Cabeçalho com logo VFIT |
| Emails de treino enviados | Remetente VFIT |
| Plano Max — "Zero menção ao VFIT" | Checar se isso está ok no contexto white-label |

---

## ✅ Checklist Final de Renomeação

**Código**
- [ ] Todos os `<title>` atualizados
- [ ] Todas as `<meta>` OG tags atualizadas
- [ ] `manifest.json` atualizado
- [ ] Variáveis de ambiente com novo domínio
- [ ] Zero ocorrências de "iapersonal" no `/src`

**Infraestrutura**
- [ ] Domínio `vfit.app` registrado
- [ ] Redirect 301 configurado
- [ ] Cloudflare DNS apontando para `vfit.app`
- [ ] Google Search Console atualizado

**Conteúdo**
- [ ] FAQ alinhado
- [ ] Footer com novo email
- [ ] Termos de Uso e Privacidade revisados
- [ ] Nomes dos planos consistentes em todo o site

**Comunicação**
- [ ] Emails transacionais com novo remetente
- [ ] Redes sociais confirmadas em @vfit
- [ ] Canal YouTube criado

**Produto**
- [ ] Nova logo no app
- [ ] Push notifications com "VFIT"
- [ ] PDFs com cabeçalho VFIT

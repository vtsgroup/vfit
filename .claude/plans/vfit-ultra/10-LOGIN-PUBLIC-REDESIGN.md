# 10 — Redesign de Login + Páginas Públicas

> Pedido explícito do usuário: **redesign completo** de login e páginas públicas. Este doc é a spec de implementação (pronta para execução). Segue RULES §12-16 (Tailwind v4, Button, DSIcon) e o DS unificado (doc 07).

> **Status de execução:** spec completa aqui. Implementação visual deve ser feita com verificação visual (não às cegas em produção) — ver nota de risco no fim.

---

## 1. Por que redesenhar

Login e públicas são o **primeiro contato**. Hoje:
- Login já é funcional e "ultra-modern" no código, mas tem cores hardcoded (auth/oauth-buttons usa `bg-[#0d0d0f]`), tipografia inline duplicada, e densidade alta.
- Landing usa `uppercase` agressivo, hierarquia tipográfica difusa, e mistura de sistemas de card.
- Páginas legais/secundárias (`/termos`, `/sobre`, etc.) são funcionais mas sem consistência premium.

Meta: **primeira impressão de produto caro**, coerente, rápido, com a nova identidade de loading.

---

## 2. Princípios do redesign
1. **Uma identidade visual** — tokens do DS unificado (doc 07), zero hardcode.
2. **Hierarquia clara** — display (Syne/Inter 900) para títulos, DM Sans para corpo; escala definida.
3. **Menos é mais** (Rams) — cada elemento ganha seu pixel ou sai.
4. **Confiança** — selos (SSL, LGPD, "sem cartão"), prova social, CTAs claros.
5. **Velocidade percebida** — nova `BrandLoader`/Splash leve (doc 11), skeletons, transições suaves.

---

## 3. Login `(auth)` — redesign

### Layout
- **Split-screen** premium: à esquerda o form (já existe), à direita um painel de marca com o mark V animado + prova social ("+X personais", "Nota 4.9") — desktop; mobile mantém só o form.
- Background: gradiente da marca via token (não hardcode), com a aurora suave da nova identidade de loading.

### Form
- Manter TODA a lógica atual (passkey, OAuth, 2FA, Turnstile invisível, CPF/email auto-detect) — **não tocar no fluxo de auth**.
- Refinar a camada visual: campos com `vfit-flow-field` consistentes, espaçamento mobile padronizado (doc 07), ícones DSIcon, foco/estados acessíveis (aria).
- Substituir cores hardcoded em `components/auth/oauth-buttons.tsx` por tokens.
- CTA primário via `<Button>` (já é) com micro-interação de press.

### Telas irmãs (mesma identidade)
`/register`, `/register/personal`, `/register/student`, `/forgot-password`, `/reset-password`, `/verify-email` — aplicar o mesmo shell visual e tokens.

---

## 4. Páginas Públicas `(public)` — redesign

### Landing `/`
- **Hero:** título com hierarquia (sem all-caps), subtítulo claro, CTA "Comece grátis — 30 dias sem cartão" (alinhado ao novo trial, doc 02), mark V + visual moderno.
- **Seções:** features (bento grid), prova social, planos (alinhar com trial 30d), FAQ — todas com o sistema de Card único.
- **Performance:** imagens otimizadas (doc 12), lazy load, LCP < 2.5s.

### Pricing `/pricing`
- Reposicionar para o novo modelo: destaque do **trial 30d sem cartão**, planos pro/max claros, comparativo.

### Demais públicas
`/sobre` `/contato` `/blog` `/termos` `/privacidade` `/lgpd` `/cookies` `/excluir-conta` `/status` `/carreiras` `/afiliados` `/nutricionistas` `/app-personal-trainer`:
- Shell consistente (Navbar/Footer já existem), tipografia e espaçamento do DS, estados (vazio/erro) onde aplicável.
- Blog: cards de post consistentes, leitura confortável (medida ~70ch), SEO/GEO (skill `seo-geo`).

---

## 5. Tarefas (TRACKING S-REDESIGN)
- [ ] R.1 Tokens no login + telas irmãs (zero hardcode) — preserva lógica de auth
- [ ] R.2 Split-screen premium no login (desktop) + prova social
- [ ] R.3 oauth-buttons: hardcode → tokens
- [ ] R.4 Landing hero + seções (bento, prova social, planos, FAQ) com Card único
- [ ] R.5 Pricing alinhado ao trial 30d
- [ ] R.6 Demais públicas: shell + tipografia + estados consistentes
- [ ] R.7 Performance (LCP, imagens, lazy) — ver doc 12
- [ ] R.8 A11y (aria, foco, teclado) nas públicas e login

---

## 6. ⚠️ Nota de risco (importante)
O fluxo de **autenticação de produção** (passkey/OAuth/2FA/Turnstile) é crítico. O redesign deve mexer na **camada visual**, nunca na lógica de auth, e exige **verificação visual** (preview/QA) antes de produção. Por isso esta parte é spec aqui; a implementação deve ser feita e revisada visualmente (skills `/design-review`, `/frontend-design`, `/ui-ux-pro-max`), não deployada às cegas.

---

## 7. Critério de "perfeito"
- ✅ Login e públicas com identidade única, zero hardcode, tipografia/espaçamento consistentes.
- ✅ Trial 30d sem cartão em destaque no hero/pricing.
- ✅ Lógica de auth intacta; a11y auditada; LCP < 2.5s.
- ✅ Nova identidade de loading (doc 11) integrada.
